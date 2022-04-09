var Doc;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/docgen.ts":
/*!**************************!*\
  !*** ./src/ts/docgen.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const docobject_1 = __webpack_require__(/*! ./docobject */ "./src/ts/docobject.ts");
class DocGen {
    constructor(obj) {
        this.obj = obj;
        return new Proxy(this, {
            get: (target, prop) => {
                return this.Gen(prop);
            },
        });
    }
    Gen(prop) {
        return (inner = [], attrs) => {
            if (this.obj && prop in this.obj.binds) {
                const bound = this.obj.binds[prop](this.obj.values, attrs, docobject_1.DocObject.toNodeArray(inner), this.obj.values);
                return typeof bound === 'function' ? bound(this.obj.g) : bound;
            }
            let element = document.createElement(prop);
            for (let key in attrs) {
                if (key === 'style' && typeof attrs[key] === 'object') {
                    for (let skey in attrs[key]) {
                        element.style[skey] = attrs[key][skey];
                    }
                }
                else if (key in Object.getPrototypeOf(element)) {
                    element[key] = attrs[key];
                }
                else {
                    element.setAttribute(key, attrs[key]);
                }
            }
            docobject_1.DocObject.toNodeArray(inner).forEach(ine => {
                element.appendChild(ine);
            });
            return element;
        };
    }
}
exports["default"] = DocGen;


/***/ }),

/***/ "./src/ts/docobject.ts":
/*!*****************************!*\
  !*** ./src/ts/docobject.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocObject = exports.DocObjectElement = void 0;
const docgen_1 = __importDefault(__webpack_require__(/*! ./docgen */ "./src/ts/docgen.ts"));
const errors_1 = __importStar(__webpack_require__(/*! ./errors */ "./src/ts/errors.ts"));
// export interface DocObjectElement extends HTMLElement {
//     _DocObject? : DocObject
// }
class DocObjectElement extends HTMLElement {
    constructor() {
        super();
        if (!DocObject.isDobObjectElement(this)) {
            this._DocObject = new DocObject(this, {});
        }
    }
}
exports.DocObjectElement = DocObjectElement;
class DocObject {
    constructor(root, options) {
        this.querySelectorAll = (selector) => this.root.querySelectorAll(selector);
        //Add Default Parameters to options
        const { elements, values, render, binds, bindAttr, bindInAttr, isJQuery, connections, removeOnload } = DocObject.defaultParams(options);
        //Extract DOM element from HTMLElement Or Jquery Object
        let rootElement = DocObject.toNodeArray(root)[0];
        //Set Root Object
        if (rootElement instanceof HTMLElement) {
            this.root = rootElement;
        }
        else {
            (0, errors_1.default)(errors_1.ROOT_ERROR, true);
        }
        this._connections = connections;
        //Set Jquery
        if (isJQuery && window.jQuery) {
            //If Jquery is detected and is set to jquery mode...
            this._isJQuery = true;
            //Set Query Select statement to use jQuery
            this._querySelect = (...props) => $(this.root).find(...props);
        }
        else {
            //If Jquery is not detected...
            if (isJQuery) {
                //If set to jquery mode...
                (0, errors_1.default)(errors_1.JQUERY_NOT_DETECTED, false);
            }
            //Set Query Select statement to use HTMLElement.querySelectorAll
            this._isJQuery = false;
            this._querySelect = (...props) => this.root.querySelectorAll(...props);
        }
        //Set Root Object to this
        this.root._DocObject = this;
        //Add query-able attribute to root element
        this.root.setAttribute('doc-object', '');
        //Set Render Functions
        this.render = render;
        //Create Related DocGen
        this.g = new docgen_1.default(this);
        //Set Bind Functions
        this.binds = (typeof binds === 'function') ? binds(this.g) : binds;
        //Set Bind Attribute
        this.bindAttr = bindAttr;
        //Set Bind In Attribute
        this.bindInAttr = bindInAttr;
        //Set Query Proxy
        this.query = new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop == 'string')
                    return target[prop] ? target[prop] : _ => this._querySelect(/.*(\.|\#|\[|\]).*/gm.exec(prop) ? prop : '#' + prop);
            },
            set: (target, prop, value, receiver) => {
                if (typeof value === 'string')
                    value = () => this._querySelect(value);
                if (typeof prop === 'string') {
                    target[prop] = _ => value;
                }
                return true;
            }
        });
        //Set Elements Proxy
        this.elements = new Proxy(this.query, {
            get: (target, prop) => {
                return target[prop]();
            }
        });
        //Add in elements from options
        if (elements) {
            Object.entries(elements).forEach((e => { this.query[e[0]] = e[1]; }));
        }
        this._values = new Proxy(!values || typeof values !== 'object' ? {} : values, {
            set: (target, prop, value, receiver) => {
                target[prop] = value;
                this.runRender({ [prop]: value });
                this.runConnections({ [prop]: value });
                return true;
            }
        });
        this.onLoad = () => {
            this.runRender(this.values);
            this.runConnections(this.values);
        };
        if (!removeOnload) {
            if (this._isJQuery) {
                $(this.onLoad);
            }
            else {
                window.onload = this.onLoad;
            }
        }
    }
    static toNodeArray(any) {
        if (typeof any === 'string' || typeof any === 'number') {
            return [...DocObject.parser.parseFromString(any.toString(), 'text/html').body.childNodes];
        }
        else if (NodeList.prototype.isPrototypeOf(any) || (window.jQuery && any instanceof jQuery)) {
            return [...any];
        }
        else if (Array.isArray(any)) {
            return any
                .filter(e => (typeof e === 'string') || e instanceof Node)
                .map(e => (typeof e === 'string') ? DocObject.toNodeArray(e)[0] : e);
        }
        else if (any instanceof Node || any instanceof Document) {
            return [any];
        }
        else {
            return [];
        }
    }
    static defaultParams({ render = [], binds = {}, elements = {}, values = {}, bindAttr = 'd-bind', bindInAttr = 'd-bind-in', isJQuery = false, connections = [], removeOnload = false } = {}) {
        return { elements, values, render, binds, bindAttr, bindInAttr, isJQuery, connections, removeOnload };
    }
    defaultRunBindOptions({ root, valueChanges, additionalHosts = [] }) {
        return { root, valueChanges, additionalHosts };
    }
    set values(values) {
        throw Error("Tried to set DocObject.value. Try creating a inner object instead.");
    }
    get values() {
        return this._values;
    }
    isBindIn(element) {
        return (element.getAttribute(this.bindInAttr) && true);
    }
    isBind(element) {
        return (element.localName === 'd-bind' || element.getAttribute(this.bindAttr)) && true;
    }
    static isDobObjectElement(element) {
        return (element._DocObject instanceof DocObject);
    }
    findOrRegisterBind(DOMelement) {
        if (DOMelement._DocObjectConfig === undefined) {
            let originalChildren = [...DOMelement.childNodes];
            originalChildren.toString = () => DOMelement.innerHTML;
            DOMelement._DocObjectConfig = {
                originalChildren,
                originalChildrenHTML: DOMelement.innerHTML,
                originalAttributes: [...DOMelement.attributes].reduce((a, c) => { return Object.assign(Object.assign({}, a), { [c.name]: c.value }); }, {})
            };
        }
        return DOMelement._DocObjectConfig;
    }
    generateBind(element, bind, bound) {
        const config = element._DocObjectConfig;
        const nodeArray = DocObject.toNodeArray(typeof bound === 'function' ? bound(this.g) : bound);
        if (this.isBind(element)) {
            const firstElement = nodeArray.find(el => el instanceof HTMLElement);
            firstElement._DocObjectConfig = config;
            firstElement.setAttribute((firstElement.localName === 'd-bind' ? 'to' : this.bindAttr), bind);
            Object.entries(config.originalAttributes).filter(attA => !(['d-bind-in', 'to'].includes(attA[0]))).forEach(attA => firstElement.setAttribute(attA[0], attA[1]));
            return firstElement;
        }
        else {
            return nodeArray;
        }
    }
    runRender(valueChanges = {}) {
        this.render.filter(ren => (ren.dep && Array.isArray(ren.dep) && ren.dep.some((depp) => (depp in valueChanges))) || (ren.dep === undefined)).forEach(ren => {
            if (ren.clean)
                ren.clean(Object.assign(Object.assign({}, this.values), valueChanges), this.values);
            ren.action(Object.assign(Object.assign({}, this.values), valueChanges), this.values);
        });
        this.runBinds({ root: this.root, valueChanges, additionalHosts: [this.root] });
    }
    getBindAction(element, valueChanges) {
        if (this.isBind(element)) {
            if (element.getAttribute(this.bindAttr)) {
                return [element.getAttribute(this.bindAttr), (replace) => element.parentNode.replaceChild(replace, element)];
            }
            else if (element.localName === 'd-bind') {
                return [element.getAttribute('to'), (replace) => element.parentNode.replaceChild(replace, element)];
            }
        }
        else if (this.isBindIn(element)) {
            return [element.getAttribute(this.bindInAttr), (replace) => {
                    element.innerHTML = '';
                    for (let node of replace)
                        element.appendChild(node);
                }];
        }
        else if (DocObject.isDobObjectElement(element)) {
            if (element === this.root) {
                return ['this', (replace) => {
                        element.innerHTML = '';
                        for (let node of replace)
                            element.appendChild(node);
                    }];
            }
            else {
                element._DocObject.runRender(valueChanges);
                return null;
            }
        }
    }
    runBinds(params) {
        const { root, valueChanges, additionalHosts } = this.defaultRunBindOptions(params);
        (Array.isArray(root) ? root : [root])
            .filter(rt => rt && rt instanceof HTMLElement)
            .forEach((rt) => {
            [...(rt.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}], d-bind[to], [doc-object]`)), ...additionalHosts]
                .forEach(element => {
                const bindInstructions = this.getBindAction(element, valueChanges);
                if (bindInstructions) {
                    //Get The Bind Method, and the Function to insert HTML 
                    const [bind, bindAction] = bindInstructions;
                    //Check if Bind Exists 
                    if (bind in this.binds) {
                        //Get Or register Bind Tag's Config
                        const config = this.findOrRegisterBind(element);
                        //Insert HTML
                        bindAction(this.runBinds({
                            root: this.generateBind(//Wrap Bind Method to prepare bind for document
                            element, bind, 
                            //Run Bind Method
                            this.binds[bind](this.values, //Pass in updates values
                            config.originalAttributes, //Pass in original attributes
                            config.originalChildren, //Pass in original children
                            valueChanges)),
                            valueChanges
                        }));
                    }
                }
            });
        });
        return root;
    }
    runConnections(valueChanges = { [true]: true }) {
        for (let ky in valueChanges) {
            this._connections.forEach((connected) => connected.values[ky] = valueChanges[ky]);
        }
    }
    connect(...docObjects) {
        this._connections = [...this._connections, ...docObjects];
        this.runConnections(this.values);
        return this;
    }
}
exports.DocObject = DocObject;
DocObject.parser = new DOMParser();
/*
var doc = new DocObject({
    values: {
    },
    elements:{

    },
    binds:{

    },
    render: [

    ]
}); $(doc.onLoad)
*/ 


/***/ }),

/***/ "./src/ts/errors.ts":
/*!**************************!*\
  !*** ./src/ts/errors.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JQUERY_NOT_DETECTED = exports.ROOT_ERROR = void 0;
exports.ROOT_ERROR = 'ROOT_ERROR';
exports.JQUERY_NOT_DETECTED = 'JQUERY_NOT_DETECTED';
function runError(error, fail = false) {
    if (error in ERRORS) {
        if (fail) {
            throw Error('DocObject: ' + ERRORS[error].message);
        }
        else {
            console.error(ERRORS[error].message);
        }
    }
}
exports["default"] = runError;
const ERRORS = {
    ROOT_ERROR: {
        message: "Root Element Must be a valid Node, Or jQuery Element"
    },
    JQUERY_NOT_DETECTED: {
        message: "JQuery is not detected. Please load JQuery before DocObject"
    }
};


/***/ }),

/***/ "./src/ts/index.ts":
/*!*************************!*\
  !*** ./src/ts/index.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gen = exports.obj = exports.fixInput = void 0;
const docobject_1 = __webpack_require__(/*! ./docobject */ "./src/ts/docobject.ts");
const docgen_1 = __importDefault(__webpack_require__(/*! ./docgen */ "./src/ts/docgen.ts"));
const utils_1 = __webpack_require__(/*! ./utils */ "./src/ts/utils.ts");
class Bind extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        const div = document.createElement("div");
        div.style.display = 'none';
        this.shadowRoot.append(div);
    }
}
/******* UTILITY METHODS *******/
function fixInput(selector, action) {
    let pos = (0, utils_1.getCursorPos)(selector()[0]);
    action();
    (0, utils_1.setCursorPos)(selector()[0], pos);
}
exports.fixInput = fixInput;
window.customElements.define('d-bind', Bind);
window.customElements.define('doc-object', docobject_1.DocObjectElement);
if (window.jQuery) {
    (function ($) {
        $.fn.extend({
            DocObject: function (options = null) {
                if (this[0]._DocObject && !options)
                    return this[0]._DocObject;
                this.each(function () {
                    new docobject_1.DocObject(this, options);
                });
                new docobject_1.DocObject(this, Object.assign({ isJQuery: true }, options));
                return this[0]._DocObject;
            }
        });
    })(jQuery);
}
function obj(root, options) {
    return new docobject_1.DocObject(root, options);
}
exports.obj = obj;
function gen() {
    return new docgen_1.default();
}
exports.gen = gen;


/***/ }),

/***/ "./src/ts/utils.ts":
/*!*************************!*\
  !*** ./src/ts/utils.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setCursorPos = exports.getCursorPos = void 0;
// Credits: https://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
function getCursorPos(element) {
    // if (document.selection) {
    //     element.focus();
    //     return  document.selection.createRange().moveStart('character', -element.value.length);
    // }
    return element.selectionDirection == 'backward' ? element.selectionStart : element.selectionEnd;
}
exports.getCursorPos = getCursorPos;
// Credits: http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
function setCursorPos(element, pos) {
    // Modern browsers
    if (element.setSelectionRange) {
        element.focus();
        element.setSelectionRange(pos, pos);
        // IE8 and below
    }
    else if (element.createTextRange) {
        var range = element.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}
exports.setCursorPos = setCursorPos;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/ts/index.ts");
/******/ 	Doc = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEVBQUU7UUFDM0MsSUFBSSxLQUFLLEdBQUksT0FBZSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQy9DLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQWRELG9DQWNDOzs7Ozs7O1VDOUJEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jZ2VuLnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9kb2NvYmplY3QudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2Vycm9ycy50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL3V0aWxzLnRzIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEb2NPYmplY3QsIERvY09iamVjdEhUTUxMaWtlfSBmcm9tICcuL2RvY29iamVjdCdcclxuaW1wb3J0IHsgRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSB9IGZyb20gJy4vZG9jYmluZCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY0dlbiB7XHJcbiAgICBcclxuICAgIG9iaiA/IDogRG9jT2JqZWN0IFxyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihvYmo/IDogRG9jT2JqZWN0KXtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9iaiA9IG9ialxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcclxuICAgICAgICAgICAgZ2V0Oih0YXJnZXQsIHByb3AgKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHJldHVybiB0aGlzLkdlbihwcm9wIGFzIHN0cmluZylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgR2VuKHByb3AgOiBzdHJpbmcpe1xyXG4gICAgICAgIHJldHVybiAoaW5uZXIgOiBEb2NPYmplY3RIVE1MTGlrZSB8IEFycmF5PHN0cmluZ3xOb2RlPiA9IFtdICwgYXR0cnMgOiBEb2NPYmplY3RCaW5kQXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMub2JqICYmIHByb3AgaW4gdGhpcy5vYmouYmluZHMpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm91bmQgPSB0aGlzLm9iai5iaW5kc1twcm9wXSh0aGlzLm9iai52YWx1ZXMsIGF0dHJzLCBEb2NPYmplY3QudG9Ob2RlQXJyYXkoaW5uZXIpLCB0aGlzLm9iai52YWx1ZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGJvdW5kID09PSAnZnVuY3Rpb24nID8gYm91bmQodGhpcy5vYmouZykgOiBib3VuZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQocHJvcClcclxuICAgICAgICAgICAgZm9yKGxldCBrZXkgaW4gYXR0cnMpe1xyXG4gICAgICAgICAgICAgICAgaWYoa2V5ID09PSAnc3R5bGUnICYmIHR5cGVvZiBhdHRyc1trZXldID09PSAnb2JqZWN0JyApe1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgc2tleSBpbiBhdHRyc1trZXkgYXMgc3RyaW5nXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbc2tleV0gPSBhdHRyc1trZXldW3NrZXldXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKGtleSBpbiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRba2V5XSA9IGF0dHJzW2tleV1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBEb2NPYmplY3QudG9Ob2RlQXJyYXkoaW5uZXIpLmZvckVhY2goaW5lID0+IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5lKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBEb2NPYmplY3REb21CaW5kLCBEb2NPYmplY3RCaW5kLCBEb2NPYmplY3RCaW5kR2VuIH0gZnJvbSAnLi9kb2NiaW5kJ1xyXG5pbXBvcnQgeyBEb2NPYmplY3RSZW5kZXIgfSBmcm9tICcuL2RvY3JlbmRlcidcclxuaW1wb3J0ICBEb2NHZW4gIGZyb20gJy4vZG9jZ2VuJ1xyXG5pbXBvcnQgcnVuRXJyb3IsIHsgXHJcbiAgICBST09UX0VSUk9SLFxyXG4gICAgSlFVRVJZX05PVF9ERVRFQ1RFRFxyXG59IGZyb20gJy4vZXJyb3JzJztcclxuXHJcbi8qKioqKioqIEdMT0JBTFMgKioqKioqKi9cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICAgICAgalF1ZXJ5OmFueTtcclxuICAgICAgICBtc0NyeXB0bzphbnk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4vKioqKioqKiBET0MgT0JKRUNUICoqKioqKiovXHJcbmV4cG9ydCB0eXBlIERvY09iamVjdEhUTUxMaWtlID0gXHJcbnwgTm9kZVxyXG58IE5vZGVMaXN0XHJcbnwgSlF1ZXJ5IFxyXG58IE51bWJlclxyXG58IHN0cmluZ1xyXG58ICgoZ2VuOiBEb2NHZW4pID0+IERvY09iamVjdEhUTUxMaWtlKTtcclxuXHJcblxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdE9wdGlvbnMge1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kIHwgRG9jT2JqZWN0QmluZEdlbjtcclxuICAgIGVsZW1lbnRzIDoge1trZXk6c3RyaW5nXTogc3RyaW5nfTtcclxuICAgIHZhbHVlcyA6IG9iamVjdDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIGlzSlF1ZXJ5IDogYm9vbGVhbjtcclxuICAgIGNvbm5lY3Rpb25zIDogQXJyYXk8RG9jT2JqZWN0PlxyXG4gICAgcmVtb3ZlT25sb2FkIDogYm9vbGVhblxyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jT2JqZWN0UnVuQmluZE9wdGlvbnMge1xyXG4gICAgcm9vdCA6IGFueTtcclxuICAgIHZhbHVlQ2hhbmdlczogb2JqZWN0O1xyXG4gICAgYWRkaXRpb25hbEhvc3RzPyA6IEFycmF5PEhUTUxFbGVtZW50PlxyXG59XHJcblxyXG4vLyBleHBvcnQgaW50ZXJmYWNlIERvY09iamVjdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbi8vICAgICBfRG9jT2JqZWN0PyA6IERvY09iamVjdFxyXG4vLyB9XHJcblxyXG5leHBvcnQgY2xhc3MgRG9jT2JqZWN0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIF9Eb2NPYmplY3Q/IDogRG9jT2JqZWN0XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgaWYoIURvY09iamVjdC5pc0RvYk9iamVjdEVsZW1lbnQodGhpcykpe1xyXG4gICAgICAgICAgICB0aGlzLl9Eb2NPYmplY3QgPSBuZXcgRG9jT2JqZWN0KHRoaXMsIHt9KVxyXG4gICAgICAgIH0gXHJcbiAgICB9XHJcbn1cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RFbGVtZW50cyB7XHJcbiAgICBba2V5OiBzdHJpbmddIDogc3RyaW5nIHwgKChzZWxlY3RvciA6IHN0cmluZyApID0+IE5vZGVMaXN0fEpRdWVyeSlcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEb2NPYmplY3RDb25maWcge1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbjogQXJyYXk8Tm9kZT47XHJcbiAgICBvcmlnaW5hbENoaWxkcmVuSFRNTDogc3RyaW5nO1xyXG4gICAgb3JpZ2luYWxBdHRyaWJ1dGVzOiB7W2tleTpzdHJpbmddIDogc3RyaW5nfTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEb2NPYmplY3Qge1xyXG5cclxuICAgIHN0YXRpYyBwYXJzZXIgOiBET01QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKClcclxuXHJcbiAgICBzdGF0aWMgdG9Ob2RlQXJyYXkoYW55IDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gKSA6IEFycmF5PE5vZGU+IHtcclxuICAgICAgICBpZih0eXBlb2YgYW55ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYW55ID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgIHJldHVybiBbLi4uRG9jT2JqZWN0LnBhcnNlci5wYXJzZUZyb21TdHJpbmcoYW55LnRvU3RyaW5nKCksICd0ZXh0L2h0bWwnKS5ib2R5LmNoaWxkTm9kZXNdXHJcbiAgICAgICAgfWVsc2UgaWYoTm9kZUxpc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYW55KSB8fCAod2luZG93LmpRdWVyeSAmJiBhbnkgaW5zdGFuY2VvZiBqUXVlcnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFsgLi4uKGFueSBhcyBOb2RlTGlzdCldXHJcbiAgICAgICAgfWVsc2UgaWYoQXJyYXkuaXNBcnJheShhbnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIGFueVxyXG4gICAgICAgICAgICAuZmlsdGVyKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSB8fCBlIGluc3RhbmNlb2YgTm9kZSApXHJcbiAgICAgICAgICAgIC5tYXAoZT0+ICh0eXBlb2YgZSA9PT0gJ3N0cmluZycpID8gRG9jT2JqZWN0LnRvTm9kZUFycmF5KGUpWzBdIDogZSApO1xyXG4gICAgICAgIH0gZWxzZSBpZihhbnkgaW5zdGFuY2VvZiBOb2RlIHx8IGFueSBpbnN0YW5jZW9mIERvY3VtZW50ICl7XHJcbiAgICAgICAgICAgIHJldHVybiBbYW55XVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gW11cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGRlZmF1bHRQYXJhbXMoe1xyXG4gICAgICAgIHJlbmRlciA9IFtdLFxyXG4gICAgICAgIGJpbmRzID0ge30sXHJcbiAgICAgICAgZWxlbWVudHMgPSB7fSxcclxuICAgICAgICB2YWx1ZXMgPSB7fSxcclxuICAgICAgICBiaW5kQXR0ciA9ICdkLWJpbmQnLFxyXG4gICAgICAgIGJpbmRJbkF0dHIgPSAnZC1iaW5kLWluJyxcclxuICAgICAgICBpc0pRdWVyeSA9IGZhbHNlLFxyXG4gICAgICAgIGNvbm5lY3Rpb25zID0gW10sXHJcbiAgICAgICAgcmVtb3ZlT25sb2FkID0gZmFsc2VcclxuICAgIH0gPSB7fSkgOiBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4gIHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRlZmF1bHRSdW5CaW5kT3B0aW9ucyh7XHJcbiAgICAgICAgcm9vdCxcclxuICAgICAgICB2YWx1ZUNoYW5nZXMsXHJcbiAgICAgICAgYWRkaXRpb25hbEhvc3RzID0gW11cclxuICAgIH0gOiBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucyApIDogRG9jT2JqZWN0UnVuQmluZE9wdGlvbnMge1xyXG4gICAgICAgIHJldHVybiB7cm9vdCwgdmFsdWVDaGFuZ2VzLCBhZGRpdGlvbmFsSG9zdHN9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgcmVhZG9ubHkgX3ZhbHVlcyA6IG9iamVjdDtcclxuICAgIGVsZW1lbnRzIDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIHJvb3QgOiBEb2NPYmplY3RFbGVtZW50O1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kO1xyXG4gICAgYmluZEF0dHIgOiBzdHJpbmc7XHJcbiAgICBiaW5kSW5BdHRyIDogc3RyaW5nO1xyXG4gICAgcXVlcnkgOiBQcm94eUhhbmRsZXI8RG9jT2JqZWN0RWxlbWVudHM+O1xyXG4gICAgX3F1ZXJ5U2VsZWN0IDogKHNlbGVjdG9yOnN0cmluZyk9PiBOb2RlTGlzdCB8IEpRdWVyeTtcclxuICAgIF9pc0pRdWVyeSA6IGJvb2xlYW5cclxuICAgIF9jb25uZWN0aW9ucyA6IEFycmF5PERvY09iamVjdD5cclxuICAgIGcgOiBEb2NHZW5cclxuICAgIG9uTG9hZDogKCk9PnZvaWRcclxuXHJcbiAgICBzZXQgdmFsdWVzKHZhbHVlcykge1xyXG4gICAgICAgIHRocm93IEVycm9yKFwiVHJpZWQgdG8gc2V0IERvY09iamVjdC52YWx1ZS4gVHJ5IGNyZWF0aW5nIGEgaW5uZXIgb2JqZWN0IGluc3RlYWQuXCIpXHJcbiAgICB9XHJcbiAgICBnZXQgdmFsdWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnMgOiBvYmplY3QpIHtcclxuICAgICAgICAvL0FkZCBEZWZhdWx0IFBhcmFtZXRlcnMgdG8gb3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gOiBEb2NPYmplY3RPcHRpb25zID0gRG9jT2JqZWN0LmRlZmF1bHRQYXJhbXMob3B0aW9ucylcclxuICAgICAgICBcclxuICAgICAgICAvL0V4dHJhY3QgRE9NIGVsZW1lbnQgZnJvbSBIVE1MRWxlbWVudCBPciBKcXVlcnkgT2JqZWN0XHJcbiAgICAgICAgbGV0IHJvb3RFbGVtZW50ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KHJvb3QpWzBdXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUm9vdCBPYmplY3RcclxuICAgICAgICBpZihyb290RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHJvb3RFbGVtZW50XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJ1bkVycm9yKFJPT1RfRVJST1IsIHRydWUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IGNvbm5lY3Rpb25zO1xyXG5cclxuICAgICAgICAvL1NldCBKcXVlcnlcclxuICAgICAgICBpZihpc0pRdWVyeSAmJiB3aW5kb3cualF1ZXJ5KXtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgZGV0ZWN0ZWQgYW5kIGlzIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBqUXVlcnlcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnlTZWxlY3QgPSAoLi4ucHJvcHMpID0+ICQodGhpcy5yb290KS5maW5kKC4uLnByb3BzKVxyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgbm90IGRldGVjdGVkLi4uXHJcbiAgICAgICAgICAgIGlmKGlzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgIC8vSWYgc2V0IHRvIGpxdWVyeSBtb2RlLi4uXHJcbiAgICAgICAgICAgICAgICBydW5FcnJvcihKUVVFUllfTk9UX0RFVEVDVEVELCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBIVE1MRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsXHJcbiAgICAgICAgICAgIHRoaXMuX2lzSlF1ZXJ5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiB0aGlzLnJvb3QucXVlcnlTZWxlY3RvckFsbCguLi5wcm9wcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0IHRvIHRoaXNcclxuICAgICAgICB0aGlzLnJvb3QuX0RvY09iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vQWRkIHF1ZXJ5LWFibGUgYXR0cmlidXRlIHRvIHJvb3QgZWxlbWVudFxyXG4gICAgICAgIHRoaXMucm9vdC5zZXRBdHRyaWJ1dGUoJ2RvYy1vYmplY3QnLCAnJylcclxuXHJcbiAgICAgICAgLy9TZXQgUmVuZGVyIEZ1bmN0aW9uc1xyXG4gICAgICAgIHRoaXMucmVuZGVyID0gcmVuZGVyO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSBSZWxhdGVkIERvY0dlblxyXG4gICAgICAgIHRoaXMuZyA9IG5ldyBEb2NHZW4odGhpcylcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLmJpbmRzID0gKHR5cGVvZiBiaW5kcyA9PT0gJ2Z1bmN0aW9uJykgPyBiaW5kcyh0aGlzLmcpIDogYmluZHMgO1xyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEF0dHJpYnV0ZVxyXG4gICAgICAgIHRoaXMuYmluZEF0dHIgPSBiaW5kQXR0cjtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBJbiBBdHRyaWJ1dGVcclxuICAgICAgICB0aGlzLmJpbmRJbkF0dHIgPSBiaW5kSW5BdHRyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IFF1ZXJ5IFByb3h5XHJcbiAgICAgICAgdGhpcy5xdWVyeSA9IG5ldyBQcm94eSh7fSwge1xyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3AgKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgcHJvcCA9PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIHRhcmdldFtwcm9wXSA/IHRhcmdldFtwcm9wXSA6IF8gPT4gdGhpcy5fcXVlcnlTZWxlY3QoIC8uKihcXC58XFwjfFxcW3xcXF0pLiovZ20uZXhlYyhwcm9wKSA/IHByb3AgOiAnIycgKyBwcm9wICkgXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogKHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgdmFsdWUgPSAoKSA9PiB0aGlzLl9xdWVyeVNlbGVjdCh2YWx1ZSlcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IF8gPT4gdmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vU2V0IEVsZW1lbnRzIFByb3h5XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IG5ldyBQcm94eSh0aGlzLnF1ZXJ5LCB7XHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL0FkZCBpbiBlbGVtZW50cyBmcm9tIG9wdGlvbnNcclxuICAgICAgICBpZiAoZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZWxlbWVudHMpLmZvckVhY2goKGUgPT4geyB0aGlzLnF1ZXJ5W2VbMF1dID0gZVsxXSB9KSlcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLl92YWx1ZXMgPSBuZXcgUHJveHkoIXZhbHVlcyB8fCB0eXBlb2YgdmFsdWVzICE9PSAnb2JqZWN0JyA/IHt9IDogdmFsdWVzLCB7XHJcbiAgICAgICAgICAgIHNldDogKHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsgW3Byb3BdOiB2YWx1ZSB9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh7W3Byb3BdOnZhbHVlfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICBcclxuICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMub25Mb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ1blJlbmRlcih0aGlzLnZhbHVlcylcclxuICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh0aGlzLnZhbHVlcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFyZW1vdmVPbmxvYWQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLl9pc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMub25Mb2FkKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5vbmxvYWQgPSB0aGlzLm9uTG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNCaW5kSW4oZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSAmJiB0cnVlICkgXHJcbiAgICB9XHJcbiAgICBpc0JpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpICYmIHRydWVcclxuICAgIH1cclxuICAgIHN0YXRpYyBpc0RvYk9iamVjdEVsZW1lbnQoZWxlbWVudCA6IERvY09iamVjdEVsZW1lbnQgKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoIGVsZW1lbnQuX0RvY09iamVjdCBpbnN0YW5jZW9mIERvY09iamVjdCAgKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmaW5kT3JSZWdpc3RlckJpbmQoRE9NZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgICAgICBpZihET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGxldCBvcmlnaW5hbENoaWxkcmVuID0gWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc11cclxuICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbi50b1N0cmluZyA9ICgpPT4gRE9NZWxlbWVudC5pbm5lckhUTUxcclxuICAgICAgICAgICAgRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbixcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW5IVE1MOiBET01lbGVtZW50LmlubmVySFRNTCxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQXR0cmlidXRlczogWy4uLkRPTWVsZW1lbnQuYXR0cmlidXRlc10ucmVkdWNlKCAoYSxjKT0+e3JldHVybiB7Li4uYSwgW2MubmFtZV06Yy52YWx1ZX0gfSwge30gKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWdcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUJpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQsIGJpbmQsIGJvdW5kIDogRG9jT2JqZWN0SFRNTExpa2UpIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheSh0eXBlb2YgYm91bmQgPT09ICdmdW5jdGlvbicgPyBib3VuZCh0aGlzLmcpIDogYm91bmQpO1xyXG4gICAgICAgIGlmKHRoaXMuaXNCaW5kKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gbm9kZUFycmF5LmZpbmQoZWwgPT4gZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgYXMgRG9jT2JqZWN0RG9tQmluZDtcclxuICAgICAgICAgICAgZmlyc3RFbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoKGZpcnN0RWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnID8gJ3RvJyA6IHRoaXMuYmluZEF0dHIpLCBiaW5kKVxyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzKS5maWx0ZXIoYXR0QT0+IShbJ2QtYmluZC1pbicsICd0byddLmluY2x1ZGVzKGF0dEFbMF0pKSkuZm9yRWFjaChhdHRBPT5maXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dEFbMF0sIGF0dEFbMV0pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RFbGVtZW50O1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZUFycmF5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICBydW5SZW5kZXIodmFsdWVDaGFuZ2VzID0ge30pIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIuZmlsdGVyKHJlbiA9PiAocmVuLmRlcCAmJiBBcnJheS5pc0FycmF5KHJlbi5kZXApICYmIHJlbi5kZXAuc29tZSgoZGVwcCkgPT4gKGRlcHAgaW4gdmFsdWVDaGFuZ2VzKSkpIHx8IChyZW4uZGVwID09PSB1bmRlZmluZWQpKS5mb3JFYWNoKHJlbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZW4uY2xlYW4pIHJlbi5jbGVhbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgICAgIHJlbi5hY3Rpb24oeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIHRoaXMudmFsdWVzKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5ydW5CaW5kcyh7cm9vdDp0aGlzLnJvb3QsIHZhbHVlQ2hhbmdlcywgYWRkaXRpb25hbEhvc3RzOlt0aGlzLnJvb3RdfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QmluZEFjdGlvbihlbGVtZW50IDogSFRNTEVsZW1lbnQsIHZhbHVlQ2hhbmdlczogb2JqZWN0KSA6IFtzdHJpbmcsIChyZXBsYWNlIDogTm9kZSAmIE5vZGVMaXN0ICk9PiB2b2lkIF0gfCBudWxsIHtcclxuICAgICAgICBpZih0aGlzLmlzQmluZChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGlmKGVsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0ciksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfWVsc2UgaWYoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RvJyksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9ZWxzZSBpZih0aGlzLmlzQmluZEluKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRJbkF0dHIpLCAocmVwbGFjZSk9PntcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHJlcGxhY2UpIGVsZW1lbnQuYXBwZW5kQ2hpbGQobm9kZSk7XHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfWVsc2UgaWYoRG9jT2JqZWN0LmlzRG9iT2JqZWN0RWxlbWVudChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGlmKGVsZW1lbnQgPT09IHRoaXMucm9vdCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyd0aGlzJywgICAocmVwbGFjZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQgYXMgRG9jT2JqZWN0RWxlbWVudCkuX0RvY09iamVjdC5ydW5SZW5kZXIodmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwgPSAoc2VsZWN0b3IgOiBzdHJpbmcpID0+IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxyXG4gICAgcnVuQmluZHMocGFyYW1zOiBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHsgcm9vdCwgdmFsdWVDaGFuZ2VzLCBhZGRpdGlvbmFsSG9zdHMgfSA9IHRoaXMuZGVmYXVsdFJ1bkJpbmRPcHRpb25zKHBhcmFtcyk7XHJcbiAgICAgICAgKEFycmF5LmlzQXJyYXkocm9vdCkgPyByb290IDogW3Jvb3RdKVxyXG4gICAgICAgICAgICAuZmlsdGVyKHJ0ID0+IHJ0ICYmIHJ0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgWy4uLihydC5xdWVyeVNlbGVjdG9yQWxsKGBbJHt0aGlzLmJpbmRBdHRyfV0sIFske3RoaXMuYmluZEluQXR0cn1dLCBkLWJpbmRbdG9dLCBbZG9jLW9iamVjdF1gKSksIC4uLmFkZGl0aW9uYWxIb3N0c11cclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJpbmRJbnN0cnVjdGlvbnMgPSB0aGlzLmdldEJpbmRBY3Rpb24oZWxlbWVudCwgdmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZEluc3RydWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgVGhlIEJpbmQgTWV0aG9kLCBhbmQgdGhlIEZ1bmN0aW9uIHRvIGluc2VydCBIVE1MIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW2JpbmQsIGJpbmRBY3Rpb25dID0gYmluZEluc3RydWN0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgQmluZCBFeGlzdHMgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZCBpbiB0aGlzLmJpbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgT3IgcmVnaXN0ZXIgQmluZCBUYWcncyBDb25maWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmZpbmRPclJlZ2lzdGVyQmluZChlbGVtZW50KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0luc2VydCBIVE1MXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZEFjdGlvbih0aGlzLnJ1bkJpbmRzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogdGhpcy5nZW5lcmF0ZUJpbmQoICAvL1dyYXAgQmluZCBNZXRob2QgdG8gcHJlcGFyZSBiaW5kIGZvciBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1J1biBCaW5kIE1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kc1tiaW5kXShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlcywgLy9QYXNzIGluIHVwZGF0ZXMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm9yaWdpbmFsQXR0cmlidXRlcywgLy9QYXNzIGluIG9yaWdpbmFsIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxDaGlsZHJlbiwgLy9QYXNzIGluIG9yaWdpbmFsIGNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQ2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIHJvb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuQ29ubmVjdGlvbnModmFsdWVDaGFuZ2VzIDoge1trZXkgOiBzdHJpbmd8c3ltYm9sXSA6IGFueSB9ID0ge1t0cnVlIGFzIGFueV06dHJ1ZX0gKXtcclxuICAgICAgICBmb3IobGV0IGt5IGluIHZhbHVlQ2hhbmdlcyl7XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmZvckVhY2goKGNvbm5lY3RlZCkgPT4gY29ubmVjdGVkLnZhbHVlc1treV0gPSB2YWx1ZUNoYW5nZXNba3ldKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdCguLi5kb2NPYmplY3RzIDogW0RvY09iamVjdF0pe1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gWy4uLnRoaXMuX2Nvbm5lY3Rpb25zLCAuLi5kb2NPYmplY3RzXVxyXG4gICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnModGhpcy52YWx1ZXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8qXHJcbnZhciBkb2MgPSBuZXcgRG9jT2JqZWN0KHtcclxuICAgIHZhbHVlczoge1xyXG4gICAgfSxcclxuICAgIGVsZW1lbnRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgYmluZHM6e1xyXG5cclxuICAgIH0sXHJcbiAgICByZW5kZXI6IFtcclxuXHJcbiAgICBdXHJcbn0pOyAkKGRvYy5vbkxvYWQpXHJcbiovIiwiXHJcblxyXG5leHBvcnQgY29uc3QgUk9PVF9FUlJPUiA9ICdST09UX0VSUk9SJ1xyXG5leHBvcnQgY29uc3QgSlFVRVJZX05PVF9ERVRFQ1RFRCA9ICdKUVVFUllfTk9UX0RFVEVDVEVEJ1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bkVycm9yKGVycm9yIDogc3RyaW5nLCBmYWlsPWZhbHNlKXtcclxuICAgIGlmKGVycm9yIGluIEVSUk9SUyl7XHJcbiAgICAgICAgaWYoZmFpbCl7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdEb2NPYmplY3Q6ICcrIEVSUk9SU1tlcnJvcl0ubWVzc2FnZSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoRVJST1JTW2Vycm9yXS5tZXNzYWdlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgRVJST1JTID0ge1xyXG4gICAgUk9PVF9FUlJPUiA6IHtcclxuICAgICAgICBtZXNzYWdlOiBcIlJvb3QgRWxlbWVudCBNdXN0IGJlIGEgdmFsaWQgTm9kZSwgT3IgalF1ZXJ5IEVsZW1lbnRcIlxyXG4gICAgfSxcclxuICAgIEpRVUVSWV9OT1RfREVURUNURUQ6IHtcclxuICAgICAgICBtZXNzYWdlIDogXCJKUXVlcnkgaXMgbm90IGRldGVjdGVkLiBQbGVhc2UgbG9hZCBKUXVlcnkgYmVmb3JlIERvY09iamVjdFwiXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRG9jT2JqZWN0LCBEb2NPYmplY3RFbGVtZW50IH0gZnJvbSBcIi4vZG9jb2JqZWN0XCI7XHJcbmltcG9ydCBEb2NHZW4gZnJvbSBcIi4vZG9jZ2VuXCI7XHJcbmltcG9ydCB7c2V0Q3Vyc29yUG9zLCBnZXRDdXJzb3JQb3N9IGZyb20gXCIuL3V0aWxzXCJcclxuXHJcbmNsYXNzIEJpbmQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XHJcbiAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuYXBwZW5kKGRpdik7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuLyoqKioqKiogVVRJTElUWSBNRVRIT0RTICoqKioqKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaXhJbnB1dChzZWxlY3RvciwgYWN0aW9uKXtcclxuICAgIGxldCBwb3MgPSBnZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSlcclxuICAgIGFjdGlvbigpXHJcbiAgICBzZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSwgcG9zKVxyXG59XHJcblxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZC1iaW5kJywgQmluZClcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZG9jLW9iamVjdCcsIERvY09iamVjdEVsZW1lbnQpXHJcbmlmKHdpbmRvdy5qUXVlcnkpe1xyXG4gICAgKGZ1bmN0aW9uKCQpIHtcclxuICAgICAgICAkLmZuLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIERvY09iamVjdCA6IGZ1bmN0aW9uKCBvcHRpb25zID0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpc1swXS5fRG9jT2JqZWN0ICYmICFvcHRpb25zICkgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIHsgaXNKUXVlcnk6dHJ1ZSwgLi4ub3B0aW9ucyB9KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KShqUXVlcnkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb2JqKHJvb3QgOiBEb2NPYmplY3RFbGVtZW50IHwgSlF1ZXJ5LCBvcHRpb25zIDogb2JqZWN0KSA6IERvY09iamVjdHtcclxuICAgIHJldHVybiBuZXcgRG9jT2JqZWN0KHJvb3QsIG9wdGlvbnMpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW4oKSA6IERvY0dlbiB7XHJcbiAgICByZXR1cm4gbmV3IERvY0dlbigpXHJcbn1cclxuIiwiaW50ZXJmYWNlIERvY3VtZW50IHtcclxuICAgIHNlbGVjdGlvbjoge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yODk3MTU1L2dldC1jdXJzb3ItcG9zaXRpb24taW4tY2hhcmFjdGVycy13aXRoaW4tYS10ZXh0LWlucHV0LWZpZWxkXHJcbiBleHBvcnQgZnVuY3Rpb24gZ2V0Q3Vyc29yUG9zKGVsZW1lbnQgOiBIVE1MSW5wdXRFbGVtZW50KSA6IG51bWJlciB7XHJcbiAgICAvLyBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAvLyAgICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgLy8gICAgIHJldHVybiAgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtZWxlbWVudC52YWx1ZS5sZW5ndGgpO1xyXG4gICAgLy8gfVxyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnNlbGVjdGlvbkRpcmVjdGlvbiA9PSAnYmFja3dhcmQnID8gZWxlbWVudC5zZWxlY3Rpb25TdGFydCA6IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwOi8vYmxvZy52aXNoYWxvbi5uZXQvaW5kZXgucGhwL2phdmFzY3JpcHQtZ2V0dGluZy1hbmQtc2V0dGluZy1jYXJldC1wb3NpdGlvbi1pbi10ZXh0YXJlYS9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCwgcG9zIDogbnVtYmVyKSA6IHZvaWQge1xyXG4gICAgLy8gTW9kZXJuIGJyb3dzZXJzXHJcbiAgICBpZiAoZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICBcclxuICAgIC8vIElFOCBhbmQgYmVsb3dcclxuICAgIH0gZWxzZSBpZiAoKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UpIHtcclxuICAgICAgdmFyIHJhbmdlID0gKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UoKTtcclxuICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XHJcbiAgICAgIHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgcG9zKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0KCk7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvdHMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
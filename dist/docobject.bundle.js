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
                const bound = this.obj.binds[prop](this.obj.values, attrs, docobject_1.DocObject.toNodeArray(inner));
                return typeof bound === 'function' ? bound(this.obj.g) : bound;
            }
            let element = document.createElement(prop);
            for (let key in attrs) {
                if (key === 'style' && typeof attrs[key] === 'object') {
                    for (let skey in attrs[key]) {
                        element.style[skey] = attrs[key][skey];
                    }
                }
                else if (key.startsWith('on')) {
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
exports.DocObject = void 0;
const docgen_1 = __importDefault(__webpack_require__(/*! ./docgen */ "./src/ts/docgen.ts"));
const errors_1 = __importStar(__webpack_require__(/*! ./errors */ "./src/ts/errors.ts"));
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
                this.runRender({ [prop]: value });
                target[prop] = value;
                this.runConnections({ [prop]: value });
                return true;
            }
        });
        this.onLoad = () => {
            this.runRender({ [true]: true });
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
    getBindAction(element) {
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
            return ['this', (replace) => {
                    element.innerHTML = '';
                    for (let node of replace)
                        element.appendChild(node);
                }];
        }
    }
    runBinds(params) {
        const { root, valueChanges, additionalHosts } = this.defaultRunBindOptions(params);
        (Array.isArray(root) ? root : [root])
            .filter(rt => rt && rt instanceof HTMLElement)
            .forEach((rt) => {
            [...(rt.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}], d-bind[to]`)), ...additionalHosts]
                .forEach(element => {
                //Get The Bind Method, and the Function to insert HTML 
                const [bind, bindAction] = this.getBindAction(element);
                //Check if Bind Exists 
                if (bind in this.binds) {
                    //Get Or register Bind Tag's Config
                    const config = this.findOrRegisterBind(element);
                    //Insert HTML
                    bindAction(this.runBinds({
                        root: this.generateBind(//Wrap Bind Method to prepare bind for document
                        element, bind, 
                        //Run Bind Method
                        this.binds[bind](Object.assign(Object.assign({}, this.values), valueChanges), //Pass in updates values
                        config.originalAttributes, //Pass in original attributes
                        config.originalChildren)),
                        valueChanges
                    }));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsT0FBTyxDQUFDLFlBQVksQ0FBQztBQUN4RyxDQUFDO0FBTkEsb0NBTUE7QUFFRCx5R0FBeUc7QUFDekcsU0FBZ0IsWUFBWSxDQUFDLE9BQTBCLEVBQUUsR0FBWTtJQUNqRSxrQkFBa0I7SUFDbEIsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7UUFDL0IsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFcEMsZ0JBQWdCO0tBQ2Y7U0FBTSxJQUFLLE9BQWUsQ0FBQyxlQUFlLEVBQUU7UUFDM0MsSUFBSSxLQUFLLEdBQUksT0FBZSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQy9DLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQWRELG9DQWNDOzs7Ozs7O1VDOUJEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jZ2VuLnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9kb2NvYmplY3QudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2Vycm9ycy50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL3V0aWxzLnRzIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEb2NPYmplY3QsIERvY09iamVjdEhUTUxMaWtlfSBmcm9tICcuL2RvY29iamVjdCdcclxuaW1wb3J0IHsgRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSB9IGZyb20gJy4vZG9jYmluZCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY0dlbiB7XHJcbiAgICBcclxuICAgIG9iaiA/IDogRG9jT2JqZWN0IFxyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihvYmo/IDogRG9jT2JqZWN0KXtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9iaiA9IG9ialxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcclxuICAgICAgICAgICAgZ2V0Oih0YXJnZXQsIHByb3AgKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHJldHVybiB0aGlzLkdlbihwcm9wIGFzIHN0cmluZylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgR2VuKHByb3AgOiBzdHJpbmcpe1xyXG4gICAgICAgIHJldHVybiAoaW5uZXIgOiBEb2NPYmplY3RIVE1MTGlrZSB8IEFycmF5PHN0cmluZ3xOb2RlPiA9IFtdICwgYXR0cnMgOiBEb2NPYmplY3RCaW5kQXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMub2JqICYmIHByb3AgaW4gdGhpcy5vYmouYmluZHMpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm91bmQgPSB0aGlzLm9iai5iaW5kc1twcm9wXSh0aGlzLm9iai52YWx1ZXMsIGF0dHJzLCBEb2NPYmplY3QudG9Ob2RlQXJyYXkoaW5uZXIpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBib3VuZCA9PT0gJ2Z1bmN0aW9uJyA/IGJvdW5kKHRoaXMub2JqLmcpIDogYm91bmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHByb3ApXHJcbiAgICAgICAgICAgIGZvcihsZXQga2V5IGluIGF0dHJzKXtcclxuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgYXR0cnNba2V5XSA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHNrZXkgaW4gYXR0cnNba2V5IGFzIHN0cmluZ10pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3NrZXldID0gYXR0cnNba2V5XVtza2V5XVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihrZXkuc3RhcnRzV2l0aCgnb24nKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtrZXldID0gYXR0cnNba2V5XVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIERvY09iamVjdC50b05vZGVBcnJheShpbm5lcikuZm9yRWFjaChpbmUgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbmUpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IERvY09iamVjdERvbUJpbmQsIERvY09iamVjdEJpbmQsIERvY09iamVjdEJpbmRHZW4gfSBmcm9tICcuL2RvY2JpbmQnXHJcbmltcG9ydCB7IERvY09iamVjdFJlbmRlciB9IGZyb20gJy4vZG9jcmVuZGVyJ1xyXG5pbXBvcnQgIERvY0dlbiAgZnJvbSAnLi9kb2NnZW4nXHJcbmltcG9ydCBydW5FcnJvciwgeyBcclxuICAgIFJPT1RfRVJST1IsXHJcbiAgICBKUVVFUllfTk9UX0RFVEVDVEVEXHJcbn0gZnJvbSAnLi9lcnJvcnMnO1xyXG5cclxuLyoqKioqKiogR0xPQkFMUyAqKioqKioqL1xyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgV2luZG93IHtcclxuICAgICAgICBqUXVlcnk6YW55O1xyXG4gICAgICAgIG1zQ3J5cHRvOmFueTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbi8qKioqKioqIERPQyBPQkpFQ1QgKioqKioqKi9cclxuZXhwb3J0IHR5cGUgRG9jT2JqZWN0SFRNTExpa2UgPSBcclxufCBOb2RlXHJcbnwgTm9kZUxpc3RcclxufCBKUXVlcnkgXHJcbnwgTnVtYmVyXHJcbnwgc3RyaW5nXHJcbnwgKChnZW46IERvY0dlbikgPT4gRG9jT2JqZWN0SFRNTExpa2UpO1xyXG5cclxuXHJcblxyXG5pbnRlcmZhY2UgRG9jT2JqZWN0T3B0aW9ucyB7XHJcbiAgICByZW5kZXIgOiBEb2NPYmplY3RSZW5kZXI7XHJcbiAgICBiaW5kcyA6IERvY09iamVjdEJpbmQgfCBEb2NPYmplY3RCaW5kR2VuO1xyXG4gICAgZWxlbWVudHMgOiB7W2tleTpzdHJpbmddOiBzdHJpbmd9O1xyXG4gICAgdmFsdWVzIDogb2JqZWN0O1xyXG4gICAgYmluZEF0dHIgOiBzdHJpbmc7XHJcbiAgICBiaW5kSW5BdHRyIDogc3RyaW5nO1xyXG4gICAgaXNKUXVlcnkgOiBib29sZWFuO1xyXG4gICAgY29ubmVjdGlvbnMgOiBBcnJheTxEb2NPYmplY3Q+XHJcbiAgICByZW1vdmVPbmxvYWQgOiBib29sZWFuXHJcbn1cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucyB7XHJcbiAgICByb290IDogYW55O1xyXG4gICAgdmFsdWVDaGFuZ2VzOiBvYmplY3Q7XHJcbiAgICBhZGRpdGlvbmFsSG9zdHM/IDogQXJyYXk8SFRNTEVsZW1lbnQ+XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG9jT2JqZWN0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIF9Eb2NPYmplY3Q/IDogRG9jT2JqZWN0XHJcbn1cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RFbGVtZW50cyB7XHJcbiAgICBba2V5OiBzdHJpbmddIDogc3RyaW5nIHwgKChzZWxlY3RvciA6IHN0cmluZyApID0+IE5vZGVMaXN0fEpRdWVyeSlcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEb2NPYmplY3RDb25maWcge1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbjogQXJyYXk8Tm9kZT47XHJcbiAgICBvcmlnaW5hbENoaWxkcmVuSFRNTDogc3RyaW5nO1xyXG4gICAgb3JpZ2luYWxBdHRyaWJ1dGVzOiB7W2tleTpzdHJpbmddIDogc3RyaW5nfTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEb2NPYmplY3Qge1xyXG5cclxuICAgIHN0YXRpYyBwYXJzZXIgOiBET01QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKClcclxuXHJcbiAgICBzdGF0aWMgdG9Ob2RlQXJyYXkoYW55IDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gKSA6IEFycmF5PE5vZGU+IHtcclxuICAgICAgICBpZih0eXBlb2YgYW55ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYW55ID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgIHJldHVybiBbLi4uRG9jT2JqZWN0LnBhcnNlci5wYXJzZUZyb21TdHJpbmcoYW55LnRvU3RyaW5nKCksICd0ZXh0L2h0bWwnKS5ib2R5LmNoaWxkTm9kZXNdXHJcbiAgICAgICAgfWVsc2UgaWYoTm9kZUxpc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYW55KSB8fCAod2luZG93LmpRdWVyeSAmJiBhbnkgaW5zdGFuY2VvZiBqUXVlcnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFsgLi4uKGFueSBhcyBOb2RlTGlzdCldXHJcbiAgICAgICAgfWVsc2UgaWYoQXJyYXkuaXNBcnJheShhbnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIGFueVxyXG4gICAgICAgICAgICAuZmlsdGVyKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSB8fCBlIGluc3RhbmNlb2YgTm9kZSApXHJcbiAgICAgICAgICAgIC5tYXAoZT0+ICh0eXBlb2YgZSA9PT0gJ3N0cmluZycpID8gRG9jT2JqZWN0LnRvTm9kZUFycmF5KGUpWzBdIDogZSApO1xyXG4gICAgICAgIH0gZWxzZSBpZihhbnkgaW5zdGFuY2VvZiBOb2RlIHx8IGFueSBpbnN0YW5jZW9mIERvY3VtZW50ICl7XHJcbiAgICAgICAgICAgIHJldHVybiBbYW55XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGVmYXVsdFBhcmFtcyh7XHJcbiAgICAgICAgcmVuZGVyID0gW10sXHJcbiAgICAgICAgYmluZHMgPSB7fSxcclxuICAgICAgICBlbGVtZW50cyA9IHt9LFxyXG4gICAgICAgIHZhbHVlcyA9IHt9LFxyXG4gICAgICAgIGJpbmRBdHRyID0gJ2QtYmluZCcsXHJcbiAgICAgICAgYmluZEluQXR0ciA9ICdkLWJpbmQtaW4nLFxyXG4gICAgICAgIGlzSlF1ZXJ5ID0gZmFsc2UsXHJcbiAgICAgICAgY29ubmVjdGlvbnMgPSBbXSxcclxuICAgICAgICByZW1vdmVPbmxvYWQgPSBmYWxzZVxyXG4gICAgfSA9IHt9KSA6IERvY09iamVjdE9wdGlvbnMge1xyXG4gICAgICAgIHJldHVybiAgeyBlbGVtZW50cywgdmFsdWVzLCByZW5kZXIsIGJpbmRzLCBiaW5kQXR0ciwgYmluZEluQXR0ciwgaXNKUXVlcnksIGNvbm5lY3Rpb25zLCByZW1vdmVPbmxvYWQgfSBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZGVmYXVsdFJ1bkJpbmRPcHRpb25zKHtcclxuICAgICAgICByb290LFxyXG4gICAgICAgIHZhbHVlQ2hhbmdlcyxcclxuICAgICAgICBhZGRpdGlvbmFsSG9zdHMgPSBbXVxyXG4gICAgfSA6IERvY09iamVjdFJ1bkJpbmRPcHRpb25zICkgOiBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuIHtyb290LCB2YWx1ZUNoYW5nZXMsIGFkZGl0aW9uYWxIb3N0c31cclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICByZWFkb25seSBfdmFsdWVzIDogb2JqZWN0O1xyXG4gICAgZWxlbWVudHMgOiBQcm94eUhhbmRsZXI8RG9jT2JqZWN0RWxlbWVudHM+O1xyXG4gICAgcm9vdCA6IERvY09iamVjdEVsZW1lbnQ7XHJcbiAgICByZW5kZXIgOiBEb2NPYmplY3RSZW5kZXI7XHJcbiAgICBiaW5kcyA6IERvY09iamVjdEJpbmQ7XHJcbiAgICBiaW5kQXR0ciA6IHN0cmluZztcclxuICAgIGJpbmRJbkF0dHIgOiBzdHJpbmc7XHJcbiAgICBxdWVyeSA6IFByb3h5SGFuZGxlcjxEb2NPYmplY3RFbGVtZW50cz47XHJcbiAgICBfcXVlcnlTZWxlY3QgOiAoc2VsZWN0b3I6c3RyaW5nKT0+IE5vZGVMaXN0IHwgSlF1ZXJ5O1xyXG4gICAgX2lzSlF1ZXJ5IDogYm9vbGVhblxyXG4gICAgX2Nvbm5lY3Rpb25zIDogQXJyYXk8RG9jT2JqZWN0PlxyXG4gICAgZyA6IERvY0dlblxyXG4gICAgb25Mb2FkOiAoKT0+dm9pZFxyXG5cclxuICAgIHNldCB2YWx1ZXModmFsdWVzKSB7XHJcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJUcmllZCB0byBzZXQgRG9jT2JqZWN0LnZhbHVlLiBUcnkgY3JlYXRpbmcgYSBpbm5lciBvYmplY3QgaW5zdGVhZC5cIilcclxuICAgIH1cclxuICAgIGdldCB2YWx1ZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3Rvcihyb290IDogRG9jT2JqZWN0RWxlbWVudCB8IEpRdWVyeSwgb3B0aW9ucyA6IG9iamVjdCkge1xyXG4gICAgICAgIC8vQWRkIERlZmF1bHQgUGFyYW1ldGVycyB0byBvcHRpb25zXHJcbiAgICAgICAgY29uc3QgeyBlbGVtZW50cywgdmFsdWVzLCByZW5kZXIsIGJpbmRzLCBiaW5kQXR0ciwgYmluZEluQXR0ciwgaXNKUXVlcnksIGNvbm5lY3Rpb25zLCByZW1vdmVPbmxvYWQgfSA6IERvY09iamVjdE9wdGlvbnMgPSBEb2NPYmplY3QuZGVmYXVsdFBhcmFtcyhvcHRpb25zKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vRXh0cmFjdCBET00gZWxlbWVudCBmcm9tIEhUTUxFbGVtZW50IE9yIEpxdWVyeSBPYmplY3RcclxuICAgICAgICBsZXQgcm9vdEVsZW1lbnQgPSBEb2NPYmplY3QudG9Ob2RlQXJyYXkocm9vdClbMF1cclxuICAgICAgICBcclxuICAgICAgICAvL1NldCBSb290IE9iamVjdFxyXG4gICAgICAgIGlmKHJvb3RFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5yb290ID0gcm9vdEVsZW1lbnRcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcnVuRXJyb3IoUk9PVF9FUlJPUiwgdHJ1ZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gY29ubmVjdGlvbnM7XHJcblxyXG4gICAgICAgIC8vU2V0IEpxdWVyeVxyXG4gICAgICAgIGlmKGlzSlF1ZXJ5ICYmIHdpbmRvdy5qUXVlcnkpe1xyXG4gICAgICAgICAgICAvL0lmIEpxdWVyeSBpcyBkZXRlY3RlZCBhbmQgaXMgc2V0IHRvIGpxdWVyeSBtb2RlLi4uXHJcbiAgICAgICAgICAgIHRoaXMuX2lzSlF1ZXJ5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vU2V0IFF1ZXJ5IFNlbGVjdCBzdGF0ZW1lbnQgdG8gdXNlIGpRdWVyeVxyXG4gICAgICAgICAgICB0aGlzLl9xdWVyeVNlbGVjdCA9ICguLi5wcm9wcykgPT4gJCh0aGlzLnJvb3QpLmZpbmQoLi4ucHJvcHMpXHJcbiAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAvL0lmIEpxdWVyeSBpcyBub3QgZGV0ZWN0ZWQuLi5cclxuICAgICAgICAgICAgaWYoaXNKUXVlcnkpe1xyXG4gICAgICAgICAgICAgICAgLy9JZiBzZXQgdG8ganF1ZXJ5IG1vZGUuLi5cclxuICAgICAgICAgICAgICAgIHJ1bkVycm9yKEpRVUVSWV9OT1RfREVURUNURUQsIGZhbHNlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vU2V0IFF1ZXJ5IFNlbGVjdCBzdGF0ZW1lbnQgdG8gdXNlIEhUTUxFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGxcclxuICAgICAgICAgICAgdGhpcy5faXNKUXVlcnkgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnlTZWxlY3QgPSAoLi4ucHJvcHMpID0+IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yQWxsKC4uLnByb3BzKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9TZXQgUm9vdCBPYmplY3QgdG8gdGhpc1xyXG4gICAgICAgIHRoaXMucm9vdC5fRG9jT2JqZWN0ID0gdGhpcztcclxuXHJcbiAgICAgICAgLy9TZXQgUmVuZGVyIEZ1bmN0aW9uc1xyXG4gICAgICAgIHRoaXMucmVuZGVyID0gcmVuZGVyO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSBSZWxhdGVkIERvY0dlblxyXG4gICAgICAgIHRoaXMuZyA9IG5ldyBEb2NHZW4odGhpcylcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLmJpbmRzID0gKHR5cGVvZiBiaW5kcyA9PT0gJ2Z1bmN0aW9uJykgPyBiaW5kcyh0aGlzLmcpIDogYmluZHMgO1xyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEF0dHJpYnV0ZVxyXG4gICAgICAgIHRoaXMuYmluZEF0dHIgPSBiaW5kQXR0cjtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBJbiBBdHRyaWJ1dGVcclxuICAgICAgICB0aGlzLmJpbmRJbkF0dHIgPSBiaW5kSW5BdHRyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IFF1ZXJ5IFByb3h5XHJcbiAgICAgICAgdGhpcy5xdWVyeSA9IG5ldyBQcm94eSh7fSwge1xyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3AgKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgcHJvcCA9PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIHRhcmdldFtwcm9wXSA/IHRhcmdldFtwcm9wXSA6IF8gPT4gdGhpcy5fcXVlcnlTZWxlY3QoIC8uKihcXC58XFwjfFxcW3xcXF0pLiovZ20uZXhlYyhwcm9wKSA/IHByb3AgOiAnIycgKyBwcm9wICkgXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogKHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgdmFsdWUgPSAoKSA9PiB0aGlzLl9xdWVyeVNlbGVjdCh2YWx1ZSlcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IF8gPT4gdmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vU2V0IEVsZW1lbnRzIFByb3h5XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IG5ldyBQcm94eSh0aGlzLnF1ZXJ5LCB7XHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL0FkZCBpbiBlbGVtZW50cyBmcm9tIG9wdGlvbnNcclxuICAgICAgICBpZiAoZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZWxlbWVudHMpLmZvckVhY2goKGUgPT4geyB0aGlzLnF1ZXJ5W2VbMF1dID0gZVsxXSB9KSlcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLl92YWx1ZXMgPSBuZXcgUHJveHkoIXZhbHVlcyB8fCB0eXBlb2YgdmFsdWVzICE9PSAnb2JqZWN0JyA/IHt9IDogdmFsdWVzLCB7XHJcbiAgICAgICAgICAgIHNldDogKHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJ1blJlbmRlcih7IFtwcm9wXTogdmFsdWUgfSlcclxuICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh7W3Byb3BdOnZhbHVlfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICBcclxuICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMub25Mb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ1blJlbmRlcih7IFt0cnVlIGFzIGFueV06IHRydWUgfSlcclxuICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh0aGlzLnZhbHVlcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFyZW1vdmVPbmxvYWQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLl9pc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMub25Mb2FkKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5vbmxvYWQgPSB0aGlzLm9uTG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNCaW5kSW4oZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSAmJiB0cnVlICkgXHJcbiAgICB9XHJcbiAgICBpc0JpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpICYmIHRydWVcclxuICAgIH1cclxuICAgIHN0YXRpYyBpc0RvYk9iamVjdEVsZW1lbnQoZWxlbWVudCA6IERvY09iamVjdEVsZW1lbnQgKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoIGVsZW1lbnQuX0RvY09iamVjdCBpbnN0YW5jZW9mIERvY09iamVjdCAgKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmaW5kT3JSZWdpc3RlckJpbmQoRE9NZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgICAgICBpZihET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGxldCBvcmlnaW5hbENoaWxkcmVuID0gWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc11cclxuICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbi50b1N0cmluZyA9ICgpPT4gRE9NZWxlbWVudC5pbm5lckhUTUxcclxuICAgICAgICAgICAgRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbixcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW5IVE1MOiBET01lbGVtZW50LmlubmVySFRNTCxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQXR0cmlidXRlczogWy4uLkRPTWVsZW1lbnQuYXR0cmlidXRlc10ucmVkdWNlKCAoYSxjKT0+e3JldHVybiB7Li4uYSwgW2MubmFtZV06Yy52YWx1ZX0gfSwge30gKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWdcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUJpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQsIGJpbmQsIGJvdW5kIDogRG9jT2JqZWN0SFRNTExpa2UpIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheSh0eXBlb2YgYm91bmQgPT09ICdmdW5jdGlvbicgPyBib3VuZCh0aGlzLmcpIDogYm91bmQpO1xyXG4gICAgICAgIGlmKHRoaXMuaXNCaW5kKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gbm9kZUFycmF5LmZpbmQoZWwgPT4gZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgYXMgRG9jT2JqZWN0RG9tQmluZDtcclxuICAgICAgICAgICAgZmlyc3RFbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoKGZpcnN0RWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnID8gJ3RvJyA6IHRoaXMuYmluZEF0dHIpLCBiaW5kKVxyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzKS5maWx0ZXIoYXR0QT0+IShbJ2QtYmluZC1pbicsICd0byddLmluY2x1ZGVzKGF0dEFbMF0pKSkuZm9yRWFjaChhdHRBPT5maXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dEFbMF0sIGF0dEFbMV0pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RFbGVtZW50O1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZUFycmF5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICBydW5SZW5kZXIodmFsdWVDaGFuZ2VzID0ge30pIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIuZmlsdGVyKHJlbiA9PiAocmVuLmRlcCAmJiBBcnJheS5pc0FycmF5KHJlbi5kZXApICYmIHJlbi5kZXAuc29tZSgoZGVwcCkgPT4gKGRlcHAgaW4gdmFsdWVDaGFuZ2VzKSkpIHx8IChyZW4uZGVwID09PSB1bmRlZmluZWQpKS5mb3JFYWNoKHJlbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZW4uY2xlYW4pIHJlbi5jbGVhbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgICAgIHJlbi5hY3Rpb24oeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIHRoaXMudmFsdWVzKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5ydW5CaW5kcyh7cm9vdDp0aGlzLnJvb3QsIHZhbHVlQ2hhbmdlcywgYWRkaXRpb25hbEhvc3RzOlt0aGlzLnJvb3RdfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QmluZEFjdGlvbihlbGVtZW50IDogSFRNTEVsZW1lbnQpIDogW3N0cmluZywgKHJlcGxhY2UgOiBOb2RlICYgTm9kZUxpc3QgKT0+dm9pZF0ge1xyXG4gICAgICAgIGlmKHRoaXMuaXNCaW5kKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgaWYoZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSwgKHJlcGxhY2UpPT5lbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHJlcGxhY2UsIGVsZW1lbnQpXVxyXG4gICAgICAgICAgICB9ZWxzZSBpZihlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSgndG8nKSwgKHJlcGxhY2UpPT5lbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHJlcGxhY2UsIGVsZW1lbnQpXVxyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1lbHNlIGlmKHRoaXMuaXNCaW5kSW4oZWxlbWVudCkpe1xyXG4gICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEluQXR0ciksIChyZXBsYWNlKT0+e1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9ZWxzZSBpZihEb2NPYmplY3QuaXNEb2JPYmplY3RFbGVtZW50KGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFsndGhpcycsICAgKHJlcGxhY2UpPT57XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiByZXBsYWNlKSBlbGVtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwgPSAoc2VsZWN0b3IgOiBzdHJpbmcpID0+IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxyXG4gICAgcnVuQmluZHMocGFyYW1zIDogRG9jT2JqZWN0UnVuQmluZE9wdGlvbnMpIHtcclxuICAgICAgICBjb25zdCB7cm9vdCwgdmFsdWVDaGFuZ2VzLCBhZGRpdGlvbmFsSG9zdHMgfSA9IHRoaXMuZGVmYXVsdFJ1bkJpbmRPcHRpb25zKHBhcmFtcyk7XHJcbiAgICAgICAgKEFycmF5LmlzQXJyYXkocm9vdCkgPyByb290IDogW3Jvb3RdKSBcclxuICAgICAgICAuZmlsdGVyKHJ0PT5ydCAmJiBydCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG4gICAgICAgIC5mb3JFYWNoKChydCk9PntcclxuICAgICAgICAgICAgWyAuLi4ocnQucXVlcnlTZWxlY3RvckFsbChgWyR7dGhpcy5iaW5kQXR0cn1dLCBbJHt0aGlzLmJpbmRJbkF0dHJ9XSwgZC1iaW5kW3RvXWApKSwgLi4uYWRkaXRpb25hbEhvc3RzXSBcclxuICAgICAgICAgICAgLmZvckVhY2goIGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9HZXQgVGhlIEJpbmQgTWV0aG9kLCBhbmQgdGhlIEZ1bmN0aW9uIHRvIGluc2VydCBIVE1MIFxyXG4gICAgICAgICAgICAgICAgY29uc3QgW2JpbmQsIGJpbmRBY3Rpb25dID0gdGhpcy5nZXRCaW5kQWN0aW9uKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIEJpbmQgRXhpc3RzIFxyXG4gICAgICAgICAgICAgICAgaWYgKGJpbmQgaW4gdGhpcy5iaW5kcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0dldCBPciByZWdpc3RlciBCaW5kIFRhZydzIENvbmZpZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmZpbmRPclJlZ2lzdGVyQmluZChlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9JbnNlcnQgSFRNTFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kQWN0aW9uKHRoaXMucnVuQmluZHMoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogdGhpcy5nZW5lcmF0ZUJpbmQoICAvL1dyYXAgQmluZCBNZXRob2QgdG8gcHJlcGFyZSBiaW5kIGZvciBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUnVuIEJpbmQgTWV0aG9kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kc1tiaW5kXShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIC8vUGFzcyBpbiB1cGRhdGVzIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzLCAvL1Bhc3MgaW4gb3JpZ2luYWwgYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxDaGlsZHJlbiwgLy9QYXNzIGluIG9yaWdpbmFsIGNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQ2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiByb290O1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bkNvbm5lY3Rpb25zKHZhbHVlQ2hhbmdlcyA6IHtba2V5IDogc3RyaW5nfHN5bWJvbF0gOiBhbnkgfSA9IHtbdHJ1ZSBhcyBhbnldOnRydWV9ICl7XHJcbiAgICAgICAgZm9yKGxldCBreSBpbiB2YWx1ZUNoYW5nZXMpe1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9ucy5mb3JFYWNoKChjb25uZWN0ZWQpID0+IGNvbm5lY3RlZC52YWx1ZXNba3ldID0gdmFsdWVDaGFuZ2VzW2t5XSlcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3QoLi4uZG9jT2JqZWN0cyA6IFtEb2NPYmplY3RdKXtcclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IFsuLi50aGlzLl9jb25uZWN0aW9ucywgLi4uZG9jT2JqZWN0c11cclxuICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHRoaXMudmFsdWVzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuXHJcblxyXG4vKlxyXG52YXIgZG9jID0gbmV3IERvY09iamVjdCh7XHJcbiAgICB2YWx1ZXM6IHtcclxuICAgIH0sXHJcbiAgICBlbGVtZW50czp7XHJcblxyXG4gICAgfSxcclxuICAgIGJpbmRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBbXHJcblxyXG4gICAgXVxyXG59KTsgJChkb2Mub25Mb2FkKVxyXG4qLyIsIlxyXG5cclxuZXhwb3J0IGNvbnN0IFJPT1RfRVJST1IgPSAnUk9PVF9FUlJPUidcclxuZXhwb3J0IGNvbnN0IEpRVUVSWV9OT1RfREVURUNURUQgPSAnSlFVRVJZX05PVF9ERVRFQ1RFRCdcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBydW5FcnJvcihlcnJvciA6IHN0cmluZywgZmFpbD1mYWxzZSl7XHJcbiAgICBpZihlcnJvciBpbiBFUlJPUlMpe1xyXG4gICAgICAgIGlmKGZhaWwpe1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignRG9jT2JqZWN0OiAnKyBFUlJPUlNbZXJyb3JdLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKEVSUk9SU1tlcnJvcl0ubWVzc2FnZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IEVSUk9SUyA9IHtcclxuICAgIFJPT1RfRVJST1IgOiB7XHJcbiAgICAgICAgbWVzc2FnZTogXCJSb290IEVsZW1lbnQgTXVzdCBiZSBhIHZhbGlkIE5vZGUsIE9yIGpRdWVyeSBFbGVtZW50XCJcclxuICAgIH0sXHJcbiAgICBKUVVFUllfTk9UX0RFVEVDVEVEOiB7XHJcbiAgICAgICAgbWVzc2FnZSA6IFwiSlF1ZXJ5IGlzIG5vdCBkZXRlY3RlZC4gUGxlYXNlIGxvYWQgSlF1ZXJ5IGJlZm9yZSBEb2NPYmplY3RcIlxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERvY09iamVjdCwgRG9jT2JqZWN0RWxlbWVudCB9IGZyb20gXCIuL2RvY29iamVjdFwiO1xyXG5pbXBvcnQgRG9jR2VuIGZyb20gXCIuL2RvY2dlblwiO1xyXG5pbXBvcnQge3NldEN1cnNvclBvcywgZ2V0Q3Vyc29yUG9zfSBmcm9tIFwiLi91dGlsc1wiXHJcblxyXG5jbGFzcyBCaW5kIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xyXG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmFwcGVuZChkaXYpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKioqKioqKiBVVElMSVRZIE1FVEhPRFMgKioqKioqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpeElucHV0KHNlbGVjdG9yLCBhY3Rpb24pe1xyXG4gICAgbGV0IHBvcyA9IGdldEN1cnNvclBvcyhzZWxlY3RvcigpWzBdKVxyXG4gICAgYWN0aW9uKClcclxuICAgIHNldEN1cnNvclBvcyhzZWxlY3RvcigpWzBdLCBwb3MpXHJcbn1cclxuXHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkLWJpbmQnLCBCaW5kKVxyXG5pZih3aW5kb3cualF1ZXJ5KXtcclxuICAgIChmdW5jdGlvbigkKSB7XHJcbiAgICAgICAgJC5mbi5leHRlbmQoe1xyXG4gICAgICAgICAgICBEb2NPYmplY3QgOiBmdW5jdGlvbiggb3B0aW9ucyA9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXNbMF0uX0RvY09iamVjdCAmJiAhb3B0aW9ucyApIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCB7IGlzSlF1ZXJ5OnRydWUsIC4uLm9wdGlvbnMgfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSkoalF1ZXJ5KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9iaihyb290IDogRG9jT2JqZWN0RWxlbWVudCB8IEpRdWVyeSwgb3B0aW9ucyA6IG9iamVjdCkgOiBEb2NPYmplY3R7XHJcbiAgICByZXR1cm4gbmV3IERvY09iamVjdChyb290LCBvcHRpb25zKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuKCkgOiBEb2NHZW4ge1xyXG4gICAgcmV0dXJuIG5ldyBEb2NHZW4oKVxyXG59XHJcbiIsImludGVyZmFjZSBEb2N1bWVudCB7XHJcbiAgICBzZWxlY3Rpb246IHtcclxuICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuLy8gQ3JlZGl0czogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjg5NzE1NS9nZXQtY3Vyc29yLXBvc2l0aW9uLWluLWNoYXJhY3RlcnMtd2l0aGluLWEtdGV4dC1pbnB1dC1maWVsZFxyXG4gZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCkgOiBudW1iZXIge1xyXG4gICAgLy8gaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xyXG4gICAgLy8gICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIC8vICAgICByZXR1cm4gIGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLWVsZW1lbnQudmFsdWUubGVuZ3RoKTtcclxuICAgIC8vIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudC5zZWxlY3Rpb25EaXJlY3Rpb24gPT0gJ2JhY2t3YXJkJyA/IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgOiBlbGVtZW50LnNlbGVjdGlvbkVuZDtcclxufVxyXG5cclxuLy8gQ3JlZGl0czogaHR0cDovL2Jsb2cudmlzaGFsb24ubmV0L2luZGV4LnBocC9qYXZhc2NyaXB0LWdldHRpbmctYW5kLXNldHRpbmctY2FyZXQtcG9zaXRpb24taW4tdGV4dGFyZWEvXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDdXJzb3JQb3MoZWxlbWVudCA6IEhUTUxJbnB1dEVsZW1lbnQsIHBvcyA6IG51bWJlcikgOiB2b2lkIHtcclxuICAgIC8vIE1vZGVybiBicm93c2Vyc1xyXG4gICAgaWYgKGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcclxuICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xyXG4gICAgXHJcbiAgICAvLyBJRTggYW5kIGJlbG93XHJcbiAgICB9IGVsc2UgaWYgKChlbGVtZW50IGFzIGFueSkuY3JlYXRlVGV4dFJhbmdlKSB7XHJcbiAgICAgIHZhciByYW5nZSA9IChlbGVtZW50IGFzIGFueSkuY3JlYXRlVGV4dFJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xyXG4gICAgICByYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBwb3MpO1xyXG4gICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdCgpO1xyXG4gICAgfVxyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3RzL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
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
            this.runRender(Object.assign(Object.assign({}, this.values), { [true]: true }));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtLQUNmO1NBQU0sSUFBSyxPQUFlLENBQUMsZUFBZSxFQUFFO1FBQzNDLElBQUksS0FBSyxHQUFJLE9BQWUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMvQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFkRCxvQ0FjQzs7Ozs7OztVQzlCRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2RvY2dlbi50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jb2JqZWN0LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9lcnJvcnMudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2luZGV4LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy91dGlscy50cyIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RG9jT2JqZWN0LCBEb2NPYmplY3RIVE1MTGlrZX0gZnJvbSAnLi9kb2NvYmplY3QnXHJcbmltcG9ydCB7IERvY09iamVjdEJpbmRBdHRyaWJ1dGUgfSBmcm9tICcuL2RvY2JpbmQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2NHZW4ge1xyXG4gICAgXHJcbiAgICBvYmogPyA6IERvY09iamVjdCBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iob2JqPyA6IERvY09iamVjdCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vYmogPSBvYmpcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XHJcbiAgICAgICAgICAgIGdldDoodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICByZXR1cm4gdGhpcy5HZW4ocHJvcCBhcyBzdHJpbmcpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIEdlbihwcm9wIDogc3RyaW5nKXtcclxuICAgICAgICByZXR1cm4gKGlubmVyIDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gPSBbXSAsIGF0dHJzIDogRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZih0aGlzLm9iaiAmJiBwcm9wIGluIHRoaXMub2JqLmJpbmRzKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kID0gdGhpcy5vYmouYmluZHNbcHJvcF0odGhpcy5vYmoudmFsdWVzLCBhdHRycywgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKSwgdGhpcy5vYmoudmFsdWVzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBib3VuZCA9PT0gJ2Z1bmN0aW9uJyA/IGJvdW5kKHRoaXMub2JqLmcpIDogYm91bmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHByb3ApXHJcbiAgICAgICAgICAgIGZvcihsZXQga2V5IGluIGF0dHJzKXtcclxuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgYXR0cnNba2V5XSA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHNrZXkgaW4gYXR0cnNba2V5IGFzIHN0cmluZ10pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3NrZXldID0gYXR0cnNba2V5XVtza2V5XVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihrZXkgaW4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSBhdHRyc1trZXldXHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKS5mb3JFYWNoKGluZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGluZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRG9jT2JqZWN0RG9tQmluZCwgRG9jT2JqZWN0QmluZCwgRG9jT2JqZWN0QmluZEdlbiB9IGZyb20gJy4vZG9jYmluZCdcclxuaW1wb3J0IHsgRG9jT2JqZWN0UmVuZGVyIH0gZnJvbSAnLi9kb2NyZW5kZXInXHJcbmltcG9ydCAgRG9jR2VuICBmcm9tICcuL2RvY2dlbidcclxuaW1wb3J0IHJ1bkVycm9yLCB7IFxyXG4gICAgUk9PVF9FUlJPUixcclxuICAgIEpRVUVSWV9OT1RfREVURUNURURcclxufSBmcm9tICcuL2Vycm9ycyc7XHJcblxyXG4vKioqKioqKiBHTE9CQUxTICoqKioqKiovXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgICAgIGpRdWVyeTphbnk7XHJcbiAgICAgICAgbXNDcnlwdG86YW55O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuLyoqKioqKiogRE9DIE9CSkVDVCAqKioqKioqL1xyXG5leHBvcnQgdHlwZSBEb2NPYmplY3RIVE1MTGlrZSA9IFxyXG58IE5vZGVcclxufCBOb2RlTGlzdFxyXG58IEpRdWVyeSBcclxufCBOdW1iZXJcclxufCBzdHJpbmdcclxufCAoKGdlbjogRG9jR2VuKSA9PiBEb2NPYmplY3RIVE1MTGlrZSk7XHJcblxyXG5cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZCB8IERvY09iamVjdEJpbmRHZW47XHJcbiAgICBlbGVtZW50cyA6IHtba2V5OnN0cmluZ106IHN0cmluZ307XHJcbiAgICB2YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBiaW5kQXR0ciA6IHN0cmluZztcclxuICAgIGJpbmRJbkF0dHIgOiBzdHJpbmc7XHJcbiAgICBpc0pRdWVyeSA6IGJvb2xlYW47XHJcbiAgICBjb25uZWN0aW9ucyA6IEFycmF5PERvY09iamVjdD5cclxuICAgIHJlbW92ZU9ubG9hZCA6IGJvb2xlYW5cclxufVxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdFJ1bkJpbmRPcHRpb25zIHtcclxuICAgIHJvb3QgOiBhbnk7XHJcbiAgICB2YWx1ZUNoYW5nZXM6IG9iamVjdDtcclxuICAgIGFkZGl0aW9uYWxIb3N0cz8gOiBBcnJheTxIVE1MRWxlbWVudD5cclxufVxyXG5cclxuLy8gZXhwb3J0IGludGVyZmFjZSBEb2NPYmplY3RFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4vLyAgICAgX0RvY09iamVjdD8gOiBEb2NPYmplY3RcclxuLy8gfVxyXG5cclxuZXhwb3J0IGNsYXNzIERvY09iamVjdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBfRG9jT2JqZWN0PyA6IERvY09iamVjdFxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIGlmKCFEb2NPYmplY3QuaXNEb2JPYmplY3RFbGVtZW50KHRoaXMpKXtcclxuICAgICAgICAgICAgdGhpcy5fRG9jT2JqZWN0ID0gbmV3IERvY09iamVjdCh0aGlzLCB7fSlcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jT2JqZWN0RWxlbWVudHMge1xyXG4gICAgW2tleTogc3RyaW5nXSA6IHN0cmluZyB8ICgoc2VsZWN0b3IgOiBzdHJpbmcgKSA9PiBOb2RlTGlzdHxKUXVlcnkpXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgIG9yaWdpbmFsQ2hpbGRyZW46IEFycmF5PE5vZGU+O1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IHN0cmluZztcclxuICAgIG9yaWdpbmFsQXR0cmlidXRlczoge1trZXk6c3RyaW5nXSA6IHN0cmluZ307XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRG9jT2JqZWN0IHtcclxuXHJcbiAgICBzdGF0aWMgcGFyc2VyIDogRE9NUGFyc2VyID0gbmV3IERPTVBhcnNlcigpXHJcblxyXG4gICAgc3RhdGljIHRvTm9kZUFycmF5KGFueSA6IERvY09iamVjdEhUTUxMaWtlIHwgQXJyYXk8c3RyaW5nfE5vZGU+ICkgOiBBcnJheTxOb2RlPiB7XHJcbiAgICAgICAgaWYodHlwZW9mIGFueSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGFueSA9PT0gJ251bWJlcicpe1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLkRvY09iamVjdC5wYXJzZXIucGFyc2VGcm9tU3RyaW5nKGFueS50b1N0cmluZygpLCAndGV4dC9odG1sJykuYm9keS5jaGlsZE5vZGVzXVxyXG4gICAgICAgIH1lbHNlIGlmKE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGFueSkgfHwgKHdpbmRvdy5qUXVlcnkgJiYgYW55IGluc3RhbmNlb2YgalF1ZXJ5KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbIC4uLihhbnkgYXMgTm9kZUxpc3QpXVxyXG4gICAgICAgIH1lbHNlIGlmKEFycmF5LmlzQXJyYXkoYW55KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhbnlcclxuICAgICAgICAgICAgLmZpbHRlcihlPT4gKHR5cGVvZiBlID09PSAnc3RyaW5nJykgfHwgZSBpbnN0YW5jZW9mIE5vZGUgKVxyXG4gICAgICAgICAgICAubWFwKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSA/IERvY09iamVjdC50b05vZGVBcnJheShlKVswXSA6IGUgKTtcclxuICAgICAgICB9IGVsc2UgaWYoYW55IGluc3RhbmNlb2YgTm9kZSB8fCBhbnkgaW5zdGFuY2VvZiBEb2N1bWVudCApe1xyXG4gICAgICAgICAgICByZXR1cm4gW2FueV1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIFtdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkZWZhdWx0UGFyYW1zKHtcclxuICAgICAgICByZW5kZXIgPSBbXSxcclxuICAgICAgICBiaW5kcyA9IHt9LFxyXG4gICAgICAgIGVsZW1lbnRzID0ge30sXHJcbiAgICAgICAgdmFsdWVzID0ge30sXHJcbiAgICAgICAgYmluZEF0dHIgPSAnZC1iaW5kJyxcclxuICAgICAgICBiaW5kSW5BdHRyID0gJ2QtYmluZC1pbicsXHJcbiAgICAgICAgaXNKUXVlcnkgPSBmYWxzZSxcclxuICAgICAgICBjb25uZWN0aW9ucyA9IFtdLFxyXG4gICAgICAgIHJlbW92ZU9ubG9hZCA9IGZhbHNlXHJcbiAgICB9ID0ge30pIDogRG9jT2JqZWN0T3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuICB7IGVsZW1lbnRzLCB2YWx1ZXMsIHJlbmRlciwgYmluZHMsIGJpbmRBdHRyLCBiaW5kSW5BdHRyLCBpc0pRdWVyeSwgY29ubmVjdGlvbnMsIHJlbW92ZU9ubG9hZCB9IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWZhdWx0UnVuQmluZE9wdGlvbnMoe1xyXG4gICAgICAgIHJvb3QsXHJcbiAgICAgICAgdmFsdWVDaGFuZ2VzLFxyXG4gICAgICAgIGFkZGl0aW9uYWxIb3N0cyA9IFtdXHJcbiAgICB9IDogRG9jT2JqZWN0UnVuQmluZE9wdGlvbnMgKSA6IERvY09iamVjdFJ1bkJpbmRPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4ge3Jvb3QsIHZhbHVlQ2hhbmdlcywgYWRkaXRpb25hbEhvc3RzfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIHJlYWRvbmx5IF92YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBlbGVtZW50cyA6IFByb3h5SGFuZGxlcjxEb2NPYmplY3RFbGVtZW50cz47XHJcbiAgICByb290IDogRG9jT2JqZWN0RWxlbWVudDtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIHF1ZXJ5IDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIF9xdWVyeVNlbGVjdCA6IChzZWxlY3RvcjpzdHJpbmcpPT4gTm9kZUxpc3QgfCBKUXVlcnk7XHJcbiAgICBfaXNKUXVlcnkgOiBib29sZWFuXHJcbiAgICBfY29ubmVjdGlvbnMgOiBBcnJheTxEb2NPYmplY3Q+XHJcbiAgICBnIDogRG9jR2VuXHJcbiAgICBvbkxvYWQ6ICgpPT52b2lkXHJcblxyXG4gICAgc2V0IHZhbHVlcyh2YWx1ZXMpIHtcclxuICAgICAgICB0aHJvdyBFcnJvcihcIlRyaWVkIHRvIHNldCBEb2NPYmplY3QudmFsdWUuIFRyeSBjcmVhdGluZyBhIGlubmVyIG9iamVjdCBpbnN0ZWFkLlwiKVxyXG4gICAgfVxyXG4gICAgZ2V0IHZhbHVlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHJvb3QgOiBEb2NPYmplY3RFbGVtZW50IHwgSlF1ZXJ5LCBvcHRpb25zIDogb2JqZWN0KSB7XHJcbiAgICAgICAgLy9BZGQgRGVmYXVsdCBQYXJhbWV0ZXJzIHRvIG9wdGlvbnNcclxuICAgICAgICBjb25zdCB7IGVsZW1lbnRzLCB2YWx1ZXMsIHJlbmRlciwgYmluZHMsIGJpbmRBdHRyLCBiaW5kSW5BdHRyLCBpc0pRdWVyeSwgY29ubmVjdGlvbnMsIHJlbW92ZU9ubG9hZCB9IDogRG9jT2JqZWN0T3B0aW9ucyA9IERvY09iamVjdC5kZWZhdWx0UGFyYW1zKG9wdGlvbnMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9FeHRyYWN0IERPTSBlbGVtZW50IGZyb20gSFRNTEVsZW1lbnQgT3IgSnF1ZXJ5IE9iamVjdFxyXG4gICAgICAgIGxldCByb290RWxlbWVudCA9IERvY09iamVjdC50b05vZGVBcnJheShyb290KVswXVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0XHJcbiAgICAgICAgaWYocm9vdEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApe1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QgPSByb290RWxlbWVudFxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBydW5FcnJvcihST09UX0VSUk9SLCB0cnVlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbnMgPSBjb25uZWN0aW9ucztcclxuXHJcbiAgICAgICAgLy9TZXQgSnF1ZXJ5XHJcbiAgICAgICAgaWYoaXNKUXVlcnkgJiYgd2luZG93LmpRdWVyeSl7XHJcbiAgICAgICAgICAgIC8vSWYgSnF1ZXJ5IGlzIGRldGVjdGVkIGFuZCBpcyBzZXQgdG8ganF1ZXJ5IG1vZGUuLi5cclxuICAgICAgICAgICAgdGhpcy5faXNKUXVlcnkgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy9TZXQgUXVlcnkgU2VsZWN0IHN0YXRlbWVudCB0byB1c2UgalF1ZXJ5XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiAkKHRoaXMucm9vdCkuZmluZCguLi5wcm9wcylcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIC8vSWYgSnF1ZXJ5IGlzIG5vdCBkZXRlY3RlZC4uLlxyXG4gICAgICAgICAgICBpZihpc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAvL0lmIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICAgICAgcnVuRXJyb3IoSlFVRVJZX05PVF9ERVRFQ1RFRCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9TZXQgUXVlcnkgU2VsZWN0IHN0YXRlbWVudCB0byB1c2UgSFRNTEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbFxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9xdWVyeVNlbGVjdCA9ICguLi5wcm9wcykgPT4gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoLi4ucHJvcHMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1NldCBSb290IE9iamVjdCB0byB0aGlzXHJcbiAgICAgICAgdGhpcy5yb290Ll9Eb2NPYmplY3QgPSB0aGlzO1xyXG5cclxuICAgICAgICAvL0FkZCBxdWVyeS1hYmxlIGF0dHJpYnV0ZSB0byByb290IGVsZW1lbnRcclxuICAgICAgICB0aGlzLnJvb3Quc2V0QXR0cmlidXRlKCdkb2Mtb2JqZWN0JywgJycpXHJcblxyXG4gICAgICAgIC8vU2V0IFJlbmRlciBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLnJlbmRlciA9IHJlbmRlcjtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgUmVsYXRlZCBEb2NHZW5cclxuICAgICAgICB0aGlzLmcgPSBuZXcgRG9jR2VuKHRoaXMpXHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgRnVuY3Rpb25zXHJcbiAgICAgICAgdGhpcy5iaW5kcyA9ICh0eXBlb2YgYmluZHMgPT09ICdmdW5jdGlvbicpID8gYmluZHModGhpcy5nKSA6IGJpbmRzIDtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBBdHRyaWJ1dGVcclxuICAgICAgICB0aGlzLmJpbmRBdHRyID0gYmluZEF0dHI7XHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgSW4gQXR0cmlidXRlXHJcbiAgICAgICAgdGhpcy5iaW5kSW5BdHRyID0gYmluZEluQXR0cjtcclxuICAgICAgICBcclxuICAgICAgICAvL1NldCBRdWVyeSBQcm94eVxyXG4gICAgICAgIHRoaXMucXVlcnkgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHByb3AgPT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICB0YXJnZXRbcHJvcF0gPyB0YXJnZXRbcHJvcF0gOiBfID0+IHRoaXMuX3F1ZXJ5U2VsZWN0KCAvLiooXFwufFxcI3xcXFt8XFxdKS4qL2dtLmV4ZWMocHJvcCkgPyBwcm9wIDogJyMnICsgcHJvcCApIFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHZhbHVlID0gKCkgPT4gdGhpcy5fcXVlcnlTZWxlY3QodmFsdWUpXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKXtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBfID0+IHZhbHVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL1NldCBFbGVtZW50cyBQcm94eVxyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBuZXcgUHJveHkodGhpcy5xdWVyeSwge1xyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3ApID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF0oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9BZGQgaW4gZWxlbWVudHMgZnJvbSBvcHRpb25zXHJcbiAgICAgICAgaWYgKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGVsZW1lbnRzKS5mb3JFYWNoKChlID0+IHsgdGhpcy5xdWVyeVtlWzBdXSA9IGVbMV0gfSkpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5fdmFsdWVzID0gbmV3IFByb3h5KCF2YWx1ZXMgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcgPyB7fSA6IHZhbHVlcywge1xyXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJ1blJlbmRlcih7IFtwcm9wXTogdmFsdWUgfSlcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnMoe1twcm9wXTp2YWx1ZX0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgXHJcbiAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9uTG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ydW5SZW5kZXIoey4uLnRoaXMudmFsdWVzLCBbdHJ1ZSBhcyBhbnldOiB0cnVlfSlcclxuICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh0aGlzLnZhbHVlcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFyZW1vdmVPbmxvYWQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLl9pc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMub25Mb2FkKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5vbmxvYWQgPSB0aGlzLm9uTG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNCaW5kSW4oZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSAmJiB0cnVlICkgXHJcbiAgICB9XHJcbiAgICBpc0JpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpICYmIHRydWVcclxuICAgIH1cclxuICAgIHN0YXRpYyBpc0RvYk9iamVjdEVsZW1lbnQoZWxlbWVudCA6IERvY09iamVjdEVsZW1lbnQgKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoIGVsZW1lbnQuX0RvY09iamVjdCBpbnN0YW5jZW9mIERvY09iamVjdCAgKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmaW5kT3JSZWdpc3RlckJpbmQoRE9NZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgICAgICBpZihET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGxldCBvcmlnaW5hbENoaWxkcmVuID0gWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc11cclxuICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbi50b1N0cmluZyA9ICgpPT4gRE9NZWxlbWVudC5pbm5lckhUTUxcclxuICAgICAgICAgICAgRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbixcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW5IVE1MOiBET01lbGVtZW50LmlubmVySFRNTCxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQXR0cmlidXRlczogWy4uLkRPTWVsZW1lbnQuYXR0cmlidXRlc10ucmVkdWNlKCAoYSxjKT0+e3JldHVybiB7Li4uYSwgW2MubmFtZV06Yy52YWx1ZX0gfSwge30gKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWdcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUJpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQsIGJpbmQsIGJvdW5kIDogRG9jT2JqZWN0SFRNTExpa2UpIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheSh0eXBlb2YgYm91bmQgPT09ICdmdW5jdGlvbicgPyBib3VuZCh0aGlzLmcpIDogYm91bmQpO1xyXG4gICAgICAgIGlmKHRoaXMuaXNCaW5kKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gbm9kZUFycmF5LmZpbmQoZWwgPT4gZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgYXMgRG9jT2JqZWN0RG9tQmluZDtcclxuICAgICAgICAgICAgZmlyc3RFbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoKGZpcnN0RWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnID8gJ3RvJyA6IHRoaXMuYmluZEF0dHIpLCBiaW5kKVxyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzKS5maWx0ZXIoYXR0QT0+IShbJ2QtYmluZC1pbicsICd0byddLmluY2x1ZGVzKGF0dEFbMF0pKSkuZm9yRWFjaChhdHRBPT5maXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dEFbMF0sIGF0dEFbMV0pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RFbGVtZW50O1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZUFycmF5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICBydW5SZW5kZXIodmFsdWVDaGFuZ2VzID0ge30pIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIuZmlsdGVyKHJlbiA9PiAocmVuLmRlcCAmJiBBcnJheS5pc0FycmF5KHJlbi5kZXApICYmIHJlbi5kZXAuc29tZSgoZGVwcCkgPT4gKGRlcHAgaW4gdmFsdWVDaGFuZ2VzKSkpIHx8IChyZW4uZGVwID09PSB1bmRlZmluZWQpKS5mb3JFYWNoKHJlbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZW4uY2xlYW4pIHJlbi5jbGVhbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgICAgIHJlbi5hY3Rpb24oeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIHRoaXMudmFsdWVzKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5ydW5CaW5kcyh7cm9vdDp0aGlzLnJvb3QsIHZhbHVlQ2hhbmdlcywgYWRkaXRpb25hbEhvc3RzOlt0aGlzLnJvb3RdfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QmluZEFjdGlvbihlbGVtZW50IDogSFRNTEVsZW1lbnQsIHZhbHVlQ2hhbmdlczogb2JqZWN0KSA6IFtzdHJpbmcsIChyZXBsYWNlIDogTm9kZSAmIE5vZGVMaXN0ICk9PiB2b2lkIF0gfCBudWxsIHtcclxuICAgICAgICBpZih0aGlzLmlzQmluZChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGlmKGVsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0ciksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfWVsc2UgaWYoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RvJyksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9ZWxzZSBpZih0aGlzLmlzQmluZEluKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRJbkF0dHIpLCAocmVwbGFjZSk9PntcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHJlcGxhY2UpIGVsZW1lbnQuYXBwZW5kQ2hpbGQobm9kZSk7XHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfWVsc2UgaWYoRG9jT2JqZWN0LmlzRG9iT2JqZWN0RWxlbWVudChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGlmKGVsZW1lbnQgPT09IHRoaXMucm9vdCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyd0aGlzJywgICAocmVwbGFjZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQgYXMgRG9jT2JqZWN0RWxlbWVudCkuX0RvY09iamVjdC5ydW5SZW5kZXIodmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwgPSAoc2VsZWN0b3IgOiBzdHJpbmcpID0+IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxyXG4gICAgcnVuQmluZHMocGFyYW1zOiBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHsgcm9vdCwgdmFsdWVDaGFuZ2VzLCBhZGRpdGlvbmFsSG9zdHMgfSA9IHRoaXMuZGVmYXVsdFJ1bkJpbmRPcHRpb25zKHBhcmFtcyk7XHJcbiAgICAgICAgKEFycmF5LmlzQXJyYXkocm9vdCkgPyByb290IDogW3Jvb3RdKVxyXG4gICAgICAgICAgICAuZmlsdGVyKHJ0ID0+IHJ0ICYmIHJ0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgWy4uLihydC5xdWVyeVNlbGVjdG9yQWxsKGBbJHt0aGlzLmJpbmRBdHRyfV0sIFske3RoaXMuYmluZEluQXR0cn1dLCBkLWJpbmRbdG9dLCBbZG9jLW9iamVjdF1gKSksIC4uLmFkZGl0aW9uYWxIb3N0c11cclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJpbmRJbnN0cnVjdGlvbnMgPSB0aGlzLmdldEJpbmRBY3Rpb24oZWxlbWVudCwgdmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZEluc3RydWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgVGhlIEJpbmQgTWV0aG9kLCBhbmQgdGhlIEZ1bmN0aW9uIHRvIGluc2VydCBIVE1MIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW2JpbmQsIGJpbmRBY3Rpb25dID0gYmluZEluc3RydWN0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgQmluZCBFeGlzdHMgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZCBpbiB0aGlzLmJpbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgT3IgcmVnaXN0ZXIgQmluZCBUYWcncyBDb25maWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmZpbmRPclJlZ2lzdGVyQmluZChlbGVtZW50KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0luc2VydCBIVE1MXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZEFjdGlvbih0aGlzLnJ1bkJpbmRzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogdGhpcy5nZW5lcmF0ZUJpbmQoICAvL1dyYXAgQmluZCBNZXRob2QgdG8gcHJlcGFyZSBiaW5kIGZvciBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1J1biBCaW5kIE1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kc1tiaW5kXShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlcywgLy9QYXNzIGluIHVwZGF0ZXMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm9yaWdpbmFsQXR0cmlidXRlcywgLy9QYXNzIGluIG9yaWdpbmFsIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxDaGlsZHJlbiwgLy9QYXNzIGluIG9yaWdpbmFsIGNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQ2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIHJvb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuQ29ubmVjdGlvbnModmFsdWVDaGFuZ2VzIDoge1trZXkgOiBzdHJpbmd8c3ltYm9sXSA6IGFueSB9ID0ge1t0cnVlIGFzIGFueV06dHJ1ZX0gKXtcclxuICAgICAgICBmb3IobGV0IGt5IGluIHZhbHVlQ2hhbmdlcyl7XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmZvckVhY2goKGNvbm5lY3RlZCkgPT4gY29ubmVjdGVkLnZhbHVlc1treV0gPSB2YWx1ZUNoYW5nZXNba3ldKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdCguLi5kb2NPYmplY3RzIDogW0RvY09iamVjdF0pe1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gWy4uLnRoaXMuX2Nvbm5lY3Rpb25zLCAuLi5kb2NPYmplY3RzXVxyXG4gICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnModGhpcy52YWx1ZXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8qXHJcbnZhciBkb2MgPSBuZXcgRG9jT2JqZWN0KHtcclxuICAgIHZhbHVlczoge1xyXG4gICAgfSxcclxuICAgIGVsZW1lbnRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgYmluZHM6e1xyXG5cclxuICAgIH0sXHJcbiAgICByZW5kZXI6IFtcclxuXHJcbiAgICBdXHJcbn0pOyAkKGRvYy5vbkxvYWQpXHJcbiovIiwiXHJcblxyXG5leHBvcnQgY29uc3QgUk9PVF9FUlJPUiA9ICdST09UX0VSUk9SJ1xyXG5leHBvcnQgY29uc3QgSlFVRVJZX05PVF9ERVRFQ1RFRCA9ICdKUVVFUllfTk9UX0RFVEVDVEVEJ1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bkVycm9yKGVycm9yIDogc3RyaW5nLCBmYWlsPWZhbHNlKXtcclxuICAgIGlmKGVycm9yIGluIEVSUk9SUyl7XHJcbiAgICAgICAgaWYoZmFpbCl7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdEb2NPYmplY3Q6ICcrIEVSUk9SU1tlcnJvcl0ubWVzc2FnZSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoRVJST1JTW2Vycm9yXS5tZXNzYWdlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgRVJST1JTID0ge1xyXG4gICAgUk9PVF9FUlJPUiA6IHtcclxuICAgICAgICBtZXNzYWdlOiBcIlJvb3QgRWxlbWVudCBNdXN0IGJlIGEgdmFsaWQgTm9kZSwgT3IgalF1ZXJ5IEVsZW1lbnRcIlxyXG4gICAgfSxcclxuICAgIEpRVUVSWV9OT1RfREVURUNURUQ6IHtcclxuICAgICAgICBtZXNzYWdlIDogXCJKUXVlcnkgaXMgbm90IGRldGVjdGVkLiBQbGVhc2UgbG9hZCBKUXVlcnkgYmVmb3JlIERvY09iamVjdFwiXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRG9jT2JqZWN0LCBEb2NPYmplY3RFbGVtZW50IH0gZnJvbSBcIi4vZG9jb2JqZWN0XCI7XHJcbmltcG9ydCBEb2NHZW4gZnJvbSBcIi4vZG9jZ2VuXCI7XHJcbmltcG9ydCB7c2V0Q3Vyc29yUG9zLCBnZXRDdXJzb3JQb3N9IGZyb20gXCIuL3V0aWxzXCJcclxuXHJcbmNsYXNzIEJpbmQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XHJcbiAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuYXBwZW5kKGRpdik7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuLyoqKioqKiogVVRJTElUWSBNRVRIT0RTICoqKioqKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaXhJbnB1dChzZWxlY3RvciwgYWN0aW9uKXtcclxuICAgIGxldCBwb3MgPSBnZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSlcclxuICAgIGFjdGlvbigpXHJcbiAgICBzZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSwgcG9zKVxyXG59XHJcblxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZC1iaW5kJywgQmluZClcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZG9jLW9iamVjdCcsIERvY09iamVjdEVsZW1lbnQpXHJcbmlmKHdpbmRvdy5qUXVlcnkpe1xyXG4gICAgKGZ1bmN0aW9uKCQpIHtcclxuICAgICAgICAkLmZuLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIERvY09iamVjdCA6IGZ1bmN0aW9uKCBvcHRpb25zID0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpc1swXS5fRG9jT2JqZWN0ICYmICFvcHRpb25zICkgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIHsgaXNKUXVlcnk6dHJ1ZSwgLi4ub3B0aW9ucyB9KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KShqUXVlcnkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb2JqKHJvb3QgOiBEb2NPYmplY3RFbGVtZW50IHwgSlF1ZXJ5LCBvcHRpb25zIDogb2JqZWN0KSA6IERvY09iamVjdHtcclxuICAgIHJldHVybiBuZXcgRG9jT2JqZWN0KHJvb3QsIG9wdGlvbnMpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW4oKSA6IERvY0dlbiB7XHJcbiAgICByZXR1cm4gbmV3IERvY0dlbigpXHJcbn1cclxuIiwiaW50ZXJmYWNlIERvY3VtZW50IHtcclxuICAgIHNlbGVjdGlvbjoge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yODk3MTU1L2dldC1jdXJzb3ItcG9zaXRpb24taW4tY2hhcmFjdGVycy13aXRoaW4tYS10ZXh0LWlucHV0LWZpZWxkXHJcbiBleHBvcnQgZnVuY3Rpb24gZ2V0Q3Vyc29yUG9zKGVsZW1lbnQgOiBIVE1MSW5wdXRFbGVtZW50KSA6IG51bWJlciB7XHJcbiAgICAvLyBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAvLyAgICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgLy8gICAgIHJldHVybiAgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtZWxlbWVudC52YWx1ZS5sZW5ndGgpO1xyXG4gICAgLy8gfVxyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnNlbGVjdGlvbkRpcmVjdGlvbiA9PSAnYmFja3dhcmQnID8gZWxlbWVudC5zZWxlY3Rpb25TdGFydCA6IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwOi8vYmxvZy52aXNoYWxvbi5uZXQvaW5kZXgucGhwL2phdmFzY3JpcHQtZ2V0dGluZy1hbmQtc2V0dGluZy1jYXJldC1wb3NpdGlvbi1pbi10ZXh0YXJlYS9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCwgcG9zIDogbnVtYmVyKSA6IHZvaWQge1xyXG4gICAgLy8gTW9kZXJuIGJyb3dzZXJzXHJcbiAgICBpZiAoZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICBcclxuICAgIC8vIElFOCBhbmQgYmVsb3dcclxuICAgIH0gZWxzZSBpZiAoKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UpIHtcclxuICAgICAgdmFyIHJhbmdlID0gKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UoKTtcclxuICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XHJcbiAgICAgIHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgcG9zKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0KCk7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvdHMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
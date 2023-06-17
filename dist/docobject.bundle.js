var Doc;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/docgen.ts":
/*!**************************!*\
  !*** ./src/ts/docgen.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
                const bound = this.obj.binds[prop].bind(this.obj)(this.obj.values, attrs, docobject_1.DocObject.toNodeArray(inner), this.obj.values);
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
                if (ine.parentElement && ine.parentElement.nodeName === 'D-BIND') {
                    element.appendChild(ine.cloneNode(true));
                }
                else {
                    element.appendChild(ine);
                }
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
    }
}
exports.DocObjectElement = DocObjectElement;
class DocObject {
    constructor(root, options) {
        this._this = this;
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
        this.attrs = DocObject.extractAttributes(this.root);
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
            },
            get: (target, prop) => {
                if (typeof target[prop] === 'function')
                    return target[prop](this.attrs);
                return target[prop];
            }
        });
        this.onLoad = () => {
            this.runRender(Object.assign(Object.assign({}, this.values), { [true]: true }));
            this.runConnections(this.values);
        };
        if (!removeOnload) {
            window.onload = this.onLoad;
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
    static extractAttributes(element) {
        return [...element.attributes].reduce((a, c) => { return Object.assign(Object.assign({}, a), { [(c.name).replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })]: c.value }); }, {});
    }
    defaultRunBindOptions({ root, valueChanges, additionalHosts = [], memoizedElements = [] }) {
        return { root, valueChanges, additionalHosts, memoizedElements };
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
            let originalChildren = this._isJQuery ? $([...DOMelement.childNodes]) : [...DOMelement.childNodes];
            originalChildren.toString = () => {
                return DOMelement.innerHTML;
            };
            DOMelement._DocObjectConfig = {
                originalChildren,
                originalChildrenHTML: DOMelement.innerHTML,
                originalAttributes: DocObject.extractAttributes(DOMelement)
            };
        }
        return DOMelement._DocObjectConfig;
    }
    generateBind(element, bind, bound) {
        const config = element._DocObjectConfig;
        const nodeArray = DocObject.toNodeArray(typeof bound === 'function' ? (bound.bind(this._this))(this.g) : bound);
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
        this.runBinds({ root: this.root, valueChanges, additionalHosts: [this.root], memoizedElements: [] });
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
        const { root, valueChanges, additionalHosts, memoizedElements } = this.defaultRunBindOptions(params);
        (Array.isArray(root) ? root : [root])
            .filter(rt => rt && rt instanceof HTMLElement)
            .forEach((rt) => {
            [...(rt.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}], d-bind[to], [doc-object]`)), ...additionalHosts]
                .forEach(element => {
                //Skip if this node has been bound down the recursion cycle
                if (memoizedElements.some(e => element.isSameNode(e)))
                    return;
                //Add to memoizedElements to be skipped in the future
                memoizedElements.push(element);
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
                            //Extract Bind and Use JavaScript's bind method to set this to DocObject
                            (this.binds[bind].bind(this._this))(this.values, //Pass in updates values
                            config.originalAttributes, //Pass in original attributes
                            config.originalChildren, //Pass in original children
                            valueChanges //Changes that triggered render (Including a parent's DocObject value changes)
                            )),
                            valueChanges,
                            memoizedElements
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


/***/ }),

/***/ "./src/ts/errors.ts":
/*!**************************!*\
  !*** ./src/ts/errors.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports) {


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
/***/ (function(__unused_webpack_module, exports) {


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxHQUFHLENBQUMsQ0FBQztRQUVwQyxnQkFBZ0I7S0FDZjtTQUFNLElBQUssT0FBZSxDQUFDLGVBQWUsRUFBRTtRQUMzQyxJQUFJLEtBQUssR0FBSSxPQUFlLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDL0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoQyxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBZEQsb0NBY0M7Ozs7Ozs7VUM5QkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0RvYy8uL3NyYy90cy9kb2NnZW4udHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2RvY29iamVjdC50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZXJyb3JzLnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9pbmRleC50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RvY09iamVjdCwgRG9jT2JqZWN0SFRNTExpa2V9IGZyb20gJy4vZG9jb2JqZWN0J1xyXG5pbXBvcnQgeyBEb2NPYmplY3RCaW5kQXR0cmlidXRlIH0gZnJvbSAnLi9kb2NiaW5kJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jR2VuIHtcclxuICAgIFxyXG4gICAgW2tleSA6IHN0cmluZ106IERvY09iamVjdCB8ICgoaW5uZXIgOiBEb2NPYmplY3RIVE1MTGlrZSB8IEFycmF5PHN0cmluZ3xOb2RlPiAsIGF0dHJzIDogRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSkgPT4gYW55KSB8IGFueTtcclxuICAgIG9iaiA6IERvY09iamVjdCBcclxuXHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKG9iaj8gOiBEb2NPYmplY3Qpe1xyXG4gICAgICAgIHRoaXMub2JqID0gb2JqXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XHJcbiAgICAgICAgICAgIGdldDoodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICByZXR1cm4gdGhpcy5HZW4ocHJvcCBhcyBzdHJpbmcpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIEdlbihwcm9wIDogc3RyaW5nKXtcclxuICAgICAgICByZXR1cm4gKGlubmVyIDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gPSBbXSAsIGF0dHJzIDogRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZih0aGlzLm9iaiAmJiBwcm9wIGluIHRoaXMub2JqLmJpbmRzKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kID0gdGhpcy5vYmouYmluZHNbcHJvcF0uYmluZCh0aGlzLm9iaikodGhpcy5vYmoudmFsdWVzLCBhdHRycywgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKSwgdGhpcy5vYmoudmFsdWVzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBib3VuZCA9PT0gJ2Z1bmN0aW9uJyA/IGJvdW5kKHRoaXMub2JqLmcpIDogYm91bmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHByb3ApXHJcbiAgICAgICAgICAgIGZvcihsZXQga2V5IGluIGF0dHJzKXtcclxuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgYXR0cnNba2V5XSA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHNrZXkgaW4gYXR0cnNba2V5IGFzIHN0cmluZ10pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3NrZXldID0gYXR0cnNba2V5XVtza2V5XVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihrZXkgaW4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSBhdHRyc1trZXldXHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKS5mb3JFYWNoKGluZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKGluZS5wYXJlbnRFbGVtZW50ICYmIGluZS5wYXJlbnRFbGVtZW50Lm5vZGVOYW1lID09PSAnRC1CSU5EJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbmUuY2xvbmVOb2RlKHRydWUpKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGluZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRG9jT2JqZWN0RG9tQmluZCwgRG9jT2JqZWN0QmluZCwgRG9jT2JqZWN0QmluZEdlbiwgRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSB9IGZyb20gJy4vZG9jYmluZCdcclxuaW1wb3J0IHsgRG9jT2JqZWN0UmVuZGVyIH0gZnJvbSAnLi9kb2NyZW5kZXInXHJcbmltcG9ydCAgRG9jR2VuICBmcm9tICcuL2RvY2dlbidcclxuaW1wb3J0IHJ1bkVycm9yLCB7IFxyXG4gICAgUk9PVF9FUlJPUixcclxuICAgIEpRVUVSWV9OT1RfREVURUNURURcclxufSBmcm9tICcuL2Vycm9ycyc7XHJcblxyXG4vKioqKioqKiBHTE9CQUxTICoqKioqKiovXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgICAgIGpRdWVyeTphbnk7XHJcbiAgICAgICAgbXNDcnlwdG86YW55O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuLyoqKioqKiogRE9DIE9CSkVDVCAqKioqKioqL1xyXG5leHBvcnQgdHlwZSBEb2NPYmplY3RIVE1MTGlrZSA9IFxyXG58IE5vZGVcclxufCBOb2RlTGlzdFxyXG58IEpRdWVyeSBcclxufCBOdW1iZXJcclxufCBzdHJpbmdcclxufCAoKGdlbjogRG9jR2VuKSA9PiBEb2NPYmplY3RIVE1MTGlrZSk7XHJcblxyXG5cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZCB8IERvY09iamVjdEJpbmRHZW47XHJcbiAgICBlbGVtZW50cyA6IHtba2V5OnN0cmluZ106IHN0cmluZ307XHJcbiAgICB2YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBiaW5kQXR0ciA6IHN0cmluZztcclxuICAgIGJpbmRJbkF0dHIgOiBzdHJpbmc7XHJcbiAgICBpc0pRdWVyeSA6IGJvb2xlYW47XHJcbiAgICBjb25uZWN0aW9ucyA6IEFycmF5PERvY09iamVjdD5cclxuICAgIHJlbW92ZU9ubG9hZCA6IGJvb2xlYW5cclxufVxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdFJ1bkJpbmRPcHRpb25zIHtcclxuICAgIHJvb3QgOiBhbnk7XHJcbiAgICB2YWx1ZUNoYW5nZXM6IG9iamVjdDtcclxuICAgIGFkZGl0aW9uYWxIb3N0cz8gOiBBcnJheTxIVE1MRWxlbWVudD5cclxuICAgIG1lbW9pemVkRWxlbWVudHMgOiAgQXJyYXk8RG9jT2JqZWN0RWxlbWVudHxEb2NPYmplY3REb21CaW5kPlxyXG59XHJcblxyXG4vLyBleHBvcnQgaW50ZXJmYWNlIERvY09iamVjdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbi8vICAgICBfRG9jT2JqZWN0PyA6IERvY09iamVjdFxyXG4vLyB9XHJcblxyXG5leHBvcnQgY2xhc3MgRG9jT2JqZWN0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIF9Eb2NPYmplY3Q/IDogRG9jT2JqZWN0XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICB9XHJcbn1cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RFbGVtZW50cyB7XHJcbiAgICBba2V5OiBzdHJpbmddIDogc3RyaW5nIHwgKChzZWxlY3RvciA6IHN0cmluZyApID0+IE5vZGVMaXN0fEpRdWVyeSlcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEb2NPYmplY3RDb25maWcge1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbjogQXJyYXk8Tm9kZT4gfCBKUXVlcnk8Q2hpbGROb2RlW10+O1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IHN0cmluZztcclxuICAgIG9yaWdpbmFsQXR0cmlidXRlczoge1trZXk6c3RyaW5nXSA6IHN0cmluZ307XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRG9jT2JqZWN0IHtcclxuXHJcbiAgICBzdGF0aWMgcGFyc2VyIDogRE9NUGFyc2VyID0gbmV3IERPTVBhcnNlcigpXHJcblxyXG4gICAgc3RhdGljIHRvTm9kZUFycmF5KGFueSA6IERvY09iamVjdEhUTUxMaWtlIHwgQXJyYXk8c3RyaW5nfE5vZGU+ICkgOiBBcnJheTxOb2RlPiB7XHJcbiAgICAgICAgaWYodHlwZW9mIGFueSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGFueSA9PT0gJ251bWJlcicpe1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLkRvY09iamVjdC5wYXJzZXIucGFyc2VGcm9tU3RyaW5nKGFueS50b1N0cmluZygpLCAndGV4dC9odG1sJykuYm9keS5jaGlsZE5vZGVzXVxyXG4gICAgICAgIH1lbHNlIGlmKE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGFueSkgfHwgKHdpbmRvdy5qUXVlcnkgJiYgYW55IGluc3RhbmNlb2YgalF1ZXJ5KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbIC4uLihhbnkgYXMgTm9kZUxpc3QpXVxyXG4gICAgICAgIH1lbHNlIGlmKEFycmF5LmlzQXJyYXkoYW55KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhbnlcclxuICAgICAgICAgICAgLmZpbHRlcihlPT4gKHR5cGVvZiBlID09PSAnc3RyaW5nJykgfHwgZSBpbnN0YW5jZW9mIE5vZGUgKVxyXG4gICAgICAgICAgICAubWFwKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSA/IERvY09iamVjdC50b05vZGVBcnJheShlKVswXSA6IGUgKTtcclxuICAgICAgICB9IGVsc2UgaWYoYW55IGluc3RhbmNlb2YgTm9kZSB8fCBhbnkgaW5zdGFuY2VvZiBEb2N1bWVudCApe1xyXG4gICAgICAgICAgICByZXR1cm4gW2FueV1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIFtdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkZWZhdWx0UGFyYW1zKHtcclxuICAgICAgICByZW5kZXIgPSBbXSxcclxuICAgICAgICBiaW5kcyA9IHt9LFxyXG4gICAgICAgIGVsZW1lbnRzID0ge30sXHJcbiAgICAgICAgdmFsdWVzID0ge30sXHJcbiAgICAgICAgYmluZEF0dHIgPSAnZC1iaW5kJyxcclxuICAgICAgICBiaW5kSW5BdHRyID0gJ2QtYmluZC1pbicsXHJcbiAgICAgICAgaXNKUXVlcnkgPSBmYWxzZSxcclxuICAgICAgICBjb25uZWN0aW9ucyA9IFtdLFxyXG4gICAgICAgIHJlbW92ZU9ubG9hZCA9IGZhbHNlXHJcbiAgICB9ID0ge30pIDogRG9jT2JqZWN0T3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuICB7IGVsZW1lbnRzLCB2YWx1ZXMsIHJlbmRlciwgYmluZHMsIGJpbmRBdHRyLCBiaW5kSW5BdHRyLCBpc0pRdWVyeSwgY29ubmVjdGlvbnMsIHJlbW92ZU9ubG9hZCB9IFxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBleHRyYWN0QXR0cmlidXRlcyhlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCl7XHJcbiAgICAgICAgcmV0dXJuIFsuLi5lbGVtZW50LmF0dHJpYnV0ZXNdLnJlZHVjZSggKGEsYyk9PntyZXR1cm4gey4uLmEsIFsoYy5uYW1lKS5yZXBsYWNlKC8tKFthLXpdKS9nLCBmdW5jdGlvbiAoZykgeyByZXR1cm4gZ1sxXS50b1VwcGVyQ2FzZSgpOyB9KV06Yy52YWx1ZX0gfSwge30gKVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWZhdWx0UnVuQmluZE9wdGlvbnMoe1xyXG4gICAgICAgIHJvb3QsXHJcbiAgICAgICAgdmFsdWVDaGFuZ2VzLFxyXG4gICAgICAgIGFkZGl0aW9uYWxIb3N0cyA9IFtdLFxyXG4gICAgICAgIG1lbW9pemVkRWxlbWVudHMgPSBbXVxyXG4gICAgfSA6IERvY09iamVjdFJ1bkJpbmRPcHRpb25zICkgOiBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuIHtyb290LCB2YWx1ZUNoYW5nZXMsIGFkZGl0aW9uYWxIb3N0cywgbWVtb2l6ZWRFbGVtZW50c31cclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICByZWFkb25seSBfdmFsdWVzIDogb2JqZWN0O1xyXG4gICAgZWxlbWVudHMgOiBQcm94eUhhbmRsZXI8RG9jT2JqZWN0RWxlbWVudHM+O1xyXG4gICAgcm9vdCA6IERvY09iamVjdEVsZW1lbnQ7XHJcbiAgICByZW5kZXIgOiBEb2NPYmplY3RSZW5kZXI7XHJcbiAgICBiaW5kcyA6IERvY09iamVjdEJpbmQ7XHJcbiAgICBiaW5kQXR0ciA6IHN0cmluZztcclxuICAgIGJpbmRJbkF0dHIgOiBzdHJpbmc7XHJcbiAgICBxdWVyeSA6IFByb3h5SGFuZGxlcjxEb2NPYmplY3RFbGVtZW50cz47XHJcbiAgICBfcXVlcnlTZWxlY3QgOiAoc2VsZWN0b3I6c3RyaW5nKT0+IE5vZGVMaXN0IHwgSlF1ZXJ5O1xyXG4gICAgX2lzSlF1ZXJ5IDogYm9vbGVhblxyXG4gICAgX2Nvbm5lY3Rpb25zIDogQXJyYXk8RG9jT2JqZWN0PlxyXG4gICAgYXR0cnMgOiBEb2NPYmplY3RCaW5kQXR0cmlidXRlXHJcbiAgICBnIDogRG9jR2VuXHJcbiAgICBfdGhpcyA6IGFueSA9IHRoaXM7XHJcbiAgICBvbkxvYWQ6ICgpPT52b2lkXHJcblxyXG4gICAgc2V0IHZhbHVlcyh2YWx1ZXMpIHtcclxuICAgICAgICB0aHJvdyBFcnJvcihcIlRyaWVkIHRvIHNldCBEb2NPYmplY3QudmFsdWUuIFRyeSBjcmVhdGluZyBhIGlubmVyIG9iamVjdCBpbnN0ZWFkLlwiKVxyXG4gICAgfVxyXG4gICAgZ2V0IHZhbHVlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHJvb3QgOiBEb2NPYmplY3RFbGVtZW50IHwgSlF1ZXJ5IHwgc3RyaW5nLCBvcHRpb25zIDogb2JqZWN0KSB7XHJcbiAgICAgICAgLy9BZGQgRGVmYXVsdCBQYXJhbWV0ZXJzIHRvIG9wdGlvbnNcclxuICAgICAgICBjb25zdCB7IGVsZW1lbnRzLCB2YWx1ZXMsIHJlbmRlciwgYmluZHMsIGJpbmRBdHRyLCBiaW5kSW5BdHRyLCBpc0pRdWVyeSwgY29ubmVjdGlvbnMsIHJlbW92ZU9ubG9hZCB9IDogRG9jT2JqZWN0T3B0aW9ucyA9IERvY09iamVjdC5kZWZhdWx0UGFyYW1zKG9wdGlvbnMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9FeHRyYWN0IERPTSBlbGVtZW50IGZyb20gSFRNTEVsZW1lbnQgT3IgSnF1ZXJ5IE9iamVjdFxyXG4gICAgICAgIGxldCByb290RWxlbWVudCA9IERvY09iamVjdC50b05vZGVBcnJheShyb290KVswXVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0XHJcbiAgICAgICAgaWYocm9vdEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApe1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QgPSByb290RWxlbWVudFxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBydW5FcnJvcihST09UX0VSUk9SLCB0cnVlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbnMgPSBjb25uZWN0aW9ucztcclxuXHJcbiAgICAgICAgLy9TZXQgSnF1ZXJ5XHJcbiAgICAgICAgaWYoaXNKUXVlcnkgJiYgd2luZG93LmpRdWVyeSl7XHJcbiAgICAgICAgICAgIC8vSWYgSnF1ZXJ5IGlzIGRldGVjdGVkIGFuZCBpcyBzZXQgdG8ganF1ZXJ5IG1vZGUuLi5cclxuICAgICAgICAgICAgdGhpcy5faXNKUXVlcnkgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy9TZXQgUXVlcnkgU2VsZWN0IHN0YXRlbWVudCB0byB1c2UgalF1ZXJ5XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiAkKHRoaXMucm9vdCkuZmluZCguLi5wcm9wcylcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIC8vSWYgSnF1ZXJ5IGlzIG5vdCBkZXRlY3RlZC4uLlxyXG4gICAgICAgICAgICBpZihpc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAvL0lmIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICAgICAgcnVuRXJyb3IoSlFVRVJZX05PVF9ERVRFQ1RFRCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9TZXQgUXVlcnkgU2VsZWN0IHN0YXRlbWVudCB0byB1c2UgSFRNTEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbFxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9xdWVyeVNlbGVjdCA9ICguLi5wcm9wcykgPT4gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoLi4ucHJvcHMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1NldCBSb290IE9iamVjdCB0byB0aGlzXHJcbiAgICAgICAgdGhpcy5yb290Ll9Eb2NPYmplY3QgPSB0aGlzO1xyXG5cclxuICAgICAgICAvL0FkZCBxdWVyeS1hYmxlIGF0dHJpYnV0ZSB0byByb290IGVsZW1lbnRcclxuICAgICAgICB0aGlzLnJvb3Quc2V0QXR0cmlidXRlKCdkb2Mtb2JqZWN0JywgJycpXHJcblxyXG4gICAgICAgIC8vU2V0IFJlbmRlciBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLnJlbmRlciA9IHJlbmRlcjtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgUmVsYXRlZCBEb2NHZW5cclxuICAgICAgICB0aGlzLmcgPSBuZXcgRG9jR2VuKHRoaXMpXHJcblxyXG4gICAgICAgIHRoaXMuYXR0cnMgPSBEb2NPYmplY3QuZXh0cmFjdEF0dHJpYnV0ZXMoIHRoaXMucm9vdCApXHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgRnVuY3Rpb25zXHJcbiAgICAgICAgdGhpcy5iaW5kcyA9ICh0eXBlb2YgYmluZHMgPT09ICdmdW5jdGlvbicpID8gYmluZHModGhpcy5nKSA6IGJpbmRzIDtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBBdHRyaWJ1dGVcclxuICAgICAgICB0aGlzLmJpbmRBdHRyID0gYmluZEF0dHI7XHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgSW4gQXR0cmlidXRlXHJcbiAgICAgICAgdGhpcy5iaW5kSW5BdHRyID0gYmluZEluQXR0cjtcclxuXHJcbiAgICAgICAgLy9TZXQgUXVlcnkgUHJveHlcclxuICAgICAgICB0aGlzLnF1ZXJ5ID0gbmV3IFByb3h5KHt9LCB7XHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCApID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wID09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAgdGFyZ2V0W3Byb3BdID8gdGFyZ2V0W3Byb3BdIDogXyA9PiB0aGlzLl9xdWVyeVNlbGVjdCggLy4qKFxcLnxcXCN8XFxbfFxcXSkuKi9nbS5leGVjKHByb3ApID8gcHJvcCA6ICcjJyArIHByb3AgKSBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB2YWx1ZSA9ICgpID0+IHRoaXMuX3F1ZXJ5U2VsZWN0KHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gXyA9PiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9TZXQgRWxlbWVudHMgUHJveHlcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0gbmV3IFByb3h5KHRoaXMucXVlcnksIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vQWRkIGluIGVsZW1lbnRzIGZyb20gb3B0aW9uc1xyXG4gICAgICAgIGlmIChlbGVtZW50cykge1xyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhlbGVtZW50cykuZm9yRWFjaCgoZSA9PiB7IHRoaXMucXVlcnlbZVswXV0gPSBlWzFdIH0pKVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3ZhbHVlcyA9IG5ldyBQcm94eSghdmFsdWVzIHx8IHR5cGVvZiB2YWx1ZXMgIT09ICdvYmplY3QnID8ge30gOiB2YWx1ZXMsIHtcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW5SZW5kZXIoeyBbcHJvcF06IHZhbHVlIH0pXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHtbcHJvcF06dmFsdWV9KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHRhcmdldFtwcm9wXSA9PT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdKHRoaXMuYXR0cnMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgIFxyXG4gICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vbkxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsuLi50aGlzLnZhbHVlcywgW3RydWUgYXMgYW55XTogdHJ1ZX0pXHJcbiAgICAgICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnModGhpcy52YWx1ZXMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighcmVtb3ZlT25sb2FkKXtcclxuICAgICAgICAgICAgd2luZG93Lm9ubG9hZCA9IHRoaXMub25Mb2FkXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNCaW5kSW4oZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSAmJiB0cnVlICkgXHJcbiAgICB9XHJcbiAgICBpc0JpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpICYmIHRydWVcclxuICAgIH1cclxuICAgIHN0YXRpYyBpc0RvYk9iamVjdEVsZW1lbnQoZWxlbWVudCA6IERvY09iamVjdEVsZW1lbnQgKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoIGVsZW1lbnQuX0RvY09iamVjdCBpbnN0YW5jZW9mIERvY09iamVjdCAgKVxyXG4gICAgfVxyXG4gICAgXHJcblxyXG5cclxuICAgIGZpbmRPclJlZ2lzdGVyQmluZChET01lbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBEb2NPYmplY3RDb25maWcge1xyXG4gICAgICAgIGlmKERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgbGV0IG9yaWdpbmFsQ2hpbGRyZW4gPSB0aGlzLl9pc0pRdWVyeSA/ICQoWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc10pIDogWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc11cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW4udG9TdHJpbmcgPSAoKT0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBET01lbGVtZW50LmlubmVySFRNTDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENoaWxkcmVuLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IERPTWVsZW1lbnQuaW5uZXJIVE1MLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxBdHRyaWJ1dGVzOiBEb2NPYmplY3QuZXh0cmFjdEF0dHJpYnV0ZXMoRE9NZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgIFxyXG4gICAgICAgIHJldHVybiBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWdcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUJpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQsIGJpbmQsIGJvdW5kIDogRG9jT2JqZWN0SFRNTExpa2UpIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheSh0eXBlb2YgYm91bmQgPT09ICdmdW5jdGlvbicgPyAoYm91bmQuYmluZCh0aGlzLl90aGlzKSkodGhpcy5nKSA6IGJvdW5kKTtcclxuICAgICAgICBpZih0aGlzLmlzQmluZChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IG5vZGVBcnJheS5maW5kKGVsID0+IGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIGFzIERvY09iamVjdERvbUJpbmQ7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKChmaXJzdEVsZW1lbnQubG9jYWxOYW1lID09PSAnZC1iaW5kJyA/ICd0bycgOiB0aGlzLmJpbmRBdHRyKSwgYmluZClcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoY29uZmlnLm9yaWdpbmFsQXR0cmlidXRlcykuZmlsdGVyKGF0dEE9PiEoWydkLWJpbmQtaW4nLCAndG8nXS5pbmNsdWRlcyhhdHRBWzBdKSkpLmZvckVhY2goYXR0QT0+Zmlyc3RFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRBWzBdLCBhdHRBWzFdKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0RWxlbWVudDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVBcnJheTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBydW5SZW5kZXIodmFsdWVDaGFuZ2VzID0ge30pIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIuZmlsdGVyKHJlbiA9PiAocmVuLmRlcCAmJiBBcnJheS5pc0FycmF5KHJlbi5kZXApICYmIHJlbi5kZXAuc29tZSgoZGVwcCkgPT4gKGRlcHAgaW4gdmFsdWVDaGFuZ2VzKSkpIHx8IChyZW4uZGVwID09PSB1bmRlZmluZWQpKS5mb3JFYWNoKHJlbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZW4uY2xlYW4pIHJlbi5jbGVhbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgICAgIHJlbi5hY3Rpb24oeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIHRoaXMudmFsdWVzKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5ydW5CaW5kcyh7cm9vdDp0aGlzLnJvb3QsIHZhbHVlQ2hhbmdlcywgYWRkaXRpb25hbEhvc3RzOlt0aGlzLnJvb3RdLCBtZW1vaXplZEVsZW1lbnRzOltdIH0pO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGdldEJpbmRBY3Rpb24oZWxlbWVudCA6IEhUTUxFbGVtZW50LCB2YWx1ZUNoYW5nZXM6IG9iamVjdCkgOiBbc3RyaW5nLCAocmVwbGFjZSA6IE5vZGUgfCBOb2RlTGlzdCB8IE5vZGVbXSApPT4gdm9pZCBdIHwgbnVsbCB7XHJcbiAgICAgICAgaWYodGhpcy5pc0JpbmQoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICBpZihlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpLCAocmVwbGFjZSk9PmVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocmVwbGFjZSBhcyBOb2RlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfWVsc2UgaWYoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RvJyksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlIGFzIE5vZGUsIGVsZW1lbnQpXVxyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1lbHNlIGlmKHRoaXMuaXNCaW5kSW4oZWxlbWVudCkpe1xyXG4gICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEluQXR0ciksIChyZXBsYWNlKT0+e1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSBhcyBOb2RlTGlzdCkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9ZWxzZSBpZihEb2NPYmplY3QuaXNEb2JPYmplY3RFbGVtZW50KGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgaWYoZWxlbWVudCA9PT0gdGhpcy5yb290ICl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyd0aGlzJywgICAocmVwbGFjZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSBhcyBOb2RlTGlzdCkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQgYXMgRG9jT2JqZWN0RWxlbWVudCkuX0RvY09iamVjdC5ydW5SZW5kZXIodmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwgPSAoc2VsZWN0b3IgOiBzdHJpbmcpID0+IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxyXG4gICAgcnVuQmluZHMocGFyYW1zOiBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHsgcm9vdCwgdmFsdWVDaGFuZ2VzLCBhZGRpdGlvbmFsSG9zdHMsIG1lbW9pemVkRWxlbWVudHMgfSA9IHRoaXMuZGVmYXVsdFJ1bkJpbmRPcHRpb25zKHBhcmFtcyk7XHJcbiAgICAgICAgKEFycmF5LmlzQXJyYXkocm9vdCkgPyByb290IDogW3Jvb3RdKVxyXG4gICAgICAgICAgICAuZmlsdGVyKHJ0ID0+IHJ0ICYmIHJ0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgWy4uLihydC5xdWVyeVNlbGVjdG9yQWxsKGBbJHt0aGlzLmJpbmRBdHRyfV0sIFske3RoaXMuYmluZEluQXR0cn1dLCBkLWJpbmRbdG9dLCBbZG9jLW9iamVjdF1gKSksIC4uLmFkZGl0aW9uYWxIb3N0c11cclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vU2tpcCBpZiB0aGlzIG5vZGUgaGFzIGJlZW4gYm91bmQgZG93biB0aGUgcmVjdXJzaW9uIGN5Y2xlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1lbW9pemVkRWxlbWVudHMuc29tZShlID0+IChlbGVtZW50IGFzIEhUTUxFbGVtZW50KS5pc1NhbWVOb2RlKGUpKSkgcmV0dXJuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0FkZCB0byBtZW1vaXplZEVsZW1lbnRzIHRvIGJlIHNraXBwZWQgaW4gdGhlIGZ1dHVyZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1vaXplZEVsZW1lbnRzLnB1c2goZWxlbWVudClcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJpbmRJbnN0cnVjdGlvbnMgPSB0aGlzLmdldEJpbmRBY3Rpb24oZWxlbWVudCwgdmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZEluc3RydWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgVGhlIEJpbmQgTWV0aG9kLCBhbmQgdGhlIEZ1bmN0aW9uIHRvIGluc2VydCBIVE1MIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW2JpbmQsIGJpbmRBY3Rpb25dID0gYmluZEluc3RydWN0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgQmluZCBFeGlzdHMgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZCBpbiB0aGlzLmJpbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgT3IgcmVnaXN0ZXIgQmluZCBUYWcncyBDb25maWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmZpbmRPclJlZ2lzdGVyQmluZChlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5zZXJ0IEhUTUxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5kQWN0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJ1bkJpbmRzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IHRoaXMuZ2VuZXJhdGVCaW5kKCAgLy9XcmFwIEJpbmQgTWV0aG9kIHRvIHByZXBhcmUgYmluZCBmb3IgZG9jdW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmQsICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9SdW4gQmluZCBNZXRob2RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0V4dHJhY3QgQmluZCBhbmQgVXNlIEphdmFTY3JpcHQncyBiaW5kIG1ldGhvZCB0byBzZXQgdGhpcyB0byBEb2NPYmplY3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5iaW5kc1tiaW5kXS5iaW5kKHRoaXMuX3RoaXMpKShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZXMsIC8vUGFzcyBpbiB1cGRhdGVzIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzLCAvL1Bhc3MgaW4gb3JpZ2luYWwgYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxDaGlsZHJlbiwgLy9QYXNzIGluIG9yaWdpbmFsIGNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQ2hhbmdlcyAvL0NoYW5nZXMgdGhhdCB0cmlnZ2VyZWQgcmVuZGVyIChJbmNsdWRpbmcgYSBwYXJlbnQncyBEb2NPYmplY3QgdmFsdWUgY2hhbmdlcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtb2l6ZWRFbGVtZW50c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiByb290O1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bkNvbm5lY3Rpb25zKHZhbHVlQ2hhbmdlcyA6IHtba2V5IDogc3RyaW5nfHN5bWJvbF0gOiBhbnkgfSA9IHtbdHJ1ZSBhcyBhbnldOnRydWV9ICl7XHJcbiAgICAgICAgZm9yKGxldCBreSBpbiB2YWx1ZUNoYW5nZXMpe1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9ucy5mb3JFYWNoKChjb25uZWN0ZWQpID0+IGNvbm5lY3RlZC52YWx1ZXNba3ldID0gdmFsdWVDaGFuZ2VzW2t5XSlcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3QoLi4uZG9jT2JqZWN0cyA6IFtEb2NPYmplY3RdKXtcclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IFsuLi50aGlzLl9jb25uZWN0aW9ucywgLi4uZG9jT2JqZWN0c11cclxuICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHRoaXMudmFsdWVzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG4iLCJcclxuXHJcbmV4cG9ydCBjb25zdCBST09UX0VSUk9SID0gJ1JPT1RfRVJST1InXHJcbmV4cG9ydCBjb25zdCBKUVVFUllfTk9UX0RFVEVDVEVEID0gJ0pRVUVSWV9OT1RfREVURUNURUQnXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcnVuRXJyb3IoZXJyb3IgOiBzdHJpbmcsIGZhaWw9ZmFsc2Upe1xyXG4gICAgaWYoZXJyb3IgaW4gRVJST1JTKXtcclxuICAgICAgICBpZihmYWlsKXtcclxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ0RvY09iamVjdDogJysgRVJST1JTW2Vycm9yXS5tZXNzYWdlKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihFUlJPUlNbZXJyb3JdLm1lc3NhZ2UpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBFUlJPUlMgPSB7XHJcbiAgICBST09UX0VSUk9SIDoge1xyXG4gICAgICAgIG1lc3NhZ2U6IFwiUm9vdCBFbGVtZW50IE11c3QgYmUgYSB2YWxpZCBOb2RlLCBPciBqUXVlcnkgRWxlbWVudFwiXHJcbiAgICB9LFxyXG4gICAgSlFVRVJZX05PVF9ERVRFQ1RFRDoge1xyXG4gICAgICAgIG1lc3NhZ2UgOiBcIkpRdWVyeSBpcyBub3QgZGV0ZWN0ZWQuIFBsZWFzZSBsb2FkIEpRdWVyeSBiZWZvcmUgRG9jT2JqZWN0XCJcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEb2NPYmplY3QsIERvY09iamVjdEVsZW1lbnQgfSBmcm9tIFwiLi9kb2NvYmplY3RcIjtcclxuaW1wb3J0IERvY0dlbiBmcm9tIFwiLi9kb2NnZW5cIjtcclxuaW1wb3J0IHtzZXRDdXJzb3JQb3MsIGdldEN1cnNvclBvc30gZnJvbSBcIi4vdXRpbHNcIlxyXG5cclxuY2xhc3MgQmluZCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcclxuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5hcHBlbmQoZGl2KTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcblxyXG4vKioqKioqKiBVVElMSVRZIE1FVEhPRFMgKioqKioqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpeElucHV0KHNlbGVjdG9yLCBhY3Rpb24pe1xyXG4gICAgbGV0IHBvcyA9IGdldEN1cnNvclBvcyhzZWxlY3RvcigpWzBdKVxyXG4gICAgYWN0aW9uKClcclxuICAgIHNldEN1cnNvclBvcyhzZWxlY3RvcigpWzBdLCBwb3MpXHJcbn1cclxuXHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkLWJpbmQnLCBCaW5kKVxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkb2Mtb2JqZWN0JywgRG9jT2JqZWN0RWxlbWVudClcclxuaWYod2luZG93LmpRdWVyeSl7XHJcbiAgICAoZnVuY3Rpb24oJCkge1xyXG4gICAgICAgICQuZm4uZXh0ZW5kKHtcclxuICAgICAgICAgICAgRG9jT2JqZWN0IDogZnVuY3Rpb24oIG9wdGlvbnMgPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzWzBdLl9Eb2NPYmplY3QgJiYgIW9wdGlvbnMgKSByZXR1cm4gdGhpc1swXS5fRG9jT2JqZWN0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEb2NPYmplY3QodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG5ldyBEb2NPYmplY3QodGhpcywgeyBpc0pRdWVyeTp0cnVlLCAuLi5vcHRpb25zIH0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1swXS5fRG9jT2JqZWN0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pKGpRdWVyeSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvYmoocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnMgOiBvYmplY3QpIDogRG9jT2JqZWN0IHtcclxuICAgIHJldHVybiBuZXcgRG9jT2JqZWN0KHJvb3QsIG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuKCkgOiBEb2NHZW4ge1xyXG4gICAgcmV0dXJuIG5ldyBEb2NHZW4oKVxyXG59XHJcbiIsImludGVyZmFjZSBEb2N1bWVudCB7XHJcbiAgICBzZWxlY3Rpb246IHtcclxuICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuLy8gQ3JlZGl0czogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjg5NzE1NS9nZXQtY3Vyc29yLXBvc2l0aW9uLWluLWNoYXJhY3RlcnMtd2l0aGluLWEtdGV4dC1pbnB1dC1maWVsZFxyXG4gZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCkgOiBudW1iZXIge1xyXG4gICAgLy8gaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xyXG4gICAgLy8gICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIC8vICAgICByZXR1cm4gIGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLWVsZW1lbnQudmFsdWUubGVuZ3RoKTtcclxuICAgIC8vIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudC5zZWxlY3Rpb25EaXJlY3Rpb24gPT0gJ2JhY2t3YXJkJyA/IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgOiBlbGVtZW50LnNlbGVjdGlvbkVuZDtcclxufVxyXG5cclxuLy8gQ3JlZGl0czogaHR0cDovL2Jsb2cudmlzaGFsb24ubmV0L2luZGV4LnBocC9qYXZhc2NyaXB0LWdldHRpbmctYW5kLXNldHRpbmctY2FyZXQtcG9zaXRpb24taW4tdGV4dGFyZWEvXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDdXJzb3JQb3MoZWxlbWVudCA6IEhUTUxJbnB1dEVsZW1lbnQsIHBvcyA6IG51bWJlcikgOiB2b2lkIHtcclxuICAgIC8vIE1vZGVybiBicm93c2Vyc1xyXG4gICAgaWYgKGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcclxuICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xyXG4gICAgXHJcbiAgICAvLyBJRTggYW5kIGJlbG93XHJcbiAgICB9IGVsc2UgaWYgKChlbGVtZW50IGFzIGFueSkuY3JlYXRlVGV4dFJhbmdlKSB7XHJcbiAgICAgIHZhciByYW5nZSA9IChlbGVtZW50IGFzIGFueSkuY3JlYXRlVGV4dFJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xyXG4gICAgICByYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBwb3MpO1xyXG4gICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdCgpO1xyXG4gICAgfVxyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3RzL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
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
function curry(f) {
    return function (a) {
        return function (b) {
            return f(a, b);
        };
    };
}


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
            originalChildren.toString = () => DOMelement.innerHTML;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXBDLGdCQUFnQjtLQUNmO1NBQU0sSUFBSyxPQUFlLENBQUMsZUFBZSxFQUFFO1FBQzNDLElBQUksS0FBSyxHQUFJLE9BQWUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMvQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFkRCxvQ0FjQzs7Ozs7OztVQzlCRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2RvY2dlbi50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jb2JqZWN0LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9lcnJvcnMudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2luZGV4LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy91dGlscy50cyIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RG9jT2JqZWN0LCBEb2NPYmplY3RIVE1MTGlrZX0gZnJvbSAnLi9kb2NvYmplY3QnXHJcbmltcG9ydCB7IERvY09iamVjdEJpbmRBdHRyaWJ1dGUgfSBmcm9tICcuL2RvY2JpbmQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2NHZW4ge1xyXG4gICAgXHJcbiAgICBvYmogPyA6IERvY09iamVjdCBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iob2JqPyA6IERvY09iamVjdCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vYmogPSBvYmpcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XHJcbiAgICAgICAgICAgIGdldDoodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICByZXR1cm4gdGhpcy5HZW4ocHJvcCBhcyBzdHJpbmcpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIEdlbihwcm9wIDogc3RyaW5nKXtcclxuICAgICAgICByZXR1cm4gKGlubmVyIDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gPSBbXSAsIGF0dHJzIDogRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZih0aGlzLm9iaiAmJiBwcm9wIGluIHRoaXMub2JqLmJpbmRzKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kID0gdGhpcy5vYmouYmluZHNbcHJvcF0odGhpcy5vYmoudmFsdWVzLCBhdHRycywgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKSwgdGhpcy5vYmoudmFsdWVzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBib3VuZCA9PT0gJ2Z1bmN0aW9uJyA/IGJvdW5kKHRoaXMub2JqLmcpIDogYm91bmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHByb3ApXHJcbiAgICAgICAgICAgIGZvcihsZXQga2V5IGluIGF0dHJzKXtcclxuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgYXR0cnNba2V5XSA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHNrZXkgaW4gYXR0cnNba2V5IGFzIHN0cmluZ10pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3NrZXldID0gYXR0cnNba2V5XVtza2V5XVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihrZXkgaW4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSBhdHRyc1trZXldXHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKS5mb3JFYWNoKGluZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGluZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjdXJyeShmKSB7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGEpIHtcclxuICAgICAgICBcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGIpIHtcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZihhLCBiKTtcclxuICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gIH0iLCJpbXBvcnQgeyBEb2NPYmplY3REb21CaW5kLCBEb2NPYmplY3RCaW5kLCBEb2NPYmplY3RCaW5kR2VuLCBEb2NPYmplY3RCaW5kQXR0cmlidXRlIH0gZnJvbSAnLi9kb2NiaW5kJ1xyXG5pbXBvcnQgeyBEb2NPYmplY3RSZW5kZXIgfSBmcm9tICcuL2RvY3JlbmRlcidcclxuaW1wb3J0ICBEb2NHZW4gIGZyb20gJy4vZG9jZ2VuJ1xyXG5pbXBvcnQgcnVuRXJyb3IsIHsgXHJcbiAgICBST09UX0VSUk9SLFxyXG4gICAgSlFVRVJZX05PVF9ERVRFQ1RFRFxyXG59IGZyb20gJy4vZXJyb3JzJztcclxuXHJcbi8qKioqKioqIEdMT0JBTFMgKioqKioqKi9cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICAgICAgalF1ZXJ5OmFueTtcclxuICAgICAgICBtc0NyeXB0bzphbnk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4vKioqKioqKiBET0MgT0JKRUNUICoqKioqKiovXHJcbmV4cG9ydCB0eXBlIERvY09iamVjdEhUTUxMaWtlID0gXHJcbnwgTm9kZVxyXG58IE5vZGVMaXN0XHJcbnwgSlF1ZXJ5IFxyXG58IE51bWJlclxyXG58IHN0cmluZ1xyXG58ICgoZ2VuOiBEb2NHZW4pID0+IERvY09iamVjdEhUTUxMaWtlKTtcclxuXHJcblxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdE9wdGlvbnMge1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kIHwgRG9jT2JqZWN0QmluZEdlbjtcclxuICAgIGVsZW1lbnRzIDoge1trZXk6c3RyaW5nXTogc3RyaW5nfTtcclxuICAgIHZhbHVlcyA6IG9iamVjdDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIGlzSlF1ZXJ5IDogYm9vbGVhbjtcclxuICAgIGNvbm5lY3Rpb25zIDogQXJyYXk8RG9jT2JqZWN0PlxyXG4gICAgcmVtb3ZlT25sb2FkIDogYm9vbGVhblxyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jT2JqZWN0UnVuQmluZE9wdGlvbnMge1xyXG4gICAgcm9vdCA6IGFueTtcclxuICAgIHZhbHVlQ2hhbmdlczogb2JqZWN0O1xyXG4gICAgYWRkaXRpb25hbEhvc3RzPyA6IEFycmF5PEhUTUxFbGVtZW50PlxyXG4gICAgbWVtb2l6ZWRFbGVtZW50cyA6ICBBcnJheTxEb2NPYmplY3RFbGVtZW50fERvY09iamVjdERvbUJpbmQ+XHJcbn1cclxuXHJcbi8vIGV4cG9ydCBpbnRlcmZhY2UgRG9jT2JqZWN0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuLy8gICAgIF9Eb2NPYmplY3Q/IDogRG9jT2JqZWN0XHJcbi8vIH1cclxuXHJcbmV4cG9ydCBjbGFzcyBEb2NPYmplY3RFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgX0RvY09iamVjdD8gOiBEb2NPYmplY3RcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgIH1cclxufVxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdEVsZW1lbnRzIHtcclxuICAgIFtrZXk6IHN0cmluZ10gOiBzdHJpbmcgfCAoKHNlbGVjdG9yIDogc3RyaW5nICkgPT4gTm9kZUxpc3R8SlF1ZXJ5KVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERvY09iamVjdENvbmZpZyB7XHJcbiAgICBvcmlnaW5hbENoaWxkcmVuOiBBcnJheTxOb2RlPiB8IEpRdWVyeTxDaGlsZE5vZGVbXT47XHJcbiAgICBvcmlnaW5hbENoaWxkcmVuSFRNTDogc3RyaW5nO1xyXG4gICAgb3JpZ2luYWxBdHRyaWJ1dGVzOiB7W2tleTpzdHJpbmddIDogc3RyaW5nfTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBEb2NPYmplY3Qge1xyXG5cclxuICAgIHN0YXRpYyBwYXJzZXIgOiBET01QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKClcclxuXHJcbiAgICBzdGF0aWMgdG9Ob2RlQXJyYXkoYW55IDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gKSA6IEFycmF5PE5vZGU+IHtcclxuICAgICAgICBpZih0eXBlb2YgYW55ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYW55ID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgIHJldHVybiBbLi4uRG9jT2JqZWN0LnBhcnNlci5wYXJzZUZyb21TdHJpbmcoYW55LnRvU3RyaW5nKCksICd0ZXh0L2h0bWwnKS5ib2R5LmNoaWxkTm9kZXNdXHJcbiAgICAgICAgfWVsc2UgaWYoTm9kZUxpc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYW55KSB8fCAod2luZG93LmpRdWVyeSAmJiBhbnkgaW5zdGFuY2VvZiBqUXVlcnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFsgLi4uKGFueSBhcyBOb2RlTGlzdCldXHJcbiAgICAgICAgfWVsc2UgaWYoQXJyYXkuaXNBcnJheShhbnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIGFueVxyXG4gICAgICAgICAgICAuZmlsdGVyKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSB8fCBlIGluc3RhbmNlb2YgTm9kZSApXHJcbiAgICAgICAgICAgIC5tYXAoZT0+ICh0eXBlb2YgZSA9PT0gJ3N0cmluZycpID8gRG9jT2JqZWN0LnRvTm9kZUFycmF5KGUpWzBdIDogZSApO1xyXG4gICAgICAgIH0gZWxzZSBpZihhbnkgaW5zdGFuY2VvZiBOb2RlIHx8IGFueSBpbnN0YW5jZW9mIERvY3VtZW50ICl7XHJcbiAgICAgICAgICAgIHJldHVybiBbYW55XVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gW11cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGRlZmF1bHRQYXJhbXMoe1xyXG4gICAgICAgIHJlbmRlciA9IFtdLFxyXG4gICAgICAgIGJpbmRzID0ge30sXHJcbiAgICAgICAgZWxlbWVudHMgPSB7fSxcclxuICAgICAgICB2YWx1ZXMgPSB7fSxcclxuICAgICAgICBiaW5kQXR0ciA9ICdkLWJpbmQnLFxyXG4gICAgICAgIGJpbmRJbkF0dHIgPSAnZC1iaW5kLWluJyxcclxuICAgICAgICBpc0pRdWVyeSA9IGZhbHNlLFxyXG4gICAgICAgIGNvbm5lY3Rpb25zID0gW10sXHJcbiAgICAgICAgcmVtb3ZlT25sb2FkID0gZmFsc2VcclxuICAgIH0gPSB7fSkgOiBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4gIHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gXHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGV4dHJhY3RBdHRyaWJ1dGVzKGVsZW1lbnQgOiBEb2NPYmplY3REb21CaW5kKXtcclxuICAgICAgICByZXR1cm4gWy4uLmVsZW1lbnQuYXR0cmlidXRlc10ucmVkdWNlKCAoYSxjKT0+e3JldHVybiB7Li4uYSwgWyhjLm5hbWUpLnJlcGxhY2UoLy0oW2Etel0pL2csIGZ1bmN0aW9uIChnKSB7IHJldHVybiBnWzFdLnRvVXBwZXJDYXNlKCk7IH0pXTpjLnZhbHVlfSB9LCB7fSApXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRlZmF1bHRSdW5CaW5kT3B0aW9ucyh7XHJcbiAgICAgICAgcm9vdCxcclxuICAgICAgICB2YWx1ZUNoYW5nZXMsXHJcbiAgICAgICAgYWRkaXRpb25hbEhvc3RzID0gW10sXHJcbiAgICAgICAgbWVtb2l6ZWRFbGVtZW50cyA9IFtdXHJcbiAgICB9IDogRG9jT2JqZWN0UnVuQmluZE9wdGlvbnMgKSA6IERvY09iamVjdFJ1bkJpbmRPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4ge3Jvb3QsIHZhbHVlQ2hhbmdlcywgYWRkaXRpb25hbEhvc3RzLCBtZW1vaXplZEVsZW1lbnRzfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIHJlYWRvbmx5IF92YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBlbGVtZW50cyA6IFByb3h5SGFuZGxlcjxEb2NPYmplY3RFbGVtZW50cz47XHJcbiAgICByb290IDogRG9jT2JqZWN0RWxlbWVudDtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIHF1ZXJ5IDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIF9xdWVyeVNlbGVjdCA6IChzZWxlY3RvcjpzdHJpbmcpPT4gTm9kZUxpc3QgfCBKUXVlcnk7XHJcbiAgICBfaXNKUXVlcnkgOiBib29sZWFuXHJcbiAgICBfY29ubmVjdGlvbnMgOiBBcnJheTxEb2NPYmplY3Q+XHJcbiAgICBhdHRycyA6IERvY09iamVjdEJpbmRBdHRyaWJ1dGVcclxuICAgIGcgOiBEb2NHZW5cclxuICAgIF90aGlzIDogYW55ID0gdGhpcztcclxuICAgIG9uTG9hZDogKCk9PnZvaWRcclxuXHJcbiAgICBzZXQgdmFsdWVzKHZhbHVlcykge1xyXG4gICAgICAgIHRocm93IEVycm9yKFwiVHJpZWQgdG8gc2V0IERvY09iamVjdC52YWx1ZS4gVHJ5IGNyZWF0aW5nIGEgaW5uZXIgb2JqZWN0IGluc3RlYWQuXCIpXHJcbiAgICB9XHJcbiAgICBnZXQgdmFsdWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnkgfCBzdHJpbmcsIG9wdGlvbnMgOiBvYmplY3QpIHtcclxuICAgICAgICAvL0FkZCBEZWZhdWx0IFBhcmFtZXRlcnMgdG8gb3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gOiBEb2NPYmplY3RPcHRpb25zID0gRG9jT2JqZWN0LmRlZmF1bHRQYXJhbXMob3B0aW9ucylcclxuICAgICAgICBcclxuICAgICAgICAvL0V4dHJhY3QgRE9NIGVsZW1lbnQgZnJvbSBIVE1MRWxlbWVudCBPciBKcXVlcnkgT2JqZWN0XHJcbiAgICAgICAgbGV0IHJvb3RFbGVtZW50ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KHJvb3QpWzBdXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUm9vdCBPYmplY3RcclxuICAgICAgICBpZihyb290RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHJvb3RFbGVtZW50XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJ1bkVycm9yKFJPT1RfRVJST1IsIHRydWUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IGNvbm5lY3Rpb25zO1xyXG5cclxuICAgICAgICAvL1NldCBKcXVlcnlcclxuICAgICAgICBpZihpc0pRdWVyeSAmJiB3aW5kb3cualF1ZXJ5KXtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgZGV0ZWN0ZWQgYW5kIGlzIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBqUXVlcnlcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnlTZWxlY3QgPSAoLi4ucHJvcHMpID0+ICQodGhpcy5yb290KS5maW5kKC4uLnByb3BzKVxyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgbm90IGRldGVjdGVkLi4uXHJcbiAgICAgICAgICAgIGlmKGlzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgIC8vSWYgc2V0IHRvIGpxdWVyeSBtb2RlLi4uXHJcbiAgICAgICAgICAgICAgICBydW5FcnJvcihKUVVFUllfTk9UX0RFVEVDVEVELCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBIVE1MRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsXHJcbiAgICAgICAgICAgIHRoaXMuX2lzSlF1ZXJ5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiB0aGlzLnJvb3QucXVlcnlTZWxlY3RvckFsbCguLi5wcm9wcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0IHRvIHRoaXNcclxuICAgICAgICB0aGlzLnJvb3QuX0RvY09iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vQWRkIHF1ZXJ5LWFibGUgYXR0cmlidXRlIHRvIHJvb3QgZWxlbWVudFxyXG4gICAgICAgIHRoaXMucm9vdC5zZXRBdHRyaWJ1dGUoJ2RvYy1vYmplY3QnLCAnJylcclxuXHJcbiAgICAgICAgLy9TZXQgUmVuZGVyIEZ1bmN0aW9uc1xyXG4gICAgICAgIHRoaXMucmVuZGVyID0gcmVuZGVyO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSBSZWxhdGVkIERvY0dlblxyXG4gICAgICAgIHRoaXMuZyA9IG5ldyBEb2NHZW4odGhpcylcclxuXHJcbiAgICAgICAgdGhpcy5hdHRycyA9IERvY09iamVjdC5leHRyYWN0QXR0cmlidXRlcyggdGhpcy5yb290IClcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLmJpbmRzID0gKHR5cGVvZiBiaW5kcyA9PT0gJ2Z1bmN0aW9uJykgPyBiaW5kcyh0aGlzLmcpIDogYmluZHMgO1xyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEF0dHJpYnV0ZVxyXG4gICAgICAgIHRoaXMuYmluZEF0dHIgPSBiaW5kQXR0cjtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBJbiBBdHRyaWJ1dGVcclxuICAgICAgICB0aGlzLmJpbmRJbkF0dHIgPSBiaW5kSW5BdHRyO1xyXG5cclxuICAgICAgICAvL1NldCBRdWVyeSBQcm94eVxyXG4gICAgICAgIHRoaXMucXVlcnkgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHByb3AgPT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICB0YXJnZXRbcHJvcF0gPyB0YXJnZXRbcHJvcF0gOiBfID0+IHRoaXMuX3F1ZXJ5U2VsZWN0KCAvLiooXFwufFxcI3xcXFt8XFxdKS4qL2dtLmV4ZWMocHJvcCkgPyBwcm9wIDogJyMnICsgcHJvcCApIFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHZhbHVlID0gKCkgPT4gdGhpcy5fcXVlcnlTZWxlY3QodmFsdWUpXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKXtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBfID0+IHZhbHVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL1NldCBFbGVtZW50cyBQcm94eVxyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBuZXcgUHJveHkodGhpcy5xdWVyeSwge1xyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3ApID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF0oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9BZGQgaW4gZWxlbWVudHMgZnJvbSBvcHRpb25zXHJcbiAgICAgICAgaWYgKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGVsZW1lbnRzKS5mb3JFYWNoKChlID0+IHsgdGhpcy5xdWVyeVtlWzBdXSA9IGVbMV0gfSkpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5fdmFsdWVzID0gbmV3IFByb3h5KCF2YWx1ZXMgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcgPyB7fSA6IHZhbHVlcywge1xyXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJ1blJlbmRlcih7IFtwcm9wXTogdmFsdWUgfSlcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnMoe1twcm9wXTp2YWx1ZX0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgdGFyZ2V0W3Byb3BdID09PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF0odGhpcy5hdHRycylcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgXHJcbiAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9uTG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ydW5SZW5kZXIoey4uLnRoaXMudmFsdWVzLCBbdHJ1ZSBhcyBhbnldOiB0cnVlfSlcclxuICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh0aGlzLnZhbHVlcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFyZW1vdmVPbmxvYWQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLl9pc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMub25Mb2FkKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5vbmxvYWQgPSB0aGlzLm9uTG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNCaW5kSW4oZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSAmJiB0cnVlICkgXHJcbiAgICB9XHJcbiAgICBpc0JpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpICYmIHRydWVcclxuICAgIH1cclxuICAgIHN0YXRpYyBpc0RvYk9iamVjdEVsZW1lbnQoZWxlbWVudCA6IERvY09iamVjdEVsZW1lbnQgKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoIGVsZW1lbnQuX0RvY09iamVjdCBpbnN0YW5jZW9mIERvY09iamVjdCAgKVxyXG4gICAgfVxyXG4gICAgXHJcblxyXG5cclxuICAgIGZpbmRPclJlZ2lzdGVyQmluZChET01lbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBEb2NPYmplY3RDb25maWcge1xyXG4gICAgICAgIGlmKERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgbGV0IG9yaWdpbmFsQ2hpbGRyZW4gPSB0aGlzLl9pc0pRdWVyeSA/ICQoWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc10pIDogWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc11cclxuICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbi50b1N0cmluZyA9ICgpPT4gRE9NZWxlbWVudC5pbm5lckhUTUxcclxuICAgICAgICAgICAgRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbixcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW5IVE1MOiBET01lbGVtZW50LmlubmVySFRNTCxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQXR0cmlidXRlczogRG9jT2JqZWN0LmV4dHJhY3RBdHRyaWJ1dGVzKERPTWVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZ1xyXG4gICAgfVxyXG5cclxuICAgIGdlbmVyYXRlQmluZChlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCwgYmluZCwgYm91bmQgOiBEb2NPYmplY3RIVE1MTGlrZSkgOiBEb2NPYmplY3REb21CaW5kIHwgTm9kZVtdIHtcclxuICAgICAgICBjb25zdCBjb25maWcgPSBlbGVtZW50Ll9Eb2NPYmplY3RDb25maWc7XHJcbiAgICAgICAgY29uc3Qgbm9kZUFycmF5ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KHR5cGVvZiBib3VuZCA9PT0gJ2Z1bmN0aW9uJyA/IChib3VuZC5iaW5kKHRoaXMuX3RoaXMpKSh0aGlzLmcpIDogYm91bmQpO1xyXG4gICAgICAgIGlmKHRoaXMuaXNCaW5kKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gbm9kZUFycmF5LmZpbmQoZWwgPT4gZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgYXMgRG9jT2JqZWN0RG9tQmluZDtcclxuICAgICAgICAgICAgZmlyc3RFbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoKGZpcnN0RWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnID8gJ3RvJyA6IHRoaXMuYmluZEF0dHIpLCBiaW5kKVxyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzKS5maWx0ZXIoYXR0QT0+IShbJ2QtYmluZC1pbicsICd0byddLmluY2x1ZGVzKGF0dEFbMF0pKSkuZm9yRWFjaChhdHRBPT5maXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dEFbMF0sIGF0dEFbMV0pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RFbGVtZW50O1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZUFycmF5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHJ1blJlbmRlcih2YWx1ZUNoYW5nZXMgPSB7fSkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbmRlci5maWx0ZXIocmVuID0+IChyZW4uZGVwICYmIEFycmF5LmlzQXJyYXkocmVuLmRlcCkgJiYgcmVuLmRlcC5zb21lKChkZXBwKSA9PiAoZGVwcCBpbiB2YWx1ZUNoYW5nZXMpKSkgfHwgKHJlbi5kZXAgPT09IHVuZGVmaW5lZCkpLmZvckVhY2gocmVuID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlbi5jbGVhbikgcmVuLmNsZWFuKHsgLi4udGhpcy52YWx1ZXMsIC4uLnZhbHVlQ2hhbmdlcyB9LCB0aGlzLnZhbHVlcylcclxuICAgICAgICAgICAgcmVuLmFjdGlvbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLnJ1bkJpbmRzKHtyb290OnRoaXMucm9vdCwgdmFsdWVDaGFuZ2VzLCBhZGRpdGlvbmFsSG9zdHM6W3RoaXMucm9vdF0sIG1lbW9pemVkRWxlbWVudHM6W10gfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QmluZEFjdGlvbihlbGVtZW50IDogSFRNTEVsZW1lbnQsIHZhbHVlQ2hhbmdlczogb2JqZWN0KSA6IFtzdHJpbmcsIChyZXBsYWNlIDogTm9kZSB8IE5vZGVMaXN0IHwgTm9kZVtdICk9PiB2b2lkIF0gfCBudWxsIHtcclxuICAgICAgICBpZih0aGlzLmlzQmluZChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGlmKGVsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0ciksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlIGFzIE5vZGUsIGVsZW1lbnQpXVxyXG4gICAgICAgICAgICB9ZWxzZSBpZihlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSgndG8nKSwgKHJlcGxhY2UpPT5lbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHJlcGxhY2UgYXMgTm9kZSwgZWxlbWVudCldXHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfWVsc2UgaWYodGhpcy5pc0JpbmRJbihlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSwgKHJlcGxhY2UpPT57XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiByZXBsYWNlIGFzIE5vZGVMaXN0KSBlbGVtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1lbHNlIGlmKERvY09iamVjdC5pc0RvYk9iamVjdEVsZW1lbnQoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICBpZihlbGVtZW50ID09PSB0aGlzLnJvb3QgKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbJ3RoaXMnLCAgIChyZXBsYWNlKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiByZXBsYWNlIGFzIE5vZGVMaXN0KSBlbGVtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAoZWxlbWVudCBhcyBEb2NPYmplY3RFbGVtZW50KS5fRG9jT2JqZWN0LnJ1blJlbmRlcih2YWx1ZUNoYW5nZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcXVlcnlTZWxlY3RvckFsbCA9IChzZWxlY3RvciA6IHN0cmluZykgPT4gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXHJcbiAgICBydW5CaW5kcyhwYXJhbXM6IERvY09iamVjdFJ1bkJpbmRPcHRpb25zKSB7XHJcbiAgICAgICAgY29uc3QgeyByb290LCB2YWx1ZUNoYW5nZXMsIGFkZGl0aW9uYWxIb3N0cywgbWVtb2l6ZWRFbGVtZW50cyB9ID0gdGhpcy5kZWZhdWx0UnVuQmluZE9wdGlvbnMocGFyYW1zKTtcclxuICAgICAgICAoQXJyYXkuaXNBcnJheShyb290KSA/IHJvb3QgOiBbcm9vdF0pXHJcbiAgICAgICAgICAgIC5maWx0ZXIocnQgPT4gcnQgJiYgcnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcclxuICAgICAgICAgICAgLmZvckVhY2goKHJ0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBbLi4uKHJ0LnF1ZXJ5U2VsZWN0b3JBbGwoYFske3RoaXMuYmluZEF0dHJ9XSwgWyR7dGhpcy5iaW5kSW5BdHRyfV0sIGQtYmluZFt0b10sIFtkb2Mtb2JqZWN0XWApKSwgLi4uYWRkaXRpb25hbEhvc3RzXVxyXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9Ta2lwIGlmIHRoaXMgbm9kZSBoYXMgYmVlbiBib3VuZCBkb3duIHRoZSByZWN1cnNpb24gY3ljbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYobWVtb2l6ZWRFbGVtZW50cy5zb21lKGUgPT4gKGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLmlzU2FtZU5vZGUoZSkpKSByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQWRkIHRvIG1lbW9pemVkRWxlbWVudHMgdG8gYmUgc2tpcHBlZCBpbiB0aGUgZnV0dXJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbW9pemVkRWxlbWVudHMucHVzaChlbGVtZW50KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmluZEluc3RydWN0aW9ucyA9IHRoaXMuZ2V0QmluZEFjdGlvbihlbGVtZW50LCB2YWx1ZUNoYW5nZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kSW5zdHJ1Y3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0dldCBUaGUgQmluZCBNZXRob2QsIGFuZCB0aGUgRnVuY3Rpb24gdG8gaW5zZXJ0IEhUTUwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbYmluZCwgYmluZEFjdGlvbl0gPSBiaW5kSW5zdHJ1Y3Rpb25zO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBpZiBCaW5kIEV4aXN0cyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kIGluIHRoaXMuYmluZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0dldCBPciByZWdpc3RlciBCaW5kIFRhZydzIENvbmZpZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZmluZE9yUmVnaXN0ZXJCaW5kKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9JbnNlcnQgSFRNTFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRBY3Rpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucnVuQmluZHMoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogdGhpcy5nZW5lcmF0ZUJpbmQoICAvL1dyYXAgQmluZCBNZXRob2QgdG8gcHJlcGFyZSBiaW5kIGZvciBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZCwgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1J1biBCaW5kIE1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vRXh0cmFjdCBCaW5kIGFuZCBVc2UgSmF2YVNjcmlwdCdzIGJpbmQgbWV0aG9kIHRvIHNldCB0aGlzIHRvIERvY09iamVjdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLmJpbmRzW2JpbmRdLmJpbmQodGhpcy5fdGhpcykpKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlcywgLy9QYXNzIGluIHVwZGF0ZXMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5vcmlnaW5hbEF0dHJpYnV0ZXMsIC8vUGFzcyBpbiBvcmlnaW5hbCBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5vcmlnaW5hbENoaWxkcmVuLCAvL1Bhc3MgaW4gb3JpZ2luYWwgY2hpbGRyZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VzIC8vQ2hhbmdlcyB0aGF0IHRyaWdnZXJlZCByZW5kZXIgKEluY2x1ZGluZyBhIHBhcmVudCdzIERvY09iamVjdCB2YWx1ZSBjaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUNoYW5nZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1vaXplZEVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIHJvb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuQ29ubmVjdGlvbnModmFsdWVDaGFuZ2VzIDoge1trZXkgOiBzdHJpbmd8c3ltYm9sXSA6IGFueSB9ID0ge1t0cnVlIGFzIGFueV06dHJ1ZX0gKXtcclxuICAgICAgICBmb3IobGV0IGt5IGluIHZhbHVlQ2hhbmdlcyl7XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmZvckVhY2goKGNvbm5lY3RlZCkgPT4gY29ubmVjdGVkLnZhbHVlc1treV0gPSB2YWx1ZUNoYW5nZXNba3ldKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdCguLi5kb2NPYmplY3RzIDogW0RvY09iamVjdF0pe1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gWy4uLnRoaXMuX2Nvbm5lY3Rpb25zLCAuLi5kb2NPYmplY3RzXVxyXG4gICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnModGhpcy52YWx1ZXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8qXHJcbnZhciBkb2MgPSBuZXcgRG9jT2JqZWN0KHtcclxuICAgIHZhbHVlczoge1xyXG4gICAgfSxcclxuICAgIGVsZW1lbnRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgYmluZHM6e1xyXG5cclxuICAgIH0sXHJcbiAgICByZW5kZXI6IFtcclxuXHJcbiAgICBdXHJcbn0pOyAkKGRvYy5vbkxvYWQpXHJcbiovIiwiXHJcblxyXG5leHBvcnQgY29uc3QgUk9PVF9FUlJPUiA9ICdST09UX0VSUk9SJ1xyXG5leHBvcnQgY29uc3QgSlFVRVJZX05PVF9ERVRFQ1RFRCA9ICdKUVVFUllfTk9UX0RFVEVDVEVEJ1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bkVycm9yKGVycm9yIDogc3RyaW5nLCBmYWlsPWZhbHNlKXtcclxuICAgIGlmKGVycm9yIGluIEVSUk9SUyl7XHJcbiAgICAgICAgaWYoZmFpbCl7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdEb2NPYmplY3Q6ICcrIEVSUk9SU1tlcnJvcl0ubWVzc2FnZSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoRVJST1JTW2Vycm9yXS5tZXNzYWdlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgRVJST1JTID0ge1xyXG4gICAgUk9PVF9FUlJPUiA6IHtcclxuICAgICAgICBtZXNzYWdlOiBcIlJvb3QgRWxlbWVudCBNdXN0IGJlIGEgdmFsaWQgTm9kZSwgT3IgalF1ZXJ5IEVsZW1lbnRcIlxyXG4gICAgfSxcclxuICAgIEpRVUVSWV9OT1RfREVURUNURUQ6IHtcclxuICAgICAgICBtZXNzYWdlIDogXCJKUXVlcnkgaXMgbm90IGRldGVjdGVkLiBQbGVhc2UgbG9hZCBKUXVlcnkgYmVmb3JlIERvY09iamVjdFwiXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRG9jT2JqZWN0LCBEb2NPYmplY3RFbGVtZW50IH0gZnJvbSBcIi4vZG9jb2JqZWN0XCI7XHJcbmltcG9ydCBEb2NHZW4gZnJvbSBcIi4vZG9jZ2VuXCI7XHJcbmltcG9ydCB7c2V0Q3Vyc29yUG9zLCBnZXRDdXJzb3JQb3N9IGZyb20gXCIuL3V0aWxzXCJcclxuXHJcbmNsYXNzIEJpbmQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XHJcbiAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QuYXBwZW5kKGRpdik7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuLyoqKioqKiogVVRJTElUWSBNRVRIT0RTICoqKioqKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaXhJbnB1dChzZWxlY3RvciwgYWN0aW9uKXtcclxuICAgIGxldCBwb3MgPSBnZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSlcclxuICAgIGFjdGlvbigpXHJcbiAgICBzZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSwgcG9zKVxyXG59XHJcblxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZC1iaW5kJywgQmluZClcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZG9jLW9iamVjdCcsIERvY09iamVjdEVsZW1lbnQpXHJcbmlmKHdpbmRvdy5qUXVlcnkpe1xyXG4gICAgKGZ1bmN0aW9uKCQpIHtcclxuICAgICAgICAkLmZuLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIERvY09iamVjdCA6IGZ1bmN0aW9uKCBvcHRpb25zID0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpc1swXS5fRG9jT2JqZWN0ICYmICFvcHRpb25zICkgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIHsgaXNKUXVlcnk6dHJ1ZSwgLi4ub3B0aW9ucyB9KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KShqUXVlcnkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb2JqKHJvb3QgOiBEb2NPYmplY3RFbGVtZW50IHwgSlF1ZXJ5LCBvcHRpb25zIDogb2JqZWN0KSA6IERvY09iamVjdCB7XHJcbiAgICByZXR1cm4gbmV3IERvY09iamVjdChyb290LCBvcHRpb25zKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbigpIDogRG9jR2VuIHtcclxuICAgIHJldHVybiBuZXcgRG9jR2VuKClcclxufVxyXG4iLCJpbnRlcmZhY2UgRG9jdW1lbnQge1xyXG4gICAgc2VsZWN0aW9uOiB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIENyZWRpdHM6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI4OTcxNTUvZ2V0LWN1cnNvci1wb3NpdGlvbi1pbi1jaGFyYWN0ZXJzLXdpdGhpbi1hLXRleHQtaW5wdXQtZmllbGRcclxuIGV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3JQb3MoZWxlbWVudCA6IEhUTUxJbnB1dEVsZW1lbnQpIDogbnVtYmVyIHtcclxuICAgIC8vIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcclxuICAgIC8vICAgICBlbGVtZW50LmZvY3VzKCk7XHJcbiAgICAvLyAgICAgcmV0dXJuICBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC1lbGVtZW50LnZhbHVlLmxlbmd0aCk7XHJcbiAgICAvLyB9XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuc2VsZWN0aW9uRGlyZWN0aW9uID09ICdiYWNrd2FyZCcgPyBlbGVtZW50LnNlbGVjdGlvblN0YXJ0IDogZWxlbWVudC5zZWxlY3Rpb25FbmQ7XHJcbn1cclxuXHJcbi8vIENyZWRpdHM6IGh0dHA6Ly9ibG9nLnZpc2hhbG9uLm5ldC9pbmRleC5waHAvamF2YXNjcmlwdC1nZXR0aW5nLWFuZC1zZXR0aW5nLWNhcmV0LXBvc2l0aW9uLWluLXRleHRhcmVhL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3Vyc29yUG9zKGVsZW1lbnQgOiBIVE1MSW5wdXRFbGVtZW50LCBwb3MgOiBudW1iZXIpIDogdm9pZCB7XHJcbiAgICAvLyBNb2Rlcm4gYnJvd3NlcnNcclxuICAgIGlmIChlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKSB7XHJcbiAgICBlbGVtZW50LmZvY3VzKCk7XHJcbiAgICBlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTtcclxuICAgIFxyXG4gICAgLy8gSUU4IGFuZCBiZWxvd1xyXG4gICAgfSBlbHNlIGlmICgoZWxlbWVudCBhcyBhbnkpLmNyZWF0ZVRleHRSYW5nZSkge1xyXG4gICAgICB2YXIgcmFuZ2UgPSAoZWxlbWVudCBhcyBhbnkpLmNyZWF0ZVRleHRSYW5nZSgpO1xyXG4gICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcclxuICAgICAgcmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgcG9zKTtcclxuICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBwb3MpO1xyXG4gICAgICByYW5nZS5zZWxlY3QoKTtcclxuICAgIH1cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy90cy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
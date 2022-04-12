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
                            //Extract Bind and Use JavaScript's bind method to set this to DocObject
                            (this.binds[bind].bind(this._this))(this.values, //Pass in updates values
                            config.originalAttributes, //Pass in original attributes
                            config.originalChildren, //Pass in original children
                            valueChanges //Changes that triggered render (Including a parent's DocObject value changes)
                            )),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jb2JqZWN0LmJ1bmRsZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsb0ZBQXdEO0FBR3hELE1BQXFCLE1BQU07SUFJdkIsWUFBWSxHQUFnQjtRQUV4QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUc7UUFFZCxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtZQUNuQixHQUFHLEVBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFHLEVBQUU7Z0JBQ25CLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFjLENBQUM7WUFDbEMsQ0FBQztTQUNKLENBQUM7SUFDTixDQUFDO0lBQ0QsR0FBRyxDQUFDLElBQWE7UUFDYixPQUFPLENBQUMsUUFBaUQsRUFBRSxFQUFHLEtBQThCLEVBQUUsRUFBRTtZQUM1RixJQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDO2dCQUNsQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7Z0JBQ3pHLE9BQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2xFO1lBQ0QsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDMUMsS0FBSSxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUM7Z0JBQ2pCLElBQUcsR0FBRyxLQUFLLE9BQU8sSUFBSSxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ2xELEtBQUksSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLEdBQWEsQ0FBQyxFQUFDO3dCQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQ3pDO2lCQUNKO3FCQUFNLElBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUM7b0JBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO2lCQUM1QjtxQkFBSTtvQkFDRCxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3hDO2FBQ0o7WUFDRCxxQkFBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO1lBQzVCLENBQUMsQ0FBQztZQUNGLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUF0Q0QsNEJBc0NDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2Q0QsNEZBQStCO0FBQy9CLHlGQUdrQjtBQTJDbEIsMERBQTBEO0FBQzFELDhCQUE4QjtBQUM5QixJQUFJO0FBRUosTUFBYSxnQkFBaUIsU0FBUSxXQUFXO0lBRTdDO1FBQ0ksS0FBSyxFQUFFO1FBQ1AsSUFBRyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBQztZQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7U0FDNUM7SUFDTCxDQUFDO0NBQ0o7QUFSRCw0Q0FRQztBQWFELE1BQWEsU0FBUztJQXlFbEIsWUFBWSxJQUFnQyxFQUFFLE9BQWdCO1FBWDlELFVBQUssR0FBUyxJQUFJLENBQUM7UUEyTW5CLHFCQUFnQixHQUFHLENBQUMsUUFBaUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUEvTDFFLG1DQUFtQztRQUNuQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsR0FBc0IsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFFMUosdURBQXVEO1FBQ3ZELElBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhELGlCQUFpQjtRQUNqQixJQUFHLFdBQVcsWUFBWSxXQUFXLEVBQUU7WUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXO1NBQzFCO2FBQUk7WUFDRCxvQkFBUSxFQUFDLG1CQUFVLEVBQUUsSUFBSSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFFaEMsWUFBWTtRQUNaLElBQUcsUUFBUSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUM7WUFDekIsb0RBQW9EO1lBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBRXRCLDBDQUEwQztZQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ2hFO2FBQUs7WUFDRiw4QkFBOEI7WUFDOUIsSUFBRyxRQUFRLEVBQUM7Z0JBQ1IsMEJBQTBCO2dCQUMxQixvQkFBUSxFQUFDLDRCQUFtQixFQUFFLEtBQUssQ0FBQzthQUN2QztZQUNELGdFQUFnRTtZQUNoRSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDekU7UUFFRCx5QkFBeUI7UUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBRTVCLDBDQUEwQztRQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO1FBRXhDLHNCQUFzQjtRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQix1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLGdCQUFNLENBQUMsSUFBSSxDQUFDO1FBRXpCLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixDQUFFLElBQUksQ0FBQyxJQUFJLENBQUU7UUFFckQsb0JBQW9CO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFFO1FBRXBFLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV6Qix1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFJN0IsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1lBQ3ZCLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUcsRUFBRTtnQkFDbkIsSUFBRyxPQUFPLElBQUksSUFBSSxRQUFRO29CQUN0QixPQUFRLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUUscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUU7WUFDNUgsQ0FBQztZQUNELEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUNuQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVE7b0JBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO2dCQUNyRSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBQztvQkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSztpQkFDNUI7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztTQUNKLENBQUM7UUFFRixvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2xDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDbEIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekIsQ0FBQztTQUNKLENBQUM7UUFFRiw4QkFBOEI7UUFDOUIsSUFBSSxRQUFRLEVBQUU7WUFDVixNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkU7UUFHRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDMUUsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUU7Z0JBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQztnQkFDbkMsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDbEIsSUFBRyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVO29CQUNqQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNuQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDdkIsQ0FBQztTQUNKLENBQUM7UUFLRixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtZQUNmLElBQUksQ0FBQyxTQUFTLGlDQUFLLElBQUksQ0FBQyxNQUFNLEtBQUUsQ0FBQyxJQUFXLENBQUMsRUFBRSxJQUFJLElBQUU7WUFDckQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BDLENBQUM7UUFFRCxJQUFHLENBQUMsWUFBWSxFQUFDO1lBQ2IsSUFBRyxJQUFJLENBQUMsU0FBUyxFQUFDO2dCQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ2pCO2lCQUFJO2dCQUNELE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU07YUFDOUI7U0FDSjtJQUVMLENBQUM7SUExTEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUE0QztRQUMzRCxJQUFHLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUM7WUFDbEQsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDNUY7YUFBSyxJQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLFlBQVksTUFBTSxDQUFDLEVBQUM7WUFDdkYsT0FBTyxDQUFFLEdBQUksR0FBZ0IsQ0FBQztTQUNqQzthQUFLLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBQztZQUN4QixPQUFPLEdBQUc7aUJBQ1QsTUFBTSxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBRTtpQkFDekQsR0FBRyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO1NBQ3hFO2FBQU0sSUFBRyxHQUFHLFlBQVksSUFBSSxJQUFJLEdBQUcsWUFBWSxRQUFRLEVBQUU7WUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQztTQUNmO2FBQUk7WUFDRCxPQUFPLEVBQUU7U0FDWjtJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQ2pCLE1BQU0sR0FBRyxFQUFFLEVBQ1gsS0FBSyxHQUFHLEVBQUUsRUFDVixRQUFRLEdBQUcsRUFBRSxFQUNiLE1BQU0sR0FBRyxFQUFFLEVBQ1gsUUFBUSxHQUFHLFFBQVEsRUFDbkIsVUFBVSxHQUFHLFdBQVcsRUFDeEIsUUFBUSxHQUFHLEtBQUssRUFDaEIsV0FBVyxHQUFHLEVBQUUsRUFDaEIsWUFBWSxHQUFHLEtBQUssRUFDdkIsR0FBRyxFQUFFO1FBQ0YsT0FBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFO0lBQzFHLENBQUM7SUFFRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBMEI7UUFDL0MsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxHQUFDLHVDQUFXLENBQUMsS0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxLQUFLLElBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFFO0lBQzlKLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxFQUNsQixJQUFJLEVBQ0osWUFBWSxFQUNaLGVBQWUsR0FBRyxFQUFFLEVBQ0c7UUFDdkIsT0FBTyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFDO0lBQ2hELENBQUM7SUFxQkQsSUFBSSxNQUFNLENBQUMsTUFBTTtRQUNiLE1BQU0sS0FBSyxDQUFDLG9FQUFvRSxDQUFDO0lBQ3JGLENBQUM7SUFDRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQTBIRCxRQUFRLENBQUMsT0FBMEI7UUFDL0IsT0FBTyxDQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBRTtJQUM1RCxDQUFDO0lBQ0QsTUFBTSxDQUFDLE9BQTBCO1FBQzdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUk7SUFDMUYsQ0FBQztJQUNELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUEwQjtRQUNoRCxPQUFPLENBQUUsT0FBTyxDQUFDLFVBQVUsWUFBWSxTQUFTLENBQUc7SUFDdkQsQ0FBQztJQUlELGtCQUFrQixDQUFDLFVBQTZCO1FBQzVDLElBQUcsVUFBVSxDQUFDLGdCQUFnQixLQUFLLFNBQVMsRUFBQztZQUN6QyxJQUFJLGdCQUFnQixHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO1lBQ2pELGdCQUFnQixDQUFDLFFBQVEsR0FBRyxHQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUztZQUNyRCxVQUFVLENBQUMsZ0JBQWdCLEdBQUc7Z0JBQzFCLGdCQUFnQjtnQkFDaEIsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLFNBQVM7Z0JBQzFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7YUFDOUQ7U0FDSjtRQUNELE9BQU8sVUFBVSxDQUFDLGdCQUFnQjtJQUN0QyxDQUFDO0lBRUQsWUFBWSxDQUFDLE9BQTBCLEVBQUUsSUFBSSxFQUFFLEtBQXlCO1FBQ3BFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUN4QyxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEgsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFDO1lBQ3BCLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksV0FBVyxDQUFxQixDQUFDO1lBQ3pGLFlBQVksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7WUFDdkMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDN0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFFLEVBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUUsYUFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0osT0FBTyxZQUFZLENBQUM7U0FDdkI7YUFBSTtZQUNELE9BQU8sU0FBUyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQztJQUlELFNBQVMsQ0FBQyxZQUFZLEdBQUcsRUFBRTtRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN0SixJQUFJLEdBQUcsQ0FBQyxLQUFLO2dCQUFFLEdBQUcsQ0FBQyxLQUFLLGlDQUFNLElBQUksQ0FBQyxNQUFNLEdBQUssWUFBWSxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUUsR0FBRyxDQUFDLE1BQU0saUNBQU0sSUFBSSxDQUFDLE1BQU0sR0FBSyxZQUFZLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNoRSxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELGFBQWEsQ0FBQyxPQUFxQixFQUFFLFlBQW9CO1FBQ3JELElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBQztZQUNwQixJQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDO2dCQUNuQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUMsRUFBRSxRQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDckg7aUJBQUssSUFBRyxPQUFPLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFBQztnQkFDcEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUMsRUFBRSxRQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDNUc7U0FDSjthQUFLLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQztZQUM1QixPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUMsRUFBRTtvQkFDdEQsT0FBTyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7b0JBQ3ZCLEtBQUssSUFBSSxJQUFJLElBQUksT0FBbUI7d0JBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEUsQ0FBQyxDQUFDO1NBQ0w7YUFBSyxJQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBQztZQUMzQyxJQUFHLE9BQU8sS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUN0QixPQUFPLENBQUMsTUFBTSxFQUFJLENBQUMsT0FBTyxFQUFDLEVBQUU7d0JBQ3pCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO3dCQUN2QixLQUFLLElBQUksSUFBSSxJQUFJLE9BQW1COzRCQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BFLENBQUMsQ0FBQzthQUNMO2lCQUFJO2dCQUNBLE9BQTRCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUM7Z0JBQ2hFLE9BQU8sSUFBSTthQUNkO1NBQ0o7SUFDTCxDQUFDO0lBRUQsUUFBUSxDQUFDLE1BQStCO1FBQ3BDLE1BQU0sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNoQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxZQUFZLFdBQVcsQ0FBQzthQUM3QyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUNaLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLE9BQU8sSUFBSSxDQUFDLFVBQVUsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLEdBQUcsZUFBZSxDQUFDO2lCQUMvRyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBRWYsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUM7Z0JBQ2xFLElBQUksZ0JBQWdCLEVBQUU7b0JBQ2xCLHVEQUF1RDtvQkFDdkQsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztvQkFDNUMsdUJBQXVCO29CQUN2QixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNwQixtQ0FBbUM7d0JBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7d0JBRS9DLGFBQWE7d0JBQ2IsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7NEJBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFHLCtDQUErQzs0QkFDckUsT0FBTyxFQUNQLElBQUk7NEJBQ0osaUJBQWlCOzRCQUNqQix3RUFBd0U7NEJBQ3hFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUUsd0JBQXdCOzRCQUNyQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsNkJBQTZCOzRCQUN4RCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsMkJBQTJCOzRCQUNwRCxZQUFZLENBQUMsOEVBQThFOzZCQUM5RixDQUNKOzRCQUNELFlBQVk7eUJBQ2YsQ0FBQyxDQUNELENBQUM7cUJBQ0w7aUJBQ0o7WUFDTCxDQUFDLENBQUM7UUFDVixDQUFDLENBQUM7UUFDTixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsY0FBYyxDQUFDLGVBQWdELEVBQUMsQ0FBQyxJQUFXLENBQUMsRUFBQyxJQUFJLEVBQUM7UUFDL0UsS0FBSSxJQUFJLEVBQUUsSUFBSSxZQUFZLEVBQUM7WUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3BGO0lBRUwsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLFVBQXdCO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxVQUFVLENBQUM7UUFDekQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQzs7QUE5VEwsOEJBK1RDO0FBN1RVLGdCQUFNLEdBQWUsSUFBSSxTQUFTLEVBQUU7QUFpVS9DOzs7Ozs7Ozs7Ozs7OztFQWNFOzs7Ozs7Ozs7Ozs7OztBQ3paVyxrQkFBVSxHQUFHLFlBQVk7QUFDekIsMkJBQW1CLEdBQUcscUJBQXFCO0FBR3hELFNBQXdCLFFBQVEsQ0FBQyxLQUFjLEVBQUUsSUFBSSxHQUFDLEtBQUs7SUFDdkQsSUFBRyxLQUFLLElBQUksTUFBTSxFQUFDO1FBQ2YsSUFBRyxJQUFJLEVBQUM7WUFDSixNQUFNLEtBQUssQ0FBQyxhQUFhLEdBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3JEO2FBQUk7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUM7U0FDdkM7S0FDSjtBQUNMLENBQUM7QUFSRCw4QkFRQztBQUVELE1BQU0sTUFBTSxHQUFHO0lBQ1gsVUFBVSxFQUFHO1FBQ1QsT0FBTyxFQUFFLHNEQUFzRDtLQUNsRTtJQUNELG1CQUFtQixFQUFFO1FBQ2pCLE9BQU8sRUFBRyw2REFBNkQ7S0FDMUU7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2QkQsb0ZBQTBEO0FBQzFELDRGQUE4QjtBQUM5Qix3RUFBa0Q7QUFFbEQsTUFBTSxJQUFLLFNBQVEsV0FBVztJQUMxQjtRQUNJLEtBQUssRUFBRTtRQUNQLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUFJRCxpQ0FBaUM7QUFDakMsU0FBZ0IsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNO0lBQ3JDLElBQUksR0FBRyxHQUFHLHdCQUFZLEVBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckMsTUFBTSxFQUFFO0lBQ1Isd0JBQVksRUFBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDcEMsQ0FBQztBQUpELDRCQUlDO0FBR0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztBQUM1QyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsNEJBQWdCLENBQUM7QUFDNUQsSUFBRyxNQUFNLENBQUMsTUFBTSxFQUFDO0lBQ2IsQ0FBQyxVQUFTLENBQUM7UUFDUCxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNSLFNBQVMsRUFBRyxVQUFVLE9BQU8sR0FBRyxJQUFJO2dCQUNoQyxJQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPO29CQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztnQkFDOUQsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDTixJQUFJLHFCQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLHFCQUFTLENBQUMsSUFBSSxrQkFBSSxRQUFRLEVBQUMsSUFBSSxJQUFLLE9BQU8sRUFBRztnQkFDbEQsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQzlCLENBQUM7U0FDSixDQUFDO0lBQ04sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDZDtBQUVELFNBQWdCLEdBQUcsQ0FBQyxJQUFnQyxFQUFFLE9BQWdCO0lBQ2xFLE9BQU8sSUFBSSxxQkFBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBRkQsa0JBRUM7QUFFRCxTQUFnQixHQUFHO0lBQ2YsT0FBTyxJQUFJLGdCQUFNLEVBQUU7QUFDdkIsQ0FBQztBQUZELGtCQUVDOzs7Ozs7Ozs7Ozs7OztBQ3pDRCxtSEFBbUg7QUFDbEgsU0FBZ0IsWUFBWSxDQUFDLE9BQTBCO0lBQ3BELDRCQUE0QjtJQUM1Qix1QkFBdUI7SUFDdkIsOEZBQThGO0lBQzlGLElBQUk7SUFDQSxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFDeEcsQ0FBQztBQU5BLG9DQU1BO0FBRUQseUdBQXlHO0FBQ3pHLFNBQWdCLFlBQVksQ0FBQyxPQUEwQixFQUFFLEdBQVk7SUFDakUsa0JBQWtCO0lBQ2xCLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO1FBQy9CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXBDLGdCQUFnQjtLQUNmO1NBQU0sSUFBSyxPQUFlLENBQUMsZUFBZSxFQUFFO1FBQzNDLElBQUksS0FBSyxHQUFJLE9BQWUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMvQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFkRCxvQ0FjQzs7Ozs7OztVQzlCRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2RvY2dlbi50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jb2JqZWN0LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9lcnJvcnMudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2luZGV4LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy91dGlscy50cyIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RG9jT2JqZWN0LCBEb2NPYmplY3RIVE1MTGlrZX0gZnJvbSAnLi9kb2NvYmplY3QnXHJcbmltcG9ydCB7IERvY09iamVjdEJpbmRBdHRyaWJ1dGUgfSBmcm9tICcuL2RvY2JpbmQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2NHZW4ge1xyXG4gICAgXHJcbiAgICBvYmogPyA6IERvY09iamVjdCBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iob2JqPyA6IERvY09iamVjdCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vYmogPSBvYmpcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XHJcbiAgICAgICAgICAgIGdldDoodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICByZXR1cm4gdGhpcy5HZW4ocHJvcCBhcyBzdHJpbmcpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIEdlbihwcm9wIDogc3RyaW5nKXtcclxuICAgICAgICByZXR1cm4gKGlubmVyIDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gPSBbXSAsIGF0dHJzIDogRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZih0aGlzLm9iaiAmJiBwcm9wIGluIHRoaXMub2JqLmJpbmRzKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kID0gdGhpcy5vYmouYmluZHNbcHJvcF0odGhpcy5vYmoudmFsdWVzLCBhdHRycywgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKSwgdGhpcy5vYmoudmFsdWVzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBib3VuZCA9PT0gJ2Z1bmN0aW9uJyA/IGJvdW5kKHRoaXMub2JqLmcpIDogYm91bmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHByb3ApXHJcbiAgICAgICAgICAgIGZvcihsZXQga2V5IGluIGF0dHJzKXtcclxuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgYXR0cnNba2V5XSA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHNrZXkgaW4gYXR0cnNba2V5IGFzIHN0cmluZ10pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3NrZXldID0gYXR0cnNba2V5XVtza2V5XVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihrZXkgaW4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50W2tleV0gPSBhdHRyc1trZXldXHJcbiAgICAgICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKS5mb3JFYWNoKGluZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGluZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRG9jT2JqZWN0RG9tQmluZCwgRG9jT2JqZWN0QmluZCwgRG9jT2JqZWN0QmluZEdlbiwgRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSB9IGZyb20gJy4vZG9jYmluZCdcclxuaW1wb3J0IHsgRG9jT2JqZWN0UmVuZGVyIH0gZnJvbSAnLi9kb2NyZW5kZXInXHJcbmltcG9ydCAgRG9jR2VuICBmcm9tICcuL2RvY2dlbidcclxuaW1wb3J0IHJ1bkVycm9yLCB7IFxyXG4gICAgUk9PVF9FUlJPUixcclxuICAgIEpRVUVSWV9OT1RfREVURUNURURcclxufSBmcm9tICcuL2Vycm9ycyc7XHJcblxyXG4vKioqKioqKiBHTE9CQUxTICoqKioqKiovXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgICAgIGpRdWVyeTphbnk7XHJcbiAgICAgICAgbXNDcnlwdG86YW55O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuLyoqKioqKiogRE9DIE9CSkVDVCAqKioqKioqL1xyXG5leHBvcnQgdHlwZSBEb2NPYmplY3RIVE1MTGlrZSA9IFxyXG58IE5vZGVcclxufCBOb2RlTGlzdFxyXG58IEpRdWVyeSBcclxufCBOdW1iZXJcclxufCBzdHJpbmdcclxufCAoKGdlbjogRG9jR2VuKSA9PiBEb2NPYmplY3RIVE1MTGlrZSk7XHJcblxyXG5cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZCB8IERvY09iamVjdEJpbmRHZW47XHJcbiAgICBlbGVtZW50cyA6IHtba2V5OnN0cmluZ106IHN0cmluZ307XHJcbiAgICB2YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBiaW5kQXR0ciA6IHN0cmluZztcclxuICAgIGJpbmRJbkF0dHIgOiBzdHJpbmc7XHJcbiAgICBpc0pRdWVyeSA6IGJvb2xlYW47XHJcbiAgICBjb25uZWN0aW9ucyA6IEFycmF5PERvY09iamVjdD5cclxuICAgIHJlbW92ZU9ubG9hZCA6IGJvb2xlYW5cclxufVxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdFJ1bkJpbmRPcHRpb25zIHtcclxuICAgIHJvb3QgOiBhbnk7XHJcbiAgICB2YWx1ZUNoYW5nZXM6IG9iamVjdDtcclxuICAgIGFkZGl0aW9uYWxIb3N0cz8gOiBBcnJheTxIVE1MRWxlbWVudD5cclxufVxyXG5cclxuLy8gZXhwb3J0IGludGVyZmFjZSBEb2NPYmplY3RFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4vLyAgICAgX0RvY09iamVjdD8gOiBEb2NPYmplY3RcclxuLy8gfVxyXG5cclxuZXhwb3J0IGNsYXNzIERvY09iamVjdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBfRG9jT2JqZWN0PyA6IERvY09iamVjdFxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIGlmKCFEb2NPYmplY3QuaXNEb2JPYmplY3RFbGVtZW50KHRoaXMpKXtcclxuICAgICAgICAgICAgdGhpcy5fRG9jT2JqZWN0ID0gbmV3IERvY09iamVjdCh0aGlzLCB7fSlcclxuICAgICAgICB9IFxyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jT2JqZWN0RWxlbWVudHMge1xyXG4gICAgW2tleTogc3RyaW5nXSA6IHN0cmluZyB8ICgoc2VsZWN0b3IgOiBzdHJpbmcgKSA9PiBOb2RlTGlzdHxKUXVlcnkpXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgIG9yaWdpbmFsQ2hpbGRyZW46IEFycmF5PE5vZGU+O1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IHN0cmluZztcclxuICAgIG9yaWdpbmFsQXR0cmlidXRlczoge1trZXk6c3RyaW5nXSA6IHN0cmluZ307XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRG9jT2JqZWN0IHtcclxuXHJcbiAgICBzdGF0aWMgcGFyc2VyIDogRE9NUGFyc2VyID0gbmV3IERPTVBhcnNlcigpXHJcblxyXG4gICAgc3RhdGljIHRvTm9kZUFycmF5KGFueSA6IERvY09iamVjdEhUTUxMaWtlIHwgQXJyYXk8c3RyaW5nfE5vZGU+ICkgOiBBcnJheTxOb2RlPiB7XHJcbiAgICAgICAgaWYodHlwZW9mIGFueSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGFueSA9PT0gJ251bWJlcicpe1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLkRvY09iamVjdC5wYXJzZXIucGFyc2VGcm9tU3RyaW5nKGFueS50b1N0cmluZygpLCAndGV4dC9odG1sJykuYm9keS5jaGlsZE5vZGVzXVxyXG4gICAgICAgIH1lbHNlIGlmKE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGFueSkgfHwgKHdpbmRvdy5qUXVlcnkgJiYgYW55IGluc3RhbmNlb2YgalF1ZXJ5KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbIC4uLihhbnkgYXMgTm9kZUxpc3QpXVxyXG4gICAgICAgIH1lbHNlIGlmKEFycmF5LmlzQXJyYXkoYW55KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhbnlcclxuICAgICAgICAgICAgLmZpbHRlcihlPT4gKHR5cGVvZiBlID09PSAnc3RyaW5nJykgfHwgZSBpbnN0YW5jZW9mIE5vZGUgKVxyXG4gICAgICAgICAgICAubWFwKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSA/IERvY09iamVjdC50b05vZGVBcnJheShlKVswXSA6IGUgKTtcclxuICAgICAgICB9IGVsc2UgaWYoYW55IGluc3RhbmNlb2YgTm9kZSB8fCBhbnkgaW5zdGFuY2VvZiBEb2N1bWVudCApe1xyXG4gICAgICAgICAgICByZXR1cm4gW2FueV1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIFtdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkZWZhdWx0UGFyYW1zKHtcclxuICAgICAgICByZW5kZXIgPSBbXSxcclxuICAgICAgICBiaW5kcyA9IHt9LFxyXG4gICAgICAgIGVsZW1lbnRzID0ge30sXHJcbiAgICAgICAgdmFsdWVzID0ge30sXHJcbiAgICAgICAgYmluZEF0dHIgPSAnZC1iaW5kJyxcclxuICAgICAgICBiaW5kSW5BdHRyID0gJ2QtYmluZC1pbicsXHJcbiAgICAgICAgaXNKUXVlcnkgPSBmYWxzZSxcclxuICAgICAgICBjb25uZWN0aW9ucyA9IFtdLFxyXG4gICAgICAgIHJlbW92ZU9ubG9hZCA9IGZhbHNlXHJcbiAgICB9ID0ge30pIDogRG9jT2JqZWN0T3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuICB7IGVsZW1lbnRzLCB2YWx1ZXMsIHJlbmRlciwgYmluZHMsIGJpbmRBdHRyLCBiaW5kSW5BdHRyLCBpc0pRdWVyeSwgY29ubmVjdGlvbnMsIHJlbW92ZU9ubG9hZCB9IFxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBleHRyYWN0QXR0cmlidXRlcyhlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCl7XHJcbiAgICAgICAgcmV0dXJuIFsuLi5lbGVtZW50LmF0dHJpYnV0ZXNdLnJlZHVjZSggKGEsYyk9PntyZXR1cm4gey4uLmEsIFsoYy5uYW1lKS5yZXBsYWNlKC8tKFthLXpdKS9nLCBmdW5jdGlvbiAoZykgeyByZXR1cm4gZ1sxXS50b1VwcGVyQ2FzZSgpOyB9KV06Yy52YWx1ZX0gfSwge30gKVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWZhdWx0UnVuQmluZE9wdGlvbnMoe1xyXG4gICAgICAgIHJvb3QsXHJcbiAgICAgICAgdmFsdWVDaGFuZ2VzLFxyXG4gICAgICAgIGFkZGl0aW9uYWxIb3N0cyA9IFtdXHJcbiAgICB9IDogRG9jT2JqZWN0UnVuQmluZE9wdGlvbnMgKSA6IERvY09iamVjdFJ1bkJpbmRPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4ge3Jvb3QsIHZhbHVlQ2hhbmdlcywgYWRkaXRpb25hbEhvc3RzfVxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIHJlYWRvbmx5IF92YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBlbGVtZW50cyA6IFByb3h5SGFuZGxlcjxEb2NPYmplY3RFbGVtZW50cz47XHJcbiAgICByb290IDogRG9jT2JqZWN0RWxlbWVudDtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIHF1ZXJ5IDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIF9xdWVyeVNlbGVjdCA6IChzZWxlY3RvcjpzdHJpbmcpPT4gTm9kZUxpc3QgfCBKUXVlcnk7XHJcbiAgICBfaXNKUXVlcnkgOiBib29sZWFuXHJcbiAgICBfY29ubmVjdGlvbnMgOiBBcnJheTxEb2NPYmplY3Q+XHJcbiAgICBhdHRycyA6IERvY09iamVjdEJpbmRBdHRyaWJ1dGVcclxuICAgIGcgOiBEb2NHZW5cclxuICAgIF90aGlzIDogYW55ID0gdGhpcztcclxuICAgIG9uTG9hZDogKCk9PnZvaWRcclxuXHJcbiAgICBzZXQgdmFsdWVzKHZhbHVlcykge1xyXG4gICAgICAgIHRocm93IEVycm9yKFwiVHJpZWQgdG8gc2V0IERvY09iamVjdC52YWx1ZS4gVHJ5IGNyZWF0aW5nIGEgaW5uZXIgb2JqZWN0IGluc3RlYWQuXCIpXHJcbiAgICB9XHJcbiAgICBnZXQgdmFsdWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnMgOiBvYmplY3QpIHtcclxuICAgICAgICAvL0FkZCBEZWZhdWx0IFBhcmFtZXRlcnMgdG8gb3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gOiBEb2NPYmplY3RPcHRpb25zID0gRG9jT2JqZWN0LmRlZmF1bHRQYXJhbXMob3B0aW9ucylcclxuICAgICAgICBcclxuICAgICAgICAvL0V4dHJhY3QgRE9NIGVsZW1lbnQgZnJvbSBIVE1MRWxlbWVudCBPciBKcXVlcnkgT2JqZWN0XHJcbiAgICAgICAgbGV0IHJvb3RFbGVtZW50ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KHJvb3QpWzBdXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUm9vdCBPYmplY3RcclxuICAgICAgICBpZihyb290RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHJvb3RFbGVtZW50XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJ1bkVycm9yKFJPT1RfRVJST1IsIHRydWUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IGNvbm5lY3Rpb25zO1xyXG5cclxuICAgICAgICAvL1NldCBKcXVlcnlcclxuICAgICAgICBpZihpc0pRdWVyeSAmJiB3aW5kb3cualF1ZXJ5KXtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgZGV0ZWN0ZWQgYW5kIGlzIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBqUXVlcnlcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnlTZWxlY3QgPSAoLi4ucHJvcHMpID0+ICQodGhpcy5yb290KS5maW5kKC4uLnByb3BzKVxyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgbm90IGRldGVjdGVkLi4uXHJcbiAgICAgICAgICAgIGlmKGlzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgIC8vSWYgc2V0IHRvIGpxdWVyeSBtb2RlLi4uXHJcbiAgICAgICAgICAgICAgICBydW5FcnJvcihKUVVFUllfTk9UX0RFVEVDVEVELCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBIVE1MRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsXHJcbiAgICAgICAgICAgIHRoaXMuX2lzSlF1ZXJ5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiB0aGlzLnJvb3QucXVlcnlTZWxlY3RvckFsbCguLi5wcm9wcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0IHRvIHRoaXNcclxuICAgICAgICB0aGlzLnJvb3QuX0RvY09iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vQWRkIHF1ZXJ5LWFibGUgYXR0cmlidXRlIHRvIHJvb3QgZWxlbWVudFxyXG4gICAgICAgIHRoaXMucm9vdC5zZXRBdHRyaWJ1dGUoJ2RvYy1vYmplY3QnLCAnJylcclxuXHJcbiAgICAgICAgLy9TZXQgUmVuZGVyIEZ1bmN0aW9uc1xyXG4gICAgICAgIHRoaXMucmVuZGVyID0gcmVuZGVyO1xyXG5cclxuICAgICAgICAvL0NyZWF0ZSBSZWxhdGVkIERvY0dlblxyXG4gICAgICAgIHRoaXMuZyA9IG5ldyBEb2NHZW4odGhpcylcclxuXHJcbiAgICAgICAgdGhpcy5hdHRycyA9IERvY09iamVjdC5leHRyYWN0QXR0cmlidXRlcyggdGhpcy5yb290IClcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLmJpbmRzID0gKHR5cGVvZiBiaW5kcyA9PT0gJ2Z1bmN0aW9uJykgPyBiaW5kcyh0aGlzLmcpIDogYmluZHMgO1xyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEF0dHJpYnV0ZVxyXG4gICAgICAgIHRoaXMuYmluZEF0dHIgPSBiaW5kQXR0cjtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBJbiBBdHRyaWJ1dGVcclxuICAgICAgICB0aGlzLmJpbmRJbkF0dHIgPSBiaW5kSW5BdHRyO1xyXG5cclxuICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IFF1ZXJ5IFByb3h5XHJcbiAgICAgICAgdGhpcy5xdWVyeSA9IG5ldyBQcm94eSh7fSwge1xyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3AgKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgcHJvcCA9PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIHRhcmdldFtwcm9wXSA/IHRhcmdldFtwcm9wXSA6IF8gPT4gdGhpcy5fcXVlcnlTZWxlY3QoIC8uKihcXC58XFwjfFxcW3xcXF0pLiovZ20uZXhlYyhwcm9wKSA/IHByb3AgOiAnIycgKyBwcm9wICkgXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogKHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgdmFsdWUgPSAoKSA9PiB0aGlzLl9xdWVyeVNlbGVjdCh2YWx1ZSlcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IF8gPT4gdmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vU2V0IEVsZW1lbnRzIFByb3h5XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IG5ldyBQcm94eSh0aGlzLnF1ZXJ5LCB7XHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL0FkZCBpbiBlbGVtZW50cyBmcm9tIG9wdGlvbnNcclxuICAgICAgICBpZiAoZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZWxlbWVudHMpLmZvckVhY2goKGUgPT4geyB0aGlzLnF1ZXJ5W2VbMF1dID0gZVsxXSB9KSlcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLl92YWx1ZXMgPSBuZXcgUHJveHkoIXZhbHVlcyB8fCB0eXBlb2YgdmFsdWVzICE9PSAnb2JqZWN0JyA/IHt9IDogdmFsdWVzLCB7XHJcbiAgICAgICAgICAgIHNldDogKHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsgW3Byb3BdOiB2YWx1ZSB9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh7W3Byb3BdOnZhbHVlfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3ApID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiB0YXJnZXRbcHJvcF0gPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXSh0aGlzLmF0dHJzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICBcclxuICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMub25Mb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ1blJlbmRlcih7Li4udGhpcy52YWx1ZXMsIFt0cnVlIGFzIGFueV06IHRydWV9KVxyXG4gICAgICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHRoaXMudmFsdWVzKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIXJlbW92ZU9ubG9hZCl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgICQodGhpcy5vbkxvYWQpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgd2luZG93Lm9ubG9hZCA9IHRoaXMub25Mb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpc0JpbmRJbihlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKCBlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRJbkF0dHIpICYmIHRydWUgKSBcclxuICAgIH1cclxuICAgIGlzQmluZChlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKGVsZW1lbnQubG9jYWxOYW1lID09PSAnZC1iaW5kJyB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSkgJiYgdHJ1ZVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGlzRG9iT2JqZWN0RWxlbWVudChlbGVtZW50IDogRG9jT2JqZWN0RWxlbWVudCApIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5fRG9jT2JqZWN0IGluc3RhbmNlb2YgRG9jT2JqZWN0ICApXHJcbiAgICB9XHJcbiAgICBcclxuXHJcblxyXG4gICAgZmluZE9yUmVnaXN0ZXJCaW5kKERPTWVsZW1lbnQgOiBEb2NPYmplY3REb21CaW5kKSA6IERvY09iamVjdENvbmZpZyB7XHJcbiAgICAgICAgaWYoRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBsZXQgb3JpZ2luYWxDaGlsZHJlbiA9IFsuLi5ET01lbGVtZW50LmNoaWxkTm9kZXNdXHJcbiAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW4udG9TdHJpbmcgPSAoKT0+IERPTWVsZW1lbnQuaW5uZXJIVE1MXHJcbiAgICAgICAgICAgIERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW4sXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENoaWxkcmVuSFRNTDogRE9NZWxlbWVudC5pbm5lckhUTUwsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEF0dHJpYnV0ZXM6IERvY09iamVjdC5leHRyYWN0QXR0cmlidXRlcyhET01lbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWdcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUJpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQsIGJpbmQsIGJvdW5kIDogRG9jT2JqZWN0SFRNTExpa2UpIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheSh0eXBlb2YgYm91bmQgPT09ICdmdW5jdGlvbicgPyAoYm91bmQuYmluZCh0aGlzLl90aGlzKSkodGhpcy5nKSA6IGJvdW5kKTtcclxuICAgICAgICBpZih0aGlzLmlzQmluZChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IG5vZGVBcnJheS5maW5kKGVsID0+IGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIGFzIERvY09iamVjdERvbUJpbmQ7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKChmaXJzdEVsZW1lbnQubG9jYWxOYW1lID09PSAnZC1iaW5kJyA/ICd0bycgOiB0aGlzLmJpbmRBdHRyKSwgYmluZClcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoY29uZmlnLm9yaWdpbmFsQXR0cmlidXRlcykuZmlsdGVyKGF0dEE9PiEoWydkLWJpbmQtaW4nLCAndG8nXS5pbmNsdWRlcyhhdHRBWzBdKSkpLmZvckVhY2goYXR0QT0+Zmlyc3RFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRBWzBdLCBhdHRBWzFdKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0RWxlbWVudDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVBcnJheTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgXHJcblxyXG4gICAgcnVuUmVuZGVyKHZhbHVlQ2hhbmdlcyA9IHt9KSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVuZGVyLmZpbHRlcihyZW4gPT4gKHJlbi5kZXAgJiYgQXJyYXkuaXNBcnJheShyZW4uZGVwKSAmJiByZW4uZGVwLnNvbWUoKGRlcHApID0+IChkZXBwIGluIHZhbHVlQ2hhbmdlcykpKSB8fCAocmVuLmRlcCA9PT0gdW5kZWZpbmVkKSkuZm9yRWFjaChyZW4gPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVuLmNsZWFuKSByZW4uY2xlYW4oeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIHRoaXMudmFsdWVzKVxyXG4gICAgICAgICAgICByZW4uYWN0aW9uKHsgLi4udGhpcy52YWx1ZXMsIC4uLnZhbHVlQ2hhbmdlcyB9LCB0aGlzLnZhbHVlcylcclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMucnVuQmluZHMoe3Jvb3Q6dGhpcy5yb290LCB2YWx1ZUNoYW5nZXMsIGFkZGl0aW9uYWxIb3N0czpbdGhpcy5yb290XX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEJpbmRBY3Rpb24oZWxlbWVudCA6IEhUTUxFbGVtZW50LCB2YWx1ZUNoYW5nZXM6IG9iamVjdCkgOiBbc3RyaW5nLCAocmVwbGFjZSA6IE5vZGUgfCBOb2RlTGlzdCB8IE5vZGVbXSApPT4gdm9pZCBdIHwgbnVsbCB7XHJcbiAgICAgICAgaWYodGhpcy5pc0JpbmQoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICBpZihlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpLCAocmVwbGFjZSk9PmVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocmVwbGFjZSBhcyBOb2RlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfWVsc2UgaWYoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RvJyksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlIGFzIE5vZGUsIGVsZW1lbnQpXVxyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1lbHNlIGlmKHRoaXMuaXNCaW5kSW4oZWxlbWVudCkpe1xyXG4gICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEluQXR0ciksIChyZXBsYWNlKT0+e1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSBhcyBOb2RlTGlzdCkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9ZWxzZSBpZihEb2NPYmplY3QuaXNEb2JPYmplY3RFbGVtZW50KGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgaWYoZWxlbWVudCA9PT0gdGhpcy5yb290ICl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyd0aGlzJywgICAocmVwbGFjZSk9PntcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSBhcyBOb2RlTGlzdCkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQgYXMgRG9jT2JqZWN0RWxlbWVudCkuX0RvY09iamVjdC5ydW5SZW5kZXIodmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwgPSAoc2VsZWN0b3IgOiBzdHJpbmcpID0+IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxyXG4gICAgcnVuQmluZHMocGFyYW1zOiBEb2NPYmplY3RSdW5CaW5kT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHsgcm9vdCwgdmFsdWVDaGFuZ2VzLCBhZGRpdGlvbmFsSG9zdHMgfSA9IHRoaXMuZGVmYXVsdFJ1bkJpbmRPcHRpb25zKHBhcmFtcyk7XHJcbiAgICAgICAgKEFycmF5LmlzQXJyYXkocm9vdCkgPyByb290IDogW3Jvb3RdKVxyXG4gICAgICAgICAgICAuZmlsdGVyKHJ0ID0+IHJ0ICYmIHJ0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChydCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgWy4uLihydC5xdWVyeVNlbGVjdG9yQWxsKGBbJHt0aGlzLmJpbmRBdHRyfV0sIFske3RoaXMuYmluZEluQXR0cn1dLCBkLWJpbmRbdG9dLCBbZG9jLW9iamVjdF1gKSksIC4uLmFkZGl0aW9uYWxIb3N0c11cclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJpbmRJbnN0cnVjdGlvbnMgPSB0aGlzLmdldEJpbmRBY3Rpb24oZWxlbWVudCwgdmFsdWVDaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZEluc3RydWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgVGhlIEJpbmQgTWV0aG9kLCBhbmQgdGhlIEZ1bmN0aW9uIHRvIGluc2VydCBIVE1MIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW2JpbmQsIGJpbmRBY3Rpb25dID0gYmluZEluc3RydWN0aW9ucztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgQmluZCBFeGlzdHMgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmluZCBpbiB0aGlzLmJpbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgT3IgcmVnaXN0ZXIgQmluZCBUYWcncyBDb25maWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmZpbmRPclJlZ2lzdGVyQmluZChlbGVtZW50KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0luc2VydCBIVE1MXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZEFjdGlvbih0aGlzLnJ1bkJpbmRzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogdGhpcy5nZW5lcmF0ZUJpbmQoICAvL1dyYXAgQmluZCBNZXRob2QgdG8gcHJlcGFyZSBiaW5kIGZvciBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmQsICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1J1biBCaW5kIE1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9FeHRyYWN0IEJpbmQgYW5kIFVzZSBKYXZhU2NyaXB0J3MgYmluZCBtZXRob2QgdG8gc2V0IHRoaXMgdG8gRG9jT2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5iaW5kc1tiaW5kXS5iaW5kKHRoaXMuX3RoaXMpKShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlcywgLy9QYXNzIGluIHVwZGF0ZXMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm9yaWdpbmFsQXR0cmlidXRlcywgLy9QYXNzIGluIG9yaWdpbmFsIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxDaGlsZHJlbiwgLy9QYXNzIGluIG9yaWdpbmFsIGNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VzIC8vQ2hhbmdlcyB0aGF0IHRyaWdnZXJlZCByZW5kZXIgKEluY2x1ZGluZyBhIHBhcmVudCdzIERvY09iamVjdCB2YWx1ZSBjaGFuZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUNoYW5nZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiByb290O1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bkNvbm5lY3Rpb25zKHZhbHVlQ2hhbmdlcyA6IHtba2V5IDogc3RyaW5nfHN5bWJvbF0gOiBhbnkgfSA9IHtbdHJ1ZSBhcyBhbnldOnRydWV9ICl7XHJcbiAgICAgICAgZm9yKGxldCBreSBpbiB2YWx1ZUNoYW5nZXMpe1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9ucy5mb3JFYWNoKChjb25uZWN0ZWQpID0+IGNvbm5lY3RlZC52YWx1ZXNba3ldID0gdmFsdWVDaGFuZ2VzW2t5XSlcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3QoLi4uZG9jT2JqZWN0cyA6IFtEb2NPYmplY3RdKXtcclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IFsuLi50aGlzLl9jb25uZWN0aW9ucywgLi4uZG9jT2JqZWN0c11cclxuICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHRoaXMudmFsdWVzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuXHJcblxyXG4vKlxyXG52YXIgZG9jID0gbmV3IERvY09iamVjdCh7XHJcbiAgICB2YWx1ZXM6IHtcclxuICAgIH0sXHJcbiAgICBlbGVtZW50czp7XHJcblxyXG4gICAgfSxcclxuICAgIGJpbmRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBbXHJcblxyXG4gICAgXVxyXG59KTsgJChkb2Mub25Mb2FkKVxyXG4qLyIsIlxyXG5cclxuZXhwb3J0IGNvbnN0IFJPT1RfRVJST1IgPSAnUk9PVF9FUlJPUidcclxuZXhwb3J0IGNvbnN0IEpRVUVSWV9OT1RfREVURUNURUQgPSAnSlFVRVJZX05PVF9ERVRFQ1RFRCdcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBydW5FcnJvcihlcnJvciA6IHN0cmluZywgZmFpbD1mYWxzZSl7XHJcbiAgICBpZihlcnJvciBpbiBFUlJPUlMpe1xyXG4gICAgICAgIGlmKGZhaWwpe1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignRG9jT2JqZWN0OiAnKyBFUlJPUlNbZXJyb3JdLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKEVSUk9SU1tlcnJvcl0ubWVzc2FnZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IEVSUk9SUyA9IHtcclxuICAgIFJPT1RfRVJST1IgOiB7XHJcbiAgICAgICAgbWVzc2FnZTogXCJSb290IEVsZW1lbnQgTXVzdCBiZSBhIHZhbGlkIE5vZGUsIE9yIGpRdWVyeSBFbGVtZW50XCJcclxuICAgIH0sXHJcbiAgICBKUVVFUllfTk9UX0RFVEVDVEVEOiB7XHJcbiAgICAgICAgbWVzc2FnZSA6IFwiSlF1ZXJ5IGlzIG5vdCBkZXRlY3RlZC4gUGxlYXNlIGxvYWQgSlF1ZXJ5IGJlZm9yZSBEb2NPYmplY3RcIlxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERvY09iamVjdCwgRG9jT2JqZWN0RWxlbWVudCB9IGZyb20gXCIuL2RvY29iamVjdFwiO1xyXG5pbXBvcnQgRG9jR2VuIGZyb20gXCIuL2RvY2dlblwiO1xyXG5pbXBvcnQge3NldEN1cnNvclBvcywgZ2V0Q3Vyc29yUG9zfSBmcm9tIFwiLi91dGlsc1wiXHJcblxyXG5jbGFzcyBCaW5kIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xyXG4gICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LmFwcGVuZChkaXYpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8qKioqKioqIFVUSUxJVFkgTUVUSE9EUyAqKioqKioqL1xyXG5leHBvcnQgZnVuY3Rpb24gZml4SW5wdXQoc2VsZWN0b3IsIGFjdGlvbil7XHJcbiAgICBsZXQgcG9zID0gZ2V0Q3Vyc29yUG9zKHNlbGVjdG9yKClbMF0pXHJcbiAgICBhY3Rpb24oKVxyXG4gICAgc2V0Q3Vyc29yUG9zKHNlbGVjdG9yKClbMF0sIHBvcylcclxufVxyXG5cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2QtYmluZCcsIEJpbmQpXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2RvYy1vYmplY3QnLCBEb2NPYmplY3RFbGVtZW50KVxyXG5pZih3aW5kb3cualF1ZXJ5KXtcclxuICAgIChmdW5jdGlvbigkKSB7XHJcbiAgICAgICAgJC5mbi5leHRlbmQoe1xyXG4gICAgICAgICAgICBEb2NPYmplY3QgOiBmdW5jdGlvbiggb3B0aW9ucyA9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXNbMF0uX0RvY09iamVjdCAmJiAhb3B0aW9ucyApIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCB7IGlzSlF1ZXJ5OnRydWUsIC4uLm9wdGlvbnMgfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSkoalF1ZXJ5KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9iaihyb290IDogRG9jT2JqZWN0RWxlbWVudCB8IEpRdWVyeSwgb3B0aW9ucyA6IG9iamVjdCkgOiBEb2NPYmplY3Qge1xyXG4gICAgcmV0dXJuIG5ldyBEb2NPYmplY3Qocm9vdCwgb3B0aW9ucyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW4oKSA6IERvY0dlbiB7XHJcbiAgICByZXR1cm4gbmV3IERvY0dlbigpXHJcbn1cclxuIiwiaW50ZXJmYWNlIERvY3VtZW50IHtcclxuICAgIHNlbGVjdGlvbjoge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yODk3MTU1L2dldC1jdXJzb3ItcG9zaXRpb24taW4tY2hhcmFjdGVycy13aXRoaW4tYS10ZXh0LWlucHV0LWZpZWxkXHJcbiBleHBvcnQgZnVuY3Rpb24gZ2V0Q3Vyc29yUG9zKGVsZW1lbnQgOiBIVE1MSW5wdXRFbGVtZW50KSA6IG51bWJlciB7XHJcbiAgICAvLyBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAvLyAgICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgLy8gICAgIHJldHVybiAgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtZWxlbWVudC52YWx1ZS5sZW5ndGgpO1xyXG4gICAgLy8gfVxyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnNlbGVjdGlvbkRpcmVjdGlvbiA9PSAnYmFja3dhcmQnID8gZWxlbWVudC5zZWxlY3Rpb25TdGFydCA6IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwOi8vYmxvZy52aXNoYWxvbi5uZXQvaW5kZXgucGhwL2phdmFzY3JpcHQtZ2V0dGluZy1hbmQtc2V0dGluZy1jYXJldC1wb3NpdGlvbi1pbi10ZXh0YXJlYS9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCwgcG9zIDogbnVtYmVyKSA6IHZvaWQge1xyXG4gICAgLy8gTW9kZXJuIGJyb3dzZXJzXHJcbiAgICBpZiAoZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICBcclxuICAgIC8vIElFOCBhbmQgYmVsb3dcclxuICAgIH0gZWxzZSBpZiAoKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UpIHtcclxuICAgICAgdmFyIHJhbmdlID0gKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UoKTtcclxuICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XHJcbiAgICAgIHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgcG9zKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0KCk7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvdHMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
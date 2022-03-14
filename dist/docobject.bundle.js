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
                return this.obj.binds[prop](this.obj.values, attrs, docobject_1.DocObject.toNodeArray(inner));
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
        const nodeArray = DocObject.toNodeArray(bound);
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
        this.runBinds(this.root, valueChanges);
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
    }
    runBinds(root, valueChanges = {}) {
        (Array.isArray(root) ? root : [root])
            .filter(rt => rt && rt instanceof HTMLElement)
            .forEach((rt) => {
            [...(rt.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}], d-bind[to]`))]
                .forEach(element => {
                //Get The Bind Method, and the Function to insert HTML 
                const [bind, bindAction] = this.getBindAction(element);
                //Check if Bind Exists 
                if (bind in this.binds) {
                    //Get Or register Bind Tag's Config
                    const config = this.findOrRegisterBind(element);
                    //Insert HTML
                    bindAction(this.runBinds(
                    //Wrap Bind Method to prepare bind for document
                    this.generateBind(element, bind, 
                    //Run Bind Method
                    this.binds[bind](Object.assign(Object.assign({}, this.values), valueChanges), //Pass in updates values
                    config.originalAttributes, //Pass in original attributes
                    config.originalChildren)), valueChanges));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RyxDQUFDO0FBTkEsb0NBTUE7QUFFRCx5R0FBeUc7QUFDekcsU0FBZ0IsWUFBWSxDQUFDLE9BQTBCLEVBQUUsR0FBWTtJQUNqRSxrQkFBa0I7SUFDbEIsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7UUFDL0IsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFcEMsZ0JBQWdCO0tBQ2Y7U0FBTSxJQUFLLE9BQWUsQ0FBQyxlQUFlLEVBQUU7UUFDM0MsSUFBSSxLQUFLLEdBQUksT0FBZSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQy9DLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQWRELG9DQWNDOzs7Ozs7O1VDOUJEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jZ2VuLnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9kb2NvYmplY3QudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2Vycm9ycy50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL3V0aWxzLnRzIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEb2NPYmplY3QsIERvY09iamVjdEhUTUxMaWtlfSBmcm9tICcuL2RvY29iamVjdCdcclxuaW1wb3J0IHsgRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSB9IGZyb20gJy4vZG9jYmluZCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY0dlbiB7XHJcbiAgICBcclxuICAgIG9iaiA/IDogRG9jT2JqZWN0IFxyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihvYmo/IDogRG9jT2JqZWN0KXtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9iaiA9IG9ialxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcclxuICAgICAgICAgICAgZ2V0Oih0YXJnZXQsIHByb3AgKSA9PiB7XHJcbiAgICAgICAgICAgICAgIHJldHVybiB0aGlzLkdlbihwcm9wIGFzIHN0cmluZylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gICAgR2VuKHByb3AgOiBzdHJpbmcpe1xyXG4gICAgICAgIHJldHVybiAoaW5uZXIgOiBEb2NPYmplY3RIVE1MTGlrZSB8IEFycmF5PHN0cmluZ3xOb2RlPiA9IFtdICwgYXR0cnMgOiBEb2NPYmplY3RCaW5kQXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMub2JqICYmIHByb3AgaW4gdGhpcy5vYmouYmluZHMpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub2JqLmJpbmRzW3Byb3BdKHRoaXMub2JqLnZhbHVlcywgYXR0cnMsIERvY09iamVjdC50b05vZGVBcnJheShpbm5lcikpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHByb3ApXHJcbiAgICAgICAgICAgIGZvcihsZXQga2V5IGluIGF0dHJzKXtcclxuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gJ3N0eWxlJyAmJiB0eXBlb2YgYXR0cnNba2V5XSA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHNrZXkgaW4gYXR0cnNba2V5IGFzIHN0cmluZ10pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3NrZXldID0gYXR0cnNba2V5XVtza2V5XVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihrZXkuc3RhcnRzV2l0aCgnb24nKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtrZXldID0gYXR0cnNba2V5XVxyXG4gICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIERvY09iamVjdC50b05vZGVBcnJheShpbm5lcikuZm9yRWFjaChpbmUgPT4ge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbmUpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IERvY09iamVjdERvbUJpbmQsIERvY09iamVjdEJpbmQsIERvY09iamVjdEJpbmRHZW4gfSBmcm9tICcuL2RvY2JpbmQnXHJcbmltcG9ydCB7IERvY09iamVjdFJlbmRlciB9IGZyb20gJy4vZG9jcmVuZGVyJ1xyXG5pbXBvcnQgIERvY0dlbiAgZnJvbSAnLi9kb2NnZW4nXHJcbmltcG9ydCBydW5FcnJvciwgeyBcclxuICAgIFJPT1RfRVJST1IsXHJcbiAgICBKUVVFUllfTk9UX0RFVEVDVEVEXHJcbn0gZnJvbSAnLi9lcnJvcnMnO1xyXG5cclxuLyoqKioqKiogR0xPQkFMUyAqKioqKioqL1xyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgV2luZG93IHtcclxuICAgICAgICBqUXVlcnk6YW55O1xyXG4gICAgICAgIG1zQ3J5cHRvOmFueTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbi8qKioqKioqIERPQyBPQkpFQ1QgKioqKioqKi9cclxuZXhwb3J0IHR5cGUgRG9jT2JqZWN0SFRNTExpa2UgPSBcclxufCBOb2RlXHJcbnwgTm9kZUxpc3RcclxufCBKUXVlcnkgXHJcbnwgTnVtYmVyXHJcbnwgc3RyaW5nO1xyXG5cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZCB8IERvY09iamVjdEJpbmRHZW47XHJcbiAgICBlbGVtZW50cyA6IHtba2V5OnN0cmluZ106IHN0cmluZ307XHJcbiAgICB2YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBiaW5kQXR0ciA6IHN0cmluZztcclxuICAgIGJpbmRJbkF0dHIgOiBzdHJpbmc7XHJcbiAgICBpc0pRdWVyeSA6IGJvb2xlYW47XHJcbiAgICBjb25uZWN0aW9ucyA6IEFycmF5PERvY09iamVjdD5cclxuICAgIHJlbW92ZU9ubG9hZCA6IGJvb2xlYW5cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBEb2NPYmplY3RFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgX0RvY09iamVjdD8gOiBEb2NPYmplY3RcclxufVxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdEVsZW1lbnRzIHtcclxuICAgIFtrZXk6IHN0cmluZ10gOiBzdHJpbmcgfCAoKHNlbGVjdG9yIDogc3RyaW5nICkgPT4gTm9kZUxpc3R8SlF1ZXJ5KVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERvY09iamVjdENvbmZpZyB7XHJcbiAgICBvcmlnaW5hbENoaWxkcmVuOiBBcnJheTxOb2RlPjtcclxuICAgIG9yaWdpbmFsQ2hpbGRyZW5IVE1MOiBzdHJpbmc7XHJcbiAgICBvcmlnaW5hbEF0dHJpYnV0ZXM6IHtba2V5OnN0cmluZ10gOiBzdHJpbmd9O1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIERvY09iamVjdCB7XHJcblxyXG4gICAgc3RhdGljIHBhcnNlciA6IERPTVBhcnNlciA9IG5ldyBET01QYXJzZXIoKVxyXG5cclxuICAgIHN0YXRpYyB0b05vZGVBcnJheShhbnkgOiBEb2NPYmplY3RIVE1MTGlrZSB8IEFycmF5PHN0cmluZ3xOb2RlPiApIDogQXJyYXk8Tm9kZT4ge1xyXG4gICAgICAgIGlmKHR5cGVvZiBhbnkgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBhbnkgPT09ICdudW1iZXInKXtcclxuICAgICAgICAgICAgcmV0dXJuIFsuLi5Eb2NPYmplY3QucGFyc2VyLnBhcnNlRnJvbVN0cmluZyhhbnkudG9TdHJpbmcoKSwgJ3RleHQvaHRtbCcpLmJvZHkuY2hpbGROb2Rlc11cclxuICAgICAgICB9ZWxzZSBpZihOb2RlTGlzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihhbnkpIHx8ICh3aW5kb3cualF1ZXJ5ICYmIGFueSBpbnN0YW5jZW9mIGpRdWVyeSkpe1xyXG4gICAgICAgICAgICByZXR1cm4gWyAuLi4oYW55IGFzIE5vZGVMaXN0KV1cclxuICAgICAgICB9ZWxzZSBpZihBcnJheS5pc0FycmF5KGFueSkpe1xyXG4gICAgICAgICAgICByZXR1cm4gYW55XHJcbiAgICAgICAgICAgIC5maWx0ZXIoZT0+ICh0eXBlb2YgZSA9PT0gJ3N0cmluZycpIHx8IGUgaW5zdGFuY2VvZiBOb2RlIClcclxuICAgICAgICAgICAgLm1hcChlPT4gKHR5cGVvZiBlID09PSAnc3RyaW5nJykgPyBEb2NPYmplY3QudG9Ob2RlQXJyYXkoZSlbMF0gOiBlICk7XHJcbiAgICAgICAgfSBlbHNlIGlmKGFueSBpbnN0YW5jZW9mIE5vZGUgfHwgYW55IGluc3RhbmNlb2YgRG9jdW1lbnQgKXtcclxuICAgICAgICAgICAgcmV0dXJuIFthbnldXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkZWZhdWx0UGFyYW1zKHtcclxuICAgICAgICByZW5kZXIgPSBbXSxcclxuICAgICAgICBiaW5kcyA9IHt9LFxyXG4gICAgICAgIGVsZW1lbnRzID0ge30sXHJcbiAgICAgICAgdmFsdWVzID0ge30sXHJcbiAgICAgICAgYmluZEF0dHIgPSAnZC1iaW5kJyxcclxuICAgICAgICBiaW5kSW5BdHRyID0gJ2QtYmluZC1pbicsXHJcbiAgICAgICAgaXNKUXVlcnkgPSBmYWxzZSxcclxuICAgICAgICBjb25uZWN0aW9ucyA9IFtdLFxyXG4gICAgICAgIHJlbW92ZU9ubG9hZCA9IGZhbHNlXHJcbiAgICB9ID0ge30pIDogRG9jT2JqZWN0T3B0aW9ucyB7XHJcbiAgICAgICAgcmV0dXJuICB7IGVsZW1lbnRzLCB2YWx1ZXMsIHJlbmRlciwgYmluZHMsIGJpbmRBdHRyLCBiaW5kSW5BdHRyLCBpc0pRdWVyeSwgY29ubmVjdGlvbnMsIHJlbW92ZU9ubG9hZCB9IFxyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIHJlYWRvbmx5IF92YWx1ZXMgOiBvYmplY3Q7XHJcbiAgICBlbGVtZW50cyA6IFByb3h5SGFuZGxlcjxEb2NPYmplY3RFbGVtZW50cz47XHJcbiAgICByb290IDogRG9jT2JqZWN0RWxlbWVudDtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIHF1ZXJ5IDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIF9xdWVyeVNlbGVjdCA6IChzZWxlY3RvcjpzdHJpbmcpPT4gTm9kZUxpc3QgfCBKUXVlcnk7XHJcbiAgICBfaXNKUXVlcnkgOiBib29sZWFuXHJcbiAgICBfY29ubmVjdGlvbnMgOiBBcnJheTxEb2NPYmplY3Q+XHJcbiAgICBnIDogRG9jR2VuXHJcbiAgICBvbkxvYWQ6ICgpPT52b2lkXHJcblxyXG4gICAgc2V0IHZhbHVlcyh2YWx1ZXMpIHtcclxuICAgICAgICB0aHJvdyBFcnJvcihcIlRyaWVkIHRvIHNldCBEb2NPYmplY3QudmFsdWUuIFRyeSBjcmVhdGluZyBhIGlubmVyIG9iamVjdCBpbnN0ZWFkLlwiKVxyXG4gICAgfVxyXG4gICAgZ2V0IHZhbHVlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHJvb3QgOiBEb2NPYmplY3RFbGVtZW50IHwgSlF1ZXJ5LCBvcHRpb25zIDogb2JqZWN0KSB7XHJcbiAgICAgICAgLy9BZGQgRGVmYXVsdCBQYXJhbWV0ZXJzIHRvIG9wdGlvbnNcclxuICAgICAgICBjb25zdCB7IGVsZW1lbnRzLCB2YWx1ZXMsIHJlbmRlciwgYmluZHMsIGJpbmRBdHRyLCBiaW5kSW5BdHRyLCBpc0pRdWVyeSwgY29ubmVjdGlvbnMsIHJlbW92ZU9ubG9hZCB9IDogRG9jT2JqZWN0T3B0aW9ucyA9IERvY09iamVjdC5kZWZhdWx0UGFyYW1zKG9wdGlvbnMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9FeHRyYWN0IERPTSBlbGVtZW50IGZyb20gSFRNTEVsZW1lbnQgT3IgSnF1ZXJ5IE9iamVjdFxyXG4gICAgICAgIGxldCByb290RWxlbWVudCA9IERvY09iamVjdC50b05vZGVBcnJheShyb290KVswXVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0XHJcbiAgICAgICAgaWYocm9vdEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApe1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QgPSByb290RWxlbWVudFxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBydW5FcnJvcihST09UX0VSUk9SLCB0cnVlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbnMgPSBjb25uZWN0aW9ucztcclxuXHJcbiAgICAgICAgLy9TZXQgSnF1ZXJ5XHJcbiAgICAgICAgaWYoaXNKUXVlcnkgJiYgd2luZG93LmpRdWVyeSl7XHJcbiAgICAgICAgICAgIC8vSWYgSnF1ZXJ5IGlzIGRldGVjdGVkIGFuZCBpcyBzZXQgdG8ganF1ZXJ5IG1vZGUuLi5cclxuICAgICAgICAgICAgdGhpcy5faXNKUXVlcnkgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy9TZXQgUXVlcnkgU2VsZWN0IHN0YXRlbWVudCB0byB1c2UgalF1ZXJ5XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiAkKHRoaXMucm9vdCkuZmluZCguLi5wcm9wcylcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIC8vSWYgSnF1ZXJ5IGlzIG5vdCBkZXRlY3RlZC4uLlxyXG4gICAgICAgICAgICBpZihpc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAvL0lmIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICAgICAgcnVuRXJyb3IoSlFVRVJZX05PVF9ERVRFQ1RFRCwgZmFsc2UpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9TZXQgUXVlcnkgU2VsZWN0IHN0YXRlbWVudCB0byB1c2UgSFRNTEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbFxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl9xdWVyeVNlbGVjdCA9ICguLi5wcm9wcykgPT4gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoLi4ucHJvcHMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1NldCBSb290IE9iamVjdCB0byB0aGlzXHJcbiAgICAgICAgdGhpcy5yb290Ll9Eb2NPYmplY3QgPSB0aGlzO1xyXG5cclxuICAgICAgICAvL1NldCBSZW5kZXIgRnVuY3Rpb25zXHJcbiAgICAgICAgdGhpcy5yZW5kZXIgPSByZW5kZXI7XHJcblxyXG4gICAgICAgIC8vQ3JlYXRlIFJlbGF0ZWQgRG9jR2VuXHJcbiAgICAgICAgdGhpcy5nID0gbmV3IERvY0dlbih0aGlzKVxyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEZ1bmN0aW9uc1xyXG4gICAgICAgIHRoaXMuYmluZHMgPSAodHlwZW9mIGJpbmRzID09PSAnZnVuY3Rpb24nKSA/IGJpbmRzKHRoaXMuZykgOiBiaW5kcyA7XHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgQXR0cmlidXRlXHJcbiAgICAgICAgdGhpcy5iaW5kQXR0ciA9IGJpbmRBdHRyO1xyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEluIEF0dHJpYnV0ZVxyXG4gICAgICAgIHRoaXMuYmluZEluQXR0ciA9IGJpbmRJbkF0dHI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUXVlcnkgUHJveHlcclxuICAgICAgICB0aGlzLnF1ZXJ5ID0gbmV3IFByb3h5KHt9LCB7XHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCApID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wID09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAgdGFyZ2V0W3Byb3BdID8gdGFyZ2V0W3Byb3BdIDogXyA9PiB0aGlzLl9xdWVyeVNlbGVjdCggLy4qKFxcLnxcXCN8XFxbfFxcXSkuKi9nbS5leGVjKHByb3ApID8gcHJvcCA6ICcjJyArIHByb3AgKSBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB2YWx1ZSA9ICgpID0+IHRoaXMuX3F1ZXJ5U2VsZWN0KHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gXyA9PiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9TZXQgRWxlbWVudHMgUHJveHlcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0gbmV3IFByb3h5KHRoaXMucXVlcnksIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vQWRkIGluIGVsZW1lbnRzIGZyb20gb3B0aW9uc1xyXG4gICAgICAgIGlmIChlbGVtZW50cykge1xyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhlbGVtZW50cykuZm9yRWFjaCgoZSA9PiB7IHRoaXMucXVlcnlbZVswXV0gPSBlWzFdIH0pKVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3ZhbHVlcyA9IG5ldyBQcm94eSghdmFsdWVzIHx8IHR5cGVvZiB2YWx1ZXMgIT09ICdvYmplY3QnID8ge30gOiB2YWx1ZXMsIHtcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsgW3Byb3BdOiB2YWx1ZSB9KVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHtbcHJvcF06dmFsdWV9KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgIFxyXG4gICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vbkxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsgW3RydWUgYXMgYW55XTogdHJ1ZSB9KVxyXG4gICAgICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHRoaXMudmFsdWVzKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIXJlbW92ZU9ubG9hZCl7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuX2lzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgICQodGhpcy5vbkxvYWQpXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgd2luZG93Lm9ubG9hZCA9IHRoaXMub25Mb2FkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGlzQmluZEluKGVsZW1lbnQgOiBEb2NPYmplY3REb21CaW5kKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoIGVsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEluQXR0cikgJiYgdHJ1ZSApIFxyXG4gICAgfVxyXG4gICAgaXNCaW5kKGVsZW1lbnQgOiBEb2NPYmplY3REb21CaW5kKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnIHx8IGVsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpKSAmJiB0cnVlXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgaXNEb2JPYmplY3RFbGVtZW50KGVsZW1lbnQgOiBEb2NPYmplY3RFbGVtZW50ICkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKCBlbGVtZW50Ll9Eb2NPYmplY3QgaW5zdGFuY2VvZiBEb2NPYmplY3QgIClcclxuICAgIH1cclxuXHJcblxyXG4gICAgZmluZE9yUmVnaXN0ZXJCaW5kKERPTWVsZW1lbnQgOiBEb2NPYmplY3REb21CaW5kKSA6IERvY09iamVjdENvbmZpZyB7XHJcbiAgICAgICAgaWYoRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBsZXQgb3JpZ2luYWxDaGlsZHJlbiA9IFsuLi5ET01lbGVtZW50LmNoaWxkTm9kZXNdXHJcbiAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW4udG9TdHJpbmcgPSAoKT0+IERPTWVsZW1lbnQuaW5uZXJIVE1MXHJcbiAgICAgICAgICAgIERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW4sXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENoaWxkcmVuSFRNTDogRE9NZWxlbWVudC5pbm5lckhUTUwsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEF0dHJpYnV0ZXM6IFsuLi5ET01lbGVtZW50LmF0dHJpYnV0ZXNdLnJlZHVjZSggKGEsYyk9PntyZXR1cm4gey4uLmEsIFtjLm5hbWVdOmMudmFsdWV9IH0sIHt9IClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnXHJcbiAgICB9XHJcblxyXG4gICAgZ2VuZXJhdGVCaW5kKGVsZW1lbnQgOiBEb2NPYmplY3REb21CaW5kLCBiaW5kLCBib3VuZCA6IERvY09iamVjdEhUTUxMaWtlICkgOiBEb2NPYmplY3REb21CaW5kIHwgTm9kZVtdIHtcclxuICAgICAgICBjb25zdCBjb25maWcgPSBlbGVtZW50Ll9Eb2NPYmplY3RDb25maWc7XHJcbiAgICAgICAgY29uc3Qgbm9kZUFycmF5ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KGJvdW5kKTtcclxuICAgICAgICBpZih0aGlzLmlzQmluZChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IG5vZGVBcnJheS5maW5kKGVsID0+IGVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIGFzIERvY09iamVjdERvbUJpbmQ7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKChmaXJzdEVsZW1lbnQubG9jYWxOYW1lID09PSAnZC1iaW5kJyA/ICd0bycgOiB0aGlzLmJpbmRBdHRyKSwgYmluZClcclxuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoY29uZmlnLm9yaWdpbmFsQXR0cmlidXRlcykuZmlsdGVyKGF0dEE9PiEoWydkLWJpbmQtaW4nLCAndG8nXS5pbmNsdWRlcyhhdHRBWzBdKSkpLmZvckVhY2goYXR0QT0+Zmlyc3RFbGVtZW50LnNldEF0dHJpYnV0ZShhdHRBWzBdLCBhdHRBWzFdKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0RWxlbWVudDtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVBcnJheTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgXHJcblxyXG4gICAgcnVuUmVuZGVyKHZhbHVlQ2hhbmdlcyA9IHt9KSA6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVuZGVyLmZpbHRlcihyZW4gPT4gKHJlbi5kZXAgJiYgQXJyYXkuaXNBcnJheShyZW4uZGVwKSAmJiByZW4uZGVwLnNvbWUoKGRlcHApID0+IChkZXBwIGluIHZhbHVlQ2hhbmdlcykpKSB8fCAocmVuLmRlcCA9PT0gdW5kZWZpbmVkKSkuZm9yRWFjaChyZW4gPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVuLmNsZWFuKSByZW4uY2xlYW4oeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIHRoaXMudmFsdWVzKVxyXG4gICAgICAgICAgICByZW4uYWN0aW9uKHsgLi4udGhpcy52YWx1ZXMsIC4uLnZhbHVlQ2hhbmdlcyB9LCB0aGlzLnZhbHVlcylcclxuICAgICAgICB9KVxyXG4gICAgICAgIHRoaXMucnVuQmluZHModGhpcy5yb290LCB2YWx1ZUNoYW5nZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEJpbmRBY3Rpb24oZWxlbWVudCA6IEhUTUxFbGVtZW50KSA6IFtzdHJpbmcsIChyZXBsYWNlIDogTm9kZSAmIE5vZGVMaXN0ICk9PnZvaWRdIHtcclxuICAgICAgICBpZih0aGlzLmlzQmluZChlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIGlmKGVsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0ciksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfWVsc2UgaWYoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RvJyksIChyZXBsYWNlKT0+ZWxlbWVudC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlLCBlbGVtZW50KV1cclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9ZWxzZSBpZih0aGlzLmlzQmluZEluKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRJbkF0dHIpLCAocmVwbGFjZSk9PntcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHJlcGxhY2UpIGVsZW1lbnQuYXBwZW5kQ2hpbGQobm9kZSk7XHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcXVlcnlTZWxlY3RvckFsbCA9IChzZWxlY3RvciA6IHN0cmluZykgPT4gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXHJcbiAgICBydW5CaW5kcyhyb290LCB2YWx1ZUNoYW5nZXMgPSB7fSkge1xyXG4gICAgICAgIChBcnJheS5pc0FycmF5KHJvb3QpID8gcm9vdCA6IFtyb290XSkgXHJcbiAgICAgICAgLmZpbHRlcihydD0+cnQgJiYgcnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcclxuICAgICAgICAuZm9yRWFjaCgocnQpPT57XHJcbiAgICAgICAgICAgIFsgLi4uKHJ0LnF1ZXJ5U2VsZWN0b3JBbGwoYFske3RoaXMuYmluZEF0dHJ9XSwgWyR7dGhpcy5iaW5kSW5BdHRyfV0sIGQtYmluZFt0b11gKSkgXSBcclxuICAgICAgICAgICAgLmZvckVhY2goIGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy9HZXQgVGhlIEJpbmQgTWV0aG9kLCBhbmQgdGhlIEZ1bmN0aW9uIHRvIGluc2VydCBIVE1MIFxyXG4gICAgICAgICAgICAgICAgY29uc3QgW2JpbmQsIGJpbmRBY3Rpb25dID0gdGhpcy5nZXRCaW5kQWN0aW9uKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIEJpbmQgRXhpc3RzIFxyXG4gICAgICAgICAgICAgICAgaWYgKGJpbmQgaW4gdGhpcy5iaW5kcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0dldCBPciByZWdpc3RlciBCaW5kIFRhZydzIENvbmZpZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmZpbmRPclJlZ2lzdGVyQmluZChlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9JbnNlcnQgSFRNTFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kQWN0aW9uKHRoaXMucnVuQmluZHMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vV3JhcCBCaW5kIE1ldGhvZCB0byBwcmVwYXJlIGJpbmQgZm9yIGRvY3VtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlQmluZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5kLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1J1biBCaW5kIE1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmluZHNbYmluZF0oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgLi4udGhpcy52YWx1ZXMsIC4uLnZhbHVlQ2hhbmdlcyB9LCAvL1Bhc3MgaW4gdXBkYXRlcyB2YWx1ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm9yaWdpbmFsQXR0cmlidXRlcywgLy9QYXNzIGluIG9yaWdpbmFsIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm9yaWdpbmFsQ2hpbGRyZW4sIC8vUGFzcyBpbiBvcmlnaW5hbCBjaGlsZHJlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUNoYW5nZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiByb290O1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bkNvbm5lY3Rpb25zKHZhbHVlQ2hhbmdlcyA6IHtba2V5IDogc3RyaW5nfHN5bWJvbF0gOiBhbnkgfSA9IHtbdHJ1ZSBhcyBhbnldOnRydWV9ICl7XHJcbiAgICAgICAgZm9yKGxldCBreSBpbiB2YWx1ZUNoYW5nZXMpe1xyXG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9ucy5mb3JFYWNoKChjb25uZWN0ZWQpID0+IGNvbm5lY3RlZC52YWx1ZXNba3ldID0gdmFsdWVDaGFuZ2VzW2t5XSlcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3QoLi4uZG9jT2JqZWN0cyA6IFtEb2NPYmplY3RdKXtcclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IFsuLi50aGlzLl9jb25uZWN0aW9ucywgLi4uZG9jT2JqZWN0c11cclxuICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHRoaXMudmFsdWVzKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuXHJcblxyXG4vKlxyXG52YXIgZG9jID0gbmV3IERvY09iamVjdCh7XHJcbiAgICB2YWx1ZXM6IHtcclxuICAgIH0sXHJcbiAgICBlbGVtZW50czp7XHJcblxyXG4gICAgfSxcclxuICAgIGJpbmRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBbXHJcblxyXG4gICAgXVxyXG59KTsgJChkb2Mub25Mb2FkKVxyXG4qLyIsIlxyXG5cclxuZXhwb3J0IGNvbnN0IFJPT1RfRVJST1IgPSAnUk9PVF9FUlJPUidcclxuZXhwb3J0IGNvbnN0IEpRVUVSWV9OT1RfREVURUNURUQgPSAnSlFVRVJZX05PVF9ERVRFQ1RFRCdcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBydW5FcnJvcihlcnJvciA6IHN0cmluZywgZmFpbD1mYWxzZSl7XHJcbiAgICBpZihlcnJvciBpbiBFUlJPUlMpe1xyXG4gICAgICAgIGlmKGZhaWwpe1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignRG9jT2JqZWN0OiAnKyBFUlJPUlNbZXJyb3JdLm1lc3NhZ2UpO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKEVSUk9SU1tlcnJvcl0ubWVzc2FnZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IEVSUk9SUyA9IHtcclxuICAgIFJPT1RfRVJST1IgOiB7XHJcbiAgICAgICAgbWVzc2FnZTogXCJSb290IEVsZW1lbnQgTXVzdCBiZSBhIHZhbGlkIE5vZGUsIE9yIGpRdWVyeSBFbGVtZW50XCJcclxuICAgIH0sXHJcbiAgICBKUVVFUllfTk9UX0RFVEVDVEVEOiB7XHJcbiAgICAgICAgbWVzc2FnZSA6IFwiSlF1ZXJ5IGlzIG5vdCBkZXRlY3RlZC4gUGxlYXNlIGxvYWQgSlF1ZXJ5IGJlZm9yZSBEb2NPYmplY3RcIlxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IERvY09iamVjdCwgRG9jT2JqZWN0RWxlbWVudCB9IGZyb20gXCIuL2RvY29iamVjdFwiO1xyXG5pbXBvcnQgRG9jR2VuIGZyb20gXCIuL2RvY2dlblwiO1xyXG5pbXBvcnQge3NldEN1cnNvclBvcywgZ2V0Q3Vyc29yUG9zfSBmcm9tIFwiLi91dGlsc1wiXHJcblxyXG5jbGFzcyBCaW5kIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgfVxyXG59XHJcblxyXG4vKioqKioqKiBVVElMSVRZIE1FVEhPRFMgKioqKioqKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpeElucHV0KHNlbGVjdG9yLCBhY3Rpb24pe1xyXG4gICAgbGV0IHBvcyA9IGdldEN1cnNvclBvcyhzZWxlY3RvcigpWzBdKVxyXG4gICAgYWN0aW9uKClcclxuICAgIHNldEN1cnNvclBvcyhzZWxlY3RvcigpWzBdLCBwb3MpXHJcbn1cclxuXHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkLWJpbmQnLCBCaW5kKVxyXG5pZih3aW5kb3cualF1ZXJ5KXtcclxuICAgIChmdW5jdGlvbigkKSB7XHJcbiAgICAgICAgJC5mbi5leHRlbmQoe1xyXG4gICAgICAgICAgICBEb2NPYmplY3QgOiBmdW5jdGlvbiggb3B0aW9ucyA9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXNbMF0uX0RvY09iamVjdCAmJiAhb3B0aW9ucyApIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCB7IGlzSlF1ZXJ5OnRydWUsIC4uLm9wdGlvbnMgfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSkoalF1ZXJ5KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9iaihyb290IDogRG9jT2JqZWN0RWxlbWVudCB8IEpRdWVyeSwgb3B0aW9ucyA6IG9iamVjdCkgOiBEb2NPYmplY3R7XHJcbiAgICByZXR1cm4gbmV3IERvY09iamVjdChyb290LCBvcHRpb25zKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuKCkgOiBEb2NHZW4ge1xyXG4gICAgcmV0dXJuIG5ldyBEb2NHZW4oKVxyXG59XHJcbiIsImludGVyZmFjZSBEb2N1bWVudCB7XHJcbiAgICBzZWxlY3Rpb246IHtcclxuICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuLy8gQ3JlZGl0czogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjg5NzE1NS9nZXQtY3Vyc29yLXBvc2l0aW9uLWluLWNoYXJhY3RlcnMtd2l0aGluLWEtdGV4dC1pbnB1dC1maWVsZFxyXG4gZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCkgOiBudW1iZXIge1xyXG4gICAgLy8gaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xyXG4gICAgLy8gICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIC8vICAgICByZXR1cm4gIGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLWVsZW1lbnQudmFsdWUubGVuZ3RoKTtcclxuICAgIC8vIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudC5zZWxlY3Rpb25EaXJlY3Rpb24gPT0gJ2JhY2t3YXJkJyA/IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgOiBlbGVtZW50LnNlbGVjdGlvbkVuZDtcclxufVxyXG5cclxuLy8gQ3JlZGl0czogaHR0cDovL2Jsb2cudmlzaGFsb24ubmV0L2luZGV4LnBocC9qYXZhc2NyaXB0LWdldHRpbmctYW5kLXNldHRpbmctY2FyZXQtcG9zaXRpb24taW4tdGV4dGFyZWEvXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDdXJzb3JQb3MoZWxlbWVudCA6IEhUTUxJbnB1dEVsZW1lbnQsIHBvcyA6IG51bWJlcikgOiB2b2lkIHtcclxuICAgIC8vIE1vZGVybiBicm93c2Vyc1xyXG4gICAgaWYgKGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcclxuICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgIGVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xyXG4gICAgXHJcbiAgICAvLyBJRTggYW5kIGJlbG93XHJcbiAgICB9IGVsc2UgaWYgKChlbGVtZW50IGFzIGFueSkuY3JlYXRlVGV4dFJhbmdlKSB7XHJcbiAgICAgIHZhciByYW5nZSA9IChlbGVtZW50IGFzIGFueSkuY3JlYXRlVGV4dFJhbmdlKCk7XHJcbiAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xyXG4gICAgICByYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBwb3MpO1xyXG4gICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLnNlbGVjdCgpO1xyXG4gICAgfVxyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3RzL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
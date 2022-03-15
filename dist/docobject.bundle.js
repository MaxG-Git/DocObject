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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7OztBQ2xDRCxtSEFBbUg7QUFDbEgsU0FBZ0IsWUFBWSxDQUFDLE9BQTBCO0lBQ3BELDRCQUE0QjtJQUM1Qix1QkFBdUI7SUFDdkIsOEZBQThGO0lBQzlGLElBQUk7SUFDQSxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFDeEcsQ0FBQztBQU5BLG9DQU1BO0FBRUQseUdBQXlHO0FBQ3pHLFNBQWdCLFlBQVksQ0FBQyxPQUEwQixFQUFFLEdBQVk7SUFDakUsa0JBQWtCO0lBQ2xCLElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO1FBQy9CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXBDLGdCQUFnQjtLQUNmO1NBQU0sSUFBSyxPQUFlLENBQUMsZUFBZSxFQUFFO1FBQzNDLElBQUksS0FBSyxHQUFJLE9BQWUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMvQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNoQjtBQUNMLENBQUM7QUFkRCxvQ0FjQzs7Ozs7OztVQzlCRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2RvY2dlbi50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jb2JqZWN0LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9lcnJvcnMudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2luZGV4LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy91dGlscy50cyIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RG9jT2JqZWN0LCBEb2NPYmplY3RIVE1MTGlrZX0gZnJvbSAnLi9kb2NvYmplY3QnXHJcbmltcG9ydCB7IERvY09iamVjdEJpbmRBdHRyaWJ1dGUgfSBmcm9tICcuL2RvY2JpbmQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2NHZW4ge1xyXG4gICAgXHJcbiAgICBvYmogPyA6IERvY09iamVjdCBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iob2JqPyA6IERvY09iamVjdCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vYmogPSBvYmpcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XHJcbiAgICAgICAgICAgIGdldDoodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICByZXR1cm4gdGhpcy5HZW4ocHJvcCBhcyBzdHJpbmcpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIEdlbihwcm9wIDogc3RyaW5nKXtcclxuICAgICAgICByZXR1cm4gKGlubmVyIDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gPSBbXSAsIGF0dHJzIDogRG9jT2JqZWN0QmluZEF0dHJpYnV0ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZih0aGlzLm9iaiAmJiBwcm9wIGluIHRoaXMub2JqLmJpbmRzKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kID0gdGhpcy5vYmouYmluZHNbcHJvcF0odGhpcy5vYmoudmFsdWVzLCBhdHRycywgRG9jT2JqZWN0LnRvTm9kZUFycmF5KGlubmVyKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYm91bmQgPT09ICdmdW5jdGlvbicgPyBib3VuZCh0aGlzLm9iai5nKSA6IGJvdW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChwcm9wKVxyXG4gICAgICAgICAgICBmb3IobGV0IGtleSBpbiBhdHRycyl7XHJcbiAgICAgICAgICAgICAgICBpZihrZXkgPT09ICdzdHlsZScgJiYgdHlwZW9mIGF0dHJzW2tleV0gPT09ICdvYmplY3QnICl7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBza2V5IGluIGF0dHJzW2tleSBhcyBzdHJpbmddKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZVtza2V5XSA9IGF0dHJzW2tleV1bc2tleV1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoa2V5LnN0YXJ0c1dpdGgoJ29uJykpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRba2V5XSA9IGF0dHJzW2tleV1cclxuICAgICAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBEb2NPYmplY3QudG9Ob2RlQXJyYXkoaW5uZXIpLmZvckVhY2goaW5lID0+IHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5lKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBEb2NPYmplY3REb21CaW5kLCBEb2NPYmplY3RCaW5kLCBEb2NPYmplY3RCaW5kR2VuIH0gZnJvbSAnLi9kb2NiaW5kJ1xyXG5pbXBvcnQgeyBEb2NPYmplY3RSZW5kZXIgfSBmcm9tICcuL2RvY3JlbmRlcidcclxuaW1wb3J0ICBEb2NHZW4gIGZyb20gJy4vZG9jZ2VuJ1xyXG5pbXBvcnQgcnVuRXJyb3IsIHsgXHJcbiAgICBST09UX0VSUk9SLFxyXG4gICAgSlFVRVJZX05PVF9ERVRFQ1RFRFxyXG59IGZyb20gJy4vZXJyb3JzJztcclxuXHJcbi8qKioqKioqIEdMT0JBTFMgKioqKioqKi9cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICAgICAgalF1ZXJ5OmFueTtcclxuICAgICAgICBtc0NyeXB0bzphbnk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4vKioqKioqKiBET0MgT0JKRUNUICoqKioqKiovXHJcbmV4cG9ydCB0eXBlIERvY09iamVjdEhUTUxMaWtlID0gXHJcbnwgTm9kZVxyXG58IE5vZGVMaXN0XHJcbnwgSlF1ZXJ5IFxyXG58IE51bWJlclxyXG58IHN0cmluZ1xyXG58ICgoZ2VuOiBEb2NHZW4pID0+IERvY09iamVjdEhUTUxMaWtlKTtcclxuXHJcblxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdE9wdGlvbnMge1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kIHwgRG9jT2JqZWN0QmluZEdlbjtcclxuICAgIGVsZW1lbnRzIDoge1trZXk6c3RyaW5nXTogc3RyaW5nfTtcclxuICAgIHZhbHVlcyA6IG9iamVjdDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIGlzSlF1ZXJ5IDogYm9vbGVhbjtcclxuICAgIGNvbm5lY3Rpb25zIDogQXJyYXk8RG9jT2JqZWN0PlxyXG4gICAgcmVtb3ZlT25sb2FkIDogYm9vbGVhblxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERvY09iamVjdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBfRG9jT2JqZWN0PyA6IERvY09iamVjdFxyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jT2JqZWN0RWxlbWVudHMge1xyXG4gICAgW2tleTogc3RyaW5nXSA6IHN0cmluZyB8ICgoc2VsZWN0b3IgOiBzdHJpbmcgKSA9PiBOb2RlTGlzdHxKUXVlcnkpXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgIG9yaWdpbmFsQ2hpbGRyZW46IEFycmF5PE5vZGU+O1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IHN0cmluZztcclxuICAgIG9yaWdpbmFsQXR0cmlidXRlczoge1trZXk6c3RyaW5nXSA6IHN0cmluZ307XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRG9jT2JqZWN0IHtcclxuXHJcbiAgICBzdGF0aWMgcGFyc2VyIDogRE9NUGFyc2VyID0gbmV3IERPTVBhcnNlcigpXHJcblxyXG4gICAgc3RhdGljIHRvTm9kZUFycmF5KGFueSA6IERvY09iamVjdEhUTUxMaWtlIHwgQXJyYXk8c3RyaW5nfE5vZGU+ICkgOiBBcnJheTxOb2RlPiB7XHJcbiAgICAgICAgaWYodHlwZW9mIGFueSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGFueSA9PT0gJ251bWJlcicpe1xyXG4gICAgICAgICAgICByZXR1cm4gWy4uLkRvY09iamVjdC5wYXJzZXIucGFyc2VGcm9tU3RyaW5nKGFueS50b1N0cmluZygpLCAndGV4dC9odG1sJykuYm9keS5jaGlsZE5vZGVzXVxyXG4gICAgICAgIH1lbHNlIGlmKE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGFueSkgfHwgKHdpbmRvdy5qUXVlcnkgJiYgYW55IGluc3RhbmNlb2YgalF1ZXJ5KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbIC4uLihhbnkgYXMgTm9kZUxpc3QpXVxyXG4gICAgICAgIH1lbHNlIGlmKEFycmF5LmlzQXJyYXkoYW55KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhbnlcclxuICAgICAgICAgICAgLmZpbHRlcihlPT4gKHR5cGVvZiBlID09PSAnc3RyaW5nJykgfHwgZSBpbnN0YW5jZW9mIE5vZGUgKVxyXG4gICAgICAgICAgICAubWFwKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSA/IERvY09iamVjdC50b05vZGVBcnJheShlKVswXSA6IGUgKTtcclxuICAgICAgICB9IGVsc2UgaWYoYW55IGluc3RhbmNlb2YgTm9kZSB8fCBhbnkgaW5zdGFuY2VvZiBEb2N1bWVudCApe1xyXG4gICAgICAgICAgICByZXR1cm4gW2FueV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGRlZmF1bHRQYXJhbXMoe1xyXG4gICAgICAgIHJlbmRlciA9IFtdLFxyXG4gICAgICAgIGJpbmRzID0ge30sXHJcbiAgICAgICAgZWxlbWVudHMgPSB7fSxcclxuICAgICAgICB2YWx1ZXMgPSB7fSxcclxuICAgICAgICBiaW5kQXR0ciA9ICdkLWJpbmQnLFxyXG4gICAgICAgIGJpbmRJbkF0dHIgPSAnZC1iaW5kLWluJyxcclxuICAgICAgICBpc0pRdWVyeSA9IGZhbHNlLFxyXG4gICAgICAgIGNvbm5lY3Rpb25zID0gW10sXHJcbiAgICAgICAgcmVtb3ZlT25sb2FkID0gZmFsc2VcclxuICAgIH0gPSB7fSkgOiBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4gIHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgcmVhZG9ubHkgX3ZhbHVlcyA6IG9iamVjdDtcclxuICAgIGVsZW1lbnRzIDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIHJvb3QgOiBEb2NPYmplY3RFbGVtZW50O1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kO1xyXG4gICAgYmluZEF0dHIgOiBzdHJpbmc7XHJcbiAgICBiaW5kSW5BdHRyIDogc3RyaW5nO1xyXG4gICAgcXVlcnkgOiBQcm94eUhhbmRsZXI8RG9jT2JqZWN0RWxlbWVudHM+O1xyXG4gICAgX3F1ZXJ5U2VsZWN0IDogKHNlbGVjdG9yOnN0cmluZyk9PiBOb2RlTGlzdCB8IEpRdWVyeTtcclxuICAgIF9pc0pRdWVyeSA6IGJvb2xlYW5cclxuICAgIF9jb25uZWN0aW9ucyA6IEFycmF5PERvY09iamVjdD5cclxuICAgIGcgOiBEb2NHZW5cclxuICAgIG9uTG9hZDogKCk9PnZvaWRcclxuXHJcbiAgICBzZXQgdmFsdWVzKHZhbHVlcykge1xyXG4gICAgICAgIHRocm93IEVycm9yKFwiVHJpZWQgdG8gc2V0IERvY09iamVjdC52YWx1ZS4gVHJ5IGNyZWF0aW5nIGEgaW5uZXIgb2JqZWN0IGluc3RlYWQuXCIpXHJcbiAgICB9XHJcbiAgICBnZXQgdmFsdWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnMgOiBvYmplY3QpIHtcclxuICAgICAgICAvL0FkZCBEZWZhdWx0IFBhcmFtZXRlcnMgdG8gb3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gOiBEb2NPYmplY3RPcHRpb25zID0gRG9jT2JqZWN0LmRlZmF1bHRQYXJhbXMob3B0aW9ucylcclxuICAgICAgICBcclxuICAgICAgICAvL0V4dHJhY3QgRE9NIGVsZW1lbnQgZnJvbSBIVE1MRWxlbWVudCBPciBKcXVlcnkgT2JqZWN0XHJcbiAgICAgICAgbGV0IHJvb3RFbGVtZW50ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KHJvb3QpWzBdXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUm9vdCBPYmplY3RcclxuICAgICAgICBpZihyb290RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHJvb3RFbGVtZW50XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJ1bkVycm9yKFJPT1RfRVJST1IsIHRydWUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IGNvbm5lY3Rpb25zO1xyXG5cclxuICAgICAgICAvL1NldCBKcXVlcnlcclxuICAgICAgICBpZihpc0pRdWVyeSAmJiB3aW5kb3cualF1ZXJ5KXtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgZGV0ZWN0ZWQgYW5kIGlzIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBqUXVlcnlcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnlTZWxlY3QgPSAoLi4ucHJvcHMpID0+ICQodGhpcy5yb290KS5maW5kKC4uLnByb3BzKVxyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgbm90IGRldGVjdGVkLi4uXHJcbiAgICAgICAgICAgIGlmKGlzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgIC8vSWYgc2V0IHRvIGpxdWVyeSBtb2RlLi4uXHJcbiAgICAgICAgICAgICAgICBydW5FcnJvcihKUVVFUllfTk9UX0RFVEVDVEVELCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBIVE1MRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsXHJcbiAgICAgICAgICAgIHRoaXMuX2lzSlF1ZXJ5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiB0aGlzLnJvb3QucXVlcnlTZWxlY3RvckFsbCguLi5wcm9wcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0IHRvIHRoaXNcclxuICAgICAgICB0aGlzLnJvb3QuX0RvY09iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vU2V0IFJlbmRlciBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLnJlbmRlciA9IHJlbmRlcjtcclxuXHJcbiAgICAgICAgLy9DcmVhdGUgUmVsYXRlZCBEb2NHZW5cclxuICAgICAgICB0aGlzLmcgPSBuZXcgRG9jR2VuKHRoaXMpXHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgRnVuY3Rpb25zXHJcbiAgICAgICAgdGhpcy5iaW5kcyA9ICh0eXBlb2YgYmluZHMgPT09ICdmdW5jdGlvbicpID8gYmluZHModGhpcy5nKSA6IGJpbmRzIDtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBBdHRyaWJ1dGVcclxuICAgICAgICB0aGlzLmJpbmRBdHRyID0gYmluZEF0dHI7XHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgSW4gQXR0cmlidXRlXHJcbiAgICAgICAgdGhpcy5iaW5kSW5BdHRyID0gYmluZEluQXR0cjtcclxuICAgICAgICBcclxuICAgICAgICAvL1NldCBRdWVyeSBQcm94eVxyXG4gICAgICAgIHRoaXMucXVlcnkgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wICkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHByb3AgPT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICB0YXJnZXRbcHJvcF0gPyB0YXJnZXRbcHJvcF0gOiBfID0+IHRoaXMuX3F1ZXJ5U2VsZWN0KCAvLiooXFwufFxcI3xcXFt8XFxdKS4qL2dtLmV4ZWMocHJvcCkgPyBwcm9wIDogJyMnICsgcHJvcCApIFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHZhbHVlID0gKCkgPT4gdGhpcy5fcXVlcnlTZWxlY3QodmFsdWUpXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKXtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBfID0+IHZhbHVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvL1NldCBFbGVtZW50cyBQcm94eVxyXG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSBuZXcgUHJveHkodGhpcy5xdWVyeSwge1xyXG4gICAgICAgICAgICBnZXQ6ICh0YXJnZXQsIHByb3ApID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF0oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9BZGQgaW4gZWxlbWVudHMgZnJvbSBvcHRpb25zXHJcbiAgICAgICAgaWYgKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGVsZW1lbnRzKS5mb3JFYWNoKChlID0+IHsgdGhpcy5xdWVyeVtlWzBdXSA9IGVbMV0gfSkpXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5fdmFsdWVzID0gbmV3IFByb3h5KCF2YWx1ZXMgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcgPyB7fSA6IHZhbHVlcywge1xyXG4gICAgICAgICAgICBzZXQ6ICh0YXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW5SZW5kZXIoeyBbcHJvcF06IHZhbHVlIH0pXHJcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnMoe1twcm9wXTp2YWx1ZX0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgXHJcbiAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm9uTG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ydW5SZW5kZXIoeyBbdHJ1ZSBhcyBhbnldOiB0cnVlIH0pXHJcbiAgICAgICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnModGhpcy52YWx1ZXMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighcmVtb3ZlT25sb2FkKXtcclxuICAgICAgICAgICAgaWYodGhpcy5faXNKUXVlcnkpe1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzLm9uTG9hZClcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cub25sb2FkID0gdGhpcy5vbkxvYWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgaXNCaW5kSW4oZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSAmJiB0cnVlICkgXHJcbiAgICB9XHJcbiAgICBpc0JpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpICYmIHRydWVcclxuICAgIH1cclxuICAgIHN0YXRpYyBpc0RvYk9iamVjdEVsZW1lbnQoZWxlbWVudCA6IERvY09iamVjdEVsZW1lbnQgKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAoIGVsZW1lbnQuX0RvY09iamVjdCBpbnN0YW5jZW9mIERvY09iamVjdCAgKVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmaW5kT3JSZWdpc3RlckJpbmQoRE9NZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgICAgICBpZihET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIGxldCBvcmlnaW5hbENoaWxkcmVuID0gWy4uLkRPTWVsZW1lbnQuY2hpbGROb2Rlc11cclxuICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbi50b1N0cmluZyA9ICgpPT4gRE9NZWxlbWVudC5pbm5lckhUTUxcclxuICAgICAgICAgICAgRE9NZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbixcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ2hpbGRyZW5IVE1MOiBET01lbGVtZW50LmlubmVySFRNTCxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQXR0cmlidXRlczogWy4uLkRPTWVsZW1lbnQuYXR0cmlidXRlc10ucmVkdWNlKCAoYSxjKT0+e3JldHVybiB7Li4uYSwgW2MubmFtZV06Yy52YWx1ZX0gfSwge30gKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWdcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUJpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQsIGJpbmQsIGJvdW5kIDogRG9jT2JqZWN0SFRNTExpa2UpIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheSh0eXBlb2YgYm91bmQgPT09ICdmdW5jdGlvbicgPyBib3VuZCh0aGlzLmcpIDogYm91bmQpO1xyXG4gICAgICAgIGlmKHRoaXMuaXNCaW5kKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50ID0gbm9kZUFycmF5LmZpbmQoZWwgPT4gZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgYXMgRG9jT2JqZWN0RG9tQmluZDtcclxuICAgICAgICAgICAgZmlyc3RFbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgICAgIGZpcnN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoKGZpcnN0RWxlbWVudC5sb2NhbE5hbWUgPT09ICdkLWJpbmQnID8gJ3RvJyA6IHRoaXMuYmluZEF0dHIpLCBiaW5kKVxyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzKS5maWx0ZXIoYXR0QT0+IShbJ2QtYmluZC1pbicsICd0byddLmluY2x1ZGVzKGF0dEFbMF0pKSkuZm9yRWFjaChhdHRBPT5maXJzdEVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dEFbMF0sIGF0dEFbMV0pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RFbGVtZW50O1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZUFycmF5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICBydW5SZW5kZXIodmFsdWVDaGFuZ2VzID0ge30pIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIuZmlsdGVyKHJlbiA9PiAocmVuLmRlcCAmJiBBcnJheS5pc0FycmF5KHJlbi5kZXApICYmIHJlbi5kZXAuc29tZSgoZGVwcCkgPT4gKGRlcHAgaW4gdmFsdWVDaGFuZ2VzKSkpIHx8IChyZW4uZGVwID09PSB1bmRlZmluZWQpKS5mb3JFYWNoKHJlbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZW4uY2xlYW4pIHJlbi5jbGVhbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgICAgIHJlbi5hY3Rpb24oeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIHRoaXMudmFsdWVzKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5ydW5CaW5kcyh0aGlzLnJvb3QsIHZhbHVlQ2hhbmdlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QmluZEFjdGlvbihlbGVtZW50IDogSFRNTEVsZW1lbnQpIDogW3N0cmluZywgKHJlcGxhY2UgOiBOb2RlICYgTm9kZUxpc3QgKT0+dm9pZF0ge1xyXG4gICAgICAgIGlmKHRoaXMuaXNCaW5kKGVsZW1lbnQpKXtcclxuICAgICAgICAgICAgaWYoZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSwgKHJlcGxhY2UpPT5lbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHJlcGxhY2UsIGVsZW1lbnQpXVxyXG4gICAgICAgICAgICB9ZWxzZSBpZihlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50LmdldEF0dHJpYnV0ZSgndG8nKSwgKHJlcGxhY2UpPT5lbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHJlcGxhY2UsIGVsZW1lbnQpXVxyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1lbHNlIGlmKHRoaXMuaXNCaW5kSW4oZWxlbWVudCkpe1xyXG4gICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEluQXR0ciksIChyZXBsYWNlKT0+e1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgcmVwbGFjZSkgZWxlbWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBxdWVyeVNlbGVjdG9yQWxsID0gKHNlbGVjdG9yIDogc3RyaW5nKSA9PiB0aGlzLnJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcclxuICAgIHJ1bkJpbmRzKHJvb3QsIHZhbHVlQ2hhbmdlcyA9IHt9KSB7XHJcbiAgICAgICAgKEFycmF5LmlzQXJyYXkocm9vdCkgPyByb290IDogW3Jvb3RdKSBcclxuICAgICAgICAuZmlsdGVyKHJ0PT5ydCAmJiBydCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxyXG4gICAgICAgIC5mb3JFYWNoKChydCk9PntcclxuICAgICAgICAgICAgWyAuLi4ocnQucXVlcnlTZWxlY3RvckFsbChgWyR7dGhpcy5iaW5kQXR0cn1dLCBbJHt0aGlzLmJpbmRJbkF0dHJ9XSwgZC1iaW5kW3RvXWApKSBdIFxyXG4gICAgICAgICAgICAuZm9yRWFjaCggZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL0dldCBUaGUgQmluZCBNZXRob2QsIGFuZCB0aGUgRnVuY3Rpb24gdG8gaW5zZXJ0IEhUTUwgXHJcbiAgICAgICAgICAgICAgICBjb25zdCBbYmluZCwgYmluZEFjdGlvbl0gPSB0aGlzLmdldEJpbmRBY3Rpb24oZWxlbWVudClcclxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgQmluZCBFeGlzdHMgXHJcbiAgICAgICAgICAgICAgICBpZiAoYmluZCBpbiB0aGlzLmJpbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vR2V0IE9yIHJlZ2lzdGVyIEJpbmQgVGFnJ3MgQ29uZmlnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZmluZE9yUmVnaXN0ZXJCaW5kKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0luc2VydCBIVE1MXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRBY3Rpb24odGhpcy5ydW5CaW5kcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9XcmFwIEJpbmQgTWV0aG9kIHRvIHByZXBhcmUgYmluZCBmb3IgZG9jdW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVCaW5kKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUnVuIEJpbmQgTWV0aG9kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kc1tiaW5kXShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAuLi50aGlzLnZhbHVlcywgLi4udmFsdWVDaGFuZ2VzIH0sIC8vUGFzcyBpbiB1cGRhdGVzIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxBdHRyaWJ1dGVzLCAvL1Bhc3MgaW4gb3JpZ2luYWwgYXR0cmlidXRlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcub3JpZ2luYWxDaGlsZHJlbiwgLy9QYXNzIGluIG9yaWdpbmFsIGNoaWxkcmVuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQ2hhbmdlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIHJvb3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuQ29ubmVjdGlvbnModmFsdWVDaGFuZ2VzIDoge1trZXkgOiBzdHJpbmd8c3ltYm9sXSA6IGFueSB9ID0ge1t0cnVlIGFzIGFueV06dHJ1ZX0gKXtcclxuICAgICAgICBmb3IobGV0IGt5IGluIHZhbHVlQ2hhbmdlcyl7XHJcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmZvckVhY2goKGNvbm5lY3RlZCkgPT4gY29ubmVjdGVkLnZhbHVlc1treV0gPSB2YWx1ZUNoYW5nZXNba3ldKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdCguLi5kb2NPYmplY3RzIDogW0RvY09iamVjdF0pe1xyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gWy4uLnRoaXMuX2Nvbm5lY3Rpb25zLCAuLi5kb2NPYmplY3RzXVxyXG4gICAgICAgIHRoaXMucnVuQ29ubmVjdGlvbnModGhpcy52YWx1ZXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuXHJcbi8qXHJcbnZhciBkb2MgPSBuZXcgRG9jT2JqZWN0KHtcclxuICAgIHZhbHVlczoge1xyXG4gICAgfSxcclxuICAgIGVsZW1lbnRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgYmluZHM6e1xyXG5cclxuICAgIH0sXHJcbiAgICByZW5kZXI6IFtcclxuXHJcbiAgICBdXHJcbn0pOyAkKGRvYy5vbkxvYWQpXHJcbiovIiwiXHJcblxyXG5leHBvcnQgY29uc3QgUk9PVF9FUlJPUiA9ICdST09UX0VSUk9SJ1xyXG5leHBvcnQgY29uc3QgSlFVRVJZX05PVF9ERVRFQ1RFRCA9ICdKUVVFUllfTk9UX0RFVEVDVEVEJ1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bkVycm9yKGVycm9yIDogc3RyaW5nLCBmYWlsPWZhbHNlKXtcclxuICAgIGlmKGVycm9yIGluIEVSUk9SUyl7XHJcbiAgICAgICAgaWYoZmFpbCl7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdEb2NPYmplY3Q6ICcrIEVSUk9SU1tlcnJvcl0ubWVzc2FnZSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoRVJST1JTW2Vycm9yXS5tZXNzYWdlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgRVJST1JTID0ge1xyXG4gICAgUk9PVF9FUlJPUiA6IHtcclxuICAgICAgICBtZXNzYWdlOiBcIlJvb3QgRWxlbWVudCBNdXN0IGJlIGEgdmFsaWQgTm9kZSwgT3IgalF1ZXJ5IEVsZW1lbnRcIlxyXG4gICAgfSxcclxuICAgIEpRVUVSWV9OT1RfREVURUNURUQ6IHtcclxuICAgICAgICBtZXNzYWdlIDogXCJKUXVlcnkgaXMgbm90IGRldGVjdGVkLiBQbGVhc2UgbG9hZCBKUXVlcnkgYmVmb3JlIERvY09iamVjdFwiXHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRG9jT2JqZWN0LCBEb2NPYmplY3RFbGVtZW50IH0gZnJvbSBcIi4vZG9jb2JqZWN0XCI7XHJcbmltcG9ydCBEb2NHZW4gZnJvbSBcIi4vZG9jZ2VuXCI7XHJcbmltcG9ydCB7c2V0Q3Vyc29yUG9zLCBnZXRDdXJzb3JQb3N9IGZyb20gXCIuL3V0aWxzXCJcclxuXHJcbmNsYXNzIEJpbmQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKioqKioqIFVUSUxJVFkgTUVUSE9EUyAqKioqKioqL1xyXG5leHBvcnQgZnVuY3Rpb24gZml4SW5wdXQoc2VsZWN0b3IsIGFjdGlvbil7XHJcbiAgICBsZXQgcG9zID0gZ2V0Q3Vyc29yUG9zKHNlbGVjdG9yKClbMF0pXHJcbiAgICBhY3Rpb24oKVxyXG4gICAgc2V0Q3Vyc29yUG9zKHNlbGVjdG9yKClbMF0sIHBvcylcclxufVxyXG5cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2QtYmluZCcsIEJpbmQpXHJcbmlmKHdpbmRvdy5qUXVlcnkpe1xyXG4gICAgKGZ1bmN0aW9uKCQpIHtcclxuICAgICAgICAkLmZuLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIERvY09iamVjdCA6IGZ1bmN0aW9uKCBvcHRpb25zID0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpc1swXS5fRG9jT2JqZWN0ICYmICFvcHRpb25zICkgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBuZXcgRG9jT2JqZWN0KHRoaXMsIHsgaXNKUXVlcnk6dHJ1ZSwgLi4ub3B0aW9ucyB9KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0uX0RvY09iamVjdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KShqUXVlcnkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb2JqKHJvb3QgOiBEb2NPYmplY3RFbGVtZW50IHwgSlF1ZXJ5LCBvcHRpb25zIDogb2JqZWN0KSA6IERvY09iamVjdHtcclxuICAgIHJldHVybiBuZXcgRG9jT2JqZWN0KHJvb3QsIG9wdGlvbnMpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZW4oKSA6IERvY0dlbiB7XHJcbiAgICByZXR1cm4gbmV3IERvY0dlbigpXHJcbn1cclxuIiwiaW50ZXJmYWNlIERvY3VtZW50IHtcclxuICAgIHNlbGVjdGlvbjoge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yODk3MTU1L2dldC1jdXJzb3ItcG9zaXRpb24taW4tY2hhcmFjdGVycy13aXRoaW4tYS10ZXh0LWlucHV0LWZpZWxkXHJcbiBleHBvcnQgZnVuY3Rpb24gZ2V0Q3Vyc29yUG9zKGVsZW1lbnQgOiBIVE1MSW5wdXRFbGVtZW50KSA6IG51bWJlciB7XHJcbiAgICAvLyBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAvLyAgICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgLy8gICAgIHJldHVybiAgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtZWxlbWVudC52YWx1ZS5sZW5ndGgpO1xyXG4gICAgLy8gfVxyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnNlbGVjdGlvbkRpcmVjdGlvbiA9PSAnYmFja3dhcmQnID8gZWxlbWVudC5zZWxlY3Rpb25TdGFydCA6IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwOi8vYmxvZy52aXNoYWxvbi5uZXQvaW5kZXgucGhwL2phdmFzY3JpcHQtZ2V0dGluZy1hbmQtc2V0dGluZy1jYXJldC1wb3NpdGlvbi1pbi10ZXh0YXJlYS9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCwgcG9zIDogbnVtYmVyKSA6IHZvaWQge1xyXG4gICAgLy8gTW9kZXJuIGJyb3dzZXJzXHJcbiAgICBpZiAoZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICBcclxuICAgIC8vIElFOCBhbmQgYmVsb3dcclxuICAgIH0gZWxzZSBpZiAoKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UpIHtcclxuICAgICAgdmFyIHJhbmdlID0gKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UoKTtcclxuICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XHJcbiAgICAgIHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgcG9zKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0KCk7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvdHMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
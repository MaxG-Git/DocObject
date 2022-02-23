var Doc;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.obj = exports.DocObject = exports.fixInput = void 0;
const utils_1 = __webpack_require__(/*! ./utils */ "./src/ts/utils.ts");
const errors_1 = __importStar(__webpack_require__(/*! ./errors */ "./src/ts/errors.ts"));
/******* UTILITY METHODS *******/
function fixInput(selector, action) {
    let pos = (0, utils_1.getCursorPos)(selector()[0]);
    action();
    (0, utils_1.setCursorPos)(selector()[0], pos);
}
exports.fixInput = fixInput;
class Bind extends HTMLElement {
    constructor() {
        super();
    }
}
window.customElements.define('d-bind', Bind);
class DocObject {
    constructor(root, options) {
        //Add Default Parameters to options
        const { elements, values, render, binds, bindAttr, bindInAttr, isJQuery } = DocObject.defaultParams(options);
        //Extract DOM element from HTMLElement Or Jquery Object
        let rootElement = DocObject.toNodeArray(root)[0];
        //Set Root Object
        if (rootElement instanceof HTMLElement) {
            this.root = rootElement;
        }
        else {
            (0, errors_1.default)(errors_1.ROOT_ERROR, true);
        }
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
        //Set Bind Functions
        this.binds = binds;
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
                return true;
            }
        });
        this.onLoad = () => {
            this.runRender({ [true]: true });
        };
        if (this._isJQuery) {
            $(this.onLoad);
        }
        else {
            window.onload = this.onLoad;
        }
    }
    static toNodeArray(any) {
        if (typeof any === 'string') {
            return [...DocObject.parser.parseFromString(any, 'text/html').body.childNodes];
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
    static defaultParams({ render = [], binds = {}, elements = {}, values = {}, bindAttr = 'd-bind', bindInAttr = 'd-bind-in', isJQuery = false } = {}) {
        return { elements, values, render, binds, bindAttr, bindInAttr, isJQuery };
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
}
exports.DocObject = DocObject;
DocObject.parser = new DOMParser();
if (window.jQuery) {
    (function ($) {
        $.fn.extend({
            DocObject: function (options = null) {
                if (this[0]._DocObject && !options)
                    return this[0]._DocObject;
                this.each(function () {
                    new DocObject(this, options);
                });
                new DocObject(this, Object.assign({ isJQuery: true }, options));
                return this[0]._DocObject;
            }
        });
    })(jQuery);
}
function obj(root, options) {
    return new DocObject(root, options);
}
exports.obj = obj;
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/ts/docobject.ts");
/******/ 	Doc = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvZG9jb2JqZWN0LnRzIiwid2VicGFjazovL0RvYy8uL3NyYy90cy9lcnJvcnMudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL3V0aWxzLnRzIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9Eb2Mvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7c2V0Q3Vyc29yUG9zLCBnZXRDdXJzb3JQb3N9IGZyb20gXCIuL3V0aWxzXCJcclxuaW1wb3J0IHsgRG9jT2JqZWN0RG9tQmluZCwgRG9jT2JqZWN0QmluZCB9IGZyb20gJy4vZG9jYmluZCdcclxuaW1wb3J0IHsgRG9jT2JqZWN0UmVuZGVyIH0gZnJvbSAnLi9kb2NyZW5kZXInXHJcbmltcG9ydCBydW5FcnJvciwgeyBcclxuICAgIFJPT1RfRVJST1IsXHJcbiAgICBKUVVFUllfTk9UX0RFVEVDVEVEXHJcbn0gZnJvbSAnLi9lcnJvcnMnO1xyXG5cclxuLyoqKioqKiogR0xPQkFMUyAqKioqKioqL1xyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgICBpbnRlcmZhY2UgV2luZG93IHtcclxuICAgICAgICBqUXVlcnk6YW55O1xyXG4gICAgICAgIG1zQ3J5cHRvOmFueTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbi8qKioqKioqIFVUSUxJVFkgTUVUSE9EUyAqKioqKioqL1xyXG5leHBvcnQgZnVuY3Rpb24gZml4SW5wdXQoc2VsZWN0b3IsIGFjdGlvbil7XHJcbiAgICBsZXQgcG9zID0gZ2V0Q3Vyc29yUG9zKHNlbGVjdG9yKClbMF0pXHJcbiAgICBhY3Rpb24oKVxyXG4gICAgc2V0Q3Vyc29yUG9zKHNlbGVjdG9yKClbMF0sIHBvcylcclxufVxyXG5cclxuXHJcbi8qKioqKioqIERPQyBPQkpFQ1QgKioqKioqKi9cclxuZXhwb3J0IHR5cGUgRG9jT2JqZWN0SFRNTExpa2UgPSBcclxufCBOb2RlXHJcbnwgTm9kZUxpc3RcclxufCBKUXVlcnkgXHJcbnwgc3RyaW5nO1xyXG5cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgIHJlbmRlciA6IERvY09iamVjdFJlbmRlcjtcclxuICAgIGJpbmRzIDogRG9jT2JqZWN0QmluZDtcclxuICAgIGVsZW1lbnRzIDoge1trZXk6c3RyaW5nXTogc3RyaW5nfTtcclxuICAgIHZhbHVlcyA6IG9iamVjdDtcclxuICAgIGJpbmRBdHRyIDogc3RyaW5nO1xyXG4gICAgYmluZEluQXR0ciA6IHN0cmluZztcclxuICAgIGlzSlF1ZXJ5IDogYm9vbGVhbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBfRG9jT2JqZWN0PyA6IERvY09iamVjdFxyXG59XHJcblxyXG5pbnRlcmZhY2UgRG9jT2JqZWN0RWxlbWVudHMge1xyXG4gICAgW2tleTogc3RyaW5nXSA6IHN0cmluZyB8ICgoc2VsZWN0b3IgOiBzdHJpbmcgKSA9PiBOb2RlTGlzdHxKUXVlcnkpXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRG9jT2JqZWN0Q29uZmlnIHtcclxuICAgIG9yaWdpbmFsQ2hpbGRyZW46IEFycmF5PE5vZGU+O1xyXG4gICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IHN0cmluZztcclxuICAgIG9yaWdpbmFsQXR0cmlidXRlczoge1trZXk6c3RyaW5nXSA6IHN0cmluZ307XHJcbn1cclxuXHJcbmNsYXNzIEJpbmQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICB9XHJcbn1cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZC1iaW5kJywgQmluZClcclxuZXhwb3J0IGNsYXNzIERvY09iamVjdCB7XHJcblxyXG4gICAgc3RhdGljIHBhcnNlciA6IERPTVBhcnNlciA9IG5ldyBET01QYXJzZXIoKVxyXG5cclxuICAgIHN0YXRpYyB0b05vZGVBcnJheShhbnkgOiBEb2NPYmplY3RIVE1MTGlrZSB8IEFycmF5PHN0cmluZ3xOb2RlPiApIDogQXJyYXk8Tm9kZT4ge1xyXG4gICAgICAgIGlmKHR5cGVvZiBhbnkgPT09ICdzdHJpbmcnKXtcclxuICAgICAgICAgICAgcmV0dXJuIFsuLi5Eb2NPYmplY3QucGFyc2VyLnBhcnNlRnJvbVN0cmluZyhhbnksICd0ZXh0L2h0bWwnKS5ib2R5LmNoaWxkTm9kZXNdXHJcbiAgICAgICAgfWVsc2UgaWYoTm9kZUxpc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYW55KSB8fCAod2luZG93LmpRdWVyeSAmJiBhbnkgaW5zdGFuY2VvZiBqUXVlcnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIFsgLi4uKGFueSBhcyBOb2RlTGlzdCldXHJcbiAgICAgICAgfWVsc2UgaWYoQXJyYXkuaXNBcnJheShhbnkpKXtcclxuICAgICAgICAgICAgcmV0dXJuIGFueVxyXG4gICAgICAgICAgICAuZmlsdGVyKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSB8fCBlIGluc3RhbmNlb2YgTm9kZSApXHJcbiAgICAgICAgICAgIC5tYXAoZT0+ICh0eXBlb2YgZSA9PT0gJ3N0cmluZycpID8gRG9jT2JqZWN0LnRvTm9kZUFycmF5KGUpWzBdIDogZSApO1xyXG4gICAgICAgIH0gZWxzZSBpZihhbnkgaW5zdGFuY2VvZiBOb2RlIHx8IGFueSBpbnN0YW5jZW9mIERvY3VtZW50ICl7XHJcbiAgICAgICAgICAgIHJldHVybiBbYW55XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGVmYXVsdFBhcmFtcyh7XHJcbiAgICAgICAgcmVuZGVyID0gW10sXHJcbiAgICAgICAgYmluZHMgPSB7fSxcclxuICAgICAgICBlbGVtZW50cyA9IHt9LFxyXG4gICAgICAgIHZhbHVlcyA9IHt9LFxyXG4gICAgICAgIGJpbmRBdHRyID0gJ2QtYmluZCcsXHJcbiAgICAgICAgYmluZEluQXR0ciA9ICdkLWJpbmQtaW4nLFxyXG4gICAgICAgIGlzSlF1ZXJ5ID0gZmFsc2VcclxuICAgIH0gPSB7fSkgOiBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4gIHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5IH0gXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgX3ZhbHVlcyA6IG9iamVjdDtcclxuICAgIGVsZW1lbnRzIDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIHJvb3QgOiBEb2NPYmplY3RFbGVtZW50O1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kO1xyXG4gICAgYmluZEF0dHIgOiBzdHJpbmc7XHJcbiAgICBiaW5kSW5BdHRyIDogc3RyaW5nO1xyXG4gICAgcXVlcnkgOiBQcm94eUhhbmRsZXI8RG9jT2JqZWN0RWxlbWVudHM+O1xyXG4gICAgX3F1ZXJ5U2VsZWN0IDogKHNlbGVjdG9yOnN0cmluZyk9PiBOb2RlTGlzdCB8IEpRdWVyeTtcclxuICAgIF9pc0pRdWVyeSA6IGJvb2xlYW5cclxuICAgIG9uTG9hZDogKCk9PnZvaWRcclxuXHJcbiAgICBzZXQgdmFsdWVzKHZhbHVlcykge1xyXG4gICAgICAgIHRocm93IEVycm9yKFwiVHJpZWQgdG8gc2V0IERvY09iamVjdC52YWx1ZS4gVHJ5IGNyZWF0aW5nIGEgaW5uZXIgb2JqZWN0IGluc3RlYWQuXCIpXHJcbiAgICB9XHJcbiAgICBnZXQgdmFsdWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnMgOiBvYmplY3QpIHtcclxuICAgICAgICAvL0FkZCBEZWZhdWx0IFBhcmFtZXRlcnMgdG8gb3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5IH0gOiBEb2NPYmplY3RPcHRpb25zID0gRG9jT2JqZWN0LmRlZmF1bHRQYXJhbXMob3B0aW9ucylcclxuICAgICAgICBcclxuICAgICAgICAvL0V4dHJhY3QgRE9NIGVsZW1lbnQgZnJvbSBIVE1MRWxlbWVudCBPciBKcXVlcnkgT2JqZWN0XHJcbiAgICAgICAgbGV0IHJvb3RFbGVtZW50ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KHJvb3QpWzBdXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUm9vdCBPYmplY3RcclxuICAgICAgICBpZihyb290RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHJvb3RFbGVtZW50XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJ1bkVycm9yKFJPT1RfRVJST1IsIHRydWUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1NldCBKcXVlcnlcclxuICAgICAgICBpZihpc0pRdWVyeSAmJiB3aW5kb3cualF1ZXJ5KXtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgZGV0ZWN0ZWQgYW5kIGlzIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBqUXVlcnlcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnlTZWxlY3QgPSAoLi4ucHJvcHMpID0+ICQodGhpcy5yb290KS5maW5kKC4uLnByb3BzKVxyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgbm90IGRldGVjdGVkLi4uXHJcbiAgICAgICAgICAgIGlmKGlzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgIC8vSWYgc2V0IHRvIGpxdWVyeSBtb2RlLi4uXHJcbiAgICAgICAgICAgICAgICBydW5FcnJvcihKUVVFUllfTk9UX0RFVEVDVEVELCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBIVE1MRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsXHJcbiAgICAgICAgICAgIHRoaXMuX2lzSlF1ZXJ5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiB0aGlzLnJvb3QucXVlcnlTZWxlY3RvckFsbCguLi5wcm9wcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0IHRvIHRoaXNcclxuICAgICAgICB0aGlzLnJvb3QuX0RvY09iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vU2V0IFJlbmRlciBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLnJlbmRlciA9IHJlbmRlcjtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLmJpbmRzID0gYmluZHM7XHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgQXR0cmlidXRlXHJcbiAgICAgICAgdGhpcy5iaW5kQXR0ciA9IGJpbmRBdHRyO1xyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEluIEF0dHJpYnV0ZVxyXG4gICAgICAgIHRoaXMuYmluZEluQXR0ciA9IGJpbmRJbkF0dHI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUXVlcnkgUHJveHlcclxuICAgICAgICB0aGlzLnF1ZXJ5ID0gbmV3IFByb3h5KHt9LCB7XHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCApID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wID09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAgdGFyZ2V0W3Byb3BdID8gdGFyZ2V0W3Byb3BdIDogXyA9PiB0aGlzLl9xdWVyeVNlbGVjdCggLy4qKFxcLnxcXCN8XFxbfFxcXSkuKi9nbS5leGVjKHByb3ApID8gcHJvcCA6ICcjJyArIHByb3AgKSBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB2YWx1ZSA9ICgpID0+IHRoaXMuX3F1ZXJ5U2VsZWN0KHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gXyA9PiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9TZXQgRWxlbWVudHMgUHJveHlcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0gbmV3IFByb3h5KHRoaXMucXVlcnksIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vQWRkIGluIGVsZW1lbnRzIGZyb20gb3B0aW9uc1xyXG4gICAgICAgIGlmIChlbGVtZW50cykge1xyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhlbGVtZW50cykuZm9yRWFjaCgoZSA9PiB7IHRoaXMucXVlcnlbZVswXV0gPSBlWzFdIH0pKVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3ZhbHVlcyA9IG5ldyBQcm94eSghdmFsdWVzIHx8IHR5cGVvZiB2YWx1ZXMgIT09ICdvYmplY3QnID8ge30gOiB2YWx1ZXMsIHtcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsgW3Byb3BdOiB2YWx1ZSB9KVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vbkxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsgW3RydWUgYXMgYW55XTogdHJ1ZSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLl9pc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICQodGhpcy5vbkxvYWQpXHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHdpbmRvdy5vbmxvYWQgPSB0aGlzLm9uTG9hZFxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgaXNCaW5kSW4oZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSAmJiB0cnVlICkgXHJcbiAgICB9XHJcbiAgICBpc0JpbmQoZWxlbWVudCA6IERvY09iamVjdERvbUJpbmQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kQXR0cikpICYmIHRydWVcclxuICAgIH1cclxuICAgIGZpbmRPclJlZ2lzdGVyQmluZChET01lbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBEb2NPYmplY3RDb25maWcge1xyXG4gICAgICAgIGlmKERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgbGV0IG9yaWdpbmFsQ2hpbGRyZW4gPSBbLi4uRE9NZWxlbWVudC5jaGlsZE5vZGVzXVxyXG4gICAgICAgICAgICBvcmlnaW5hbENoaWxkcmVuLnRvU3RyaW5nID0gKCk9PiBET01lbGVtZW50LmlubmVySFRNTFxyXG4gICAgICAgICAgICBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENoaWxkcmVuLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IERPTWVsZW1lbnQuaW5uZXJIVE1MLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxBdHRyaWJ1dGVzOiBbLi4uRE9NZWxlbWVudC5hdHRyaWJ1dGVzXS5yZWR1Y2UoIChhLGMpPT57cmV0dXJuIHsuLi5hLCBbYy5uYW1lXTpjLnZhbHVlfSB9LCB7fSApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZ1xyXG4gICAgfVxyXG5cclxuICAgIGdlbmVyYXRlQmluZChlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCwgYmluZCwgYm91bmQgOiBEb2NPYmplY3RIVE1MTGlrZSApIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheShib3VuZCk7XHJcbiAgICAgICAgaWYodGhpcy5pc0JpbmQoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdEVsZW1lbnQgPSBub2RlQXJyYXkuZmluZChlbCA9PiBlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSBhcyBEb2NPYmplY3REb21CaW5kO1xyXG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICAgICAgZmlyc3RFbGVtZW50LnNldEF0dHJpYnV0ZSgoZmlyc3RFbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgPyAndG8nIDogdGhpcy5iaW5kQXR0ciksIGJpbmQpXHJcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGNvbmZpZy5vcmlnaW5hbEF0dHJpYnV0ZXMpLmZpbHRlcihhdHRBPT4hKFsnZC1iaW5kLWluJywgJ3RvJ10uaW5jbHVkZXMoYXR0QVswXSkpKS5mb3JFYWNoKGF0dEE9PmZpcnN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0QVswXSwgYXR0QVsxXSkpXHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdEVsZW1lbnQ7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlQXJyYXk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG5cclxuICAgIHJ1blJlbmRlcih2YWx1ZUNoYW5nZXMgPSB7fSkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbmRlci5maWx0ZXIocmVuID0+IChyZW4uZGVwICYmIEFycmF5LmlzQXJyYXkocmVuLmRlcCkgJiYgcmVuLmRlcC5zb21lKChkZXBwKSA9PiAoZGVwcCBpbiB2YWx1ZUNoYW5nZXMpKSkgfHwgKHJlbi5kZXAgPT09IHVuZGVmaW5lZCkpLmZvckVhY2gocmVuID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlbi5jbGVhbikgcmVuLmNsZWFuKHsgLi4udGhpcy52YWx1ZXMsIC4uLnZhbHVlQ2hhbmdlcyB9LCB0aGlzLnZhbHVlcylcclxuICAgICAgICAgICAgcmVuLmFjdGlvbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLnJ1bkJpbmRzKHRoaXMucm9vdCwgdmFsdWVDaGFuZ2VzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRCaW5kQWN0aW9uKGVsZW1lbnQgOiBIVE1MRWxlbWVudCkgOiBbc3RyaW5nLCAocmVwbGFjZSA6IE5vZGUgJiBOb2RlTGlzdCApPT52b2lkXSB7XHJcbiAgICAgICAgaWYodGhpcy5pc0JpbmQoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICBpZihlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpLCAocmVwbGFjZSk9PmVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocmVwbGFjZSwgZWxlbWVudCldXHJcbiAgICAgICAgICAgIH1lbHNlIGlmKGVsZW1lbnQubG9jYWxOYW1lID09PSAnZC1iaW5kJyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKCd0bycpLCAocmVwbGFjZSk9PmVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocmVwbGFjZSwgZWxlbWVudCldXHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfWVsc2UgaWYodGhpcy5pc0JpbmRJbihlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSwgKHJlcGxhY2UpPT57XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiByZXBsYWNlKSBlbGVtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcnVuQmluZHMocm9vdCwgdmFsdWVDaGFuZ2VzID0ge30pIHtcclxuICAgICAgICAoQXJyYXkuaXNBcnJheShyb290KSA/IHJvb3QgOiBbcm9vdF0pIFxyXG4gICAgICAgIC5maWx0ZXIocnQ9PnJ0ICYmIHJ0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgICAgLmZvckVhY2goKHJ0KT0+e1xyXG4gICAgICAgICAgICBbIC4uLihydC5xdWVyeVNlbGVjdG9yQWxsKGBbJHt0aGlzLmJpbmRBdHRyfV0sIFske3RoaXMuYmluZEluQXR0cn1dLCBkLWJpbmRbdG9dYCkpIF0gXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKCBlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIC8vR2V0IFRoZSBCaW5kIE1ldGhvZCwgYW5kIHRoZSBGdW5jdGlvbiB0byBpbnNlcnQgSFRNTCBcclxuICAgICAgICAgICAgICAgIGNvbnN0IFtiaW5kLCBiaW5kQWN0aW9uXSA9IHRoaXMuZ2V0QmluZEFjdGlvbihlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBCaW5kIEV4aXN0cyBcclxuICAgICAgICAgICAgICAgIGlmIChiaW5kIGluIHRoaXMuYmluZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgT3IgcmVnaXN0ZXIgQmluZCBUYWcncyBDb25maWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5maW5kT3JSZWdpc3RlckJpbmQoZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5zZXJ0IEhUTUxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZEFjdGlvbih0aGlzLnJ1bkJpbmRzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1dyYXAgQmluZCBNZXRob2QgdG8gcHJlcGFyZSBiaW5kIGZvciBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZUJpbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZCwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9SdW4gQmluZCBNZXRob2RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJpbmRzW2JpbmRdKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgLy9QYXNzIGluIHVwZGF0ZXMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5vcmlnaW5hbEF0dHJpYnV0ZXMsIC8vUGFzcyBpbiBvcmlnaW5hbCBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5vcmlnaW5hbENoaWxkcmVuLCAvL1Bhc3MgaW4gb3JpZ2luYWwgY2hpbGRyZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gcm9vdDtcclxuICAgIH1cclxufVxyXG5pZih3aW5kb3cualF1ZXJ5KXtcclxuICAgIChmdW5jdGlvbigkKSB7XHJcbiAgICAgICAgJC5mbi5leHRlbmQoe1xyXG4gICAgICAgICAgICBEb2NPYmplY3QgOiBmdW5jdGlvbiggb3B0aW9ucyA9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXNbMF0uX0RvY09iamVjdCAmJiAhb3B0aW9ucyApIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbmV3IERvY09iamVjdCh0aGlzLCB7IGlzSlF1ZXJ5OnRydWUsIC4uLm9wdGlvbnMgfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWzBdLl9Eb2NPYmplY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSkoalF1ZXJ5KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9iaihyb290IDogRG9jT2JqZWN0RWxlbWVudCB8IEpRdWVyeSwgb3B0aW9ucyA6IG9iamVjdCkgOiBEb2NPYmplY3R7XHJcbiAgICByZXR1cm4gbmV3IERvY09iamVjdChyb290LCBvcHRpb25zKVxyXG59XHJcblxyXG5cclxuLypcclxudmFyIGRvYyA9IG5ldyBEb2NPYmplY3Qoe1xyXG4gICAgdmFsdWVzOiB7XHJcbiAgICB9LFxyXG4gICAgZWxlbWVudHM6e1xyXG5cclxuICAgIH0sXHJcbiAgICBiaW5kczp7XHJcblxyXG4gICAgfSxcclxuICAgIHJlbmRlcjogW1xyXG5cclxuICAgIF1cclxufSk7ICQoZG9jLm9uTG9hZClcclxuKi8iLCJcclxuXHJcbmV4cG9ydCBjb25zdCBST09UX0VSUk9SID0gJ1JPT1RfRVJST1InXHJcbmV4cG9ydCBjb25zdCBKUVVFUllfTk9UX0RFVEVDVEVEID0gJ0pRVUVSWV9OT1RfREVURUNURUQnXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcnVuRXJyb3IoZXJyb3IgOiBzdHJpbmcsIGZhaWw9ZmFsc2Upe1xyXG4gICAgaWYoZXJyb3IgaW4gRVJST1JTKXtcclxuICAgICAgICBpZihmYWlsKXtcclxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ0RvY09iamVjdDogJysgRVJST1JTW2Vycm9yXS5tZXNzYWdlKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihFUlJPUlNbZXJyb3JdLm1lc3NhZ2UpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBFUlJPUlMgPSB7XHJcbiAgICBST09UX0VSUk9SIDoge1xyXG4gICAgICAgIG1lc3NhZ2U6IFwiUm9vdCBFbGVtZW50IE11c3QgYmUgYSB2YWxpZCBOb2RlLCBPciBqUXVlcnkgRWxlbWVudFwiXHJcbiAgICB9LFxyXG4gICAgSlFVRVJZX05PVF9ERVRFQ1RFRDoge1xyXG4gICAgICAgIG1lc3NhZ2UgOiBcIkpRdWVyeSBpcyBub3QgZGV0ZWN0ZWQuIFBsZWFzZSBsb2FkIEpRdWVyeSBiZWZvcmUgRG9jT2JqZWN0XCJcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgRG9jdW1lbnQge1xyXG4gICAgc2VsZWN0aW9uOiB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIENyZWRpdHM6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI4OTcxNTUvZ2V0LWN1cnNvci1wb3NpdGlvbi1pbi1jaGFyYWN0ZXJzLXdpdGhpbi1hLXRleHQtaW5wdXQtZmllbGRcclxuIGV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3JQb3MoZWxlbWVudCA6IEhUTUxJbnB1dEVsZW1lbnQpIDogbnVtYmVyIHtcclxuICAgIC8vIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcclxuICAgIC8vICAgICBlbGVtZW50LmZvY3VzKCk7XHJcbiAgICAvLyAgICAgcmV0dXJuICBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC1lbGVtZW50LnZhbHVlLmxlbmd0aCk7XHJcbiAgICAvLyB9XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuc2VsZWN0aW9uRGlyZWN0aW9uID09ICdiYWNrd2FyZCcgPyBlbGVtZW50LnNlbGVjdGlvblN0YXJ0IDogZWxlbWVudC5zZWxlY3Rpb25FbmQ7XHJcbn1cclxuXHJcbi8vIENyZWRpdHM6IGh0dHA6Ly9ibG9nLnZpc2hhbG9uLm5ldC9pbmRleC5waHAvamF2YXNjcmlwdC1nZXR0aW5nLWFuZC1zZXR0aW5nLWNhcmV0LXBvc2l0aW9uLWluLXRleHRhcmVhL1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3Vyc29yUG9zKGVsZW1lbnQgOiBIVE1MSW5wdXRFbGVtZW50LCBwb3MgOiBudW1iZXIpIDogdm9pZCB7XHJcbiAgICAvLyBNb2Rlcm4gYnJvd3NlcnNcclxuICAgIGlmIChlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKSB7XHJcbiAgICBlbGVtZW50LmZvY3VzKCk7XHJcbiAgICBlbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTtcclxuICAgIFxyXG4gICAgLy8gSUU4IGFuZCBiZWxvd1xyXG4gICAgfSBlbHNlIGlmICgoZWxlbWVudCBhcyBhbnkpLmNyZWF0ZVRleHRSYW5nZSkge1xyXG4gICAgICB2YXIgcmFuZ2UgPSAoZWxlbWVudCBhcyBhbnkpLmNyZWF0ZVRleHRSYW5nZSgpO1xyXG4gICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcclxuICAgICAgcmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgcG9zKTtcclxuICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBwb3MpO1xyXG4gICAgICByYW5nZS5zZWxlY3QoKTtcclxuICAgIH1cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy90cy9kb2NvYmplY3QudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
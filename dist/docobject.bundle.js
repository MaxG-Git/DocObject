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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0RvYy8uL3NyYy90cy9kb2NvYmplY3QudHMiLCJ3ZWJwYWNrOi8vRG9jLy4vc3JjL3RzL2Vycm9ycy50cyIsIndlYnBhY2s6Ly9Eb2MvLi9zcmMvdHMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL0RvYy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vRG9jL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHtzZXRDdXJzb3JQb3MsIGdldEN1cnNvclBvc30gZnJvbSBcIi4vdXRpbHNcIlxyXG5pbXBvcnQgeyBEb2NPYmplY3REb21CaW5kLCBEb2NPYmplY3RCaW5kIH0gZnJvbSAnLi9kb2NiaW5kJ1xyXG5pbXBvcnQgeyBEb2NPYmplY3RSZW5kZXIgfSBmcm9tICcuL2RvY3JlbmRlcidcclxuaW1wb3J0IHJ1bkVycm9yLCB7IFxyXG4gICAgUk9PVF9FUlJPUixcclxuICAgIEpRVUVSWV9OT1RfREVURUNURURcclxufSBmcm9tICcuL2Vycm9ycyc7XHJcblxyXG4vKioqKioqKiBHTE9CQUxTICoqKioqKiovXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAgIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgICAgIGpRdWVyeTphbnk7XHJcbiAgICAgICAgbXNDcnlwdG86YW55O1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuLyoqKioqKiogVVRJTElUWSBNRVRIT0RTICoqKioqKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaXhJbnB1dChzZWxlY3RvciwgYWN0aW9uKXtcclxuICAgIGxldCBwb3MgPSBnZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSlcclxuICAgIGFjdGlvbigpXHJcbiAgICBzZXRDdXJzb3JQb3Moc2VsZWN0b3IoKVswXSwgcG9zKVxyXG59XHJcblxyXG5cclxuLyoqKioqKiogRE9DIE9CSkVDVCAqKioqKioqL1xyXG5leHBvcnQgdHlwZSBEb2NPYmplY3RIVE1MTGlrZSA9IFxyXG58IE5vZGVcclxufCBOb2RlTGlzdFxyXG58IEpRdWVyeSBcclxufCBzdHJpbmc7XHJcblxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdE9wdGlvbnMge1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kO1xyXG4gICAgZWxlbWVudHMgOiB7W2tleTpzdHJpbmddOiBzdHJpbmd9O1xyXG4gICAgdmFsdWVzIDogb2JqZWN0O1xyXG4gICAgYmluZEF0dHIgOiBzdHJpbmc7XHJcbiAgICBiaW5kSW5BdHRyIDogc3RyaW5nO1xyXG4gICAgaXNKUXVlcnkgOiBib29sZWFuO1xyXG4gICAgY29ubmVjdGlvbnMgOiBBcnJheTxEb2NPYmplY3Q+XHJcbiAgICByZW1vdmVPbmxvYWQgOiBib29sZWFuXHJcbn1cclxuXHJcbmludGVyZmFjZSBEb2NPYmplY3RFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgX0RvY09iamVjdD8gOiBEb2NPYmplY3RcclxufVxyXG5cclxuaW50ZXJmYWNlIERvY09iamVjdEVsZW1lbnRzIHtcclxuICAgIFtrZXk6IHN0cmluZ10gOiBzdHJpbmcgfCAoKHNlbGVjdG9yIDogc3RyaW5nICkgPT4gTm9kZUxpc3R8SlF1ZXJ5KVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERvY09iamVjdENvbmZpZyB7XHJcbiAgICBvcmlnaW5hbENoaWxkcmVuOiBBcnJheTxOb2RlPjtcclxuICAgIG9yaWdpbmFsQ2hpbGRyZW5IVE1MOiBzdHJpbmc7XHJcbiAgICBvcmlnaW5hbEF0dHJpYnV0ZXM6IHtba2V5OnN0cmluZ10gOiBzdHJpbmd9O1xyXG59XHJcblxyXG5jbGFzcyBCaW5kIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgfVxyXG59XHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2QtYmluZCcsIEJpbmQpXHJcbmV4cG9ydCBjbGFzcyBEb2NPYmplY3Qge1xyXG5cclxuICAgIHN0YXRpYyBwYXJzZXIgOiBET01QYXJzZXIgPSBuZXcgRE9NUGFyc2VyKClcclxuXHJcbiAgICBzdGF0aWMgdG9Ob2RlQXJyYXkoYW55IDogRG9jT2JqZWN0SFRNTExpa2UgfCBBcnJheTxzdHJpbmd8Tm9kZT4gKSA6IEFycmF5PE5vZGU+IHtcclxuICAgICAgICBpZih0eXBlb2YgYW55ID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgICAgIHJldHVybiBbLi4uRG9jT2JqZWN0LnBhcnNlci5wYXJzZUZyb21TdHJpbmcoYW55LCAndGV4dC9odG1sJykuYm9keS5jaGlsZE5vZGVzXVxyXG4gICAgICAgIH1lbHNlIGlmKE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGFueSkgfHwgKHdpbmRvdy5qUXVlcnkgJiYgYW55IGluc3RhbmNlb2YgalF1ZXJ5KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbIC4uLihhbnkgYXMgTm9kZUxpc3QpXVxyXG4gICAgICAgIH1lbHNlIGlmKEFycmF5LmlzQXJyYXkoYW55KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBhbnlcclxuICAgICAgICAgICAgLmZpbHRlcihlPT4gKHR5cGVvZiBlID09PSAnc3RyaW5nJykgfHwgZSBpbnN0YW5jZW9mIE5vZGUgKVxyXG4gICAgICAgICAgICAubWFwKGU9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSA/IERvY09iamVjdC50b05vZGVBcnJheShlKVswXSA6IGUgKTtcclxuICAgICAgICB9IGVsc2UgaWYoYW55IGluc3RhbmNlb2YgTm9kZSB8fCBhbnkgaW5zdGFuY2VvZiBEb2N1bWVudCApe1xyXG4gICAgICAgICAgICByZXR1cm4gW2FueV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGRlZmF1bHRQYXJhbXMoe1xyXG4gICAgICAgIHJlbmRlciA9IFtdLFxyXG4gICAgICAgIGJpbmRzID0ge30sXHJcbiAgICAgICAgZWxlbWVudHMgPSB7fSxcclxuICAgICAgICB2YWx1ZXMgPSB7fSxcclxuICAgICAgICBiaW5kQXR0ciA9ICdkLWJpbmQnLFxyXG4gICAgICAgIGJpbmRJbkF0dHIgPSAnZC1iaW5kLWluJyxcclxuICAgICAgICBpc0pRdWVyeSA9IGZhbHNlLFxyXG4gICAgICAgIGNvbm5lY3Rpb25zID0gW10sXHJcbiAgICAgICAgcmVtb3ZlT25sb2FkID0gZmFsc2VcclxuICAgIH0gPSB7fSkgOiBEb2NPYmplY3RPcHRpb25zIHtcclxuICAgICAgICByZXR1cm4gIHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gXHJcbiAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgcmVhZG9ubHkgX3ZhbHVlcyA6IG9iamVjdDtcclxuICAgIGVsZW1lbnRzIDogUHJveHlIYW5kbGVyPERvY09iamVjdEVsZW1lbnRzPjtcclxuICAgIHJvb3QgOiBEb2NPYmplY3RFbGVtZW50O1xyXG4gICAgcmVuZGVyIDogRG9jT2JqZWN0UmVuZGVyO1xyXG4gICAgYmluZHMgOiBEb2NPYmplY3RCaW5kO1xyXG4gICAgYmluZEF0dHIgOiBzdHJpbmc7XHJcbiAgICBiaW5kSW5BdHRyIDogc3RyaW5nO1xyXG4gICAgcXVlcnkgOiBQcm94eUhhbmRsZXI8RG9jT2JqZWN0RWxlbWVudHM+O1xyXG4gICAgX3F1ZXJ5U2VsZWN0IDogKHNlbGVjdG9yOnN0cmluZyk9PiBOb2RlTGlzdCB8IEpRdWVyeTtcclxuICAgIF9pc0pRdWVyeSA6IGJvb2xlYW5cclxuICAgIF9jb25uZWN0aW9ucyA6IEFycmF5PERvY09iamVjdD5cclxuICAgIG9uTG9hZDogKCk9PnZvaWRcclxuXHJcbiAgICBzZXQgdmFsdWVzKHZhbHVlcykge1xyXG4gICAgICAgIHRocm93IEVycm9yKFwiVHJpZWQgdG8gc2V0IERvY09iamVjdC52YWx1ZS4gVHJ5IGNyZWF0aW5nIGEgaW5uZXIgb2JqZWN0IGluc3RlYWQuXCIpXHJcbiAgICB9XHJcbiAgICBnZXQgdmFsdWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnMgOiBvYmplY3QpIHtcclxuICAgICAgICAvL0FkZCBEZWZhdWx0IFBhcmFtZXRlcnMgdG8gb3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IHsgZWxlbWVudHMsIHZhbHVlcywgcmVuZGVyLCBiaW5kcywgYmluZEF0dHIsIGJpbmRJbkF0dHIsIGlzSlF1ZXJ5LCBjb25uZWN0aW9ucywgcmVtb3ZlT25sb2FkIH0gOiBEb2NPYmplY3RPcHRpb25zID0gRG9jT2JqZWN0LmRlZmF1bHRQYXJhbXMob3B0aW9ucylcclxuICAgICAgICBcclxuICAgICAgICAvL0V4dHJhY3QgRE9NIGVsZW1lbnQgZnJvbSBIVE1MRWxlbWVudCBPciBKcXVlcnkgT2JqZWN0XHJcbiAgICAgICAgbGV0IHJvb3RFbGVtZW50ID0gRG9jT2JqZWN0LnRvTm9kZUFycmF5KHJvb3QpWzBdXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUm9vdCBPYmplY3RcclxuICAgICAgICBpZihyb290RWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHJvb3RFbGVtZW50XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJ1bkVycm9yKFJPT1RfRVJST1IsIHRydWUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucyA9IGNvbm5lY3Rpb25zO1xyXG5cclxuICAgICAgICAvL1NldCBKcXVlcnlcclxuICAgICAgICBpZihpc0pRdWVyeSAmJiB3aW5kb3cualF1ZXJ5KXtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgZGV0ZWN0ZWQgYW5kIGlzIHNldCB0byBqcXVlcnkgbW9kZS4uLlxyXG4gICAgICAgICAgICB0aGlzLl9pc0pRdWVyeSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBqUXVlcnlcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnlTZWxlY3QgPSAoLi4ucHJvcHMpID0+ICQodGhpcy5yb290KS5maW5kKC4uLnByb3BzKVxyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgLy9JZiBKcXVlcnkgaXMgbm90IGRldGVjdGVkLi4uXHJcbiAgICAgICAgICAgIGlmKGlzSlF1ZXJ5KXtcclxuICAgICAgICAgICAgICAgIC8vSWYgc2V0IHRvIGpxdWVyeSBtb2RlLi4uXHJcbiAgICAgICAgICAgICAgICBydW5FcnJvcihKUVVFUllfTk9UX0RFVEVDVEVELCBmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1NldCBRdWVyeSBTZWxlY3Qgc3RhdGVtZW50IHRvIHVzZSBIVE1MRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsXHJcbiAgICAgICAgICAgIHRoaXMuX2lzSlF1ZXJ5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5U2VsZWN0ID0gKC4uLnByb3BzKSA9PiB0aGlzLnJvb3QucXVlcnlTZWxlY3RvckFsbCguLi5wcm9wcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU2V0IFJvb3QgT2JqZWN0IHRvIHRoaXNcclxuICAgICAgICB0aGlzLnJvb3QuX0RvY09iamVjdCA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vU2V0IFJlbmRlciBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLnJlbmRlciA9IHJlbmRlcjtcclxuXHJcbiAgICAgICAgLy9TZXQgQmluZCBGdW5jdGlvbnNcclxuICAgICAgICB0aGlzLmJpbmRzID0gYmluZHM7XHJcblxyXG4gICAgICAgIC8vU2V0IEJpbmQgQXR0cmlidXRlXHJcbiAgICAgICAgdGhpcy5iaW5kQXR0ciA9IGJpbmRBdHRyO1xyXG5cclxuICAgICAgICAvL1NldCBCaW5kIEluIEF0dHJpYnV0ZVxyXG4gICAgICAgIHRoaXMuYmluZEluQXR0ciA9IGJpbmRJbkF0dHI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9TZXQgUXVlcnkgUHJveHlcclxuICAgICAgICB0aGlzLnF1ZXJ5ID0gbmV3IFByb3h5KHt9LCB7XHJcbiAgICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCApID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwcm9wID09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAgdGFyZ2V0W3Byb3BdID8gdGFyZ2V0W3Byb3BdIDogXyA9PiB0aGlzLl9xdWVyeVNlbGVjdCggLy4qKFxcLnxcXCN8XFxbfFxcXSkuKi9nbS5leGVjKHByb3ApID8gcHJvcCA6ICcjJyArIHByb3AgKSBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB2YWx1ZSA9ICgpID0+IHRoaXMuX3F1ZXJ5U2VsZWN0KHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gXyA9PiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy9TZXQgRWxlbWVudHMgUHJveHlcclxuICAgICAgICB0aGlzLmVsZW1lbnRzID0gbmV3IFByb3h5KHRoaXMucXVlcnksIHtcclxuICAgICAgICAgICAgZ2V0OiAodGFyZ2V0LCBwcm9wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vQWRkIGluIGVsZW1lbnRzIGZyb20gb3B0aW9uc1xyXG4gICAgICAgIGlmIChlbGVtZW50cykge1xyXG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyhlbGVtZW50cykuZm9yRWFjaCgoZSA9PiB7IHRoaXMucXVlcnlbZVswXV0gPSBlWzFdIH0pKVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMuX3ZhbHVlcyA9IG5ldyBQcm94eSghdmFsdWVzIHx8IHR5cGVvZiB2YWx1ZXMgIT09ICdvYmplY3QnID8ge30gOiB2YWx1ZXMsIHtcclxuICAgICAgICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuUmVuZGVyKHsgW3Byb3BdOiB2YWx1ZSB9KVxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bkNvbm5lY3Rpb25zKHtbcHJvcF06dmFsdWV9KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMub25Mb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ1blJlbmRlcih7IFt0cnVlIGFzIGFueV06IHRydWUgfSlcclxuICAgICAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh0aGlzLnZhbHVlcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCFyZW1vdmVPbmxvYWQpe1xyXG4gICAgICAgICAgICBpZih0aGlzLl9pc0pRdWVyeSl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMub25Mb2FkKVxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5vbmxvYWQgPSB0aGlzLm9uTG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBpc0JpbmRJbihlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKCBlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRJbkF0dHIpICYmIHRydWUgKSBcclxuICAgIH1cclxuICAgIGlzQmluZChlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKGVsZW1lbnQubG9jYWxOYW1lID09PSAnZC1iaW5kJyB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSkgJiYgdHJ1ZVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGlzRG9iT2JqZWN0RWxlbWVudChlbGVtZW50IDogRG9jT2JqZWN0RWxlbWVudCApIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlbWVudC5fRG9jT2JqZWN0IGluc3RhbmNlb2YgRG9jT2JqZWN0ICApXHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZpbmRPclJlZ2lzdGVyQmluZChET01lbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCkgOiBEb2NPYmplY3RDb25maWcge1xyXG4gICAgICAgIGlmKERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgbGV0IG9yaWdpbmFsQ2hpbGRyZW4gPSBbLi4uRE9NZWxlbWVudC5jaGlsZE5vZGVzXVxyXG4gICAgICAgICAgICBvcmlnaW5hbENoaWxkcmVuLnRvU3RyaW5nID0gKCk9PiBET01lbGVtZW50LmlubmVySFRNTFxyXG4gICAgICAgICAgICBET01lbGVtZW50Ll9Eb2NPYmplY3RDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENoaWxkcmVuLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDaGlsZHJlbkhUTUw6IERPTWVsZW1lbnQuaW5uZXJIVE1MLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxBdHRyaWJ1dGVzOiBbLi4uRE9NZWxlbWVudC5hdHRyaWJ1dGVzXS5yZWR1Y2UoIChhLGMpPT57cmV0dXJuIHsuLi5hLCBbYy5uYW1lXTpjLnZhbHVlfSB9LCB7fSApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIERPTWVsZW1lbnQuX0RvY09iamVjdENvbmZpZ1xyXG4gICAgfVxyXG5cclxuICAgIGdlbmVyYXRlQmluZChlbGVtZW50IDogRG9jT2JqZWN0RG9tQmluZCwgYmluZCwgYm91bmQgOiBEb2NPYmplY3RIVE1MTGlrZSApIDogRG9jT2JqZWN0RG9tQmluZCB8IE5vZGVbXSB7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gZWxlbWVudC5fRG9jT2JqZWN0Q29uZmlnO1xyXG4gICAgICAgIGNvbnN0IG5vZGVBcnJheSA9IERvY09iamVjdC50b05vZGVBcnJheShib3VuZCk7XHJcbiAgICAgICAgaWYodGhpcy5pc0JpbmQoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdEVsZW1lbnQgPSBub2RlQXJyYXkuZmluZChlbCA9PiBlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSBhcyBEb2NPYmplY3REb21CaW5kO1xyXG4gICAgICAgICAgICBmaXJzdEVsZW1lbnQuX0RvY09iamVjdENvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICAgICAgZmlyc3RFbGVtZW50LnNldEF0dHJpYnV0ZSgoZmlyc3RFbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2QtYmluZCcgPyAndG8nIDogdGhpcy5iaW5kQXR0ciksIGJpbmQpXHJcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGNvbmZpZy5vcmlnaW5hbEF0dHJpYnV0ZXMpLmZpbHRlcihhdHRBPT4hKFsnZC1iaW5kLWluJywgJ3RvJ10uaW5jbHVkZXMoYXR0QVswXSkpKS5mb3JFYWNoKGF0dEE9PmZpcnN0RWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0QVswXSwgYXR0QVsxXSkpXHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdEVsZW1lbnQ7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlQXJyYXk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG5cclxuICAgIHJ1blJlbmRlcih2YWx1ZUNoYW5nZXMgPSB7fSkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbmRlci5maWx0ZXIocmVuID0+IChyZW4uZGVwICYmIEFycmF5LmlzQXJyYXkocmVuLmRlcCkgJiYgcmVuLmRlcC5zb21lKChkZXBwKSA9PiAoZGVwcCBpbiB2YWx1ZUNoYW5nZXMpKSkgfHwgKHJlbi5kZXAgPT09IHVuZGVmaW5lZCkpLmZvckVhY2gocmVuID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlbi5jbGVhbikgcmVuLmNsZWFuKHsgLi4udGhpcy52YWx1ZXMsIC4uLnZhbHVlQ2hhbmdlcyB9LCB0aGlzLnZhbHVlcylcclxuICAgICAgICAgICAgcmVuLmFjdGlvbih7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgdGhpcy52YWx1ZXMpXHJcbiAgICAgICAgfSlcclxuICAgICAgICB0aGlzLnJ1bkJpbmRzKHRoaXMucm9vdCwgdmFsdWVDaGFuZ2VzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRCaW5kQWN0aW9uKGVsZW1lbnQgOiBIVE1MRWxlbWVudCkgOiBbc3RyaW5nLCAocmVwbGFjZSA6IE5vZGUgJiBOb2RlTGlzdCApPT52b2lkXSB7XHJcbiAgICAgICAgaWYodGhpcy5pc0JpbmQoZWxlbWVudCkpe1xyXG4gICAgICAgICAgICBpZihlbGVtZW50LmdldEF0dHJpYnV0ZSh0aGlzLmJpbmRBdHRyKSl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKHRoaXMuYmluZEF0dHIpLCAocmVwbGFjZSk9PmVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocmVwbGFjZSwgZWxlbWVudCldXHJcbiAgICAgICAgICAgIH1lbHNlIGlmKGVsZW1lbnQubG9jYWxOYW1lID09PSAnZC1iaW5kJyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2VsZW1lbnQuZ2V0QXR0cmlidXRlKCd0bycpLCAocmVwbGFjZSk9PmVsZW1lbnQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocmVwbGFjZSwgZWxlbWVudCldXHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfWVsc2UgaWYodGhpcy5pc0JpbmRJbihlbGVtZW50KSl7XHJcbiAgICAgICAgICAgIHJldHVybiBbZWxlbWVudC5nZXRBdHRyaWJ1dGUodGhpcy5iaW5kSW5BdHRyKSwgKHJlcGxhY2UpPT57XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiByZXBsYWNlKSBlbGVtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwgPSAoc2VsZWN0b3IgOiBzdHJpbmcpID0+IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxyXG4gICAgcnVuQmluZHMocm9vdCwgdmFsdWVDaGFuZ2VzID0ge30pIHtcclxuICAgICAgICAoQXJyYXkuaXNBcnJheShyb290KSA/IHJvb3QgOiBbcm9vdF0pIFxyXG4gICAgICAgIC5maWx0ZXIocnQ9PnJ0ICYmIHJ0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpXHJcbiAgICAgICAgLmZvckVhY2goKHJ0KT0+e1xyXG4gICAgICAgICAgICBbIC4uLihydC5xdWVyeVNlbGVjdG9yQWxsKGBbJHt0aGlzLmJpbmRBdHRyfV0sIFske3RoaXMuYmluZEluQXR0cn1dLCBkLWJpbmRbdG9dYCkpIF0gXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKCBlbGVtZW50ID0+IHtcclxuICAgICAgICAgICAgICAgIC8vR2V0IFRoZSBCaW5kIE1ldGhvZCwgYW5kIHRoZSBGdW5jdGlvbiB0byBpbnNlcnQgSFRNTCBcclxuICAgICAgICAgICAgICAgIGNvbnN0IFtiaW5kLCBiaW5kQWN0aW9uXSA9IHRoaXMuZ2V0QmluZEFjdGlvbihlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgLy9DaGVjayBpZiBCaW5kIEV4aXN0cyBcclxuICAgICAgICAgICAgICAgIGlmIChiaW5kIGluIHRoaXMuYmluZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9HZXQgT3IgcmVnaXN0ZXIgQmluZCBUYWcncyBDb25maWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gdGhpcy5maW5kT3JSZWdpc3RlckJpbmQoZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSW5zZXJ0IEhUTUxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZEFjdGlvbih0aGlzLnJ1bkJpbmRzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1dyYXAgQmluZCBNZXRob2QgdG8gcHJlcGFyZSBiaW5kIGZvciBkb2N1bWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZUJpbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZCwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9SdW4gQmluZCBNZXRob2RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJpbmRzW2JpbmRdKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IC4uLnRoaXMudmFsdWVzLCAuLi52YWx1ZUNoYW5nZXMgfSwgLy9QYXNzIGluIHVwZGF0ZXMgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5vcmlnaW5hbEF0dHJpYnV0ZXMsIC8vUGFzcyBpbiBvcmlnaW5hbCBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5vcmlnaW5hbENoaWxkcmVuLCAvL1Bhc3MgaW4gb3JpZ2luYWwgY2hpbGRyZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gcm9vdDtcclxuICAgIH1cclxuXHJcbiAgICBydW5Db25uZWN0aW9ucyh2YWx1ZUNoYW5nZXMgOiB7W2tleSA6IHN0cmluZ3xzeW1ib2xdIDogYW55IH0gPSB7W3RydWUgYXMgYW55XTp0cnVlfSApe1xyXG4gICAgICAgIGZvcihsZXQga3kgaW4gdmFsdWVDaGFuZ2VzKXtcclxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbnMuZm9yRWFjaCgoY29ubmVjdGVkKSA9PiBjb25uZWN0ZWQudmFsdWVzW2t5XSA9IHZhbHVlQ2hhbmdlc1treV0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBjb25uZWN0KC4uLmRvY09iamVjdHMgOiBbRG9jT2JqZWN0XSl7XHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbnMgPSBbLi4udGhpcy5fY29ubmVjdGlvbnMsIC4uLmRvY09iamVjdHNdXHJcbiAgICAgICAgdGhpcy5ydW5Db25uZWN0aW9ucyh0aGlzLnZhbHVlcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuaWYod2luZG93LmpRdWVyeSl7XHJcbiAgICAoZnVuY3Rpb24oJCkge1xyXG4gICAgICAgICQuZm4uZXh0ZW5kKHtcclxuICAgICAgICAgICAgRG9jT2JqZWN0IDogZnVuY3Rpb24oIG9wdGlvbnMgPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzWzBdLl9Eb2NPYmplY3QgJiYgIW9wdGlvbnMgKSByZXR1cm4gdGhpc1swXS5fRG9jT2JqZWN0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEb2NPYmplY3QodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG5ldyBEb2NPYmplY3QodGhpcywgeyBpc0pRdWVyeTp0cnVlLCAuLi5vcHRpb25zIH0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1swXS5fRG9jT2JqZWN0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pKGpRdWVyeSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvYmoocm9vdCA6IERvY09iamVjdEVsZW1lbnQgfCBKUXVlcnksIG9wdGlvbnMgOiBvYmplY3QpIDogRG9jT2JqZWN0e1xyXG4gICAgcmV0dXJuIG5ldyBEb2NPYmplY3Qocm9vdCwgb3B0aW9ucylcclxufVxyXG5cclxuXHJcbi8qXHJcbnZhciBkb2MgPSBuZXcgRG9jT2JqZWN0KHtcclxuICAgIHZhbHVlczoge1xyXG4gICAgfSxcclxuICAgIGVsZW1lbnRzOntcclxuXHJcbiAgICB9LFxyXG4gICAgYmluZHM6e1xyXG5cclxuICAgIH0sXHJcbiAgICByZW5kZXI6IFtcclxuXHJcbiAgICBdXHJcbn0pOyAkKGRvYy5vbkxvYWQpXHJcbiovIiwiXHJcblxyXG5leHBvcnQgY29uc3QgUk9PVF9FUlJPUiA9ICdST09UX0VSUk9SJ1xyXG5leHBvcnQgY29uc3QgSlFVRVJZX05PVF9ERVRFQ1RFRCA9ICdKUVVFUllfTk9UX0RFVEVDVEVEJ1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bkVycm9yKGVycm9yIDogc3RyaW5nLCBmYWlsPWZhbHNlKXtcclxuICAgIGlmKGVycm9yIGluIEVSUk9SUyl7XHJcbiAgICAgICAgaWYoZmFpbCl7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdEb2NPYmplY3Q6ICcrIEVSUk9SU1tlcnJvcl0ubWVzc2FnZSk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoRVJST1JTW2Vycm9yXS5tZXNzYWdlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgRVJST1JTID0ge1xyXG4gICAgUk9PVF9FUlJPUiA6IHtcclxuICAgICAgICBtZXNzYWdlOiBcIlJvb3QgRWxlbWVudCBNdXN0IGJlIGEgdmFsaWQgTm9kZSwgT3IgalF1ZXJ5IEVsZW1lbnRcIlxyXG4gICAgfSxcclxuICAgIEpRVUVSWV9OT1RfREVURUNURUQ6IHtcclxuICAgICAgICBtZXNzYWdlIDogXCJKUXVlcnkgaXMgbm90IGRldGVjdGVkLiBQbGVhc2UgbG9hZCBKUXVlcnkgYmVmb3JlIERvY09iamVjdFwiXHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIERvY3VtZW50IHtcclxuICAgIHNlbGVjdGlvbjoge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yODk3MTU1L2dldC1jdXJzb3ItcG9zaXRpb24taW4tY2hhcmFjdGVycy13aXRoaW4tYS10ZXh0LWlucHV0LWZpZWxkXHJcbiBleHBvcnQgZnVuY3Rpb24gZ2V0Q3Vyc29yUG9zKGVsZW1lbnQgOiBIVE1MSW5wdXRFbGVtZW50KSA6IG51bWJlciB7XHJcbiAgICAvLyBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAvLyAgICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgLy8gICAgIHJldHVybiAgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtZWxlbWVudC52YWx1ZS5sZW5ndGgpO1xyXG4gICAgLy8gfVxyXG4gICAgICAgIHJldHVybiBlbGVtZW50LnNlbGVjdGlvbkRpcmVjdGlvbiA9PSAnYmFja3dhcmQnID8gZWxlbWVudC5zZWxlY3Rpb25TdGFydCA6IGVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG59XHJcblxyXG4vLyBDcmVkaXRzOiBodHRwOi8vYmxvZy52aXNoYWxvbi5uZXQvaW5kZXgucGhwL2phdmFzY3JpcHQtZ2V0dGluZy1hbmQtc2V0dGluZy1jYXJldC1wb3NpdGlvbi1pbi10ZXh0YXJlYS9cclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnNvclBvcyhlbGVtZW50IDogSFRNTElucHV0RWxlbWVudCwgcG9zIDogbnVtYmVyKSA6IHZvaWQge1xyXG4gICAgLy8gTW9kZXJuIGJyb3dzZXJzXHJcbiAgICBpZiAoZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgZWxlbWVudC5mb2N1cygpO1xyXG4gICAgZWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICBcclxuICAgIC8vIElFOCBhbmQgYmVsb3dcclxuICAgIH0gZWxzZSBpZiAoKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UpIHtcclxuICAgICAgdmFyIHJhbmdlID0gKGVsZW1lbnQgYXMgYW55KS5jcmVhdGVUZXh0UmFuZ2UoKTtcclxuICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XHJcbiAgICAgIHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIHBvcyk7XHJcbiAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgcG9zKTtcclxuICAgICAgcmFuZ2Uuc2VsZWN0KCk7XHJcbiAgICB9XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvdHMvZG9jb2JqZWN0LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
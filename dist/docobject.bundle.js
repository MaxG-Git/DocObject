var DocObject = (() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
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
    define("utils", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
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
    });
    define("errors", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
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
        exports.default = runError;
        const ERRORS = {
            ROOT_ERROR: {
                message: "Root Element Must be a valid Node, Or jQuery Element"
            },
            JQUERY_NOT_DETECTED: {
                message: "JQuery is not detected. Please load JQuery before DocObject"
            }
        };
    });
    define("docobject", ["require", "exports", "utils", "errors"], function (require, exports, utils_1, errors_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.create = exports.DocObject = void 0;
        errors_1 = __importStar(errors_1);
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
            static fixInput(selector, action) {
                let pos = (0, utils_1.getCursorPos)(selector()[0]);
                action();
                (0, utils_1.setCursorPos)(selector()[0], pos);
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
                        new DocObject(this, options);
                        return this[0]._DocObject;
                    }
                });
            })(jQuery);
        }
        function create(root, options) {
            return new DocObject(root, options);
        }
        exports.create = create;
    });
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
    //# sourceMappingURL=docobject.bundle.js.map
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve(entry[0]);
    }
})();
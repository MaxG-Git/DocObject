
import {setCursorPos, getCursorPos} from "./utils"
import { DocObjectDomBind, DocObjectBind } from './docbind'
import { DocObjectRender } from './docrender'
import runError, { 
    ROOT_ERROR,
    JQUERY_NOT_DETECTED
} from './errors';

/******* GLOBALS *******/
declare global {
    interface Window {
        jQuery:any;
        msCrypto:any;
    }
}


/******* UTILITY METHODS *******/
export function fixInput(selector, action){
    let pos = getCursorPos(selector()[0])
    action()
    setCursorPos(selector()[0], pos)
}


/******* DOC OBJECT *******/
export type DocObjectHTMLLike = 
| Node
| NodeList
| JQuery 
| string;


interface DocObjectOptions {
    render : DocObjectRender;
    binds : DocObjectBind;
    elements : {[key:string]: string};
    values : object;
    bindAttr : string;
    bindInAttr : string;
    isJQuery : boolean;
}

interface DocObjectElement extends HTMLElement {
    _DocObject? : DocObject
}

interface DocObjectElements {
    [key: string] : string | ((selector : string ) => NodeList|JQuery)
}

export interface DocObjectConfig {
    originalChildren: Array<Node>;
    originalChildrenHTML: string;
    originalAttributes: {[key:string] : string};
}

class Bind extends HTMLElement {
    constructor() {
        super()
    }
}
window.customElements.define('d-bind', Bind)
export class DocObject {

    static parser : DOMParser = new DOMParser()

    static toNodeArray(any : DocObjectHTMLLike | Array<string|Node> ) : Array<Node> {
        if(typeof any === 'string'){
            return [...DocObject.parser.parseFromString(any, 'text/html').body.childNodes]
        }else if(NodeList.prototype.isPrototypeOf(any) || (window.jQuery && any instanceof jQuery)){
            return [ ...(any as NodeList)]
        }else if(Array.isArray(any)){
            return any
            .filter(e=> (typeof e === 'string') || e instanceof Node )
            .map(e=> (typeof e === 'string') ? DocObject.toNodeArray(e)[0] : e );
        } else if(any instanceof Node || any instanceof Document ){
            return [any]
        }
    }

    static defaultParams({
        render = [],
        binds = {},
        elements = {},
        values = {},
        bindAttr = 'd-bind',
        bindInAttr = 'd-bind-in',
        isJQuery = false
    } = {}) : DocObjectOptions {
        return  { elements, values, render, binds, bindAttr, bindInAttr, isJQuery } 
    }




    _values : object;
    elements : ProxyHandler<DocObjectElements>;
    root : DocObjectElement;
    render : DocObjectRender;
    binds : DocObjectBind;
    bindAttr : string;
    bindInAttr : string;
    query : ProxyHandler<DocObjectElements>;
    _querySelect : (selector:string)=> NodeList | JQuery;
    _isJQuery : boolean
    onLoad: ()=>void

    set values(values) {
        throw Error("Tried to set DocObject.value. Try creating a inner object instead.")
    }
    get values() {
        return this._values;
    }
    
    
    constructor(root : DocObjectElement | JQuery, options : object) {
        //Add Default Parameters to options
        const { elements, values, render, binds, bindAttr, bindInAttr, isJQuery } : DocObjectOptions = DocObject.defaultParams(options)
        
        //Extract DOM element from HTMLElement Or Jquery Object
        let rootElement = DocObject.toNodeArray(root)[0]
        
        //Set Root Object
        if(rootElement instanceof HTMLElement ){
            this.root = rootElement
        }else{
            runError(ROOT_ERROR, true)
        }

        //Set Jquery
        if(isJQuery && window.jQuery){
            //If Jquery is detected and is set to jquery mode...
            this._isJQuery = true;

            //Set Query Select statement to use jQuery
            this._querySelect = (...props) => $(this.root).find(...props)
        }else {
            //If Jquery is not detected...
            if(isJQuery){
                //If set to jquery mode...
                runError(JQUERY_NOT_DETECTED, false)
            }
            //Set Query Select statement to use HTMLElement.querySelectorAll
            this._isJQuery = false;
            this._querySelect = (...props) => this.root.querySelectorAll(...props)
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
            get: (target, prop ) => {
                if(typeof prop == 'string')
                    return  target[prop] ? target[prop] : _ => this._querySelect( /.*(\.|\#|\[|\]).*/gm.exec(prop) ? prop : '#' + prop ) 
            },
            set: (target, prop, value, receiver) => {
                if (typeof value === 'string') value = () => this._querySelect(value)
                if (typeof prop === 'string'){
                    target[prop] = _ => value
                }
                return true;
            } 
        })

        //Set Elements Proxy
        this.elements = new Proxy(this.query, {
            get: (target, prop) => {
                return target[prop]()
            }
        })

        //Add in elements from options
        if (elements) {
            Object.entries(elements).forEach((e => { this.query[e[0]] = e[1] }))
        }


        this._values = new Proxy(!values || typeof values !== 'object' ? {} : values, {
            set: (target, prop, value, receiver) => {
                this.runRender({ [prop]: value })
                target[prop] = value;
                return true;
            }
        })
        
        this.onLoad = () => {
            this.runRender({ [true as any]: true })
        }
        if(this._isJQuery){
            $(this.onLoad)
        }else{
            window.onload = this.onLoad
        }
            
    }

    isBindIn(element : DocObjectDomBind) : boolean {
        return ( element.getAttribute(this.bindInAttr) && true ) 
    }
    isBind(element : DocObjectDomBind) : boolean {
        return (element.localName === 'd-bind' || element.getAttribute(this.bindAttr)) && true
    }
    findOrRegisterBind(DOMelement : DocObjectDomBind) : DocObjectConfig {
        if(DOMelement._DocObjectConfig === undefined){
            let originalChildren = [...DOMelement.childNodes]
            originalChildren.toString = ()=> DOMelement.innerHTML
            DOMelement._DocObjectConfig = {
                originalChildren,
                originalChildrenHTML: DOMelement.innerHTML,
                originalAttributes: [...DOMelement.attributes].reduce( (a,c)=>{return {...a, [c.name]:c.value} }, {} )
            }
        }
        return DOMelement._DocObjectConfig
    }

    generateBind(element : DocObjectDomBind, bind, bound : DocObjectHTMLLike ) : DocObjectDomBind | Node[] {
        const config = element._DocObjectConfig;
        const nodeArray = DocObject.toNodeArray(bound);
        if(this.isBind(element)){
            const firstElement = nodeArray.find(el => el instanceof HTMLElement) as DocObjectDomBind;
            firstElement._DocObjectConfig = config;
            firstElement.setAttribute((firstElement.localName === 'd-bind' ? 'to' : this.bindAttr), bind)
            Object.entries(config.originalAttributes).filter(attA=>!(['d-bind-in', 'to'].includes(attA[0]))).forEach(attA=>firstElement.setAttribute(attA[0], attA[1]))
            return firstElement;
        }else{
            return nodeArray;
        }
    }

    

    runRender(valueChanges = {}) : void {
        this.render.filter(ren => (ren.dep && Array.isArray(ren.dep) && ren.dep.some((depp) => (depp in valueChanges))) || (ren.dep === undefined)).forEach(ren => {
            if (ren.clean) ren.clean({ ...this.values, ...valueChanges }, this.values)
            ren.action({ ...this.values, ...valueChanges }, this.values)
        })
        this.runBinds(this.root, valueChanges);
    }

    getBindAction(element : HTMLElement) : [string, (replace : Node & NodeList )=>void] {
        if(this.isBind(element)){
            if(element.getAttribute(this.bindAttr)){
                return [element.getAttribute(this.bindAttr), (replace)=>element.parentNode.replaceChild(replace, element)]
            }else if(element.localName === 'd-bind'){
                return [element.getAttribute('to'), (replace)=>element.parentNode.replaceChild(replace, element)]
            } 
        }else if(this.isBindIn(element)){
            return [element.getAttribute(this.bindInAttr), (replace)=>{
                element.innerHTML = '';
                for (let node of replace) element.appendChild(node);
            }]
        }
    }


    runBinds(root, valueChanges = {}) {
        (Array.isArray(root) ? root : [root]) 
        .filter(rt=>rt && rt instanceof HTMLElement)
        .forEach((rt)=>{
            [ ...(rt.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}], d-bind[to]`)) ] 
            .forEach( element => {
                //Get The Bind Method, and the Function to insert HTML 
                const [bind, bindAction] = this.getBindAction(element)
                //Check if Bind Exists 
                if (bind in this.binds) {
                        //Get Or register Bind Tag's Config
                        const config = this.findOrRegisterBind(element)
                        
                        //Insert HTML
                        bindAction(this.runBinds(
                            
                            //Wrap Bind Method to prepare bind for document
                            this.generateBind(
                                element, 
                                bind, 
                                //Run Bind Method
                                this.binds[bind](
                                    { ...this.values, ...valueChanges }, //Pass in updates values
                                    config.originalAttributes, //Pass in original attributes
                                    config.originalChildren, //Pass in original children
                                    )
                                ), 
                            valueChanges
                            )
                        );
                    }
                })
            })
        return root;
    }
}
if(window.jQuery){
    (function($) {
        $.fn.extend({
            DocObject : function( options = null) {
                if(this[0]._DocObject && !options ) return this[0]._DocObject;
                this.each(function() {
                    new DocObject(this, options);
                });
                new DocObject(this, { isJQuery:true, ...options })
                return this[0]._DocObject;
            }
        })
    })(jQuery);
}

export function obj(root : DocObjectElement | JQuery, options : object) : DocObject{
    return new DocObject(root, options)
}


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
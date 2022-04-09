import { DocObjectDomBind, DocObjectBind, DocObjectBindGen } from './docbind'
import { DocObjectRender } from './docrender'
import  DocGen  from './docgen'
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





/******* DOC OBJECT *******/
export type DocObjectHTMLLike = 
| Node
| NodeList
| JQuery 
| Number
| string
| ((gen: DocGen) => DocObjectHTMLLike);



interface DocObjectOptions {
    render : DocObjectRender;
    binds : DocObjectBind | DocObjectBindGen;
    elements : {[key:string]: string};
    values : object;
    bindAttr : string;
    bindInAttr : string;
    isJQuery : boolean;
    connections : Array<DocObject>
    removeOnload : boolean
}

interface DocObjectRunBindOptions {
    root : any;
    valueChanges: object;
    additionalHosts? : Array<HTMLElement>
}

// export interface DocObjectElement extends HTMLElement {
//     _DocObject? : DocObject
// }

export class DocObjectElement extends HTMLElement {
    _DocObject? : DocObject
    constructor() {
        super()
        if(!DocObject.isDobObjectElement(this)){
            this._DocObject = new DocObject(this, {})
        } 
    }
}

interface DocObjectElements {
    [key: string] : string | ((selector : string ) => NodeList|JQuery)
}

export interface DocObjectConfig {
    originalChildren: Array<Node>;
    originalChildrenHTML: string;
    originalAttributes: {[key:string] : string};
}


export class DocObject {

    static parser : DOMParser = new DOMParser()

    static toNodeArray(any : DocObjectHTMLLike | Array<string|Node> ) : Array<Node> {
        if(typeof any === 'string' || typeof any === 'number'){
            return [...DocObject.parser.parseFromString(any.toString(), 'text/html').body.childNodes]
        }else if(NodeList.prototype.isPrototypeOf(any) || (window.jQuery && any instanceof jQuery)){
            return [ ...(any as NodeList)]
        }else if(Array.isArray(any)){
            return any
            .filter(e=> (typeof e === 'string') || e instanceof Node )
            .map(e=> (typeof e === 'string') ? DocObject.toNodeArray(e)[0] : e );
        } else if(any instanceof Node || any instanceof Document ){
            return [any]
        }else{
            return []
        }
    }

    static defaultParams({
        render = [],
        binds = {},
        elements = {},
        values = {},
        bindAttr = 'd-bind',
        bindInAttr = 'd-bind-in',
        isJQuery = false,
        connections = [],
        removeOnload = false
    } = {}) : DocObjectOptions {
        return  { elements, values, render, binds, bindAttr, bindInAttr, isJQuery, connections, removeOnload } 
    }
    
    defaultRunBindOptions({
        root,
        valueChanges,
        additionalHosts = []
    } : DocObjectRunBindOptions ) : DocObjectRunBindOptions {
        return {root, valueChanges, additionalHosts}
    }




    readonly _values : object;
    elements : ProxyHandler<DocObjectElements>;
    root : DocObjectElement;
    render : DocObjectRender;
    binds : DocObjectBind;
    bindAttr : string;
    bindInAttr : string;
    query : ProxyHandler<DocObjectElements>;
    _querySelect : (selector:string)=> NodeList | JQuery;
    _isJQuery : boolean
    _connections : Array<DocObject>
    g : DocGen
    onLoad: ()=>void

    set values(values) {
        throw Error("Tried to set DocObject.value. Try creating a inner object instead.")
    }
    get values() {
        return this._values;
    }
    
    
    constructor(root : DocObjectElement | JQuery, options : object) {
        //Add Default Parameters to options
        const { elements, values, render, binds, bindAttr, bindInAttr, isJQuery, connections, removeOnload } : DocObjectOptions = DocObject.defaultParams(options)
        
        //Extract DOM element from HTMLElement Or Jquery Object
        let rootElement = DocObject.toNodeArray(root)[0]
        
        //Set Root Object
        if(rootElement instanceof HTMLElement ){
            this.root = rootElement
        }else{
            runError(ROOT_ERROR, true)
        }

        this._connections = connections;

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

        //Add query-able attribute to root element
        this.root.setAttribute('doc-object', '')

        //Set Render Functions
        this.render = render;

        //Create Related DocGen
        this.g = new DocGen(this)

        //Set Bind Functions
        this.binds = (typeof binds === 'function') ? binds(this.g) : binds ;

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
                target[prop] = value;
                this.runRender({ [prop]: value })
                this.runConnections({[prop]:value})
                return true;
            }
        })

       
       
        
        this.onLoad = () => {
            this.runRender(this.values)
            this.runConnections(this.values)
        }

        if(!removeOnload){
            if(this._isJQuery){
                $(this.onLoad)
            }else{
                window.onload = this.onLoad
            }
        }
            
    }
    
    isBindIn(element : DocObjectDomBind) : boolean {
        return ( element.getAttribute(this.bindInAttr) && true ) 
    }
    isBind(element : DocObjectDomBind) : boolean {
        return (element.localName === 'd-bind' || element.getAttribute(this.bindAttr)) && true
    }
    static isDobObjectElement(element : DocObjectElement ) : boolean {
        return ( element._DocObject instanceof DocObject  )
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

    generateBind(element : DocObjectDomBind, bind, bound : DocObjectHTMLLike) : DocObjectDomBind | Node[] {
        const config = element._DocObjectConfig;
        const nodeArray = DocObject.toNodeArray(typeof bound === 'function' ? bound(this.g) : bound);
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
        this.runBinds({root:this.root, valueChanges, additionalHosts:[this.root]});
    }

    getBindAction(element : HTMLElement, valueChanges: object) : [string, (replace : Node & NodeList )=> void ] | null {
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
        }else if(DocObject.isDobObjectElement(element)){
            if(element === this.root){
                return ['this',   (replace)=>{
                    element.innerHTML = '';
                    for (let node of replace) element.appendChild(node);
                }]
            }else{
                (element as DocObjectElement)._DocObject.runRender(valueChanges)
                return null
            }
        }
    }
    querySelectorAll = (selector : string) => this.root.querySelectorAll(selector)
    runBinds(params: DocObjectRunBindOptions) {
        const { root, valueChanges, additionalHosts } = this.defaultRunBindOptions(params);
        (Array.isArray(root) ? root : [root])
            .filter(rt => rt && rt instanceof HTMLElement)
            .forEach((rt) => {
                [...(rt.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}], d-bind[to], [doc-object]`)), ...additionalHosts]
                    .forEach(element => {

                        const bindInstructions = this.getBindAction(element, valueChanges)
                        if (bindInstructions) {
                            //Get The Bind Method, and the Function to insert HTML 
                            const [bind, bindAction] = bindInstructions;
                            //Check if Bind Exists 
                            if (bind in this.binds) {
                                //Get Or register Bind Tag's Config
                                const config = this.findOrRegisterBind(element)

                                //Insert HTML
                                bindAction(this.runBinds({
                                    root: this.generateBind(  //Wrap Bind Method to prepare bind for document
                                        element,
                                        bind,
                                        //Run Bind Method
                                        this.binds[bind](
                                            this.values, //Pass in updates values
                                            config.originalAttributes, //Pass in original attributes
                                            config.originalChildren, //Pass in original children
                                            valueChanges
                                        )
                                    ),
                                    valueChanges
                                })
                                );
                            }
                        }
                    })
            })
        return root;
    }

    runConnections(valueChanges : {[key : string|symbol] : any } = {[true as any]:true} ){
        for(let ky in valueChanges){
            this._connections.forEach((connected) => connected.values[ky] = valueChanges[ky])
        }

    }

    connect(...docObjects : [DocObject]){
        this._connections = [...this._connections, ...docObjects]
        this.runConnections(this.values);
        return this;
    }
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
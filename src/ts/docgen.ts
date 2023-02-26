import {DocObject, DocObjectHTMLLike} from './docobject'
import { DocObjectBindAttribute } from './docbind'

export default class DocGen {
    
    [key : string]: DocObject | ((inner : DocObjectHTMLLike | Array<string|Node> , attrs : DocObjectBindAttribute) => any) | any;
    obj : DocObject 

    
    constructor(obj? : DocObject){
        this.obj = obj
        return new Proxy(this, {
            get:(target, prop ) => {
               return this.Gen(prop as string)
            },
        })
    }
    Gen(prop : string){
        return (inner : DocObjectHTMLLike | Array<string|Node> = [] , attrs : DocObjectBindAttribute) => {
            if(this.obj && prop in this.obj.binds){
                const bound = this.obj.binds[prop].bind(this.obj)(this.obj.values, attrs, DocObject.toNodeArray(inner), this.obj.values)
                return typeof bound === 'function' ? bound(this.obj.g) : bound;
            }
            let element = document.createElement(prop)
            for(let key in attrs){
                if(key === 'style' && typeof attrs[key] === 'object' ){
                    for(let skey in attrs[key as string]){
                        element.style[skey] = attrs[key][skey]
                    }
                } else if(key in Object.getPrototypeOf(element)){
                    element[key] = attrs[key]
                }else{
                    element.setAttribute(key, attrs[key])
                }
            }
            DocObject.toNodeArray(inner).forEach(ine => {
                
                if(ine.parentElement && ine.parentElement.nodeName === 'D-BIND'){
                    element.appendChild(ine.cloneNode(true))
                }
                else{
                    element.appendChild(ine)
                }
            })
            return element;
        }
    }
}
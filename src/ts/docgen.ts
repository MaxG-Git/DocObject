import {DocObject, DocObjectHTMLLike} from './docobject'
import { DocObjectBindAttribute } from './docbind'

export default class DocGen {
    
    obj ? : DocObject 
    
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
                return this.obj.binds[prop](this.obj.values, attrs, DocObject.toNodeArray(inner))
            }
            let element = document.createElement(prop)
            for(let key in attrs){
                if(key === 'style' && typeof attrs[key] === 'object' ){
                    for(let skey in attrs[key as string]){
                        element.style[skey] = attrs[key][skey]
                    }
                } else if(key.startsWith('on')){
                    element[key] = attrs[key]
                }else{
                    element.setAttribute(key, attrs[key])
                }
            }
            DocObject.toNodeArray(inner).forEach(ine => {
                element.appendChild(ine)
            })
            return element;
        }
    }
}
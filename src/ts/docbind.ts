import { 
    DocObjectHTMLLike, 
    DocObjectConfig 
} from './docobject'
import DocGen from './docgen'

export interface DocObjectDomBind extends HTMLElement {
    _DocObjectConfig? : DocObjectConfig
}

export interface DocObjectBind {
    [key: string] : DocObjectBindFunction
}

export type DocObjectBindGen = ( gen : DocGen) => DocObjectBind

export type DocObjectBindFunction = ( values:object, attrs: DocObjectBindAttribute, children:DocObjectChildren)=> DocObjectHTMLLike;


export interface DocObjectBindAttribute {
    [key: string] : any
}

export interface DocObjectChildren extends Array<Node>{}
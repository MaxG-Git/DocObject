import { 
    DocObjectHTMLLike, 
    DocObjectConfig 
} from './docobject'

export interface DocObjectDomBind extends HTMLElement {
    _DocObjectConfig? : DocObjectConfig
}

export interface DocObjectBind {
    [key: string] : DocObjectBindFunction
}

export type DocObjectBindFunction = ( values:object, attrs: DocObjectBindAttribute, children:DocObjectChildren)=> DocObjectHTMLLike;


export interface DocObjectBindAttribute {
    [key: string] : string
}

export interface DocObjectChildren extends Array<Node>{}
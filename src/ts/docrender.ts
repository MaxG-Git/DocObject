export interface DocObjectRender extends Array<DocObjectRenderObject>{}

export type DocObjectRenderFunction = ( values:object, prevValues:object)=>void;

export interface DocObjectRenderObject {
    clean : DocObjectRenderFunction
    action : DocObjectRenderFunction
    dep : Array<string>
}
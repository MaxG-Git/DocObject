
class DocElements {
    constructor () {
        return new Proxy(this, this);
    }
    get (target, prop) {
        return this[prop] ? this[prop]() : $('#'+prop)
    }
    set(target, prop, value, receiver){
        if(typeof value === 'string') value = $(value)
        target[prop] = _=>value
        return true;
    }
}


class DocObject {
    _values = {};
    _updating
    _cached
    elements;
    render = [];

    set values(values){
        throw Error("Tried to set DocObject.value. Try setting a inner object instead.")
    }
    get values(){
        return this._values;
    }
    constructor({elements, values, render}){
        this.elements = new DocElements()
        if(elements){
            Object.entries(elements).forEach((e=>{this.elements[e[0]]=e[1]}))
        }
        if(render && Array.isArray(render)){
            this.render = render;
        }else{
            render = [];
        }
        this._values = new Proxy(!values || typeof values !== 'object' ? {} : values, {
            set: (target, prop, value, receiver) => {
                    this.render.filter(ren => ( ren.dep && Array.isArray(ren.dep) && ren.dep.includes(prop)) || (ren.dep === undefined)).forEach(ren => {
                        if(ren.clean) ren.clean({...this.values, [prop]:value}, this.values)
                        ren.action({...this.values, [prop]:value}, this.values)
                    })
                target[prop] = value;
            }
        })
        this.onLoad = ()=>{
            this.render.forEach(ren => {
                if(ren.dep && Array.isArray(ren.dep) && (ren.dep.length === 0 || ren.dep.includes(true))){
                    ren.action(this.values, this.values)
                }
            })
        }
    }
    runRender(...deps){
        deps.forEach(prop=>{
            this.render.filter(ren => ( ren.dep && Array.isArray(ren.dep) && ren.dep.includes(prop)) || (ren.dep === undefined)).forEach(ren => {
                if(ren.clean) ren.clean({...this.values, [prop]:value}, this.values)
                ren.action({...this.values, [prop]:value}, this.values)
            })
        })
        
    }
}
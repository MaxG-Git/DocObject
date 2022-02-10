
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
    values;
    elements;
    render = [];
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
        this.values = new Proxy(!values || typeof values !== 'object' ? {} : values, {
            set: (target, prop, value, receiver) => {
                this.render.forEach(ren => {
                    if(ren.dep && Array.isArray(ren.dep)){
                        if(ren.dep.includes(prop)){
                            if(ren.clean) ren.clean({...this.values, [prop]:value}, this.values)
                            ren.action({...this.values, [prop]:value}, this.values)
                        }
                    }else{
                        if(ren.clean) ren.clean({...this.values, [prop]:value}, this.values)
                        ren.action({...this.values, [prop]:value}, this.values)
                    }
                })
                target[prop] = value;
            }
        })
        this.onLoad = ()=>{
            this.render.forEach(ren => {
                if(ren.dep && Array.isArray(ren.dep) && ren.dep.length === 0){
                    ren.action(this.values, this.values)
                }
            })
        }
    }
    runRender(ren){
        if(ren.dep && Array.isArray(ren.dep)){
            if(ren.dep.includes(prop)){
                ren.action({...this.values, [prop]:value}, this.values)
            }
        }else{
            ren.action({...this.values, [prop]:value}, this.values)
        }
    }
}
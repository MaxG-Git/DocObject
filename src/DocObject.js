if(!window.jQuery){
    throw Error("JQuery is not detected. Please load JQuery before DocObject")
}
class DocObject {



    
    static fixInput(element){
        element = $(element);
        element.focus()
        let val = element.val()
        element.val('').val(val)
        return element;
    }


    defaults = {
        render: [],
        binds : {},
        elements: {},
        values: {},
        bindAttr : 'd-bind',
        bindInAttr : 'd-bind-in'
    }



    _values = {};
    bindMap;
    elements;
    root;
    render = [];
    binds = {};
    bindAttr;
    bindInAttr;
    parser

    set values(values) {
        throw Error("Tried to set DocObject.value. Try creating a inner object instead.")
    }
    get values() {
        return this._values;
    }
    constructor(root, options) {
        const { elements, values, render, binds, bindAttr, bindInAttr } = $.extend( {}, this.defaults, options );
        this.root = $(root)[0];
        this.root._DocObject = this;
        if (render && Array.isArray(render)) this.render = render;
        if (binds && typeof binds === 'object') this.binds = binds;
        if(bindAttr) this.bindAttr = bindAttr;
        if(bindInAttr) this.bindInAttr = bindInAttr;
        this.elements = new Proxy(!elements || typeof elements !== 'object' ? {} : elements, {
            get: (target, prop) => {
                return target[prop] ? target[prop]() : $(this.root).find( /.*(\.|\#|\[|\]).*/gm.exec(prop) ? prop : '#' + prop)
            },
            set: (target, prop, value, receiver) => {
                if (typeof value === 'string') value = $(this.root).find(value)
                target[prop] = _ => value
                return true;
            }
        })
        if (elements) {
            Object.entries(elements).forEach((e => { this.elements[e[0]] = e[1] }))
        }
        this._values = new Proxy(!values || typeof values !== 'object' ? {} : values, {
            set: (target, prop, value, receiver) => {
                this.runRender({ [prop]: value })
                target[prop] = value;
            }
        })
        this.bindMap = {}
        this.parser = new DOMParser()
        this.onLoad = () => {
            this.runRender({ [true]: true })
        }
        $(this.onLoad)
    }

    generateBindKey(){
        let key
        do{
            key = (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(12)).reduce((a, c)=>a + c.toString(36), '')
        }while(Object.keys(this.bindMap).includes(key))
        return key
    }
    
    findOrRegisterBind(DOMelement){
        if(!(DOMelement._DocObjectConfig)){
            let originalChildren = [...DOMelement.childNodes]
            originalChildren.toString = ()=> DOMelement.innerHTML
            DOMelement._DocObjectConfig = {
                originalChildren,
                originalChildrenHTML:DOMelement.innerHTML
            }
        }else{
            console.log('found')
        }
        return DOMelement._DocObjectConfig
    }

    generateBind(config, bind, bound){
        let html = this.parser.parseFromString(bound, 'text/html').body.childNodes
        html[0]._DocObjectConfig = config;
        html[0].setAttribute(this.bindAttr, bind)
        return html[0];
    }

    

    runRender(valueChanges = {}) {
        this.render.filter(ren => (ren.dep && Array.isArray(ren.dep) && ren.dep.some((dep) => (dep in valueChanges))) || (ren.dep === undefined)).forEach(ren => {
            if (ren.clean) ren.clean({ ...this.values, ...valueChanges }, this.values)
            ren.action({ ...this.values, ...valueChanges }, this.values)
        })
        this.runBinds(this.root, valueChanges);
    }
    runBinds(root, valueChanges = {}) {
        [ ...(root.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}]`)) ]
        .forEach( element => {
                let [bind, bindAction] = [...( element.getAttribute(this.bindAttr) ? [element.getAttribute(this.bindAttr), (replace)=>element.parentNode.replaceChild(replace, element)] : [element.getAttribute(this.bindInAttr), (replace)=>element.innerHTML = replace])]
                if (bind in this.binds) {
                    let config = this.findOrRegisterBind(element)
                    bindAction(this.runBinds(
                        this.generateBind(
                            config, 
                            bind, 
                            this.binds[bind](
                                { ...this.values, ...valueChanges }, 
                                config.originalChildren, 
                                this.values
                                )
                            ), 
                        valueChanges
                        )
                    );
                }
            })
        return root;
    }
}

(function($) {
    $.fn.extend({
        DocObject : function( options = null) {
            if(this[0]._DocObject && !options ) return this[0]._DocObject;
            this.each(function() {
                new DocObject(this, options);
            });
            new DocObject(this, options)
            return this[0]._DocObject;
        }
    })
})(jQuery);

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
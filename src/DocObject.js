if(!window.jQuery){
    throw Error("JQuery is not detected. Please load JQuery before DocObject")
}
class DocObject {

    defaults = {
        render: [],
        binds : {},
        elements: {},
        values: {},
        bindAttr : 'd-bind'
    }



    _values = {};
    _updating
    elements;
    root;
    render = [];
    binds = {};
    bindAttr;

    set values(values) {
        throw Error("Tried to set DocObject.value. Try creating a inner object instead.")
    }
    get values() {
        return this._values;
    }
    constructor(root, options) {
        const { elements, values, render, binds, bindAttr } = $.extend( {}, this.defaults, options );
        this.root = $(root)[0];
        this.root._DocObject = this;
        if (render && Array.isArray(render)) this.render = render;
        if (binds && typeof binds === 'object') this.binds = binds;
        if(bindAttr) this.bindAttr = bindAttr
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
        this.onLoad = () => {
            this.runRender({ [true]: true })
        }
        $(this.onLoad)
    }
    

    runRender(valueChanges = {}) {

        this.render.filter(ren => (ren.dep && Array.isArray(ren.dep) && ren.dep.some((dep) => (dep in valueChanges))) || (ren.dep === undefined)).forEach(ren => {
            if (ren.clean) ren.clean({ ...this.values, ...valueChanges }, this.values)
            ren.action({ ...this.values, ...valueChanges }, this.values)
        })
        this.runBinds(this.root, valueChanges);
    }
    runBinds(root, valueChanges = {}) {
        $(root).find(`[${this.bindAttr}]`).toArray().forEach(e => {
                let bind = $(e).attr(this.bindAttr)
                if (bind in this.binds) {
                    $(e).replaceWith(this.runBinds(($(this.binds[bind]({ ...this.values, ...valueChanges }, this.values)).attr(this.bindAttr, bind)), valueChanges));
                    
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
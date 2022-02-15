if(!window.jQuery){
    throw Error("JQuery is not detected. Please load JQuery before DocObject")
}
// Credits: https://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
function getCursorPos(element) {
    if (document.selection) {
        element.focus();
        return  document.selection.createRange().moveStart('character', -oField.value.length)
    }
        return element.selectionDirection == 'backward' ? element.selectionStart : element.selectionEnd;;
}

// Credits: http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
function setCursorPos(element, pos) {
    // Modern browsers
    if (element.setSelectionRange) {
    element.focus();
    element.setSelectionRange(pos, pos);
    
    // IE8 and below
    } else if (element.createTextRange) {
      var range = element.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
}

class Bind extends HTMLElement {
    constructor() {
        super()
    }
}
window.customElements.define('d-bind', Bind)
class DocObject {



    
    static fixInput(selector, action){
        let pos = getCursorPos(selector[0])
        action()
        setCursorPos(selector.refresh()[0], pos)
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
                let fresh =  target[prop] ? target[prop]() : $(this.root).find( /.*(\.|\#|\[|\]).*/gm.exec(prop) ? prop : '#' + prop)
                fresh.refresh = () => {
                    return target[prop] ? target[prop]() : $(this.root).find( /.*(\.|\#|\[|\]).*/gm.exec(prop) ? prop : '#' + prop)
                };
                return fresh;
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
        do { key = (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(12)).reduce((a, c)=>a + c.toString(36), '') }
        while (Object.keys(this.bindMap).includes(key));
        return key
    }
    
    findOrRegisterBind(DOMelement){
        if(!(DOMelement._DocObjectConfig)){
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

    generateBind(config, bind, bound){
        let html = this.parser.parseFromString(bound, 'text/html').body.childNodes
        html[0]._DocObjectConfig = config;
        html[0].setAttribute((html[0].localName === 'd-bind' ? 'to' : this.bindAttr), bind)
        Object.entries(config.originalAttributes).filter(attA=>attA[0]!== 'd-bind-in').forEach(attA=>html[0].setAttribute(attA[0], attA[1]))
        return html[0];
    }

    

    runRender(valueChanges = {}) {
        this.render.filter(ren => (ren.dep && Array.isArray(ren.dep) && ren.dep.some((dep) => (dep in valueChanges))) || (ren.dep === undefined)).forEach(ren => {
            if (ren.clean) ren.clean({ ...this.values, ...valueChanges }, this.values)
            ren.action({ ...this.values, ...valueChanges }, this.values)
        })
        this.runBinds(this.root, valueChanges);
    }
    getBindAction(element) {
        if(element.getAttribute(this.bindAttr)){
            return [element.getAttribute(this.bindAttr), (replace)=>element.parentNode.replaceChild(replace, element)]
        }else if(element.localName === 'd-bind'){
            return [element.getAttribute('to'), (replace)=>element.parentNode.replaceChild(replace, element)]
        }else if(element.getAttribute(this.bindInAttr)){
            return [element.getAttribute(this.bindInAttr), (replace)=>element.innerHTML = replace.outerHTML]
        }
    }


    runBinds(root, valueChanges = {}) {
        [ ...(root.querySelectorAll(`[${this.bindAttr}], [${this.bindInAttr}], d-bind[to]`)) ]
        .forEach( element => {
            //const [bind, bindAction] = [...( element.getAttribute(this.bindAttr) ? [element.getAttribute(this.bindAttr), (replace)=>element.parentNode.replaceChild(replace, element)] : [element.getAttribute(this.bindInAttr), (replace)=>element.innerHTML = replace.outerHTML])]
            const [bind, bindAction] = this.getBindAction(element)
            if (bind in this.binds) {
                    const config = this.findOrRegisterBind(element)
                    bindAction(this.runBinds(
                        this.generateBind(
                            config, 
                            bind, 
                            this.binds[bind](
                                { ...this.values, ...valueChanges }, 
                                config.originalAttributes,
                                config.originalChildren, 
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
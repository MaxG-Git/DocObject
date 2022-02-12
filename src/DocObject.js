
class DocElements {
    constructor() {
        return new Proxy(this, this);
    }
    get(target, prop) {
        return this[prop] ? this[prop]() : $('#' + prop)
    }
    set(target, prop, value, receiver) {
        if (typeof value === 'string') value = $(value)
        target[prop] = _ => value
        return true;
    }
}


class DocObject {
    _values = {};
    _updating
    elements;
    root;
    render = [];
    binds = {}

    set values(values) {
        throw Error("Tried to set DocObject.value. Try creating a inner object instead.")
    }
    get values() {
        return this._values;
    }
    constructor({ elements, values, render, binds, root }) {
        if (root) {
            this.root = root;
        } else {
            this.root = document;
        }
        this.elements = new DocElements()
        if (elements) {
            Object.entries(elements).forEach((e => { this.elements[e[0]] = e[1] }))
        }
        if (render && Array.isArray(render)) {
            this.render = render;
        } else {
            render = [];
        }
        if (binds && typeof binds === 'object') {
            this.binds = binds;
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
    }
    runRender(valueChanges = {}) {

        this.render.filter(ren => (ren.dep && Array.isArray(ren.dep) && ren.dep.some((dep) => (dep in valueChanges))) || (ren.dep === undefined)).forEach(ren => {
            if (ren.clean) ren.clean({ ...this.values, ...valueChanges }, this.values)
            ren.action({ ...this.values, ...valueChanges }, this.values)
        })
        this.runBinds(this.root, valueChanges);
    }
    runBinds(root, valueChanges = {}) {
        $(root).find('[d-bind]').toArray().forEach(e => {
                let bind = $(e).attr('d-bind')
                if (bind in this.binds) {
                    $(e).html(this.runBinds($(this.binds[bind]({ ...this.values, ...valueChanges }, this.values)), valueChanges));
                }
            })
        return root;
    }
}

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
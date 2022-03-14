import { DocObject, DocObjectElement } from "./docobject";
import DocGen from "./docgen";
import {setCursorPos, getCursorPos} from "./utils"

class Bind extends HTMLElement {
    constructor() {
        super()
    }
}

/******* UTILITY METHODS *******/
export function fixInput(selector, action){
    let pos = getCursorPos(selector()[0])
    action()
    setCursorPos(selector()[0], pos)
}


window.customElements.define('d-bind', Bind)
if(window.jQuery){
    (function($) {
        $.fn.extend({
            DocObject : function( options = null) {
                if(this[0]._DocObject && !options ) return this[0]._DocObject;
                this.each(function() {
                    new DocObject(this, options);
                });
                new DocObject(this, { isJQuery:true, ...options })
                return this[0]._DocObject;
            }
        })
    })(jQuery);
}

export function obj(root : DocObjectElement | JQuery, options : object) : DocObject{
    return new DocObject(root, options)
}

export function gen() : DocGen {
    return new DocGen()
}

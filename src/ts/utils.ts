interface Document {
    selection: {
        
    }
}

// Credits: https://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
 export function getCursorPos(element : HTMLInputElement) : number {
    // if (document.selection) {
    //     element.focus();
    //     return  document.selection.createRange().moveStart('character', -element.value.length);
    // }
        return element.selectionDirection == 'backward' ? element.selectionStart : element.selectionEnd;
}

// Credits: http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
export function setCursorPos(element : HTMLInputElement, pos : number) : void {
    // Modern browsers
    if (element.setSelectionRange) {
    element.focus();
    element.setSelectionRange(pos, pos);
    
    // IE8 and below
    } else if ((element as any).createTextRange) {
      var range = (element as any).createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
}
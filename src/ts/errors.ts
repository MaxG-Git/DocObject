

export const ROOT_ERROR = 'ROOT_ERROR'
export const JQUERY_NOT_DETECTED = 'JQUERY_NOT_DETECTED'


export default function runError(error : string, fail=false){
    if(error in ERRORS){
        if(fail){
            throw Error('DocObject: '+ ERRORS[error].message);
        }else{
            console.error(ERRORS[error].message)
        }
    }
}

const ERRORS = {
    ROOT_ERROR : {
        message: "Root Element Must be a valid Node, Or jQuery Element"
    },
    JQUERY_NOT_DETECTED: {
        message : "JQuery is not detected. Please load JQuery before DocObject"
    }
}

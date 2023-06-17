import { DocObjectBindFunction } from "../../docbind";
import DocGen from "../../docgen";


export function Dial(values, {
    stepsName = 'steps',
    angleName = 'angle',
    isDragName = 'isDrag',
    currentStepName = 'currentStep',
    style = {},
} = {}, children): DocObjectBindFunction {
    return (g: DocGen) => g.div(children, {
        style: {
            transform: `rotate(${values[angleName]}deg)`,
            width: '100px',
            height: '100px',
            borderRadius: '100%',
            cursor: 'grab',
            background: 'repeating-linear-gradient(0deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px)',
            ...style
        },
        ontouchstart: handleMouseDown(isDragName).bind(this),
        onmousedown: handleMouseDown(isDragName).bind(this),
        ontouchend: handleMouseUp(isDragName).bind(this),
        onmouseup: handleMouseUp(isDragName).bind(this),
        ontouchmove: handleMouseDrag(stepsName, angleName, currentStepName, isDragName).bind(this),
        onmousemove: handleMouseDrag(stepsName, angleName, currentStepName, isDragName).bind(this)
    })
}




function handleMouseDown(isDragName) {
    return function(event) {
        this.values[isDragName] = true
    }
}
function handleMouseUp(isDragName) {
    return function(event) {
    this.values[isDragName] = false
}
}

function handleMouseDrag(stepsName, angleName, currentStepName, isDragName) {
    return function(event) {
    if (!this.values[isDragName]) return;

    let mouseX;
    let mouseY;

    if(event.type === "touchmove"){
       mouseX = event.touches[0].clientX;
       mouseY = event.touches[0].clientY;
    }else{
      event.preventDefault();
      mouseX = event.clientX;
      mouseY =  event.clientY
    }
    
    
    const dialRect = event.target.getBoundingClientRect();
    const dialCenterX = dialRect.left + dialRect.width / 2;
    const dialCenterY = dialRect.top + dialRect.height / 2;
    const dx = mouseX - dialCenterX;
    const dy = mouseY - dialCenterY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (this.values[stepsName]) {
        const stepSize = 360 / this.values[stepsName];
        const stepIndex = Math.round(angle / stepSize);
        this.values[angleName] = (stepSize * stepIndex)
        this.values[currentStepName] = (((stepIndex % this.values[stepsName]) + this.values[stepsName]) % this.values[stepsName]) + 1
    } else {
        this.values[angleName] = angle
    }
}
}
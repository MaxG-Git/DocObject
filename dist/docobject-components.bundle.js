var DocBinds;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/components/bootstrap/ListGroup.ts":
/*!**************************************************!*\
  !*** ./src/ts/components/bootstrap/ListGroup.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ListItem = exports.ListGroup = void 0;
const ListGroup = (_, __, children) => (g) => g.ul(children, { class: 'list-group' });
exports.ListGroup = ListGroup;
function ListItem({ active }, { href, key, }, children) {
    return (g) => {
        return g.a(children, {
            class: `list-group-item list-group-item-action ${key == active ? 'active' : ''}`,
            onclick: () => {
                this.values.active = key;
            }
        });
    };
}
exports.ListItem = ListItem;


/***/ }),

/***/ "./src/ts/components/bootstrap/Pagination.ts":
/*!***************************************************!*\
  !*** ./src/ts/components/bootstrap/Pagination.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Pagination = exports.PageItem = void 0;
function PageItem(_, { active, page, offsetName }, children) {
    return (g) => g.li(g.a(children, { class: 'page-link' }), {
        class: 'page-item' + (active ? ' active' : ''),
        style: { cursor: 'pointer' },
        onclick: () => {
            this.values[offsetName] = page.offset;
        },
    });
}
exports.PageItem = PageItem;
function Pagination(values, { max, total, maxPages, zerothIndex, showPad, offsetName = 'offset' }) {
    const offset = values[offsetName];
    return (g) => {
        let totalPages = Math.floor(+total / +max + (+total % +max > 0 ? 1 : 0));
        let currentPage = Math.floor(((+offset || 1) - (zerothIndex ? 1 : 0)) / +max) + 1;
        let lowerBound = Math.max(0, currentPage - Math.ceil(+maxPages / 2));
        let upperBound = Math.min(totalPages, currentPage + Math.floor(+maxPages / 2));
        upperBound += (lowerBound == 0) ? (+maxPages % upperBound) : 0;
        lowerBound -= (upperBound == totalPages) ? +maxPages - (totalPages % lowerBound) : 0;
        let pages = [...Array(totalPages).keys()].slice(lowerBound, upperBound).map(e => {
            return { display: e + 1, page: e + 1, offset: +max * (e) };
        });
        if (showPad !== undefined && lowerBound > 0) {
            pages = [
                { display: 1, page: 1, offset: 0 },
                { display: '...', page: lowerBound, offset: (lowerBound - 1) * +max },
                ...pages
            ];
        }
        if (showPad !== undefined && upperBound < totalPages) {
            pages = [
                ...pages,
                { display: '...', page: upperBound + 1, offset: (upperBound) * +max },
                { display: totalPages, page: totalPages, offset: (totalPages - 1) * +max },
            ];
        }
        return g.nav(g.ul(pages.map(page => g.PageItem(page.display, { active: currentPage === page.page, page, offsetName })), { class: 'pagination' }));
    };
}
exports.Pagination = Pagination;


/***/ }),

/***/ "./src/ts/components/vanilla/Dial.ts":
/*!*******************************************!*\
  !*** ./src/ts/components/vanilla/Dial.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Dial = void 0;
function Dial(values, { stepsName = 'steps', angleName = 'angle', isDragName = 'isDrag', currentStepName = 'currentStep', style = {}, } = {}, children) {
    return (g) => g.div(children, {
        style: Object.assign({ transform: `rotate(${values[angleName]}deg)`, width: '100px', height: '100px', borderRadius: '100%', cursor: 'grab', background: 'repeating-linear-gradient(0deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px)' }, style),
        ontouchstart: handleMouseDown(isDragName).bind(this),
        onmousedown: handleMouseDown(isDragName).bind(this),
        ontouchend: handleMouseUp(isDragName).bind(this),
        onmouseup: handleMouseUp(isDragName).bind(this),
        ontouchmove: handleMouseDrag(stepsName, angleName, currentStepName, isDragName).bind(this),
        onmousemove: handleMouseDrag(stepsName, angleName, currentStepName, isDragName).bind(this)
    });
}
exports.Dial = Dial;
function handleMouseDown(isDragName) {
    return function (event) {
        this.values[isDragName] = true;
    };
}
function handleMouseUp(isDragName) {
    return function (event) {
        this.values[isDragName] = false;
    };
}
function handleMouseDrag(stepsName, angleName, currentStepName, isDragName) {
    return function (event) {
        if (!this.values[isDragName])
            return;
        let mouseX;
        let mouseY;
        if (event.type === "touchmove") {
            mouseX = event.touches[0].clientX;
            mouseY = event.touches[0].clientY;
        }
        else {
            event.preventDefault();
            mouseX = event.clientX;
            mouseY = event.clientY;
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
            this.values[angleName] = (stepSize * stepIndex);
            this.values[currentStepName] = (((stepIndex % this.values[stepsName]) + this.values[stepsName]) % this.values[stepsName]) + 1;
        }
        else {
            this.values[angleName] = angle;
        }
    };
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
var exports = __webpack_exports__;
/*!************************************!*\
  !*** ./src/ts/components/index.ts ***!
  \************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Vanilla = exports.Bootstrap = void 0;
const ListGroup_1 = __webpack_require__(/*! ./bootstrap/ListGroup */ "./src/ts/components/bootstrap/ListGroup.ts");
const Pagination_1 = __webpack_require__(/*! ./bootstrap/Pagination */ "./src/ts/components/bootstrap/Pagination.ts");
const Dial_1 = __webpack_require__(/*! ./vanilla/Dial */ "./src/ts/components/vanilla/Dial.ts");
exports.Bootstrap = {
    ListGroup: ListGroup_1.ListGroup,
    ListItem: ListGroup_1.ListItem,
    Pagination: Pagination_1.Pagination,
    PageItem: Pagination_1.PageItem
};
exports.Vanilla = {
    Dial: Dial_1.Dial
};

}();
DocBinds = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztTQUNoSTthQUFNO1lBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLO1NBQ2pDO0lBQ0wsQ0FBQztBQUNELENBQUM7Ozs7Ozs7VUM1RUQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7Ozs7OztBQ3RCQSxtSEFBMkQ7QUFDM0Qsc0hBQTZEO0FBQzdELGdHQUFxQztBQUd4QixpQkFBUyxHQUFHO0lBQ3JCLFNBQVMsRUFBVCxxQkFBUztJQUNULFFBQVEsRUFBUixvQkFBUTtJQUNSLFVBQVUsRUFBVix1QkFBVTtJQUNWLFFBQVEsRUFBUixxQkFBUTtDQUNYO0FBRVksZUFBTyxHQUFHO0lBQ25CLElBQUksRUFBSixXQUFJO0NBQ1AsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL0RvY09iamVjdC8uL3NyYy90cy9jb21wb25lbnRzL2Jvb3RzdHJhcC9MaXN0R3JvdXAudHMiLCJ3ZWJwYWNrOi8vRG9jT2JqZWN0Ly4vc3JjL3RzL2NvbXBvbmVudHMvYm9vdHN0cmFwL1BhZ2luYXRpb24udHMiLCJ3ZWJwYWNrOi8vRG9jT2JqZWN0Ly4vc3JjL3RzL2NvbXBvbmVudHMvdmFuaWxsYS9EaWFsLnRzIiwid2VicGFjazovL0RvY09iamVjdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9Eb2NPYmplY3QvLi9zcmMvdHMvY29tcG9uZW50cy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEb2NPYmplY3RCaW5kRnVuY3Rpb24gfSBmcm9tIFwiLi4vLi4vZG9jYmluZFwiO1xyXG5pbXBvcnQgRG9jR2VuIGZyb20gXCIuLi8uLi9kb2NnZW5cIjtcclxuXHJcbmV4cG9ydCBjb25zdCBMaXN0R3JvdXAgPSAoXywgX18sIGNoaWxkcmVuKTogRG9jT2JqZWN0QmluZEZ1bmN0aW9uID0+IChnIDogRG9jR2VuKSA9PiBnLnVsKGNoaWxkcmVuLCB7IGNsYXNzOiAnbGlzdC1ncm91cCcgfSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBMaXN0SXRlbSh7IGFjdGl2ZSB9LCB7IGhyZWYsIGtleSwgfSwgY2hpbGRyZW4pOiBEb2NPYmplY3RCaW5kRnVuY3Rpb24ge1xyXG4gICAgcmV0dXJuIChnIDogRG9jR2VuKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGcuYShjaGlsZHJlbiwge1xyXG4gICAgICAgICAgICBjbGFzczogYGxpc3QtZ3JvdXAtaXRlbSBsaXN0LWdyb3VwLWl0ZW0tYWN0aW9uICR7a2V5ID09IGFjdGl2ZSA/ICdhY3RpdmUnIDogJyd9YCxcclxuICAgICAgICAgICAgb25jbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXMuYWN0aXZlID0ga2V5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG59ICIsImltcG9ydCB7IERvY09iamVjdEJpbmRGdW5jdGlvbiB9IGZyb20gXCIuLi8uLi9kb2NiaW5kXCI7XHJcbmltcG9ydCBEb2NHZW4gZnJvbSBcIi4uLy4uL2RvY2dlblwiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFBhZ2VJdGVtIChfLCB7IGFjdGl2ZSwgcGFnZSwgb2Zmc2V0TmFtZSB9LCBjaGlsZHJlbikgOiBEb2NPYmplY3RCaW5kRnVuY3Rpb24ge1xyXG4gICAgcmV0dXJuIChnOiBEb2NHZW4pID0+IGcubGkoXHJcbiAgICAgICAgZy5hKGNoaWxkcmVuLCB7IGNsYXNzOiAncGFnZS1saW5rJyB9KSxcclxuICAgICAgICB7IFxyXG4gICAgICAgICAgICBjbGFzczogJ3BhZ2UtaXRlbScgKyAoYWN0aXZlID8gJyBhY3RpdmUnIDogJycpLCBcclxuICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicgfSxcclxuICAgICAgICAgICAgb25jbGljazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXNbb2Zmc2V0TmFtZV0gPSBwYWdlLm9mZnNldFxyXG4gICAgICAgICAgICB9LCBcclxuICAgICAgICB9XHJcbiAgICApXHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFBhZ2luYXRpb24gKHZhbHVlcyAsIHsgbWF4LCB0b3RhbCwgbWF4UGFnZXMsIHplcm90aEluZGV4LCBzaG93UGFkLCBvZmZzZXROYW1lPSdvZmZzZXQnIH0pIHtcclxuICAgIGNvbnN0IG9mZnNldCA9IHZhbHVlc1tvZmZzZXROYW1lXVxyXG4gICAgXHJcbiAgICByZXR1cm4gKGcgOiBEb2NHZW4pID0+IHtcclxuICAgICAgICBsZXQgdG90YWxQYWdlcyA9IE1hdGguZmxvb3IoK3RvdGFsIC8gK21heCArICgrdG90YWwgJSArbWF4ID4gMCA/IDEgOiAwKSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFBhZ2UgPSBNYXRoLmZsb29yKCgoK29mZnNldCB8fCAxKSAtICh6ZXJvdGhJbmRleCA/IDEgOiAwKSkgLyArbWF4KSArIDE7XHJcbiAgICAgICAgICAgICAgICBsZXQgbG93ZXJCb3VuZCA9IE1hdGgubWF4KDAsIGN1cnJlbnRQYWdlIC0gTWF0aC5jZWlsKCttYXhQYWdlcyAvIDIpKVxyXG4gICAgICAgICAgICAgICAgbGV0IHVwcGVyQm91bmQgPSBNYXRoLm1pbih0b3RhbFBhZ2VzLCBjdXJyZW50UGFnZSArIE1hdGguZmxvb3IoK21heFBhZ2VzIC8gMikpO1xyXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCArPSAobG93ZXJCb3VuZCA9PSAwKSA/ICgrbWF4UGFnZXMgJSB1cHBlckJvdW5kKSA6IDBcclxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQgLT0gKHVwcGVyQm91bmQgPT0gdG90YWxQYWdlcykgPyArbWF4UGFnZXMgLSAodG90YWxQYWdlcyAlIGxvd2VyQm91bmQpIDogMFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgcGFnZXMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA6IHN0cmluZ3xudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZSA6IG51bWJlciwgXHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IDogbnVtYmVyXHJcbiAgICAgICAgICAgICAgICB9W10gPSBbLi4uQXJyYXkodG90YWxQYWdlcykua2V5cygpXS5zbGljZShsb3dlckJvdW5kLCB1cHBlckJvdW5kKS5tYXAoZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZGlzcGxheTogZSArIDEsIHBhZ2U6IGUgKyAxLCBvZmZzZXQ6ICttYXggKiAoZSkgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGlmIChzaG93UGFkICE9PSB1bmRlZmluZWQgJiYgbG93ZXJCb3VuZCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwYWdlcyA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyBkaXNwbGF5IDogMSwgcGFnZTogMSwgb2Zmc2V0OiAwIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZGlzcGxheTogJy4uLicsIHBhZ2U6IGxvd2VyQm91bmQsIG9mZnNldDogKGxvd2VyQm91bmQgLSAxKSAqICttYXggfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucGFnZXNcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc2hvd1BhZCAhPT0gdW5kZWZpbmVkICYmIHVwcGVyQm91bmQgPCB0b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZXMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnBhZ2VzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGRpc3BsYXk6ICcuLi4nLCBwYWdlOiB1cHBlckJvdW5kICsgMSwgb2Zmc2V0OiAodXBwZXJCb3VuZCkgKiArbWF4IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZGlzcGxheTogdG90YWxQYWdlcywgcGFnZTogdG90YWxQYWdlcywgb2Zmc2V0OiAodG90YWxQYWdlcyAtIDEpICogK21heCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBnLm5hdihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGcudWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZXMubWFwKHBhZ2UgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZy5QYWdlSXRlbShwYWdlLmRpc3BsYXksIHsgYWN0aXZlOiBjdXJyZW50UGFnZSA9PT0gcGFnZS5wYWdlLCBwYWdlLCBvZmZzZXROYW1lIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICksIHsgY2xhc3M6ICdwYWdpbmF0aW9uJyB9XHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRG9jT2JqZWN0QmluZEZ1bmN0aW9uIH0gZnJvbSBcIi4uLy4uL2RvY2JpbmRcIjtcclxuaW1wb3J0IERvY0dlbiBmcm9tIFwiLi4vLi4vZG9jZ2VuXCI7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIERpYWwodmFsdWVzLCB7XHJcbiAgICBzdGVwc05hbWUgPSAnc3RlcHMnLFxyXG4gICAgYW5nbGVOYW1lID0gJ2FuZ2xlJyxcclxuICAgIGlzRHJhZ05hbWUgPSAnaXNEcmFnJyxcclxuICAgIGN1cnJlbnRTdGVwTmFtZSA9ICdjdXJyZW50U3RlcCcsXHJcbiAgICBzdHlsZSA9IHt9LFxyXG59ID0ge30sIGNoaWxkcmVuKTogRG9jT2JqZWN0QmluZEZ1bmN0aW9uIHtcclxuICAgIHJldHVybiAoZzogRG9jR2VuKSA9PiBnLmRpdihjaGlsZHJlbiwge1xyXG4gICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgIHRyYW5zZm9ybTogYHJvdGF0ZSgke3ZhbHVlc1thbmdsZU5hbWVdfWRlZylgLFxyXG4gICAgICAgICAgICB3aWR0aDogJzEwMHB4JyxcclxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwcHgnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMDAlJyxcclxuICAgICAgICAgICAgY3Vyc29yOiAnZ3JhYicsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdyZXBlYXRpbmctbGluZWFyLWdyYWRpZW50KDBkZWcsIzYwNmRiYywjNjA2ZGJjIDEwcHgsIzQ2NTI5OCAxMHB4LCM0NjUyOTggMjBweCknLFxyXG4gICAgICAgICAgICAuLi5zdHlsZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb250b3VjaHN0YXJ0OiBoYW5kbGVNb3VzZURvd24oaXNEcmFnTmFtZSkuYmluZCh0aGlzKSxcclxuICAgICAgICBvbm1vdXNlZG93bjogaGFuZGxlTW91c2VEb3duKGlzRHJhZ05hbWUpLmJpbmQodGhpcyksXHJcbiAgICAgICAgb250b3VjaGVuZDogaGFuZGxlTW91c2VVcChpc0RyYWdOYW1lKS5iaW5kKHRoaXMpLFxyXG4gICAgICAgIG9ubW91c2V1cDogaGFuZGxlTW91c2VVcChpc0RyYWdOYW1lKS5iaW5kKHRoaXMpLFxyXG4gICAgICAgIG9udG91Y2htb3ZlOiBoYW5kbGVNb3VzZURyYWcoc3RlcHNOYW1lLCBhbmdsZU5hbWUsIGN1cnJlbnRTdGVwTmFtZSwgaXNEcmFnTmFtZSkuYmluZCh0aGlzKSxcclxuICAgICAgICBvbm1vdXNlbW92ZTogaGFuZGxlTW91c2VEcmFnKHN0ZXBzTmFtZSwgYW5nbGVOYW1lLCBjdXJyZW50U3RlcE5hbWUsIGlzRHJhZ05hbWUpLmJpbmQodGhpcylcclxuICAgIH0pXHJcbn1cclxuXHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZU1vdXNlRG93bihpc0RyYWdOYW1lKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICB0aGlzLnZhbHVlc1tpc0RyYWdOYW1lXSA9IHRydWVcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBoYW5kbGVNb3VzZVVwKGlzRHJhZ05hbWUpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihldmVudCkge1xyXG4gICAgdGhpcy52YWx1ZXNbaXNEcmFnTmFtZV0gPSBmYWxzZVxyXG59XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbmRsZU1vdXNlRHJhZyhzdGVwc05hbWUsIGFuZ2xlTmFtZSwgY3VycmVudFN0ZXBOYW1lLCBpc0RyYWdOYW1lKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGlmICghdGhpcy52YWx1ZXNbaXNEcmFnTmFtZV0pIHJldHVybjtcclxuXHJcbiAgICBsZXQgbW91c2VYO1xyXG4gICAgbGV0IG1vdXNlWTtcclxuXHJcbiAgICBpZihldmVudC50eXBlID09PSBcInRvdWNobW92ZVwiKXtcclxuICAgICAgIG1vdXNlWCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WDtcclxuICAgICAgIG1vdXNlWSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcclxuICAgIH1lbHNle1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBtb3VzZVggPSBldmVudC5jbGllbnRYO1xyXG4gICAgICBtb3VzZVkgPSAgZXZlbnQuY2xpZW50WVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBcclxuICAgIGNvbnN0IGRpYWxSZWN0ID0gZXZlbnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgY29uc3QgZGlhbENlbnRlclggPSBkaWFsUmVjdC5sZWZ0ICsgZGlhbFJlY3Qud2lkdGggLyAyO1xyXG4gICAgY29uc3QgZGlhbENlbnRlclkgPSBkaWFsUmVjdC50b3AgKyBkaWFsUmVjdC5oZWlnaHQgLyAyO1xyXG4gICAgY29uc3QgZHggPSBtb3VzZVggLSBkaWFsQ2VudGVyWDtcclxuICAgIGNvbnN0IGR5ID0gbW91c2VZIC0gZGlhbENlbnRlclk7XHJcbiAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSAqIDE4MCAvIE1hdGguUEk7XHJcbiAgICBpZiAodGhpcy52YWx1ZXNbc3RlcHNOYW1lXSkge1xyXG4gICAgICAgIGNvbnN0IHN0ZXBTaXplID0gMzYwIC8gdGhpcy52YWx1ZXNbc3RlcHNOYW1lXTtcclxuICAgICAgICBjb25zdCBzdGVwSW5kZXggPSBNYXRoLnJvdW5kKGFuZ2xlIC8gc3RlcFNpemUpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzW2FuZ2xlTmFtZV0gPSAoc3RlcFNpemUgKiBzdGVwSW5kZXgpXHJcbiAgICAgICAgdGhpcy52YWx1ZXNbY3VycmVudFN0ZXBOYW1lXSA9ICgoKHN0ZXBJbmRleCAlIHRoaXMudmFsdWVzW3N0ZXBzTmFtZV0pICsgdGhpcy52YWx1ZXNbc3RlcHNOYW1lXSkgJSB0aGlzLnZhbHVlc1tzdGVwc05hbWVdKSArIDFcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZXNbYW5nbGVOYW1lXSA9IGFuZ2xlXHJcbiAgICB9XHJcbn1cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBMaXN0R3JvdXAsIExpc3RJdGVtIH0gZnJvbSBcIi4vYm9vdHN0cmFwL0xpc3RHcm91cFwiXHJcbmltcG9ydCB7IFBhZ2luYXRpb24sIFBhZ2VJdGVtIH0gZnJvbSBcIi4vYm9vdHN0cmFwL1BhZ2luYXRpb25cIlxyXG5pbXBvcnQgeyBEaWFsIH0gZnJvbSBcIi4vdmFuaWxsYS9EaWFsXCJcclxuXHJcblxyXG5leHBvcnQgY29uc3QgQm9vdHN0cmFwID0ge1xyXG4gICAgTGlzdEdyb3VwLCBcclxuICAgIExpc3RJdGVtLFxyXG4gICAgUGFnaW5hdGlvbixcclxuICAgIFBhZ2VJdGVtXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBWYW5pbGxhID0ge1xyXG4gICAgRGlhbFxyXG59OyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
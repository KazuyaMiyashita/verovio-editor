/**
 * The VerovioView class is the based class for other view implementation featuring Verovio rendering.
 * It should not be instantiated directly but only through inherited classes.
 * The VerovioView is attached to a VerovioMessenger.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GenericView } from '../utils/generic-view.js';
import { EventManager } from '../events/event-manager.js';
export class VerovioView extends GenericView {
    constructor(div, app, verovio) {
        super(div, app);
        // VerovioMessenger object
        this.verovio = verovio;
        // One of the little quirks of writing in ES6, bind events
        this.eventManager = new EventManager(this);
        this.bindListeners(); // Document/Window-scoped events
        // Common members
        this.currentPage = 1;
        this.currentZoomIndex = this.app.currentZoomIndex;
        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
    }
    // Called to unsubscribe from all events. Probably a good idea to call this if the object is deleted.
    destroy() {
        this.eventManager.unbindAll();
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchmove', this.boundMouseMove);
        document.removeEventListener('touchend', this.boundMouseUp);
        super.destroy();
    }
    parseAndScaleSVG(svgString, height, width) {
        const parser = new DOMParser();
        const svg = parser.parseFromString(svgString, "text/xml");
        svg.firstElementChild.setAttribute(`height`, `${height}px`);
        svg.firstElementChild.setAttribute(`width`, `${width}px`);
        return svg.firstChild;
    }
    // Necessary for how ES6 "this" works inside events
    bindListeners() {
        this.boundKeyDown = (e) => this.keyDownListener(e);
        this.boundMouseMove = (e) => this.mouseMoveListener(e);
        this.boundMouseUp = (e) => this.mouseUpListener(e);
        this.boundResize = (e) => this.resizeComponents(e);
    }
    updateView(update_1) {
        return __awaiter(this, arguments, void 0, function* (update, lightEndLoading = false, mei = "", reload = false) {
            console.debug("View::updateView should be overwritten");
            console.debug(update);
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("VerovioView::onActivate");
        this.updateView(VerovioView.Update.Activate);
        return true;
    }
    onResized(e) {
        if (!super.onResized(e))
            return false;
        //console.debug("VerovioView::onResized");
        this.updateView(VerovioView.Update.Resized);
        return true;
    }
    onLoadData(e) {
        var _a, _b, _c, _d, _e, _f;
        if (!super.onLoadData(e))
            return false;
        //console.debug("VerovioView::onLoadData");
        const mei = (_b = (_a = e.detail) === null || _a === void 0 ? void 0 : _a.mei) !== null && _b !== void 0 ? _b : '';
        const lightEndLoading = (_d = (_c = e.detail) === null || _c === void 0 ? void 0 : _c.lightEndLoading) !== null && _d !== void 0 ? _d : true;
        const reload = (_f = (_e = e.detail) === null || _e === void 0 ? void 0 : _e.reload) !== null && _f !== void 0 ? _f : false;
        this.updateView(VerovioView.Update.LoadData, lightEndLoading, mei, reload);
        return true;
    }
    onZoom(e) {
        if (!super.onZoom(e))
            return false;
        //console.debug("VerovioView::onZoom");
        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
        this.updateView(VerovioView.Update.Zoom);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////
    keyDownListener(e) { }
    mouseMoveListener(e) { }
    mouseUpListener(e) { }
    resizeComponents(e) { }
}
////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////
(function (VerovioView) {
    let Update;
    (function (Update) {
        Update[Update["Activate"] = 0] = "Activate";
        Update[Update["Resized"] = 1] = "Resized";
        Update[Update["LoadData"] = 2] = "LoadData";
        Update[Update["Zoom"] = 3] = "Zoom";
    })(Update = VerovioView.Update || (VerovioView.Update = {}));
    ;
})(VerovioView || (VerovioView = {}));
;
//# sourceMappingURL=verovio-view.js.map
/**
 * The VerovioView class is the based class for other view implementation featuring Verovio rendering.
 * It should not be instantiated directly but only through inherited classes.
 * The VerovioView is attached to a VerovioMessenger.
 */
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
        this.currentZoomIndex = this.app.getCurrentZoomIndex();
        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
    }
    ///////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    getCurrentPage() { return this.currentPage; }
    setCurrentPage(value) { this.currentPage = value; }
    getCurrentZoomIndex() { return this.currentZoomIndex; }
    setCurrentZoomIndex(value) { this.currentZoomIndex = value; }
    getCurrentScale() { return this.currentScale; }
    setCurrentScale(value) { this.currentScale = value; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific method
    ////////////////////////////////////////////////////////////////////////
    parseAndScaleSVG(svgString, height, width) {
        const parser = new DOMParser();
        const svg = parser.parseFromString(svgString, "text/xml");
        svg.firstElementChild.setAttribute(`height`, `${height}px`);
        svg.firstElementChild.setAttribute(`width`, `${width}px`);
        return svg.firstChild;
    }
    // Necessary for how ES6 "this" works inside events
    bindListeners() {
        this.boundContextMenu = (e) => this.contextMenuListener(e);
        this.boundKeyDown = (e) => this.keyDownListener(e);
        this.boundKeyUp = (e) => this.keyUpListener(e);
        this.boundMouseMove = (e) => this.mouseMoveListener(e);
        this.boundMouseUp = (e) => this.mouseUpListener(e);
        this.boundResize = (e) => this.resizeComponents(e);
    }
    ////////////////////////////////////////////////////////////////////////
    // Overriding methods
    ////////////////////////////////////////////////////////////////////////
    destroy() {
        // Called to unsubscribe from all events. Probably a good idea to call this if the object is deleted.
        this.eventManager.unbindAll();
        document.removeEventListener('contextmenu', this.contextMenuListener);
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchmove', this.boundMouseMove);
        document.removeEventListener('touchend', this.boundMouseUp);
        super.destroy();
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("VerovioView::onActivate");
        this.refreshView(VerovioView.Refresh.Activate);
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
        this.refreshView(VerovioView.Refresh.LoadData, lightEndLoading, mei, reload);
        return true;
    }
    onResized(e) {
        if (!super.onResized(e))
            return false;
        //console.debug("VerovioView::onResized");
        this.refreshView(VerovioView.Refresh.Resized);
        return true;
    }
    onZoom(e) {
        if (!super.onZoom(e))
            return false;
        //console.debug("VerovioView::onZoom");
        this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
        this.refreshView(VerovioView.Refresh.Zoom);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker method
    ////////////////////////////////////////////////////////////////////////
    async refreshView(update, lightEndLoading = false, mei = "", reload = false) {
        console.debug("View::updateView should be overwritten");
    }
    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////
    contextMenuListener(e) { }
    keyDownListener(e) { }
    keyUpListener(e) { }
    mouseMoveListener(e) { }
    mouseUpListener(e) { }
    resizeComponents(e) { }
}
////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////
(function (VerovioView) {
    let Refresh;
    (function (Refresh) {
        Refresh[Refresh["Activate"] = 0] = "Activate";
        Refresh[Refresh["Resized"] = 1] = "Resized";
        Refresh[Refresh["LoadData"] = 2] = "LoadData";
        Refresh[Refresh["Zoom"] = 3] = "Zoom";
    })(Refresh = VerovioView.Refresh || (VerovioView.Refresh = {}));
    ;
})(VerovioView || (VerovioView = {}));
;
//# sourceMappingURL=verovio-view.js.map
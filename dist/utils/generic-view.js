/**
 * The GenericView class is the based class for other view implementation.
 * It essentially provide a CustomEventManager and can be activate or deactivated.
 * It should not be instantiated directly but only through inherited classes.
 */
import { CustomEventManager } from '../events/custom-event-manager.js';
import { appendDivTo, appendSpanTo, randomHex } from '../utils/functions.js';
export class GenericView {
    constructor(div, app) {
        // Root element in which verovio-ui is created
        this.div = div;
        // App object
        this.app = app;
        // Generate an id for the CustomEventManager
        this.id = randomHex(16);
        this.active = false;
        this.display = 'block';
        this.customEventManager = new CustomEventManager();
        this.customEventManager.bind(this, 'onActivate', this.onActivate);
        this.customEventManager.bind(this, 'onCursorActivity', this.onCursorActivity);
        this.customEventManager.bind(this, 'onDeactivate', this.onDeactivate);
        this.customEventManager.bind(this, 'onEditData', this.onEditData);
        this.customEventManager.bind(this, 'onEndLoading', this.onEndLoading);
        this.customEventManager.bind(this, 'onLoadData', this.onLoadData);
        this.customEventManager.bind(this, 'onPage', this.onPage);
        this.customEventManager.bind(this, 'onResized', this.onResized);
        this.customEventManager.bind(this, 'onSelect', this.onSelect);
        this.customEventManager.bind(this, 'onStartLoading', this.onStartLoading);
        this.customEventManager.bind(this, 'onZoom', this.onZoom);
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    getDiv() { return this.div; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    destroy() {
        // Nothing at this level
    }
    setDisplayFlex() { this.display = 'flex'; }
    addFieldSet(label, flexGrow = 1) {
        let legend = appendDivTo(this.div, { class: `vrv-legend` });
        legend.innerHTML = label;
        let span = appendSpanTo(legend, { class: `icon` }, '▼');
        let fieldSet = appendDivTo(this.div, { class: `vrv-field-set` });
        if (flexGrow !== 1)
            fieldSet.style.flexGrow = `${flexGrow}`;
        span.addEventListener("click", () => {
            legend.classList.toggle("toggled");
            fieldSet.classList.toggle("toggled");
        });
        return fieldSet;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        //console.debug("GenericView::onActivate");
        this.div.style.display = this.display;
        this.active = true;
        return true;
    }
    onCursorActivity(e) {
        if (!this.active)
            return false;
        //console.debug("GenericView::onCursorActivity");
        return true;
    }
    onDeactivate(e) {
        //console.debug("GenericView::onDeactivate");
        this.div.style.display = 'none';
        this.active = false;
        return true;
    }
    onEditData(e) {
        var _a;
        if (!this.active)
            return false;
        if (((_a = e.detail) === null || _a === void 0 ? void 0 : _a.caller) && this === e.detail.caller)
            return false;
        //console.debug("GenericView::onEditData");
        return true;
    }
    onEndLoading(e) {
        if (!this.active)
            return false;
        //console.debug("GenericView::onEndLoading");
        return true;
    }
    onLoadData(e) {
        if (!this.active)
            return false;
        //console.debug("GenericView::onLoadData");
        return true;
    }
    onPage(e) {
        if (!this.active)
            return false;
        //console.debug("GenericView::onPage");
        return true;
    }
    onResized(e) {
        if (!this.active)
            return false;
        //console.debug("GenericView::onResized");
        return true;
    }
    onSelect(e) {
        if (!this.active)
            return false;
        if (this === e.detail.caller)
            return false;
        //console.debug("GenericView::onSelect");
        return true;
    }
    onStartLoading(e) {
        if (!this.active)
            return false;
        //console.debug("GenericView::onStartLoading");
        return true;
    }
    onZoom(e) {
        if (!this.active)
            return false;
        //console.debug("GenericView::onZoom");
        return true;
    }
}
//# sourceMappingURL=generic-view.js.map
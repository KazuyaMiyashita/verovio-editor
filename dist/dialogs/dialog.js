/**
 * The Dialog class is the based class for other dialog implementations.
 * It should not be instantiated directly but only through inherited classes.
 */
import { Deferred } from '../events/deferred.js';
import { EventManager } from '../events/event-manager.js';
import { appendDetailsTo, appendDivTo, appendSummaryTo, insertDivBefore } from '../utils/functions.js';
export class Dialog {
    constructor(div, app, title, options) {
        this.options = Object.assign({
            icon: "info",
            type: Dialog.Type.OKCancel,
            okLabel: "OK",
            cancelLabel: "Cancel"
        }, options);
        this.div = div;
        // Remove previous content
        this.div.innerHTML = "";
        this.app = app;
        this.eventManager = new EventManager(this);
        this.bindListeners(); // Document/Window-scoped events
        // Create the HTML content
        this.box = appendDivTo(this.div, { class: `vrv-dialog-box` });
        // The top of the dialog
        this.top = appendDivTo(this.box, { class: `vrv-dialog-top` });
        this.icon = appendDivTo(this.top, { class: `vrv-dialog-icon` });
        this.icon.classList.add(this.options.icon);
        const titleDiv = appendDivTo(this.top, { class: `vrv-dialog-title` });
        titleDiv.innerHTML = title;
        this.close = appendDivTo(this.top, { class: `vrv-dialog-close` });
        // The content of the dialog
        this.content = appendDivTo(this.box, { class: `vrv-dialog-content` });
        // The bottom of the dialog with buttons
        this.bottom = appendDivTo(this.box, { class: `vrv-dialog-bottom` });
        this.cancelBtn = appendDivTo(this.bottom, { class: `vrv-dialog-btn`, 'data-before': this.options.cancelLabel });
        this.okBtn = appendDivTo(this.bottom, { class: `vrv-dialog-btn`, 'data-before': this.options.okLabel });
        this.eventManager.bind(this.close, 'click', this.cancel);
        this.eventManager.bind(this.cancelBtn, 'click', this.cancel);
        this.eventManager.bind(this.okBtn, 'click', this.ok);
        document.addEventListener('keydown', this.boundKeyDown);
        if (this.options.type === Dialog.Type.Msg) {
            this.cancelBtn.style.display = 'none';
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    addButton(label, event) {
        const btn = insertDivBefore(this.bottom, { class: `vrv-dialog-btn`, 'data-before': label }, this.cancelBtn);
        this.eventManager.bind(btn, 'click', event);
    }
    setContent(content) {
        this.content.innerHTML = content;
    }
    addDetails(label, content) {
        let details = appendDetailsTo(this.content, {});
        let summary = appendSummaryTo(details, {});
        let div = appendDivTo(details, {});
        summary.innerHTML = label;
        div.innerHTML = content;
    }
    bindListeners() {
        this.boundKeyDown = (e) => this.keyDownListener(e);
    }
    cancel() {
        this.div.style.display = 'none';
        document.removeEventListener('keydown', this.boundKeyDown);
        this.deferred.resolve(0);
    }
    ok() {
        this.div.style.display = 'none';
        document.removeEventListener('keydown', this.boundKeyDown);
        const resolveValue = (this.options.type === Dialog.Type.Msg) ? 0 : 1;
        this.deferred.resolve(resolveValue);
    }
    reset() { }
    ////////////////////////////////////////////////////////////////////////
    // Async methods
    ////////////////////////////////////////////////////////////////////////
    async show() {
        this.div.style.display = 'block';
        this.okBtn.focus();
        this.deferred = new Deferred();
        return this.deferred.promise;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    keyDownListener(e) {
        if (e.keyCode === 27)
            this.cancel(); // esc
        else if (e.keyCode === 13)
            this.ok(); // enter
    }
}
////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////
(function (Dialog) {
    let Type;
    (function (Type) {
        Type[Type["Msg"] = 0] = "Msg";
        Type[Type["OKCancel"] = 1] = "OKCancel";
    })(Type = Dialog.Type || (Dialog.Type = {}));
})(Dialog || (Dialog = {}));
//# sourceMappingURL=dialog.js.map
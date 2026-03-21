/**
 * The Menu class.
 */
import { GenericView } from "../utils/generic-view.js";
import { EventManager } from "../events/event-manager.js";
import { appendDivTo } from "../utils/functions.js";
export class ContextMenu extends GenericView {
    actionManager;
    underlay;
    eventManager;
    constructor(div, app, underlay) {
        super(div, app);
        this.underlay = underlay;
        // One of the little quirks of writing in ES6, bind events
        this.eventManager = new EventManager(this);
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    setActionManager(actionManager) {
        this.actionManager = actionManager;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    show(e) {
        this.div.style.top = e.clientY + "px";
        this.div.style.left = e.clientX + "px";
        this.div.style.display = "inline-block";
        this.underlay.style.display = "block";
    }
    hide() {
        this.underlay.style.display = "none";
        this.div.style.display = "none";
    }
    onDismiss(e) {
        this.hide();
    }
    buildFor(id) {
        this.eventManager.unbindAll();
        this.eventManager.bind(this.div, "click", this.hide);
        this.eventManager.bind(this.underlay, "click", this.onDismiss);
        const contextMenu = appendDivTo(this.div, { class: `vrv-menu` });
        const contextMenuContent = appendDivTo(contextMenu, {
            class: `vrv-menu-content`,
        });
        const insertBeforeSubMenu = appendDivTo(contextMenuContent, {
            class: `vrv-submenu`,
        });
        appendDivTo(insertBeforeSubMenu, {
            class: `vrv-submenu-text`,
            "data-before": `Insert before`,
        });
        let subMenu = appendDivTo(insertBeforeSubMenu, {
            class: `vrv-submenu-content`,
        });
        ["note", "rest"].forEach((item) => {
            const entry = appendDivTo(subMenu, {
                class: `vrv-menu-text`,
                "data-before": item,
            });
            entry.dataset.elementName = item;
            entry.dataset.insertMode = "insertBefore";
            this.eventManager.bind(entry, "click", this.insertNote);
        });
        const insertAfterSubMenu = appendDivTo(contextMenuContent, {
            class: `vrv-submenu`,
        });
        appendDivTo(insertAfterSubMenu, {
            class: `vrv-submenu-text`,
            "data-before": `Insert after`,
        });
        subMenu = appendDivTo(insertAfterSubMenu, { class: `vrv-submenu-content` });
        ["note", "rest"].forEach((item) => {
            const entry = appendDivTo(subMenu, {
                class: `vrv-menu-text`,
                "data-before": item,
            });
            entry.dataset.elementName = item;
            entry.dataset.insertMode = "insertAfter";
            this.eventManager.bind(entry, "click", this.insertNote);
        });
        const appendChildMenu = appendDivTo(contextMenuContent, {
            class: `vrv-submenu`,
        });
        appendDivTo(appendChildMenu, {
            class: `vrv-submenu-text`,
            "data-before": `Append child`,
        });
        subMenu = appendDivTo(appendChildMenu, { class: `vrv-submenu-content` });
        ["note", "rest"].forEach((item) => {
            const entry = appendDivTo(subMenu, {
                class: `vrv-menu-text`,
                "data-before": item,
            });
            entry.dataset.elementName = item;
            entry.dataset.insertMode = "appendChild";
            this.eventManager.bind(entry, "click", this.insertNote);
        });
        /*
            const fileImport = appendDivTo(contextMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file` });
            this.eventManager.bind(fileImport, 'click', this.insertNote);
            appendDivTo(contextMenuContent, { class: `vrv-v-separator` });
    
            const helpAbout = appendDivTo(contextMenuContent, { class: `vrv-menu-text`, 'data-before': `About the application` });
    
            const help2 = appendDivTo(contextMenuContent, { class: `vrv-menu-text`, 'data-before': `About this application` });
            */
    }
    insertNote(e) {
        const element = e.target;
        this.actionManager.insert(element.dataset.elementName, element.dataset.insertMode);
    }
}
//# sourceMappingURL=context-menu.js.map
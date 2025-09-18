/**
 * The Menu class.
 */
import { GenericView } from '../utils/generic-view.js';
import { EventManager } from '../events/event-manager.js';
import { appendDivTo } from '../utils/functions.js';
export class ContextMenu extends GenericView {
    constructor(div, app, underlay) {
        super(div, app);
        this.underlay = underlay;
        // One of the little quirks of writing in ES6, bind events
        this.eventManager = new EventManager(this);
        this.eventManager.bind(this.div, 'click', this.hide);
        const fileMenu = appendDivTo(this.div, { class: `vrv-menu prout` });
        const fileMenuContent = appendDivTo(fileMenu, { class: `vrv-menu-content` });
        const fileImport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file` });
        this.app.eventManager.bind(fileImport, 'click', this.app.fileImport);
        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });
        const helpAbout = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `About the application` });
        const help2 = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `About this application` });
        const fileRecentSubMenu = appendDivTo(fileMenuContent, { class: `vrv-submenu` });
        const fileRecent = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-text`, 'data-before': `Recent files` });
        const subSubMenu = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-content` });
        ["test1", "test2"].forEach(item => {
            const entry = appendDivTo(subSubMenu, { class: `vrv-menu-text`, 'data-before': item });
        });
        this.eventManager.bind(this.underlay, 'click', this.onDismiss);
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
        this.div.style.top = e.clientY + 'px';
        this.div.style.left = e.clientX + 'px';
        this.div.style.display = 'inline-block';
        this.underlay.style.display = 'block';
    }
    hide() {
        this.underlay.style.display = 'none';
        this.div.style.display = 'none';
    }
    onDismiss(e) {
        this.hide();
    }
    buildFor(id) {
        //this.actionManager
        this.app.rngLoader;
    }
}
//# sourceMappingURL=context-menu.js.map
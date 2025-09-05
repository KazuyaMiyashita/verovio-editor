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
        const fileMenu = appendDivTo(this.div, { class: `vrv-menu prout` });
        const fileMenuContent = appendDivTo(fileMenu, { class: `vrv-menu-content` });
        const fileImport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file` });
        this.app.eventManager.bind(fileImport, 'click', this.app.fileImport);
        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });
        const helpAbout = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `About this application` });
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
    updateToolbarGrp(grp, condition) {
        if (grp === undefined) {
            return;
        }
        if (condition)
            grp.style.display = 'block';
        else
            grp.style.display = 'none';
    }
    updateToolbarBtnEnabled(btn, condition) {
        if (btn === undefined) {
            return;
        }
        if (condition)
            btn.classList.remove("disabled");
        else
            btn.classList.add("disabled");
    }
    updateToolbarBtnDisplay(btn, condition) {
        if (btn === undefined) {
            return;
        }
        if (condition)
            btn.style.display = 'block';
        else
            btn.style.display = 'none';
    }
    updateToolbarBtnToggled(btn, condition) {
        if (btn === undefined) {
            return;
        }
        if (condition)
            btn.classList.add("toggled");
        else
            btn.classList.remove("toggled");
    }
    updateToolbarSubmenuBtn(btn, condition) {
        if (btn === undefined) {
            return;
        }
        if (condition)
            btn.classList.add("vrv-menu-checked");
        else
            btn.classList.remove("vrv-menu-checked");
    }
}
//# sourceMappingURL=context-menu.js.map
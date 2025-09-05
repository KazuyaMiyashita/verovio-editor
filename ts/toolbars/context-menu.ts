/**
 * The Menu class.
 */

import { App } from '../app.js';
import { GenericView } from '../utils/generic-view.js';
import { EventManager } from '../events/event-manager.js';
import { ActionManager } from '../events/action-manager.js';

import { appendDivTo } from '../utils/functions.js';

export class ContextMenu extends GenericView {
    private actionManager: ActionManager;
    private readonly underlay: HTMLDivElement;

    public readonly eventManager: EventManager;

    constructor(div: HTMLDivElement, app: App, underlay: HTMLDivElement) {
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

    public setActionManager(actionManager: ActionManager): void {
        this.actionManager = actionManager;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public show(e: PointerEvent): void {
        this.div.style.top = e.clientY + 'px';
        this.div.style.left = e.clientX + 'px';
        this.div.style.display = 'inline-block';
        this.underlay.style.display = 'block';
    }

    public hide(): void {
        this.underlay.style.display = 'none';
        this.div.style.display = 'none';
    }

    onDismiss(e: MouseEvent): void {
        this.hide();
    }

    protected updateToolbarGrp(grp: HTMLElement, condition: boolean): void {
        if (grp === undefined) {
            return;
        }
        if (condition) grp.style.display = 'block';
        else grp.style.display = 'none';
    }

    protected updateToolbarBtnEnabled(btn: HTMLElement, condition: boolean): void {
        if (btn === undefined) {
            return;
        }
        if (condition) btn.classList.remove("disabled");
        else btn.classList.add("disabled");
    }

    protected updateToolbarBtnDisplay(btn: HTMLElement, condition: boolean): void {
        if (btn === undefined) {
            return;
        }
        if (condition) btn.style.display = 'block';
        else btn.style.display = 'none';
    }

    protected updateToolbarBtnToggled(btn: HTMLElement, condition: boolean): void {
        if (btn === undefined) {
            return;
        }
        if (condition) btn.classList.add("toggled");
        else btn.classList.remove("toggled");
    }

    protected updateToolbarSubmenuBtn(btn: HTMLElement, condition: boolean): void {
        if (btn === undefined) {
            return;
        }
        if (condition) btn.classList.add("vrv-menu-checked");
        else btn.classList.remove("vrv-menu-checked");
    }
}
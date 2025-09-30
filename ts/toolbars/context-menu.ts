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

    buildFor(id: string): void {

        this.eventManager.unbindAll();
        this.eventManager.bind(this.div, 'click', this.hide);
        this.eventManager.bind(this.underlay, 'click', this.onDismiss);

        const contextMenu = appendDivTo(this.div, { class: `vrv-menu` });
        const contextMenuContent = appendDivTo(contextMenu, { class: `vrv-menu-content` });

        const insertBeforeSubMenu = appendDivTo(contextMenuContent, { class: `vrv-submenu` });
        appendDivTo(insertBeforeSubMenu, { class: `vrv-submenu-text`, 'data-before': `Insert before` });
        let subMenu = appendDivTo(insertBeforeSubMenu, { class: `vrv-submenu-content` });
        ["note", "rest"].forEach(item => {
            const entry = appendDivTo(subMenu, { class: `vrv-menu-text`, 'data-before': item });
            entry.dataset.elementName = item;
            entry.dataset.insertMode = "insertBefore";
            this.eventManager.bind(entry, 'click', this.insertNote);
        });

        const insertAfterSubMenu = appendDivTo(contextMenuContent, { class: `vrv-submenu` });
        appendDivTo(insertAfterSubMenu, { class: `vrv-submenu-text`, 'data-before': `Insert after` });
        subMenu = appendDivTo(insertAfterSubMenu, { class: `vrv-submenu-content` });
        ["note", "rest"].forEach(item => {
            const entry = appendDivTo(subMenu, { class: `vrv-menu-text`, 'data-before': item });
            entry.dataset.elementName = item;
            entry.dataset.insertMode = "insertAfter";
            this.eventManager.bind(entry, 'click', this.insertNote);
        });

        const appendChildMenu = appendDivTo(contextMenuContent, { class: `vrv-submenu` });
        appendDivTo(appendChildMenu, { class: `vrv-submenu-text`, 'data-before': `Append child` });
        subMenu = appendDivTo(appendChildMenu, { class: `vrv-submenu-content` });
        ["note", "rest"].forEach(item => {
            const entry = appendDivTo(subMenu, { class: `vrv-menu-text`, 'data-before': item });
            entry.dataset.elementName = item;
            entry.dataset.insertMode = "appendChild";
            this.eventManager.bind(entry, 'click', this.insertNote);
        });

        /*
        const fileImport = appendDivTo(contextMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file` });
        this.eventManager.bind(fileImport, 'click', this.insertNote);
        appendDivTo(contextMenuContent, { class: `vrv-v-separator` });

        const helpAbout = appendDivTo(contextMenuContent, { class: `vrv-menu-text`, 'data-before': `About the application` });

        const help2 = appendDivTo(contextMenuContent, { class: `vrv-menu-text`, 'data-before': `About this application` });
        */
    }

    insertNote(e: Event): void {
        const element = e.target as HTMLElement;
        this.actionManager.insert(element.dataset.elementName, element.dataset.insertMode);
    }

}
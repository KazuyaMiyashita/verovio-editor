import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js'
import { appendDivTo } from '../utils/functions.js';

export class EditorReferenceList extends GenericView {
    tab: Tab;
    listWrapper: HTMLDivElement;
    eventManager: EventManager;

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);
        this.setDisplayFlex();

        this.tab = tab;

        this.eventManager = new EventManager(this);

        this.listWrapper = appendDivTo(this.div, { class: `vrv-reference-list-wrapper` });
    }

    /*
    addCrumb(element: string, id: string): void {
        const crumb: HTMLDivElement = appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        crumb.innerHTML = element;
        crumb.dataset.id = id
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
    }
    */

    async loadList(references: Object, direction: EditorReferenceList.Direction): Promise<any> {
        this.listWrapper.innerHTML = "";
        this.eventManager.unbindAll();
        if (!Array.isArray(references)) return;
        references.forEach(reference => {
            let item = appendDivTo(this.listWrapper, { class: `vrv-reference-list-item vrv-mei-element` });
            item.style.backgroundImage = `url(${App.iconFor(reference['element'])})`;
            item.innerHTML = `${reference['element']}@${reference['referenceAttribute']}`;
            item.dataset.id = reference['id'];
            item.dataset.element = reference['element'];
            this.eventManager.bind(item, "click", this.onClick);
            this.eventManager.bind(item, "mouseover", this.onMouseover);
            this.eventManager.bind(item, "mouseout", this.onMouseout);
        });
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onLoadData(e: CustomEvent): boolean {
        if (!super.onLoadData(e)) return false;
        console.debug("EditorReferenceList::onLoadData");

        return true;
    }

    override onUpdateData(e: CustomEvent): boolean {
        if (!super.onUpdateData(e)) return false;
        console.debug("EditorReferenceList::onUpdateData");

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    select(element: string, id: string) {
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                elementType: element,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);

    }

    cursorActivity(id: string, activity: string) {
        let event = new CustomEvent('onCursorActivity', {
            detail: {
                id: id,
                activity: activity,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }

    onClick(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.select(element.dataset.element, element.dataset.id);
        }
    }

    onMouseover(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseover');
        }
    }

    onMouseout(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseout');
        }
    }
}

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace EditorReferenceList {

    export enum Direction {
        From,
        To
    }
}    
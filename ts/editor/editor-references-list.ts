import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js'
import { appendDivTo } from '../utils/functions.js';

export class EditorReferenceList extends GenericView {
    public readonly eventManager: EventManager;

    private tab: Tab;
    private listWrapper: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);
        this.setDisplayFlex();

        this.tab = tab;

        this.eventManager = new EventManager(this);

        this.listWrapper = appendDivTo(this.div, { class: `vrv-reference-list-wrapper` });
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public loadList(references: Object, direction: EditorReferenceList.Direction): void {
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

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    private select(element: string, id: string) {
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                element: element,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);

    }

    private cursorActivity(id: string, activity: string) {
        let event = new CustomEvent('onCursorActivity', {
            detail: {
                id: id,
                activity: activity,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }

    //////////////////////////////////////////////////////////////////////////
    // Event methods
    //////////////////////////////////////////////////////////////////////////

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
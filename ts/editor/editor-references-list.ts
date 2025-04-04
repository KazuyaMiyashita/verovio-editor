import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js'
import { appendDivTo } from '../utils/functions.js';

export enum ReferenceDirection {
    From,
    To
}

export class EditorReferenceList extends GenericView {
    tab: Tab;
    listWrapper: HTMLDivElement;
    eventManager: EventManager;

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);

        this.tab = tab;

        this.eventManager = new EventManager(this);

        this.listWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs-wrapper` });
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

    async loadList(references: Object, direction: ReferenceDirection): Promise<any> {
        console.log(references);
        /*
        if (Array.isArray(ancestors)) {
            this.breadCrumbs.innerHTML = "";
            for (let i = ancestors.length - 1; i >= 0; i--) {
                this.addCrumb(ancestors[i]['element'], ancestors[i]['id']);
            };
        };
        this.listWrapper.scrollLeft = this.listWrapper.scrollWidth;
        */
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

    /*
    override onClick(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.select(element.dataset.element, element.dataset.id);
        }
    }

    override onMouseover(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseover');

        }
    }

    override onMouseout(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseout');

        }
    }
    */
}

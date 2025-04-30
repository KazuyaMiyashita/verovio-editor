import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericTree } from '../utils/generic-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo, appendOptionTo, appendSelectTo, appendTableTo, appendTrTo, appendTdTo, appendInputTo } from '../utils/functions.js';

export class EditorAttributeList extends GenericView {
    public readonly eventManager: EventManager;

    private listWrapper: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);
        this.setDisplayFlex();

        this.eventManager = new EventManager(this);

        this.listWrapper = appendDivTo(this.div, { class: `vrv-attribute-list-wrapper` });
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public loadAttributesOrText(object: GenericTree.Object): void {
        this.listWrapper.innerHTML = "";
        this.eventManager.unbindAll();

        if (object.text) {
            this.loadText(object.text);
        }
        else {
            this.loadAttributes(object.attributes);
        }
    }

    private loadText(text: string) {
        let textInput = appendInputTo(this.listWrapper, {});
        textInput.value = text;
    }

    private loadAttributes(attributes: Record<string, string>): void {
        let filter = appendDivTo(this.listWrapper, { class: `vrv-attribute-filter` });

        let table = appendTableTo(this.listWrapper, { class: `vrv-attribute-table` });

        Object.entries(attributes).forEach(([name, value]) => {
            let tr = appendTrTo(table, { class: `vrv-attribute-item` });
            let attName = appendTdTo(tr, { class: `vrv-attribute-name` });
            attName.innerHTML = name;
            let attValue = appendTdTo(tr, { class: `vrv-attribute-value` });
            let values = new Array()
            values.push(value.toString());

            let input = appendSelectTo(attValue, { class: `vrv-input` });
            for (const v in values) {
                let optionVal = appendOptionTo(input, { value: `${values[v]}` });
                optionVal.innerText = values[v];
            }
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
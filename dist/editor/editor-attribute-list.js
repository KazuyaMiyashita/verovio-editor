import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo, appendOptionTo, appendSelectTo, appendTableTo, appendTrTo, appendTdTo, appendInputTo } from '../utils/functions.js';
export class EditorAttributeList extends GenericView {
    constructor(div, app) {
        super(div, app);
        this.setDisplayFlex();
        this.eventManager = new EventManager(this);
        this.listWrapper = appendDivTo(this.div, { class: `vrv-attribute-list-wrapper` });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    loadAttributesOrText(object) {
        this.listWrapper.innerHTML = "";
        this.eventManager.unbindAll();
        if (object.text) {
            this.loadText(object.text);
        }
        else {
            this.loadAttributes(object.attributes);
        }
    }
    loadText(text) {
        let textInput = appendInputTo(this.listWrapper, { class: `vrv-form-input` });
        textInput.value = text;
    }
    loadAttributes(attributes) {
        let filter = appendDivTo(this.listWrapper, { class: `vrv-attribute-filter` });
        let table = appendTableTo(this.listWrapper, { class: `vrv-attribute-table` });
        Object.entries(attributes).forEach(([name, value]) => {
            let tr = appendTrTo(table, { class: `vrv-attribute-item` });
            let attName = appendTdTo(tr, { class: `vrv-attribute-name` });
            attName.innerHTML = name;
            let attValue = appendTdTo(tr, { class: `vrv-attribute-value` });
            let values = new Array();
            values.push(value.toString());
            let input = appendSelectTo(attValue, { class: `vrv-form-input` });
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
    select(element, id) {
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                element: element,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }
    cursorActivity(id, activity) {
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
    onClick(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.select(element.dataset.element, element.dataset.id);
        }
    }
    onMouseover(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseover');
        }
    }
    onMouseout(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseout');
        }
    }
}
//# sourceMappingURL=editor-attribute-list.js.map
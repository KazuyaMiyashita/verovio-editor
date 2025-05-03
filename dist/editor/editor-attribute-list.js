import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo, appendOptionTo, appendSelectTo, appendTableTo, appendTrTo, appendTdTo, appendInputTo, appendOptGroupTo, appendTBodyTo, appendSpanTo } from '../utils/functions.js';
export class EditorAttributeList extends GenericView {
    constructor(div, app) {
        super(div, app);
        this.patternMap = [
            [/^.*@pname$/, this.customAllPname]
        ];
        this.setDisplayFlex();
        this.eventManager = new EventManager(this);
        this.listWrapper = appendDivTo(this.div, { class: `vrv-attribute-list-wrapper` });
        this.element = "";
        this.attributes = {};
        this.attributesBasic = {};
        this.types = {};
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    loadAttributesOrText(object) {
        this.listWrapper.innerHTML = "";
        this.eventManager.unbindAll();
        this.element = "";
        this.attributes = {};
        this.attributesBasic = {};
        this.types = {};
        if (object.text) {
            this.loadText(object.text);
        }
        else {
            this.element = object.element;
            let tags = this.app.rngLoader.getTags()[object.element];
            console.log(tags);
            if (tags) {
                this.attributes = tags.attrs;
                this.types = tags.types;
            }
            let tagsBasic = this.app.rngLoaderBasic.getTags()[object.element];
            if (tagsBasic) {
                this.attributesBasic = tagsBasic.attrs;
            }
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
        let tBodyUsed = appendTBodyTo(table, {});
        if (Object.entries(attributes).length > 0) {
            Object.entries(attributes).forEach(([name, value]) => {
                this.loadAttribute(tBodyUsed, name, value);
            });
            this.addShowMore(tBodyUsed, "Show more ...");
        }
        else {
            this.addShowMore(tBodyUsed, "None set - show unset ...");
        }
        let usedAttributes = Object.keys(attributes);
        let unusedAttributes = Object.keys(this.attributesBasic).filter(value => !usedAttributes.includes(value));
        if (unusedAttributes.length > 0) {
            let tBodyBasic = appendTBodyTo(table, {});
            tBodyBasic.style.display = 'none';
            unusedAttributes.forEach(name => {
                this.loadAttribute(tBodyBasic, name, "");
            });
            this.addShowMore(tBodyBasic, "Show all ...");
        }
        usedAttributes = usedAttributes.concat(unusedAttributes);
        unusedAttributes = Object.keys(this.attributes).filter(value => !usedAttributes.includes(value));
        if (unusedAttributes.length > 0) {
            let tBodyAll = appendTBodyTo(table, {});
            tBodyAll.style.display = 'none';
            unusedAttributes.forEach(name => {
                this.loadAttribute(tBodyAll, name, "");
            });
            this.addShowMore(tBodyAll, "");
        }
    }
    loadAttribute(tbody, name, value) {
        let attRow = appendTrTo(tbody, { class: `vrv-attribute-item` });
        let nameCell = appendTdTo(attRow, { class: `vrv-attribute-name` });
        nameCell.innerHTML = name;
        let valueCell = appendTdTo(attRow, { class: `vrv-attribute-value` });
        let custom = this.findCustomOptionMethod(`${this.element}@${name}`);
        if (custom) {
            custom.call(this, valueCell, value);
        }
        else if (this.attributes[name]) {
            this.attributeOption(valueCell, name, value);
        }
        else if (this.types[name]) {
            this.attributeNumber(valueCell, name, value);
        }
        else {
            let text = appendInputTo(valueCell, { class: `vrv-form-input` });
            text.value = value;
        }
    }
    attributeNumber(cell, name, value) {
        console.log(this.types[name], name, value);
        if (this.types[name] === "positiveInteger") {
            let input = appendInputTo(cell, { class: `vrv-form-input`, type: `number`, step: `1`, min: "1" });
            input.value = value;
        }
        else if (this.types[name] === "nonNegativeInteger") {
            let input = appendInputTo(cell, { class: `vrv-form-input`, type: `number`, step: `1`, min: "0" });
            input.value = value;
        }
        else if (this.types[name] === "decimal") {
            let input = appendInputTo(cell, { class: `vrv-form-input`, type: `number`, step: `0.01` });
            input.value = value;
        }
        else {
            let text = appendInputTo(cell, { class: `vrv-form-input` });
            text.value = value;
        }
    }
    attributeOption(cell, name, value) {
        let values = this.attributes[name];
        let valuesBasic = this.attributesBasic[name];
        if (!valuesBasic)
            valuesBasic = values;
        let hasGroup = false;
        if (valuesBasic.length !== values.length) {
            values = values.filter(value => !valuesBasic.includes(value));
            hasGroup = true;
        }
        let input = appendSelectTo(cell, { class: `vrv-form-input` });
        if (hasGroup) {
            this.addOptions(input, [], value);
            let basicGroup = appendOptGroupTo(input, { label: "MEI-basic" });
            this.addOptions(basicGroup, valuesBasic, value, false);
            let allGroup = appendOptGroupTo(input, { label: "MEI-all" });
            this.addOptions(allGroup, values, value, false);
        }
        else {
            this.addOptions(input, values, value);
        }
    }
    addOptions(parent, values, selected, addEmpty = true) {
        if (addEmpty) {
            let empty = appendOptionTo(parent, { value: `` });
            empty.innerText = '';
        }
        values.forEach(value => {
            let optionVal = appendOptionTo(parent, { value: `${value}` });
            optionVal.innerText = value;
            if (selected === value)
                optionVal.selected = true;
        });
    }
    findCustomOptionMethod(input) {
        for (const [pattern, method] of this.patternMap) {
            if (pattern.test(input)) {
                return method;
            }
        }
        console.log(input);
        return undefined;
    }
    customAllPname(cell, value) {
        let input = appendSelectTo(cell, { class: `vrv-form-input` });
        this.addOptions(input, ["c", "d", "e", "f", "g", "a", "b"], value);
    }
    addShowMore(tbody, label) {
        let row = appendTrTo(tbody, {});
        let cell = appendTdTo(row, { colspan: "2", class: `vrv-show-more` });
        let span = appendSpanTo(cell, {}, label);
        this.eventManager.bind(span, 'click', this.onShowMore);
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
    onShowMore(e) {
        const element = e.target;
        const thisTbody = element.closest('tbody');
        const nextTbody = thisTbody.nextElementSibling;
        if (nextTbody) {
            nextTbody.style.display = 'table-row-group';
            element.style.display = 'none';
        }
    }
}
//# sourceMappingURL=editor-attribute-list.js.map
import { ActionManager } from '../events/action-manager.js';
import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericTree } from '../utils/generic-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js';
import { appendDivTo, appendOptionTo, appendSelectTo, appendTableTo, appendTrTo, appendTdTo, appendInputTo, appendOptGroupTo, appendTBodyTo, appendSpanTo } from '../utils/functions.js';

export class EditorAttributeList extends GenericView {
    public readonly eventManager: EventManager;

    private listWrapper: HTMLDivElement;
    private listWrapperChild: HTMLElement;

    private element: string;
    private elementId: string;
    private attributes: Object;
    private attributesBasic: Object;
    private types: Object;

    private readonly tab: Tab;
    private readonly actionManager: ActionManager;

    private readonly patternMap: Array<[RegExp, (cell: HTMLTableCellElement, value: string) => HTMLSelectElement | HTMLInputElement]> = [
        [/^.*@pname$/, this.customAllPname]
    ];

    constructor(div: HTMLDivElement, app: App, tab: Tab, actionManager: ActionManager) {
        super(div, app);
        this.setDisplayFlex();

        this.tab = tab;
        this.actionManager = actionManager;

        this.eventManager = new EventManager(this);

        this.listWrapper = appendDivTo(this.div, { class: `vrv-attribute-list-wrapper` });
        this.listWrapperChild = undefined;

        this.element = "";
        this.elementId = "";
        this.attributes = {};
        this.attributesBasic = {};
        this.types = {};
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public loadAttributesOrText(object: GenericTree.Object): void {
        this.listWrapper.innerHTML = "";
        this.eventManager.unbindAll();
        if (this.listWrapperChild) this.listWrapperChild.remove();

        this.element = "";
        this.attributes = {};
        this.attributesBasic = {};
        this.types = {};

        if (object.text) {
            this.elementId = object.id;
            this.loadText(object.text);
        }
        else {
            this.element = object.element;
            this.elementId = object.id;
            let tags = this.app.rngLoader.getTags()[object.element];
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

    private loadText(text: string) {
        let textInput = appendInputTo(this.listWrapper, { class: `vrv-form-input` });
        textInput.value = text;
        textInput.dataset.attName = "text";
        this.eventManager.bind(textInput, 'input', this.onInputInput);
        this.listWrapperChild = textInput;
    }

    private loadAttributes(attributes: Record<string, string>): void {
        let filter = appendDivTo(this.listWrapper, { class: `vrv-attribute-filter` });

        let table = appendTableTo(this.listWrapper, { class: `vrv-attribute-table` });
        this.listWrapperChild = table;

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
            })
            this.addShowMore(tBodyBasic, "Show all ...");

        }

        usedAttributes = usedAttributes.concat(unusedAttributes);
        unusedAttributes = Object.keys(this.attributes).filter(value => !usedAttributes.includes(value));
        if (unusedAttributes.length > 0) {
            let tBodyAll = appendTBodyTo(table, {});
            tBodyAll.style.display = 'none';
            unusedAttributes.forEach(name => {
                this.loadAttribute(tBodyAll, name, "");
            })
            this.addShowMore(tBodyAll, "");
        }
    }

    private loadAttribute(tbody: HTMLElement, name: string, value: string): void {
        let attRow = appendTrTo(tbody, { class: `vrv-attribute-item` });
        let nameCell = appendTdTo(attRow, { class: `vrv-attribute-name` });
        nameCell.innerHTML = name;
        let valueCell = appendTdTo(attRow, { class: `vrv-attribute-value` });

        let custom = this.findCustomOptionMethod(`${this.element}@${name}`);
        let selectOrInput;
        if (custom) {
            selectOrInput = custom.call(this, valueCell, value);
        }
        else if (this.attributes[name]) {
            selectOrInput = this.attributeOption(valueCell, name, value);
        }
        else if (this.types[name]) {
            selectOrInput = this.attributeNumber(valueCell, name, value);
        }
        else {
            selectOrInput = appendInputTo(valueCell, { class: `vrv-form-input` });
            selectOrInput.value = value;
        }
        if (selectOrInput instanceof HTMLSelectElement) {
            let select = selectOrInput as HTMLSelectElement;
            select.dataset.attName = name;
            this.eventManager.bind(select, 'change', this.onSelectChange);

        }
        else if (selectOrInput instanceof HTMLInputElement) {
            let input = selectOrInput as HTMLInputElement;
            input.dataset.attName = name;
            this.eventManager.bind(input, 'input', this.onInputInput);
        }
    }

    private attributeNumber(cell: HTMLTableCellElement, name: string, value: string): HTMLInputElement {
        let input: HTMLInputElement;
        if (this.types[name] === "positiveInteger") {
            input = appendInputTo(cell, { class: `vrv-form-input`, type: `number`, step: `1`, min: "1" });
            input.value = <string>value;
        }
        else if (this.types[name] === "nonNegativeInteger") {
            input = appendInputTo(cell, { class: `vrv-form-input`, type: `number`, step: `1`, min: "0" });
            input.value = <string>value;
        }
        else if (this.types[name] === "decimal") {
            input = appendInputTo(cell, { class: `vrv-form-input`, type: `number`, step: `0.1` });
            input.value = <string>value;
        }
        else {
            input = appendInputTo(cell, { class: `vrv-form-input` });
            input.value = value;
        }
        return input;
    }

    private attributeOption(cell: HTMLTableCellElement, name: string, value: string): HTMLSelectElement {
        let values = this.attributes[name];
        let valuesBasic = this.attributesBasic[name];
        if (!valuesBasic) valuesBasic = values;
        let hasGroup = false;
        if (valuesBasic.length !== values.length) {
            values = values.filter(value => !valuesBasic.includes(value));
            hasGroup = true;
        }
        let select = appendSelectTo(cell, { class: `vrv-form-input` });

        if (hasGroup) {
            this.addOptions(select, [], value);
            let basicGroup = appendOptGroupTo(select, { label: "MEI-basic" });
            this.addOptions(basicGroup, valuesBasic, value, false);
            let allGroup = appendOptGroupTo(select, { label: "MEI-all" });
            this.addOptions(allGroup, values, value, false);
        }
        else {
            this.addOptions(select, values, value);
        }
        return select;
    }

    private addOptions(parent: HTMLElement, values: string[], selected: string, addEmpty: boolean = true): void {
        if (addEmpty) {
            let empty = appendOptionTo(parent, { value: `` });
            empty.innerText = '';
        }
        values.forEach(value => {
            let optionVal = appendOptionTo(parent, { value: `${value}` });
            optionVal.innerText = value;
            if (selected === value) optionVal.selected = true;
        });
    }

    private findCustomOptionMethod(input: string): Function {
        for (const [pattern, method] of this.patternMap) {
            if (pattern.test(input)) {
                return method;
            }
        }
        return undefined;
    }

    private customAllPname(cell: HTMLTableCellElement, value: string): HTMLSelectElement {
        let select = appendSelectTo(cell, { class: `vrv-form-input` });
        this.addOptions(select, ["c", "d", "e", "f", "g", "a", "b"], value);
        return select;
    }

    private addShowMore(tbody: HTMLElement, label: string) {
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

    private editAttributeValue(name: string, value: string) {
        console.log(this.elementId, name, value);
        this.actionManager.setAttrValue(name, value, this.elementId);
        this.actionManager.commit(this.tab);
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

    onInputInput(e: InputEvent) {
        const element: HTMLInputElement = e.target as HTMLInputElement;
        if (element.dataset.attName) {
            this.editAttributeValue(element.dataset.attName, element.value);
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

    onSelectChange(e: Event) {
        const element: HTMLSelectElement = e.target as HTMLSelectElement;
        if (element.dataset.attName) {
            this.editAttributeValue(element.dataset.attName, element.value);
        }
    }

    onShowMore(e: MouseEvent) {
        const element: HTMLElement = e.target as HTMLElement;
        const thisTbody = element.closest('tbody');
        const nextTbody = thisTbody.nextElementSibling as HTMLElement;

        if (nextTbody) {
            nextTbody.style.display = 'table-row-group';
            element.style.display = 'none';
        }
    }
}
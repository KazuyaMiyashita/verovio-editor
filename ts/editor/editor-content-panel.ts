/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from '../app.js';
import { EditorContentTree } from './editor-content-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js';
import { appendDivTo, appendSpanTo } from '../utils/functions.js';

export class EditorContentPanel extends GenericView {
    contentTree: HTMLDivElement;
    contentTreeObj: EditorContentTree;
    tab: Tab

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);

        this.setDisplayFlex();

        this.tab = tab;

        let treeFieldSet = this.addFieldSet("Element context");
        this.contentTree = appendDivTo(treeFieldSet, { class: `vrv-field-set-panel`});
        this.contentTreeObj = new EditorContentTree(this.contentTree, this.app, this.tab);
        this.contentTreeObj.hideRoot = true;
        this.customEventManager.addToPropagationList(this.contentTreeObj.customEventManager);

        let attributeFieldSet = this.addFieldSet("Attributes");

        let referencedFieldSet = this.addFieldSet("Referencing elements");

        let referencingFieldSet = this.addFieldSet("Referenced elements");
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    async updateContent(id: string): Promise<any> {
        const contextOk = await this.app.verovio.edit({ action: 'context', param: { elementId: `${id}` } });
        if (contextOk) {
            const jsonContext = await this.app.verovio.editInfo();
            this.contentTreeObj.loadContext(jsonContext['context'], jsonContext['ancestors'], jsonContext['object']);
        }
    }

    addFieldSet(label: string): HTMLDivElement {
        let legend = appendDivTo(this.div, { class: `vrv-legend` });
        legend.innerHTML = label;
        let span = appendSpanTo(legend, { class: `icon` }, '▼');
        let fieldSet = appendDivTo(this.div, { class: `vrv-field-set` });
        span.addEventListener("click", () => {
            legend.classList.toggle("toggled");
            fieldSet.classList.toggle("toggled");
        });
        return fieldSet;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        //console.debug("EditorContentPanel::onActivate");
        return true;
    }

    override onUpdateData(e: CustomEvent): boolean {
        if (!super.onUpdateData(e)) return false;
        //console.debug("EditorContentTree::onUpdateData");
        return true;
    }

    override onSelect(e: CustomEvent): boolean {
        if (!super.onSelect(e)) return false;
        this.updateContent(e.detail.id);
        return true;
    }

    //////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
}

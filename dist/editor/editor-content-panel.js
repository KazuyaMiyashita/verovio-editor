/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */
import { EditorContentTree } from './editor-content-tree.js';
import { EditorReferenceList } from './editor-references-list.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo, appendSpanTo } from '../utils/functions.js';
export class EditorContentPanel extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.setDisplayFlex();
        this.tab = tab;
        let treeFieldSet = this.addFieldSet("Element context", 3);
        this.contentTree = appendDivTo(treeFieldSet, { class: `vrv-field-set-panel` });
        this.contentTreeObj = new EditorContentTree(this.contentTree, this.app, this.tab);
        this.contentTreeObj.setHiddenRoot(true);
        this.customEventManager.addToPropagationList(this.contentTreeObj.customEventManager);
        let attributeFieldSet = this.addFieldSet("Attributes", 2);
        let referencesFromFieldSet = this.addFieldSet("Referencing elements");
        this.referencesFrom = appendDivTo(referencesFromFieldSet, { class: `vrv-field-set-panel` });
        this.referencesFromObj = new EditorReferenceList(this.referencesFrom, this.app, this.tab);
        this.customEventManager.addToPropagationList(this.referencesFromObj.customEventManager);
        let referencesToFieldSet = this.addFieldSet("Referenced elements");
        this.referencesTo = appendDivTo(referencesToFieldSet, { class: `vrv-field-set-panel` });
        this.referencesToObj = new EditorReferenceList(this.referencesTo, this.app, this.tab);
        this.customEventManager.addToPropagationList(this.contentTreeObj.customEventManager);
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    addFieldSet(label, flexGrow = 1) {
        let legend = appendDivTo(this.div, { class: `vrv-legend` });
        legend.innerHTML = label;
        let span = appendSpanTo(legend, { class: `icon` }, '▼');
        let fieldSet = appendDivTo(this.div, { class: `vrv-field-set` });
        if (flexGrow !== 1)
            fieldSet.style.flexGrow = `${flexGrow}`;
        span.addEventListener("click", () => {
            legend.classList.toggle("toggled");
            fieldSet.classList.toggle("toggled");
        });
        return fieldSet;
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async updateContent(id) {
        const contextOk = await this.app.verovio.edit({ action: 'context', param: { elementId: `${id}` } });
        if (contextOk) {
            const jsonContext = await this.app.verovio.editInfo();
            this.contentTreeObj.loadContext(jsonContext['context'], jsonContext['ancestors'], jsonContext['object']);
            this.referencesFromObj.loadList(jsonContext['referringElements'], EditorReferenceList.Direction.From);
            this.referencesToObj.loadList(jsonContext['referencedElements'], EditorReferenceList.Direction.To);
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        this.updateContent(e.detail.id);
        return true;
    }
}
//# sourceMappingURL=editor-content-panel.js.map
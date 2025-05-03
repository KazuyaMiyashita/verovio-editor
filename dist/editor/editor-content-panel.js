/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */
import { EditorAttributeList } from './editor-attribute-list.js';
import { EditorContentTree } from './editor-content-tree.js';
import { EditorReferenceList } from './editor-references-list.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo } from '../utils/functions.js';
export class EditorContentPanel extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.setDisplayFlex();
        this.tab = tab;
        let treeFieldSet = this.addFieldSet("Content tree", 3);
        this.contentTree = appendDivTo(treeFieldSet, { class: `vrv-field-set-panel` });
        this.contentTreeObj = new EditorContentTree(this.contentTree, this.app, this.tab);
        this.contentTreeObj.setHiddenRoot(true);
        this.customEventManager.addToPropagationList(this.contentTreeObj.customEventManager);
        let attributeFieldSet = this.addFieldSet("Attributes or text", 3);
        this.attributeList = appendDivTo(attributeFieldSet, { class: `vrv-field-set-panel` });
        this.attributeListObj = new EditorAttributeList(this.attributeList, this.app);
        this.customEventManager.addToPropagationList(this.attributeListObj.customEventManager);
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
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async updateContent(id) {
        const contextOk = await this.app.verovio.edit({ action: 'context', param: { elementId: `${id}` } });
        if (contextOk) {
            const jsonContent = await this.app.verovio.editInfo();
            console.log(jsonContent);
            this.contentTreeObj.loadContext(jsonContent);
            this.attributeListObj.loadAttributesOrText(jsonContent.object);
            this.referencesFromObj.loadList(jsonContent.referringElements, EditorReferenceList.Direction.From);
            this.referencesToObj.loadList(jsonContent.referencedElements, EditorReferenceList.Direction.To);
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
    onEditData(e) {
        if (!super.onEditData(e))
            return false;
        this.updateContent(e.detail.id);
        return true;
    }
}
//# sourceMappingURL=editor-content-panel.js.map
/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from '../app.js';
import { EditorAttributeList } from './editor-attribute-list.js';
import { EditorContentTree } from './editor-content-tree.js';
import { EditorReferenceList } from './editor-references-list.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js';
import { appendDivTo, appendSpanTo } from '../utils/functions.js';

export class EditorContentPanel extends GenericView {
    private readonly contentTree: HTMLDivElement;
    private readonly contentTreeObj: EditorContentTree;
    private readonly attributeList: HTMLDivElement;
    private readonly attributeListObj; EditorAttributeList;
    private readonly referencesFrom: HTMLDivElement;
    private readonly referencesFromObj: EditorReferenceList;
    private readonly referencesTo: HTMLDivElement;
    private readonly referencesToObj: EditorReferenceList;
    private readonly tab: Tab

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
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

    private async updateContent(id: string): Promise<any> {
        const contextOk = await this.app.verovio.edit({ action: 'context', param: { elementId: `${id}` } });
        if (contextOk) {
            const jsonContent = await this.app.verovio.editInfo() as EditorContentTree.Content;
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

    override onSelect(e: CustomEvent): boolean {
        if (!super.onSelect(e)) return false;
        this.updateContent(e.detail.id);
        return true;
    }

    override onEditData(e: CustomEvent): boolean {
        if (!super.onEditData(e)) return false;
        this.updateContent(e.detail.id);
        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
}

/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */
import { EditorContentTree } from './editor-content-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo } from '../utils/functions.js';
export class EditorSectionPanel extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.setDisplayFlex();
        this.tab = tab;
        let treeFieldSet = this.addFieldSet("Element context", 3);
        this.contentTree = appendDivTo(treeFieldSet, { class: `vrv-field-set-panel` });
        this.contentTreeObj = new EditorContentTree(this.contentTree, this.app, this.tab);
        this.contentTreeObj.setHiddenRoot(true);
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
            const jsonContext = await this.app.verovio.editInfo();
            console.log(jsonContext);
            this.contentTreeObj.loadContext(jsonContext['context'], jsonContext['ancestors'], jsonContext['object']);
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
//# sourceMappingURL=editor-section-panel.js.map
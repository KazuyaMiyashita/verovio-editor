/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */
import { EditorScoreTree } from './editor-score-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo } from '../utils/functions.js';
export class EditorScorePanel extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.setDisplayFlex();
        this.tab = tab;
        let treeFieldSet = this.addFieldSet("Score structure", 3);
        this.sectionTree = appendDivTo(treeFieldSet, { class: `vrv-field-set-panel` });
        this.sectionTreeObj = new EditorScoreTree(this.sectionTree, this.app, this.tab);
        this.sectionTreeObj.setBreadCrumbs();
        this.customEventManager.addToPropagationList(this.sectionTreeObj.customEventManager);
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async updateContent(id) {
        const contextOk = await this.app.verovio.edit({ action: 'context', param: { document: 'scores' } });
        if (contextOk) {
            const jsonContext = await this.app.verovio.editInfo();
            console.log(jsonContext);
            this.sectionTreeObj.loadContext(jsonContext);
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
//# sourceMappingURL=editor-score-panel.js.map
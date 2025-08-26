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
    async updateContent() {
        this.sectionTreeObj.resetFocus();
        const contextOk = await this.app.verovio.edit({ action: 'context', param: { document: 'scores' } });
        if (contextOk) {
            const jsonContext = await this.app.verovio.editInfo();
            this.sectionTreeObj.loadContext(jsonContext);
        }
        this.tab.loaded = true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        // Make sure the data is loaded into Verovio 
        if (this.app.getPageCount() > 0 && !this.tab.loaded)
            this.updateContent();
        return true;
    }
    onEndLoading(e) {
        if (!super.onEndLoading(e))
            return false;
        // Make sure the data is loaded into Verovio 
        if (this.app.getPageCount() > 0 && !this.tab.loaded)
            this.updateContent();
        return true;
    }
}
//# sourceMappingURL=editor-score-panel.js.map
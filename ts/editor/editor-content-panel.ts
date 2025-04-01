/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from '../app.js';
import { EditorContentTree } from './editor-content-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js';
import { appendDivTo } from '../utils/functions.js';

export class EditorContentPanel extends GenericView {
    treeView: EditorContentTree;
    tab: Tab

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);

        this.tab = tab;
        this.treeView = new EditorContentTree(this.div, this.app, this.tab);
        this.treeView.hideRoot = true;
        this.customEventManager.addToPropagationList(this.treeView.customEventManager);
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    async updateContent(id: string): Promise<any> {
        const contextOk = await this.app.verovio.edit({ action: 'context', param: { elementId: `${id}` } });
        if (contextOk) {
            const jsonContext = await this.app.verovio.editInfo();
            this.treeView.loadContext(jsonContext['context'], jsonContext['ancestors']);
        }
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

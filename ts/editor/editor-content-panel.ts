/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from '../app.js';
import { EditorContentTree } from './editor-content-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js';
import { appendDivTo } from '../utils/functions.js';

function fakeApiCall() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("Data received");
        }, 2000); // Simulate a delay of 2 seconds
    });
}

export class EditorContentPanel extends GenericView {
    treeView: EditorContentTree;
    tab: Tab

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);

        this.tab = tab;
        this.treeView = new EditorContentTree(this.div, this.app, this.tab);
        this.customEventManager.addToPropagationList(this.treeView.customEventManager);
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    async updateContent(): Promise<any> {
        console.log("prout1");
        const data = await fakeApiCall();
        console.log("prout2");
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        console.debug("EditorContentPanel::onActivate");

        this.updateContent();
    }

    override onUpdateData(e: CustomEvent): boolean {
        if (!super.onUpdateData(e)) return false;
        console.debug("EditorContentTree::onUpdateData");

        return true;
    }

    //////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
}

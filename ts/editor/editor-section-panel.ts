/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from '../app.js';
import { EditorContentTree } from './editor-content-tree.js';
import { GenericView } from '../utils/generic-view.js';
import { Tab } from '../utils/tab-group.js';
import { appendDivTo } from '../utils/functions.js';

export class EditorSectionPanel extends GenericView {
    private readonly contentTree: HTMLDivElement;
    private readonly contentTreeObj: EditorContentTree;
    private readonly tab: Tab

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
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

    private async updateContent(id: string): Promise<any> {
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

    override onSelect(e: CustomEvent): boolean {
        if (!super.onSelect(e)) return false;
        this.updateContent(e.detail.id);
        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
}

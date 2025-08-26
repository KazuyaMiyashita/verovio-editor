import { App } from '../app.js';
import { GenericTree, TreeNode } from '../utils/generic-tree.js';
import { Tab } from '../utils/tab-group.js'

export class EditorScoreTree extends GenericTree {
    private readonly tab: Tab;

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);

        this.tab = tab;
        this.displayDepth = 4;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public loadContext(context: GenericTree.Object): void {
        this.reset();
        this.fromJson(context);
    }

    //////////////////////////////////////////////////////////////////////////
    // Event methods
    //////////////////////////////////////////////////////////////////////////

    override onClick(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            if (element.classList.contains("open")) {
                this.collapseNode(element.dataset.id);
            }
            else {
                this.applyFocus(element.dataset.id);
            }
        }
        e.stopPropagation();
    }
}

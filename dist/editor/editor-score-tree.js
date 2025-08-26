import { GenericTree } from '../utils/generic-tree.js';
export class EditorScoreTree extends GenericTree {
    constructor(div, app, tab) {
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
    loadContext(context) {
        this.reset();
        this.fromJson(context);
    }
    //////////////////////////////////////////////////////////////////////////
    // Event methods
    //////////////////////////////////////////////////////////////////////////
    onClick(e) {
        const element = e.target;
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
//# sourceMappingURL=editor-score-tree.js.map
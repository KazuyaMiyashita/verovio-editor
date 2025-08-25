import { App } from '../app.js';
import { GenericTree } from '../utils/generic-tree.js';
import { appendDivTo } from '../utils/functions.js';
export class EditorScoreTree extends GenericTree {
    constructor(div, app, tab) {
        super(div, app);
        this.tab = tab;
        this.breadCrumbsWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs-wrapper` });
        this.breadCrumbs = appendDivTo(this.breadCrumbsWrapper, { class: `vrv-tree-breadcrumbs` });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    loadContext(context) {
        this.reset();
        //const scoreSubtree = this.findSubtree(context, node => node['element'] === "score");
        this.fromJson(context);
        this.breadCrumbs.textContent = "";
        // root crumb
        appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        this.traverse((node) => {
            node.getLabel().style.backgroundImage = `url(${App.iconFor(node.element)})`;
            return false;
        });
    }
    select(element, id) {
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                element: element,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }
    cursorActivity(id, activity) {
        let event = new CustomEvent('onCursorActivity', {
            detail: {
                id: id,
                activity: activity,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }
    addCrumb(element, id) {
        const crumb = appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        crumb.textContent = element;
        crumb.dataset.id = id;
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
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
                this.expandNode(element.dataset.id);
            }
        }
        e.stopPropagation();
    }
    onMouseover(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseover');
        }
    }
    onMouseout(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseout');
        }
    }
}
//# sourceMappingURL=editor-score-tree.js.map
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
        this.breadCrumbs.innerHTML = "";
        // root crumb
        appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        this.traverse((node) => {
            node.getLabel().style.backgroundImage = `url(${App.iconFor(node.element)})`;
            //if (node.id === target['id']) {
            //    this.selectNode(node);
            //}
            return false;
        });
        /*
        if (Array.isArray(ancestors)) {
            for (let i = ancestors.length - 1; i >= 0; i--) {
                this.addCrumb(ancestors[i]['element'], ancestors[i]['id']);
            };
        };
        this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
        */
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
        crumb.innerHTML = element;
        crumb.dataset.id = id;
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
    }
    selectNode(node) {
        node.getLabel().classList.add("target");
        node.getLabel().classList.add("checked");
        const parentRect = this.root.getDiv().getBoundingClientRect();
        const childRect = node.getDiv().getBoundingClientRect();
        // Calculate offset of the node relative to root
        const offsetTop = childRect.top - parentRect.top + this.root.getDiv().scrollTop;
        // arbitrary margin
        this.root.getDiv().scrollTo({ top: offsetTop - 50 });
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
            else if (element.dataset.id) {
                this.select(element.dataset.element, element.dataset.id);
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
//# sourceMappingURL=editor-section-tree.js.map
import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericTree } from '../utils/generic-tree.js';
import { appendDivTo } from '../utils/functions.js';
export class EditorContentTree extends GenericTree {
    constructor(div, app, tab) {
        super(div, app);
        this.tab = tab;
        this.eventManager = new EventManager(this);
        this.breadCrumbsWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs-wrapper` });
        this.breadCrumbs = appendDivTo(this.breadCrumbsWrapper, { class: `vrv-tree-breadcrumbs` });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
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
        node.label.classList.add("target");
        node.label.classList.add("checked");
        const parentRect = this.root.div.getBoundingClientRect();
        const childRect = node.div.getBoundingClientRect();
        // Calculate offset of the node relative to root
        const offsetTop = childRect.top - parentRect.top + this.root.div.scrollTop;
        // arbitrary margin
        this.root.div.scrollTo({ top: offsetTop - 50 });
    }
    loadContext(context, ancestors, target) {
        this.reset();
        this.fromJson(context);
        this.traverse((node) => {
            node.label.style.backgroundImage = `url(${App.iconFor(node.element)})`;
            if (node.id === target['id']) {
                this.selectNode(node);
            }
            return false;
        });
        if (Array.isArray(ancestors)) {
            this.breadCrumbs.innerHTML = "";
            for (let i = ancestors.length - 1; i >= 0; i--) {
                this.addCrumb(ancestors[i]['element'], ancestors[i]['id']);
            }
            ;
        }
        ;
        this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
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
//# sourceMappingURL=editor-content-tree.js.map
import { GenericTree } from "../utils/generic-tree.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";
export class EditorContentTree extends GenericTree {
    tab;
    constructor(div, app, tab) {
        super(div, app);
        this.tab = tab;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    loadContext(context) {
        this.reset();
        this.fromJson(context.context);
        // Dedicated method also to adjust the scrolling in the tree
        this.traverse((node) => {
            if (node.id === context.object.id) {
                this.selectNode(node);
            }
            return false;
        });
        // The content tree manages the bread crumb separately, and not with Tree::m_focusId
        this.clearCrumbs();
        context.ancestors
            .slice()
            .reverse()
            .forEach((ancestor) => {
            this.addCrumb(ancestor.element, ancestor.id);
        });
        this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
    }
    select(element, id) {
        this.app.customEventManager.dispatch(createAppEvent(AppEvent.Select, {
            id: id,
            element: element,
            caller: this,
        }));
    }
    cursorActivity(id, activity) {
        this.app.customEventManager.dispatch(createAppEvent(AppEvent.CursorActivity, {
            id: id,
            activity: activity,
            caller: this,
        }));
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
            else {
                this.select(element.dataset.element, element.dataset.id);
            }
        }
        e.stopPropagation();
    }
    onContextmenu(e) {
        this.app.contextMenuObj?.buildFor("test");
        this.app.contextMenuObj?.show(e);
    }
    onMouseover(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, "mouseover");
        }
    }
    onMouseout(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, "mouseout");
        }
    }
}
//# sourceMappingURL=editor-content-tree.js.map
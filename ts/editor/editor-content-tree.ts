import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericTree, TreeNode } from '../utils/generic-tree.js';
import { Tab } from '../utils/tab-group.js'
import { appendDivTo } from '../utils/functions.js';

export class EditorContentTree extends GenericTree {
    tab: Tab;
    breadCrumbsWrapper: HTMLDivElement;
    breadCrumbs: HTMLDivElement;
    eventManager: EventManager;

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);

        this.tab = tab;

        this.eventManager = new EventManager(this);

        this.breadCrumbsWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs-wrapper` });
        this.breadCrumbs = appendDivTo(this.breadCrumbsWrapper, { class: `vrv-tree-breadcrumbs` });
    }

    addCrumb(element: string, id: string): void {
        const crumb: HTMLDivElement = appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        crumb.innerHTML = element;
        crumb.dataset.id = id
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
    }

    selectNode(node: TreeNode): void {
        node.label.classList.add("target");
        const parentRect = this.root.div.getBoundingClientRect();
        const childRect = node.div.getBoundingClientRect();
        // Calculate offset of the node relative to root
        const offsetTop = childRect.top - parentRect.top + this.root.div.scrollTop;
        // arbitrary margin
        this.root.div.scrollTo({ top: offsetTop - 50 });
    }

    async loadContext(context: Object, ancestors: Object, target: Object): Promise<any> {
        console.log(context);
        this.reset();
        this.fromJson(context);

        this.traverse((node) => {
            if (node.id === target['id']) {
                this.selectNode(node);
                return true;
            }
        });

        if (Array.isArray(ancestors)) {
            this.breadCrumbs.innerHTML = "";
            for (let i = ancestors.length - 1; i >= 0; i--) {
                this.addCrumb(ancestors[i]['element'], ancestors[i]['id']);
            };
        };
        this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onLoadData(e: CustomEvent): boolean {
        if (!super.onLoadData(e)) return false;
        console.debug("EditorContentTree::onLoadData");

        return true;
    }

    override onUpdateData(e: CustomEvent): boolean {
        if (!super.onUpdateData(e)) return false;
        console.debug("EditorContentTree::onUpdateData");

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    select(element: string, id: string) {
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);

    }

    cursorActivity(id: string, activity: string) {
        let event = new CustomEvent('onCursorActivity', {
            detail: {
                id: id,
                activity: activity,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }

    override onClick(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.select(element.dataset.element, element.dataset.id);
        }
    }

    override onMouseover(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseover');

        }
    }

    override onMouseout(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseout');

        }
    }
}

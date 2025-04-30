import { App } from '../app.js';
import { GenericTree, TreeNode } from '../utils/generic-tree.js';
import { Tab } from '../utils/tab-group.js'
import { appendDivTo } from '../utils/functions.js';

export class EditorContentTree extends GenericTree {
    private readonly tab: Tab;
    private readonly breadCrumbsWrapper: HTMLDivElement;
    private readonly breadCrumbs: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
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

    public loadContext(context: EditorContentTree.Content): void {
        this.reset();
        this.fromJson(context.context);

        this.breadCrumbs.innerHTML = "";
        // root crumb
        appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });

        this.traverse((node) => {
            node.getLabel().style.backgroundImage = `url(${App.iconFor(node.element)})`;
            if (node.id === context.object.id) {
                this.selectNode(node);
            }
            return false;
        });

        context.ancestors.slice().reverse().forEach(ancestor => {
            this.addCrumb(ancestor.element, ancestor.id);
        });

        this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
    }

    private select(element: string, id: string) {
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                element: element,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);

    }

    private cursorActivity(id: string, activity: string) {
        let event = new CustomEvent('onCursorActivity', {
            detail: {
                id: id,
                activity: activity,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }

    private addCrumb(element: string, id: string): void {
        const crumb: HTMLDivElement = appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        crumb.innerHTML = element;
        crumb.dataset.id = id
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
    }

    private selectNode(node: TreeNode): void {
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

    override onClick(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
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

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace EditorContentTree {

    export interface ReferenceObject extends GenericTree.Object {
        referenceAttribute: string;
    }

    export interface Content {
        ancestors: GenericTree.Object[];
        context: GenericTree.Object;
        object: GenericTree.Object;
        referencedElements: ReferenceObject[];
        referringElements: ReferenceObject[];
    }
}


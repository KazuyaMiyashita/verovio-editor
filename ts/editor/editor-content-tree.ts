import { App } from "../app.js";
import { GenericTree, TreeNode } from "../utils/generic-tree.js";
import { Tab } from "../utils/tab-group.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";

export class EditorContentTree extends GenericTree {
  private readonly tab: Tab;

  constructor(div: HTMLDivElement, app: App, tab: Tab) {
    super(div, app);

    this.tab = tab;
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

  private select(element: string, id: string) {
    this.app.customEventManager.dispatch(
      createAppEvent(AppEvent.Select, {
        id: id,
        element: element,
        caller: this,
      }),
    );
  }

  private cursorActivity(id: string, activity: string) {
    this.app.customEventManager.dispatch(
      createAppEvent(AppEvent.CursorActivity, {
        id: id,
        activity: activity,
        caller: this,
      }),
    );
  }

  private selectNode(node: TreeNode): void {
    node.getLabel().classList.add("target");
    node.getLabel().classList.add("checked");
    const parentRect = this.root.getDiv().getBoundingClientRect();
    const childRect = node.getDiv().getBoundingClientRect();
    // Calculate offset of the node relative to root
    const offsetTop =
      childRect.top - parentRect.top + this.root.getDiv().scrollTop;
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
      } else {
        this.select(element.dataset.element, element.dataset.id);
      }
    }
    e.stopPropagation();
  }

  override onContextmenu(e: PointerEvent): void {
    this.app.contextMenuObj.buildFor("test");
    this.app.contextMenuObj.show(e);
  }

  override onMouseover(e: MouseEvent): void {
    const element: HTMLElement = e.target as HTMLElement;
    if (element.dataset.id) {
      this.cursorActivity(element.dataset.id, "mouseover");
    }
  }

  override onMouseout(e: MouseEvent): void {
    const element: HTMLElement = e.target as HTMLElement;
    if (element.dataset.id) {
      this.cursorActivity(element.dataset.id, "mouseout");
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

import { App } from "../app.js";
import { EditorContentTree } from "./editor-content-tree.js";
import { EventManager } from "../events/event-manager.js";
import { GenericView } from "../utils/generic-view.js";
import { Tab } from "../utils/tab-group.js";
import { appendDivTo } from "../utils/functions.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";

export class EditorReferenceList extends GenericView {
  public readonly eventManager: EventManager;

  private tab: Tab;
  private listWrapper: HTMLDivElement;

  constructor(div: HTMLDivElement, app: App, tab: Tab) {
    super(div, app);
    this.setDisplayFlex();

    this.tab = tab;

    this.eventManager = new EventManager(this);

    this.listWrapper = appendDivTo(this.div, {
      class: `vrv-reference-list-wrapper`,
    });
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

  public loadList(
    references: EditorContentTree.ReferenceObject[],
    direction: EditorReferenceList.Direction,
  ): void {
    this.listWrapper.textContent = "";
    this.eventManager.unbindAll();
    references.forEach((reference) => {
      let item = appendDivTo(this.listWrapper, {
        class: `vrv-reference-list-item vrv-mei-element`,
      });
      item.style.backgroundImage = `url(${App.iconFor(reference.element, this.app.host)})`;
      item.textContent = `${reference["element"]} @ ${reference.referenceAttribute}`;
      item.dataset.id = reference.id;
      item.dataset.element = reference.element;
      this.eventManager.bind(item, "click", this.onClick);
      this.eventManager.bind(item, "mouseover", this.onMouseover);
      this.eventManager.bind(item, "mouseout", this.onMouseout);
    });
  }

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////////////////
  // Event methods
  //////////////////////////////////////////////////////////////////////////

  onClick(e: MouseEvent): void {
    const element: HTMLElement = e.target as HTMLElement;
    if (element.dataset.id) {
      this.select(element.dataset.element, element.dataset.id);
    }
  }

  onMouseover(e: MouseEvent): void {
    const element: HTMLElement = e.target as HTMLElement;
    if (element.dataset.id) {
      this.cursorActivity(element.dataset.id, "mouseover");
    }
  }

  onMouseout(e: MouseEvent): void {
    const element: HTMLElement = e.target as HTMLElement;
    if (element.dataset.id) {
      this.cursorActivity(element.dataset.id, "mouseout");
    }
  }
}

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace EditorReferenceList {
  export enum Direction {
    From,
    To,
  }
}

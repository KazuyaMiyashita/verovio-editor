/**
 * The Toolbar class is the based class for other toolbar implementations.
 * It should not be instantiated directly but only through inherited classes.
 */

import { App } from "../app.js";
import { EventManager } from "../events/event-manager.js";
import { GenericView } from "./generic-view.js";
import { appendDivTo } from "./functions.js";

export class TabGroup extends GenericView {
  public readonly tabSelectors: HTMLDivElement;
  public readonly eventManager: EventManager;

  private selectedTab: Tab;
  private tabs: Array<Tab>;

  constructor(div: HTMLDivElement, app: App) {
    super(div, app);

    // Remove previous content
    this.div.textContent = "";

    this.tabSelectors = appendDivTo(this.div, { class: `vrv-tab-selectors` });
    this.tabs = new Array();
    this.selectedTab = null;

    this.eventManager = new EventManager(this);
  }

  ////////////////////////////////////////////////////////////////////////
  // Getters and setters
  ////////////////////////////////////////////////////////////////////////

  public getSelectedTab(): Tab {
    return this.selectedTab;
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

  public addTab(label: string): Tab {
    let content = appendDivTo(this.div, { class: `vrv-tab-content` });
    let tab = new Tab(content, this.app, this, label);
    // Select the first one by default
    if (this.tabs.length === 0) {
      this.selectedTab = tab;
      tab.select();
    } else {
      tab.deselect();
    }
    this.tabs.push(tab);
    return tab;
  }

  public setHeight(height: number): void {
    this.div.style.minHeight = `${height}px`;
    this.div.style.maxHeight = `${height}px`;
  }

  public select(id: string): void {
    if (this.selectedTab && this.selectedTab.id === id) return;
    this.tabs.forEach((tab) => {
      if (id === tab.id) this.selectedTab = tab;
      else tab.deselect();
    });
    this.selectedTab.select();
  }

  public resetTabs(): void {
    this.tabs.forEach((tab) => {
      tab.loaded = false;
    });
  }

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////

  /**
   *  The tabs are not added to the tabGroup custom event propagation list.
   *  Events are propagated by hand as appropriate to all tabs or only to the selected tab.
   */

  override onActivate(e: CustomEvent): boolean {
    if (!super.onActivate(e)) return false;
    this.selectedTab.customEventManager.dispatch(e);
    return true;
  }

  override onDeactivate(e: CustomEvent): boolean {
    if (!super.onDeactivate(e)) return false;
    this.dispatchToAll(e);
    return true;
  }

  override onEditData(e: CustomEvent): boolean {
    if (!super.onEditData(e)) return false;
    if (this.selectedTab === e.detail.caller) return false;
    this.selectedTab.customEventManager.dispatch(e);
    return true;
  }

  override onEndLoading(e: CustomEvent): boolean {
    if (!super.onEndLoading(e)) return false;
    this.dispatchToAll(e);
    return true;
  }

  override onLoadData(e: CustomEvent): boolean {
    if (!super.onLoadData(e)) return false;
    this.resetTabs();
    this.selectedTab.customEventManager.dispatch(e);
    return true;
  }

  override onSelect(e: CustomEvent): boolean {
    if (!super.onSelect(e)) return false;
    if (this.selectedTab === e.detail.caller) return false;
    this.selectedTab.customEventManager.dispatch(e);
    return true;
  }

  private dispatchToAll(e: CustomEvent): void {
    this.tabs.forEach((tab) => {
      tab.customEventManager.dispatch(e);
    });
  }

  ////////////////////////////////////////////////////////////////////////
  // Event methods
  ////////////////////////////////////////////////////////////////////////

  onSelectTab(e: MouseEvent): void {
    const element: HTMLElement = e.target as HTMLElement;
    this.select(element.dataset.tab);
  }
}

export class Tab extends GenericView {
  private tabGroupObj: TabGroup;
  private tabSelector: HTMLDivElement;
  public loaded: boolean;

  constructor(
    div: HTMLDivElement,
    app: App,
    tabGroup: TabGroup,
    label: string,
  ) {
    super(div, app);
    this.tabGroupObj = tabGroup;
    this.tabSelector = appendDivTo(tabGroup.tabSelectors, {
      class: `vrv-tab-selector`,
      dataset: { tab: `${this.id}` },
    });
    this.tabSelector.textContent = label;
    this.loaded = false;
    tabGroup.eventManager.bind(this.tabSelector, "click", tabGroup.onSelectTab);
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

  public select() {
    this.tabSelector.classList.add("selected");
    this.div.style.display = "block";
    let event = new CustomEvent("onActivate");
    this.customEventManager.dispatch(event);
  }

  public deselect() {
    this.tabSelector.classList.remove("selected");
    this.div.style.display = "none";
    let event = new CustomEvent("onDeactivate");
    this.customEventManager.dispatch(event);
  }

  public isSelected(): boolean {
    return this.tabGroupObj.getSelectedTab() === this;
  }

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////
}

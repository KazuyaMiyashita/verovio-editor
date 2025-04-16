/**
 * The Toolbar class is the based class for other toolbar implementations.
 * It should not be instantiated directly but only through inherited classes.
 */

import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';
import { appendDivTo } from './functions.js';
import { randomHex } from '../utils/functions.js';

export class TabGroup extends GenericView {
    selectedTab: Tab;
    tabSelectors: HTMLDivElement;
    private tabs: Array<Tab>;
    eventManager: EventManager;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);

        // Remove previous content
        this.div.innerHTML = "";

        this.tabSelectors = appendDivTo(this.div, { class: `vrv-tab-selectors` });
        this.tabs = new Array();
        this.selectedTab = null;

        this.eventManager = new EventManager(this);
    }

    addTab(label: string): Tab {
        let content = appendDivTo(this.div, { class: `vrv-tab-content` });
        let tab = new Tab(content, this, label);
        // Select the first one by default
        if (this.tabs.length === 0) {
            this.selectedTab = tab;
            tab.select();
        }
        else {
            tab.deselect();
        }
        this.tabs.push(tab);
        return tab;
    }

    setHeight(height: number): void {
        this.div.style.minHeight = `${height}px`;
        this.div.style.maxHeight = `${height}px`;
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

    override onLoadData(e: CustomEvent): boolean {
        if (!super.onLoadData(e)) return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }

    override onSelect(e: CustomEvent): boolean {
        if (!super.onSelect(e)) return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    dispatchToAll(e: CustomEvent): void {
        this.tabs.forEach(tab => {
            tab.customEventManager.dispatch(e);
        });
    }

    select(tabId: string): void {
        if (this.selectedTab && this.selectedTab.tabId === tabId) return;
        this.tabs.forEach(tab => {
            if (tabId === tab.tabId) this.selectedTab = tab;
            else tab.deselect();
        });
        this.selectedTab.select();
    }

    onSelectTab(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        this.select(element.dataset.tab);
    }

}

export class Tab extends GenericView {
    tabGroupObj: TabGroup;
    tabSelector: HTMLDivElement;
    tabId: string;

    constructor(div: HTMLDivElement, tabGroup: TabGroup, label: string) {
        super(div, tabGroup.app);
        this.tabGroupObj = tabGroup;
        this.tabId = randomHex(16);
        this.tabSelector = appendDivTo(tabGroup.tabSelectors, { class: `vrv-tab-selector`, dataset: { tab: `${this.tabId}` } });
        this.tabSelector.innerHTML = label;
        tabGroup.eventManager.bind(this.tabSelector, 'click', tabGroup.onSelectTab);
    }

    select() {
        this.tabSelector.classList.add("selected");
        this.div.style.display = 'block';
        let event = new CustomEvent('onActivate');
        this.customEventManager.dispatch(event);
    }

    deselect() {
        this.tabSelector.classList.remove("selected");
        this.div.style.display = 'none';
        let event = new CustomEvent('onDeactivate');
        this.customEventManager.dispatch(event);
    }

    isSelected(): boolean {
        return (this.tabGroupObj.selectedTab === this);
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

}
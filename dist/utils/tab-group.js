/**
 * The Toolbar class is the based class for other toolbar implementations.
 * It should not be instantiated directly but only through inherited classes.
 */
import { EventManager } from '../events/event-manager.js';
import { appendDivTo } from './functions.js';
export class TabGroup {
    constructor(div, app) {
        //super(div, app);
        this.element = div;
        // Remove previous content
        this.element.innerHTML = "";
        this.tabSelectors = appendDivTo(this.element, { class: `vrv-tab-selectors` });
        this.tabs = new Array();
        this.eventManager = new EventManager(this);
    }
    addTab(label) {
        let content = appendDivTo(this.element, { class: `vrv-tab-content` });
        let tab = new Tab(this, content, label);
        this.tabs.push(tab);
        // Select the first tab by default
        (this.tabs.length === 0) ? tab.select() : tab.deselect();
        return tab;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    selectTab(e) {
        console.log("test");
        const element = e.target;
        let selectedTab = this.tabs[0];
        this.tabs.forEach(tab => {
            tab.deselect();
            if (element.dataset.tab === tab.tabId)
                selectedTab = tab;
        });
        selectedTab.select();
    }
}
class Tab {
    constructor(tabGroup, content, label) {
        this.tabId = Math.floor((1 + Math.random()) * Math.pow(16, 16)).toString(16).substring(1);
        this.tabSelector = appendDivTo(tabGroup.tabSelectors, { class: `vrv-tab-selector`, dataset: { tab: `${this.tabId}` } });
        this.tabSelector.innerHTML = label;
        tabGroup.eventManager.bind(this.tabSelector, 'click', tabGroup.selectTab);
        this.tabContent = content;
    }
    select() {
        this.tabSelector.classList.add("selected");
        this.tabContent.style.display = 'block';
    }
    deselect() {
        this.tabSelector.classList.remove("selected");
        this.tabContent.style.display = 'none';
    }
}
//# sourceMappingURL=tab-group.js.map
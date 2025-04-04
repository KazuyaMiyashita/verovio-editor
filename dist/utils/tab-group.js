/**
 * The Toolbar class is the based class for other toolbar implementations.
 * It should not be instantiated directly but only through inherited classes.
 */
import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';
import { appendDivTo } from './functions.js';
import { randomHex } from '../utils/functions.js';
export class TabGroup extends GenericView {
    constructor(div, app) {
        super(div, app);
        // Remove previous content
        this.div.innerHTML = "";
        this.tabSelectors = appendDivTo(this.div, { class: `vrv-tab-selectors` });
        this.tabs = new Array();
        this.selectedTab = null;
        this.eventManager = new EventManager(this);
    }
    addTab(label) {
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
    setHeight(minHeight) {
        this.div.style.minHeight = `${minHeight}px`;
        this.div.style.maxHeight = `${minHeight}px`;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    /**
     *  The tabs are not added to the tabGroup custom event propagation list.
     *  Events are propagated by hand as appropriate to all tabs or only to the selected tab.
     */
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }
    onDeactivate(e) {
        if (!super.onDeactivate(e))
            return false;
        this.dispatchToAll(e);
        return true;
    }
    onUpdateData(e) {
        if (!super.onUpdateData(e))
            return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    dispatchToAll(e) {
        this.tabs.forEach(tab => {
            tab.customEventManager.dispatch(e);
        });
    }
    select(tabId) {
        if (this.selectedTab && this.selectedTab.tabId === tabId)
            return;
        this.tabs.forEach(tab => {
            if (tabId === tab.tabId)
                this.selectedTab = tab;
            else
                tab.deselect();
        });
        this.selectedTab.select();
    }
    onSelectTab(e) {
        const element = e.target;
        this.select(element.dataset.tab);
    }
}
export class Tab extends GenericView {
    constructor(div, tabGroup, label) {
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
    isSelected() {
        return (this.tabGroupObj.selectedTab === this);
    }
}
//# sourceMappingURL=tab-group.js.map
/**
 * The Toolbar class is the based class for other toolbar implementations.
 * It should not be instantiated directly but only through inherited classes.
 */
import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';
import { appendDivTo } from './functions.js';
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
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    getSelectedTab() { return this.selectedTab; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    addTab(label) {
        let content = appendDivTo(this.div, { class: `vrv-tab-content` });
        let tab = new Tab(content, this.app, this, label);
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
    setHeight(height) {
        this.div.style.minHeight = `${height}px`;
        this.div.style.maxHeight = `${height}px`;
    }
    select(id) {
        if (this.selectedTab && this.selectedTab.id === id)
            return;
        this.tabs.forEach(tab => {
            if (id === tab.id)
                this.selectedTab = tab;
            else
                tab.deselect();
        });
        this.selectedTab.select();
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
    onEditData(e) {
        if (!super.onEditData(e))
            return false;
        if (this.selectedTab === e.detail.caller)
            return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }
    onLoadData(e) {
        if (!super.onLoadData(e))
            return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        if (this.selectedTab === e.detail.caller)
            return false;
        this.selectedTab.customEventManager.dispatch(e);
        return true;
    }
    dispatchToAll(e) {
        this.tabs.forEach(tab => {
            tab.customEventManager.dispatch(e);
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    onSelectTab(e) {
        const element = e.target;
        this.select(element.dataset.tab);
    }
}
export class Tab extends GenericView {
    constructor(div, app, tabGroup, label) {
        super(div, app);
        this.tabGroupObj = tabGroup;
        this.tabSelector = appendDivTo(tabGroup.tabSelectors, { class: `vrv-tab-selector`, dataset: { tab: `${this.id}` } });
        this.tabSelector.innerHTML = label;
        tabGroup.eventManager.bind(this.tabSelector, 'click', tabGroup.onSelectTab);
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
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
        return (this.tabGroupObj.getSelectedTab() === this);
    }
}
//# sourceMappingURL=tab-group.js.map
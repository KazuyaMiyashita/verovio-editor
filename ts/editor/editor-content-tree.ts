import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericTree } from '../utils/generic-tree.js';
import { Tab } from '../utils/tab-group.js'
import { appendDivTo } from '../utils/functions.js';

export class EditorContentTree extends GenericTree {
    tab: Tab;
    breadCrumbs: HTMLDivElement;
    eventManager: EventManager;

    constructor(div: HTMLDivElement, app: App, tab: Tab) {
        super(div, app);

        this.tab = tab;

        this.eventManager = new EventManager(this);

        let treeBreadCrumbsWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs` });
        this.breadCrumbs = appendDivTo(treeBreadCrumbsWrapper, { class: `vrv-path-breadcrumbs` });

        //this.breadCrumbs.style.display = 'flex';
        let crumbs = ["measure", "staff", "layer", "app", "rdg",
            "tuplet", "beam"]
        for (let i = 0; i < crumbs.length; i++) this.addCrumb(crumbs[i], i + 1);
    }

    addCrumb(name: string, value: number): void {
        const crumb: HTMLDivElement = appendDivTo(this.breadCrumbs, { class: `vrv-path-breadcrumbs` });
        crumb.innerHTML = name;
        crumb.dataset.value = value.toString();
        this.eventManager.bind(crumb, 'click', this.selectCrumb);
    }

    async setCurrent(id: string): Promise<any> {
        //this.currentId = id;
        this.fakeLoad();
    }

    fakeLoad(): void {
        const jsonData = {
            id: "1",
            element: "bookstore",
            attributes: {},
            isTextNode: false,
            children: [
                {
                    id: "2",
                    element: "book",
                    attributes: { category: "fiction" },
                    isTextNode: false,
                    children: [
                        { id: "3", element: "title", attributes: { lang: "en" }, isTextNode: false, children: [] },
                        { id: "4", element: "text", attributes: {}, isTextNode: true, children: [] }
                    ]
                }
            ]
        };

        this.reset();
        this.fromJson(jsonData);
    }    

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onSelect(e: CustomEvent): boolean {
        if (!super.onSelect(e)) return false;
        console.debug("EditorContentTree::onSelect");
        
        this.currentId = e.detail.id;
        this.setCurrent(this.currentId);

        return true;
    }

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

    selectCrumb(e: MouseEvent): void {
        //const element: HTMLElement = e.target as HTMLElement;
        //this.githubManager.slicePathTo(Number(element.dataset.value));
        //this.listFiles();
    }
}

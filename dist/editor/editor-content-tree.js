var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventManager } from '../events/event-manager.js';
import { GenericTree } from '../utils/generic-tree.js';
import { appendDivTo } from '../utils/functions.js';
export class EditorContentTree extends GenericTree {
    constructor(div, app, tab) {
        super(div, app);
        this.tab = tab;
        this.eventManager = new EventManager(this);
        let treeBreadCrumbsWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs` });
        this.breadCrumbs = appendDivTo(treeBreadCrumbsWrapper, { class: `vrv-path-breadcrumbs` });
        //this.breadCrumbs.style.display = 'flex';
        let crumbs = ["measure", "staff", "layer", "app", "rdg",
            "tuplet", "beam"];
        for (let i = 0; i < crumbs.length; i++)
            this.addCrumb(crumbs[i], i + 1);
    }
    addCrumb(name, value) {
        const crumb = appendDivTo(this.breadCrumbs, { class: `vrv-path-breadcrumbs` });
        crumb.innerHTML = name;
        crumb.dataset.value = value.toString();
        this.eventManager.bind(crumb, 'click', this.selectCrumb);
    }
    setCurrent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            //this.currentId = id;
            this.fakeLoad();
        });
    }
    fakeLoad() {
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
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        console.debug("EditorContentTree::onSelect");
        this.currentId = e.detail.id;
        this.setCurrent(this.currentId);
        return true;
    }
    onLoadData(e) {
        if (!super.onLoadData(e))
            return false;
        console.debug("EditorContentTree::onLoadData");
        return true;
    }
    onUpdateData(e) {
        if (!super.onUpdateData(e))
            return false;
        console.debug("EditorContentTree::onUpdateData");
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    selectCrumb(e) {
        //const element: HTMLElement = e.target as HTMLElement;
        //this.githubManager.slicePathTo(Number(element.dataset.value));
        //this.listFiles();
    }
}
//# sourceMappingURL=editor-content-tree.js.map
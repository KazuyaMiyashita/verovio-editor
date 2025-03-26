var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventManager } from './event-manager.js';
import { GenericView } from './generic-view.js';
import { appendDivTo } from './utils/functions.js';
export class GenericTree extends GenericView {
    constructor(div, app) {
        super(div, app);
        this.eventManager = new EventManager(this);
        this.breadCrumbs = appendDivTo(this.element, { class: `vrv-path-breadcrumbs` });
        //this.breadCrumbs.style.display = 'flex';
        let crumbs = ["measure", "staff", "layer", "app", "rdg", "tuplet", "beam"];
        for (let i = 0; i < crumbs.length; i++)
            this.addCrumb(crumbs[i], i + 1);
        this.root = null;
    }
    reset() {
        if (this.root) {
            this.root.reset();
            this.tree.remove();
        }
        this.root = null;
    }
    addCrumb(name, value) {
        const crumb = appendDivTo(this.breadCrumbs, { class: `vrv-path-breadcrumbs` });
        crumb.innerHTML = name;
        crumb.dataset.value = value.toString();
        this.eventManager.bind(crumb, 'click', this.selectCrumb);
    }
    fromJson(json) {
        if (!json || !json.element)
            throw new Error("Invalid JSON data: Missing 'element' property");
        function buildTree(nodeData) {
            const { id = null, element, attributes = {}, children = [], isTextNode = false } = nodeData;
            console.log(this);
            const node = new TreeNode(id, element, attributes, [], isTextNode);
            if (Array.isArray(children)) {
                node.children = children.map(buildTree);
            }
            return node;
        }
        this.root = buildTree(json);
        this.tree = appendDivTo(this.element, { class: `vrv-tree` });
        this.root.html(this.tree);
    }
    //traverse
    traverse(callback) {
        function visit(node) {
            callback(node);
            node.children.forEach(visit);
        }
        if (this.root)
            visit(this.root);
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
    onActivate(e) {
        //console.debug("GenericView::onActivate");
        this.element.style.display = 'block';
        this.active = true;
        return true;
    }
    onDeactivate(e) {
        //console.debug("GenericView::onDeactivate");
        this.element.style.display = 'none';
        this.active = false;
        return true;
    }
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        console.debug("GenericTree::onSelect");
        this.currentId = e.detail.id;
        this.setCurrent(this.currentId);
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
export class TreeNode {
    constructor(id, element, attributes = {}, children = [], isTextNode = false) {
        this.id = id;
        this.elementName = element;
        this.attributes = attributes;
        this.children = children;
        this.isTextNode = isTextNode;
    }
    reset() {
        this.children.forEach(child => child.reset());
        while (this.element.firstChild) {
            this.element.firstChild.remove();
        }
    }
    html(element) {
        this.element = element;
        let label = appendDivTo(this.element, { class: `vrv-node-label` });
        label.innerHTML = this.elementName;
        let children = appendDivTo(this.element, { class: `vrv-node-children` });
        this.children.forEach(child => {
            let node = appendDivTo(children, { class: `vrv-tree-node` });
            child.html(node);
        });
    }
}
/*
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

const tree = Tree.fromJson(jsonData);

// Traverse and print elements
tree.traverse(node => {
  console.log(
    `<${node.element} id="${node.id}" ${JSON.stringify(node.attributes)} isTextNode=${node.isTextNode}>`
  );
});

<div class="vrv-wrapper">
  <div class="vrv-tree">
    <div class="vrv-node-label">root</div>
    <div class="vrv-node-children">
      <div class="vrv-tree-node">
        <div class="vrv-node-label">1</div>
      </div>
      <div class="vrv-tree-node">
        <div class="vrv-node-label">2</div>
      </div>
      <div class="vrv-tree-node open">
        <div class="vrv-node-label">
          <input type="checkbox">
          <span>label</span>
          
        </div>
        <div class="vrv-node-children">
          <div class="vrv-tree-node">
            <div class="vrv-node-label">3.1</div>
          </div>
          <div class="vrv-tree-node">
            <div class="vrv-node-label">3.2</div>
          </div>
          <div class="vrv-tree-node open">
            <div class="vrv-node-label">3.3</div>
            <div class="vrv-tree-children">
              <div class="vrv-tree-node">
                <div class="vrv-node-label">3.3.1</div>
              </div>
              <div class="vrv-tree-node">
                <div class="vrv-node-label">3.3.2</div>
              </div>
              <div class="vrv-tree-node">
                <div class="vrv-node-label">3.3.3</div>
              </div>
            </div>
          </div>
        </div>
        <div class="vrv-tree-node">
          <div class="vrv-node-label">4</div>
        </div>
      </div>
    </div>
  </div>
</div>

*/ 
//# sourceMappingURL=editorMusicTree.js.map
import { GenericView } from './generic-view.js';
import { appendDivTo } from './functions.js';
function buildTree(nodeData) {
    const { id = null, element, attributes = {}, children = [], isTextNode = false } = nodeData;
    const node = new TreeNode(id, element, attributes, [], isTextNode);
    if (Array.isArray(children)) {
        node.children = children.map(buildTree);
    }
    return node;
}
export class GenericTree extends GenericView {
    constructor(div, app) {
        super(div, app);
        this.root = null;
    }
    reset() {
        if (this.root) {
            this.root.reset();
            this.rootElement.remove();
        }
        this.root = null;
    }
    fromJson(json) {
        if (!json || !json.element)
            throw new Error("Invalid JSON data: Missing 'element' property");
        this.root = buildTree(json);
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.root.html(this.rootElement);
    }
}
export class TreeNode {
    constructor(id, element, attributes = {}, children = [], isTextNode = false) {
        this.id = id;
        this.element = element;
        this.attributes = attributes;
        this.children = children;
        this.isTextNode = isTextNode;
    }
    reset() {
        this.children.forEach(child => child.reset());
        while (this.div.firstChild) {
            this.div.firstChild.remove();
        }
    }
    html(div) {
        this.div = div;
        let label = appendDivTo(this.div, { class: `vrv-node-label` });
        label.innerHTML = this.element;
        let children = appendDivTo(this.div, { class: `vrv-node-children` });
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

Get Score
Mdiv / Score / ScoreDef
	Page children without system + Score child

GetSection
Section / Ending
	System children without div, measure, scoreDef, pb, sb, expansion

GetContext
Find element in page / find element in doc
	SB, PB, DIV, MEASURE, SCOREDEF


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
//# sourceMappingURL=generic-tree.js.map
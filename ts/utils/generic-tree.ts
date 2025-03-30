

import { App } from '../app.js';
import { GenericView } from './generic-view.js';

import { appendDivTo } from './functions.js';

function buildTree(nodeData: any): TreeNode {
  const {
    id = null,
    element,
    attributes = {},
    children = [],
    isTextNode = false
  } = nodeData;

  const node = new TreeNode(id, element, attributes, [], isTextNode);
  if (Array.isArray(children)) {
    node.children = children.map(buildTree);
  }
  return node;
}

export class GenericTree extends GenericView {
  root: TreeNode | null;
  currentId: string;
  rootElement: HTMLDivElement;

  constructor(div: HTMLDivElement, app: App) {
    super(div, app);

    this.root = null;
  }

  reset(): void {
    if (this.root) {
      this.root.reset();
      this.rootElement.remove();
    }
    this.root = null;
  }

  fromJson(json: any): void {
    if (!json || !json.element) throw new Error("Invalid JSON data: Missing 'element' property");

    this.root = buildTree(json);
    this.rootElement = appendDivTo(this.element, { class: `vrv-tree-root` });
    this.root.html(this.rootElement);
  }

  /*
  traverse(callback: (node: TreeNode) => void) {
    function visit(node: TreeNode) {
      callback(node);
      node.children.forEach(visit);
    }
    if (this.root) visit(this.root);
  }
  */

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////

  override onActivate(e: CustomEvent): boolean {
    //console.debug("GenericView::onActivate");
    this.element.style.display = 'block';
    this.active = true;
    return true;
  }

  override onDeactivate(e: CustomEvent): boolean {
    //console.debug("GenericView::onDeactivate");
    this.element.style.display = 'none';
    this.active = false;
    return true;
  }
}

export class TreeNode {
  element: HTMLDivElement;
  id: string | null; // Unique node identifier
  elementName: string; // XML tag name
  attributes: Record<string, string>; // Key-value attributes
  children: TreeNode[];
  isTextNode: boolean; // Flag for text nodes

  constructor(
    id: string | null,
    element: string,
    attributes: Record<string, string> = {},
    children: TreeNode[] = [],
    isTextNode: boolean = false
  ) {
    this.id = id;
    this.elementName = element;
    this.attributes = attributes;
    this.children = children;
    this.isTextNode = isTextNode;
  }

  reset(): void {
    this.children.forEach(child => child.reset());
    while (this.element.firstChild) {
      this.element.firstChild.remove();
    }
  }

  html(element: HTMLDivElement) {
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
import { GenericView } from './generic-view.js';
import { appendDivTo } from './functions.js';
function buildTree(nodeData) {
    const { id = null, element, attributes = {}, children = [], isTextNode = false, } = nodeData;
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
        this.hideRoot = false;
    }
    reset() {
        if (this.root) {
            this.root.reset();
            this.rootElement.remove();
        }
        this.root = null;
    }
    onClick(e) {
        // This need to be overridden
    }
    onMouseover(e) {
        // This need to be overridden
    }
    onMouseout(e) {
        // This need to be overridden
    }
    fromJson(json) {
        if (!json || !json.element)
            throw new Error("Invalid JSON data: Missing 'element' property");
        this.root = buildTree(json);
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.root.html(this.rootElement, this, this.hideRoot);
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
    html(div, tree, hideLabel = false) {
        this.div = div;
        // Pass the id and element for the onClick
        this.div.dataset.id = this.id;
        this.div.dataset.element = this.element;
        let label = appendDivTo(this.div, { class: `vrv-node-label` });
        if (hideLabel)
            label.style.display = 'none';
        else {
            // Copy the dataset because both the node and the label fire an event
            label.dataset.id = this.div.dataset.id;
            label.dataset.element = this.div.dataset.element;
            tree.eventManager.bind(this.div, "click", tree.onClick);
            tree.eventManager.bind(this.div, "mouseover", tree.onMouseover);
            tree.eventManager.bind(this.div, "mouseout", tree.onMouseout);
        }
        let labelStr = this.element;
        if (this.attributes && this.attributes['n']) {
            labelStr += ` ${this.attributes['n']}`;
        }
        label.innerHTML = labelStr;
        //let cb = appendInputTo(label, { type: `checkbox` });
        let children = appendDivTo(this.div, { class: `vrv-node-children` });
        this.children.forEach(child => {
            let node = appendDivTo(children, { class: `vrv-tree-node` });
            child.html(node, tree);
        });
    }
}
/*

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

*/ 
//# sourceMappingURL=generic-tree.js.map
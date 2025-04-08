

import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';

import { appendDivTo, appendInputTo } from './functions.js';

function buildTree(nodeData: any): TreeNode {
    const {
        id = null,
        element,
        attributes = {},
        children = [],
        isTextNode = false,
        isLeaf = false
    } = nodeData;

    const node = new TreeNode(id, element, attributes, [], isTextNode, isLeaf);
    if (Array.isArray(children)) {
        node.children = children.map(buildTree);
    }
    return node;
}

export class GenericTree extends GenericView {
    root: TreeNode | null;
    currentId: string;
    rootElement: HTMLDivElement;
    hideRoot: boolean;
    eventManager: EventManager;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);

        this.root = null;
        this.hideRoot = false;
        this.setDisplayFlex();
    }

    reset(): void {
        this.eventManager.unbindAll();
        if (this.root) {
            this.root.reset();
            this.rootElement.innerHTML = "";
        }
        this.root = null;
    }

    onClick(e: MouseEvent): void {
        // This need to be overridden
    }

    onMouseover(e: MouseEvent): void {
        // This need to be overridden
    }

    onMouseout(e: MouseEvent): void {
        // This need to be overridden
    }

    fromJson(json: any): void {
        if (!json || !json.element) throw new Error("Invalid JSON data: Missing 'element' property");

        this.root = buildTree(json);
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.root.html(this.rootElement, this, this.hideRoot);
    }

    // Generic depth-first traversal method
    traverse(callback: (node: TreeNode) => boolean | void): void {
        const visit = (node: TreeNode): boolean => {
            if (callback(node)) {
                return true; // Stop if callback says so
            }
            for (const child of node.children) {
                if (visit(child)) return true;
            }
            return false;
        };
        visit(this.root);
    }
}

export class TreeNode {
    div: HTMLDivElement;
    label: HTMLDivElement;
    id: string | null; // Unique node identifier
    element: string; // XML tag name
    attributes: Record<string, string>; // Key-value attributes
    children: TreeNode[];
    isTextNode: boolean; // Flag for text nodes
    isLeaf: boolean;

    constructor(
        id: string | null,
        element: string,
        attributes: Record<string, string> = {},
        children: TreeNode[] = [],
        isTextNode: boolean = false,
        isLeaf = false
    ) {
        this.id = id;
        this.element = element;
        this.attributes = attributes;
        this.children = children;
        this.isTextNode = isTextNode;
        this.isLeaf = isLeaf;
    }

    reset(): void {
        this.children.forEach(child => child.reset());
        this.div.innerHTML = "";
    }

    html(div: HTMLDivElement, tree: GenericTree, hideLabel: boolean = false) {
        this.div = div;
        if (this.isLeaf) this.div.classList.add("leaf");
        if (this.children.length > 0) this.div.classList.add("open");
        // Pass the id and element for the onClick
        this.div.dataset.id = this.id;
        this.div.dataset.element = this.element;
        this.label = appendDivTo(this.div, { class: `vrv-mei-element vrv-node-label` });
        if (hideLabel) this.label.style.display = 'none';
        else {
            // Copy the dataset because both the node and the label fire an event
            this.label.dataset.id = this.div.dataset.id;
            this.label.dataset.element = this.div.dataset.element;
            tree.eventManager.bind(this.div, "click", tree.onClick);
            tree.eventManager.bind(this.div, "mouseover", tree.onMouseover);
            tree.eventManager.bind(this.div, "mouseout", tree.onMouseout);
        }
        let labelStr = this.element;
        if (this.attributes && this.attributes['n']) {
            labelStr += ` ${this.attributes['n']}`
        }
        this.label.innerHTML = labelStr;
        //let cb = appendInputTo(this.label, { type: `checkbox` });
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


*/
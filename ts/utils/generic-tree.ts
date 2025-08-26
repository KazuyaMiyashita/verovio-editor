

import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';

import { appendDivTo } from './functions.js';

export class GenericTree extends GenericView {
    public readonly eventManager: EventManager;

    protected root: TreeNode | null;
    protected useBreadCrumbs: boolean;

    protected focusId: string;
    protected displayDepth: number;

    private rootElement: HTMLDivElement;

    protected readonly breadCrumbsWrapper: HTMLDivElement;
    private readonly breadCrumbs: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);


        this.breadCrumbsWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs-wrapper` });
        // hidden by default
        this.breadCrumbsWrapper.style.display = 'none';
        this.breadCrumbs = appendDivTo(this.breadCrumbsWrapper, { class: `vrv-tree-breadcrumbs` });
        this.clearCrumbs();


        this.root = null;
        this.useBreadCrumbs = false;
        this.setDisplayFlex();

        this.focusId = "";
        this.displayDepth = 2;

        this.eventManager = new EventManager(this);
    }

    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    public hasBreadCrumbs(): boolean { return this.useBreadCrumbs; }
    public setBreadCrumbs(): void {
        this.useBreadCrumbs = true;
        this.breadCrumbsWrapper.style.display = 'block';
    }

    public isInFocus(node: TreeNode) {
        if (this.focusId.length === 0 || this.id === this.focusId) return true;
        for (const child of node['children']) if (child.id === this.focusId) return true;
        return false;
    }

    public isAncestorOfFocus(node: TreeNode) {
        return (this.isAncestorOf(node, this.focusId) !== null);
    }

    public isAncestorOf(node: TreeNode, id: string): TreeNode | null {
        return this.findInSubtree(node, (node: TreeNode) => node.id === id);
    }

    public getDisplayDepth(): number { return this.displayDepth; }
    public getFocusId(): string { return this.focusId; }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public applyFocus(id: string): void {
        this.eventManager.unbindAll();
        this.rootElement.remove();
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.clearCrumbs();
        this.focusId = id;
        // We we select the root (from the crumb) reset to ""
        if (this.root.id === id) this.focusId = "";
        // Rebuild the html tree
        this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
        this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;

    }

    public addCrumb(element: string, id: string): void {
        const crumb: HTMLDivElement = appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        crumb.textContent = element;
        crumb.dataset.id = id
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
    }

    protected clearCrumbs(): void {
        // Reset the crumbs
        this.breadCrumbs.textContent = "";
        appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
    }

    protected reset(): void {
        this.eventManager.unbindAll();
        if (this.root) {
            this.root.reset();
            this.rootElement.remove();
        }
        this.root = null;
    }

    protected collapseNode(id: string) {
        this.traverse((node) => {
            if (node.id === id) {
                if (!node.getDiv().classList.contains("open")) return true;
                node.getDiv().classList.toggle("open");
                const children = node.getDiv().querySelector('.vrv-node-children') as HTMLElement;
                if (children) children.style.display = 'none';
                return true;
            }
            return false;
        });
    }

    protected expandNode(id: string) {
        this.traverse((node) => {
            if (node.id === id) {
                if (node.getDiv().classList.contains("open")) return true;
                node.getDiv().classList.toggle("open");
                const children = node.getDiv().querySelector('.vrv-node-children') as HTMLElement;
                if (children) children.style.display = 'block';
                return true;
            }
            return false;
        });
    }

    protected fromJson(json: GenericTree.Object): void {
        if (!json || !json.element) throw new Error("Invalid JSON data: Missing 'element' property");

        this.root = this.buildTreeFromJson(json);
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
    }

    protected fromXml(xmlString: string): void {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, "application/xml");

        // Check for parser error
        const parserError = doc.querySelector("parsererror");
        if (parserError) throw new Error("Invalid XML: " + parserError.textContent);

        const rootElement = doc.documentElement;
        this.root = this.buildTreeFromElement(rootElement);
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
    }

    protected toXml(): string {
        if (!this.root) throw new Error("Tree is empty");

        const xmlElement = this.toXmlElement();
        const serializer = new XMLSerializer();
        return serializer.serializeToString(xmlElement);
    }

    ////////////////////////////////////////////////////////////////////////
    // Methods to traverse the tree and find nodes (from a specific node)
    ////////////////////////////////////////////////////////////////////////

    protected traverse(callback: (node: TreeNode) => boolean | void): void {
        const visit = (node: TreeNode): boolean => {
            if (callback(node)) {
                return true; // Stop if callback says so
            }
            for (const child of node.getChildren()) {
                if (visit(child)) return true;
            }
            return false;
        };
        visit(this.root);
    }

    protected findInSubtree(node: TreeNode, predicate: (node: TreeNode) => boolean): TreeNode | null {
        if (predicate(node)) {
            return node;
        }

        if (Array.isArray(node['children'])) {
            for (const child of node['children']) {
                const result = this.findInSubtree(child, predicate);
                if (result) return result;
            }
        }

        return null;
    }

    ////////////////////////////////////////////////////////////////////////
    // Methods to build or output trees
    ////////////////////////////////////////////////////////////////////////

    private buildTreeFromJson(nodeData: any): TreeNode {
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
            node.setChildren(children.map((child: any) => this.buildTreeFromJson(child)));
        }
        return node;
    }

    private buildTreeFromElement(element: Element): TreeNode {
        const attributes: Record<string, string> = {};
        for (let attr of Array.from(element.attributes)) {
            attributes[attr.name] = attr.value;
        }

        const children: TreeNode[] = [];
        for (let node of Array.from(element.childNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                children.push(this.buildTreeFromElement(node as Element));
            } else if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent?.trim();
                if (textContent) {
                    children.push(new TreeNode(
                        null,
                        "#text",
                        { textContent },
                        [],
                        true,
                        true
                    ));
                }
            }
        }

        const id = attributes["xml:id"] || null;

        return new TreeNode(
            id,
            element.tagName,
            attributes,
            children,
            false,
            children.length === 0
        );
    }

    private toXmlElement(): Element {
        const doc = document.implementation.createDocument(null, "", null);
        return this.nodeToElement(this.root, doc);
    }

    private nodeToElement(node: TreeNode, doc: Document): Element {
        if (node.isTextNode) {
            // Text nodes aren't real Elements; handled in parent
            throw new Error("Cannot create an Element from a text node directly.");
        }

        const el = doc.createElement(node.element);

        for (const [key, value] of Object.entries(node.attributes)) {
            if (key !== "textContent") {
                el.setAttribute(key, value);
            }
        }

        for (const child of node.getChildren()) {
            if (child.isTextNode) {
                const textNode = doc.createTextNode(child.attributes["textContent"] || "");
                el.appendChild(textNode);
            } else {
                el.appendChild(this.nodeToElement(child, doc));
            }
        }

        return el;
    }

    ////////////////////////////////////////////////////////////////////////
    // Events methods
    ////////////////////////////////////////////////////////////////////////

    onClick(e: MouseEvent): void {
        // This need to be overridden
    }

    onMouseover(e: MouseEvent): void {
        // This need to be overridden
    }

    onMouseout(e: MouseEvent): void {
        // This need to be overridden
    }
}

export class TreeNode {
    public readonly id: string | null; // xml:id
    public readonly element: string; // tag name
    public readonly attributes: Record<string, string>;

    public readonly isTextNode: boolean; // flag for text nodes
    public readonly isLeaf: boolean;

    private div: HTMLDivElement;
    private label: HTMLDivElement;
    private children: TreeNode[];

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

    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    public getDiv(): HTMLDivElement { return this.div; }

    public getLabel(): HTMLDivElement { return this.label; }

    public getChildren(): TreeNode[] { return this.children; }
    public setChildren(children: TreeNode[]) { this.children = children; }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    public reset(): void {
        this.children.forEach(child => child.reset());
        this.div.textContent = "";
    }

    public html(div: HTMLDivElement, tree: GenericTree, depth: number, hideLabel: boolean = false) {

        // There is a focus on an element. All ancestor be it will be displayed as bread crumbs
        if ((depth === 0) && !tree.isInFocus(this)) {
            tree.addCrumb(this.element, this.id);
            this.children.forEach(child => {
                // Display in the tree only ancestors of the focus elements
                if (tree.isAncestorOfFocus(child)) {
                    child.html(div, tree, depth, true);
                }
            });
            return;
        }

        this.div = div;
        if (this.isLeaf) this.div.classList.add("leaf");
        // If the maximum display depth is being reached, do not mark them as open
        if (this.children.length > 0 && depth < tree.getDisplayDepth()) this.div.classList.add("open");
        // Pass the id and element for the onClick
        this.div.dataset.id = this.id;
        this.div.dataset.element = this.element;
        this.label = appendDivTo(this.div, { class: `vrv-mei-element vrv-node-label` });
        if (hideLabel) {
            this.label.style.display = 'none';
            // This the label is hidden we want it as a bread crumb
            tree.addCrumb(this.element, this.id);
        }
        else {
            // Copy the dataset because both the node and the label fire an event
            this.label.dataset.id = this.div.dataset.id;
            this.label.dataset.element = this.div.dataset.element;
            tree.eventManager.bind(this.div, "click", tree.onClick);
            tree.eventManager.bind(this.div, "mouseover", tree.onMouseover);
            tree.eventManager.bind(this.div, "mouseout", tree.onMouseout);
            this.label.style.backgroundImage = `url(${App.iconFor(this.element)})`;
            if (tree.getFocusId() === this.id) {
                this.label.classList.add("target");
                this.label.classList.add("checked");
            }
        }
        let labelStr = this.element;
        if (this.attributes && this.attributes['n']) {
            labelStr += ` ${this.attributes['n']}`
        }
        this.label.textContent = labelStr;
        //let cb = appendInputTo(this.label, { type: `checkbox` });
        let children = appendDivTo(this.div, { class: `vrv-node-children` });

        // We have reached our maximum display depth
        if (depth >= tree.getDisplayDepth()) return;

        this.children.forEach(child => {
            let node = appendDivTo(children, { class: `vrv-tree-node` });
            child.html(node, tree, depth + 1);
        });
    }
}

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace GenericTree {

    export interface Object {
        element: string;
        id: string;
        children?: Object[];
        attributes?: Record<string, string>;
        text?: string;
        isLeaf: boolean;
    }
}
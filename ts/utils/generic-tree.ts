

import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';

import { appendDivTo } from './functions.js';

export class GenericTree extends GenericView {
    public readonly eventManager: EventManager;

    protected root: TreeNode | null;
    protected hiddenRoot: boolean;

    private rootElement: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);

        this.root = null;
        this.hiddenRoot = false;
        this.setDisplayFlex();

        this.eventManager = new EventManager(this);
    }

    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    public hasHiddenRoot(): boolean { return this.hiddenRoot; }
    public setHiddenRoot(hiddenRoot: boolean): void { this.hiddenRoot = hiddenRoot; }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

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
        this.root.html(this.rootElement, this, this.hiddenRoot);
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
        this.root.html(this.rootElement, this, this.hiddenRoot);
    }

    protected toXml(): string {
        if (!this.root) throw new Error("Tree is empty");

        const xmlElement = this.toXmlElement();
        const serializer = new XMLSerializer();
        return serializer.serializeToString(xmlElement);
    }

    // Generic depth-first traversal method
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

    // Generic finder function
    protected findSubtree(node: Object, predicate: (node: Object) => boolean): Object | null {
        if (predicate(node)) {
            return node;
        }

        if (Array.isArray(node['children'])) {
            for (const child of node['children']) {
                const result = this.findSubtree(child, predicate);
                if (result) return result;
            }
        }

        return null;
    }

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
        this.div.innerHTML = "";
    }

    public html(div: HTMLDivElement, tree: GenericTree, hideLabel: boolean = false) {
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
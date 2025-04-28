import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';
import { appendDivTo } from './functions.js';
export class GenericTree extends GenericView {
    constructor(div, app) {
        super(div, app);
        this.root = null;
        this.hiddenRoot = false;
        this.setDisplayFlex();
        this.eventManager = new EventManager(this);
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    hasHiddenRoot() { return this.hiddenRoot; }
    setHiddenRoot(hiddenRoot) { this.hiddenRoot = hiddenRoot; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    reset() {
        this.eventManager.unbindAll();
        if (this.root) {
            this.root.reset();
            this.rootElement.remove();
        }
        this.root = null;
    }
    collapseNode(id) {
        this.traverse((node) => {
            if (node.id === id) {
                if (!node.getDiv().classList.contains("open"))
                    return true;
                node.getDiv().classList.toggle("open");
                const children = node.getDiv().querySelector('.vrv-node-children');
                if (children)
                    children.remove();
                return true;
            }
            return false;
        });
    }
    fromJson(json) {
        if (!json || !json.element)
            throw new Error("Invalid JSON data: Missing 'element' property");
        this.root = this.buildTreeFromJson(json);
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.root.html(this.rootElement, this, this.hiddenRoot);
    }
    fromXml(xmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, "application/xml");
        // Check for parser error
        const parserError = doc.querySelector("parsererror");
        if (parserError)
            throw new Error("Invalid XML: " + parserError.textContent);
        const rootElement = doc.documentElement;
        this.root = this.buildTreeFromElement(rootElement);
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.root.html(this.rootElement, this, this.hiddenRoot);
    }
    toXml() {
        if (!this.root)
            throw new Error("Tree is empty");
        const xmlElement = this.toXmlElement();
        const serializer = new XMLSerializer();
        return serializer.serializeToString(xmlElement);
    }
    // Generic depth-first traversal method
    traverse(callback) {
        const visit = (node) => {
            if (callback(node)) {
                return true; // Stop if callback says so
            }
            for (const child of node.getChildren()) {
                if (visit(child))
                    return true;
            }
            return false;
        };
        visit(this.root);
    }
    // Generic finder function
    findSubtree(node, predicate) {
        if (predicate(node)) {
            return node;
        }
        if (Array.isArray(node['children'])) {
            for (const child of node['children']) {
                const result = this.findSubtree(child, predicate);
                if (result)
                    return result;
            }
        }
        return null;
    }
    buildTreeFromJson(nodeData) {
        const { id = null, element, attributes = {}, children = [], isTextNode = false, isLeaf = false } = nodeData;
        const node = new TreeNode(id, element, attributes, [], isTextNode, isLeaf);
        if (Array.isArray(children)) {
            node.setChildren(children.map((child) => this.buildTreeFromJson(child)));
        }
        return node;
    }
    buildTreeFromElement(element) {
        var _a;
        const attributes = {};
        for (let attr of Array.from(element.attributes)) {
            attributes[attr.name] = attr.value;
        }
        const children = [];
        for (let node of Array.from(element.childNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                children.push(this.buildTreeFromElement(node));
            }
            else if (node.nodeType === Node.TEXT_NODE) {
                const textContent = (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                if (textContent) {
                    children.push(new TreeNode(null, "#text", { textContent }, [], true, true));
                }
            }
        }
        const id = attributes["xml:id"] || null;
        return new TreeNode(id, element.tagName, attributes, children, false, children.length === 0);
    }
    toXmlElement() {
        const doc = document.implementation.createDocument(null, "", null);
        return this.nodeToElement(this.root, doc);
    }
    nodeToElement(node, doc) {
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
            }
            else {
                el.appendChild(this.nodeToElement(child, doc));
            }
        }
        return el;
    }
    ////////////////////////////////////////////////////////////////////////
    // Events methods
    ////////////////////////////////////////////////////////////////////////
    onClick(e) {
        // This need to be overridden
    }
    onMouseover(e) {
        // This need to be overridden
    }
    onMouseout(e) {
        // This need to be overridden
    }
}
export class TreeNode {
    constructor(id, element, attributes = {}, children = [], isTextNode = false, isLeaf = false) {
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
    getDiv() { return this.div; }
    getLabel() { return this.label; }
    getChildren() { return this.children; }
    setChildren(children) { this.children = children; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    reset() {
        this.children.forEach(child => child.reset());
        this.div.innerHTML = "";
    }
    html(div, tree, hideLabel = false) {
        this.div = div;
        if (this.isLeaf)
            this.div.classList.add("leaf");
        if (this.children.length > 0)
            this.div.classList.add("open");
        // Pass the id and element for the onClick
        this.div.dataset.id = this.id;
        this.div.dataset.element = this.element;
        this.label = appendDivTo(this.div, { class: `vrv-mei-element vrv-node-label` });
        if (hideLabel)
            this.label.style.display = 'none';
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
            labelStr += ` ${this.attributes['n']}`;
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
//# sourceMappingURL=generic-tree.js.map
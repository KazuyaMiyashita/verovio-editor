import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from './generic-view.js';
import { appendDivTo } from './functions.js';
export class GenericTree extends GenericView {
    constructor(div, app) {
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
    hasBreadCrumbs() { return this.useBreadCrumbs; }
    setBreadCrumbs() {
        this.useBreadCrumbs = true;
        this.breadCrumbsWrapper.style.display = 'block';
    }
    isInFocus(node) {
        if (!this.hasFocus() || this.id === this.focusId)
            return true;
        for (const child of node['children'])
            if (child.id === this.focusId)
                return true;
        return false;
    }
    hasFocus() { return (this.focusId.length > 0); }
    isAncestorOfFocus(node) {
        return (this.isAncestorOf(node, this.focusId) !== null);
    }
    isDescendantOfFocus(node) {
        const focusNode = this.findInSubtree(this.root, (node) => node.id === this.focusId);
        return (this.isAncestorOf(focusNode, node.id) !== null);
    }
    isAncestorOf(node, id) {
        return this.findInSubtree(node, (node) => node.id === id);
    }
    getDisplayDepth() { return this.displayDepth; }
    getFocusId() { return this.focusId; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    resetFocus() { this.focusId = ""; }
    applyFocus(id) {
        this.eventManager.unbindAll();
        this.rootElement.remove();
        this.rootElement = appendDivTo(this.div, { class: `vrv-tree-root` });
        this.clearCrumbs();
        this.focusId = id;
        // We we select the root (from the crumb) reset to ""
        if (this.root.id === id)
            this.focusId = "";
        // Rebuild the html tree
        this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
        this.breadCrumbsWrapper.scrollLeft = this.breadCrumbsWrapper.scrollWidth;
    }
    addCrumb(element, id) {
        const crumb = appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        crumb.textContent = element;
        crumb.dataset.id = id;
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
    }
    clearCrumbs() {
        // Reset the crumbs
        this.breadCrumbs.textContent = "";
        appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
    }
    reset() {
        this.eventManager.unbindAll();
        if (this.root) {
            this.root.reset();
            this.rootElement.remove();
        }
        this.clearCrumbs();
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
                    children.style.display = 'none';
                return true;
            }
            return false;
        });
    }
    expandNode(id) {
        this.traverse((node) => {
            if (node.id === id) {
                if (node.getDiv().classList.contains("open"))
                    return true;
                node.getDiv().classList.toggle("open");
                const children = node.getDiv().querySelector('.vrv-node-children');
                if (children)
                    children.style.display = 'block';
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
        this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
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
        this.root.html(this.rootElement, this, 0, this.useBreadCrumbs);
    }
    toXml() {
        if (!this.root)
            throw new Error("Tree is empty");
        const xmlElement = this.toXmlElement();
        const serializer = new XMLSerializer();
        return serializer.serializeToString(xmlElement);
    }
    ////////////////////////////////////////////////////////////////////////
    // Methods to traverse the tree and find nodes (from a specific node)
    ////////////////////////////////////////////////////////////////////////
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
    findInSubtree(node, predicate) {
        if (predicate(node)) {
            return node;
        }
        if (Array.isArray(node['children'])) {
            for (const child of node['children']) {
                const result = this.findInSubtree(child, predicate);
                if (result)
                    return result;
            }
        }
        return null;
    }
    ////////////////////////////////////////////////////////////////////////
    // Methods to build or output trees
    ////////////////////////////////////////////////////////////////////////
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
        if (this.div)
            this.div.textContent = "";
    }
    html(div, tree, depth, hideLabel = false) {
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
        if (this.isLeaf)
            this.div.classList.add("leaf");
        // If the maximum display depth is being reached, or the node is not in the focus subtree, do not mark them as open
        const isInFocusSubtree = (!tree.hasFocus() || tree.isAncestorOfFocus(this) || tree.isDescendantOfFocus(this));
        if (this.children.length > 0 && depth < tree.getDisplayDepth() && isInFocusSubtree)
            this.div.classList.add("open");
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
            labelStr += ` ${this.attributes['n']}`;
        }
        this.label.textContent = labelStr;
        //let cb = appendInputTo(this.label, { type: `checkbox` });
        let children = appendDivTo(this.div, { class: `vrv-node-children` });
        // We have reached our maximum display depth, or the node is not in the focus subtree
        if (depth >= tree.getDisplayDepth() || !isInFocusSubtree)
            return;
        this.children.forEach(child => {
            let node = appendDivTo(children, { class: `vrv-tree-node` });
            child.html(node, tree, depth + 1);
        });
    }
}
//# sourceMappingURL=generic-tree.js.map
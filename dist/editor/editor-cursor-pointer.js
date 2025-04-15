/**
 * The EditorCursorPointer class
 */
;
export class EditorCursorPointer {
    constructor(editorView) {
        // EditorView object
        this.editorViewObj = editorView;
        this.activated = false;
        this.pixPerPix = 0;
        this.viewTop = 0;
        this.viewLeft = 0;
        this.lastEvent = null;
        this.scrollTop = 0;
        this.scrollLeft = 0;
        this.elementClass = '';
        this.elementId = '';
        this.elementType = '';
        this.staffNode = null;
        this.elementX = 0;
        this.elementY = 0;
        this.selectedItems = [];
        this.initX = 0;
        this.initY = 0;
        this.marginLeft = 0;
        this.marginTop = 0;
        this.MEIUnit = 90;
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    setLastEvent(lastEvent) { this.lastEvent = lastEvent; }
    getLastEvent() { return this.lastEvent; }
    setScrollTop(scrollTop) { this.scrollTop = scrollTop; }
    setScrollLeft(scrollLeft) { this.scrollLeft = scrollLeft; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    xToMEI(x) {
        return Math.round(x - this.viewLeft + this.scrollLeft) * this.pixPerPix - this.marginLeft;
    }
    yToMEI(y) {
        return Math.round((y - this.viewTop + this.scrollTop) * this.pixPerPix - this.marginTop);
    }
    xToView(x) {
        return (x + this.marginLeft) / this.pixPerPix - this.scrollLeft + this.viewLeft;
    }
    yToView(y) {
        return (y + this.marginTop) / this.pixPerPix - this.scrollTop + this.viewTop;
    }
    init(svgRoot, top, left) {
        const svgViewBox = svgRoot.querySelector('svg');
        const actualSizeArr = svgViewBox.getAttribute('viewBox').split(' ');
        const actualHeight = parseInt(actualSizeArr[3]);
        const svgHeight = parseInt(svgRoot.getAttribute('height'));
        // get the margins
        this.marginLeft = 0;
        this.marginTop = 0;
        try {
            const g = svgViewBox.querySelector('g.page-margin');
            const transform = g.getAttribute('transform');
            const regexp = /translate\((\d*),\ (\d*)/g;
            const match = regexp.exec(transform);
            this.marginLeft = Number(match[1]);
            this.marginTop = Number(match[2]);
        }
        catch (err) {
            console.debug("Loading margin failed");
        }
        this.pixPerPix = (actualHeight / svgHeight);
        this.viewTop = top;
        this.viewLeft = left;
    }
    initEvent(event, id, node) {
        this.selectedItems = [];
        this.add(id, node);
        if (this.selectedItems.length === 0) {
            return;
        }
        this.activated = true;
        this.initStaff(node);
        this.initX = this.xToMEI(event.pageX);
        this.initY = this.yToMEI(event.pageY);
    }
    initStaff(node) {
        this.staffNode = this.editorViewObj.getClosestMEIElement(node, "staff");
        if (!this.staffNode)
            return;
        let staffLines = this.staffNode.querySelectorAll('g.staff > path');
        if (staffLines.length === 0)
            return;
        try {
            const d1 = staffLines[0].getAttribute('d');
            const regexp1 = /M\d*\ (\d*)/g;
            const match1 = regexp1.exec(d1);
            let topLine = Number(match1[1]);
            const d2 = staffLines[staffLines.length - 1].getAttribute('d');
            const regexp2 = /M\d*\ (\d*)/g;
            const match2 = regexp2.exec(d2);
            let bottomLine = Number(match2[1]);
            if (staffLines.length > 1) {
                this.MEIUnit = (bottomLine - topLine) / (staffLines.length - 1) / 2;
            }
        }
        catch (err) {
            console.debug("Loading staff line position failed");
        }
    }
    add(id, node, clicked = true) {
        let positionNode = node;
        if (node.classList.contains('note') || node.classList.contains('rest')) {
            positionNode = node.querySelector('use');
        }
        if (!positionNode) {
            console.debug("Cannot find node with dragging position");
            return;
        }
        let item = {
            elementType: node.classList[0],
            elementId: id,
            elementX: parseInt(positionNode.getAttribute('x')),
            elementY: parseInt(positionNode.getAttribute('y'))
        };
        this.selectedItems.push(item);
        if (!clicked)
            return;
        this.elementId = item.elementId;
        this.elementType = item.elementType;
        this.elementX = item.elementX;
        this.elementY = item.elementY;
        let children = node.querySelectorAll('g:not(.bounding-box):not(.ledgerLines):not(.articPart):not(.notehead):not(.dots):not(.flag):not(.stem)');
        for (let child of children) {
            const element = child;
            const childId = element.getAttribute(id);
            this.add(childId, element, false);
        }
        //console.debug( this.selectedItems );
    }
    distFromLastEvent() {
        let x = this.xToMEI(this.lastEvent.pageX);
        let y = this.yToMEI(this.lastEvent.pageY);
        return [x - this.initX, y - this.initY];
    }
}
//# sourceMappingURL=editor-cursor-pointer.js.map
/**
 * The EditorCursorPointer class
 */

import { EditorView } from './editor-view.js';

interface SelectedItem {
    elementType: string,
    elementId: string,
    elementX: number,
    elementY: number,
};

export class EditorCursorPointer {
    private editorViewObj: EditorView;

    activated: boolean;

    private pixPerPix: number;
    private viewTop: number;
    private viewLeft: number;
    
    lastEvent: any;
    scrollTop: number;
    scrollLeft: number;

    private elementClass: string;
    private elementId: string;
    private elementType: string;
    private staffNode: SVGElement;

    elementX: number;
    elementY: number;

    selectedItems: Array<SelectedItem>;

    currentX: number;
    currentY: number;

    private fixedX: boolean;
    private fixedY: boolean;
    private forceOnPitch: boolean;

    private marginLeft: number;
    private marginTop: number;

    private MEIUnit: number;
    private lastPitchLine: any;

    private topLine: number;
    private bottomLine: number;

    constructor(editorView: EditorView) {
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

        this.currentX = 0;
        this.currentY = 0;

        this.fixedX = true;
        this.fixedY = false;
        this.forceOnPitch = true;

        this.marginLeft = 0;
        this.marginTop = 0;

        this.MEIUnit = 90;
        this.lastPitchLine = null;

        this.topLine = null;
        this.bottomLine = null;
    }

    xToMEI(x: number): number {
        return Math.round(x - this.viewLeft + this.scrollLeft) * this.pixPerPix - this.marginLeft;
    }

    yToMEI(y: number): number {
        return Math.round((y - this.viewTop + this.scrollTop) * this.pixPerPix - this.marginTop);
    }

    xToView(x: number): number {
        return (x + this.marginLeft) / this.pixPerPix - this.scrollLeft + this.viewLeft;
    }

    yToView(y: number): number {
        return (y + this.marginTop) / this.pixPerPix - this.scrollTop + this.viewTop;
    }

    init(svgRoot: SVGElement, top: number, left: number): void {
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

    initEvent(event: MouseEvent, id: string, node: SVGElement): void {
        this.selectedItems = [];

        this.add(id, node);

        if (this.selectedItems.length === 0) {
            return;
        }

        this.activated = true;

        this.lastPitchLine = null;

        this.initStaff(node);
    }

    initStaff(node: SVGElement): void {
        this.staffNode = this.editorViewObj.getClosestMEIElement(node, "staff");

        if (!this.staffNode) return;

        let staffLines = this.staffNode.querySelectorAll('g.staff > path');

        if (staffLines.length === 0) return;

        this.topLine = null;
        this.bottomLine = null;
        try {
            const d1 = staffLines[0].getAttribute('d');
            const regexp1 = /M\d*\ (\d*)/g;
            const match1 = regexp1.exec(d1);
            this.topLine = Number(match1[1]);

            const d2 = staffLines[staffLines.length - 1].getAttribute('d');
            const regexp2 = /M\d*\ (\d*)/g;
            const match2 = regexp2.exec(d2);
            this.bottomLine = Number(match2[1]);

            if (staffLines.length > 1) {
                this.MEIUnit = (this.bottomLine - this.topLine) / (staffLines.length - 1) / 2;
            }
        }
        catch (err) {
            console.debug("Loading staff line position failed");
        }
    }

    add(id: string, node: SVGElement, clicked: boolean = true): void {
        let positionNode: SVGElement = node;
        if (node.classList.contains('note') || node.classList.contains('rest')) {
            positionNode = node.querySelector('use');
        }

        if (!positionNode) {
            console.debug("Cannot find node with dragging position")
            return;
        }

        let item: SelectedItem = {
            elementType: node.classList[0],
            elementId: id,
            elementX: parseInt(positionNode.getAttribute('x')),
            elementY: parseInt(positionNode.getAttribute('y'))
        }

        this.selectedItems.push(item);

        if (!clicked) return;

        this.elementId = item.elementId;
        this.elementType = item.elementType;
        this.elementX = item.elementX;
        this.elementY = item.elementY;

        let children = node.querySelectorAll('g:not(.bounding-box):not(.ledgerLines):not(.articPart):not(.notehead):not(.dots):not(.flag):not(.stem)');
        for (let child of children) {
            const element = child as SVGElement;
            const childId: string = element.getAttribute(id);
            this.add(childId, element, false);
        }

        //console.debug( this.selectedItems );
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    moveToLastEvent(): void {
        this.currentX = this.xToMEI(this.lastEvent.pageX);
        this.currentY = this.yToMEI(this.lastEvent.pageY);

        if (this.forceOnPitch && this.topLine) {
            this.currentY = this.currentY - ((this.currentY - this.topLine) % this.MEIUnit);
            this.lastPitchLine = this.currentY;
        }
    }

    staffEnter(staffNode: SVGElement): void {
        if (!this.staffNode) {
            return;
        }
        else if (this.staffNode !== staffNode) {
            this.activated = false;
        }
        else if (!this.activated) {
            this.activated = true;
            this.moveToLastEvent();
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
}

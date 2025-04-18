/**
 * The EditorCursorPointer class
 */

import { EditorView } from './editor-view.js';

export class EditorCursorPointer {
    private readonly editorViewObj: EditorView;

    private activated: boolean;

    private pixPerPix: number;
    private viewTop: number;
    private viewLeft: number;
    
    private lastEvent: MouseEvent;
    private scrollTop: number;
    private scrollLeft: number;

    private staffNode: SVGElement;

    private initX: number;
    private initY: number;

    private marginLeft: number;
    private marginTop: number;

    private MEIUnit: number;

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

        this.staffNode = null;

        this.initX = 0;
        this.initY = 0;

        this.marginLeft = 0;
        this.marginTop = 0;

        this.MEIUnit = 90;
    }

    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    setLastEvent(lastEvent: MouseEvent): void { this.lastEvent = lastEvent; }
    
    getLastEvent(): MouseEvent { return this.lastEvent; }
    
    setScrollTop(scrollTop: number): void { this.scrollTop = scrollTop; }
    
    setScrollLeft(scrollLeft: number): void { this.scrollLeft = scrollLeft; }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

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

    initEvent(event: MouseEvent, node: SVGElement): void {
        this.editorViewObj.clearSelection();

        this.editorViewObj.addNodeToSelection(node);

        if (!this.editorViewObj.hasSelection()) return;

        this.activated = true;

        this.initStaff(node);

        this.initX = this.xToMEI(event.pageX);
        this.initY = this.yToMEI(event.pageY);
    }

    initStaff(node: SVGElement): void {
        this.staffNode = this.editorViewObj.getClosestMEIElement(node, "staff");

        if (!this.staffNode) return;

        let staffLines = this.staffNode.querySelectorAll('g.staff > path');

        if (staffLines.length === 0) return;

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

    distFromLastEvent(): [number, number] {
        let x = this.xToMEI(this.lastEvent.pageX);
        let y = this.yToMEI(this.lastEvent.pageY);
        return [x - this.initX, y - this.initY];
    }
}

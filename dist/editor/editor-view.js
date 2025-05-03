/**
 * The EditorView class implements editor interactions, such as selecting and dragging.
 * It uses a responsive layout.
 */
import { ActionManager } from '../events/action-manager.js';
import { EditorCursorPointer } from './editor-cursor-pointer.js';
import { ResponsiveView } from '../verovio/responsive-view.js';
import { appendDivTo, appendMidiPlayerTo } from '../utils/functions.js';
import { midiScale } from '../midi/midi-scale.js';
;
export class EditorView extends ResponsiveView {
    constructor(div, app, verovio) {
        super(div, app, verovio);
        this.midiPlayerElement = appendMidiPlayerTo(this.div, {});
        this.midiPlayerElement.setAttribute('src', midiScale);
        // add the svgOverlay for dragging
        this.svgOverlay = appendDivTo(this.div, { class: `vrv-svg-overlay`, style: { position: `absolute` } });
        this.cursorPointerObj = new EditorCursorPointer(this);
        // synchronized scrolling between svg overlay and wrapper
        this.eventManager.bind(this.svgOverlay, 'scroll', this.scrollListener);
        this.eventManager.bind(this.svgOverlay, 'mouseleave', this.mouseLeaveListener);
        this.eventManager.bind(this.svgOverlay, 'mouseenter', this.mouseEnterListener);
        // For dragging
        this.mouseMoveTimer = false;
        this.draggingActive = false;
        this.mouseOverId = "";
        // For note playback
        this.lastNote = { midiPitch: 0, oct: "", pname: "" };
        // EditorAction
        this.actionManager = new ActionManager(this, app);
        this.selectedItems = [];
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    initCursor() {
        const svgRoot = this.svgWrapper.querySelector('svg');
        if (!svgRoot)
            return;
        const top = this.div.getBoundingClientRect().top;
        const left = this.div.getBoundingClientRect().left;
        this.cursorPointerObj.init(svgRoot, top, left);
    }
    ////////////////////////////////////////////////////////////////////////
    // Overriding methods
    ////////////////////////////////////////////////////////////////////////
    updateSVGDimensions() {
        super.updateSVGDimensions();
        if (this.svgOverlay) {
            this.svgOverlay.style.height = this.svgWrapper.style.height;
            this.svgOverlay.style.width = this.svgWrapper.style.width;
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async renderPage(lightEndLoading = false, createOverlay = true) {
        const svg = await this.verovio.renderToSVG(this.currentPage);
        this.svgWrapper.innerHTML = svg;
        this.initCursor();
        // create the overlay if necessary
        if (createOverlay) {
            this.createOverlay();
        }
        //  make sure highlights are up to date
        this.highlightSelected();
        if (lightEndLoading)
            this.app.endLoading(true);
    }
    async select(element, id) {
        this.highlightMouseOverReset();
        const pageWithElement = await this.verovio.getPageWithElement(id);
        if ((pageWithElement > 0) && (pageWithElement != this.currentPage)) {
            this.currentPage = pageWithElement;
            let event = new CustomEvent('onPage');
            this.app.customEventManager.dispatch(event);
            ;
        }
        this.addToSelection(element, id);
    }
    async playNoteSound() {
        const attr = await this.app.verovio.getElementAttr(this.selectedItems[0].id);
        if (!attr.pname || !attr.oct)
            return;
        if ((this.lastNote.pname === attr.pname) && (this.lastNote.oct === attr.oct))
            return;
        this.lastNote.pname = attr.pname;
        this.lastNote.oct = attr.oct;
        var midiBase = 0;
        switch (attr.pname) {
            case 'd':
                midiBase = 2;
                break;
            case 'e':
                midiBase = 4;
                break;
            case 'f':
                midiBase = 5;
                break;
            case 'g':
                midiBase = 7;
                break;
            case 'a':
                midiBase = 9;
                break;
            case 'b':
                midiBase = 11;
                break;
        }
        if (attr.accid) {
            if (attr.accid == 'f')
                midiBase--;
            else if (attr.accid == 's')
                midiBase++;
        }
        let midiPitch = midiBase + (parseInt(attr.oct)) * 12;
        if (midiPitch < 0 || midiPitch > 96)
            return;
        if (this.lastNote.midiPitch === midiPitch)
            return;
        this.lastNote.midiPitch = midiPitch;
        // Limit the range to playable notes
        if (midiPitch > 107)
            return;
        if (midiPitch < 21)
            return;
        this.midiPlayerElement.stop();
        this.midiPlayerElement.currentTime = ((midiPitch - 21) * 0.5);
        this.midiPlayerElement.start();
        setTimeout(() => {
            this.midiPlayerElement.stop();
        }, 500);
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    clearSelection() {
        this.highlightSelectedReset();
        this.selectedItems = [];
    }
    hasSelection() {
        return (this.scrollListener.length > 0);
    }
    getSelection() {
        return this.selectedItems;
    }
    addNodeToSelection(node) {
        let positionNode = node;
        if (node.classList.contains('note') || node.classList.contains('rest')) {
            positionNode = node.querySelector('use');
        }
        if (!positionNode) {
            console.debug("Cannot find node with dragging position");
            return;
        }
        let x = null;
        let y = null;
        if (positionNode.hasAttribute('transform')) {
            const match = positionNode.getAttribute('transform').match(/translate\(\s*([^\s,]+)[,\s]+([^\s\)]+)\)/);
            if (match) {
                x = parseInt(match[1]);
                y = parseInt(match[2]);
            }
        }
        this.addToSelection(node.classList[0], node.id, x, y);
    }
    addToSelection(element, id, x = null, y = null) {
        let item = {
            element: element,
            id: id,
            x: x,
            y: y
        };
        this.selectedItems.push(item);
        this.highlightSelected();
    }
    getClosestMEIElement(node, elementType = null) {
        if (!node) {
            return null;
        }
        else if (node.nodeName != "g" || node.classList.contains('bounding-box') || node.classList.contains('notehead')) {
            return this.getClosestMEIElement(node.parentNode, elementType);
        }
        else if (elementType && !node.classList.contains(elementType)) {
            return this.getClosestMEIElement(node.parentNode, elementType);
        }
        else {
            return node;
        }
    }
    createOverlay() {
        // Copy wrapper HTML to overlay
        this.svgOverlay.innerHTML = this.svgWrapper.innerHTML;
        // Remove all the bounding boxes from the original wrapper because we do not want to highlight them
        Array.from(this.svgWrapper.querySelectorAll('g.bounding-box')).forEach(node => {
            node.parentNode.removeChild(node);
        });
        // Make all /g, /path and /text transparent
        Array.from(this.svgOverlay.querySelectorAll('g, path, text, polyline')).forEach(node => {
            node.style.stroke = 'transparent';
            node.style.fill = 'transparent';
        });
        // Remove bounding boxes for /slur and /tie
        Array.from(this.svgOverlay.querySelectorAll('.slur.bounding-box, .tie.bounding-box')).forEach(node => {
            node.parentNode.removeChild(node);
        });
        // Increase border for facilitating selection of some elements
        Array.from(this.svgOverlay.querySelectorAll('.slur path, .tie path, .stem rect, .dots ellipse, .barLineAttr path')).forEach(node => {
            //node.style.stroke = 'red';
            node.style.strokeWidth = "90"; // A default MEI unit
        });
        // Add event listeners for click on /g
        Array.from(this.svgOverlay.querySelectorAll('g')).forEach(node => {
            this.eventManager.bind(node, 'mousedown', this.mouseDownListener);
        });
        Array.from(this.svgOverlay.querySelectorAll('g.staff')).forEach(node => {
            this.eventManager.bind(node, 'mouseenter', this.mouseEnterListener);
        });
        // Add an event listener to the overlay of note input
        this.eventManager.bind(this.svgOverlay, 'mousedown', this.mouseDownListener);
        this.highlightSelected();
    }
    highlightMouseOver(id) {
        this.highlightMouseOverReset();
        let element = this.svgWrapper.querySelector('#' + id);
        if (element) {
            element.style.filter = "url(#highlighting)";
            this.mouseOverId = id;
        }
    }
    highlightMouseOverReset() {
        if (this.mouseOverId !== "") {
            let element = this.svgWrapper.querySelector('#' + this.mouseOverId);
            if (element)
                element.style.filter = '';
        }
        this.mouseOverId = "";
    }
    highlightSelected() {
        if (this.selectedItems.length === 1) {
            this.playNoteSound();
        }
        for (const item of this.selectedItems) {
            // Set the wrapper instance to be red
            this.highlightWithColor(this.svgWrapper.querySelector('#' + item.id), '#cd0000');
        }
    }
    highlightSelectedReset() {
        for (const item of this.selectedItems) {
            // Remove the color with and empty color string
            this.highlightWithColor(this.svgWrapper.querySelector('#' + item.id), '');
        }
    }
    highlightWithColor(g, color) {
        if (!g)
            return;
        for (const node of Array.from(g.querySelectorAll('*:not(g)'))) {
            const parent = node.parentNode;
            // Do not highlight bounding box elements
            if (parent.classList.contains('bounding-box'))
                continue;
            const el = node;
            el.style.fill = color;
            el.style.stroke = color;
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onCursorActivity(e) {
        if (!super.onCursorActivity(e))
            return false;
        //console.debug("EditorView::onMouseover");
        if (e.detail.id === "[unspecified]")
            return false;
        if (e.detail.activity === 'mouseover') {
            this.highlightSelectedReset();
            this.highlightMouseOver(e.detail.id);
        }
        else if (e.detail.activity === 'mouseout') {
            this.highlightMouseOverReset();
            this.highlightSelected();
        }
        return true;
    }
    onEndLoading(e) {
        if (!super.onEndLoading(e))
            return false;
        //console.debug("EditorView::onEndLoading");
        this.initCursor();
        return true;
    }
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        //console.debug("EditorView::onSelect");
        this.clearSelection();
        if (e.detail.id === "[unspecified]")
            return false;
        this.select(e.detail.element, e.detail.id);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////
    keyDownListener(e) {
        // For now only up and down arrows
        if (e.keyCode === 38 || e.keyCode === 40) {
            this.actionManager.keyDown(e.keyCode, e.shiftKey, e.ctrlKey);
        }
        else if (e.keyCode === 8 || e.keyCode === 46) {
            //this.actionManager.delete();
        }
        e.preventDefault();
    }
    keyUpListener(e) {
        // For now only up and down arrows
        if (e.keyCode === 38 || e.keyCode === 40) {
            this.actionManager.keyUp(e.keyCode, e.shiftKey, e.ctrlKey);
        }
        else if (e.keyCode === 8 || e.keyCode === 46) {
            //this.actionManager.delete();
        }
        e.preventDefault();
    }
    mouseDownListener(e) {
        this.draggingActive = false;
        this.lastNote = { midiPitch: 0, oct: "", pname: "" };
        e.stopPropagation();
        // Clicking on the overlay - nothing to do
        if (e.target.parentNode === this.svgOverlay) {
            return;
        }
        // Get MEI element
        let node = this.getClosestMEIElement(e.target);
        if (!node || !node.id) {
            console.log(node, "MEI element not found or with no id");
            return; // this should never happen, but as a safety 
        }
        // Multiple selection - add it to the cursor
        if (this.hasSelection() && e.shiftKey) {
            this.addNodeToSelection(node);
            document.addEventListener('mousemove', this.boundMouseMove);
            document.addEventListener('mouseup', this.boundMouseUp);
            return;
        }
        // More to reset here?
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('touchmove', this.boundMouseMove);
        let event = new CustomEvent('onSelect', {
            detail: {
                id: node.id,
                elementType: node.classList[0],
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
        this.cursorPointerObj.initEvent(e, node);
        // we haven't started to drag yet, this might be just a selection
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        document.addEventListener('touchmove', this.boundMouseMove);
        document.addEventListener('touchend', this.boundMouseUp);
    }
    ;
    mouseEnterListener(e) {
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);
        //console.debug( "Hey!" );
    }
    mouseLeaveListener(e) {
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchend', this.boundMouseUp);
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('touchmove', this.boundMouseMove);
        document.removeEventListener('keydown', this.boundKeyDown);
        document.removeEventListener('keyup', this.boundKeyUp);
    }
    mouseMoveListener(e) {
        // Fire drag event only every 50ms
        if (!this.mouseMoveTimer) {
            const timerThis = this;
            this.cursorPointerObj.setLastEvent(e);
            this.mouseMoveTimer = true;
            setTimeout(function () {
                timerThis.mouseMoveTimer = false;
                if (timerThis.cursorPointerObj.getLastEvent().buttons == 1) {
                    let dist = timerThis.cursorPointerObj.distFromLastEvent();
                    timerThis.draggingActive = true; // we know we're dragging if this listener triggers
                    timerThis.actionManager.drag(0, dist[1]);
                }
            }, 50);
        }
        e.stopPropagation();
    }
    ;
    mouseUpListener(e) {
        //console.debug( "EditorView::mouseUpListener" );
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchend', this.boundMouseUp);
        if (this.draggingActive === true) {
            this.draggingActive = false;
            document.removeEventListener('mousemove', this.boundMouseMove);
            document.removeEventListener('touchmove', this.boundMouseMove);
            const timerThis = this;
            // Since we are waiting to trigger the mousemove events, we also need to delay the mouseup
            setTimeout(function () {
                timerThis.clearSelection();
                timerThis.actionManager.commit(this);
            }, 80);
        }
    }
    scrollListener(e) {
        let element = e.target;
        this.cursorPointerObj.setScrollTop(element.scrollTop);
        this.cursorPointerObj.setScrollLeft(element.scrollLeft);
        this.svgWrapper.scrollTop = element.scrollTop;
        this.svgWrapper.scrollLeft = element.scrollLeft;
    }
}
//# sourceMappingURL=editor-view.js.map
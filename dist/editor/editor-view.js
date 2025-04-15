/**
 * The EditorView class implements editor interactions, such as selecting and dragging.
 * It uses a responsive layout.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionManager } from '../events/action-manager.js';
import { EditorCursorPointer } from './editor-cursor-pointer.js';
import { ResponsiveView } from '../verovio/responsive-view.js';
import { appendDivTo, appendMidiPlayerTo } from '../utils/functions.js';
import { midiScale } from '../midi/midi-scale.js';
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
        this.highlightIdsCache = [];
        this.mouseOverId = "";
        // For note playback
        this.lastNote = { midiPitch: 0, oct: "", pname: "" };
        // EditorAction
        this.actionManager = new ActionManager(this);
    }
    ////////////////////////////////////////////////////////////////////////
    // Overwriting methods
    ////////////////////////////////////////////////////////////////////////
    updateSVGDimensions() {
        super.updateSVGDimensions();
        if (this.svgOverlay) {
            this.svgOverlay.style.height = this.svgWrapper.style.height;
            this.svgOverlay.style.width = this.svgWrapper.style.width;
        }
    }
    initCursor() {
        const svgRoot = this.svgWrapper.querySelector('svg');
        if (!svgRoot)
            return;
        const top = this.div.getBoundingClientRect().top;
        const left = this.div.getBoundingClientRect().left;
        this.cursorPointerObj.init(svgRoot, top, left);
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    renderPage() {
        return __awaiter(this, arguments, void 0, function* (lightEndLoading = false, createOverlay = true) {
            const svg = yield this.verovio.renderToSVG(this.currentPage);
            this.svgWrapper.innerHTML = svg;
            this.initCursor();
            // create the overlay if necessary
            if (createOverlay) {
                this.createOverlay();
            }
            //  make sure highlights are up to date
            this.reapplyHighlights();
            if (lightEndLoading)
                this.app.endLoading(true);
        });
    }
    updateMEI() {
        return __awaiter(this, void 0, void 0, function* () {
            const mei = yield this.verovio.getMEI({});
            this.app.mei = mei;
            let event = new CustomEvent('onUpdateData', {
                detail: {
                    currentId: this.currentId,
                    caller: this
                }
            });
            this.app.customEventManager.dispatch(event);
        });
    }
    setCurrent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.resetHighlights();
            this.resetMouseOverHighlight();
            this.currentId = id;
            const pageWithElement = yield this.verovio.getPageWithElement(id);
            if ((pageWithElement > 0) && (pageWithElement != this.currentPage)) {
                this.currentPage = pageWithElement;
                let event = new CustomEvent('onPage');
                this.app.customEventManager.dispatch(event);
                ;
            }
            this.activateHighlight(id);
        });
    }
    playNoteSound() {
        return __awaiter(this, void 0, void 0, function* () {
            const attr = yield this.app.verovio.getElementAttr(this.highlightIdsCache[0]);
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
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    createOverlay() {
        // Copy wrapper HTML to overlay
        this.svgOverlay.innerHTML = this.svgWrapper.innerHTML;
        // Remove all the bounding boxes from the original wrapper because we do not want to highlight them
        for (const node of this.svgWrapper.querySelectorAll('g.bounding-box')) {
            node.parentNode.removeChild(node);
        }
        // Make all /g, /path and /text transparent
        for (const node of this.svgOverlay.querySelectorAll('g, path, text, polyline')) {
            node.style.stroke = 'transparent';
            node.style.fill = 'transparent';
        }
        // Remove bouding boxes for /slur and /tie
        for (const node of this.svgOverlay.querySelectorAll('.slur.bounding-box, .tie.bounding-box')) {
            node.parentNode.removeChild(node);
        }
        // Increase border for facilitating selection of some elements
        for (const node of this.svgOverlay.querySelectorAll('.slur path, .tie path, .stem rect, .dots ellipse, .barLineAttr path')) {
            //node.style.stroke = 'red';
            node.style.strokeWidth = "90"; // A default MEI unit
        }
        // Add event listeners for click on /g
        for (const node of this.svgOverlay.querySelectorAll('g')) {
            this.eventManager.bind(node, 'mousedown', this.mouseDownListener);
        }
        for (const node of this.svgOverlay.querySelectorAll('g.staff')) {
            this.eventManager.bind(node, 'mouseenter', this.mouseEnterListener);
        }
        // Add an event listener to the overlay of note input
        this.eventManager.bind(this.svgOverlay, 'mousedown', this.mouseDownListener);
        this.reapplyHighlights();
    }
    mouseOverHighlight(id) {
        this.resetMouseOverHighlight();
        let element = this.svgWrapper.querySelector('#' + id);
        if (element) {
            element.style.filter = "url(#highlighting)";
            this.mouseOverId = id;
        }
    }
    resetMouseOverHighlight() {
        if (this.mouseOverId !== "") {
            let element = this.svgWrapper.querySelector('#' + this.mouseOverId);
            if (element)
                element.style.filter = '';
        }
        this.mouseOverId = "";
    }
    activateHighlight(id) {
        if (this.highlightIdsCache.indexOf(id) === -1) {
            this.highlightIdsCache.push(id);
        }
        this.reapplyHighlights();
    }
    reapplyHighlights() {
        if (this.highlightIdsCache.length === 1) {
            this.playNoteSound();
        }
        for (const id of this.highlightIdsCache) {
            // Set the wrapper instance to be red
            this.highlightWithColor(this.svgWrapper.querySelector('#' + id), '#cd0000');
        }
    }
    resetHighlights() {
        for (const id of this.highlightIdsCache) {
            // Remove the color with and empty color string
            this.highlightWithColor(this.svgWrapper.querySelector('#' + id), '');
        }
        this.highlightIdsCache.length = 0;
    }
    highlightWithColor(g, color) {
        if (!g)
            return;
        for (const node of g.querySelectorAll('*:not(g)')) {
            // Do not highlight bounding boxes elements
            if (node.parentNode.classList.contains('bounding-box'))
                continue;
            node.style.fill = color;
            node.style.stroke = color;
        }
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
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onCursorActivity(e) {
        if (!super.onCursorActivity(e))
            return false;
        //console.debug("EditorView::onMouseover");
        if (e.detail.activity === 'mouseover') {
            this.resetHighlights();
            this.mouseOverHighlight(e.detail.id);
        }
        else if (e.detail.activity === 'mouseout') {
            this.resetMouseOverHighlight();
            this.activateHighlight(this.currentId);
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
        this.setCurrent(e.detail.id);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////
    keyDownListener(e) {
        //this.app.startLoading( "Editing...", true );
        //document.removeEventListener( 'keydown', this.boundKeyDown );
        // For now only up and down arrows
        if (e.keyCode === 38 || e.keyCode === 40) {
            this.actionManager.keyDown(e.keyCode, e.shiftKey, e.ctrlKey);
        }
        else if (e.keyCode === 8 || e.keyCode === 46) {
            this.actionManager.delete();
        }
        //document.addEventListener( 'keydown', this.boundKeyDown );
        //this.app.endLoading( true );
        e.preventDefault();
    }
    mouseDownListener(e) {
        this.draggingActive = false;
        this.lastNote = { midiPitch: 0, oct: "", pname: "" };
        e.cancelBubble = true;
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
        const id = node.id;
        // Multiple selection - add it to the cursor
        if (e.shiftKey) {
            this.activateHighlight(id);
            this.cursorPointerObj.add(id, node);
            document.addEventListener('mousemove', this.boundMouseMove);
            document.addEventListener('mouseup', this.boundMouseUp);
            return;
        }
        // More to reset here?
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('touchmove', this.boundMouseMove);
        this.currentId = id;
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                elementType: node.classList[0],
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
        this.resetHighlights();
        this.activateHighlight(id);
        this.cursorPointerObj.initEvent(e, id, node);
        // we haven't started to drag yet, this might be just a selection
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        document.addEventListener('touchmove', this.boundMouseMove);
        document.addEventListener('touchend', this.boundMouseUp);
    }
    ;
    mouseEnterListener(e) {
        document.addEventListener('keydown', this.boundKeyDown);
        //console.debug( "Hey!" );
    }
    mouseLeaveListener(e) {
        document.removeEventListener('mouseup', this.boundMouseUp);
        document.removeEventListener('touchend', this.boundMouseUp);
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('touchmove', this.boundMouseMove);
        document.removeEventListener('keydown', this.boundKeyDown);
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
            //console.debug( "up - dragging" );
            //this.app.startLoading( "Updating content ...", true );
            this.draggingActive = false;
            document.removeEventListener('mousemove', this.boundMouseMove);
            document.removeEventListener('touchmove', this.boundMouseMove);
            const timerThis = this;
            // Since we are waiting to trigger the mousemove events, we also need to delay the mouseup
            setTimeout(function () {
                timerThis.resetHighlights();
                timerThis.actionManager.update();
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
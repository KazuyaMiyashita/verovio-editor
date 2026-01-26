/**
 * The ResponsiveView class implements a dynamic rendering view fitting and adjusting to the view port.
 */
import { EditorView } from '../editor/editor-view.js';
import { VerovioView } from '../verovio/verovio-view.js';
import { appendDivTo } from '../utils/functions.js';
export class ResponsiveView extends VerovioView {
    constructor(div, app, verovio) {
        super(div, app, verovio);
        // initializes ui underneath the parent element, as well as Verovio communication
        this.svgWrapper = appendDivTo(this.div, { class: `vrv-svg-wrapper` });
        this.midiIds = [];
    }
    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////
    async refreshView(update, lightEndLoading = true, mei = "", reload = false) {
        switch (update) {
            case (VerovioView.Refresh.Activate):
                await this.updateActivate();
                break;
            case (VerovioView.Refresh.LoadData):
                await this.updateLoadData(mei, reload);
                break;
            case (VerovioView.Refresh.Resized):
                await this.updateResized();
                break;
            case (VerovioView.Refresh.Zoom):
                await this.updateZoom();
                break;
        }
        this.app.endLoading(lightEndLoading);
    }
    async updateActivate() {
        this.app.verovioOptions.adjustPageHeight = true;
        this.app.verovioOptions.breaks = 'auto';
        this.app.verovioOptions.footer = 'none';
        this.app.verovioOptions.scale = this.currentScale;
        this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale);
        this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale);
        this.app.verovioOptions.justifyVertically = false;
        this.app.getMidiPlayer().setView(this);
        this.midiIds = [];
        if (this.app.verovioOptions.pageHeight !== 0) {
            await this.verovio.setOptions(this.app.verovioOptions);
        }
    }
    async updateLoadData(mei, reload) {
        if (reload) {
            mei = await this.verovio.getMEI({});
        }
        await this.verovio.loadData(mei);
        this.app.setPageCount(await this.verovio.getPageCount());
        await this.updateResized();
    }
    async updateResized() {
        if (!(this instanceof EditorView)) {
            this.div.style.height = this.div.parentElement.style.height;
            this.div.style.width = this.div.parentElement.style.width;
        }
        if (this.div && this.svgWrapper) {
            this.updateSVGDimensions();
            // Reset pageHeight and pageWidth to match the effective scaled viewport width
            this.app.verovioOptions.scale = this.currentScale;
            this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale);
            this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale);
            // Not sure why we need to remove the top margin from the calculation... to be investigated
            this.app.verovioOptions.pageHeight -= (this.app.verovioOptions.pageMarginTop) * (100 / this.app.verovioOptions.scale);
            if (this.app.verovioOptions.pageHeight !== 0) {
                await this.verovio.setOptions(this.app.verovioOptions);
            }
            if (this.app.getPageCount() > 0) {
                await this.verovio.setOptions(this.app.verovioOptions);
                await this.verovio.redoLayout(this.app.verovioOptions);
                this.app.setPageCount(await this.verovio.getPageCount());
                if (this.currentPage > this.app.getPageCount()) {
                    this.currentPage = this.app.getPageCount();
                }
                await this.renderPage();
            }
        }
    }
    async updateZoom() {
        await this.updateResized();
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async renderPage(lightEndLoading = false) {
        const svg = await this.verovio.renderToSVG(this.currentPage);
        this.svgWrapper.innerHTML = svg;
        if (lightEndLoading)
            this.app.endLoading(true);
    }
    async midiUpdate(time) {
        //const animateStart = document.getElementById( "highlighting-start" );
        let vrvTime = time;
        let elementsAtTime = await this.app.verovio.getElementsAtTime(vrvTime);
        if (this.app.getMidiPlayer().getExpansionMap() && !this.app.getMidiPlayer().getExpansionMap().empty) {
            const toBaseId = (id) => {
                const expansion = this.app.getMidiPlayer().getExpansionMap()[id];
                return (expansion && expansion.length > 0) ? expansion[0] : id;
            };
            if (elementsAtTime.notes)
                elementsAtTime.notes = elementsAtTime.notes.map((id) => toBaseId(id));
            if (elementsAtTime.chords)
                elementsAtTime.chords = elementsAtTime.chords.map((id) => toBaseId(id));
            if (elementsAtTime.rests)
                elementsAtTime.rests = elementsAtTime.rests.map((id) => toBaseId(id));
            if (elementsAtTime.measure) {
                elementsAtTime.measure = toBaseId(elementsAtTime.measure);
                elementsAtTime.page = await this.app.verovio.getPageWithElement(elementsAtTime.measure);
            }
        }
        if (Object.keys(elementsAtTime).length === 0 || elementsAtTime.page === 0) {
            //console.debug( "Nothing returned by getElementsAtTime" );
            return;
        }
        if (elementsAtTime.page != this.currentPage) {
            this.currentPage = elementsAtTime.page;
            this.app.startLoading("Loading content ...", true);
            let event = new CustomEvent('onPage');
            this.app.customEventManager.dispatch(event);
        }
        if ((elementsAtTime.notes.length > 0) && (this.midiIds != elementsAtTime.notes)) {
            //updatePageOrScrollTo(elementsAtTime.notes[0]);
            for (let i = 0, len = this.midiIds.length; i < len; i++) {
                let noteId = this.midiIds[i];
                if (elementsAtTime.notes.indexOf(noteId) === -1) {
                    let note = this.svgWrapper.querySelector('#' + noteId);
                    if (note)
                        note.style.filter = "";
                }
            }
            ;
            this.midiIds = elementsAtTime.notes;
            for (let i = 0, len = this.midiIds.length; i < len; i++) {
                let note = this.svgWrapper.querySelector('#' + this.midiIds[i]);
                if (note)
                    note.style.filter = "url(#highlighting)";
                //if ( note ) animateStart.beginElement();
            }
            ;
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    midiStop() {
        for (let i = 0, len = this.midiIds.length; i < len; i++) {
            let note = this.svgWrapper.querySelector('#' + this.midiIds[i]);
            if (note)
                note.style.filter = "";
        }
        ;
        this.midiIds = [];
    }
    updateSVGDimensions() {
        this.svgWrapper.style.height = this.div.style.height;
        this.svgWrapper.style.width = this.div.style.width;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onPage(e) {
        if (!super.onPage(e))
            return false;
        //console.debug("ResponsiveView::onPage");
        this.renderPage(true);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////
    scrollListener(e) {
        let element = e.target;
        this.svgWrapper.scrollTop = element.scrollTop;
        this.svgWrapper.scrollLeft = element.scrollLeft;
    }
}
//# sourceMappingURL=responsive-view.js.map
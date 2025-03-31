/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from '../app.js';
import { Dialog } from '../dialogs/dialog.js';
import { EditorContentPanel } from './editor-content-panel.js';
import { EditorToolbar } from '../toolbars/editor-toolbar.js';
import { EditorView } from './editor-view.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { Keyboard } from '../midi/keyboard.js';
import { RNGLoader } from '../xml/rng-loader.js';
import { TabGroup } from '../utils/tab-group.js';
import { ValidatorWorkerProxy, VerovioWorkerProxy } from '../utils/worker-proxy.js';
import { XMLEditorView } from '../xml/xml-editor-view.js';
import { appendDivTo } from '../utils/functions.js';
import { editedXML} from '../utils/messages.js';

export class EditorPanel extends GenericView {
    app: App;
    verovio: VerovioWorkerProxy;
    validator: ValidatorWorkerProxy;
    rngLoader: RNGLoader;
    eventManager: EventManager;

    draggingSplitter: boolean;
    draggingX: number;
    draggingY: number;
    splitterX: number;
    splitterY: number;
    splitterSize: number;
    resizeTimer: number;

    toolbar: HTMLDivElement;
    toolbarObj: EditorToolbar;

    hSplit: HTMLDivElement;

    toolPanelDiv: HTMLDivElement;

    tabGroup: HTMLDivElement;
    tabGroupObj: TabGroup;

    vSplit: HTMLDivElement;

    keyboard; HTMLDivElement;
    keyboardObj: Keyboard;

    split: HTMLDivElement;

    scorePanel: HTMLDivElement;
    //scorePanelObj: EditorScorePanel;

    sectionPanel: HTMLDivElement;
    //sectionPanelObj: EditorSectionPanel;

    contentPanel: HTMLDivElement;
    contentPanelObj: EditorContentPanel;

    editorView: HTMLDivElement;
    editorViewObj: EditorView;

    splitter: HTMLDivElement;

    xmlEditorView: HTMLDivElement;
    xmlEditorViewObj: XMLEditorView;
    
    boundMouseMove: { (event: MouseEvent): void };
    boundMouseUp: { (event: MouseEvent): void };

    constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy, validator: ValidatorWorkerProxy, rngLoader: RNGLoader) {
        super(div, app);

        this.verovio = verovio;
        this.validator = validator;
        this.rngLoader = rngLoader;

        this.eventManager = new EventManager(this);

        this.toolbar = appendDivTo(this.div, { class: `vrv-editor-toolbar` });
        this.toolbarObj = new EditorToolbar(this.toolbar, this.app, this);
        this.customEventManager.addToPropagationList(this.toolbarObj.customEventManager);

        this.hSplit = appendDivTo(this.div, { class: `vrv-h-split` });
        this.toolPanelDiv = appendDivTo(this.hSplit, { class: `vrv-editor-tool-panel` });
        
        this.tabGroup = appendDivTo(this.toolPanelDiv, { class: `vrv-tab-group` });
        this.tabGroupObj = new TabGroup(this.tabGroup, this.app);
        this.customEventManager.addToPropagationList(this.tabGroupObj.customEventManager);

        let tabScoreObj = this.tabGroupObj.addTab("Score");
        
        let tabSectionsObj = this.tabGroupObj.addTab("Sections");
        
        let tabContentObj = this.tabGroupObj.addTab("Content");

        this.contentPanel = appendDivTo(tabContentObj.div, {});
        this.contentPanelObj = new EditorContentPanel(this.contentPanel, this.app, tabContentObj);
        tabContentObj.customEventManager.addToPropagationList(this.contentPanelObj.customEventManager);

        this.vSplit = appendDivTo(this.hSplit, { class: `vrv-v-split` });
        this.split = appendDivTo(this.vSplit, { class: `vrv-split` });
        
        this.keyboard = appendDivTo(this.vSplit, { class: `vrv-keyboard-panel` });
        this.keyboardObj = new Keyboard(this.keyboard, this.app);

        let orientation = (this.app.options.editorSplitterHorizontal) ? "vertical" : "horizontal";
        this.split.classList.add(orientation);

        this.editorView = appendDivTo(this.split, { class: `vrv-view`, style: `` });
        this.editorViewObj = new EditorView(this.editorView, this.app, this.verovio);
        this.customEventManager.addToPropagationList(this.editorViewObj.customEventManager);
        this.toolbarObj.bindEvents(this.editorViewObj.actionManager);

        this.splitter = appendDivTo(this.split, { class: `` });
        this.eventManager.bind(this.splitter, 'mousedown', this.onDragInit);
        this.boundMouseMove = (e: MouseEvent) => this.onDragMove(e);
        this.boundMouseUp = (e: MouseEvent) => this.onDragUp(e);

        this.draggingSplitter = false;
        this.draggingX = 0; // Stores x & y coordinates of the mouse pointer
        this.draggingY = 0;
        this.splitterX = 0; // Stores top, left values (edge) of the element
        this.splitterY = 0;

        this.xmlEditorView = appendDivTo(this.split, { class: `vrv-xml` });
        this.xmlEditorViewObj = new XMLEditorView(this.xmlEditorView, this.app, this.validator, this.rngLoader);
        this.customEventManager.addToPropagationList(this.xmlEditorViewObj.customEventManager);

        this.splitterSize = 60;
        this.resizeTimer;
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    updateSplitterSize(): void {
        if (this.app.options.editorSplitterHorizontal) {
            const height = this.split.clientHeight;
            const editorHeight = this.editorView.clientHeight;
            this.splitterSize = Math.round(editorHeight * 100 / height);
        }
        else {
            const width = this.split.clientWidth;
            const editorWidth = this.editorView.clientWidth;
            this.splitterSize = Math.round(editorWidth * 100 / width);
        }
    }

    updateSize(): boolean {
        this.div.style.height = this.div.parentElement.style.height;
        this.div.style.width = this.div.parentElement.style.width;

        //this.toolPanel.style.display = 'none';
        //this.keyboard.style.display = 'none';
        this.toolPanelDiv.style.display = this.xmlEditorViewObj.isEnabled() ? 'none' : 'block';
        this.keyboard.style.display = this.xmlEditorViewObj.isEnabled() ? 'none' : 'flex';

        // Force the toolbar to be displayed when re-activate because the it does not have received the event yet
        this.toolbar.style.display = 'block';

        let height = this.div.clientHeight - this.toolbar.offsetHeight - this.keyboard.offsetHeight;
        let width = this.div.clientWidth - this.toolPanelDiv.offsetWidth;

        this.split.style.height = `${height}px`;
        this.split.style.width = `${width}px`;
        this.keyboard.style.width = `${width}px`;

        this.xmlEditorView.style.display = 'block';
        this.splitter.style.display = 'block';

        if (!this.xmlEditorViewObj.isEnabled()) {
            // Ideally we would send a onActive / onDeactivate event
            this.xmlEditorView.style.display = 'none';
            this.xmlEditorView.style.height = `0px`;
            this.xmlEditorView.style.width = `0px`;
            this.splitter.style.display = 'none';
            this.editorView.style.height = `${height}px`;
            this.editorView.style.width = `${width}px`;
        }
        else if (this.app.options.editorSplitterHorizontal) {
            let editorHeight = Math.floor(height * this.splitterSize / 100);
            // 10 is the bottom border of the editor view
            let xmlHeight = Math.ceil((height * (100 - this.splitterSize) / 100) - 10);

            this.editorView.style.height = `${editorHeight}px`;
            this.editorView.style.width = `${width}px`;

            this.xmlEditorView.style.height = `${xmlHeight}px`;
            this.xmlEditorView.style.width = `${width}px`;

            this.div.style.height = this.div.parentElement.style.height;
            this.div.style.width = this.div.parentElement.style.width;
        }
        else {
            let editorWidth = Math.floor(width * this.splitterSize / 100);
            // 10 is the bottom border of the editor view
            let xmlWidth = Math.ceil((width * (100 - this.splitterSize) / 100) - 10);

            this.editorView.style.height = `${height}px`;
            this.editorView.style.width = `${editorWidth}px`;

            this.xmlEditorView.style.height = `${height}px`;
            this.xmlEditorView.style.width = `${xmlWidth}px`;
        }

        this.div.style.height = this.div.parentElement.style.height
        this.div.style.width = this.div.parentElement.style.width;

        return true;
    }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onActivate(e: CustomEvent): boolean {
        if (!super.onActivate(e)) return false;
        console.debug("EditorPanel::onActivate");

        this.updateSize();
    }

    override onLoadData(e: CustomEvent): boolean {
        if (!super.onLoadData(e)) return false;
        console.debug("EditorPanel::onLoadData");
        
        this.updateSize();
    }

    override onResized(e: CustomEvent): boolean {
        if (!super.onResized(e)) return false;
        //console.debug("EditorPanel::onResized");

        this.updateSize();
    }

    override onUpdateView(e: CustomEvent): boolean {
        if (!super.onUpdateView(e)) return false;

        this.app.endLoading();
    }

    //////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    onDragInit(e: MouseEvent): void {
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
        this.draggingX = e.clientX;
        this.draggingY = e.clientY;

        // Store the object of the element which needs to be moved
        this.draggingSplitter = true;
        this.splitterY = e.clientY;
        this.splitterX = e.clientX;
    }

    onDragMove(e: MouseEvent): void {
        if (this.draggingSplitter === true) {
            if (this.app.options.editorSplitterHorizontal) {
                const diffY = this.draggingY - e.clientY;
                const editorHeight = this.editorView.clientHeight;
                const xmlHeight = this.xmlEditorView.clientHeight;
                this.editorView.style.height = `${editorHeight - diffY}px`;
                this.xmlEditorView.style.height = `${xmlHeight + diffY}px`;
                this.draggingY = e.clientY;
            }
            else {
                const diffX = this.draggingX - e.clientX;
                const editorWidth = this.editorView.clientWidth;
                const xmlWidth = this.xmlEditorView.clientWidth;
                this.editorView.style.width = `${editorWidth - diffX}px`;
                this.xmlEditorView.style.width = `${xmlWidth + diffX}px`;
                this.draggingX = e.clientX;
            }
            // We can already update the xmlView size
            let event = new CustomEvent('onResized');
            this.xmlEditorViewObj.customEventManager.dispatch(event);

            // To update Verovio 
            //this.app.startLoading( "Adjusting size ...", true );
            //this.updateSplitterSize();
            //let event = new CustomEvent( 'onResized' );
            //this.editorView.customEventManager.dispatch( event );
        }
    }

    onDragUp(e: MouseEvent): void {
        this.draggingSplitter = false;
        // Remove listeners
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
        // Update the splitter position and resize all
        this.app.startLoading("Adjusting size ...", true);
        this.updateSplitterSize();
        let event = new CustomEvent('onResized');
        this.customEventManager.dispatch(event);
    }

    onToggleOrientation(): void {
        this.app.options.editorSplitterHorizontal = !this.app.options.editorSplitterHorizontal;
        this.split.classList.toggle("vertical");
        this.split.classList.toggle("horizontal");
        this.app.startLoading("Adjusting size ...", true);
        let event = new CustomEvent('onResized');
        this.app.customEventManager.dispatch(event);
    }

    async onToggle(): Promise<any> {
        if (!this.xmlEditorViewObj.isEnabled()) {
            let event = new CustomEvent('onDeactivate');
            this.tabGroupObj.customEventManager.dispatch(event);

            this.xmlEditorViewObj.setEnabled(true);
            await this.editorViewObj.updateMEI();
        }
        else {
            if (this.xmlEditorViewObj.isEdited()) {
                const dlg = new Dialog(this.app.dialogDiv, this.app, "Un-synchronized changes", { okLabel: "Yes", icon: "question" });
                dlg.setContent(marked.parse(editedXML));
                if (await dlg.show() === 0) return;
                this.xmlEditorViewObj.setEdited(false);
            }
            let event = new CustomEvent('onActivate');
            this.tabGroupObj.customEventManager.dispatch(event);
            this.xmlEditorViewObj.setEnabled(false);
        }
        this.app.startLoading("Adjusting size ...", true);
        let event = new CustomEvent('onResized');
        this.app.customEventManager.dispatch(event);
    }

    onForceReload(e: Event): void {
        if (this.xmlEditorViewObj && this.xmlEditorViewObj.isEdited()) {
            this.app.mei = this.xmlEditorViewObj.getValue();
            let event = new CustomEvent('onUpdateData', {
                detail: {
                    caller: this.xmlEditorViewObj
                }
            });
            this.customEventManager.dispatch(event);
        }
    }
}

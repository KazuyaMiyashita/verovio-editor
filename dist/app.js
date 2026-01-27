/**
 * The App class is the main class of the application.
 * It requires a HTMLDivElement to be put on.
 */
import { AppStatusbar } from './app-statusbar.js';
import { AppToolbar } from './toolbars/app-toolbar.js';
import { Dialog } from './dialogs/dialog.js';
import { DialogAbout } from './dialogs/dialog-about.js';
import { DialogExport } from './dialogs/dialog-export.js';
import { DialogGhExport } from './dialogs/dialog-gh-export.js';
import { DialogGhImport } from './dialogs/dialog-gh-import.js';
import { DialogSelection } from './dialogs/dialog-selection.js';
import { DialogSettingsEditor } from './dialogs/dialog-settings-editor.js';
import { DialogSettingsVerovio } from './dialogs/dialog-settings-verovio.js';
import { DocumentView } from './document/document-view.js';
import { CustomEventManager } from './events/custom-event-manager.js';
import { EditorPanel } from './editor/editor-panel.js';
import { EventManager } from './events/event-manager.js';
import { FileStack } from './utils/file-stack.js';
import { GitHubManager } from './utils/github-manager.js';
import { MidiPlayer } from './midi/midi-player.js';
import { MidiToolbar } from './toolbars/midi-toolbar.js';
import { PDFGenerator } from './document/pdf-generator.js';
import { ResponsiveView } from './verovio/responsive-view.js';
import { RNGLoader } from './xml/rng-loader.js';
import { PDFWorkerProxy, VerovioWorkerProxy, ValidatorWorkerProxy } from './utils/worker-proxy.js';
import { appendAnchorTo, appendDivTo, appendInputTo, appendLinkTo, appendTextAreaTo } from './utils/functions.js';
import { aboutMsg, reloadMsg, resetMsg, version } from './utils/messages.js';
import { ContextMenu } from './toolbars/context-menu.js';
const filter = '/svg/filter.xml';
const host = (window.location.hostname == "localhost") ? `http://${window.location.host}` : "https://editor.verovio.org";
export class App {
    constructor(div, options) {
        this.clientId = "fd81068a15354a300522";
        this.host = host;
        this.id = this.clientId;
        this.notificationStack = [];
        this.githubManager = new GitHubManager(this);
        this.options = Object.assign({
            version: version,
            verovioVersion: "latest",
            // The margin around page in documentView
            documentViewMargin: 100,
            // The border for pages in documentView
            documentViewPageBorder: 1,
            // SVG rendering instead of Canvas
            documentViewSVG: true,
            documentZoom: 3,
            responsiveZoom: 4,
            editorSplitterHorizontal: true,
            editorZoom: 4,
            enableDocument: true,
            enableEditor: true,
            enableResponsive: true,
            enableStatusbar: true,
            enableValidation: true,
            showDevFeatures: false,
            // Selection is empty by default
            selection: {},
            // Editorial is empty by default
            editorial: {},
            // The default schema (latest MEI release by default)
            schemaDefault: 'https://music-encoding.org/schema/5.1/mei-all.rng',
            //schemaDefault: './local/mei-all.rng',
            schema: 'https://music-encoding.org/schema/5.1/mei-all.rng',
            //schema: './local/mei-all.rng',
            schemaBasic: 'https://music-encoding.org/schema/5.1/mei-basic.rng',
            //schemaBasic: './local/mei-basic.rng',
            defaultView: 'responsive',
            isSafari: false
        }, options);
        if (options.appReset)
            window.localStorage.removeItem("options");
        const storedOptions = localStorage.getItem("options");
        if (storedOptions) {
            let jsonStoredOptions = JSON.parse(storedOptions);
            // Options.version introduce after 1.3.0
            let version = (jsonStoredOptions['version'] !== undefined) ? jsonStoredOptions['version'] : "1.3.0";
            // ignore revisions here
            const [major1, minor1] = version.split('.').map(Number);
            const [major2, minor2] = this.options.version.split('.').map(Number);
            // Do not reload options if we have a new minor release
            if (major1 < major2 || minor1 < minor2) {
                // We cannot show a notification at this stage
                console.warn(`Version ${options.version} is new, options not reloaded`);
            }
            else {
                this.options = Object.assign(this.options, jsonStoredOptions);
            }
        }
        const storedShowDevFeatures = localStorage.getItem("showDevFeatures");
        if (storedShowDevFeatures !== null) {
            this.options.showDevFeatures = (storedShowDevFeatures === 'true');
        }
        else {
            this.options.devFeatures = false;
        }
        this.fileStack = new FileStack();
        if (options.appReset)
            this.fileStack.reset();
        // Root element in which verovio-ui is created
        this.div = div;
        this.zoomLevels = [5, 10, 20, 35, 75, 100, 150, 200];
        // If necessary remove all the children of the div
        while (this.div.firstChild) {
            this.div.firstChild.remove();
        }
        appendLinkTo(document.head, { href: `${this.host}/css/verovio.css`, rel: `stylesheet` });
        this.loadingCount = 0;
        this.eventManager = new EventManager(this);
        this.customEventManager = new CustomEventManager();
        this.toolbarObj = null;
        // Create and load the SVG filter
        this.createFilter();
        // Create input for reading files
        this.input = appendInputTo(this.div, { type: `file`, class: `vrv-file-input` });
        this.input.onchange = this.fileInput.bind(this);
        // Create link for writing files
        this.output = appendAnchorTo(this.div, { class: `vrv-file-output` });
        // Create link for copying files
        this.fileCopy = appendTextAreaTo(this.div, { class: `vrv-file-copy` });
        // Create the HTML content
        this.wrapper = appendDivTo(this.div, { class: `vrv-wrapper` });
        // Create notification div
        this.notification = appendDivTo(this.wrapper, { class: `vrv-notification disabled` });
        // Create right menu div
        this.contextUnderlay = appendDivTo(this.wrapper, { class: `vrv-context-underlay` });
        this.contextMenu = appendDivTo(this.wrapper, { class: `vrv-context-menu` });
        // Create a dialog div
        this.dialogDiv = appendDivTo(this.wrapper, { class: `vrv-dialog` });
        // Create a toolbar div
        this.toolbar = appendDivTo(this.wrapper, { class: `vrv-toolbar` });
        // Views
        this.views = appendDivTo(this.wrapper, { class: `vrv-views` });
        // Loader
        this.loader = appendDivTo(this.views, { class: `vrv-loading` });
        this.loaderText = appendDivTo(this.loader, { class: `vrv-loading-text` });
        // Status bar
        this.statusbar = appendDivTo(this.wrapper, { class: `vrv-statusbar` });
        if (!this.options.enableStatusbar) {
            this.statusbar.style.minHeight = '0px';
        }
        // PDF object - will be created only if necessary
        this.pdf = null;
        // VerovioMessenger object
        this.verovio = null;
        // Validator and rngLoader objects
        this.validator = null;
        this.rngLoader = null;
        // Handling the resizing of the window
        this.resizeTimer = 0; // Used to prevent per-pixel re-render events when the window is resized
        window.onresize = this.onResize.bind(this);
        window.onbeforeunload = this.onBeforeUnload.bind(this);
        //window.addEventListener("beforeunload", this.onBeforeUnload);
        this.customEventManager.bind(this, 'onResized', this.onResized);
        let event = new CustomEvent('onResized');
        this.customEventManager.dispatch(event);
        const verovioWorkerURL = this.getWorkerURL(`${this.host}/dist/verovio/verovio-worker.js`);
        const verovioWorker = new Worker(verovioWorkerURL);
        const verovioUrl = `https://www.verovio.org/javascript/${this.options.verovioVersion}/verovio-toolkit-wasm.js`;
        //const verovioUrl = `http://localhost:8001/build/verovio-toolkit-wasm.js`
        verovioWorker.postMessage({ verovioUrl });
        this.verovio = new VerovioWorkerProxy(verovioWorker);
        this.verovioOptions =
            {
                pageHeight: 2970,
                pageWidth: 2100,
                pageMarginLeft: 50,
                pageMarginRight: 50,
                pageMarginTop: 50,
                pageMarginBottom: 50,
                scale: 100,
                xmlIdSeed: 1
            };
        this.pageCount = 0;
        this.currentZoomIndex = 4;
        this.verovioRuntimeVersion = "";
        if (this.options.enableEditor) {
            const validatorWorkerURL = this.getWorkerURL(`${this.host}/dist/xml/validator-worker.js`);
            const validatorWorker = new Worker(validatorWorkerURL);
            this.validator = new ValidatorWorkerProxy(validatorWorker);
            this.rngLoader = new RNGLoader();
            this.rngLoaderBasic = new RNGLoader();
        }
        // Set to true when everything is loaded
        this.appIsLoaded = false;
        // Use to avoid saving config when resetting the app
        this.appReset = false;
        this.inputData = "";
        this.filename = "untitled.xml";
        const last = this.fileStack.getLast();
        if (last) {
            console.log("Reloading", last.filename);
            this.loadData(last.data, last.filename);
        }
        // Listen and wait for Module to emit onRuntimeInitialized
        this.startLoading("Loading Verovio ...");
        this.verovio.onRuntimeInitialized().then(async () => {
            const version = await this.verovio.getVersion();
            console.log(version);
            this.verovioRuntimeVersion = version;
            this.endLoading();
            if (this.options.enableEditor) {
                this.startLoading("Loading the XML validator ...");
                // Listen and wait for Module to emit onRuntimeInitialized
                this.validator.onRuntimeInitialized().then(async () => {
                    this.currentSchema = this.options.schema;
                    const response = await fetch(this.currentSchema);
                    const data = await response.text();
                    if (this.options.enableValidation) {
                        const res = await this.validator.setRelaxNGSchema(data);
                        console.log("Schema loaded", res);
                    }
                    this.rngLoader.setRelaxNGSchema(data);
                    const responseBasic = await fetch(this.options.schemaBasic);
                    const dataBasic = await responseBasic.text();
                    console.log(this.options.schemaBasic);
                    this.rngLoaderBasic.setRelaxNGSchema(dataBasic);
                    this.endLoading();
                    this.createInterfaceAndLoadData();
                });
            }
            else {
                this.createInterfaceAndLoadData();
            }
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    getView() { return this.view; }
    getToolbarView() { return this.toolbarView; }
    getMidiPlayer() { return this.midiPlayer; }
    getPageCount() { return this.pageCount; }
    setPageCount(pageCount) { this.pageCount = pageCount; }
    getCurrentZoomIndex() { return this.currentZoomIndex; }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    startLoading(msg, light = false) {
        if (light) {
            this.views.style.pointerEvents = 'none';
        }
        else {
            this.views.style.overflow = 'hidden';
            this.loader.style.display = `flex`;
            this.loadingCount++;
        }
        this.loaderText.textContent = msg;
        let event = new CustomEvent('onStartLoading', {
            detail: {
                light: light,
                msg: msg
            }
        });
        this.customEventManager.dispatch(event);
    }
    endLoading(light = false) {
        if (!light) {
            this.loadingCount--;
            if (this.loadingCount < 0)
                console.error("endLoading index corrupted");
        }
        // We have other tasks being performed
        if (this.loadingCount > 0)
            return;
        this.views.style.overflow = 'scroll';
        this.loader.style.display = 'none';
        this.views.style.pointerEvents = '';
        this.views.style.opacity = '';
        let event = new CustomEvent('onEndLoading');
        this.customEventManager.dispatch(event);
    }
    showNotification(message) {
        this.notificationStack.push(message);
        if (this.notificationStack.length < 2)
            this.pushNotification();
    }
    destroy() {
        this.eventManager.unbindAll();
    }
    getWorkerURL(url) {
        const content = `importScripts("${url}");`;
        return URL.createObjectURL(new Blob([content], { type: "text/javascript" }));
    }
    createInterfaceAndLoadData() {
        this.startLoading("Create the interface ...");
        this.createToolbar();
        this.createViews();
        this.createStatusbar();
        this.customEventManager.bind(this, 'onResized', this.onResized);
        let event = new CustomEvent('onResized');
        this.customEventManager.dispatch(event);
        if (this.options.isSafari) {
            this.showNotification("It seems that you are using Safari, on which XML validation unfortunately does not work.<br/>Please use another browser to have XML validation enabled.");
        }
        this.appIsLoaded = true;
        this.endLoading();
        if (this.inputData) {
            this.loadMEI(false);
        }
    }
    createViews() {
        this.startLoading("Loading the views ...");
        this.view = null;
        this.toolbarView = null;
        if (this.options.enableDocument) {
            this.currentZoomIndex = this.options.documentZoom;
            this.view1 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewDocumentObj = new DocumentView(this.view1, this, this.verovio);
            this.customEventManager.addToPropagationList(this.viewDocumentObj.customEventManager);
            if (this.options.defaultView === 'document') {
                this.view = this.viewDocumentObj;
                this.toolbarView = this.viewDocumentObj;
            }
        }
        if (this.options.enableEditor) {
            this.currentZoomIndex = this.options.editorZoom;
            this.view2 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewEditorObj = new EditorPanel(this.view2, this, this.verovio, this.validator, this.rngLoader);
            this.customEventManager.addToPropagationList(this.viewEditorObj.customEventManager);
            if (this.options.defaultView === 'editor') {
                this.view = this.viewEditorObj;
                this.toolbarView = this.viewEditorObj.editorViewObj;
            }
        }
        if (this.options.enableResponsive) {
            this.currentZoomIndex = this.options.responsiveZoom;
            this.view3 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewResponsiveObj = new ResponsiveView(this.view3, this, this.verovio);
            this.customEventManager.addToPropagationList(this.viewResponsiveObj.customEventManager);
            if (this.options.defaultView === 'responsive') {
                this.view = this.viewResponsiveObj;
                this.toolbarView = this.viewResponsiveObj;
            }
        }
        // Root element in which verovio-ui is created
        if (!this.view) {
            throw `No view enabled or unknown default view '${this.options.defaultView}' selected.`;
        }
        this.endLoading();
        let eventActivate = new CustomEvent('onActivate');
        this.view.customEventManager.dispatch(eventActivate);
    }
    createToolbar() {
        this.toolbarObj = new AppToolbar(this.toolbar, this);
        this.customEventManager.addToPropagationList(this.toolbarObj.customEventManager);
        this.midiToolbarObj = new MidiToolbar(this.toolbar, this);
        this.midiPlayer = new MidiPlayer(this.midiToolbarObj);
        this.customEventManager.addToPropagationList(this.midiToolbarObj.customEventManager);
        this.contextMenuObj = new ContextMenu(this.contextMenu, this, this.contextUnderlay);
        this.customEventManager.addToPropagationList(this.contextMenuObj.customEventManager);
        this.div.addEventListener('contextmenu', (e => e.preventDefault()));
    }
    createStatusbar() {
        if (!this.options.enableStatusbar)
            return;
        this.statusbarObj = new AppStatusbar(this.statusbar, this);
        this.customEventManager.addToPropagationList(this.statusbarObj.customEventManager);
        this.statusbarObj.setVerovioVersion(this.verovioRuntimeVersion);
    }
    createFilter() {
        const filterDiv = appendDivTo(this.div, { class: `vrv-filter` });
        var xHttp = new XMLHttpRequest();
        xHttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                filterDiv.appendChild(this.responseXML.documentElement);
            }
        };
        xHttp.open("GET", `${this.host}${filter}`, true);
        xHttp.send();
    }
    loadData(data, filename = "untitled.xml", convert = false, onlyIfEmpty = false) {
        if (this.inputData.length != 0) {
            // This is useful for loading the app with a default file but not if one exists
            if (onlyIfEmpty)
                return;
            this.fileStack.store(this.filename, this.inputData);
            if (this.toolbarObj !== null)
                this.toolbarObj.updateRecent();
        }
        this.inputData = data;
        this.filename = filename;
        if (this.appIsLoaded) {
            this.loadMEI(convert);
        }
    }
    pushNotification() {
        this.notification.textContent = this.notificationStack[0];
        this.notification.classList.remove("disabled");
        const timerThis = this;
        setTimeout(function () {
            timerThis.notification.classList.add("disabled");
            timerThis.notificationStack.shift();
            if (timerThis.notificationStack.length > 0)
                timerThis.pushNotification();
        }, 3500);
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async playMEI() {
        const expansionMap = await this.verovio.renderToExpansionMap();
        this.midiPlayer.setExpansionMap(expansionMap);
        const base64midi = await this.verovio.renderToMIDI();
        const midiFile = 'data:audio/midi;base64,' + base64midi;
        this.midiPlayer.playFile(midiFile);
    }
    async loadMEI(convert) {
        this.startLoading("Loading the MEI data ...");
        if (convert) {
            console.log("Converting to MEI");
            await this.verovio.loadData(this.inputData);
            this.inputData = await this.verovio.getMEI({});
        }
        if (this.viewEditorObj) {
            this.viewEditorObj.setXmlEditorEnabled(false);
            this.viewEditorObj.xmlEditorViewObj.setMode(this.inputData.length);
        }
        await this.checkSchema();
        let event = new CustomEvent('onLoadData', {
            detail: {
                currentId: this.clientId,
                caller: this.view,
                lightEndLoading: false,
                mei: this.inputData
            }
        });
        this.view.customEventManager.dispatch(event);
    }
    async applySelection() {
        let selection = this.options.selection;
        if (!selection || Object.keys(selection).length === 0)
            selection = {};
        await this.verovio.select(selection);
    }
    async checkSchema() {
        if (!this.options.enableEditor)
            return;
        const hasSchema = /<\?xml-model.*schematypens=\"http?:\/\/relaxng\.org\/ns\/structure\/1\.0\"/;
        const hasSchemaMatch = hasSchema.exec(this.inputData);
        if (!hasSchemaMatch)
            return;
        const schema = /<\?xml-model.*href="([^"]*).*/;
        const schemaMatch = schema.exec(this.inputData);
        if (schemaMatch && schemaMatch[1] !== this.currentSchema) {
            this.currentSchema = this.options.schemaDefault;
            const dlg = new Dialog(this.dialogDiv, this, "Different Schema in the file", { icon: "warning", type: Dialog.Type.Msg });
            dlg.setContent(`The Schema '${schemaMatch[1]}' in the file is different from the one in the editor<br><br>The validation in the editor will use the Schema '${this.options.schemaDefault}'`);
            await dlg.show();
        }
    }
    async generatePDF() {
        if (!this.pdf) {
            const pdfWorkerURL = this.getWorkerURL(`${this.host}/dist/document/pdf-worker.js`);
            const pdfWorker = new Worker(pdfWorkerURL);
            this.pdf = new PDFWorkerProxy(pdfWorker);
        }
        const pdfGenerator = new PDFGenerator(this.verovio, this.pdf, this.verovioOptions.scale);
        const pdfOutputStr = await pdfGenerator.generateFile();
        this.endLoading();
        this.output.href = `${pdfOutputStr}`;
        this.output.download = this.filename.replace(/\.[^\.]*$/, '.pdf');
        this.output.click();
    }
    async generateMIDI() {
        const midiOutputStr = await this.verovio.renderToMIDI();
        this.endLoading();
        this.output.href = `data:audio/midi;base64,${midiOutputStr}`;
        this.output.download = this.filename.replace(/\.[^\.]*$/, '.mid');
        this.output.click();
    }
    async generateMEI(options) {
        const meiOutputStr = await this.verovio.getMEI(options);
        this.endLoading();
        this.output.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent(meiOutputStr);
        this.output.download = this.filename.replace(/\.[^\.]*$/, '.mei');
        this.output.click();
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onResized(e) {
        // Minimal height and width
        //if (this.element.clientHeight < 400) this.element.style.height = `${400}px`;
        //if (this.element.clientWidth < 200) this.element.style.width = `${200}px`;
        let height = this.div.clientHeight - this.toolbar.clientHeight - this.statusbar.clientHeight;
        if (height < parseInt(this.views.style.minHeight, 10)) {
            height = Number(this.views.style.minHeight);
            this.div.style.height = `${height + this.toolbar.clientHeight}px`;
        }
        this.views.style.height = `${height}px`;
        this.views.style.width = `${this.div.clientWidth}px`;
        this.statusbar.style.top = `${height}px`;
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Window event handlers
    ////////////////////////////////////////////////////////////////////////
    onBeforeUnload(e) {
        if (this.appReset)
            return;
        // Store zoom of each view
        if (this.viewDocumentObj)
            this.options.documentZoom = this.viewDocumentObj.getCurrentZoomIndex();
        if (this.viewResponsiveObj)
            this.options.responsiveZoom = this.viewResponsiveObj.getCurrentZoomIndex();
        if (this.viewEditorObj)
            this.options.editorZoom = this.viewEditorObj.editorViewObj.getCurrentZoomIndex();
        // Store current view
        if (this.view == this.viewDocumentObj)
            this.options.defaultView = 'document';
        else if (this.view == this.viewResponsiveObj)
            this.options.defaultView = 'responsive';
        else if (this.view == this.viewEditorObj)
            this.options.defaultView = 'editor';
        // Do not store selection and editorial
        delete this.options['selection'];
        delete this.options['editorial'];
        delete this.options['showDevFeatures'];
        window.localStorage.setItem("options", JSON.stringify(this.options));
        this.fileStack.store(this.filename, this.inputData);
    }
    onResize(e) {
        clearTimeout(this.resizeTimer);
        const timerThis = this;
        this.resizeTimer = setTimeout(function () {
            timerThis.startLoading("Resizing ...", true);
            let event = new CustomEvent('onResized');
            timerThis.customEventManager.dispatch(event);
        }, 100);
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    prevPage(e) {
        if (this.toolbarView.getCurrentPage() > 1) {
            this.toolbarView.setCurrentPage(this.toolbarView.getCurrentPage() - 1);
            this.startLoading("Loading content ...", true);
            let event = new CustomEvent('onPage');
            this.customEventManager.dispatch(event);
        }
    }
    nextPage(e) {
        if (this.toolbarView.getCurrentPage() < this.pageCount) {
            this.toolbarView.setCurrentPage(this.toolbarView.getCurrentPage() + 1);
            this.startLoading("Loading content ...", true);
            let event = new CustomEvent('onPage');
            this.customEventManager.dispatch(event);
        }
    }
    zoomOut(e) {
        if (this.toolbarView.getCurrentZoomIndex() > 0) {
            this.toolbarView.setCurrentZoomIndex(this.toolbarView.getCurrentZoomIndex() - 1);
            this.startLoading("Adjusting size ...", true);
            let event = new CustomEvent('onZoom');
            this.customEventManager.dispatch(event);
        }
    }
    zoomIn(e) {
        if (this.toolbarView.getCurrentZoomIndex() < this.zoomLevels.length - 1) {
            this.toolbarView.setCurrentZoomIndex(this.toolbarView.getCurrentZoomIndex() + 1);
            this.startLoading("Adjusting size ...", true);
            let event = new CustomEvent('onZoom');
            this.customEventManager.dispatch(event);
        }
    }
    login(e) {
        location.href = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.host}/oauth/redirect&scope=public_repo%20read:org`;
    }
    logout(e) {
        location.href = `${this.host}/oauth/logout`;
    }
    ////////////////////////////////////////////////////////////////////////
    // Async event methods
    ////////////////////////////////////////////////////////////////////////
    async fileImport(e) {
        const element = e.target;
        if (element.dataset.ext === 'MEI')
            this.input.accept = ".xml, .mei";
        else if (element.dataset.ext === 'MusicXML')
            this.input.accept = ".xml, .musicxml";
        else if (element.dataset.ext === 'CMME')
            this.input.accept = ".xml, .cmme.xml";
        //console.log( element.dataset.ext );
        this.input.dataset.ext = element.dataset.ext;
        this.input.click();
    }
    async fileInput(e) {
        const element = e.target;
        let file = element.files[0];
        if (!file)
            return;
        let reader = new FileReader();
        const readerThis = this;
        const filename = file.name;
        const convert = (element.dataset.ext != 'MEI') ? true : false;
        reader.onload = async function (e) {
            readerThis.loadData(e.target.result, filename, convert);
        };
        reader.readAsText(file);
    }
    async fileExport(e) {
        const dlg = new DialogExport(this.dialogDiv, this, "Select MEI export parameters");
        const dlgRes = await dlg.show();
        if (dlgRes === 0)
            return;
        this.startLoading("Generating MEI file ...");
        this.generateMEI(dlg.getExportOptions());
    }
    async fileExportPDF(e) {
        this.startLoading("Generating PDF file ...");
        this.generatePDF();
    }
    async fileExportMIDI(e) {
        this.startLoading("Generating MIDI file ...");
        this.generateMIDI();
    }
    async fileCopyToClipboard(e) {
        const dlg = new DialogExport(this.dialogDiv, this, "Select MEI export parameters");
        const dlgRes = await dlg.show();
        if (dlgRes === 0)
            return;
        const mei = await this.verovio.getMEI(dlg.getExportOptions());
        this.fileCopy.value = mei;
        this.fileCopy.select();
        document.execCommand('copy');
        this.showNotification("MEI copied to clipboard");
    }
    async fileLoadRecent(e) {
        const element = e.target;
        //console.log( e.target.dataset.idx );
        let file = this.fileStack.load(Number(element.dataset.idx));
        this.loadData(file.data, file.filename);
    }
    async fileSelection(e) {
        const dlg = new DialogSelection(this.dialogDiv, this, "Apply a selection to the file currently loaded", { okLabel: "Apply", icon: "info", type: Dialog.Type.OKCancel }, this.options.selection);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
            this.options.selection = dlg.getSelection();
            await this.applySelection();
            let event = new CustomEvent('onLoadData', {
                detail: {
                    currentId: this.clientId,
                    caller: this.view,
                    reload: true
                }
            });
            this.customEventManager.dispatch(event);
        }
    }
    async githubImport(e) {
        const dlg = new DialogGhImport(this.dialogDiv, this, "Import an MEI file from GitHub", {}, this.githubManager);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
            this.loadData(dlg.getData(), dlg.getFilename());
        }
    }
    async githubExport(e) {
        const dlg = new DialogGhExport(this.dialogDiv, this, "Export an MEI file to GitHub", {}, this.githubManager);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
        }
    }
    async settingsEditor(e) {
        const dlg = new DialogSettingsEditor(this.dialogDiv, this, "Editor options", { okLabel: "Apply", icon: "info", type: Dialog.Type.OKCancel }, this.options);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
            this.options.verovioVersion = dlg.getAppOptions().verovioVersion;
            if (dlg.isReload()) {
                const dlg = new Dialog(this.dialogDiv, this, "Reloading the editor", { okLabel: "Yes", icon: "question" });
                dlg.setContent(marked.parse(reloadMsg));
                if (await dlg.show() === 0)
                    return;
                location.reload();
            }
        }
    }
    async settingsVerovio(e) {
        const dlg = new DialogSettingsVerovio(this.dialogDiv, this, "Verovio options", { okLabel: "Apply", icon: "info", type: Dialog.Type.OKCancel }, this.options.selection, this.verovio);
        await dlg.loadOptions();
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
            await this.verovio.setOptions(dlg.getChangedOptions());
            let event = new CustomEvent('onLoadData', {
                detail: {
                    currentId: this.clientId,
                    caller: this.view,
                    reload: true
                }
            });
            this.customEventManager.dispatch(event);
        }
    }
    async helpAbout(e) {
        const dlg = new DialogAbout(this.dialogDiv, this, "About this application");
        const vrvVersion = await this.verovio.getVersion();
        dlg.setContent(marked.parse(aboutMsg + `\n\nVerovio: ${vrvVersion}`));
        await dlg.load();
        await dlg.show();
    }
    async helpReset(e) {
        const dlg = new Dialog(this.dialogDiv, this, "Reset to default", { okLabel: "Yes", icon: "question" });
        dlg.setContent(marked.parse(resetMsg));
        if (await dlg.show() === 0)
            return;
        this.fileStack.reset();
        window.localStorage.removeItem("options");
        this.appReset = true;
        location.reload();
    }
    async setView(e) {
        const element = e.target;
        if (this.midiPlayer && this.midiPlayer.isPlaying()) {
            this.midiPlayer.stop();
        }
        let event = new CustomEvent('onDeactivate');
        this.view.customEventManager.dispatch(event);
        if (element.dataset.view == 'document') {
            this.view = this.viewDocumentObj;
            this.toolbarView = this.viewDocumentObj;
        }
        else if (element.dataset.view == 'editor') {
            this.view = this.viewEditorObj;
            this.toolbarView = this.viewEditorObj.editorViewObj;
        }
        else if (element.dataset.view == 'responsive') {
            this.view = this.viewResponsiveObj;
            this.toolbarView = this.viewResponsiveObj;
        }
        this.startLoading("Switching view ...");
        let eventActivate = new CustomEvent('onActivate');
        this.view.customEventManager.dispatch(eventActivate);
        let eventLoadData = new CustomEvent('onLoadData', {
            detail: {
                currentId: this.clientId,
                caller: this.view,
                reload: true,
                lightEndLoading: false
            }
        });
        this.customEventManager.dispatch(eventLoadData);
        this.toolbarObj.customEventManager.dispatch(eventActivate);
    }
}
////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////
(function (App) {
    function iconFor(element) {
        const elements = ["accid", "annot", "app", "arpeg", "artic", "beam", "beamSpan", "beatRpt", "bracketSpan", "breath", "bTrem", "caesura", "choice", "chord", "clef", "cpMark", "custos", "dir", "dynam", "ending", "f", "fb", "fermata", "fing", "fTrem", "gliss", "graceGrp", "hairpin", "halfmRpt", "harm", "keySig", "layer", "layerDef", "lb", "lv", "mdiv", "measure", "meterSig", "mordent", "mRest", "mRpt", "mRpt2", "mSpace", "multiRest", "multiRpt", "note", "octave", "ornam", "pb", "pedal", "phrase", "reh", "rend", "repeatMark", "rest", "sb", "score", "scoreDef", "section", "slur", "staff", "staffDef", "syl", "symbol", "tempo", "text", "tie", "trill", "tuplet", "tupletSpan", "turn", "verse"];
        if (!elements.includes(element)) {
            element = "missing";
        }
        return `${host}/icons/mei/${element}.png`;
    }
    App.iconFor = iconFor;
})(App || (App = {}));
//# sourceMappingURL=app.js.map
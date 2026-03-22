/**
 * The App class is the main class of the application.
 * It requires a HTMLDivElement to be put on.
 */
import { AppStatusbar } from "./app-statusbar.js";
import { AppToolbar } from "./toolbars/app-toolbar.js";
import { Dialog } from "./dialogs/dialog.js";
import { DialogAbout } from "./dialogs/dialog-about.js";
import { DialogExport } from "./dialogs/dialog-export.js";
import { DialogGhExport } from "./dialogs/dialog-gh-export.js";
import { DialogGhImport } from "./dialogs/dialog-gh-import.js";
import { DialogSelection } from "./dialogs/dialog-selection.js";
import { DialogSettingsEditor } from "./dialogs/dialog-settings-editor.js";
import { DialogSettingsVerovio } from "./dialogs/dialog-settings-verovio.js";
import { DocumentView } from "./document/document-view.js";
import { CustomEventManager } from "./events/custom-event-manager.js";
import { EditorPanel } from "./editor/editor-panel.js";
import { EventManager } from "./events/event-manager.js";
import { FileStack } from "./utils/file-stack.js";
import { GitHubManager } from "./utils/github-manager.js";
import { MidiPlayer } from "./midi/midi-player.js";
import { MidiToolbar } from "./toolbars/midi-toolbar.js";
import { ResponsiveView } from "./verovio/responsive-view.js";
import { appendAnchorTo, appendDivTo, appendInputTo, appendLinkTo, appendTextAreaTo, } from "./utils/functions.js";
import { aboutMsg, reloadMsg, resetMsg, version } from "./utils/messages.js";
import { ContextMenu } from "./toolbars/context-menu.js";
import { AppEvent, createAppEvent } from "./events/event-types.js";
import { NotificationService } from "./utils/notification-service.js";
import { LoaderService } from "./utils/loader-service.js";
import { VerovioService } from "./verovio/verovio-service.js";
import { FileService } from "./utils/file-service.js";
import { LocalStorageProvider, NoStorageProvider, } from "./utils/storage-provider.js";
const filter = "/svg/filter.xml";
export class App {
    // public readonly members
    dialogDiv;
    host;
    customEventManager;
    zoomLevels;
    eventManager;
    id;
    githubManager;
    options;
    fileStack;
    storageProvider;
    verovio;
    validator;
    rngLoader;
    rngLoaderBasic;
    verovioOptions;
    // private members
    view;
    toolbarView;
    midiPlayer;
    // services
    notificationService;
    loaderService;
    verovioService;
    fileService;
    pageCount;
    currentZoomIndex;
    toolbarObj;
    contextMenuObj;
    statusbarObj;
    midiToolbarObj;
    resizeTimer;
    appIsLoaded;
    appReset;
    verovioRuntimeVersion;
    viewDocumentObj;
    viewEditorObj;
    viewResponsiveObj;
    pdf;
    currentSchema;
    input;
    output;
    fileCopy;
    wrapper;
    notification;
    contextUnderlay;
    contextMenu;
    toolbar;
    views;
    loader;
    loaderText;
    statusbar;
    view1;
    view2;
    view3;
    clientId;
    div;
    constructor(div, options) {
        this.clientId = options?.githubClientId || "fd81068a15354a300522";
        this.host =
            options?.baseUrl ||
                (window.location.hostname == "localhost"
                    ? `http://${window.location.host}`
                    : "https://editor.verovio.org");
        this.id = this.clientId;
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
            schemaDefault: "https://music-encoding.org/schema/5.1/mei-all.rng",
            //schemaDefault: './local/mei-all.rng',
            schema: "https://music-encoding.org/schema/5.1/mei-all.rng",
            //schema: './local/mei-all.rng',
            schemaBasic: "https://music-encoding.org/schema/5.1/mei-basic.rng",
            //schemaBasic: './local/mei-basic.rng',
            licenseUrl: "https://raw.githubusercontent.com/rism-digital/verovio-editor/refs/heads/main/LICENSE",
            changelogUrl: "https://raw.githubusercontent.com/rism-digital/verovio-editor/refs/heads/main/CHANGELOG.md",
            defaultView: "responsive",
            isSafari: false,
            disableLocalStorage: false,
        }, options || {});
        this.storageProvider = this.options.storageProvider
            ? this.options.storageProvider
            : this.options.disableLocalStorage
                ? new NoStorageProvider()
                : new LocalStorageProvider();
        if (this.options.appReset)
            this.storageProvider.removeItem("options");
        const storedOptions = this.storageProvider.getItem("options");
        if (storedOptions) {
            let jsonStoredOptions = JSON.parse(storedOptions);
            // Options.version introduce after 1.3.0
            let version = jsonStoredOptions["version"] !== undefined
                ? jsonStoredOptions["version"]
                : "1.3.0";
            // ignore revisions here
            const [major1, minor1] = version.split(".").map(Number);
            const [major2, minor2] = this.options.version.split(".").map(Number);
            // Do not reload options if we have a new minor release
            if (major1 < major2 || minor1 < minor2) {
                // We cannot show a notification at this stage
                console.warn(`Version ${this.options.version} is new, options not reloaded`);
            }
            else {
                this.options = Object.assign(this.options, jsonStoredOptions);
            }
        }
        const storedShowDevFeatures = this.storageProvider.getItem("showDevFeatures");
        if (storedShowDevFeatures !== null) {
            this.options.showDevFeatures = storedShowDevFeatures === "true";
        }
        else {
            this.options.devFeatures = false;
        }
        this.fileStack = new FileStack(this.storageProvider);
        if (this.options.appReset)
            this.fileStack.reset();
        // Root element in which verovio-ui is created
        this.div = div;
        this.zoomLevels = [5, 10, 20, 35, 75, 100, 150, 200];
        // If necessary remove all the children of the div
        while (this.div.firstChild) {
            this.div.firstChild.remove();
        }
        appendLinkTo(document.head, {
            href: `${this.host}/css/verovio.css`,
            rel: `stylesheet`,
        });
        this.eventManager = new EventManager(this);
        this.customEventManager = new CustomEventManager();
        this.toolbarObj = null;
        // Create and load the SVG filter
        this.createFilter();
        // Create input for reading files
        this.input = appendInputTo(this.div, {
            type: `file`,
            class: `vrv-file-input`,
        });
        this.input.onchange = this.fileInput.bind(this);
        // Create link for writing files
        this.output = appendAnchorTo(this.div, { class: `vrv-file-output` });
        // Create link for copying files
        this.fileCopy = appendTextAreaTo(this.div, { class: `vrv-file-copy` });
        // Create the HTML content
        this.wrapper = appendDivTo(this.div, { class: `vrv-wrapper` });
        // Create notification div
        this.notification = appendDivTo(this.wrapper, {
            class: `vrv-notification disabled`,
        });
        // Create right menu div
        this.contextUnderlay = appendDivTo(this.wrapper, {
            class: `vrv-context-underlay`,
        });
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
            this.statusbar.style.minHeight = "0px";
        }
        this.notificationService = new NotificationService(this.notification);
        this.loaderService = new LoaderService(this.loader, this.loaderText, this.views, this.customEventManager);
        this.fileService = new FileService(this);
        this.verovioService = new VerovioService({
            verovioVersion: this.options.verovioVersion,
            verovioUrl: this.options.verovioUrl,
            validatorUrl: this.options.validatorUrl,
            pdfkitUrl: this.options.pdfkitUrl,
            host: this.host,
            enableEditor: this.options.enableEditor,
            enableValidation: this.options.enableValidation,
            schema: this.options.schema,
            schemaBasic: this.options.schemaBasic,
        });
        this.verovio = this.verovioService.verovio;
        this.validator = this.verovioService.validator;
        this.rngLoader = this.verovioService.rngLoader;
        this.rngLoaderBasic = this.verovioService.rngLoaderBasic;
        // PDF object - will be created only if necessary
        this.pdf = null;
        // Handling the resizing of the window
        this.resizeTimer = 0; // Used to prevent per-pixel re-render events when the window is resized
        window.onresize = this.onResize.bind(this);
        window.onbeforeunload = this.onBeforeUnload.bind(this);
        //window.addEventListener("beforeunload", this.onBeforeUnload);
        this.customEventManager.bind(this, AppEvent.Resized, this.onResized);
        this.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
        this.verovioOptions = {
            pageHeight: 2970,
            pageWidth: 2100,
            pageMarginLeft: 50,
            pageMarginRight: 50,
            pageMarginTop: 50,
            pageMarginBottom: 50,
            scale: 100,
            xmlIdSeed: 1,
        };
        this.pageCount = 0;
        this.currentZoomIndex = 4;
        this.verovioRuntimeVersion = "";
        // Set to true when everything is loaded
        this.appIsLoaded = false;
        // Use to avoid saving config when resetting the app
        this.appReset = false;
        const last = this.fileStack.getLast();
        if (last) {
            console.log("Reloading", last.filename);
            this.fileService.loadData(last.data, last.filename);
        }
        // Listen and wait for Module to emit onRuntimeInitialized
        this.loaderService.start("Loading Verovio ...");
        this.verovioService
            .init({
            verovioVersion: this.options.verovioVersion,
            verovioUrl: this.options.verovioUrl,
            validatorUrl: this.options.validatorUrl,
            pdfkitUrl: this.options.pdfkitUrl,
            host: this.host,
            enableEditor: this.options.enableEditor,
            enableValidation: this.options.enableValidation,
            schema: this.options.schema,
            schemaBasic: this.options.schemaBasic,
        })
            .then((version) => {
            this.verovioRuntimeVersion = version;
            this.loaderService.end();
            this.createInterfaceAndLoadData();
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    getView() {
        return this.view;
    }
    getToolbarView() {
        return this.toolbarView;
    }
    getMidiPlayer() {
        return this.midiPlayer;
    }
    getPageCount() {
        return this.pageCount;
    }
    setPageCount(pageCount) {
        this.pageCount = pageCount;
    }
    getCurrentZoomIndex() {
        return this.currentZoomIndex;
    }
    isLoaded() {
        return this.appIsLoaded;
    }
    getCurrentSchema() {
        return this.currentSchema;
    }
    setCurrentSchema(schema) {
        this.currentSchema = schema;
    }
    get pdfWorker() {
        return this.pdf;
    }
    set pdfWorker(pdf) {
        this.pdf = pdf;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    destroy() {
        this.eventManager.unbindAll();
    }
    createInterfaceAndLoadData() {
        this.loaderService.start("Create the interface ...");
        this.createToolbar();
        this.createViews();
        this.createStatusbar();
        this.customEventManager.bind(this, AppEvent.Resized, this.onResized);
        this.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
        if (this.options.isSafari) {
            this.notificationService.show("It seems that you are using Safari, on which XML validation unfortunately does not work.<br/>Please use another browser to have XML validation enabled.");
        }
        this.appIsLoaded = true;
        this.loaderService.end();
        if (this.fileService.getInputData()) {
            this.fileService.loadMEI(false);
        }
    }
    createViews() {
        this.loaderService.start("Loading the views ...");
        this.view = null;
        this.toolbarView = null;
        if (this.options.enableDocument) {
            this.currentZoomIndex = this.options.documentZoom;
            this.view1 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewDocumentObj = new DocumentView(this.view1, this, this.verovio);
            this.customEventManager.addToPropagationList(this.viewDocumentObj.customEventManager);
            if (this.options.defaultView === "document") {
                this.view = this.viewDocumentObj;
                this.toolbarView = this.viewDocumentObj;
            }
        }
        if (this.options.enableEditor) {
            this.currentZoomIndex = this.options.editorZoom;
            this.view2 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewEditorObj = new EditorPanel(this.view2, this, this.verovio, this.validator, this.rngLoader);
            this.customEventManager.addToPropagationList(this.viewEditorObj.customEventManager);
            if (this.options.defaultView === "editor") {
                this.view = this.viewEditorObj;
                this.toolbarView = this.viewEditorObj.editorViewObj;
            }
        }
        if (this.options.enableResponsive) {
            this.currentZoomIndex = this.options.responsiveZoom;
            this.view3 = appendDivTo(this.views, { class: `vrv-view` });
            this.viewResponsiveObj = new ResponsiveView(this.view3, this, this.verovio);
            this.customEventManager.addToPropagationList(this.viewResponsiveObj.customEventManager);
            if (this.options.defaultView === "responsive") {
                this.view = this.viewResponsiveObj;
                this.toolbarView = this.viewResponsiveObj;
            }
        }
        // Root element in which verovio-ui is created
        if (!this.view) {
            throw `No view enabled or unknown default view '${this.options.defaultView}' selected.`;
        }
        this.loaderService.end();
        this.view.customEventManager.dispatch(createAppEvent(AppEvent.Activate));
    }
    createToolbar() {
        this.toolbarObj = new AppToolbar(this.toolbar, this);
        this.customEventManager.addToPropagationList(this.toolbarObj.customEventManager);
        this.midiToolbarObj = new MidiToolbar(this.toolbar, this);
        this.midiPlayer = new MidiPlayer(this.midiToolbarObj);
        this.customEventManager.addToPropagationList(this.midiToolbarObj.customEventManager);
        this.contextMenuObj = new ContextMenu(this.contextMenu, this, this.contextUnderlay);
        this.customEventManager.addToPropagationList(this.contextMenuObj.customEventManager);
        this.div.addEventListener("contextmenu", (e) => e.preventDefault());
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
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async playMEI() {
        const expansionMap = await this.verovio.renderToExpansionMap();
        this.midiPlayer.setExpansionMap(expansionMap);
        const base64midi = await this.verovio.renderToMIDI();
        const midiFile = "data:audio/midi;base64," + base64midi;
        this.midiPlayer.playFile(midiFile);
    }
    async applySelection() {
        let selection = this.options.selection;
        if (!selection || Object.keys(selection).length === 0)
            selection = {};
        await this.verovio.select(selection);
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onResized(e) {
        // Minimal height and width
        //if (this.element.clientHeight < 400) this.element.style.height = `${400}px`;
        //if (this.element.clientWidth < 200) this.element.style.width = `${200}px`;
        let height = this.div.clientHeight -
            this.toolbar.clientHeight -
            this.statusbar.clientHeight;
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
            this.options.responsiveZoom =
                this.viewResponsiveObj.getCurrentZoomIndex();
        if (this.viewEditorObj)
            this.options.editorZoom =
                this.viewEditorObj.editorViewObj.getCurrentZoomIndex();
        // Store current view
        if (this.view == this.viewDocumentObj)
            this.options.defaultView = "document";
        else if (this.view == this.viewResponsiveObj)
            this.options.defaultView = "responsive";
        else if (this.view == this.viewEditorObj)
            this.options.defaultView = "editor";
        // Do not store selection and editorial
        delete this.options["selection"];
        delete this.options["editorial"];
        delete this.options["showDevFeatures"];
        this.storageProvider.setItem("options", JSON.stringify(this.options));
        this.fileStack.store(this.fileService.getFilename(), this.fileService.getInputData());
    }
    onResize(e) {
        clearTimeout(this.resizeTimer);
        const timerThis = this;
        this.resizeTimer = setTimeout(function () {
            timerThis.loaderService.start("Resizing ...", true);
            timerThis.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
        }, 100);
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    prevPage(e) {
        if (this.toolbarView.getCurrentPage() > 1) {
            this.toolbarView.setCurrentPage(this.toolbarView.getCurrentPage() - 1);
            this.loaderService.start("Loading content ...", true);
            this.customEventManager.dispatch(createAppEvent(AppEvent.Page));
        }
    }
    nextPage(e) {
        if (this.toolbarView.getCurrentPage() < this.pageCount) {
            this.toolbarView.setCurrentPage(this.toolbarView.getCurrentPage() + 1);
            this.loaderService.start("Loading content ...", true);
            this.customEventManager.dispatch(createAppEvent(AppEvent.Page));
        }
    }
    zoomOut(e) {
        if (this.toolbarView.getCurrentZoomIndex() > 0) {
            this.toolbarView.setCurrentZoomIndex(this.toolbarView.getCurrentZoomIndex() - 1);
            this.loaderService.start("Adjusting size ...", true);
            this.customEventManager.dispatch(createAppEvent(AppEvent.Zoom));
        }
    }
    zoomIn(e) {
        if (this.toolbarView.getCurrentZoomIndex() < this.zoomLevels.length - 1) {
            this.toolbarView.setCurrentZoomIndex(this.toolbarView.getCurrentZoomIndex() + 1);
            this.loaderService.start("Adjusting size ...", true);
            this.customEventManager.dispatch(createAppEvent(AppEvent.Zoom));
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
        if (element.dataset.ext === "MEI")
            this.input.accept = ".xml, .mei";
        else if (element.dataset.ext === "MusicXML")
            this.input.accept = ".xml, .musicxml";
        else if (element.dataset.ext === "CMME")
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
        const convert = element.dataset.ext != "MEI" ? true : false;
        reader.onload = async function (e) {
            readerThis.fileService.loadData(e.target.result, filename, convert);
        };
        reader.readAsText(file);
    }
    async fileExport(e) {
        const dlg = new DialogExport(this.dialogDiv, this, "Select MEI export parameters");
        const dlgRes = await dlg.show();
        if (dlgRes === 0)
            return;
        this.loaderService.start("Generating MEI file ...");
        this.fileService.generateMEI(dlg.getExportOptions(), this.output);
    }
    async fileExportPDF(e) {
        this.loaderService.start("Generating PDF file ...");
        this.fileService.generatePDF(this.output);
    }
    async fileExportMIDI(e) {
        this.loaderService.start("Generating MIDI file ...");
        this.fileService.generateMIDI(this.output);
    }
    async fileCopyToClipboard(e) {
        const dlg = new DialogExport(this.dialogDiv, this, "Select MEI export parameters");
        const dlgRes = await dlg.show();
        if (dlgRes === 0)
            return;
        const mei = await this.verovio.getMEI(dlg.getExportOptions());
        this.fileCopy.value = mei;
        this.fileCopy.select();
        document.execCommand("copy");
        this.notificationService.show("MEI copied to clipboard");
    }
    async fileLoadRecent(e) {
        const element = e.target;
        //console.log( e.target.dataset.idx );
        let file = this.fileStack.load(Number(element.dataset.idx));
        this.fileService.loadData(file.data, file.filename);
    }
    async fileSelection(e) {
        const dlg = new DialogSelection(this.dialogDiv, this, "Apply a selection to the file currently loaded", { okLabel: "Apply", icon: "info", type: Dialog.Type.OKCancel }, this.options.selection);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
            this.options.selection = dlg.getSelection();
            await this.applySelection();
            this.customEventManager.dispatch(createAppEvent(AppEvent.LoadData, {
                currentId: this.clientId,
                caller: this.view,
                reload: true,
            }));
        }
    }
    async githubImport(e) {
        const dlg = new DialogGhImport(this.dialogDiv, this, "Import an MEI file from GitHub", {}, this.githubManager);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
            this.fileService.loadData(dlg.getData(), dlg.getFilename());
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
                const dlg = new Dialog(this.dialogDiv, this, "Reloading the editor", {
                    okLabel: "Yes",
                    icon: "question",
                });
                dlg.setContent(marked.parse(reloadMsg));
                if ((await dlg.show()) === 0)
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
            this.customEventManager.dispatch(createAppEvent(AppEvent.LoadData, {
                currentId: this.clientId,
                caller: this.view,
                reload: true,
            }));
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
        const dlg = new Dialog(this.dialogDiv, this, "Reset to default", {
            okLabel: "Yes",
            icon: "question",
        });
        dlg.setContent(marked.parse(resetMsg));
        if ((await dlg.show()) === 0)
            return;
        this.fileStack.reset();
        this.storageProvider.removeItem("options");
        this.appReset = true;
        location.reload();
    }
    async setView(e) {
        const element = e.target;
        if (this.midiPlayer && this.midiPlayer.isPlaying()) {
            this.midiPlayer.stop();
        }
        this.view.customEventManager.dispatch(createAppEvent(AppEvent.Deactivate));
        if (element.dataset.view == "document") {
            this.view = this.viewDocumentObj;
            this.toolbarView = this.viewDocumentObj;
        }
        else if (element.dataset.view == "editor") {
            this.view = this.viewEditorObj;
            this.toolbarView = this.viewEditorObj.editorViewObj;
        }
        else if (element.dataset.view == "responsive") {
            this.view = this.viewResponsiveObj;
            this.toolbarView = this.viewResponsiveObj;
        }
        this.loaderService.start("Switching view ...");
        this.view.customEventManager.dispatch(createAppEvent(AppEvent.Activate));
        this.customEventManager.dispatch(createAppEvent(AppEvent.LoadData, {
            currentId: this.clientId,
            caller: this.view,
            reload: true,
            lightEndLoading: false,
        }));
        this.toolbarObj.customEventManager.dispatch(createAppEvent(AppEvent.Activate));
    }
}
////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////
(function (App) {
    function iconFor(element, host) {
        const elements = [
            "accid",
            "annot",
            "app",
            "arpeg",
            "artic",
            "beam",
            "beamSpan",
            "beatRpt",
            "bracketSpan",
            "breath",
            "bTrem",
            "caesura",
            "choice",
            "chord",
            "clef",
            "cpMark",
            "custos",
            "dir",
            "dynam",
            "ending",
            "f",
            "fb",
            "fermata",
            "fing",
            "fTrem",
            "gliss",
            "graceGrp",
            "hairpin",
            "halfmRpt",
            "harm",
            "keySig",
            "layer",
            "layerDef",
            "lb",
            "lv",
            "mdiv",
            "measure",
            "meterSig",
            "mordent",
            "mRest",
            "mRpt",
            "mRpt2",
            "mSpace",
            "multiRest",
            "multiRpt",
            "note",
            "octave",
            "ornam",
            "pb",
            "pedal",
            "phrase",
            "reh",
            "rend",
            "repeatMark",
            "rest",
            "sb",
            "score",
            "scoreDef",
            "section",
            "slur",
            "staff",
            "staffDef",
            "syl",
            "symbol",
            "tempo",
            "text",
            "tie",
            "trill",
            "tuplet",
            "tupletSpan",
            "turn",
            "verse",
        ];
        if (!elements.includes(element)) {
            element = "missing";
        }
        return `${host}/icons/mei/${element}.png`;
    }
    App.iconFor = iconFor;
})(App || (App = {}));
//# sourceMappingURL=app.js.map
/**
 * The App class is the main class of the application.
 * It requires a HTMLDivElement to be put on.
 */
import { Dialog } from "./dialogs/dialog.js";
import { DialogAbout } from "./dialogs/dialog-about.js";
import { DialogExport } from "./dialogs/dialog-export.js";
import { DialogSelection } from "./dialogs/dialog-selection.js";
import { DialogSettingsEditor } from "./dialogs/dialog-settings-editor.js";
import { DialogSettingsVerovio } from "./dialogs/dialog-settings-verovio.js";
import { CustomEventManager } from "./events/custom-event-manager.js";
import { EventManager } from "./events/event-manager.js";
import { FileStack } from "./utils/file-stack.js";
import { appendAnchorTo, appendDivTo, appendInputTo, appendLinkTo, appendTextAreaTo, } from "./utils/functions.js";
import { aboutMsg, reloadMsg, resetMsg, version } from "./utils/messages.js";
import { AppEvent, createAppEvent } from "./events/event-types.js";
import { NotificationService } from "./utils/notification-service.js";
import { LoaderService } from "./utils/loader-service.js";
import { VerovioService } from "./verovio/verovio-service.js";
import { FileService } from "./utils/file-service.js";
import { LocalStorageProvider, NoStorageProvider, } from "./utils/storage-provider.js";
const filter = "/svg/filter.xml";
export class App {
    // Plugin System Foundation
    plugins;
    services;
    commands;
    extensions;
    viewsRegistry;
    // public readonly members
    dialogDiv;
    host;
    customEventManager;
    zoomLevels;
    eventManager;
    id;
    get githubManager() {
        return this.getService("github-manager");
    }
    get validator() {
        return this.getService("validator");
    }
    get rngLoader() {
        return this.getService("rng-loader");
    }
    get rngLoaderBasic() {
        return this.getService("rng-loader-basic");
    }
    get pdfWorker() {
        return this.getService("pdf-worker");
    }
    set pdfWorker(pdf) {
        this.registerService("pdf-worker", pdf);
    }
    options;
    fileStack;
    storageProvider;
    eventTarget;
    verovio;
    verovioOptions;
    // private members
    view;
    toolbarView;
    get midiPlayer() {
        return this.getService("midi-player");
    }
    // services
    notificationService;
    loaderService;
    verovioService;
    fileService;
    pageCount;
    currentZoomIndex;
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
    appIsLoaded = false;
    appReset = false;
    verovioRuntimeVersion = "";
    resizeTimer;
    clientId;
    div;
    constructor(div, options) {
        this.plugins = new Map();
        this.services = new Map();
        this.commands = new Map();
        this.extensions = new Map();
        this.viewsRegistry = new Map();
        this.clientId = options?.githubClientId || "fd81068a15354a300522";
        this.host =
            options?.baseUrl ||
                (window.location.hostname == "localhost"
                    ? `http://${window.location.host}`
                    : "https://editor.verovio.org");
        this.id = this.clientId;
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
            enableToolbar: true,
            enableMidiToolbar: true,
            enableContextMenu: true,
            enableFilter: true,
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
        this.eventTarget = new EventTarget();
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
        if (this.options.injectStyles !== false) {
            appendLinkTo(document.head, {
                href: `${this.host}/css/verovio.css`,
                rel: `stylesheet`,
            });
        }
        this.eventManager = new EventManager(this);
        this.customEventManager = new CustomEventManager();
        // Bridge internal events to public eventTarget
        // Use a unique ID for the bridge to avoid blocking other bindings on 'this'
        const bridgeObj = { id: `bridge-${this.id}` };
        Object.values(AppEvent).forEach((ev) => {
            this.customEventManager.bind(bridgeObj, ev, (e) => {
                this.eventTarget.dispatchEvent(new CustomEvent(ev, { detail: e.detail }));
            });
        });
        if (this.options.enableFilter) {
            this.createFilter();
        }
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
        if (!this.options.enableToolbar && !this.options.enableMidiToolbar) {
            this.toolbar.style.display = "none";
        }
        // Views
        this.views = appendDivTo(this.wrapper, { class: `vrv-views` });
        // Loader
        this.loader = appendDivTo(this.views, { class: `vrv-loading` });
        this.loaderText = appendDivTo(this.loader, { class: `vrv-loading-text` });
        // Status bar
        this.statusbar = appendDivTo(this.wrapper, { class: `vrv-statusbar` });
        if (!this.options.enableStatusbar) {
            this.statusbar.style.display = "none";
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
        // PDF object - will be created only if necessary
        // this.pdf = null; // Property removed, handled by setter/service
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
    get container() { return this.div; }
    get toolbarElement() { return this.toolbar; }
    get viewsElement() { return this.views; }
    get statusbarElement() { return this.statusbar; }
    get dialogElement() { return this.dialogDiv; }
    get toolbarObj() { return this.getService("toolbar"); }
    get contextMenuObj() { return this.getService("context-menu"); }
    get viewEditorObj() { return this.getService("xml-editor-view"); }
    getView() {
        return this.view;
    }
    getToolbarView() {
        return this.toolbarView;
    }
    getMidiPlayer() {
        return this.midiPlayer;
    }
    getRuntimeVersion() {
        return this.verovioRuntimeVersion;
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
    loadData(data, filename = "untitled.xml", convert = false, onlyIfEmpty = false) {
        this.fileService.loadData(data, filename, convert, onlyIfEmpty);
    }
    on(type, callback, options) {
        this.eventTarget.addEventListener(type, callback, options);
    }
    off(type, callback, options) {
        this.eventTarget.removeEventListener(type, callback, options);
    }
    dispatchEvent(event) {
        return this.eventTarget.dispatchEvent(event);
    }
    getCurrentSchema() {
        return this.currentSchema;
    }
    setCurrentSchema(schema) {
        this.currentSchema = schema;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    destroy() {
        this.eventManager.unbindAll();
    }
    createInterfaceAndLoadData() {
        this.loaderService.start("Create the interface ...");
        this.createViews();
        this.createToolbar();
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
        this.view = null;
        this.toolbarView = null;
    }
    createToolbar() {
        this.div.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    createStatusbar() {
    }
    createFilter() {
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async playMEI() {
        this.executeCommand("midi.playMEI");
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
        for (const [id, view] of this.viewsRegistry.entries()) {
            if (id === "document")
                this.options.documentZoom = view.getCurrentZoomIndex();
            else if (id === "responsive")
                this.options.responsiveZoom = view.getCurrentZoomIndex();
            else if (id === "editor")
                this.options.editorZoom = view.getCurrentZoomIndex();
        }
        // Store current view
        for (const [id, view] of this.viewsRegistry.entries()) {
            if (this.view === view) {
                this.options.defaultView = id;
                break;
            }
        }
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
    // Public API methods
    ////////////////////////////////////////////////////////////////////////
    goToPreviousPage() {
        if (this.toolbarView.getCurrentPage() > 1) {
            this.toolbarView.setCurrentPage(this.toolbarView.getCurrentPage() - 1);
            this.loaderService.start("Loading content ...", true);
            this.customEventManager.dispatch(createAppEvent(AppEvent.Page));
        }
    }
    goToNextPage() {
        if (this.toolbarView.getCurrentPage() < this.pageCount) {
            this.toolbarView.setCurrentPage(this.toolbarView.getCurrentPage() + 1);
            this.loaderService.start("Loading content ...", true);
            this.customEventManager.dispatch(createAppEvent(AppEvent.Page));
        }
    }
    setZoom(index) {
        if (index >= 0 && index < this.zoomLevels.length) {
            this.toolbarView.setCurrentZoomIndex(index);
            this.loaderService.start("Adjusting size ...", true);
            this.customEventManager.dispatch(createAppEvent(AppEvent.Zoom));
        }
    }
    zoomOutView() {
        if (this.toolbarView.getCurrentZoomIndex() > 0) {
            this.setZoom(this.toolbarView.getCurrentZoomIndex() - 1);
        }
    }
    zoomInView() {
        if (this.toolbarView.getCurrentZoomIndex() < this.zoomLevels.length - 1) {
            this.setZoom(this.toolbarView.getCurrentZoomIndex() + 1);
        }
    }
    play() {
        if (this.midiPlayer) {
            this.midiPlayer.play();
        }
    }
    pause() {
        if (this.midiPlayer && this.midiPlayer.isPlaying()) {
            this.midiPlayer.pause();
        }
    }
    stop() {
        if (this.midiPlayer) {
            this.midiPlayer.stop();
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    prevPage(e) {
        this.goToPreviousPage();
    }
    nextPage(e) {
        this.goToNextPage();
    }
    zoomOut(e) {
        this.zoomOutView();
    }
    zoomIn(e) {
        this.zoomInView();
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
        if (this.options.useCustomDialogs) {
            const event = new CustomEvent("onExportRequest", { cancelable: true });
            this.eventTarget.dispatchEvent(event);
            if (event.defaultPrevented)
                return;
        }
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
        if (this.options.useCustomDialogs) {
            const event = new CustomEvent("onExportRequest", { cancelable: true });
            this.eventTarget.dispatchEvent(event);
            if (event.defaultPrevented)
                return;
        }
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
        if (this.options.useCustomDialogs) {
            const event = new CustomEvent("onSelectionRequest", { cancelable: true });
            this.eventTarget.dispatchEvent(event);
            if (event.defaultPrevented)
                return;
        }
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
        this.executeCommand("github.import");
    }
    async githubExport(e) {
        this.executeCommand("github.export");
    }
    async settingsEditor(e) {
        if (this.options.useCustomDialogs) {
            const event = new CustomEvent("onSettingsRequest", { cancelable: true, detail: { type: "editor" } });
            this.eventTarget.dispatchEvent(event);
            if (event.defaultPrevented)
                return;
        }
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
        if (this.options.useCustomDialogs) {
            const event = new CustomEvent("onSettingsRequest", { cancelable: true, detail: { type: "verovio" } });
            this.eventTarget.dispatchEvent(event);
            if (event.defaultPrevented)
                return;
        }
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
        const viewName = element.dataset.view;
        if (viewName) {
            this.setViewByName(viewName);
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Plugin System Methods
    ////////////////////////////////////////////////////////////////////////
    use(plugin) {
        if (this.plugins.has(plugin.id)) {
            console.warn(`Plugin with id '${plugin.id}' is already registered.`);
            return this;
        }
        this.plugins.set(plugin.id, plugin);
        plugin.install(this);
        return this;
    }
    getPlugin(id) {
        return this.plugins.get(id);
    }
    async initPlugins() {
        for (const plugin of this.plugins.values()) {
            if (plugin.init) {
                await plugin.init();
            }
        }
    }
    registerService(id, service) {
        if (this.services.has(id)) {
            console.warn(`Service with id '${id}' is already registered.`);
            return;
        }
        this.services.set(id, service);
    }
    getService(id) {
        return this.services.get(id);
    }
    registerCommand(id, handler) {
        if (this.commands.has(id)) {
            console.warn(`Command with id '${id}' is already registered.`);
            return;
        }
        this.commands.set(id, handler);
    }
    executeCommand(id, ...args) {
        const handler = this.commands.get(id);
        if (handler) {
            return handler(...args);
        }
        else {
            console.warn(`Command with id '${id}' not found.`);
        }
    }
    registerView(id, view) {
        this.viewsRegistry.set(id, view);
        if (this.options.defaultView === id || !this.view) {
            this.view = view;
            this.toolbarView = view; // Default, might be overridden by plugins
        }
    }
    setViewByName(id) {
        const newView = this.viewsRegistry.get(id);
        if (!newView) {
            console.warn(`View with id '${id}' not found.`);
            return;
        }
        if (this.midiPlayer && this.midiPlayer.isPlaying()) {
            this.midiPlayer.stop();
        }
        if (this.view) {
            this.view.customEventManager.dispatch(createAppEvent(AppEvent.Deactivate));
        }
        this.view = newView;
        // For EditorPanel, the toolbarView is actually an internal property, 
        // we might need a better way to handle this.
        // Let's assume the view knows what its toolbarView is.
        this.toolbarView = newView.editorViewObj || newView;
        this.loaderService.start("Switching view ...");
        this.view.customEventManager.dispatch(createAppEvent(AppEvent.Activate));
        this.customEventManager.dispatch(createAppEvent(AppEvent.LoadData, {
            currentId: this.clientId,
            caller: this.view,
            reload: true,
            lightEndLoading: false,
        }));
    }
    contribute(point, contribution) {
        if (!this.extensions.has(point)) {
            this.extensions.set(point, []);
        }
        this.extensions.get(point).push(contribution);
    }
    getContributions(point) {
        return (this.extensions.get(point) || []);
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
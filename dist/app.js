/**
 * The App class is the main class of the application (aliased as VerovioEditor).
 * It manages the lifecycle of plugins and the core Verovio engine.
 */
import { CustomEventManager } from "./events/custom-event-manager.js";
import { EventManager } from "./events/event-manager.js";
import { FileStack } from "./utils/file-stack.js";
import { appendAnchorTo, appendDivTo, appendInputTo, appendLinkTo, appendTextAreaTo, } from "./utils/functions.js";
import { version } from "./utils/messages.js";
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
    // Public members
    dialogDiv;
    host;
    customEventManager;
    zoomLevels;
    eventManager;
    id;
    fileStack;
    storageProvider;
    options;
    // Internal engine
    verovio;
    verovioService;
    fileService;
    verovioOptions;
    // DOM Elements
    toolbar;
    views;
    loader;
    loaderText;
    statusbar;
    wrapper;
    notification;
    contextUnderlay;
    contextMenu;
    input;
    output;
    fileCopy;
    appIsLoaded = false;
    appReset = false;
    verovioRuntimeVersion = "";
    resizeTimer;
    view;
    toolbarView;
    pageCount = 0;
    currentZoomIndex = 4;
    currentSchema;
    eventTarget;
    clientId;
    div;
    notificationService;
    loaderService;
    // Deferred initialization
    queuedData = null;
    resolveReady;
    ready;
    constructor(div, options = {}, plugins = []) {
        this.div = div;
        this.plugins = new Map();
        this.services = new Map();
        this.commands = new Map();
        this.extensions = new Map();
        this.viewsRegistry = new Map();
        this.eventTarget = new EventTarget();
        this.customEventManager = new CustomEventManager();
        this.ready = new Promise((resolve) => {
            this.resolveReady = resolve;
        });
        this.clientId = options?.githubClientId || "fd81068a15354a300522";
        this.host = options?.baseUrl || (window.location.hostname == "localhost" ? `http://${window.location.host}` : "https://editor.verovio.org");
        this.id = this.clientId;
        this.options = Object.assign({
            version: options.version || version,
            verovioVersion: "latest",
            documentViewMargin: 100,
            documentViewPageBorder: 1,
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
            selection: {},
            editorial: {},
            schemaDefault: "https://music-encoding.org/schema/5.1/mei-all.rng",
            schema: "https://music-encoding.org/schema/5.1/mei-all.rng",
            schemaBasic: "https://music-encoding.org/schema/5.1/mei-basic.rng",
            defaultView: "responsive",
            isSafari: false,
            disableLocalStorage: false,
        }, options);
        this.zoomLevels = [5, 10, 20, 35, 75, 100, 150, 200];
        this.verovioOptions = {
            pageHeight: 2970, pageWidth: 2100,
            pageMarginLeft: 50, pageMarginRight: 50,
            pageMarginTop: 50, pageMarginBottom: 50,
            scale: 100, xmlIdSeed: 1,
        };
        this.storageProvider = this.options.storageProvider || (this.options.disableLocalStorage ? new NoStorageProvider() : new LocalStorageProvider());
        this.fileStack = new FileStack(this.storageProvider);
        if (this.options.appReset)
            this.fileStack.reset();
        this.setupBaseDOM();
        plugins.forEach(p => this.use(p));
        this.initCore();
    }
    setupBaseDOM() {
        while (this.div.firstChild)
            this.div.firstChild.remove();
        if (this.options.injectStyles !== false) {
            appendLinkTo(document.head, { href: `${this.host}/css/verovio.css`, rel: `stylesheet` });
        }
        this.wrapper = appendDivTo(this.div, { class: `vrv-wrapper` });
        this.notification = appendDivTo(this.wrapper, { class: `vrv-notification disabled` });
        this.contextUnderlay = appendDivTo(this.wrapper, { class: `vrv-context-underlay` });
        this.contextMenu = appendDivTo(this.wrapper, { class: `vrv-context-menu` });
        this.dialogDiv = appendDivTo(this.wrapper, { class: `vrv-dialog` });
        this.toolbar = appendDivTo(this.wrapper, { class: `vrv-toolbar` });
        this.views = appendDivTo(this.wrapper, { class: `vrv-views` });
        this.loader = appendDivTo(this.views, { class: `vrv-loading` });
        this.loaderText = appendDivTo(this.loader, { class: `vrv-loading-text` });
        this.statusbar = appendDivTo(this.wrapper, { class: `vrv-statusbar` });
        if (!this.options.enableToolbar && !this.options.enableMidiToolbar)
            this.toolbar.style.display = "none";
        if (!this.options.enableStatusbar) {
            this.statusbar.style.display = "none";
            this.statusbar.style.minHeight = "0px";
        }
        this.input = appendInputTo(this.div, { type: `file`, class: `vrv-file-input` });
        this.input.onchange = this.fileInput.bind(this);
        this.output = appendAnchorTo(this.div, { class: `vrv-file-output` });
        this.fileCopy = appendTextAreaTo(this.div, { class: `vrv-file-copy` });
        this.notificationService = new NotificationService(this.notification);
        this.loaderService = new LoaderService(this.loader, this.loaderText, this.views, this.customEventManager);
        this.eventManager = new EventManager(this);
        this.fileService = new FileService(this);
        const bridgeId = `bridge-${this.id}`;
        Object.values(AppEvent).forEach((ev) => {
            this.customEventManager.bind({ id: bridgeId }, ev, (e) => {
                this.eventTarget.dispatchEvent(new CustomEvent(ev, { detail: e.detail }));
            });
        });
        window.onresize = this.onResize.bind(this);
        window.onbeforeunload = this.onBeforeUnload.bind(this);
    }
    async initCore() {
        const vrvOptions = Object.assign({}, this.options, { host: this.host });
        this.verovioService = new VerovioService(vrvOptions);
        this.verovio = this.verovioService.verovio;
        this.loaderService.start("Loading Verovio ...");
        this.verovioRuntimeVersion = await this.verovioService.init(vrvOptions);
        await this.initPlugins();
        if (this.options.enableFilter)
            this.createFilter();
        this.appIsLoaded = true;
        this.loaderService.end();
        const last = this.fileStack.getLast();
        if (last && !this.queuedData) {
            this.loadData(last.data, last.filename);
        }
        this.resolveReady();
        if (this.queuedData) {
            const { data, filename, convert, onlyIfEmpty } = this.queuedData;
            this.loadData(data, filename, convert, onlyIfEmpty);
            this.queuedData = null;
        }
    }
    loadData(data, filename = "untitled.xml", convert = false, onlyIfEmpty = false) {
        if (!this.appIsLoaded) {
            this.queuedData = { data, filename, convert, onlyIfEmpty };
            return;
        }
        this.fileService.loadData(data, filename, convert, onlyIfEmpty);
    }
    use(plugin) {
        if (this.plugins.has(plugin.id))
            return this;
        this.plugins.set(plugin.id, plugin);
        plugin.install(this);
        return this;
    }
    async initPlugins() {
        for (const plugin of this.plugins.values()) {
            if (plugin.init)
                await plugin.init();
        }
    }
    registerView(id, view) {
        this.viewsRegistry.set(id, view);
        if (this.options.defaultView === id || !this.view) {
            this.view = view;
            this.toolbarView = view.editorViewObj || view;
            // Activate the view safely with an empty event
            this.view.onActivate(createAppEvent(AppEvent.Activate));
        }
    }
    registerService(id, service) { this.services.set(id, service); }
    getService(id) { return this.services.get(id); }
    registerCommand(id, handler) { this.commands.set(id, handler); }
    executeCommand(id, ...args) {
        const handler = this.commands.get(id);
        return handler ? handler(...args) : console.warn(`Command ${id} not found`);
    }
    contribute(point, contribution) {
        if (!this.extensions.has(point))
            this.extensions.set(point, []);
        this.extensions.get(point).push(contribution);
    }
    getContributions(point) { return (this.extensions.get(point) || []); }
    getView() { return this.view; }
    getToolbarView() { return this.toolbarView; }
    getPageCount() { return this.pageCount; }
    setPageCount(val) { this.pageCount = val; }
    getCurrentZoomIndex() { return this.currentZoomIndex; }
    isLoaded() { return this.appIsLoaded; }
    on(type, cb, opt) { this.eventTarget.addEventListener(type, cb, opt); }
    off(type, cb, opt) { this.eventTarget.removeEventListener(type, cb, opt); }
    dispatchEvent(ev) { return this.eventTarget.dispatchEvent(ev); }
    getCurrentSchema() { return this.currentSchema; }
    setCurrentSchema(s) { this.currentSchema = s; }
    createFilter() {
        const filterDiv = appendDivTo(this.div, { class: `vrv-filter` });
        fetch(`${this.host}${filter}`).then(r => r.text()).then(xml => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, "text/xml");
            filterDiv.appendChild(doc.documentElement);
        });
    }
    onResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
        }, 100);
    }
    onBeforeUnload() {
        if (this.appReset)
            return;
        for (const [id, view] of this.viewsRegistry.entries()) {
            if (id === "document")
                this.options.documentZoom = view.getCurrentZoomIndex();
            else if (id === "responsive")
                this.options.responsiveZoom = view.getCurrentZoomIndex();
            else if (id === "editor")
                this.options.editorZoom = view.editorViewObj?.getCurrentZoomIndex() || view.getCurrentZoomIndex();
        }
        this.storageProvider.setItem("options", JSON.stringify(this.options));
    }
    async setView(e) {
        const viewName = e.target.dataset.view;
        if (viewName)
            this.setViewByName(viewName);
    }
    setViewByName(id) {
        const newView = this.viewsRegistry.get(id);
        if (!newView || this.view === newView)
            return;
        if (this.view)
            this.view.onDeactivate(null);
        this.view = newView;
        this.toolbarView = newView.editorViewObj || newView;
        this.view.onActivate(null);
        this.fileService.loadMEI(false);
    }
    destroy() { this.eventManager.unbindAll(); }
    async fileInput(e) {
        const file = e.target.files[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => this.loadData(e.target.result, file.name);
        reader.readAsText(file);
    }
    get container() { return this.div; }
    get toolbarElement() { return this.toolbar; }
    get viewsElement() { return this.views; }
    get statusbarElement() { return this.statusbar; }
    get dialogElement() { return this.dialogDiv; }
    get contextUnderlayElement() { return this.contextUnderlay; }
    get githubManager() { return this.getService("github-manager"); }
    get validator() { return this.getService("validator"); }
    get rngLoader() { return this.getService("rng-loader"); }
    get rngLoaderBasic() { return this.getService("rng-loader-basic"); }
    get pdfWorker() { return this.getService("pdf-worker"); }
    set pdfWorker(pdf) { this.registerService("pdf-worker", pdf); }
    get midiPlayer() { return this.getService("midi-player"); }
    get toolbarObj() { return this.getService("toolbar"); }
    get contextMenuObj() { return this.getService("context-menu"); }
    get viewEditorObj() { return this.getService("xml-editor-view"); }
    getMidiPlayer() { return this.midiPlayer; }
    getPlugin(id) { return this.plugins.get(id); }
    getRuntimeVersion() { return this.verovioRuntimeVersion; }
    goToPreviousPage() { this.executeCommand("view.prevPage"); }
    goToNextPage() { this.executeCommand("view.nextPage"); }
    setZoom(index) { }
    zoomOutView() { this.executeCommand("view.zoomOut"); }
    zoomInView() { this.executeCommand("view.zoomIn"); }
    play() { this.executeCommand("midi.play"); }
    pause() { this.executeCommand("midi.pause"); }
    stop() { this.executeCommand("midi.stop"); }
    playMEI = () => this.executeCommand("midi.playMEI");
    fileImport = (e) => { this.executeCommand("file.import"); };
    fileExport = (e) => { this.executeCommand("file.export"); };
    fileExportPDF = (e) => { this.executeCommand("file.exportPDF"); };
    fileExportMIDI = (e) => { this.executeCommand("file.exportMIDI"); };
    fileCopyToClipboard = (e) => { this.executeCommand("file.copyToClipboard"); };
    fileSelection = (e) => { this.executeCommand("file.selection"); };
    fileLoadRecent = (e) => {
        const element = e.target;
        const file = this.fileStack.load(Number(element.dataset.idx));
        this.loadData(file.data, file.filename);
    };
    githubImport = (e) => { this.executeCommand("github.import"); };
    githubExport = (e) => { this.executeCommand("github.export"); };
    settingsEditor = (e) => { this.executeCommand("settings.editor"); };
    settingsVerovio = (e) => { this.executeCommand("settings.verovio"); };
    helpAbout = (e) => { this.executeCommand("help.about"); };
    helpReset = (e) => {
        this.fileStack.reset();
        this.storageProvider.removeItem("options");
        this.appReset = true;
        location.reload();
    };
    login = (e) => { this.executeCommand("github.login"); };
    logout = (e) => { this.executeCommand("github.logout"); };
    prevPage = (e) => { this.goToPreviousPage(); };
    nextPage = (e) => { this.goToNextPage(); };
    zoomOut = (e) => { this.zoomOutView(); };
    zoomIn = (e) => { this.zoomInView(); };
    static iconFor(element, host) {
        const iconBase = `${host}/icons/mei`;
        const icons = {
            note: "note.png", rest: "rest.png", chord: "chord.png", clef: "clef.png",
            keySig: "keySig.png", meterSig: "meterSig.png", slur: "slur.png", tie: "tie.png",
            artic: "artic.png", accid: "accid.png", dynam: "dynam.png", tempo: "tempo.png",
            trill: "trill.png", mordent: "mordent.png", turn: "turn.png", fermata: "fermata.png",
            hairpin: "hairpin.png", pedal: "pedal.png", octave: "octave.png", tuplet: "tuplet.png",
            beam: "beam.png", staff: "staff.png", measure: "measure.png", score: "score.png",
        };
        return icons[element] ? `${iconBase}/${icons[element]}` : `${iconBase}/symbol.png`;
    }
}
//# sourceMappingURL=app.js.map
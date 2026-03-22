/**
 * The App class is the main class of the application (aliased as VerovioEditor).
 * It manages the lifecycle of plugins and the core Verovio engine.
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
import { FileStack, File } from "./utils/file-stack.js";
import { GenericView } from "./utils/generic-view.js";
import { GitHubManager } from "./utils/github-manager.js";
import { MidiPlayer } from "./midi/midi-player.js";
import { MidiToolbar } from "./toolbars/midi-toolbar.js";
import { PDFGenerator } from "./document/pdf-generator.js";
import { ResponsiveView } from "./verovio/responsive-view.js";
import { RNGLoader } from "./xml/rng-loader.js";
import {
  PDFWorkerProxy,
  VerovioWorkerProxy,
  ValidatorWorkerProxy,
} from "./utils/worker-proxy.js";
import { VerovioView } from "./verovio/verovio-view.js";

import {
  appendAnchorTo,
  appendDivTo,
  appendInputTo,
  appendLinkTo,
  appendTextAreaTo,
} from "./utils/functions.js";
import { aboutMsg, reloadMsg, resetMsg, version } from "./utils/messages.js";
import { ContextMenu } from "./toolbars/context-menu.js";
import { AppEvent, createAppEvent } from "./events/event-types.js";
import { NotificationService } from "./utils/notification-service.js";
import { LoaderService } from "./utils/loader-service.js";
import { VerovioService } from "./verovio/verovio-service.js";
import { FileService } from "./utils/file-service.js";
import { EditorPlugin } from "./plugins/plugin.js";
import {
  StorageProvider,
  LocalStorageProvider,
  NoStorageProvider,
} from "./utils/storage-provider.js";

const filter = "/svg/filter.xml";

declare global {
  const marked: any;
}

export class App {
  // Plugin System Foundation
  private readonly plugins: Map<string, EditorPlugin>;
  private readonly services: Map<string, any>;
  private readonly commands: Map<string, Function>;
  private readonly extensions: Map<string, any[]>;
  private readonly viewsRegistry: Map<string, any>;

  // Public members
  public dialogDiv: HTMLDivElement;
  public readonly host: string;
  public customEventManager: CustomEventManager;
  public readonly zoomLevels: Array<number>;
  public eventManager: EventManager;
  public readonly id: string;
  public readonly fileStack: FileStack;
  public readonly storageProvider: StorageProvider;
  public readonly options: App.Options;

  // Internal engine
  public verovio: VerovioWorkerProxy;
  public verovioService: VerovioService;
  public fileService: FileService;
  public verovioOptions: VerovioView.Options;

  // DOM Elements
  public toolbar: HTMLDivElement;
  public views: HTMLDivElement;
  public loader: HTMLDivElement;
  public loaderText: HTMLDivElement;
  public statusbar: HTMLDivElement;
  private wrapper: HTMLDivElement;
  private notification: HTMLDivElement;
  private contextUnderlay: HTMLDivElement;
  public contextMenu: HTMLDivElement;
  public input: HTMLInputElement;
  public output: HTMLAnchorElement;
  private fileCopy: HTMLTextAreaElement;

  private appIsLoaded: boolean = false;
  private appReset: boolean = false;
  private verovioRuntimeVersion: string = "";
  private resizeTimer: any;
  private view: GenericView & VerovioView;
  private toolbarView: VerovioView;
  private pageCount: number = 0;
  private currentZoomIndex: number = 4;
  private currentSchema: string;
  private eventTarget: EventTarget;

  private clientId: string;
  private div: HTMLDivElement;
  public notificationService: NotificationService;
  public loaderService: LoaderService;

  // Deferred initialization
  private queuedData: { data: string; filename: string; convert: boolean; onlyIfEmpty: boolean } | null = null;
  private resolveReady: (value: void | PromiseLike<void>) => void;
  public readonly ready: Promise<void>;

  constructor(div: HTMLDivElement, options: App.Options = {} as App.Options, plugins: EditorPlugin[] = []) {
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
    if (this.options.appReset) this.fileStack.reset();

    this.setupBaseDOM();
    plugins.forEach(p => this.use(p));
    this.initCore();
  }

  private setupBaseDOM(): void {
    while (this.div.firstChild) this.div.firstChild.remove();

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

    if (!this.options.enableToolbar && !this.options.enableMidiToolbar) this.toolbar.style.display = "none";
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
      this.customEventManager.bind({ id: bridgeId } as any, ev, (e: CustomEvent) => {
        this.eventTarget.dispatchEvent(new CustomEvent(ev, { detail: e.detail }));
      });
    });

    window.onresize = this.onResize.bind(this);
    window.onbeforeunload = this.onBeforeUnload.bind(this);
  }

  private async initCore(): Promise<void> {
    const vrvOptions = Object.assign({}, this.options, { host: this.host });
    this.verovioService = new VerovioService(vrvOptions as any);
    this.verovio = this.verovioService.verovio;

    this.loaderService.start("Loading Verovio ...");
    this.verovioRuntimeVersion = await this.verovioService.init(vrvOptions as any);
    
    await this.initPlugins();

    if (this.options.enableFilter) this.createFilter();
    
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

  public loadData(data: string, filename: string = "untitled.xml", convert: boolean = false, onlyIfEmpty: boolean = false): void {
    if (!this.appIsLoaded) {
      this.queuedData = { data, filename, convert, onlyIfEmpty };
      return;
    }
    this.fileService.loadData(data, filename, convert, onlyIfEmpty);
  }

  public use(plugin: EditorPlugin): this {
    if (this.plugins.has(plugin.id)) return this;
    this.plugins.set(plugin.id, plugin);
    plugin.install(this);
    return this;
  }

  public async initPlugins(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.init) await plugin.init();
    }
  }

  public registerView(id: string, view: GenericView & VerovioView): void {
    this.viewsRegistry.set(id, view);
    if (this.options.defaultView === id || !this.view) {
      this.view = view;
      this.toolbarView = (view as any).editorViewObj || view;

      // Activate the view safely with an empty event
      this.view.onActivate(createAppEvent(AppEvent.Activate) as any);
    }
  }

  public registerService(id: string, service: any): void { this.services.set(id, service); }
  public getService<T>(id: string): T | undefined { return this.services.get(id); }
  public registerCommand(id: string, handler: Function): void { this.commands.set(id, handler); }
  public executeCommand(id: string, ...args: any[]): any {
    const handler = this.commands.get(id);
    return handler ? handler(...args) : console.warn(`Command ${id} not found`);
  }
  public contribute(point: string, contribution: any): void {
    if (!this.extensions.has(point)) this.extensions.set(point, []);
    this.extensions.get(point).push(contribution);
  }
  public getContributions<T>(point: string): T[] { return (this.extensions.get(point) || []) as T[]; }

  public getView(): GenericView & VerovioView { return this.view; }
  public getToolbarView(): VerovioView { return this.toolbarView; }
  public getPageCount(): number { return this.pageCount; }
  public setPageCount(val: number): void { this.pageCount = val; }
  public getCurrentZoomIndex(): number { return this.currentZoomIndex; }
  public isLoaded(): boolean { return this.appIsLoaded; }
  public on(type: string, cb: any, opt?: any): void { this.eventTarget.addEventListener(type, cb, opt); }
  public off(type: string, cb: any, opt?: any): void { this.eventTarget.removeEventListener(type, cb, opt); }
  public dispatchEvent(ev: Event): boolean { return this.eventTarget.dispatchEvent(ev); }
  public getCurrentSchema(): string { return this.currentSchema; }
  public setCurrentSchema(s: string): void { this.currentSchema = s; }

  private createFilter(): void {
    const filterDiv = appendDivTo(this.div, { class: `vrv-filter` });
    fetch(`${this.host}${filter}`).then(r => r.text()).then(xml => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");
        filterDiv.appendChild(doc.documentElement);
    });
  }

  private onResize(): void {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
    }, 100);
  }

  private onBeforeUnload(): void {
    if (this.appReset) return;
    for (const [id, view] of this.viewsRegistry.entries()) {
        if (id === "document") this.options.documentZoom = view.getCurrentZoomIndex();
        else if (id === "responsive") this.options.responsiveZoom = view.getCurrentZoomIndex();
        else if (id === "editor") this.options.editorZoom = (view as any).editorViewObj?.getCurrentZoomIndex() || view.getCurrentZoomIndex();
    }
    this.storageProvider.setItem("options", JSON.stringify(this.options));
  }

  public async setView(e: Event): Promise<void> {
    const viewName = (e.target as HTMLElement).dataset.view;
    if (viewName) this.setViewByName(viewName);
  }

  public setViewByName(id: string): void {
    const newView = this.viewsRegistry.get(id);
    if (!newView || this.view === newView) return;
    if (this.view) this.view.onDeactivate(null);
    this.view = newView;
    this.toolbarView = (newView as any).editorViewObj || newView;
    this.view.onActivate(null);
    this.fileService.loadMEI(false);
  }

  public destroy(): void { this.eventManager.unbindAll(); }

  async fileInput(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.loadData(e.target.result as string, file.name);
    reader.readAsText(file);
  }

  public get container(): HTMLDivElement { return this.div; }
  public get toolbarElement(): HTMLDivElement { return this.toolbar; }
  public get viewsElement(): HTMLDivElement { return this.views; }
  public get statusbarElement(): HTMLDivElement { return this.statusbar; }
  public get dialogElement(): HTMLDivElement { return this.dialogDiv; }
  public get contextUnderlayElement(): HTMLDivElement { return this.contextUnderlay; }
  public get githubManager(): GitHubManager | undefined { return this.getService("github-manager"); }
  public get validator(): ValidatorWorkerProxy | undefined { return this.getService("validator"); }
  public get rngLoader(): RNGLoader | undefined { return this.getService("rng-loader"); }
  public get rngLoaderBasic(): RNGLoader | undefined { return this.getService("rng-loader-basic"); }
  public get pdfWorker(): PDFWorkerProxy | undefined { return this.getService("pdf-worker"); }
  public set pdfWorker(pdf: PDFWorkerProxy | undefined) { this.registerService("pdf-worker", pdf); }
  public get midiPlayer(): MidiPlayer | undefined { return this.getService("midi-player"); }
  public get toolbarObj(): any { return this.getService("toolbar"); }
  public get contextMenuObj(): any { return this.getService("context-menu"); }
  public get viewEditorObj(): any { return this.getService("xml-editor-view"); }
  public getMidiPlayer(): any { return this.midiPlayer; }
  public getPlugin<T extends EditorPlugin>(id: string): T | undefined { return this.plugins.get(id) as T | undefined; }
  public getRuntimeVersion(): string { return this.verovioRuntimeVersion; }
  public goToPreviousPage(): void { this.executeCommand("view.prevPage"); }
  public goToNextPage(): void { this.executeCommand("view.nextPage"); }
  public setZoom(index: number): void { /* handled by view */ }
  public zoomOutView(): void { this.executeCommand("view.zoomOut"); }
  public zoomInView(): void { this.executeCommand("view.zoomIn"); }
  public play(): void { this.executeCommand("midi.play"); }
  public pause(): void { this.executeCommand("midi.pause"); }
  public stop(): void { this.executeCommand("midi.stop"); }
  public playMEI = (): Promise<void> => this.executeCommand("midi.playMEI");

  public fileImport = (e: Event): void => { this.executeCommand("file.import"); }
  public fileExport = (e: Event): void => { this.executeCommand("file.export"); }
  public fileExportPDF = (e: Event): void => { this.executeCommand("file.exportPDF"); }
  public fileExportMIDI = (e: Event): void => { this.executeCommand("file.exportMIDI"); }
  public fileCopyToClipboard = (e: Event): void => { this.executeCommand("file.copyToClipboard"); }
  public fileSelection = (e: Event): void => { this.executeCommand("file.selection"); }
  public fileLoadRecent = (e: Event): void => {
    const element = e.target as HTMLElement;
    const file = this.fileStack.load(Number(element.dataset.idx));
    this.loadData(file.data, file.filename);
  }
  public githubImport = (e: Event): void => { this.executeCommand("github.import"); }
  public githubExport = (e: Event): void => { this.executeCommand("github.export"); }
  public settingsEditor = (e: Event): void => { this.executeCommand("settings.editor"); }
  public settingsVerovio = (e: Event): void => { this.executeCommand("settings.verovio"); }
  public helpAbout = (e: Event): void => { this.executeCommand("help.about"); }
  public helpReset = (e: Event): void => {
    this.fileStack.reset();
    this.storageProvider.removeItem("options");
    this.appReset = true;
    location.reload();
  }
  public login = (e: Event): void => { this.executeCommand("github.login"); }
  public logout = (e: Event): void => { this.executeCommand("github.logout"); }

  public prevPage = (e: MouseEvent): void => { this.goToPreviousPage(); }
  public nextPage = (e: MouseEvent): void => { this.goToNextPage(); }
  public zoomOut = (e: MouseEvent): void => { this.zoomOutView(); }
  public zoomIn = (e: MouseEvent): void => { this.zoomInView(); }

  public static iconFor(element: string, host: string): string {
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

export namespace App {
  export interface MEIExportOptions {
    scoreBased: boolean;
    basic: boolean;
    removeIds: boolean;
    ignoreHeader: boolean;
    indent?: number;
    firstPage: number;
    lastPage: number;
  }
  export interface Options {
    version?: string;
    verovioVersion?: string;
    verovioUrl?: string;
    validatorUrl?: string;
    pdfkitUrl?: string;
    baseUrl?: string;
    githubClientId?: string;
    appReset?: boolean;
    isSafari?: boolean;
    disableLocalStorage?: boolean;
    storageProvider?: StorageProvider;
    injectStyles?: boolean;
    useCustomDialogs?: boolean;
    enableGitHub?: boolean;
    enableToolbar?: boolean;
    enableMidiToolbar?: boolean;
    enableContextMenu?: boolean;
    enableFilter?: boolean;
    enableValidation?: boolean;
    enableDocument?: boolean;
    enableEditor?: boolean;
    enableResponsive?: boolean;
    enableStatusbar?: boolean;
    defaultView?: string;
    documentZoom?: number;
    responsiveZoom?: number;
    editorZoom?: number;
    [key: string]: any;
  }
}

declare class App {
    private readonly plugins;
    private readonly services;
    private readonly commands;
    private readonly extensions;
    private readonly viewsRegistry;
    dialogDiv: HTMLDivElement;
    readonly host: string;
    customEventManager: CustomEventManager;
    readonly zoomLevels: Array<number>;
    eventManager: EventManager;
    readonly id: string;
    readonly fileStack: FileStack;
    readonly storageProvider: StorageProvider;
    readonly options: App.Options;
    verovio: VerovioWorkerProxy;
    verovioService: VerovioService;
    fileService: FileService;
    verovioOptions: VerovioView.Options;
    toolbar: HTMLDivElement;
    views: HTMLDivElement;
    loader: HTMLDivElement;
    loaderText: HTMLDivElement;
    statusbar: HTMLDivElement;
    private wrapper;
    private notification;
    private contextUnderlay;
    contextMenu: HTMLDivElement;
    input: HTMLInputElement;
    output: HTMLAnchorElement;
    private fileCopy;
    private appIsLoaded;
    private appReset;
    private verovioRuntimeVersion;
    private resizeTimer;
    private view;
    private toolbarView;
    private pageCount;
    private currentZoomIndex;
    private currentSchema;
    private eventTarget;
    private clientId;
    private div;
    notificationService: NotificationService;
    loaderService: LoaderService;
    private queuedData;
    private resolveReady;
    readonly ready: Promise<void>;
    constructor(div: HTMLDivElement, options?: App.Options, plugins?: EditorPlugin[]);
    private setupBaseDOM;
    private initCore;
    loadData(data: string, filename?: string, convert?: boolean, onlyIfEmpty?: boolean): void;
    use(plugin: EditorPlugin): this;
    initPlugins(): Promise<void>;
    registerView(id: string, view: GenericView & VerovioView): void;
    registerService(id: string, service: any): void;
    getService<T>(id: string): T | undefined;
    registerCommand(id: string, handler: Function): void;
    executeCommand(id: string, ...args: any[]): any;
    contribute(point: string, contribution: any): void;
    getContributions<T>(point: string): T[];
    getView(): GenericView & VerovioView;
    getToolbarView(): VerovioView;
    getPageCount(): number;
    setPageCount(val: number): void;
    getCurrentZoomIndex(): number;
    isLoaded(): boolean;
    on(type: string, cb: any, opt?: any): void;
    off(type: string, cb: any, opt?: any): void;
    dispatchEvent(ev: Event): boolean;
    getCurrentSchema(): string;
    setCurrentSchema(s: string): void;
    private createFilter;
    private onResize;
    private onBeforeUnload;
    setView(e: Event): Promise<void>;
    setViewByName(id: string): void;
    destroy(): void;
    fileInput(e: Event): Promise<void>;
    get container(): HTMLDivElement;
    get toolbarElement(): HTMLDivElement;
    get viewsElement(): HTMLDivElement;
    get statusbarElement(): HTMLDivElement;
    get dialogElement(): HTMLDivElement;
    get contextUnderlayElement(): HTMLDivElement;
    get githubManager(): GitHubManager | undefined;
    get validator(): ValidatorWorkerProxy | undefined;
    get rngLoader(): RNGLoader | undefined;
    get rngLoaderBasic(): RNGLoader | undefined;
    get pdfWorker(): PDFWorkerProxy | undefined;
    set pdfWorker(pdf: PDFWorkerProxy | undefined);
    get midiPlayer(): MidiPlayer | undefined;
    get toolbarObj(): any;
    get contextMenuObj(): any;
    get viewEditorObj(): any;
    getMidiPlayer(): any;
    getPlugin<T extends EditorPlugin>(id: string): T | undefined;
    getRuntimeVersion(): string;
    goToPreviousPage(): void;
    goToNextPage(): void;
    setZoom(index: number): void;
    zoomOutView(): void;
    zoomInView(): void;
    play(): void;
    pause(): void;
    stop(): void;
    playMEI: () => Promise<void>;
    fileImport: (e: Event) => void;
    fileExport: (e: Event) => void;
    fileExportPDF: (e: Event) => void;
    fileExportMIDI: (e: Event) => void;
    fileCopyToClipboard: (e: Event) => void;
    fileSelection: (e: Event) => void;
    fileLoadRecent: (e: Event) => void;
    githubImport: (e: Event) => void;
    githubExport: (e: Event) => void;
    settingsEditor: (e: Event) => void;
    settingsVerovio: (e: Event) => void;
    helpAbout: (e: Event) => void;
    helpReset: (e: Event) => void;
    login: (e: Event) => void;
    logout: (e: Event) => void;
    prevPage: (e: MouseEvent) => void;
    nextPage: (e: MouseEvent) => void;
    zoomOut: (e: MouseEvent) => void;
    zoomIn: (e: MouseEvent) => void;
    static iconFor(element: string, host: string): string;
}

declare namespace App {
    interface MEIExportOptions {
        scoreBased: boolean;
        basic: boolean;
        removeIds: boolean;
        ignoreHeader: boolean;
        indent?: number;
        firstPage: number;
        lastPage: number;
    }
    interface Options {
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
export { App }
export { App as VerovioEditor }

export declare type AppCustomEvent<K extends AppEvent> = CustomEvent<AppEventDetailMap[K]>;

/**
 * Application event types and their payloads.
 */
export declare enum AppEvent {
    Activate = "onActivate",
    Deactivate = "onDeactivate",
    LoadData = "onLoadData",
    Select = "onSelect",
    EditData = "onEditData",
    Resized = "onResized",
    CursorActivity = "onCursorActivity",
    Page = "onPage",
    Zoom = "onZoom",
    StartLoading = "onStartLoading",
    EndLoading = "onEndLoading"
}

export declare interface AppEventDetailMap {
    [AppEvent.Activate]: undefined;
    [AppEvent.Deactivate]: undefined;
    [AppEvent.LoadData]: {
        caller: any;
        mei?: string;
        currentId?: string;
        reload?: boolean;
        lightEndLoading?: boolean;
    };
    [AppEvent.Select]: {
        id: string;
        element?: string;
        elementType?: string;
        caller: any;
    };
    [AppEvent.EditData]: {
        id?: string;
        caller?: any;
    };
    [AppEvent.Resized]: undefined;
    [AppEvent.CursorActivity]: {
        id: string;
        activity: string;
        caller: any;
    };
    [AppEvent.Page]: undefined;
    [AppEvent.Zoom]: undefined;
    [AppEvent.StartLoading]: {
        light: boolean;
        msg: string;
    };
    [AppEvent.EndLoading]: undefined;
}

export declare class ContextMenuPlugin implements EditorPlugin {
    id: string;
    private app;
    private contextMenuObj;
    install(app: App): void;
    init(): void;
}

export declare function createAppEvent<K extends AppEvent>(type: K, detail?: AppEventDetailMap[K]): AppCustomEvent<K>;

declare class CustomEventManager {
    private readonly cache;
    private readonly objs;
    private readonly propagationList;
    constructor();
    bind(obj: GenericView | App, ev: AppEvent | string, fct: Function): void;
    addToPropagationList(customEventManager: CustomEventManager): void;
    dispatch(event: Event): void;
}

export declare class DocumentViewPlugin implements EditorPlugin {
    id: string;
    private app;
    private viewObj;
    install(app: App): void;
    init(): void;
}

/**
 * EditorPlugin is the standard interface for all Verovio Editor extensions.
 */
export declare interface EditorPlugin {
    id: string;
    /**
     * Phase 1: Install
     * Called immediately when the plugin is added via `app.use()`.
     * Use this to register services, commands, or subscribe to events.
     * Do NOT manipulate the DOM here.
     */
    install(app: App): void;
    /**
     * Phase 2: Initialize (Optional)
     * Called after all plugins have been installed and the app is ready.
     * Use this to build UI or access services provided by other plugins.
     */
    init?(): Promise<void> | void;
    /**
     * Teardown (Optional)
     * Called when the app or the plugin is destroyed.
     */
    destroy?(): void;
}

/**
 *  EventManager for binding events to a given parent object to avoid ES6 scope issues.
 */
declare class EventManager {
    private readonly parent;
    private cache;
    private appIDAttr;
    constructor(parent: any);
    bind(el: Element, ev: string, fct: Function): void;
    unbind(el: Element, ev: string): void;
    unbindAll(): void;
}

declare interface File_2 {
    filename: string;
    data: string;
}

/**
 * FileService for managing file I/O and exports.
 */
declare class FileService {
    private readonly app;
    private readonly fileStack;
    private inputData;
    private filename;
    constructor(app: App);
    getInputData(): string;
    getFilename(): string;
    loadData(data: string, filename?: string, convert?: boolean, onlyIfEmpty?: boolean): void;
    loadMEI(convert: boolean): Promise<void>;
    private checkSchema;
    generatePDF(outputElement: HTMLAnchorElement): Promise<void>;
    generateMIDI(outputElement: HTMLAnchorElement): Promise<void>;
    generateMEI(options: any, outputElement?: HTMLAnchorElement): Promise<string>;
    setInputData(data: string): void;
    setFilename(filename: string): void;
}

declare class FileStack {
    private readonly stack;
    private readonly storage;
    constructor(storage: StorageProvider);
    store(filename: string, data: string): void;
    load(idx: number): File_2;
    getLast(): File_2;
    fileList(): Array<{
        idx: number;
        filename: string;
    }>;
    reset(): void;
}

declare class GenericView {
    readonly customEventManager: CustomEventManager;
    readonly id: string;
    protected active: boolean;
    readonly app: App;
    protected readonly div: HTMLDivElement;
    private display;
    constructor(div: HTMLDivElement, app: App);
    getDiv(): HTMLDivElement;
    protected destroy(): void;
    protected setDisplayFlex(): void;
    protected addFieldSet(label: string, flexGrow?: number): HTMLDivElement;
    onActivate(e: CustomEvent): boolean;
    onCursorActivity(e: CustomEvent): boolean;
    onDeactivate(e: CustomEvent): boolean;
    onEditData(e: CustomEvent): boolean;
    onEndLoading(e: CustomEvent): boolean;
    onLoadData(e: CustomEvent): boolean;
    onPage(e: CustomEvent): boolean;
    onResized(e: CustomEvent): boolean;
    onSelect(e: CustomEvent): boolean;
    onStartLoading(e: CustomEvent): boolean;
    onZoom(e: CustomEvent): boolean;
}

declare class GitHubManager {
    private name;
    private login;
    private user;
    private selectedUser;
    private selectedOrganization;
    private selectedAccountName;
    private selectedBranchName;
    private selectedRepo;
    private selectedRepoName;
    private selectedPath;
    private gh;
    private readonly app;
    constructor(app: App);
    getName(): string;
    getLogin(): string;
    getUser(): GitHubApi.User;
    getSelectedUser(): GitHubApi.User;
    getSelectedOrganization(): GitHubApi.Organization;
    getSelectedRepo(): GitHubApi.Repository;
    getSelectedBranchName(): string;
    getSelectedAccountName(): string;
    getSelectedRepoName(): string;
    getSelectedPath(): Array<string>;
    selectedPathPop(): void;
    getPathString(): string;
    appendToPath(dir: string): void;
    slicePathTo(value: number): void;
    isLoggedIn(): boolean;
    private getSessionCookie;
    private storeSelection;
    private resetSelectedPath;
    writeFile(filename: string, commitMsg: string): Promise<void>;
    selectAccount(login: string): Promise<void>;
    selectBranch(name: string): Promise<void>;
    selectRepo(name: string): Promise<void>;
    private initUser;
}

declare namespace GitHubManager {
    interface Options {
        login: string;
        account: string;
        repo: string;
        branch: string;
        path: Array<string>;
    }
}

export declare class GitHubPlugin implements EditorPlugin {
    private options?;
    id: string;
    private app;
    private githubManager;
    constructor(options?: GitHubManager.Options);
    install(app: App): void;
    import(): Promise<void>;
    export(): Promise<void>;
}

/**
 * LoaderService for managing the loading overlay and status.
 */
declare class LoaderService {
    private readonly loader;
    private readonly loaderText;
    private readonly views;
    private readonly customEventManager;
    private loadingCount;
    constructor(loader: HTMLDivElement, loaderText: HTMLDivElement, views: HTMLDivElement, customEventManager: CustomEventManager);
    start(msg: string, light?: boolean): void;
    end(light?: boolean): void;
    getCount(): number;
}

/**
 * Default implementation of StorageProvider using window.localStorage.
 */
export declare class LocalStorageProvider implements StorageProvider {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

declare class MidiPlayer {
    private playing;
    private pausing;
    private currentTime;
    private currentTimeStr;
    private totalTime;
    private totalTimeStr;
    private view;
    private progressBarTimer;
    private expansionMap;
    private readonly midiPlayerElement;
    private readonly midiUI;
    private readonly customEventManager;
    constructor(container: HTMLElement, midiUI?: MidiUI, customEventManager?: CustomEventManager);
    isPlaying(): boolean;
    isPausing(): boolean;
    getCurrentTime(): number;
    getCurrentTimeStr(): string;
    getTotalTime(): number;
    getTotalTimeStr(): string;
    setView(view: ResponsiveView): void;
    setExpansionMap(expansionMap: Record<string, string[]>): void;
    getExpansionMap(): Record<string, string[]>;
    playFile(midiFile: string): void;
    play(): void;
    stop(): void;
    pause(): void;
    seekToPercent(percent: number): void;
    private onUpdateNoteTime;
    private onUpdate;
    private startTimer;
    private stopTimer;
    private samplesToTime;
    onStop(e: CustomEvent): void;
}

export declare class MidiPlayerPlugin implements EditorPlugin {
    id: string;
    private app;
    private midiPlayer;
    private midiToolbarObj;
    install(app: App): void;
    init(): void;
    playMEI(): Promise<void>;
}

declare interface MidiUI {
    setMidiPlayer(player: MidiPlayer): void;
    update(player: MidiPlayer): void;
}

/**
 * Dummy implementation of StorageProvider that does nothing (for disabling persistence).
 */
export declare class NoStorageProvider implements StorageProvider {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

/**
 * NotificationService for managing UI notifications.
 */
declare class NotificationService {
    private readonly element;
    private readonly stack;
    constructor(element: HTMLDivElement);
    show(message: string): void;
    private push;
}

export declare class PdfExportPlugin implements EditorPlugin {
    id: string;
    private app;
    install(app: App): void;
    init(): void;
}

declare class PDFWorkerProxy extends WorkerProxy {
    addPage: (svg: string) => Promise<void>;
    end: () => Promise<string>;
    start: (options?: object) => Promise<void>;
    constructor(worker: Worker);
}

declare class ResponsiveView extends VerovioView {
    protected svgWrapper: HTMLDivElement;
    protected midiIds: Array<string>;
    constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy);
    refreshView(update: VerovioView.Refresh, lightEndLoading?: boolean, mei?: string, reload?: boolean): Promise<any>;
    private updateActivate;
    private updateLoadData;
    private updateResized;
    private updateZoom;
    renderPage(lightEndLoading?: boolean): Promise<any>;
    midiUpdate(time: number): Promise<any>;
    midiStop(): void;
    protected updateSVGDimensions(): void;
    onPage(e: CustomEvent): boolean;
    scrollListener(e: UIEvent): void;
}

export declare class ResponsiveViewPlugin implements EditorPlugin {
    id: string;
    private app;
    private viewObj;
    install(app: App): void;
    init(): void;
}

/**
 * The RNGLoader class for parsing and storing an RNG Schema.
 */
declare class RNGLoader {
    private tags;
    private readonly rngNs;
    constructor();
    setRelaxNGSchema(data: string): void;
    getTags(): Object;
    /**
     * Collect all <define/> elements.
     */
    private collectDefinitions;
    /**
     * Continue recursion in the definition elements for the given reference.
     */
    private followReference;
    /**
     * Recurse into the child elements. Follow references.
     */
    private recurseRng;
    /**
     * Collect the text from all the <value/> elements.
     */
    private getAttributeValues;
    /**
     * Get the possible names for an element or attribute.
     */
    private getNamesRecurse;
    /**
     * Get the possible names for an element or attribute.
     */
    private getNames;
    /**
     * Find the allowed child elements and attributes for an element.
     */
    private defineElement;
    private sortObject;
    private sortAttributeValues;
    private findElements;
    private findTopLevelElements;
    private findAllTopLevelElements;
    private isRng;
}

export declare class StandardToolbarPlugin implements EditorPlugin {
    id: string;
    private app;
    private toolbarObj;
    install(app: App): void;
    init(): void;
    private renderContributions;
}

export declare class StatusbarPlugin implements EditorPlugin {
    id: string;
    private app;
    private statusbarObj;
    install(app: App): void;
    init(): void;
}

/**
 * The StorageProvider interface for abstraction of storage access.
 */
export declare interface StorageProvider {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export declare interface ToolbarAction {
    id: string;
    label: string;
    command: string;
    icon?: string;
}

export declare class ValidationPlugin implements EditorPlugin {
    id: string;
    private app;
    install(app: App): void;
    init(): void;
}

declare class ValidatorWorkerProxy extends WorkerProxy {
    check: (mei: string) => Promise<string>;
    validate: (mei: string) => Promise<string>;
    validateNG: (mei: string) => Promise<string>;
    setRelaxNGSchema: (schema: string) => Promise<boolean>;
    setSchema: (schema: string) => Promise<boolean>;
    onRuntimeInitialized: () => Promise<void>;
    constructor(worker: Worker);
}

export declare class VerovioApp extends App {
    constructor(div: HTMLDivElement, options: App.Options);
}

/**
 * VerovioService for managing Verovio and Validator workers.
 */
declare class VerovioService {
    readonly verovio: VerovioWorkerProxy;
    readonly validator: ValidatorWorkerProxy | null;
    readonly rngLoader: RNGLoader | null;
    readonly rngLoaderBasic: RNGLoader | null;
    private verovioRuntimeVersion;
    private readonly host;
    private readonly pdfkitUrl?;
    constructor(options: VerovioServiceOptions);
    private getWorkerURL;
    init(options: VerovioServiceOptions): Promise<string>;
    getRuntimeVersion(): string;
    getPDFWorker(): PDFWorkerProxy;
}

declare interface VerovioServiceOptions {
    verovioVersion: string;
    verovioUrl?: string;
    validatorUrl?: string;
    pdfkitUrl?: string;
    host: string;
    enableEditor: boolean;
    enableValidation: boolean;
    schema: string;
    schemaBasic: string;
}

declare class VerovioView extends GenericView {
    readonly verovio: VerovioWorkerProxy;
    protected currentPage: number;
    protected currentZoomIndex: number;
    protected currentScale: number;
    protected boundContextMenu: {
        (event: PointerEvent): void;
    };
    protected boundMouseMove: {
        (event: MouseEvent): void;
    };
    protected boundMouseUp: {
        (event: MouseEvent): void;
    };
    protected boundKeyDown: {
        (event: KeyboardEvent): void;
    };
    protected boundKeyUp: {
        (event: KeyboardEvent): void;
    };
    protected boundResize: {
        (event: Event): void;
    };
    protected readonly eventManager: EventManager;
    constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy);
    getCurrentPage(): number;
    setCurrentPage(value: number): void;
    getCurrentZoomIndex(): number;
    setCurrentZoomIndex(value: number): void;
    getCurrentScale(): number;
    setCurrentScale(value: number): void;
    protected parseAndScaleSVG(svgString: string, height: number, width: number): Node;
    private bindListeners;
    destroy(): void;
    onActivate(e: CustomEvent): boolean;
    onLoadData(e: CustomEvent): boolean;
    onResized(e: CustomEvent): boolean;
    onZoom(e: CustomEvent): boolean;
    protected refreshView(update: VerovioView.Refresh, lightEndLoading?: boolean, mei?: string, reload?: boolean): Promise<any>;
    contextMenuListener(e: PointerEvent): void;
    keyDownListener(e: KeyboardEvent): void;
    keyUpListener(e: KeyboardEvent): void;
    mouseMoveListener(e: MouseEvent): void;
    mouseUpListener(e: MouseEvent): void;
    resizeComponents(e: Event): void;
}

declare namespace VerovioView {
    enum Refresh {
        Activate = 0,
        Resized = 1,
        LoadData = 2,
        Zoom = 3
    }
    interface Options {
        adjustPageHeight?: boolean;
        appXPathQuery?: Array<string>;
        breaks?: string;
        choiceXPathQuery?: Array<string>;
        footer?: string;
        justifyVertically?: boolean;
        pageHeight: number;
        pageWidth: number;
        pageMarginLeft: number;
        pageMarginRight: number;
        pageMarginTop: number;
        pageMarginBottom: number;
        scale: number;
        xmlIdSeed: number;
    }
    interface EditInfo {
        chainedId: string;
        canUndo: boolean;
        canRedo: boolean;
    }
    interface ElementsAtTime {
        page: number;
        measure: string;
        notes: Array<string>;
        rests: Array<string>;
        chords: Array<string>;
    }
}

declare class VerovioWorkerProxy extends WorkerProxy {
    edit: (args: object) => Promise<boolean>;
    editInfo: () => Promise<object>;
    getAvailableOptions: () => Promise<object>;
    getDefaultOptions: () => Promise<object>;
    getElementAttr: (id: string) => Promise<object>;
    getElementsAtTime: (time: number) => Promise<object>;
    getLog: () => Promise<string>;
    getOptions: () => Promise<object>;
    getMEI: (options: object) => Promise<string>;
    getPageCount: () => Promise<number>;
    getPageWithElement: (id: string) => Promise<number>;
    loadData: (data: string) => Promise<boolean>;
    redoLayout: (options?: object) => Promise<void>;
    redoPagePitchPosLayout: () => Promise<void>;
    renderToExpansionMap: () => Promise<Record<string, string[]>>;
    renderToMIDI: () => Promise<string>;
    renderToSVG: (page: number) => Promise<string>;
    select: (selection: object) => Promise<boolean>;
    setOptions: (options: object) => Promise<boolean>;
    getVersion: () => Promise<string>;
    onRuntimeInitialized: Function;
    constructor(worker: Worker);
}

declare class WorkerProxy {
    private worker;
    constructor(worker: Worker);
}

export declare class XmlEditorPlugin implements EditorPlugin {
    id: string;
    private app;
    private viewObj;
    install(app: App): void;
    init(): void;
}

export { }

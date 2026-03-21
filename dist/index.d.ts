declare class ActionManager {
    readonly eventManager: EventManager;
    protected readonly app: App;
    private inProgress;
    private readonly editorViewObj;
    private canUndoCache;
    private canRedoCache;
    constructor(view: EditorView, app: App);
    canUndo(): boolean;
    canRedo(): boolean;
    commit(caller: GenericView): Promise<void>;
    editRefresh(): Promise<void>;
    drag(x: number, y: number): Promise<void>;
    keyDown(key: number, shiftKey: boolean, ctrlKey: boolean): Promise<void>;
    keyUp(key: number, shiftKey: boolean, ctrlKey: boolean): Promise<void>;
    insert(elementName: string, insertMode: string): Promise<void>;
    formCres(): Promise<void>;
    formDim(): Promise<void>;
    placeAbove(): Promise<void>;
    placeBelow(): Promise<void>;
    placeAuto(): Promise<void>;
    stemDirUp(): Promise<void>;
    stemDirDown(): Promise<void>;
    stemDirAuto(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
    setAttrValue(attribute: string, value: string, id: string): Promise<void>;
    setAttrValueForTypes(attribute: string, value: string, elementTypes?: Array<string>): Promise<void>;
}

export declare class App {
    private inputData;
    readonly dialogDiv: HTMLDivElement;
    readonly host: string;
    readonly customEventManager: CustomEventManager;
    readonly zoomLevels: Array<number>;
    readonly eventManager: EventManager;
    readonly id: string;
    readonly githubManager: GitHubManager;
    readonly options: App.Options;
    readonly fileStack: FileStack;
    readonly verovio: VerovioWorkerProxy;
    readonly validator: ValidatorWorkerProxy;
    readonly rngLoader: RNGLoader;
    readonly rngLoaderBasic: RNGLoader;
    readonly verovioOptions: VerovioView.Options;
    private view;
    private toolbarView;
    private midiPlayer;
    private pageCount;
    private currentZoomIndex;
    private loadingCount;
    toolbarObj: AppToolbar;
    contextMenuObj: ContextMenu;
    private statusbarObj;
    private midiToolbarObj;
    private resizeTimer;
    private appIsLoaded;
    private appReset;
    private filename;
    private verovioRuntimeVersion;
    private viewDocumentObj;
    private viewEditorObj;
    private viewResponsiveObj;
    private pdf;
    private currentSchema;
    private input;
    private output;
    private fileCopy;
    private wrapper;
    private notification;
    private contextUnderlay;
    private contextMenu;
    private toolbar;
    private views;
    private loader;
    private loaderText;
    private statusbar;
    private view1;
    private view2;
    private view3;
    private readonly clientId;
    private readonly div;
    private readonly notificationStack;
    constructor(div: HTMLDivElement, options?: App.Options);
    getView(): GenericView;
    getToolbarView(): VerovioView;
    getMidiPlayer(): MidiPlayer;
    getPageCount(): number;
    setPageCount(pageCount: number): void;
    getCurrentZoomIndex(): number;
    startLoading(msg: string, light?: boolean): void;
    endLoading(light?: boolean): void;
    showNotification(message: string): void;
    destroy(): void;
    private getWorkerURL;
    private createInterfaceAndLoadData;
    private createViews;
    private createToolbar;
    private createStatusbar;
    private createFilter;
    private loadData;
    private pushNotification;
    playMEI(): Promise<void>;
    private loadMEI;
    private applySelection;
    private checkSchema;
    private generatePDF;
    private generateMIDI;
    private generateMEI;
    onResized(e: CustomEvent): boolean;
    onBeforeUnload(e: Event): void;
    onResize(e: Event): void;
    prevPage(e: MouseEvent): void;
    nextPage(e: MouseEvent): void;
    zoomOut(e: MouseEvent): void;
    zoomIn(e: MouseEvent): void;
    login(e: Event): void;
    logout(e: Event): void;
    fileImport(e: MouseEvent): Promise<void>;
    fileInput(e: InputEvent): Promise<void>;
    fileExport(e: Event): Promise<void>;
    fileExportPDF(e: Event): Promise<void>;
    fileExportMIDI(e: Event): Promise<void>;
    fileCopyToClipboard(e: Event): Promise<void>;
    fileLoadRecent(e: Event): Promise<void>;
    fileSelection(e: Event): Promise<void>;
    githubImport(e: Event): Promise<void>;
    githubExport(e: Event): Promise<void>;
    settingsEditor(e: Event): Promise<void>;
    settingsVerovio(e: Event): Promise<void>;
    helpAbout(e: Event): Promise<void>;
    helpReset(e: Event): Promise<void>;
    setView(e: Event): Promise<void>;
}

export declare namespace App {
    export interface Options {
        version: string;
        appReset?: boolean;
        isSafari?: boolean;
        viewerOnly?: boolean;
        selection: Object;
        editorial: Object;
        defaultView: string;
        documentViewPageBorder: number;
        documentViewSVG: boolean;
        documentViewMargin: number;
        documentZoom: number;
        editorSplitterHorizontal: boolean;
        editorZoom: number;
        enableDocument: boolean;
        enableEditor: boolean;
        enableResponsive: boolean;
        enableStatusbar: boolean;
        enableValidation: boolean;
        github: GitHubManager.Options;
        responsiveZoom: number;
        schemaDefault: string;
        schema: string;
        schemaBasic: string;
        verovioVersion: string;
        devFeatures: boolean;
        showDevFeatures: boolean;
    }
    export interface MEIExportOptions {
        scoreBased: boolean;
        basic: boolean;
        removeIds: boolean;
        ignoreHeader: boolean;
        firstPage: number;
        lastPage: number;
    }
    export function iconFor(element: string): string;
}

/**
 * Application event types and their payloads.
 */
declare enum AppEvent {
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

declare class AppToolbar extends Toolbar {
    private readonly viewDocument;
    private readonly viewResponsive;
    private readonly viewSelector;
    private readonly viewEditor;
    private readonly subSubMenu;
    private readonly editorSubToolbar;
    private readonly midiPlayerSubToolbar;
    private readonly pageControls;
    private readonly nextPage;
    private readonly prevPage;
    private readonly fileImportMusicXML;
    private readonly fileImportCMME;
    private readonly fileImport;
    private readonly fileMenuBtn;
    private readonly fileRecent;
    private readonly fileSelection;
    private readonly zoomControls;
    private readonly zoomIn;
    private readonly zoomOut;
    private readonly settingsEditor;
    private readonly settingsVerovio;
    private readonly helpReset;
    private readonly helpAbout;
    private readonly loginGroup;
    private readonly login;
    private readonly logout;
    private readonly githubMenu;
    private readonly githubImport;
    private readonly githubExport;
    constructor(div: HTMLDivElement, app: App);
    getMidiPlayerSubToolbar(): HTMLDivElement;
    updateRecent(): void;
    private updateAll;
    onMouseOver(e: CustomEvent): void;
    onClick(e: CustomEvent): void;
    onActivate(e: CustomEvent): boolean;
    onEndLoading(e: CustomEvent): boolean;
    onStartLoading(e: CustomEvent): boolean;
}

declare class ContextMenu extends GenericView {
    private actionManager;
    private readonly underlay;
    readonly eventManager: EventManager;
    constructor(div: HTMLDivElement, app: App, underlay: HTMLDivElement);
    setActionManager(actionManager: ActionManager): void;
    show(e: PointerEvent): void;
    hide(): void;
    onDismiss(e: MouseEvent): void;
    buildFor(id: string): void;
    insertNote(e: Event): void;
}

declare class CustomEventManager {
    private readonly cache;
    private readonly objs;
    private readonly propagationList;
    constructor();
    bind(obj: GenericView | App, ev: AppEvent | string, fct: Function): void;
    addToPropagationList(customEventManager: CustomEventManager): void;
    dispatch(event: Event): void;
}

declare class EditorCursorPointer {
    private readonly editorViewObj;
    private activated;
    private pixPerPix;
    private viewTop;
    private viewLeft;
    private lastEvent;
    private scrollTop;
    private scrollLeft;
    private staffNode;
    private initX;
    private initY;
    private marginLeft;
    private marginTop;
    private MEIUnit;
    constructor(editorView: EditorView);
    setLastEvent(lastEvent: MouseEvent): void;
    getLastEvent(): MouseEvent;
    setScrollTop(scrollTop: number): void;
    setScrollLeft(scrollLeft: number): void;
    xToMEI(x: number): number;
    yToMEI(y: number): number;
    xToView(x: number): number;
    yToView(y: number): number;
    init(svgRoot: SVGElement, top: number, left: number): void;
    initEvent(event: MouseEvent, node: SVGElement): void;
    initStaff(node: SVGElement): void;
    distFromLastEvent(): [number, number];
}

declare class EditorView extends ResponsiveView {
    readonly cursorPointerObj: EditorCursorPointer;
    readonly actionManager: ActionManager;
    private readonly midiPlayerElement;
    private svgOverlay;
    private mouseMoveTimer;
    private draggingActive;
    private mouseOverId;
    private lastNote;
    private selectedItems;
    constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy);
    getActionManager(): ActionManager;
    private initCursor;
    updateSVGDimensions(): void;
    renderPage(lightEndLoading?: boolean, createOverlay?: boolean): Promise<any>;
    private select;
    private playNoteSound;
    clearSelection(): void;
    hasSelection(): boolean;
    getSelection(): Array<SelectedItem>;
    addNodeToSelection(node: SVGElement): void;
    addToSelection(element: string, id: string, x?: number, y?: number): void;
    getClosestMEIElement(node: SVGElement, elementType?: string): SVGElement;
    private createOverlay;
    private highlightMouseOver;
    private highlightMouseOverReset;
    private highlightSelected;
    private highlightSelectedReset;
    private highlightWithColor;
    onCursorActivity(e: CustomEvent): boolean;
    onEndLoading(e: CustomEvent): boolean;
    onSelect(e: CustomEvent): boolean;
    contextMenuListener(e: PointerEvent): void;
    keyDownListener(e: KeyboardEvent): void;
    keyUpListener(e: KeyboardEvent): void;
    mouseDownListener(e: MouseEvent): void;
    mouseEnterListener(e: MouseEvent): void;
    mouseLeaveListener(e: MouseEvent): void;
    mouseMoveListener(e: MouseEvent): void;
    mouseUpListener(e: MouseEvent): void;
    scrollListener(e: Event): void;
}

declare namespace EditorView {
    interface NoteAttributes {
        pname?: string;
        oct?: string;
        accid?: string;
        midiPitch?: number;
    }
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

declare class FileStack {
    private readonly stack;
    constructor();
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
    protected readonly app: App;
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
    private readonly midiToolbar;
    constructor(midiToolbar: MidiToolbar);
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

declare class MidiToolbar extends Toolbar {
    private midiPlayer;
    private pageDragStart;
    private barDragStart;
    private barWidth;
    private readonly midiControls;
    private readonly play;
    private readonly pause;
    private readonly stop;
    private readonly progressControl;
    private readonly midiCurrentTime;
    private readonly midiBar;
    private readonly midiBarPercent;
    private readonly midiTotalTime;
    constructor(div: HTMLDivElement, app: App);
    setMidiPlayer(midiPlayer: MidiPlayer): void;
    updateProgressBar(): void;
    private updateDragging;
    private updateAll;
    onPlay(e: MouseEvent): void;
    onPause(e: MouseEvent): void;
    onStop(e: MouseEvent): void;
    onProgressBarDown(e: MouseEvent): void;
    onProgressBarMove(e: MouseEvent): void;
    onProgressBarUp(e: MouseEvent): void;
    onActivate(e: CustomEvent): boolean;
    onEditData(e: CustomEvent): boolean;
    onEndLoading(e: CustomEvent): boolean;
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

declare interface SelectedItem {
    element: string;
    id: string;
    x: number;
    y: number;
}

declare class Toolbar extends GenericView {
    readonly eventManager: EventManager;
    constructor(div: HTMLDivElement, app: App);
    protected updateToolbarGrp(grp: HTMLElement, condition: boolean): void;
    protected updateToolbarBtnEnabled(btn: HTMLElement, condition: boolean): void;
    protected updateToolbarBtnDisplay(btn: HTMLElement, condition: boolean): void;
    protected updateToolbarBtnToggled(btn: HTMLElement, condition: boolean): void;
    protected updateToolbarSubmenuBtn(btn: HTMLElement, condition: boolean): void;
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

export { }

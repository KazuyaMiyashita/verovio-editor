/**
 * The VerovioView class is the based class for other view implementation featuring Verovio rendering.
 * It should not be instantiated directly but only through inherited classes.
 * The VerovioView is attached to a VerovioMessenger.
 */

import { App } from "../app.js";
import { GenericView } from "../utils/generic-view.js";
import { EventManager } from "../events/event-manager.js";
import { VerovioWorkerProxy } from "../utils/worker-proxy.js";

export class VerovioView extends GenericView {
  public readonly verovio: VerovioWorkerProxy;

  protected currentPage: number;
  protected currentZoomIndex: number;
  protected currentScale: number;
  protected boundContextMenu: { (event: PointerEvent): void };
  protected boundMouseMove: { (event: MouseEvent): void };
  protected boundMouseUp: { (event: MouseEvent): void };
  protected boundKeyDown: { (event: KeyboardEvent): void };
  protected boundKeyUp: { (event: KeyboardEvent): void };
  protected boundResize: { (event: Event): void };

  protected readonly eventManager: EventManager;

  constructor(div: HTMLDivElement, app: App, verovio: VerovioWorkerProxy) {
    super(div, app);

    // VerovioMessenger object
    this.verovio = verovio;

    // One of the little quirks of writing in ES6, bind events
    this.eventManager = new EventManager(this);
    this.bindListeners(); // Document/Window-scoped events

    // Common members
    this.currentPage = 1;
    this.currentZoomIndex = this.app.getCurrentZoomIndex();
    this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
  }

  ///////////////////////////////////////////////////////////////////////
  // Getters and setters
  ////////////////////////////////////////////////////////////////////////

  public getCurrentPage(): number {
    return this.currentPage;
  }
  public setCurrentPage(value: number): void {
    this.currentPage = value;
  }

  public getCurrentZoomIndex(): number {
    return this.currentZoomIndex;
  }
  public setCurrentZoomIndex(value: number): void {
    this.currentZoomIndex = value;
  }

  public getCurrentScale(): number {
    return this.currentScale;
  }
  public setCurrentScale(value: number): void {
    this.currentScale = value;
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific method
  ////////////////////////////////////////////////////////////////////////

  protected parseAndScaleSVG(
    svgString: string,
    height: number,
    width: number,
  ): Node {
    const parser = new DOMParser();
    const svg: XMLDocument = parser.parseFromString(svgString, "text/xml");
    svg.firstElementChild.setAttribute(`height`, `${height}px`);
    svg.firstElementChild.setAttribute(`width`, `${width}px`);
    return svg.firstChild;
  }

  // Necessary for how ES6 "this" works inside events
  private bindListeners(): void {
    this.boundContextMenu = (e: PointerEvent) => this.contextMenuListener(e);
    this.boundKeyDown = (e: KeyboardEvent) => this.keyDownListener(e);
    this.boundKeyUp = (e: KeyboardEvent) => this.keyUpListener(e);
    this.boundMouseMove = (e: MouseEvent) => this.mouseMoveListener(e);
    this.boundMouseUp = (e: MouseEvent) => this.mouseUpListener(e);
    this.boundResize = (e: Event) => this.resizeComponents(e);
  }

  ////////////////////////////////////////////////////////////////////////
  // Overriding methods
  ////////////////////////////////////////////////////////////////////////

  override destroy(): void {
    // Called to unsubscribe from all events. Probably a good idea to call this if the object is deleted.
    this.eventManager.unbindAll();

    document.removeEventListener("contextmenu", this.contextMenuListener);
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
    document.removeEventListener("touchmove", this.boundMouseMove);
    document.removeEventListener("touchend", this.boundMouseUp);

    super.destroy();
  }

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////

  override onActivate(e: CustomEvent): boolean {
    if (!super.onActivate(e)) return false;
    //console.debug("VerovioView::onActivate");

    this.refreshView(VerovioView.Refresh.Activate);
    return true;
  }

  override onLoadData(e: CustomEvent): boolean {
    if (!super.onLoadData(e)) return false;
    //console.debug("VerovioView::onLoadData");

    const mei = e.detail?.mei ?? "";
    const lightEndLoading = e.detail?.lightEndLoading ?? true;
    const reload = e.detail?.reload ?? false;
    this.refreshView(
      VerovioView.Refresh.LoadData,
      lightEndLoading,
      mei,
      reload,
    );
    return true;
  }

  override onResized(e: CustomEvent): boolean {
    if (!super.onResized(e)) return false;
    //console.debug("VerovioView::onResized");

    this.refreshView(VerovioView.Refresh.Resized);
    return true;
  }

  override onZoom(e: CustomEvent): boolean {
    if (!super.onZoom(e)) return false;
    //console.debug("VerovioView::onZoom");

    this.currentScale = this.app.zoomLevels[this.currentZoomIndex];
    this.refreshView(VerovioView.Refresh.Zoom);
    return true;
  }

  ////////////////////////////////////////////////////////////////////////
  // Async worker method
  ////////////////////////////////////////////////////////////////////////

  protected async refreshView(
    update: VerovioView.Refresh,
    lightEndLoading: boolean = false,
    mei: string = "",
    reload: boolean = false,
  ): Promise<any> {
    console.debug("View::updateView should be overwritten");
  }

  ////////////////////////////////////////////////////////////////////////
  // Event listeners
  ////////////////////////////////////////////////////////////////////////

  contextMenuListener(e: PointerEvent): void {}

  keyDownListener(e: KeyboardEvent): void {}

  keyUpListener(e: KeyboardEvent): void {}

  mouseMoveListener(e: MouseEvent): void {}

  mouseUpListener(e: MouseEvent): void {}

  resizeComponents(e: Event): void {}
}

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace VerovioView {
  export enum Refresh {
    Activate,
    Resized,
    LoadData,
    Zoom,
  }

  export interface Options {
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

  export interface EditInfo {
    chainedId: string;
    canUndo: boolean;
    canRedo: boolean;
  }

  export interface ElementsAtTime {
    page: number;
    measure: string;
    notes: Array<string>;
    rests: Array<string>;
    chords: Array<string>;
  }
}

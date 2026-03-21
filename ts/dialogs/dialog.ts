/**
 * The Dialog class is the based class for other dialog implementations.
 * It should not be instantiated directly but only through inherited classes.
 */

import { App } from "../app.js";
import { Deferred } from "../events/deferred.js";
import { EventManager } from "../events/event-manager.js";
import {
  appendDetailsTo,
  appendDivTo,
  appendSummaryTo,
  insertDivBefore,
} from "../utils/functions.js";

export class Dialog {
  protected readonly app: App;
  protected readonly eventManager: EventManager;
  protected readonly div: HTMLDivElement;
  protected readonly options: Dialog.Options;

  protected readonly box: HTMLDivElement;
  protected readonly top: HTMLDivElement;
  protected readonly icon: HTMLDivElement;
  protected readonly close: HTMLDivElement;
  protected readonly content: HTMLDivElement;
  protected readonly bottom: HTMLDivElement;
  protected readonly cancelBtn: HTMLDivElement;
  protected readonly okBtn: HTMLDivElement;

  private boundKeyDown: { (event: KeyboardEvent): void };
  private deferred: Deferred;

  constructor(
    div: HTMLDivElement,
    app: App,
    title: string,
    options: Dialog.Options,
  ) {
    this.options = Object.assign(
      {
        icon: "info",
        type: Dialog.Type.OKCancel,
        okLabel: "OK",
        cancelLabel: "Cancel",
      },
      options,
    );

    this.div = div;
    // Remove previous content
    this.div.textContent = "";

    this.app = app;

    this.eventManager = new EventManager(this);
    this.bindListeners(); // Document/Window-scoped events

    // Create the HTML content
    this.box = appendDivTo(this.div, { class: `vrv-dialog-box` });

    // The top of the dialog
    this.top = appendDivTo(this.box, { class: `vrv-dialog-top` });

    this.icon = appendDivTo(this.top, { class: `vrv-dialog-icon` });
    this.icon.classList.add(this.options.icon);

    const titleDiv = appendDivTo(this.top, { class: `vrv-dialog-title` });
    titleDiv.textContent = title;
    this.close = appendDivTo(this.top, { class: `vrv-dialog-close` });

    // The content of the dialog
    this.content = appendDivTo(this.box, { class: `vrv-dialog-content` });

    // The bottom of the dialog with buttons
    this.bottom = appendDivTo(this.box, { class: `vrv-dialog-bottom` });

    this.cancelBtn = appendDivTo(this.bottom, {
      class: `vrv-dialog-btn`,
      "data-before": this.options.cancelLabel,
    });
    this.okBtn = appendDivTo(this.bottom, {
      class: `vrv-dialog-btn`,
      "data-before": this.options.okLabel,
    });

    this.eventManager.bind(this.close, "click", this.cancel);
    this.eventManager.bind(this.cancelBtn, "click", this.cancel);
    this.eventManager.bind(this.okBtn, "click", this.ok);
    document.addEventListener("keydown", this.boundKeyDown);

    if (this.options.type === Dialog.Type.Msg) {
      this.cancelBtn.style.display = "none";
    }
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

  public addButton(label: string, event: Function) {
    const btn = insertDivBefore(
      this.bottom,
      { class: `vrv-dialog-btn`, "data-before": label },
      this.cancelBtn,
    );
    this.eventManager.bind(btn, "click", event);
  }

  public setContent(content: string): void {
    this.content.innerHTML = content;
  }

  protected addDetails(label: string, content: string) {
    let details = appendDetailsTo(this.content, {});
    let summary = appendSummaryTo(details, {});
    let div = appendDivTo(details, {});
    summary.innerHTML = label;
    div.innerHTML = content;
  }

  protected bindListeners(): void {
    this.boundKeyDown = (e: KeyboardEvent) => this.keyDownListener(e);
  }

  protected cancel(): void {
    this.div.style.display = "none";
    document.removeEventListener("keydown", this.boundKeyDown);
    this.deferred.resolve(0);
  }

  protected ok(): void {
    this.div.style.display = "none";
    document.removeEventListener("keydown", this.boundKeyDown);
    const resolveValue = this.options.type === Dialog.Type.Msg ? 0 : 1;
    this.deferred.resolve(resolveValue);
  }

  protected reset(): void {}

  ////////////////////////////////////////////////////////////////////////
  // Async methods
  ////////////////////////////////////////////////////////////////////////

  async show(): Promise<any> {
    this.div.style.display = "block";
    this.okBtn.focus();
    this.deferred = new Deferred();
    return this.deferred.promise;
  }

  ////////////////////////////////////////////////////////////////////////
  // Event methods
  ////////////////////////////////////////////////////////////////////////

  keyDownListener(e: KeyboardEvent): void {
    if (e.keyCode === 27)
      this.cancel(); // esc
    else if (e.keyCode === 13) this.ok(); // enter
  }

  ////////////////////////////////////////////////////////////////////////
  // UI helper
  ////////////////////////////////////////////////////////////////////////

  protected appendLabel(parent: HTMLDivElement, text: string): HTMLDivElement {
    const label = appendDivTo(parent, { class: "vrv-dialog-label" });
    label.textContent = text;
    return label;
  }
}

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace Dialog {
  export enum Type {
    Msg,
    OKCancel,
  }

  export interface Options {
    icon?: string;
    type?: Dialog.Type;
    okLabel?: string;
    cancelLabel?: string;
  }
}

/**
 * The DialogSelect class for selecting a part of a score.
 */

import { App } from "../app.js";
import { Dialog } from "./dialog.js";
import { appendDivTo, appendInputTo } from "../utils/functions.js";

export class DialogSelection extends Dialog {
  protected selection: Object;

  protected readonly fields: HTMLDivElement;
  protected readonly selectMeasureRange: HTMLInputElement;
  protected readonly selectStart: HTMLInputElement;
  protected readonly selectEnd: HTMLInputElement;

  constructor(
    div: HTMLDivElement,
    app: App,
    title: string,
    options: Dialog.Options,
    selection: Object,
  ) {
    super(div, app, title, options);

    this.addButton("Reset", this.reset);

    this.fields = appendDivTo(this.content, { class: `vrv-dialog-form` });

    this.appendLabel(this.fields, "Measure range");
    this.selectMeasureRange = appendInputTo(this.fields, {
      class: `vrv-dialog-input`,
    });
    this.selectMeasureRange.placeholder = "Measure range (e.g., '2-10')";

    this.appendLabel(this.fields, "Start");
    this.selectStart = appendInputTo(this.fields, {
      class: `vrv-dialog-input`,
    });
    this.selectStart.placeholder = "Start measure xml:id";

    this.appendLabel(this.fields, "End");
    this.selectEnd = appendInputTo(this.fields, { class: `vrv-dialog-input` });
    this.selectEnd.placeholder = "End measure xml:id";

    this.selection = selection;
    if (selection["measureRange"])
      this.selectMeasureRange.value = selection["measureRange"];
    else {
      if (selection["start"]) this.selectStart.value = selection["start"];
      if (selection["end"]) this.selectStart.value = selection["end"];
    }
  }

  ////////////////////////////////////////////////////////////////////////
  // Getters and setters
  ////////////////////////////////////////////////////////////////////////

  public getSelection(): Object {
    return this.selection;
  }

  ////////////////////////////////////////////////////////////////////////
  // Overriding methods
  ////////////////////////////////////////////////////////////////////////

  override ok(): void {
    if (this.selectMeasureRange.value !== "") {
      this.selection["measureRange"] = this.selectMeasureRange.value;
    } else {
      this.selection["start"] = this.selectStart.value;
      this.selection["end"] = this.selectEnd.value;
    }
    super.ok();
  }

  override reset(): void {
    this.selection = {};
    super.ok();
  }
}

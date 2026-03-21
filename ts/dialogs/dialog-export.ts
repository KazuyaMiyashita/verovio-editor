/**
 * The DialogExport class for setting parameter when exporting MEI.
 */

import { App } from "../app.js";
import { Dialog } from "./dialog.js";
import { appendDivTo, appendInputTo } from "../utils/functions.js";

export class DialogExport extends Dialog {
  protected readonly fields: HTMLDivElement;
  protected readonly exportOptions: App.MEIExportOptions;

  private readonly basicInput: HTMLInputElement;
  private readonly removeIdsInput: HTMLInputElement;
  private readonly ignoreHeaderInput: HTMLInputElement;

  constructor(div: HTMLDivElement, app: App, title: string) {
    super(div, app, title, { icon: "info", type: Dialog.Type.OKCancel });

    this.exportOptions = {
      basic: false,
      removeIds: false,
      ignoreHeader: false,
      scoreBased: true,
      firstPage: 0,
      lastPage: 0,
    };

    this.fields = appendDivTo(this.content, { class: `vrv-dialog-form` });

    this.appendLabel(this.fields, "MEI Basic");
    this.basicInput = appendInputTo(this.fields, {
      class: `vrv-dialog-input`,
      type: `checkbox`,
    });

    this.appendLabel(this.fields, "Remove IDs");
    this.removeIdsInput = appendInputTo(this.fields, {
      class: `vrv-dialog-input`,
      type: `checkbox`,
    });

    this.appendLabel(this.fields, "Ignore MEI Header");
    this.ignoreHeaderInput = appendInputTo(this.fields, {
      class: `vrv-dialog-input`,
      type: `checkbox`,
    });
  }

  ////////////////////////////////////////////////////////////////////////
  // Getters and setters
  ////////////////////////////////////////////////////////////////////////

  public getExportOptions(): App.MEIExportOptions {
    return this.exportOptions;
  }

  ////////////////////////////////////////////////////////////////////////
  // Overriding methods
  ////////////////////////////////////////////////////////////////////////

  override ok(): void {
    this.exportOptions.basic = this.basicInput.checked;
    this.exportOptions.removeIds = this.removeIdsInput.checked;
    this.exportOptions.ignoreHeader = this.ignoreHeaderInput.checked;
    super.ok();
  }

  override reset(): void {
    super.ok();
  }
}

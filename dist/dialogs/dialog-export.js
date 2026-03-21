/**
 * The DialogExport class for setting parameter when exporting MEI.
 */
import { Dialog } from "./dialog.js";
import { appendDivTo, appendInputTo } from "../utils/functions.js";
export class DialogExport extends Dialog {
    fields;
    exportOptions;
    basicInput;
    removeIdsInput;
    ignoreHeaderInput;
    constructor(div, app, title) {
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
    getExportOptions() {
        return this.exportOptions;
    }
    ////////////////////////////////////////////////////////////////////////
    // Overriding methods
    ////////////////////////////////////////////////////////////////////////
    ok() {
        this.exportOptions.basic = this.basicInput.checked;
        this.exportOptions.removeIds = this.removeIdsInput.checked;
        this.exportOptions.ignoreHeader = this.ignoreHeaderInput.checked;
        super.ok();
    }
    reset() {
        super.ok();
    }
}
//# sourceMappingURL=dialog-export.js.map
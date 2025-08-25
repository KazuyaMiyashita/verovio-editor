/**
 * The DialogSettingsEditor class for the editor settings.
 */
import { Dialog } from './dialog.js';
import { appendDivTo, appendInputTo, appendOptionTo, appendSelectTo } from '../utils/functions.js';
export class DialogSettingsEditor extends Dialog {
    constructor(div, app, title, options, appOptions) {
        super(div, app, title, options);
        this.appOptions = appOptions;
        this.reload = false;
        this.addButton("Reset", this.reset);
        this.fields = appendDivTo(this.content, { class: `vrv-dialog-form` });
        this.appendLabel(this.fields, "Verovio version");
        this.verovioVersion = appendSelectTo(this.fields, { class: `vrv-dialog-input` });
        ["latest", "develop"].forEach(version => {
            let option = appendOptionTo(this.verovioVersion, {});
            option.value = version;
            option.textContent = version;
            if (appOptions.verovioVersion === version)
                option.selected = true;
        });
        this.appendLabel(this.fields, "Development features");
        this.devFeatures = appendInputTo(this.fields, { class: `vrv-dialog-input`, type: `checkbox` });
        if (appOptions.devFeatures === true)
            this.devFeatures.checked = true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    getAppOptions() { return this.appOptions; }
    isReload() { return this.reload; }
    ////////////////////////////////////////////////////////////////////////
    // Overriding methods
    ////////////////////////////////////////////////////////////////////////
    ok() {
        if (this.verovioVersion.value !== this.appOptions.verovioVersion) {
            this.reload = true;
        }
        this.appOptions.verovioVersion = this.verovioVersion.value;
        if (this.devFeatures.checked !== this.appOptions.devFeatures) {
            this.reload = true;
        }
        this.appOptions.devFeatures = this.devFeatures.checked;
        super.ok();
    }
    reset() {
        super.ok();
    }
}
//# sourceMappingURL=dialog-settings-editor.js.map
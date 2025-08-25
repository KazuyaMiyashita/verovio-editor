/**
 * The DialogSettingsEditor class for the editor settings.
 */

import { App } from '../app.js';
import { Dialog } from './dialog.js';
import { appendDivTo, appendInputTo, appendOptionTo, appendSelectTo } from '../utils/functions.js';

export class DialogSettingsEditor extends Dialog {
    protected reload: boolean;

    protected readonly fields: HTMLDivElement;
    protected readonly appOptions: App.Options;
    protected readonly verovioVersion: HTMLSelectElement;
    protected readonly devFeatures: HTMLInputElement;

    constructor(div: HTMLDivElement, app: App, title: string, options: Dialog.Options, appOptions: App.Options) {
        super(div, app, title, options);

        this.appOptions = appOptions;
        this.reload = false;

        this.addButton("Reset", this.reset);

        this.fields = appendDivTo(this.content, { class: `vrv-dialog-form` });

        const labelVerovioVersion = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelVerovioVersion.innerHTML = "Verovio version";
        this.verovioVersion = appendSelectTo(this.fields, { class: `vrv-dialog-input` });
        ["latest", "develop"].forEach(version => {
            let option = appendOptionTo(this.verovioVersion, {});
            option.value = version;
            option.innerHTML = version;
            if (appOptions.verovioVersion === version) option.selected = true;
        })

        const labelDevFeatures = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelDevFeatures.innerHTML = "Development features";
        this.devFeatures = appendInputTo(this.fields, { class: `vrv-dialog-input`, type: `checkbox` });
        if (appOptions.devFeatures === true) this.devFeatures.checked = true;

    }

    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    public getAppOptions(): App.Options { return this.appOptions; }

    public isReload(): boolean { return this.reload; }

    ////////////////////////////////////////////////////////////////////////
    // Overriding methods
    ////////////////////////////////////////////////////////////////////////

    override ok(): void {
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

    override reset(): void {
        super.ok();
    }
}

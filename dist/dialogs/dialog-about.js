/**
 * The DialogAbout class.
 */
import { Dialog } from "./dialog.js";
import { appendDivTo } from "../utils/functions.js";
import { libraries } from "../utils/messages.js";
export class DialogAbout extends Dialog {
    constructor(div, app, title) {
        super(div, app, title, {
            okLabel: "Close",
            icon: "info",
            type: Dialog.Type.Msg,
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Async network methods
    ////////////////////////////////////////////////////////////////////////
    async load() {
        let lib = appendDivTo(this.content, {});
        lib.innerHTML = marked.parse(libraries);
        try {
            if (this.app.options.licenseUrl) {
                const response = await fetch(this.app.options.licenseUrl);
                const text = await response.text();
                this.addDetails("License", marked.parse(text));
            }
        }
        catch (err) {
            console.error(err);
        }
        try {
            if (this.app.options.changelogUrl) {
                const response = await fetch(this.app.options.changelogUrl);
                const text = await response.text();
                this.addDetails("Change log", marked.parse(text));
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}
//# sourceMappingURL=dialog-about.js.map
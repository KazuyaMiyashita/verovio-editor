import { DocumentView } from "../document/document-view.js";
import { appendDivTo } from "../utils/functions.js";
export class DocumentViewPlugin {
    id = "document-view";
    app;
    viewObj;
    install(app) {
        this.app = app;
        app.registerCommand("view.setDocument", () => app.setViewByName("document"));
    }
    init() {
        if (this.app.options.enableDocument !== false) {
            // @ts-ignore - accessing internal views div
            const viewsDiv = this.app.views;
            if (viewsDiv) {
                const container = appendDivTo(viewsDiv, { class: "vrv-view" });
                this.viewObj = new DocumentView(container, this.app, this.app.verovio);
                this.app.customEventManager.addToPropagationList(this.viewObj.customEventManager);
                this.app.registerView("document", this.viewObj);
            }
        }
    }
}
//# sourceMappingURL=document-view-plugin.js.map
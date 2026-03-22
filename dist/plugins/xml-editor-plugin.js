import { EditorPanel } from "../editor/editor-panel.js";
import { appendDivTo } from "../utils/functions.js";
export class XmlEditorPlugin {
    id = "xml-editor";
    app;
    viewObj;
    install(app) {
        this.app = app;
        app.registerCommand("view.setEditor", () => app.setViewByName("editor"));
    }
    init() {
        if (this.app.options.enableEditor !== false) {
            const viewsDiv = this.app.viewsElement;
            if (viewsDiv) {
                const container = appendDivTo(viewsDiv, { class: "vrv-view" });
                this.viewObj = new EditorPanel(container, this.app, this.app.verovio, this.app.validator, this.app.rngLoader);
                this.app.customEventManager.addToPropagationList(this.viewObj.customEventManager);
                this.app.registerView("editor", this.viewObj);
                this.app.registerService("xml-editor-view", this.viewObj);
            }
        }
    }
}
//# sourceMappingURL=xml-editor-plugin.js.map
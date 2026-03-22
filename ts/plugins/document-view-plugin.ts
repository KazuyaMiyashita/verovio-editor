import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { DocumentView } from "../document/document-view.js";
import { appendDivTo } from "../utils/functions.js";

export class DocumentViewPlugin implements EditorPlugin {
  id = "document-view";
  private app!: App;
  private viewObj!: DocumentView;

  install(app: App): void {
    this.app = app;
    app.registerCommand("view.setDocument", () => app.setViewByName("document"));
  }

  init(): void {
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

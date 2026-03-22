import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { EditorPanel } from "../editor/editor-panel.js";
import { appendDivTo } from "../utils/functions.js";

export class XmlEditorPlugin implements EditorPlugin {
  id = "xml-editor";
  private app!: App;
  private viewObj!: EditorPanel;

  install(app: App): void {
    this.app = app;
    app.registerCommand("view.setEditor", () => app.setViewByName("editor"));
  }

  init(): void {
    if (this.app.options.enableEditor !== false) {
      // @ts-ignore - accessing internal views div
      const viewsDiv = this.app.views;
      if (viewsDiv) {
        const container = appendDivTo(viewsDiv, { class: "vrv-view" });
        this.viewObj = new EditorPanel(
          container,
          this.app,
          this.app.verovio,
          this.app.validator as any,
          this.app.rngLoader as any
        );
        this.app.customEventManager.addToPropagationList(this.viewObj.customEventManager);
        this.app.registerView("editor", this.viewObj as any);
        this.app.registerService("xml-editor-view", this.viewObj);
      }
    }
  }
}

import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { ResponsiveView } from "../verovio/responsive-view.js";
import { appendDivTo } from "../utils/functions.js";

export class ResponsiveViewPlugin implements EditorPlugin {
  id = "responsive-view";
  private app!: App;
  private viewObj!: ResponsiveView;

  install(app: App): void {
    this.app = app;
    app.registerCommand("view.setResponsive", () => app.setViewByName("responsive"));
  }

  init(): void {
    if (this.app.options.enableResponsive !== false) {
      // @ts-ignore - accessing internal views div
      const viewsDiv = this.app.views;
      if (viewsDiv) {
        const container = appendDivTo(viewsDiv, { class: "vrv-view" });
        this.viewObj = new ResponsiveView(container, this.app, this.app.verovio);
        this.app.customEventManager.addToPropagationList(this.viewObj.customEventManager);
        this.app.registerView("responsive", this.viewObj);
      }
    }
  }
}

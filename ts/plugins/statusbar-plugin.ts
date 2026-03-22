import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { AppStatusbar } from "../app-statusbar.js";

export class StatusbarPlugin implements EditorPlugin {
  id = "statusbar";
  private app!: App;
  private statusbarObj!: AppStatusbar;

  install(app: App): void {
    this.app = app;
  }

  init(): void {
    if (this.app.options.enableStatusbar !== false) {
      // @ts-ignore - accessing internal statusbar div
      const statusbarDiv = this.app.statusbar;
      if (statusbarDiv) {
        this.statusbarObj = new AppStatusbar(statusbarDiv, this.app);
        this.app.customEventManager.addToPropagationList(this.statusbarObj.customEventManager);
        
        // @ts-ignore
        this.statusbarObj.setVerovioVersion(this.app.verovioRuntimeVersion);
      }
    }
  }
}

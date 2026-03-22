import { App } from "../app.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";
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
      const statusbarDiv = this.app.statusbarElement;
      if (statusbarDiv) {
        this.statusbarObj = new AppStatusbar(statusbarDiv, this.app);
        this.app.customEventManager.addToPropagationList(this.statusbarObj.customEventManager);
        
        this.statusbarObj.setVerovioVersion(this.app.getRuntimeVersion());

        // Pull state once the app is fully ready
        this.app.ready.then(() => {
          if (this.app.loaderService.getCount() === 0) {
            this.statusbarObj.onEndLoading(createAppEvent(AppEvent.EndLoading) as any);
          }
        });
      }
    }
  }
}

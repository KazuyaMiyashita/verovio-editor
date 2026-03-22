import { AppEvent, createAppEvent } from "../events/event-types.js";
import { AppStatusbar } from "../app-statusbar.js";
export class StatusbarPlugin {
    id = "statusbar";
    app;
    statusbarObj;
    install(app) {
        this.app = app;
    }
    init() {
        if (this.app.options.enableStatusbar !== false) {
            const statusbarDiv = this.app.statusbarElement;
            if (statusbarDiv) {
                this.statusbarObj = new AppStatusbar(statusbarDiv, this.app);
                this.app.customEventManager.addToPropagationList(this.statusbarObj.customEventManager);
                this.statusbarObj.setVerovioVersion(this.app.getRuntimeVersion());
                // Pull state once the app is fully ready
                this.app.ready.then(() => {
                    if (this.app.loaderService.getCount() === 0) {
                        this.statusbarObj.onEndLoading(createAppEvent(AppEvent.EndLoading));
                    }
                });
            }
        }
    }
}
//# sourceMappingURL=statusbar-plugin.js.map
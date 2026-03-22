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
//# sourceMappingURL=statusbar-plugin.js.map
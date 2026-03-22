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
            }
        }
    }
}
//# sourceMappingURL=statusbar-plugin.js.map
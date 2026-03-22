import { ResponsiveView } from "../verovio/responsive-view.js";
import { appendDivTo } from "../utils/functions.js";
export class ResponsiveViewPlugin {
    id = "responsive-view";
    app;
    viewObj;
    install(app) {
        this.app = app;
        app.registerCommand("view.setResponsive", () => app.setViewByName("responsive"));
    }
    init() {
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
//# sourceMappingURL=responsive-view-plugin.js.map
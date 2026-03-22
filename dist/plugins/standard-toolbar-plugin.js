import { AppToolbar } from "../toolbars/app-toolbar.js";
import { appendDivTo } from "../utils/functions.js";
export class StandardToolbarPlugin {
    id = "standard-toolbar";
    app;
    toolbarObj;
    install(app) {
        this.app = app;
        // Standard commands the toolbar might execute
        app.registerCommand("view.zoomIn", () => this.app.zoomInView());
        app.registerCommand("view.zoomOut", () => this.app.zoomOutView());
        app.registerCommand("view.nextPage", () => this.app.goToNextPage());
        app.registerCommand("view.prevPage", () => this.app.goToPreviousPage());
    }
    init() {
        if (this.app.options.enableToolbar !== false) {
            // @ts-ignore - accessing internal toolbar div
            const toolbarDiv = this.app.toolbar;
            if (toolbarDiv) {
                this.toolbarObj = new AppToolbar(toolbarDiv, this.app);
                this.app.customEventManager.addToPropagationList(this.toolbarObj.customEventManager);
                this.app.registerService("toolbar", this.toolbarObj);
                this.renderContributions();
            }
        }
    }
    renderContributions() {
        const actions = this.app.getContributions("toolbar.actions");
        // @ts-ignore - accessing internal toolbar div for extra buttons
        const toolbarDiv = this.app.toolbar;
        if (actions.length > 0 && toolbarDiv) {
            const extraActionsContainer = appendDivTo(toolbarDiv, {
                class: "vrv-toolbar-extra",
                style: { display: "flex", alignItems: "center", marginLeft: "10px" }
            });
            actions.forEach(action => {
                const btn = appendDivTo(extraActionsContainer, {
                    class: "vrv-btn-text",
                    "data-before": action.label,
                    id: action.id
                });
                btn.onclick = () => this.app.executeCommand(action.command);
            });
        }
    }
}
//# sourceMappingURL=standard-toolbar-plugin.js.map
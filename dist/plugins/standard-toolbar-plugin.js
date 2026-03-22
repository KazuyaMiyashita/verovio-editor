import { AppEvent, createAppEvent } from "../events/event-types.js";
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
            const toolbarDiv = this.app.toolbarElement;
            if (toolbarDiv) {
                this.toolbarObj = new AppToolbar(toolbarDiv, this.app);
                this.app.customEventManager.addToPropagationList(this.toolbarObj.customEventManager);
                this.app.registerService("toolbar", this.toolbarObj);
                // Ensure toolbar is active to receive events
                this.toolbarObj.onActivate(null);
                // Initial update
                // @ts-ignore
                this.toolbarObj.updateAll();
                this.renderContributions();
                // Pull state once the app is fully ready
                this.app.ready.then(() => {
                    if (this.app.loaderService.getCount() === 0) {
                        this.toolbarObj.onEndLoading(createAppEvent(AppEvent.EndLoading));
                    }
                });
            }
        }
    }
    renderContributions() {
        const actions = this.app.getContributions("toolbar.actions");
        const toolbarDiv = this.app.toolbarElement;
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
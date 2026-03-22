import { ContextMenu } from "../toolbars/context-menu.js";
export class ContextMenuPlugin {
    id = "context-menu";
    app;
    contextMenuObj;
    install(app) {
        this.app = app;
    }
    init() {
        if (this.app.options.enableContextMenu !== false) {
            const menuDiv = this.app.contextMenu;
            const underlayDiv = this.app.contextUnderlayElement;
            if (menuDiv && underlayDiv) {
                this.contextMenuObj = new ContextMenu(menuDiv, this.app, underlayDiv);
                this.app.customEventManager.addToPropagationList(this.contextMenuObj.customEventManager);
                this.app.registerService("context-menu", this.contextMenuObj);
            }
        }
    }
}
//# sourceMappingURL=context-menu-plugin.js.map
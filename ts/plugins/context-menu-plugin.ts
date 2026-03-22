import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { ContextMenu } from "../toolbars/context-menu.js";

export class ContextMenuPlugin implements EditorPlugin {
  id = "context-menu";
  private app!: App;
  private contextMenuObj!: ContextMenu;

  install(app: App): void {
    this.app = app;
  }

  init(): void {
    if (this.app.options.enableContextMenu !== false) {
      // @ts-ignore
      const menuDiv = this.app.contextMenu;
      // @ts-ignore
      const underlayDiv = this.app.contextUnderlay;
      if (menuDiv && underlayDiv) {
        this.contextMenuObj = new ContextMenu(menuDiv, this.app, underlayDiv);
        this.app.customEventManager.addToPropagationList(this.contextMenuObj.customEventManager);
        this.app.registerService("context-menu", this.contextMenuObj);
      }
    }
  }
}

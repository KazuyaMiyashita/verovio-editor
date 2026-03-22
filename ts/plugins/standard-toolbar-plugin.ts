import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { AppToolbar } from "../toolbars/app-toolbar.js";
import { appendDivTo } from "../utils/functions.js";

export interface ToolbarAction {
  id: string;
  label: string;
  command: string;
  icon?: string;
}

export class StandardToolbarPlugin implements EditorPlugin {
  id = "standard-toolbar";
  private app!: App;
  private toolbarObj!: AppToolbar;

  install(app: App): void {
    this.app = app;
    // Standard commands the toolbar might execute
    app.registerCommand("view.zoomIn", () => this.app.zoomInView());
    app.registerCommand("view.zoomOut", () => this.app.zoomOutView());
    app.registerCommand("view.nextPage", () => this.app.goToNextPage());
    app.registerCommand("view.prevPage", () => this.app.goToPreviousPage());
  }

  init(): void {
    if (this.app.options.enableToolbar !== false) {
      const toolbarDiv = this.app.toolbarElement;
      if (toolbarDiv) {
        this.toolbarObj = new AppToolbar(toolbarDiv, this.app);
        this.app.customEventManager.addToPropagationList(this.toolbarObj.customEventManager);
        this.app.registerService("toolbar", this.toolbarObj);
        
        // Ensure toolbar is active to receive events
        this.toolbarObj.onActivate(null as any);
        
        // Initial update
        // @ts-ignore
        this.toolbarObj.updateAll();
        
        this.renderContributions();
      }
    }
  }

  private renderContributions(): void {
    const actions = this.app.getContributions<ToolbarAction>("toolbar.actions");
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

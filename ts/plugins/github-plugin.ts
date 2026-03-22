import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { GitHubManager } from "../utils/github-manager.js";
import { DialogGhImport } from "../dialogs/dialog-gh-import.js";
import { DialogGhExport } from "../dialogs/dialog-gh-export.js";

export class GitHubPlugin implements EditorPlugin {
  id = "github";
  private app!: App;
  private githubManager!: GitHubManager;

  constructor(private options?: GitHubManager.Options) {}

  install(app: App): void {
    this.app = app;
    this.githubManager = new GitHubManager(app);
    
    app.registerService("github-manager", this.githubManager);

    app.registerCommand("github.import", this.import.bind(this));
    app.registerCommand("github.export", this.export.bind(this));
  }

  async import(): Promise<void> {
    if (this.app.options.useCustomDialogs) {
      const event = new CustomEvent("onGithubImportRequest", { cancelable: true });
      this.app.dispatchEvent(event);
      if (event.defaultPrevented) return;
    }

    const dlg = new DialogGhImport(
      this.app.dialogDiv,
      this.app,
      "Import an MEI file from GitHub",
      {},
      this.githubManager,
    );
    const dlgRes = await dlg.show();
    if (dlgRes === 1) {
      this.app.fileService.loadData(dlg.getData() as string, dlg.getFilename());
    }
  }

  async export(): Promise<void> {
    if (this.app.options.useCustomDialogs) {
      const event = new CustomEvent("onGithubExportRequest", { cancelable: true });
      this.app.dispatchEvent(event);
      if (event.defaultPrevented) return;
    }

    const dlg = new DialogGhExport(
      this.app.dialogDiv,
      this.app,
      "Export an MEI file to GitHub",
      {},
      this.githubManager,
    );
    const dlgRes = await dlg.show();
    if (dlgRes === 1) {
    }
  }
}

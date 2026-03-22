import { GitHubManager } from "../utils/github-manager.js";
import { DialogGhImport } from "../dialogs/dialog-gh-import.js";
import { DialogGhExport } from "../dialogs/dialog-gh-export.js";
export class GitHubPlugin {
    options;
    id = "github";
    app;
    githubManager;
    constructor(options) {
        this.options = options;
    }
    install(app) {
        this.app = app;
        this.githubManager = new GitHubManager(app);
        app.registerService("github-manager", this.githubManager);
        app.registerCommand("github.import", this.import.bind(this));
        app.registerCommand("github.export", this.export.bind(this));
    }
    async import() {
        if (this.app.options.useCustomDialogs) {
            const event = new CustomEvent("onGithubImportRequest", { cancelable: true });
            this.app.dispatchEvent(event);
            if (event.defaultPrevented)
                return;
        }
        const dlg = new DialogGhImport(this.app.dialogDiv, this.app, "Import an MEI file from GitHub", {}, this.githubManager);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
            this.app.fileService.loadData(dlg.getData(), dlg.getFilename());
        }
    }
    async export() {
        if (this.app.options.useCustomDialogs) {
            const event = new CustomEvent("onGithubExportRequest", { cancelable: true });
            this.app.dispatchEvent(event);
            if (event.defaultPrevented)
                return;
        }
        const dlg = new DialogGhExport(this.app.dialogDiv, this.app, "Export an MEI file to GitHub", {}, this.githubManager);
        const dlgRes = await dlg.show();
        if (dlgRes === 1) {
        }
    }
}
//# sourceMappingURL=github-plugin.js.map
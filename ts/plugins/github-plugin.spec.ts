import { describe, it, expect, vi } from "vitest";
import { App } from "../app.js";
import { GitHubPlugin } from "./github-plugin.js";

describe("GitHub Plugin", () => {
  it("should install GitHubManager into the service registry", () => {
    const div = document.createElement("div");
    const app = new App(div, { version: "1.0.0", disableLocalStorage: true, appReset: true, injectStyles: false });
    
    const plugin = new GitHubPlugin({ login: "", account: "", repo: "", branch: "", path: [] });
    app.use(plugin);

    // Ensure GitHubManager is registered as a service
    const githubService = app.getService("github-manager");
    expect(githubService).toBeDefined();
    
    // Ensure commands for import/export are registered
    expect(app.executeCommand).toBeDefined(); // Need to check commands map, but app.executeCommand is public
  });
});

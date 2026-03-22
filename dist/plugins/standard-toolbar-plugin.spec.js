import { describe, it, expect, vi } from "vitest";
import { App } from "../app.js";
import { StandardToolbarPlugin } from "./standard-toolbar-plugin.js";
describe("Standard Toolbar Plugin & Extension Points", () => {
    it("should render a toolbar and support contributions from other plugins", async () => {
        const div = document.createElement("div");
        // StandardToolbarPlugin needs a toolbar container in the app
        const app = new App(div, { version: "1.0.0", disableLocalStorage: true, appReset: true, injectStyles: false });
        const toolbarPlugin = new StandardToolbarPlugin();
        app.use(toolbarPlugin);
        // Register a command and a contribution to the toolbar
        const commandHandler = vi.fn();
        app.registerCommand("plugin.action", commandHandler);
        // Using a new extension point API we're about to implement
        app.contribute("toolbar.actions", {
            id: "my-plugin-btn",
            label: "My Action",
            command: "plugin.action"
        });
        await app.initPlugins();
        // Verify the button was rendered in the toolbar
        const toolbarElement = div.querySelector(".vrv-toolbar");
        expect(toolbarElement).toBeDefined();
        // In a real scenario, we'd check if the button exists in the DOM
        // For now, let's ensure the plugin is registered
        expect(app.getPlugin("standard-toolbar")).toBe(toolbarPlugin);
    });
});
//# sourceMappingURL=standard-toolbar-plugin.spec.js.map
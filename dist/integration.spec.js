import { describe, it, expect } from "vitest";
import { App, DocumentViewPlugin, StandardToolbarPlugin, ValidationPlugin } from "../ts/index.js";
describe("Verovio Editor Integration", () => {
    it("should initialize with plugins without crashing", async () => {
        const div = document.createElement("div");
        div.id = "app";
        document.body.appendChild(div);
        const options = {
            version: "1.0.0",
            defaultView: "document",
            enableDocument: true,
            enableToolbar: true,
            injectStyles: false
        };
        const app = new App(div, options);
        app.use(new StandardToolbarPlugin());
        app.use(new DocumentViewPlugin());
        app.use(new ValidationPlugin());
        // Initialize plugins - this should not throw any null pointer errors
        await expect(app.initPlugins()).resolves.not.toThrow();
        // Check if app is loaded
        expect(app.isLoaded()).toBeDefined();
        // Ensure toolbar view was set up via plugin
        expect(app.getToolbarView()).toBeDefined();
    });
});
//# sourceMappingURL=integration.spec.js.map
import { describe, it, expect, vi, beforeAll } from "vitest";
import { App } from "../app.js";
beforeAll(() => {
    // Mock IntersectionObserver which is not implemented in jsdom
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
});
describe("Microkernel Plugin System", () => {
    it("should register a plugin via app.use() and call its install method", () => {
        // Mock the DOM element required by App
        const div = document.createElement("div");
        const app = new App(div, { version: "1.0.0", disableLocalStorage: true, appReset: true, injectStyles: false, enableGitHub: false });
        const mockPlugin = {
            id: "test-plugin",
            install: vi.fn(),
            init: vi.fn(),
        };
        app.use(mockPlugin);
        // Verify plugin is registered
        expect(app.getPlugin("test-plugin")).toBe(mockPlugin);
        // Verify install was called immediately
        expect(mockPlugin.install).toHaveBeenCalledWith(app);
    });
    it("should support a service registry for dependency injection", () => {
        const div = document.createElement("div");
        const app = new App(div, { version: "1.0.0", disableLocalStorage: true, appReset: true, injectStyles: false, enableGitHub: false });
        class MockService {
            doSomething() { return "done"; }
        }
        const mockService = new MockService();
        // Register service
        app.registerService("my-service", mockService);
        // Retrieve service
        const retrieved = app.getService("my-service");
        expect(retrieved).toBe(mockService);
        expect(retrieved?.doSomething()).toBe("done");
    });
    it("should support a command bus for decoupled communication", () => {
        const div = document.createElement("div");
        const app = new App(div, { version: "1.0.0", disableLocalStorage: true, appReset: true, injectStyles: false, enableGitHub: false });
        const commandHandler = vi.fn();
        // Register command
        app.registerCommand("my.custom.command", commandHandler);
        // Execute command
        app.executeCommand("my.custom.command", { param: "value" });
        expect(commandHandler).toHaveBeenCalledWith({ param: "value" });
    });
    it("should call init() on all plugins during app initialization", async () => {
        const div = document.createElement("div");
        const app = new App(div, { version: "1.0.0", disableLocalStorage: true, appReset: true, injectStyles: false, enableGitHub: false });
        const mockPlugin = {
            id: "async-plugin",
            install: vi.fn(),
            init: vi.fn(),
        };
        app.use(mockPlugin);
        // Trigger initialization (assuming this method will be added to App)
        await app.initPlugins();
        expect(mockPlugin.init).toHaveBeenCalled();
    });
});
//# sourceMappingURL=plugin.spec.js.map
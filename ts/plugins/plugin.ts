import { App } from "../app.js";

/**
 * EditorPlugin is the standard interface for all Verovio Editor extensions.
 */
export interface EditorPlugin {
  id: string;

  /**
   * Phase 1: Install
   * Called immediately when the plugin is added via `app.use()`.
   * Use this to register services, commands, or subscribe to events.
   * Do NOT manipulate the DOM here.
   */
  install(app: App): void;

  /**
   * Phase 2: Initialize (Optional)
   * Called after all plugins have been installed and the app is ready.
   * Use this to build UI or access services provided by other plugins.
   */
  init?(): Promise<void> | void;

  /**
   * Teardown (Optional)
   * Called when the app or the plugin is destroyed.
   */
  destroy?(): void;
}

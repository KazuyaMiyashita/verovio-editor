import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { RNGLoader } from "../xml/rng-loader.js";
import { ValidatorWorkerProxy } from "../utils/worker-proxy.js";

export class ValidationPlugin implements EditorPlugin {
  id = "validation";
  private app!: App;

  install(app: App): void {
    this.app = app;
  }

  init(): void {
    const vrvService = this.app.verovioService;
    if (vrvService) {
      this.app.registerService("validator", vrvService.validator);
      this.app.registerService("rng-loader", vrvService.rngLoader);
      this.app.registerService("rng-loader-basic", vrvService.rngLoaderBasic);
    }
  }
}

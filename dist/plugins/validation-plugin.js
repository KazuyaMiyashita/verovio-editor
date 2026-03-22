export class ValidationPlugin {
    id = "validation";
    app;
    install(app) {
        this.app = app;
    }
    init() {
        const vrvService = this.app.verovioService;
        if (vrvService) {
            this.app.registerService("validator", vrvService.validator);
            this.app.registerService("rng-loader", vrvService.rngLoader);
            this.app.registerService("rng-loader-basic", vrvService.rngLoaderBasic);
        }
    }
}
//# sourceMappingURL=validation-plugin.js.map
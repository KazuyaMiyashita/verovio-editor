export class PdfExportPlugin {
    id = "pdf-export";
    app;
    install(app) {
        this.app = app;
        app.registerCommand("file.exportPDF", () => {
            this.app.loaderService.start("Generating PDF file ...");
            // @ts-ignore
            this.app.fileService.generatePDF(this.app.output);
        });
    }
    init() {
        // pdfWorker is lazily initialized in FileService/VerovioService
        // We just register the command for now.
    }
}
//# sourceMappingURL=pdf-export-plugin.js.map
import { App } from "../app.js";
import { EditorPlugin } from "./plugin.js";
import { PDFWorkerProxy } from "../utils/worker-proxy.js";

export class PdfExportPlugin implements EditorPlugin {
  id = "pdf-export";
  private app!: App;

  install(app: App): void {
    this.app = app;
    app.registerCommand("file.exportPDF", () => {
      this.app.loaderService.start("Generating PDF file ...");
      // @ts-ignore
      this.app.fileService.generatePDF(this.app.output);
    });
  }

  init(): void {
    // pdfWorker is lazily initialized in FileService/VerovioService
    // We just register the command for now.
  }
}

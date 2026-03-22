import { VerovioWorkerProxy, ValidatorWorkerProxy, PDFWorkerProxy, } from "../utils/worker-proxy.js";
import { RNGLoader } from "../xml/rng-loader.js";
/**
 * VerovioService for managing Verovio and Validator workers.
 */
export class VerovioService {
    verovio;
    validator = null;
    rngLoader = null;
    rngLoaderBasic = null;
    verovioRuntimeVersion = "";
    host;
    pdfkitUrl;
    constructor(options) {
        this.host = options.host;
        this.pdfkitUrl = options.pdfkitUrl;
        const verovioWorkerURL = this.getWorkerURL(`${options.host}/dist/verovio/verovio-worker.js`);
        const verovioWorker = new Worker(verovioWorkerURL);
        const verovioUrl = options.verovioUrl || `https://www.verovio.org/javascript/${options.verovioVersion}/verovio-toolkit-wasm.js`;
        verovioWorker.postMessage({ verovioUrl });
        this.verovio = new VerovioWorkerProxy(verovioWorker);
        if (options.enableEditor) {
            const validatorWorkerURL = this.getWorkerURL(`${options.host}/dist/xml/validator-worker.js`);
            const validatorWorker = new Worker(validatorWorkerURL);
            const validatorUrl = options.validatorUrl || "https://www.verovio.org/javascript/validator/xml-validator-2.10.3.js";
            validatorWorker.postMessage({ validatorUrl });
            this.validator = new ValidatorWorkerProxy(validatorWorker);
            this.rngLoader = new RNGLoader();
            this.rngLoaderBasic = new RNGLoader();
        }
    }
    getWorkerURL(url) {
        const content = `importScripts("${url}");`;
        return (URL.createObjectURL(new Blob([content], { type: "text/javascript" })));
    }
    async init(options) {
        await this.verovio.onRuntimeInitialized();
        this.verovioRuntimeVersion = await this.verovio.getVersion();
        if (this.validator && this.rngLoader && this.rngLoaderBasic) {
            await this.validator.onRuntimeInitialized();
            const response = await fetch(options.schema);
            const data = await response.text();
            if (options.enableValidation) {
                await this.validator.setRelaxNGSchema(data);
            }
            this.rngLoader.setRelaxNGSchema(data);
            const responseBasic = await fetch(options.schemaBasic);
            const dataBasic = await responseBasic.text();
            this.rngLoaderBasic.setRelaxNGSchema(dataBasic);
        }
        return this.verovioRuntimeVersion;
    }
    getRuntimeVersion() {
        return this.verovioRuntimeVersion;
    }
    getPDFWorker() {
        const pdfWorkerURL = this.getWorkerURL(`${this.host}/dist/document/pdf-worker.js`);
        const pdfWorker = new Worker(pdfWorkerURL);
        const pdfkitUrl = this.pdfkitUrl || "https://www.verovio.org/javascript/pdfkit";
        pdfWorker.postMessage({ pdfkitUrl });
        return new PDFWorkerProxy(pdfWorker);
    }
}
//# sourceMappingURL=verovio-service.js.map
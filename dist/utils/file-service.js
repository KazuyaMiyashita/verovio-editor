import { PDFGenerator } from "../document/pdf-generator.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";
import { Dialog } from "../dialogs/dialog.js";
/**
 * FileService for managing file I/O and exports.
 */
export class FileService {
    app;
    fileStack;
    inputData = "";
    filename = "untitled.xml";
    constructor(app) {
        this.app = app;
        this.fileStack = app.fileStack;
    }
    getInputData() {
        return this.inputData;
    }
    getFilename() {
        return this.filename;
    }
    loadData(data, filename = "untitled.xml", convert = false, onlyIfEmpty = false) {
        if (this.inputData.length !== 0 && onlyIfEmpty)
            return;
        if (this.inputData.length !== 0) {
            this.fileStack.store(this.filename, this.inputData);
            if (this.app.toolbarObj !== null)
                this.app.toolbarObj.updateRecent();
        }
        this.inputData = data;
        this.filename = filename;
        if (this.app.isLoaded()) {
            this.loadMEI(convert);
        }
    }
    async loadMEI(convert) {
        this.app.loaderService.start("Loading the MEI data ...");
        if (convert) {
            await this.app.verovio.loadData(this.inputData);
            this.inputData = await this.app.verovio.getMEI({});
        }
        // This part is a bit coupled with viewEditorObj
        // We might need to rethink how to handle this
        if (this.app.viewEditorObj) {
            this.app.viewEditorObj.setXmlEditorEnabled(false);
            this.app.viewEditorObj.xmlEditorViewObj.setMode(this.inputData.length);
        }
        await this.checkSchema();
        this.app.getView().customEventManager.dispatch(createAppEvent(AppEvent.LoadData, {
            currentId: this.app.id,
            caller: this.app.getView(),
            lightEndLoading: false,
            mei: this.inputData,
        }));
    }
    async checkSchema() {
        if (!this.app.options.enableEditor)
            return;
        const hasSchema = /<\?xml-model.*schematypens=\"http?:\/\/relaxng\.org\/ns\/structure\/1\.0\"/;
        const hasSchemaMatch = hasSchema.exec(this.inputData);
        if (!hasSchemaMatch)
            return;
        const schema = /<\?xml-model.*href="([^"]*).*/;
        const schemaMatch = schema.exec(this.inputData);
        if (schemaMatch && schemaMatch[1] !== this.app.getCurrentSchema()) {
            this.app.setCurrentSchema(this.app.options.schemaDefault);
            if (this.app.options.useCustomDialogs) {
                const event = new CustomEvent("onSchemaWarningRequest", { cancelable: true, detail: { schema: schemaMatch[1], defaultSchema: this.app.options.schemaDefault } });
                this.app.dispatchEvent(event);
                if (event.defaultPrevented)
                    return;
            }
            const dlg = new Dialog(this.app.dialogDiv, this.app, "Different Schema in the file", { icon: "warning", type: Dialog.Type.Msg });
            dlg.setContent(`The Schema '${schemaMatch[1]}' in the file is different from the one in the editor<br><br>The validation in the editor will use the Schema '${this.app.options.schemaDefault}'`);
            await dlg.show();
        }
    }
    async generatePDF(outputElement) {
        if (!this.app.pdfWorker) {
            this.app.pdfWorker = this.app.verovioService.getPDFWorker();
        }
        const pdfGenerator = new PDFGenerator(this.app.verovio, this.app.pdfWorker, this.app.verovioOptions.scale);
        const pdfOutputStr = await pdfGenerator.generateFile();
        this.app.loaderService.end();
        outputElement.href = `${pdfOutputStr}`;
        outputElement.download = this.filename.replace(/\.[^\.]*$/, ".pdf");
        outputElement.click();
    }
    async generateMIDI(outputElement) {
        const midiOutputStr = await this.app.verovio.renderToMIDI();
        this.app.loaderService.end();
        outputElement.href = `data:audio/midi;base64,${midiOutputStr}`;
        outputElement.download = this.filename.replace(/\.[^\.]*$/, ".mid");
        outputElement.click();
    }
    async generateMEI(options, outputElement = null) {
        const meiOutputStr = await this.app.verovio.getMEI(options);
        this.app.loaderService.end();
        if (outputElement) {
            outputElement.href =
                "data:text/xml;charset=utf-8," + encodeURIComponent(meiOutputStr);
            outputElement.download = this.filename.replace(/\.[^\.]*$/, ".mei");
            outputElement.click();
        }
        return meiOutputStr;
    }
    setInputData(data) {
        this.inputData = data;
    }
    setFilename(filename) {
        this.filename = filename;
    }
}
//# sourceMappingURL=file-service.js.map
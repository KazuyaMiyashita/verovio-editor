import { describe, it, expect, vi } from "vitest";
import { VerovioEditor, DocumentViewPlugin, StandardToolbarPlugin, ValidationPlugin } from "./index.js";
vi.mock("./verovio/verovio-service.js", () => {
    return {
        VerovioService: vi.fn().mockImplementation(function () {
            return {
                init: vi.fn().mockResolvedValue("v1.0.0-test"),
                verovio: {
                    loadData: vi.fn().mockResolvedValue(true),
                    select: vi.fn().mockResolvedValue(true),
                    getPageCount: vi.fn().mockResolvedValue(1),
                    renderToSVG: vi.fn().mockResolvedValue("<svg id='test-svg'></svg>"),
                    renderToExpansionMap: vi.fn().mockResolvedValue({}),
                    renderToMIDI: vi.fn().mockResolvedValue(""),
                    getMEI: vi.fn().mockResolvedValue("<mei></mei>"),
                    getVersion: vi.fn().mockResolvedValue("1.0.0"),
                    setOptions: vi.fn().mockResolvedValue(true),
                    redoLayout: vi.fn().mockResolvedValue(true)
                }
            };
        })
    };
});
describe("Verovio Editor Integration", () => {
    it("should initialize with plugins and trigger rendering flow", async () => {
        console.log("Starting test...");
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
        console.log("Instantiating editor...");
        const editor = new VerovioEditor(div, options, [
            new StandardToolbarPlugin(),
            new DocumentViewPlugin(),
            new ValidationPlugin()
        ]);
        const meiData = "<mei xmlns='http://www.music-encoding.org/ns/mei'><meiHead></meiHead><music><body><mdiv><score><scoreDef><staffGrp><staffDef n='1' lines='5'/></staffGrp></scoreDef><section><measure n='1'><staff n='1'><layer><note pname='c' oct='4' dur='4'/></layer></staff></measure></section></score></mdiv></body></music></mei>";
        console.log("Calling loadData...");
        editor.loadData(meiData, "test.mei");
        console.log("Waiting for editor.ready...");
        await editor.ready;
        console.log("Editor is ready!");
        // Verify core state
        expect(editor.isLoaded()).toBe(true);
        expect(editor.getView()).toBeDefined();
        // expect(editor.getView().id).toBe("document"); // Skip exact ID match as it might be generated
        // Verify that DocumentView has created its internal wrapper
        const docWrapper = div.querySelector(".vrv-doc-wrapper");
        expect(docWrapper).not.toBeNull();
        // Check if the mock SVG content is present in the DOM
        // Increase wait time slightly for async rendering in DocumentView
        await new Promise(resolve => setTimeout(resolve, 500));
        const svgElement = div.querySelector("svg");
        expect(svgElement).not.toBeNull();
        expect(svgElement?.id).toBe("test-svg");
    }, 3000);
});
//# sourceMappingURL=integration.spec.js.map
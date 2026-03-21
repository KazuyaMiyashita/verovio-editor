/**
 * The Worker for XML validation.
 */
importScripts("https://www.verovio.org/javascript/validator/xml-validator-2.10.3.js");
//importScripts("http://localhost:8002/xml-validator-2.10.3.js");
class ValidatorDeferred {
    promise;
    reject;
    resolve;
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
const methods = {
    check: null,
    setSchema: null,
    validate: null,
    setRelaxNGSchema: null,
    validateNG: null,
};
// Global deferred Promise that can be resolved when Module is initialized
const isValidatorModuleReady = new ValidatorDeferred();
Module.onRuntimeInitialized = function () {
    methods.check = Module.cwrap("check", "string", ["string"]);
    methods.setSchema = Module.cwrap("set_schema", "bool", ["string"]);
    methods.validate = Module.cwrap("validate", "string", ["string"]);
    methods.setRelaxNGSchema = Module.cwrap("set_relaxNG_schema", "bool", [
        "string",
    ]);
    methods.validateNG = Module.cwrap("validate_NG", "string", ["string"]);
    isValidatorModuleReady.resolve(null);
};
// Listen to messages send to this worker
addEventListener("message", function (event) {
    // Destruct properties passed to this message event
    const { taskId, method, args } = event.data;
    // postMessage on a `onRuntimeInitialized` method as soon as
    // Module is initialized
    if (method === "onRuntimeInitialized") {
        isValidatorModuleReady.promise.then(() => {
            postMessage({
                taskId,
                method,
                args,
                result: null,
            });
        });
        return;
    }
    // Check if verovio toolkit has passed method
    const fn = methods[method || null];
    let result;
    if (fn) {
        //console.debug( "Calling", method );
        result = fn.apply(null, args || []);
    }
    else {
        console.warn("Unknown call ", method);
    }
    // Always respond to worker calls with postMessage
    postMessage({
        taskId,
        method,
        args,
        result,
    });
}, false);
//# sourceMappingURL=validator-worker.js.map
/**
 * The Worker for XML validation.
 */
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
// Listen to messages send to this worker
addEventListener("message", function (event) {
    if (event.data.validatorUrl) {
        // Define Module before script loads if needed by Emscripten, or let the script define it.
        // Emscripten usually does `var Module = typeof Module !== 'undefined' ? Module : {};`
        // Wait, let's just create it to hook onRuntimeInitialized
        if (typeof self.Module === "undefined") {
            self.Module = {};
        }
        self.Module.onRuntimeInitialized = function () {
            methods.check = self.Module.cwrap("check", "string", [
                "string",
            ]);
            methods.setSchema = self.Module.cwrap("set_schema", "bool", [
                "string",
            ]);
            methods.validate = self.Module.cwrap("validate", "string", [
                "string",
            ]);
            methods.setRelaxNGSchema = self.Module.cwrap("set_relaxNG_schema", "bool", ["string"]);
            methods.validateNG = self.Module.cwrap("validate_NG", "string", ["string"]);
            isValidatorModuleReady.resolve(null);
        };
        importScripts(event.data.validatorUrl);
        return;
    }
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
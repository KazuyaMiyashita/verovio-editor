/**
 * The Deferred class wrapping a Promise
 */

export class Deferred {
    public readonly promise: Promise<string>;
    public reject: Function;
    public resolve: Function

    constructor() {
        this.promise = new Promise((resolve: Function, reject: Function) => {
            this.reject = reject
            this.resolve = resolve
        });
    }
}
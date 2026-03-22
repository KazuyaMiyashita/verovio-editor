import { Deferred } from "../events/deferred.js";

let id: number = 1;
let callList: Map<number, Deferred> = new Map<number, Deferred>();

export class WorkerProxy {
  private worker: Worker;

  constructor(worker: Worker) {
    this.worker = worker;
    // Listen to response of the service worker
    this.worker.addEventListener(
      "message",
      (event) => {
        const { taskId, result } = event.data;
        // Check if there is a Deferred instance in workerTasks
        const task: Deferred | undefined = callList.get(taskId);

        if (task) {
          // If so resolve deferred promise and pass the returned value
          // @ts-ignore
          task.resolve(result);
          // delete it from the list
          callList.delete(taskId);
        }
      },
      false,
    );

    // Return a Proxy so it is possible to catch all property and method or function calls of the worker
    return new Proxy(this, {
      get: (target, method) => {
        return function () {
          const taskId = id++;
          const args = Array.prototype.slice.call(arguments);

          // Post a message to service worker with UUID, method or function name of the worker and passed arguments
          target.worker.postMessage({
            taskId,
            method,
            args,
          });

          // Create a new Deferred instance and store it in workerTasks HashMap
          const deferred = new Deferred();
          callList.set(taskId, deferred);

          // Return the (currently still unresolved) Promise of the Deferred instance
          return deferred.promise;
        };
      },
    });
  }
}

export class PDFWorkerProxy extends WorkerProxy {
  addPage: (svg: string) => Promise<void>;
  end: () => Promise<string>;
  start: (options?: object) => Promise<void>;

  constructor(worker: Worker) {
    super(worker);
  }
}

export class ValidatorWorkerProxy extends WorkerProxy {
  check: (mei: string) => Promise<string>;
  validate: (mei: string) => Promise<string>;
  validateNG: (mei: string) => Promise<string>;
  setRelaxNGSchema: (schema: string) => Promise<boolean>;
  setSchema: (schema: string) => Promise<boolean>;

  onRuntimeInitialized: () => Promise<void>;

  constructor(worker: Worker) {
    super(worker);
  }
}

export class VerovioWorkerProxy extends WorkerProxy {
  edit: (args: object) => Promise<boolean>;
  editInfo: () => Promise<object>;
  getAvailableOptions: () => Promise<object>;
  getDefaultOptions: () => Promise<object>;
  getElementAttr: (id: string) => Promise<object>;
  getElementsAtTime: (time: number) => Promise<object>;
  getLog: () => Promise<string>;
  getOptions: () => Promise<object>;
  getMEI: (options: object) => Promise<string>;
  getPageCount: () => Promise<number>;
  getPageWithElement: (id: string) => Promise<number>;
  loadData: (data: string) => Promise<boolean>;
  redoLayout: (options?: object) => Promise<void>;
  redoPagePitchPosLayout: () => Promise<void>;
  renderToExpansionMap: () => Promise<Record<string, string[]>>;
  renderToMIDI: () => Promise<string>;
  renderToSVG: (page: number) => Promise<string>;
  select: (selection: object) => Promise<boolean>;
  setOptions: (options: object) => Promise<boolean>;
  getVersion: () => Promise<string>;

  onRuntimeInitialized: Function;

  constructor(worker: Worker) {
    super(worker);
  }
}

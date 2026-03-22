declare function importScripts(...urls: string[]): void;

declare var verovio: {
  module: {
    onRuntimeInitialized?: () => void;
  };
  toolkit: {
    new (): any;
  };
  enableLog(level: number): void;
  LOG_DEBUG: number;
};

interface MessageEvent<T = any> extends Event {
  readonly data: T;
}

declare function addEventListener(
  type: string,
  listener: (event: MessageEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void;

declare function postMessage(message: any, options?: any): void;

declare var PDFDocument: any;
declare var blobStream: any;
declare var LeipzigTTF: string;

declare function SVGtoPDF(
  doc: any,
  svg: string,
  x: number,
  y: number,
  options?: object,
): void;

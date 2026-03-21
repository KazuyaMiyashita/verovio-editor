declare namespace Emscripten {
  interface Module {
    onRuntimeInitialized?: () => void;
    cwrap(ident: string, returnType: string | null, argTypes: string[]): Function;
  }
}

declare var Module: Emscripten.Module;

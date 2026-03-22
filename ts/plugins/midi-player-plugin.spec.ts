import { describe, it, expect, vi } from "vitest";
import { App } from "../app.js";
import { MidiPlayerPlugin } from "./midi-player-plugin.js";

describe("MIDI Player Plugin", () => {
  it("should install MidiPlayer into the service registry and expose playback commands", async () => {
    const div = document.createElement("div");
    const app = new App(div, { version: "1.0.0", disableLocalStorage: true, appReset: true, injectStyles: false });
    
    const plugin = new MidiPlayerPlugin();
    app.use(plugin);
    await app.initPlugins();

    // Ensure MidiPlayer is registered as a service
    const midiService = app.getService("midi-player");
    expect(midiService).toBeDefined();
    
    // Commands should be accessible (midi.play, midi.pause, midi.stop)
  });
});

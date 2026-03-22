import { MidiPlayer } from "../midi/midi-player.js";
import { MidiToolbar } from "../toolbars/midi-toolbar.js";
export class MidiPlayerPlugin {
    id = "midi-player";
    app;
    midiPlayer;
    midiToolbarObj;
    install(app) {
        this.app = app;
        app.registerCommand("midi.play", () => this.midiPlayer?.play());
        app.registerCommand("midi.pause", () => this.midiPlayer?.pause());
        app.registerCommand("midi.stop", () => this.midiPlayer?.stop());
        app.registerCommand("midi.playMEI", this.playMEI.bind(this));
    }
    init() {
        if (this.app.options.enableMidiToolbar !== false) {
            // Use internal toolbar for now
            // @ts-ignore
            const toolbarDiv = this.app.toolbar;
            if (toolbarDiv) {
                this.midiToolbarObj = new MidiToolbar(toolbarDiv, this.app);
                this.midiPlayer = new MidiPlayer(this.midiToolbarObj.getDiv(), this.midiToolbarObj, this.app.customEventManager);
                this.app.customEventManager.addToPropagationList(this.midiToolbarObj.customEventManager);
                this.app.registerService("midi-player", this.midiPlayer);
            }
        }
    }
    async playMEI() {
        if (!this.midiPlayer)
            return;
        const expansionMap = await this.app.verovio.renderToExpansionMap();
        this.midiPlayer.setExpansionMap(expansionMap);
        const base64midi = await this.app.verovio.renderToMIDI();
        const midiFile = "data:audio/midi;base64," + base64midi;
        this.midiPlayer.playFile(midiFile);
    }
}
//# sourceMappingURL=midi-player-plugin.js.map
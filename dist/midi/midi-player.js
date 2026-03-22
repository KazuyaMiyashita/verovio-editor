/**
 * The MidiPlayer class interfacing with lower level midi functions.
 */
import { appendMidiPlayerTo } from "../utils/functions.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";
export class MidiPlayer {
    playing;
    pausing;
    currentTime;
    currentTimeStr;
    totalTime;
    totalTimeStr;
    view;
    progressBarTimer;
    expansionMap;
    midiPlayerElement;
    midiUI;
    customEventManager;
    constructor(container, midiUI, customEventManager) {
        this.pausing = false;
        this.playing = false;
        this.midiUI = midiUI || null;
        if (this.midiUI) {
            this.midiUI.setMidiPlayer(this);
        }
        this.customEventManager = customEventManager || null;
        this.midiPlayerElement = appendMidiPlayerTo(container, {});
        this.midiPlayerElement.addEventListener("load", () => this.play());
        this.midiPlayerElement.addEventListener("note", () => this.onUpdateNoteTime(this.midiPlayerElement.currentTime));
        this.midiPlayerElement.addEventListener("stop", (e) => this.onStop(e));
        this.currentTime = 0;
        this.currentTimeStr = "0.00";
        this.totalTime = 0;
        this.totalTimeStr = "0.00";
        this.progressBarTimer = null;
        // A view responding to midiUpdate and midiStop
        this.view = null;
        this.expansionMap = {};
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    isPlaying() {
        return this.playing;
    }
    isPausing() {
        return this.pausing;
    }
    getCurrentTime() {
        return this.currentTime;
    }
    getCurrentTimeStr() {
        return this.currentTimeStr;
    }
    getTotalTime() {
        return this.totalTime;
    }
    getTotalTimeStr() {
        return this.totalTimeStr;
    }
    setView(view) {
        this.view = view;
    }
    setExpansionMap(expansionMap) {
        this.expansionMap = expansionMap || {};
    }
    getExpansionMap() {
        return this.expansionMap;
    }
    ////////////////////////////////////////////////////////////////////////
    // Public method to be called by the user
    ////////////////////////////////////////////////////////////////////////
    playFile(midiFile) {
        this.midiPlayerElement.setAttribute("src", midiFile);
        // play called by html-midi-player callback
    }
    play() {
        this.midiPlayerElement.start();
        // html-midi-player time is in seconds
        this.totalTime = this.midiPlayerElement.duration * 1000;
        this.totalTimeStr = this.samplesToTime(this.totalTime);
        this.currentTime = this.midiPlayerElement.currentTime * 1000;
        this.currentTimeStr = this.samplesToTime(this.currentTime);
        this.startTimer();
        this.pausing = false;
        this.playing = true;
        if (this.customEventManager) {
            this.customEventManager.dispatch(createAppEvent(AppEvent.EditData));
        }
        if (this.midiUI)
            this.midiUI.update(this);
    }
    stop() {
        this.currentTime = 0;
        this.currentTimeStr = "0.00";
        this.totalTime = 0;
        this.totalTimeStr = "0.00";
        this.midiPlayerElement.stop();
        this.stopTimer();
        this.pausing = false;
        this.playing = false;
        if (this.customEventManager) {
            this.customEventManager.dispatch(createAppEvent(AppEvent.EditData));
        }
        if (this.midiUI)
            this.midiUI.update(this);
        if (this.view)
            this.view.midiStop();
    }
    pause() {
        this.midiPlayerElement.stop();
        this.stopTimer();
        this.pausing = true;
        this.playing = false;
        if (this.customEventManager) {
            this.customEventManager.dispatch(createAppEvent(AppEvent.EditData));
        }
        if (this.midiUI)
            this.midiUI.update(this);
        if (this.view)
            this.view.midiStop();
    }
    seekToPercent(percent) {
        if (!this.midiPlayerElement.playing)
            return;
        let seekTime = this.totalTime * percent;
        this.stopTimer();
        this.midiPlayerElement.currentTime = seekTime / 1000;
        // play called by html-midid-player callback
    }
    ////////////////////////////////////////////////////////////////////////
    // Internal methods for updating the UI
    ////////////////////////////////////////////////////////////////////////
    onUpdateNoteTime(time) {
        const midiTime = time * 1000;
        // If the progress bar timer is behind, use the note time
        if (this.currentTime < midiTime) {
            this.currentTime = midiTime;
            this.onUpdate(this.currentTime);
        }
    }
    onUpdate(time) {
        this.currentTime = time;
        this.currentTimeStr = this.samplesToTime(this.currentTime);
        if (this.midiUI)
            this.midiUI.update(this);
        if (this.view)
            this.view.midiUpdate(time);
    }
    startTimer() {
        if (this.progressBarTimer === null) {
            this.progressBarTimer = setInterval(() => {
                if (this.totalTime > 0 && this.currentTime >= this.totalTime) {
                    this.midiPlayerElement.stop();
                    return;
                }
                this.onUpdate(this.currentTime);
                this.currentTime += 50;
            }, 50);
        }
    }
    stopTimer() {
        if (this.progressBarTimer !== null) {
            clearInterval(this.progressBarTimer);
            this.progressBarTimer = null;
        }
    }
    samplesToTime(time) {
        let timeInSec = Math.floor(time / 1000);
        let sec = timeInSec % 60;
        let min = (timeInSec / 60) | 0;
        return min + ":" + (sec === 0 ? "00" : sec < 10 ? "0" + sec : sec);
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onStop(e) {
        // Custom event from the html-midi-player
        const finished = !!(e && e.detail && e.detail.finished);
        this.stopTimer();
        this.pausing = false;
        this.playing = false;
        if (finished) {
            this.currentTime = this.totalTime;
            this.currentTimeStr = this.samplesToTime(this.currentTime);
        }
        if (this.customEventManager) {
            this.customEventManager.dispatch(createAppEvent(AppEvent.EditData));
        }
        if (this.midiUI)
            this.midiUI.update(this);
        if (this.view)
            this.view.midiStop();
    }
}
//# sourceMappingURL=midi-player.js.map
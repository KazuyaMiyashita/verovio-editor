/**
 * The MidiPlayer class interfacing with lower level midi functions.
 */

import { CustomEventManager } from "../events/custom-event-manager.js";
import { ResponsiveView } from "../verovio/responsive-view.js";
import { appendMidiPlayerTo, MidiPlayerElement } from "../utils/functions.js";

import { AppEvent, createAppEvent } from "../events/event-types.js";

export interface MidiUI {
  setMidiPlayer(player: MidiPlayer): void;
  update(player: MidiPlayer): void;
}

export class MidiPlayer {
  private playing: boolean;
  private pausing: boolean;
  private currentTime: number;
  private currentTimeStr: string;
  private totalTime: number;
  private totalTimeStr: string;
  private view: ResponsiveView;
  private progressBarTimer: number | null;
  private expansionMap: Record<string, string[]>;

  private readonly midiPlayerElement: MidiPlayerElement;
  private readonly midiUI: MidiUI | null;
  private readonly customEventManager: CustomEventManager | null;

  constructor(
    container: HTMLElement,
    midiUI?: MidiUI,
    customEventManager?: CustomEventManager,
  ) {
    this.pausing = false;
    this.playing = false;

    this.midiUI = midiUI || null;
    if (this.midiUI) {
      this.midiUI.setMidiPlayer(this);
    }

    this.customEventManager = customEventManager || null;

    this.midiPlayerElement = appendMidiPlayerTo(container, {});
    this.midiPlayerElement.addEventListener("load", () => this.play());
    this.midiPlayerElement.addEventListener("note", () =>
      this.onUpdateNoteTime(this.midiPlayerElement.currentTime),
    );
    this.midiPlayerElement.addEventListener("stop", (e: CustomEvent) =>
      this.onStop(e),
    );

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

  public isPlaying(): boolean {
    return this.playing;
  }

  public isPausing(): boolean {
    return this.pausing;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getCurrentTimeStr(): string {
    return this.currentTimeStr;
  }

  public getTotalTime(): number {
    return this.totalTime;
  }

  public getTotalTimeStr(): string {
    return this.totalTimeStr;
  }

  public setView(view: ResponsiveView): void {
    this.view = view;
  }

  public setExpansionMap(expansionMap: Record<string, string[]>): void {
    this.expansionMap = expansionMap || {};
  }

  public getExpansionMap(): Record<string, string[]> {
    return this.expansionMap;
  }

  ////////////////////////////////////////////////////////////////////////
  // Public method to be called by the user
  ////////////////////////////////////////////////////////////////////////

  public playFile(midiFile: string): void {
    this.midiPlayerElement.setAttribute("src", midiFile);
    // play called by html-midi-player callback
  }

  public play(): void {
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

    if (this.midiUI) this.midiUI.update(this);
  }

  public stop(): void {
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

    if (this.midiUI) this.midiUI.update(this);

    if (this.view) this.view.midiStop();
  }

  public pause(): void {
    this.midiPlayerElement.stop();
    this.stopTimer();

    this.pausing = true;
    this.playing = false;
    if (this.customEventManager) {
      this.customEventManager.dispatch(createAppEvent(AppEvent.EditData));
    }

    if (this.midiUI) this.midiUI.update(this);

    if (this.view) this.view.midiStop();
  }

  public seekToPercent(percent: number): void {
    if (!this.midiPlayerElement.playing) return;

    let seekTime = this.totalTime * percent;
    this.stopTimer();
    this.midiPlayerElement.currentTime = seekTime / 1000;
    // play called by html-midid-player callback
  }

  ////////////////////////////////////////////////////////////////////////
  // Internal methods for updating the UI
  ////////////////////////////////////////////////////////////////////////

  private onUpdateNoteTime(time: number): void {
    const midiTime = time * 1000;
    // If the progress bar timer is behind, use the note time
    if (this.currentTime < midiTime) {
      this.currentTime = midiTime;
      this.onUpdate(this.currentTime);
    }
  }

  private onUpdate(time: number): void {
    this.currentTime = time;
    this.currentTimeStr = this.samplesToTime(this.currentTime);

    if (this.midiUI) this.midiUI.update(this);

    if (this.view) this.view.midiUpdate(time);
  }

  private startTimer(): void {
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

  private stopTimer(): void {
    if (this.progressBarTimer !== null) {
      clearInterval(this.progressBarTimer);
      this.progressBarTimer = null;
    }
  }

  private samplesToTime(time: number): string {
    let timeInSec = Math.floor(time / 1000);
    let sec = timeInSec % 60;
    let min = (timeInSec / 60) | 0;
    return min + ":" + (sec === 0 ? "00" : sec < 10 ? "0" + sec : sec);
  }

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////

  onStop(e: CustomEvent): void {
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

    if (this.midiUI) this.midiUI.update(this);

    if (this.view) this.view.midiStop();
  }
}

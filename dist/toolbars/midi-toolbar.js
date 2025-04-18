/**
 * The MidiToolbar class for controlling the MidiPlayer.
 */
import { Toolbar } from './toolbar.js';
import { appendDivTo } from '../utils/functions.js';
export class MidiToolbar extends Toolbar {
    constructor(div, app) {
        let iconsPlay = `${app.host}/icons/toolbar/play.png`;
        let iconsPause = `${app.host}/icons/toolbar/pause.png`;
        let iconsStop = `${app.host}/icons/toolbar/stop.png`;
        super(div, app);
        this.midiPlayer = null;
        this.active = true;
        this.pageDragStart = 0;
        this.barDragStart = 0;
        // set in the css in .vrv-midi-bar via $midi-bar-width
        this.barWidth = 200;
        // sub-toolbar in application 
        this.midiControls = appendDivTo(this.app.toolbarObj.getMidiPlayerSubToolbar(), { class: `vrv-btn-group` });
        appendDivTo(this.midiControls, { class: `vrv-h-separator` });
        this.play = appendDivTo(this.midiControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${iconsPlay})` } });
        this.pause = appendDivTo(this.midiControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${iconsPause})` } });
        this.stop = appendDivTo(this.midiControls, { class: `vrv-btn-icon-large`, style: { backgroundImage: `url(${iconsStop})` } });
        this.progressControl = appendDivTo(this.midiControls, { class: `vrv-midi-progress` });
        appendDivTo(this.progressControl, { class: `vrv-h-separator` });
        this.midiCurrentTime = appendDivTo(this.progressControl, { class: `vrv-midi-current-time` });
        this.midiBar = appendDivTo(this.progressControl, { class: `vrv-midi-bar` });
        this.midiBarPercent = appendDivTo(this.midiBar, { class: `vrv-midi-bar-percent` });
        this.midiTotalTime = appendDivTo(this.progressControl, { class: `vrv-midi-total-time` });
        // binding
        this.eventManager.bind(this.play, 'click', this.onPlay);
        this.eventManager.bind(this.pause, 'click', this.onPause);
        this.eventManager.bind(this.stop, 'click', this.onStop);
        this.eventManager.bind(this.midiBar, 'mousedown', this.onProgressBarDown);
        this.eventManager.bind(this.midiBar, 'mousemove', this.onProgressBarMove);
        this.eventManager.bind(this.midiBar, 'mouseup', this.onProgressBarUp);
        // hide the pause, stop and progress bar
        this.updateToolbarBtnDisplay(this.pause, false);
        this.updateToolbarBtnDisplay(this.stop, false);
        this.updateToolbarGrp(this.progressControl, false);
    }
    ////////////////////////////////////////////////////////////////////////
    // Getter and setters
    ////////////////////////////////////////////////////////////////////////
    setMidiPlayer(midiPlayer) { this.midiPlayer = midiPlayer; }
    ////////////////////////////////////////////////////////////////////////
    // Class specific methods
    ////////////////////////////////////////////////////////////////////////
    updateProgressBar() {
        this.midiTotalTime.innerHTML = this.midiPlayer.getTotalTimeStr();
        this.midiCurrentTime.innerHTML = this.midiPlayer.getCurrentTimeStr();
        let percent = (this.midiPlayer.getTotalTime()) ? (this.midiPlayer.getCurrentTime() / this.midiPlayer.getTotalTime() * 100) : 0;
        this.midiBarPercent.style.width = `${percent}%`;
    }
    updateDragging(pageX) {
        let posX = this.barDragStart + (pageX - this.pageDragStart);
        if (posX >= 0 && posX <= this.barWidth) {
            let percent = posX / this.barWidth;
            this.midiPlayer.seekToPercent(percent);
        }
    }
    updateAll() {
        this.updateProgressBar();
        this.updateToolbarGrp(this.midiControls, (this.app.getPageCount() > 0));
        this.updateToolbarBtnDisplay(this.play, !this.midiPlayer.isPlaying() || this.midiPlayer.isPausing());
        this.updateToolbarBtnDisplay(this.pause, !this.midiPlayer.isPausing() && this.midiPlayer.isPlaying());
        this.updateToolbarBtnDisplay(this.stop, this.midiPlayer.isPlaying() || this.midiPlayer.isPausing());
        this.updateToolbarGrp(this.progressControl, this.midiPlayer.isPlaying() || this.midiPlayer.isPausing());
    }
    ////////////////////////////////////////////////////////////////////////
    // Public method to be called by the user
    ////////////////////////////////////////////////////////////////////////
    onPlay(e) {
        if (this.midiPlayer.isPausing()) {
            this.midiPlayer.play();
        }
        else {
            this.app.playMEI();
        }
    }
    onPause(e) {
        this.midiPlayer.pause();
    }
    onStop(e) {
        this.midiPlayer.stop();
    }
    onProgressBarDown(e) {
        if (this.midiPlayer.getTotalTime() === 0)
            return;
        this.pageDragStart = e.pageX;
        this.barDragStart = e.offsetX;
        this.updateDragging(e.pageX);
    }
    onProgressBarMove(e) {
        if (this.pageDragStart !== 0) {
            this.midiPlayer.pause();
            this.updateDragging(e.pageX);
        }
    }
    onProgressBarUp(e) {
        if (this.pageDragStart === 0)
            return;
        if (this.midiPlayer.getTotalTime() === 0)
            return;
        this.pageDragStart = 0;
        this.midiPlayer.play();
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("MidiToolbar::onActivate");
        this.updateAll();
        return true;
    }
    onEditData(e) {
        if (!super.onEditData(e))
            return false;
        //console.debug("MidiToolbar::onEditData");
        this.updateAll();
        return true;
    }
    onEndLoading(e) {
        if (!super.onEndLoading(e))
            return false;
        //console.debug("MidiToolbar::onEndLoading");
        this.updateAll();
        return true;
    }
}
//# sourceMappingURL=midi-toolbar.js.map
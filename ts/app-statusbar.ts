/**
 * The AppStatusbar class is the implementation of the application status.
 * Events are attached to the App.eventManager.
 */

import { App } from './app.js';
import { GenericView } from './utils/generic-view.js';

import { appendDivTo } from './utils/functions.js';

export class AppStatusbar extends GenericView {
    active: boolean;
    statustext: HTMLDivElement;
    div: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App) {
        super(div, app);

        this.active = true;

        this.statustext = appendDivTo(this.div, { class: `vrv-status-text` });
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    override onEndLoading(e: CustomEvent): boolean {
        if (!super.onEndLoading(e)) return false;
        //console.debug("AppStatusbar::onEndLoading");

        this.statustext.innerHTML = "Completed";

        return true;
    }

    override onStartLoading(e: CustomEvent): boolean {
        if (!super.onStartLoading(e)) return false;
        //console.debug("AppStatusbar:onStartLoading");

        let msg = (e.detail.light) ? e.detail.msg : "In progress ...";
        this.statustext.innerHTML = msg;

        return true;
    }
}

/**
 * The AppStatusbar class is the implementation of the application status.
 * Events are attached to the App.eventManager.
 */
import { GenericView } from './utils/generic-view.js';
import { appendDivTo } from './utils/functions.js';
export class AppStatusbar extends GenericView {
    constructor(div, app) {
        super(div, app);
        this.active = true;
        this.statusText = appendDivTo(this.div, { class: `vrv-status-text` });
        this.versionText = appendDivTo(this.div, { class: `vrv-status-version` });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    setVerovioVersion(version) {
        this.versionText.textContent = version ? `Verovio ${version}` : "";
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onEndLoading(e) {
        if (!super.onEndLoading(e))
            return false;
        //console.debug("AppStatusbar::onEndLoading");
        this.statusText.textContent = "Completed";
        return true;
    }
    onStartLoading(e) {
        if (!super.onStartLoading(e))
            return false;
        //console.debug("AppStatusbar:onStartLoading");
        let msg = (e.detail.light) ? e.detail.msg : "In progress ...";
        this.statusText.textContent = msg;
        return true;
    }
}
//# sourceMappingURL=app-statusbar.js.map
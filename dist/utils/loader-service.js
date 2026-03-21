import { AppEvent, createAppEvent } from "../events/event-types.js";
/**
 * LoaderService for managing the loading overlay and status.
 */
export class LoaderService {
    loader;
    loaderText;
    views;
    customEventManager;
    loadingCount;
    constructor(loader, loaderText, views, customEventManager) {
        this.loader = loader;
        this.loaderText = loaderText;
        this.views = views;
        this.customEventManager = customEventManager;
        this.loadingCount = 0;
    }
    start(msg, light = false) {
        if (light) {
            this.views.style.pointerEvents = "none";
        }
        else {
            this.views.style.overflow = "hidden";
            this.loader.style.display = `flex`;
            this.loadingCount++;
        }
        this.loaderText.textContent = msg;
        this.customEventManager.dispatch(createAppEvent(AppEvent.StartLoading, {
            light: light,
            msg: msg,
        }));
    }
    end(light = false) {
        if (!light) {
            this.loadingCount--;
            if (this.loadingCount < 0) {
                console.error("endLoading index corrupted");
                this.loadingCount = 0;
            }
        }
        // We have other tasks being performed
        if (this.loadingCount > 0)
            return;
        this.views.style.overflow = "scroll";
        this.loader.style.display = "none";
        this.views.style.pointerEvents = "";
        this.views.style.opacity = "";
        this.customEventManager.dispatch(createAppEvent(AppEvent.EndLoading));
    }
    getCount() {
        return this.loadingCount;
    }
}
//# sourceMappingURL=loader-service.js.map
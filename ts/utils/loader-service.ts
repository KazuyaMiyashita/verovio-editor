import { AppEvent, createAppEvent } from "../events/event-types.js";
import { CustomEventManager } from "../events/custom-event-manager.js";

/**
 * LoaderService for managing the loading overlay and status.
 */
export class LoaderService {
  private readonly loader: HTMLDivElement;
  private readonly loaderText: HTMLDivElement;
  private readonly views: HTMLDivElement;
  private readonly customEventManager: CustomEventManager;
  private loadingCount: number;

  constructor(
    loader: HTMLDivElement,
    loaderText: HTMLDivElement,
    views: HTMLDivElement,
    customEventManager: CustomEventManager,
  ) {
    this.loader = loader;
    this.loaderText = loaderText;
    this.views = views;
    this.customEventManager = customEventManager;
    this.loadingCount = 0;
  }

  public start(msg: string, light: boolean = false): void {
    console.debug(`[LoaderService] start: ${msg} (light=${light}), count=${this.loadingCount}`);
    if (light) {
      this.views.style.pointerEvents = "none";
    } else {
      this.views.style.overflow = "hidden";
      this.loader.style.display = `flex`;
      this.loadingCount++;
    }
    this.loaderText.textContent = msg;
    this.customEventManager.dispatch(
      createAppEvent(AppEvent.StartLoading, {
        light: light,
        msg: msg,
      }),
    );
  }

  public end(light: boolean = false): void {
    console.debug(`[LoaderService] end: (light=${light}), count=${this.loadingCount}`);
    if (!light) {
      this.loadingCount--;
      if (this.loadingCount < 0) {
        console.error("endLoading index corrupted");
        this.loadingCount = 0;
      }
    }

    // We have other tasks being performed
    if (this.loadingCount > 0) return;

    this.views.style.overflow = "scroll";
    this.loader.style.display = "none";
    this.views.style.pointerEvents = "";
    this.views.style.opacity = "";
    this.customEventManager.dispatch(createAppEvent(AppEvent.EndLoading));
  }

  public getCount(): number {
    return this.loadingCount;
  }
}

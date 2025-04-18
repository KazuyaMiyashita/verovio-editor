/**
 * The GenericView class is the based class for other view implementation.
 * It essentially provide a CustomEventManager and can be activate or deactivated.
 * It should not be instantiated directly but only through inherited classes.
 */

import { App } from '../app.js';
import { CustomEventManager } from '../events/custom-event-manager.js';
import { randomHex } from '../utils/functions.js';

export class GenericView {
    public readonly customEventManager: CustomEventManager;

    protected readonly app: App;
    protected readonly div: HTMLDivElement;
    protected readonly id: string;

    protected active: boolean;
    private display: string;

    constructor(div: HTMLDivElement, app: App) {
        // Root element in which verovio-ui is created
        this.div = div;

        // App object
        this.app = app;

        // Generate an id for the CustomEventManager
        this.id = randomHex(16);

        this.active = false;

        this.display = 'block';

        this.customEventManager = new CustomEventManager();
        this.customEventManager.bind(this, 'onActivate', this.onActivate);
        this.customEventManager.bind(this, 'onCursorActivity', this.onCursorActivity);
        this.customEventManager.bind(this, 'onDeactivate', this.onDeactivate);
        this.customEventManager.bind(this, 'onEditData', this.onEditData);
        this.customEventManager.bind(this, 'onEndLoading', this.onEndLoading);
        this.customEventManager.bind(this, 'onLoadData', this.onLoadData);
        this.customEventManager.bind(this, 'onPage', this.onPage);
        this.customEventManager.bind(this, 'onResized', this.onResized);
        this.customEventManager.bind(this, 'onSelect', this.onSelect);
        this.customEventManager.bind(this, 'onStartLoading', this.onStartLoading);
        this.customEventManager.bind(this, 'onZoom', this.onZoom);
    }

    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    public getDiv(): HTMLDivElement { return this.div; }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    protected destroy(): void {
        // Nothing at this level
    }

    protected setDisplayFlex(): void { this.display = 'flex';  }

    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////

    onActivate(e: CustomEvent): boolean {
        //console.debug("GenericView::onActivate");
        this.div.style.display = this.display;
        this.active = true;
        return true;
    }

    onCursorActivity(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onCursorActivity");
        return true;
    }

    onDeactivate(e: CustomEvent): boolean {
        //console.debug("GenericView::onDeactivate");
        this.div.style.display = 'none';
        this.active = false;
        return true;
    }

    onEditData(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onEditData");
        return true;
    }

    onEndLoading(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onEndLoading");
        return true;
    }

    onLoadData(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onLoadData");
        return true;
    }

    onPage(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onPage");
        return true;
    }

    onResized(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onResized");
        return true;
    }

    onSelect(e: CustomEvent): boolean {
        if (!this.active) return false;
        if (this === e.detail.caller) return false;
        //console.debug("GenericView::onSelect");
        return true;
    }

    onStartLoading(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onStartLoading");
        return true;
    }

    onZoom(e: CustomEvent): boolean {
        if (!this.active) return false;
        //console.debug("GenericView::onZoom");
        return true;
    }
}

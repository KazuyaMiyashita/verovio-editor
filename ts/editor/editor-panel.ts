/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from "../app.js";
import { Dialog } from "../dialogs/dialog.js";
import { EditorContentPanel } from "./editor-content-panel.js";
import { EditorScorePanel } from "./editor-score-panel.js";
import { EditorToolbar } from "../toolbars/editor-toolbar.js";
import { EditorView } from "./editor-view.js";
import { EventManager } from "../events/event-manager.js";
import { GenericView } from "../utils/generic-view.js";
import { Keyboard } from "../midi/keyboard.js";
import { RNGLoader } from "../xml/rng-loader.js";
import { TabGroup } from "../utils/tab-group.js";
import {
  ValidatorWorkerProxy,
  VerovioWorkerProxy,
} from "../utils/worker-proxy.js";
import { XMLEditorView } from "../xml/xml-editor-view.js";
import { appendDivTo } from "../utils/functions.js";
import { autoModeOff, editedXML } from "../utils/messages.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";

export class EditorPanel extends GenericView {
  public readonly eventManager: EventManager;
  public readonly xmlEditorViewObj: XMLEditorView;
  public readonly editorViewObj: EditorView;

  private draggingSplitter: boolean;
  private draggingX: number;
  private draggingY: number;
  private splitterX: number;
  private splitterY: number;
  private splitterSize: number;
  private resizeTimer: number;

  private readonly toolbar: HTMLDivElement;
  private readonly toolbarObj: EditorToolbar;

  private readonly hSplit: HTMLDivElement;

  private readonly toolPanel: HTMLDivElement;

  private readonly tabGroup: HTMLDivElement;
  private readonly tabGroupObj: TabGroup;

  private readonly vSplit: HTMLDivElement;

  private readonly keyboard;
  HTMLDivElement;
  private readonly keyboardObj: Keyboard;

  private readonly split: HTMLDivElement;

  private readonly scorePanel: HTMLDivElement;
  scorePanelObj: EditorScorePanel;

  private readonly contentPanel: HTMLDivElement;
  private readonly contentPanelObj: EditorContentPanel;

  private readonly editorView: HTMLDivElement;

  private readonly splitter: HTMLDivElement;

  private xmlEditorEnabled: boolean;
  private readonly xmlEditorView: HTMLDivElement;

  private readonly verovio: VerovioWorkerProxy;
  private readonly validator: ValidatorWorkerProxy;
  private readonly rngLoader: RNGLoader;

  private readonly boundMouseMove: { (event: MouseEvent): void };
  private readonly boundMouseUp: { (event: MouseEvent): void };

  constructor(
    div: HTMLDivElement,
    app: App,
    verovio: VerovioWorkerProxy,
    validator: ValidatorWorkerProxy,
    rngLoader: RNGLoader,
  ) {
    super(div, app);

    this.verovio = verovio;
    this.validator = validator;
    this.rngLoader = rngLoader;

    this.eventManager = new EventManager(this);

    this.toolbar = appendDivTo(this.div, { class: `vrv-editor-toolbar` });
    this.toolbarObj = new EditorToolbar(this.toolbar, this.app, this);
    this.customEventManager.addToPropagationList(
      this.toolbarObj.customEventManager,
    );

    this.hSplit = appendDivTo(this.div, { class: `vrv-h-split` });
    this.toolPanel = appendDivTo(this.hSplit, {
      class: `vrv-editor-tool-panel`,
    });

    this.vSplit = appendDivTo(this.hSplit, { class: `vrv-v-split` });
    this.split = appendDivTo(this.vSplit, { class: `vrv-split` });

    this.keyboard = appendDivTo(this.vSplit, { class: `vrv-keyboard-panel` });
    this.keyboardObj = new Keyboard(this.keyboard, this.app);

    let orientation = this.app.options.editorSplitterHorizontal
      ? "vertical"
      : "horizontal";
    this.split.classList.add(orientation);

    this.editorView = appendDivTo(this.split, { class: `vrv-view`, style: `` });
    this.editorViewObj = new EditorView(
      this.editorView,
      this.app,
      this.verovio,
    );
    this.customEventManager.addToPropagationList(
      this.editorViewObj.customEventManager,
    );
    this.toolbarObj.bindEvents(this.editorViewObj.actionManager);

    this.tabGroup = appendDivTo(this.toolPanel, { class: `vrv-tab-group` });
    this.tabGroupObj = new TabGroup(this.tabGroup, this.app);
    //this.customEventManager.addToPropagationList(this.tabGroupObj.customEventManager);

    let tabScoreObj = this.tabGroupObj.addTab("Score");

    this.scorePanel = appendDivTo(tabScoreObj.getDiv(), {
      class: `vrv-tab-content-panel`,
    });
    this.scorePanelObj = new EditorScorePanel(
      this.scorePanel,
      this.app,
      tabScoreObj,
    );
    tabScoreObj.customEventManager.addToPropagationList(
      this.scorePanelObj.customEventManager,
    );

    let tabContentObj = this.tabGroupObj.addTab("Content");

    this.tabGroupObj.select(tabContentObj.id);

    this.contentPanel = appendDivTo(tabContentObj.getDiv(), {
      class: `vrv-tab-content-panel`,
    });
    this.contentPanelObj = new EditorContentPanel(
      this.contentPanel,
      this.app,
      tabContentObj,
      this.editorViewObj.actionManager,
    );
    tabContentObj.customEventManager.addToPropagationList(
      this.contentPanelObj.customEventManager,
    );

    this.splitter = appendDivTo(this.split, { class: `` });
    this.eventManager.bind(this.splitter, "mousedown", this.onDragInit);
    this.boundMouseMove = (e: MouseEvent) => this.onDragMove(e);
    this.boundMouseUp = (e: MouseEvent) => this.onDragUp(e);

    this.draggingSplitter = false;
    this.draggingX = 0; // Stores x & y coordinates of the mouse pointer
    this.draggingY = 0;
    this.splitterX = 0; // Stores top, left values (edge) of the element
    this.splitterY = 0;

    this.xmlEditorEnabled = false;
    this.xmlEditorView = appendDivTo(this.split, { class: `vrv-xml` });
    this.xmlEditorViewObj = new XMLEditorView(
      this.xmlEditorView,
      this.app,
      this.validator,
      this.rngLoader,
    );
    //this.customEventManager.addToPropagationList(this.xmlEditorViewObj.customEventManager);

    this.splitterSize = 60;
    this.resizeTimer;
  }

  ////////////////////////////////////////////////////////////////////////
  // Getters and setters
  ////////////////////////////////////////////////////////////////////////

  public setXmlEditorEnabled(xmlEditorEnabled: boolean): void {
    this.xmlEditorEnabled = xmlEditorEnabled;
  }
  public isXmlEditorEnabled(): boolean {
    return this.xmlEditorEnabled;
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

  private updateSplitterSize(): void {
    if (this.app.options.editorSplitterHorizontal) {
      const height = this.split.clientHeight;
      const editorHeight = this.editorView.clientHeight;
      this.splitterSize = Math.round((editorHeight * 100) / height);
    } else {
      const width = this.split.clientWidth;
      const editorWidth = this.editorView.clientWidth;
      this.splitterSize = Math.round((editorWidth * 100) / width);
    }
  }

  private updateSize(): boolean {
    this.div.style.height = this.div.parentElement.style.height;
    this.div.style.width = this.div.parentElement.style.width;

    this.toolPanel.style.display = "none";
    this.keyboard.style.display = "none";
    if (this.app.options.devFeatures) {
      this.toolPanel.style.display = this.xmlEditorEnabled ? "none" : "block";
      this.keyboard.style.display = this.xmlEditorEnabled ? "none" : "flex";
    }

    // Force the toolbar to be displayed when re-activate because the it does not have received the event yet
    this.toolbar.style.display = "block";

    let height =
      this.div.clientHeight -
      this.toolbar.offsetHeight -
      this.keyboard.offsetHeight;
    let width = this.div.clientWidth - this.toolPanel.offsetWidth;

    this.split.style.height = `${height}px`;
    this.split.style.width = `${width}px`;
    this.keyboard.style.width = `${width}px`;

    this.xmlEditorView.style.display = "block";
    this.splitter.style.display = "block";

    if (!this.xmlEditorEnabled) {
      // Ideally we would send a onActive / onDeactivate event
      this.xmlEditorViewObj.customEventManager.dispatch(
        createAppEvent(AppEvent.Deactivate),
      );
      this.tabGroupObj.customEventManager.dispatch(
        createAppEvent(AppEvent.Activate),
      );

      this.xmlEditorView.style.display = "none";
      this.xmlEditorView.style.height = `0px`;
      this.xmlEditorView.style.width = `0px`;
      this.splitter.style.display = "none";
      this.editorView.style.height = `${height}px`;
      this.editorView.style.width = `${width}px`;

      let tabHeight = this.div.clientHeight - this.toolbar.offsetHeight;
      // 78 = toolPanel padding (8 * 2) + selectors height (40) + tab padding (10 * 2)
      this.tabGroupObj.setHeight(tabHeight - 78);
    } else {
      if (this.app.options.editorSplitterHorizontal) {
        let editorHeight = Math.floor((height * this.splitterSize) / 100);
        // 10 is the bottom border of the editor view
        let xmlHeight = Math.ceil(
          (height * (100 - this.splitterSize)) / 100 - 10,
        );

        this.editorView.style.height = `${editorHeight}px`;
        this.editorView.style.width = `${width}px`;

        this.xmlEditorView.style.height = `${xmlHeight}px`;
        this.xmlEditorView.style.width = `${width}px`;
      } else {
        let editorWidth = Math.floor((width * this.splitterSize) / 100);
        // 10 is the bottom border of the editor view
        let xmlWidth = Math.ceil(
          (width * (100 - this.splitterSize)) / 100 - 10,
        );

        this.editorView.style.height = `${height}px`;
        this.editorView.style.width = `${editorWidth}px`;

        this.xmlEditorView.style.height = `${height}px`;
        this.xmlEditorView.style.width = `${xmlWidth}px`;
      }
    }

    this.div.style.height = this.div.parentElement.style.height;
    this.div.style.width = this.div.parentElement.style.width;

    return true;
  }

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////

  override onActivate(e: CustomEvent): boolean {
    if (!super.onActivate(e)) return false;
    //console.debug("EditorPanel::onActivate");

    if (e?.detail && e.detail.loadData) {
      this.updateSize();
    }

    if (this.xmlEditorEnabled) {
      this.tabGroupObj.customEventManager.dispatch(
        createAppEvent(AppEvent.Deactivate),
      );
      this.xmlEditorViewObj.customEventManager.dispatch(
        createAppEvent(AppEvent.Activate),
      );
    } else {
      this.xmlEditorViewObj.customEventManager.dispatch(
        createAppEvent(AppEvent.Deactivate),
      );
      this.tabGroupObj.customEventManager.dispatch(
        createAppEvent(AppEvent.Activate),
      );
    }
  }

  override onDeactivate(e: CustomEvent): boolean {
    if (!super.onDeactivate(e)) return false;
    //console.debug("EditorPanel::onDeactivate");
    this.propagateEvent(e);
  }

  override onSelect(e: CustomEvent): boolean {
    if (!super.onSelect(e)) return false;
    //console.debug("EditorPanel::onSelect");
    this.propagateEvent(e);
  }

  override onStartLoading(e: CustomEvent): boolean {
    if (!super.onStartLoading(e)) return false;
    //console.debug("EditorPanel::onStartLoading");
    this.propagateEvent(e);
  }

  override onEditData(e: CustomEvent): boolean {
    if (!super.onEditData(e)) return false;
    //console.debug("EditorPanel::onEditData");
    this.propagateEvent(e);
  }

  override onEndLoading(e: CustomEvent): boolean {
    if (!super.onEndLoading(e)) return false;
    //console.debug("EditorPanel::onEndLoading");
    this.propagateEvent(e);
  }

  override onResized(e: CustomEvent): boolean {
    if (!super.onResized(e)) return false;
    //console.debug("EditorPanel::onResized");
    this.updateSize();
    this.propagateEvent(e);
  }

  override onLoadData(e: CustomEvent): boolean {
    if (!super.onLoadData(e)) return false;
    //console.debug("EditorPanel::onLoadData");
    this.propagateEvent(e);
    this.updateSize();
  }

  private propagateEvent(e: CustomEvent): void {
    if (this.xmlEditorEnabled) {
      this.xmlEditorViewObj.customEventManager.dispatch(e);
    } else {
      this.tabGroupObj.customEventManager.dispatch(e);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // Event methods
  //////////////////////////////////////////////////////////////////////////

  onDragInit(e: MouseEvent): void {
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);
    this.draggingX = e.clientX;
    this.draggingY = e.clientY;

    // Store the object of the element which needs to be moved
    this.draggingSplitter = true;
    this.splitterY = e.clientY;
    this.splitterX = e.clientX;
  }

  onDragMove(e: MouseEvent): void {
    if (this.draggingSplitter === true) {
      if (this.app.options.editorSplitterHorizontal) {
        const diffY = this.draggingY - e.clientY;
        const editorHeight = this.editorView.clientHeight;
        const xmlHeight = this.xmlEditorView.clientHeight;
        this.editorView.style.height = `${editorHeight - diffY}px`;
        this.xmlEditorView.style.height = `${xmlHeight + diffY}px`;
        this.draggingY = e.clientY;
      } else {
        const diffX = this.draggingX - e.clientX;
        const editorWidth = this.editorView.clientWidth;
        const xmlWidth = this.xmlEditorView.clientWidth;
        this.editorView.style.width = `${editorWidth - diffX}px`;
        this.xmlEditorView.style.width = `${xmlWidth + diffX}px`;
        this.draggingX = e.clientX;
      }
      // We can already update the xmlView size
      this.xmlEditorViewObj.customEventManager.dispatch(
        createAppEvent(AppEvent.Resized),
      );

      // To update Verovio
      //this.app.startLoading( "Adjusting size ...", true );
      //this.updateSplitterSize();
      //let event = new CustomEvent( 'onResized' );
      //this.editorView.customEventManager.dispatch( event );
    }
  }

  onDragUp(e: MouseEvent): void {
    this.draggingSplitter = false;
    // Remove listeners
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
    // Update the splitter position and resize all
    this.app.loaderService.start("Adjusting size ...", true);
    this.updateSplitterSize();
    this.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
  }

  onToggleOrientation(e: Event): void {
    this.app.options.editorSplitterHorizontal =
      !this.app.options.editorSplitterHorizontal;
    this.split.classList.toggle("vertical");
    this.split.classList.toggle("horizontal");
    this.app.loaderService.start("Adjusting size ...", true);
    this.app.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
  }

  ////////////////////////////////////////////////////////////////////////
  // Async event methods
  ////////////////////////////////////////////////////////////////////////

  async onToggle(e: Event): Promise<any> {
    if (!this.xmlEditorEnabled) {
      this.xmlEditorEnabled = true;
      if (
        this.xmlEditorViewObj.isAutoModeNotification() &&
        !this.xmlEditorViewObj.isAutoMode()
      ) {
        const dlg = new Dialog(
          this.app.dialogDiv,
          this.app,
          "Live validation off",
          { icon: "warning", type: Dialog.Type.Msg },
        );
        dlg.setContent(marked.parse(autoModeOff));
        await dlg.show();
        // Do not show it again for that file.
        this.xmlEditorViewObj.setAutoModeNotification(false);
      }
    } else {
      if (this.xmlEditorViewObj.isEdited()) {
        const dlg = new Dialog(
          this.app.dialogDiv,
          this.app,
          "Un-synchronized changes",
          { okLabel: "Yes", icon: "question" },
        );
        dlg.setContent(marked.parse(editedXML));
        if ((await dlg.show()) === 0) return;
        this.xmlEditorViewObj.setEdited(false);
      }
      this.xmlEditorEnabled = false;
    }
    this.app.loaderService.start("Adjusting the interface ...", true);
    this.customEventManager.dispatch(createAppEvent(AppEvent.Activate));
    // We enabled the XML editor, update its data
    if (this.xmlEditorEnabled) {
      this.tabGroupObj.resetTabs();
      const mei = await this.verovio.getMEI({});
      this.app.customEventManager.dispatch(
        createAppEvent(AppEvent.LoadData, {
          caller: this.editorView,
          mei: mei,
        }),
      );
    }
    this.customEventManager.dispatch(createAppEvent(AppEvent.Resized));
  }

  onForceReload(e: Event): void {
    if (this.xmlEditorViewObj && this.xmlEditorViewObj.isEdited()) {
      this.customEventManager.dispatch(
        createAppEvent(AppEvent.LoadData, {
          caller: this.xmlEditorViewObj,
          mei: this.xmlEditorViewObj.getValue(),
        }),
      );
    }
  }
}

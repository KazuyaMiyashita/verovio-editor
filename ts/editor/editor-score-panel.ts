/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */

import { App } from "../app.js";
import { EditorScoreTree } from "./editor-score-tree.js";
import { GenericView } from "../utils/generic-view.js";
import { GenericTree } from "../utils/generic-tree.js";
import { Tab } from "../utils/tab-group.js";
import { appendDivTo } from "../utils/functions.js";

export class EditorScorePanel extends GenericView {
  private readonly sectionTree: HTMLDivElement;
  private readonly sectionTreeObj: EditorScoreTree;
  private readonly tab: Tab;

  constructor(div: HTMLDivElement, app: App, tab: Tab) {
    super(div, app);

    this.setDisplayFlex();

    this.tab = tab;

    let treeFieldSet = this.addFieldSet("Score structure", 3);
    this.sectionTree = appendDivTo(treeFieldSet, {
      class: `vrv-field-set-panel`,
    });
    this.sectionTreeObj = new EditorScoreTree(
      this.sectionTree,
      this.app,
      this.tab,
    );
    this.sectionTreeObj.setBreadCrumbs();
    this.customEventManager.addToPropagationList(
      this.sectionTreeObj.customEventManager,
    );
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////
  // Async worker methods
  ////////////////////////////////////////////////////////////////////////

  private async updateContent(): Promise<any> {
    this.sectionTreeObj.resetFocus();
    const contextOk = await this.app.verovio.edit({
      action: "context",
      param: { document: "scores" },
    });
    if (contextOk) {
      const jsonContext =
        (await this.app.verovio.editInfo()) as GenericTree.Object;
      this.sectionTreeObj.loadContext(jsonContext);
    }
    this.tab.loaded = true;
  }

  ////////////////////////////////////////////////////////////////////////
  // Custom event methods
  ////////////////////////////////////////////////////////////////////////

  override onActivate(e: CustomEvent): boolean {
    if (!super.onActivate(e)) return false;
    // Make sure the data is loaded into Verovio
    if (this.app.getPageCount() > 0 && !this.tab.loaded) this.updateContent();
    return true;
  }

  override onEndLoading(e: CustomEvent): boolean {
    if (!super.onEndLoading(e)) return false;
    // Make sure the data is loaded into Verovio
    if (this.app.getPageCount() > 0 && !this.tab.loaded) this.updateContent();
    return true;
  }

  ////////////////////////////////////////////////////////////////////////
  // Event methods
  ////////////////////////////////////////////////////////////////////////
}

import { EventManager } from "./event-manager.js";
import { AppEvent, createAppEvent } from "./event-types.js";
export class ActionManager {
    eventManager;
    app;
    inProgress;
    editorViewObj;
    canUndoCache;
    canRedoCache;
    constructor(view, app) {
        this.app = app;
        this.editorViewObj = view;
        this.eventManager = new EventManager(this);
        this.inProgress = false;
        this.canUndoCache = false;
        this.canRedoCache = false;
    }
    ////////////////////////////////////////////////////////////////////////
    // Getter methods
    ////////////////////////////////////////////////////////////////////////
    canUndo() {
        return this.canUndoCache;
    }
    canRedo() {
        return this.canRedoCache;
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async commit(caller) {
        const editorAction = { action: "commit" };
        await this.editorViewObj.verovio.edit(editorAction);
        const info = (await this.editorViewObj.verovio.editInfo());
        this.canUndoCache = info.canUndo;
        this.canRedoCache = info.canRedo;
        await this.editorViewObj.renderPage(true);
        this.inProgress = false;
        let id = "";
        if (this.editorViewObj.hasSelection()) {
            id = this.editorViewObj.getSelection()[0].id;
        }
        this.app.customEventManager.dispatch(createAppEvent(AppEvent.EditData, {
            id: id,
            caller: caller,
        }));
    }
    async editRefresh() {
        await this.editorViewObj.verovio.redoPagePitchPosLayout();
        await this.editorViewObj.renderPage(true, false);
    }
    /*
      public async delete(): Promise<void> {
          let chain = new Array();
          for (const item of this.editorViewObj.getSelection()) {
              if (!["note"].includes(item.element)) continue;
              chain.push({
                  action: 'delete',
                  param: {
                      elementId: item.id
                  }
              });
          }
  
          if (chain.length === 0) return;
  
          chain.push({ action: 'commit' });
  
          const editorAction = {
              action: 'chain',
              param: chain
          }
  
          await this.editorViewObj.verovio.edit(editorAction);
          await this.editorViewObj.verovio.redoLayout();
          await this.editorViewObj.renderPage(true);
          //this.editorViewObj.updateMEI();
      }
      */
    async drag(x, y) {
        let chain = new Array();
        for (const item of this.editorViewObj.getSelection()) {
            if (!["note"].includes(item.element))
                continue;
            const editorAction = {
                action: "drag",
                param: {
                    elementId: item.id,
                    x: item.x + x,
                    y: item.y + y,
                },
            };
            chain.push(editorAction);
        }
        if (chain.length === 0)
            return;
        const editorAction = {
            action: "chain",
            param: chain,
        };
        await this.editorViewObj.verovio.edit(editorAction);
        await this.editRefresh();
    }
    async keyDown(key, shiftKey, ctrlKey) {
        let chain = new Array();
        for (const item of this.editorViewObj.getSelection()) {
            if (!["note"].includes(item.element))
                continue;
            const editorAction = {
                action: "keyDown",
                param: {
                    elementId: item.id,
                    key: key,
                    shiftKey: shiftKey,
                    ctrlKey: ctrlKey,
                },
            };
            chain.push(editorAction);
        }
        // actually nothing to do
        if (chain.length === 0)
            return;
        if (this.inProgress) {
            await this.editRefresh();
        }
        this.inProgress = true;
        const editorAction = {
            action: "chain",
            param: chain,
        };
        await this.editorViewObj.verovio.edit(editorAction);
    }
    async keyUp(key, shiftKey, ctrlKey) {
        // actually nothing to do
        if (!this.inProgress)
            return;
        this.commit(this.editorViewObj);
    }
    ////////////////////////////////////////////////////////////////////////
    // Element specific methods
    ////////////////////////////////////////////////////////////////////////
    async insert(elementName, insertMode) {
        if (!this.editorViewObj.hasSelection())
            return;
        let chain = new Array();
        chain.push({
            action: "insert",
            param: {
                elementName: elementName,
                elementId: this.editorViewObj.getSelection()[0].id,
                insertMode: insertMode,
            },
        });
        console.log(chain);
        /*
            chain.push({
                action: 'drag',
                param: {
                    elementId: "[chained-id]",
                    x: x,
                    y: y
                }
            });
            */
        //chain.push({ action: 'commit' });
        //console.debug( chain );
        const editorAction = {
            action: "chain",
            param: chain,
        };
        await this.editorViewObj.verovio.edit(editorAction);
        await this.commit(this.editorViewObj);
    }
    /*
      async insertNote(x: number, y: number): Promise<void> {
          if (!this.cursorPointer.inputMode) return;
  
          let chain = new Array();
  
          chain.push({
              action: 'insert',
              param: {
                  elementType: "note",
                  startid: this.cursorPointer.elementId
              }
          });
  
          chain.push({
              action: 'drag',
              param: {
                  elementId: "[chained-id]",
                  x: x,
                  y: y
              }
          });
  
          chain.push({ action: 'commit' });
  
          //console.debug( chain );
  
          const editorAction = {
              action: 'chain',
              param: chain
          }
          await this.view.verovio.edit(editorAction);
          await this.view.verovio.redoLayout();
          await this.view.renderPage(true);
          this.view.updateMEI();
      }
      */
    async formCres() {
        await this.setAttrValueForTypes("form", "cres", ["hairpin"]);
    }
    async formDim() {
        await this.setAttrValueForTypes("form", "dim", ["hairpin"]);
    }
    async placeAbove() {
        await this.setAttrValueForTypes("place", "above", [
            "dir",
            "dynam",
            "hairpin",
            "tempo",
            "pedal",
        ]);
    }
    async placeBelow() {
        await this.setAttrValueForTypes("place", "below", [
            "dir",
            "dynam",
            "hairpin",
            "tempo",
            "pedal",
        ]);
    }
    async placeAuto() {
        await this.setAttrValueForTypes("place", "", [
            "dir",
            "dynam",
            "hairpin",
            "tempo",
            "pedal",
        ]);
    }
    async stemDirUp() {
        await this.setAttrValueForTypes("stem.dir", "up", ["note", "chord"]);
    }
    async stemDirDown() {
        await this.setAttrValueForTypes("stem.dir", "down", ["note", "chord"]);
    }
    async stemDirAuto() {
        await this.setAttrValueForTypes("stem.dir", "", ["note", "chord"]);
    }
    async undo() {
        this.app.startLoading("Undoing ...", true);
        const editorAction = { action: "undo" };
        await this.editorViewObj.verovio.edit(editorAction);
        const info = (await this.editorViewObj.verovio.editInfo());
        this.canUndoCache = info.canUndo;
        this.canRedoCache = info.canRedo;
        await this.editorViewObj.renderPage(true);
    }
    async redo() {
        this.app.startLoading("Redoing ...", true);
        const editorAction = { action: "redo" };
        await this.editorViewObj.verovio.edit(editorAction);
        const info = (await this.editorViewObj.verovio.editInfo());
        this.canUndoCache = info.canUndo;
        this.canRedoCache = info.canRedo;
        await this.editorViewObj.renderPage(true);
    }
    // helper
    async setAttrValue(attribute, value, id) {
        const editorAction = {
            action: "set",
            param: {
                elementId: id,
                attribute: attribute,
                value: value,
            },
        };
        await this.editorViewObj.verovio.edit(editorAction);
    }
    async setAttrValueForTypes(attribute, value, elementTypes = []) {
        /*
            let chain = new Array();
            for (const item of this.editorViewObj.getSelection()) {
                if (elementTypes.length > 0 && !elementTypes.includes(item.element)) continue;
                const editorAction = {
                    action: 'set',
                    param: {
                        elementId: item.id,
                        attribute: attribute,
                        value: value
                    }
                };
                chain.push(editorAction);
            }
    
            if (chain.length === 0) return;
    
            chain.push({ action: 'commit' });
    
            const editorAction = {
                action: 'chain',
                param: chain
            }
            await this.editorViewObj.verovio.edit(editorAction);
    
            // WIP disable redo layout
            //await this.view.verovio.redoLayout();
            await this.editorViewObj.renderPage(true);
            //this.editorViewObj.updateMEI();
            */
    }
}
//# sourceMappingURL=action-manager.js.map
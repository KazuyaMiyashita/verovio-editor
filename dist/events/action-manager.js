import { EventManager } from './event-manager.js';
export class ActionManager {
    constructor(view, app) {
        this.app = app;
        this.editorViewObj = view;
        this.eventManager = new EventManager(this);
        this.inProgress = false;
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async commit(caller) {
        const editorAction = { action: 'commit' };
        await this.editorViewObj.verovio.edit(editorAction);
        await this.editorViewObj.renderPage(true);
        this.inProgress = false;
        let id = "";
        if (this.editorViewObj.hasSelection()) {
            id = this.editorViewObj.getSelection()[0].id;
        }
        let event = new CustomEvent('onEditData', {
            detail: {
                id: id,
                caller: caller
            }
        });
        this.app.customEventManager.dispatch(event);
    }
    /*
    public async delete(): Promise<any> {
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
                action: 'drag',
                param: {
                    elementId: item.id,
                    x: item.x + x,
                    y: item.y + y
                }
            };
            chain.push(editorAction);
        }
        if (chain.length === 0)
            return;
        const editorAction = {
            action: 'chain',
            param: chain
        };
        await this.editorViewObj.verovio.edit(editorAction);
        await this.editorViewObj.verovio.redoPagePitchPosLayout();
        await this.editorViewObj.renderPage(true, false);
    }
    async keyDown(key, shiftKey, ctrlKey) {
        let chain = new Array();
        for (const item of this.editorViewObj.getSelection()) {
            if (!["note"].includes(item.element))
                continue;
            const editorAction = {
                action: 'keyDown',
                param: {
                    elementId: item.id,
                    key: key,
                    shiftKey: shiftKey,
                    ctrlKey: ctrlKey
                }
            };
            chain.push(editorAction);
        }
        // actually nothing to do
        if (chain.length === 0)
            return;
        if (this.inProgress) {
            await this.editorViewObj.verovio.redoPagePitchPosLayout();
            await this.editorViewObj.renderPage(true, false);
        }
        this.inProgress = true;
        const editorAction = {
            action: 'chain',
            param: chain
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
    /*
    async insertNote(x: number, y: number): Promise<any> {
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
        await this.setAttrValue("form", "cres", ["hairpin"]);
    }
    async formDim() {
        await this.setAttrValue("form", "dim", ["hairpin"]);
    }
    async placeAbove() {
        await this.setAttrValue("place", "above", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
    }
    async placeBelow() {
        await this.setAttrValue("place", "below", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
    }
    async placeAuto() {
        await this.setAttrValue("place", "", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
    }
    async stemDirUp() {
        await this.setAttrValue("stem.dir", "up", ["note", "chord"]);
    }
    async stemDirDown() {
        await this.setAttrValue("stem.dir", "down", ["note", "chord"]);
    }
    async stemDirAuto() {
        await this.setAttrValue("stem.dir", "", ["note", "chord"]);
    }
    // helper
    async setAttrValue(attribute, value, elementTypes = []) {
        let chain = new Array();
        for (const item of this.editorViewObj.getSelection()) {
            if (elementTypes.length > 0 && !elementTypes.includes(item.element))
                continue;
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
        if (chain.length === 0)
            return;
        chain.push({ action: 'commit' });
        const editorAction = {
            action: 'chain',
            param: chain
        };
        await this.editorViewObj.verovio.edit(editorAction);
        // WIP disable redo layout
        //await this.view.verovio.redoLayout();
        await this.editorViewObj.renderPage(true);
        //this.editorViewObj.updateMEI();
    }
}
//# sourceMappingURL=action-manager.js.map
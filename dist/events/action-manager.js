import { EventManager } from './event-manager.js';
class Call {
    constructor(method, args) {
        this.method = method;
        this.args = args;
    }
}
export class ActionManager {
    constructor(view, app) {
        this.app = app;
        this.editorViewObj = view;
        this.verovio = view.verovio;
        this.eventManager = new EventManager(this);
        this.inProgress = false;
        this.delayedCalls = [];
    }
    ////////////////////////////////////////////////////////////////////////
    // Delayed calls
    ////////////////////////////////////////////////////////////////////////
    async callDelayedCalls() {
        //console.debug( this.delayedCalls.length );
        if (this.delayedCalls.length > 0) {
            const call = this.delayedCalls[0];
            this.delayedCalls.shift();
            await call.method.apply(this, call.args);
        }
        else {
            await this.commit();
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    async commit() {
        this.inProgress = true;
        const editorAction = { action: 'commit' };
        await this.editorViewObj.verovio.edit(editorAction);
        // WIP disable redo layout
        //await this.view.verovio.redoLayout();
        this.app.setPageCount(await this.verovio.getPageCount());
        if (this.editorViewObj.getCurrentPage() > this.app.getPageCount()) {
            this.editorViewObj.setCurrentPage(this.app.getPageCount());
        }
        await this.editorViewObj.renderPage(true);
        //this.view.updateMEI();
        this.inProgress = false;
        // Check that nothing was added in-between
        if (this.delayedCalls.length > 0) {
            await this.callDelayedCalls();
        }
    }
    async delete() {
        let chain = new Array();
        for (const item of this.editorViewObj.getSelection()) {
            if (!["note"].includes(item.element))
                continue;
            chain.push({
                action: 'delete',
                param: {
                    elementId: item.id
                }
            });
        }
        if (chain.length === 0)
            return;
        chain.push({ action: 'commit' });
        const editorAction = {
            action: 'chain',
            param: chain
        };
        await this.editorViewObj.verovio.edit(editorAction);
        await this.editorViewObj.verovio.redoLayout();
        await this.editorViewObj.renderPage(true);
        //this.editorViewObj.updateMEI();
    }
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
        // keyDown events can 
        if (this.inProgress) {
            this.delayedCalls.push(new Call(this.keyDown, arguments));
            return;
        }
        this.inProgress = true;
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
        if (chain.length === 0) {
            this.inProgress = false;
            return;
        }
        const editorAction = {
            action: 'chain',
            param: chain
        };
        await this.editorViewObj.verovio.edit(editorAction);
        // WIP disable redo layout
        //await this.view.verovio.redoPagePitchPosLayout();
        //await this.view.renderPage(true, false);
        this.inProgress = false;
        await this.callDelayedCalls();
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
    async update() {
        const editorAction = {
            action: 'commit'
        };
        await this.editorViewObj.verovio.edit(editorAction);
        //await this.editorViewObj.updateLoadData();
        //this.editorViewObj.updateMEI();
        await this.editorViewObj.renderPage(true);
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
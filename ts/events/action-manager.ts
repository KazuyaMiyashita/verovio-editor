/**
 * The ActionManager action class
 */
import { App } from '../app.js';
import { EditorView } from '../editor/editor-view.js';
import { EventManager } from './event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { VerovioView } from '../verovio/verovio-view.js';


export class ActionManager {
    public readonly eventManager: EventManager;

    protected readonly app: App;

    private inProgress: boolean;
    private readonly editorViewObj: EditorView;
    private canUndoCache: boolean;
    private canRedoCache: boolean;

    constructor(view: EditorView, app: App) {
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

    public canUndo(): boolean { return this.canUndoCache; }
    public canRedo(): boolean { return this.canRedoCache; }

    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////

    public async commit(caller: GenericView): Promise<any> {
        const editorAction = { action: 'commit' };

        await this.editorViewObj.verovio.edit(editorAction);
        const info = await this.editorViewObj.verovio.editInfo() as VerovioView.EditInfo;
        this.canUndoCache = info.canUndo;
        this.canRedoCache = info.canRedo;
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

    public async editRefresh() {
        await this.editorViewObj.verovio.redoPagePitchPosLayout();
        await this.editorViewObj.renderPage(true, false);
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

    public async drag(x: number, y: number): Promise<any> {
        let chain = new Array();
        for (const item of this.editorViewObj.getSelection()) {
            if (!["note"].includes(item.element)) continue
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

        if (chain.length === 0) return;

        const editorAction = {
            action: 'chain',
            param: chain
        }

        await this.editorViewObj.verovio.edit(editorAction);
        await this.editRefresh();
    }

    public async keyDown(key: number, shiftKey: boolean, ctrlKey: boolean): Promise<any> {
        let chain = new Array();
        for (const item of this.editorViewObj.getSelection()) {
            if (!["note"].includes(item.element)) continue;
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
        if (chain.length === 0) return;

        if (this.inProgress) {
            await this.editRefresh();
        }

        this.inProgress = true;
        const editorAction = {
            action: 'chain',
            param: chain
        }

        await this.editorViewObj.verovio.edit(editorAction);
    }

    public async keyUp(key: number, shiftKey: boolean, ctrlKey: boolean): Promise<any> {
        // actually nothing to do
        if (!this.inProgress) return;

        this.commit(this.editorViewObj);
    }

    ////////////////////////////////////////////////////////////////////////
    // Element specific methods
    ////////////////////////////////////////////////////////////////////////

    async insert(elementName: string, insertMode: string): Promise<any> {
        if (!this.editorViewObj.hasSelection()) return;

        let chain = new Array();

        chain.push({
            action: 'insert',
            param: {
                elementName: elementName,
                elementId: this.editorViewObj.getSelection()[0].id,
                insertMode: insertMode
            }
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
            action: 'chain',
            param: chain
        }

        await this.editorViewObj.verovio.edit(editorAction);
        await this.commit(this.editorViewObj);
    }

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

    public async formCres(): Promise<any> {
        await this.setAttrValueForTypes("form", "cres", ["hairpin"]);
    }

    public async formDim(): Promise<any> {
        await this.setAttrValueForTypes("form", "dim", ["hairpin"]);
    }

    public async placeAbove(): Promise<any> {
        await this.setAttrValueForTypes("place", "above", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
    }

    public async placeBelow(): Promise<any> {
        await this.setAttrValueForTypes("place", "below", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
    }

    public async placeAuto(): Promise<any> {
        await this.setAttrValueForTypes("place", "", ["dir", "dynam", "hairpin", "tempo", "pedal"]);
    }

    public async stemDirUp(): Promise<any> {
        await this.setAttrValueForTypes("stem.dir", "up", ["note", "chord"]);
    }

    public async stemDirDown(): Promise<any> {
        await this.setAttrValueForTypes("stem.dir", "down", ["note", "chord"]);
    }

    public async stemDirAuto(): Promise<any> {
        await this.setAttrValueForTypes("stem.dir", "", ["note", "chord"]);
    }

    public async undo(): Promise<any> {
        this.app.startLoading("Undoing ...", true);
        const editorAction = { action: 'undo' }
        await this.editorViewObj.verovio.edit(editorAction);
        const info = await this.editorViewObj.verovio.editInfo() as VerovioView.EditInfo;
        this.canUndoCache = info.canUndo;
        this.canRedoCache = info.canRedo;
        await this.editorViewObj.renderPage(true);
    }

    public async redo(): Promise<any> {
        this.app.startLoading("Redoing ...", true);
        const editorAction = { action: 'redo' }
        await this.editorViewObj.verovio.edit(editorAction);
        const info = await this.editorViewObj.verovio.editInfo() as VerovioView.EditInfo;
        this.canUndoCache = info.canUndo;
        this.canRedoCache = info.canRedo;
        await this.editorViewObj.renderPage(true);
    }

    // helper

    public async setAttrValue(attribute: string, value: string, id: string): Promise<any> {
        const editorAction = {
            action: 'set',
            param: {
                elementId: id,
                attribute: attribute,
                value: value
            }
        };
        await this.editorViewObj.verovio.edit(editorAction);
    }

    public async setAttrValueForTypes(attribute: string, value: string, elementTypes: Array<string> = []): Promise<any> {
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

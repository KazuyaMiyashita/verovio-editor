/**
 * The EditorPanel class implements a panel with both Verovio and XML views.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EditorContentTree } from './editor-content-tree.js';
import { GenericView } from '../utils/generic-view.js';
export class EditorContentPanel extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.tab = tab;
        this.treeView = new EditorContentTree(this.div, this.app, this.tab);
        this.treeView.hideRoot = true;
        this.customEventManager.addToPropagationList(this.treeView.customEventManager);
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    updateContent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const contextOk = yield this.app.verovio.edit({ action: 'context', param: { elementId: `${id}` } });
            if (contextOk) {
                const jsonContext = yield this.app.verovio.editInfo();
                this.treeView.loadContext(jsonContext['context'], jsonContext['ancestors']);
            }
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("EditorContentPanel::onActivate");
        return true;
    }
    onUpdateData(e) {
        if (!super.onUpdateData(e))
            return false;
        //console.debug("EditorContentTree::onUpdateData");
        return true;
    }
    onSelect(e) {
        if (!super.onSelect(e))
            return false;
        this.updateContent(e.detail.id);
        return true;
    }
}
//# sourceMappingURL=editor-content-panel.js.map
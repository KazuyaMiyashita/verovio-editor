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
function fakeApiCall() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("Data received");
        }, 2000); // Simulate a delay of 2 seconds
    });
}
export class EditorContentPanel extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.tab = tab;
        this.treeView = new EditorContentTree(this.div, this.app, this.tab);
        this.customEventManager.addToPropagationList(this.treeView.customEventManager);
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    updateContent() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("prout1");
            const data = yield fakeApiCall();
            console.log("prout2");
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        console.debug("EditorContentPanel::onActivate");
        this.updateContent();
    }
    onUpdateData(e) {
        if (!super.onUpdateData(e))
            return false;
        console.debug("EditorContentTree::onUpdateData");
        return true;
    }
}
//# sourceMappingURL=editor-content-panel.js.map
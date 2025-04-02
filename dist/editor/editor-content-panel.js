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
import { appendDivTo, appendSpanTo } from '../utils/functions.js';
export class EditorContentPanel extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.setDisplayFlex();
        this.tab = tab;
        let treeFieldSet = this.addFieldSet("Element context");
        this.contentTree = appendDivTo(treeFieldSet, { class: `vrv-field-set-panel` });
        this.contentTreeObj = new EditorContentTree(this.contentTree, this.app, this.tab);
        this.contentTreeObj.hideRoot = true;
        this.customEventManager.addToPropagationList(this.contentTreeObj.customEventManager);
        let attributeFieldSet = this.addFieldSet("Attributes");
        let referencedFieldSet = this.addFieldSet("Referencing elements");
        let referencingFieldSet = this.addFieldSet("Referenced elements");
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    updateContent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const contextOk = yield this.app.verovio.edit({ action: 'context', param: { elementId: `${id}` } });
            if (contextOk) {
                const jsonContext = yield this.app.verovio.editInfo();
                this.contentTreeObj.loadContext(jsonContext['context'], jsonContext['ancestors']);
            }
        });
    }
    addFieldSet(label) {
        let legend = appendDivTo(this.div, { class: `vrv-legend` });
        legend.innerHTML = label;
        let span = appendSpanTo(legend, { class: `icon` }, '▼');
        let fieldSet = appendDivTo(this.div, { class: `vrv-field-set` });
        span.addEventListener("click", () => {
            legend.classList.toggle("toggled");
            fieldSet.classList.toggle("toggled");
        });
        return fieldSet;
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
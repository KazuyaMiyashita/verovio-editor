var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo } from '../utils/functions.js';
export var ReferenceDirection;
(function (ReferenceDirection) {
    ReferenceDirection[ReferenceDirection["From"] = 0] = "From";
    ReferenceDirection[ReferenceDirection["To"] = 1] = "To";
})(ReferenceDirection || (ReferenceDirection = {}));
export class EditorReferenceList extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.tab = tab;
        this.eventManager = new EventManager(this);
        this.listWrapper = appendDivTo(this.div, { class: `vrv-tree-breadcrumbs-wrapper` });
    }
    /*
    addCrumb(element: string, id: string): void {
        const crumb: HTMLDivElement = appendDivTo(this.breadCrumbs, { class: `vrv-tree-breadcrumb` });
        crumb.innerHTML = element;
        crumb.dataset.id = id
        crumb.dataset.element = element;
        this.eventManager.bind(crumb, 'click', this.onClick);
        this.eventManager.bind(crumb, 'mouseover', this.onMouseover);
        this.eventManager.bind(crumb, 'mouseout', this.onMouseout);
    }
    */
    loadList(references, direction) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(references);
            /*
            if (Array.isArray(ancestors)) {
                this.breadCrumbs.innerHTML = "";
                for (let i = ancestors.length - 1; i >= 0; i--) {
                    this.addCrumb(ancestors[i]['element'], ancestors[i]['id']);
                };
            };
            this.listWrapper.scrollLeft = this.listWrapper.scrollWidth;
            */
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onLoadData(e) {
        if (!super.onLoadData(e))
            return false;
        console.debug("EditorReferenceList::onLoadData");
        return true;
    }
    onUpdateData(e) {
        if (!super.onUpdateData(e))
            return false;
        console.debug("EditorReferenceList::onUpdateData");
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    select(element, id) {
        let event = new CustomEvent('onSelect', {
            detail: {
                id: id,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }
    cursorActivity(id, activity) {
        let event = new CustomEvent('onCursorActivity', {
            detail: {
                id: id,
                activity: activity,
                caller: this
            }
        });
        this.app.customEventManager.dispatch(event);
    }
}
//# sourceMappingURL=editor-references-list.js.map
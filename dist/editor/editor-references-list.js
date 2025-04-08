var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { App } from '../app.js';
import { EventManager } from '../events/event-manager.js';
import { GenericView } from '../utils/generic-view.js';
import { appendDivTo } from '../utils/functions.js';
export class EditorReferenceList extends GenericView {
    constructor(div, app, tab) {
        super(div, app);
        this.setDisplayFlex();
        this.tab = tab;
        this.eventManager = new EventManager(this);
        this.listWrapper = appendDivTo(this.div, { class: `vrv-reference-list-wrapper` });
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
            this.listWrapper.innerHTML = "";
            this.eventManager.unbindAll();
            if (!Array.isArray(references))
                return;
            references.forEach(reference => {
                let item = appendDivTo(this.listWrapper, { class: `vrv-reference-list-item vrv-mei-element` });
                item.style.backgroundImage = `url(${App.iconFor(reference['element'])})`;
                item.innerHTML = `${reference['element']}@${reference['referenceAttribute']}`;
                item.dataset.id = reference['id'];
                item.dataset.element = reference['element'];
                this.eventManager.bind(item, "click", this.onClick);
                this.eventManager.bind(item, "mouseover", this.onMouseover);
                this.eventManager.bind(item, "mouseout", this.onMouseout);
            });
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
                elementType: element,
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
    onClick(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.select(element.dataset.element, element.dataset.id);
        }
    }
    onMouseover(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseover');
        }
    }
    onMouseout(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, 'mouseout');
        }
    }
}
////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////
(function (EditorReferenceList) {
    let Direction;
    (function (Direction) {
        Direction[Direction["From"] = 0] = "From";
        Direction[Direction["To"] = 1] = "To";
    })(Direction = EditorReferenceList.Direction || (EditorReferenceList.Direction = {}));
})(EditorReferenceList || (EditorReferenceList = {}));
//# sourceMappingURL=editor-references-list.js.map
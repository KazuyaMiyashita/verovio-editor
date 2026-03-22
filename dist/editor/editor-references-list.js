import { App } from "../app.js";
import { EventManager } from "../events/event-manager.js";
import { GenericView } from "../utils/generic-view.js";
import { appendDivTo } from "../utils/functions.js";
import { AppEvent, createAppEvent } from "../events/event-types.js";
export class EditorReferenceList extends GenericView {
    eventManager;
    tab;
    listWrapper;
    constructor(div, app, tab) {
        super(div, app);
        this.setDisplayFlex();
        this.tab = tab;
        this.eventManager = new EventManager(this);
        this.listWrapper = appendDivTo(this.div, {
            class: `vrv-reference-list-wrapper`,
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    loadList(references, direction) {
        this.listWrapper.textContent = "";
        this.eventManager.unbindAll();
        references.forEach((reference) => {
            let item = appendDivTo(this.listWrapper, {
                class: `vrv-reference-list-item vrv-mei-element`,
            });
            item.style.backgroundImage = `url(${App.iconFor(reference.element, this.app.host)})`;
            item.textContent = `${reference["element"]} @ ${reference.referenceAttribute}`;
            item.dataset.id = reference.id;
            item.dataset.element = reference.element;
            this.eventManager.bind(item, "click", this.onClick);
            this.eventManager.bind(item, "mouseover", this.onMouseover);
            this.eventManager.bind(item, "mouseout", this.onMouseout);
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    select(element, id) {
        this.app.customEventManager.dispatch(createAppEvent(AppEvent.Select, {
            id: id,
            element: element,
            caller: this,
        }));
    }
    cursorActivity(id, activity) {
        this.app.customEventManager.dispatch(createAppEvent(AppEvent.CursorActivity, {
            id: id,
            activity: activity,
            caller: this,
        }));
    }
    //////////////////////////////////////////////////////////////////////////
    // Event methods
    //////////////////////////////////////////////////////////////////////////
    onClick(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.select(element.dataset.element, element.dataset.id);
        }
    }
    onMouseover(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, "mouseover");
        }
    }
    onMouseout(e) {
        const element = e.target;
        if (element.dataset.id) {
            this.cursorActivity(element.dataset.id, "mouseout");
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
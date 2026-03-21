/**
 * Application event types and their payloads.
 */
export var AppEvent;
(function (AppEvent) {
    AppEvent["Activate"] = "onActivate";
    AppEvent["Deactivate"] = "onDeactivate";
    AppEvent["LoadData"] = "onLoadData";
    AppEvent["Select"] = "onSelect";
    AppEvent["EditData"] = "onEditData";
    AppEvent["Resized"] = "onResized";
    AppEvent["CursorActivity"] = "onCursorActivity";
    AppEvent["Page"] = "onPage";
    AppEvent["Zoom"] = "onZoom";
    AppEvent["StartLoading"] = "onStartLoading";
    AppEvent["EndLoading"] = "onEndLoading";
})(AppEvent || (AppEvent = {}));
export function createAppEvent(type, detail) {
    return new CustomEvent(type, { detail });
}
//# sourceMappingURL=event-types.js.map
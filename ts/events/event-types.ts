/**
 * Application event types and their payloads.
 */

export enum AppEvent {
  Activate = "onActivate",
  Deactivate = "onDeactivate",
  LoadData = "onLoadData",
  Select = "onSelect",
  EditData = "onEditData",
  Resized = "onResized",
  CursorActivity = "onCursorActivity",
  Page = "onPage",
  Zoom = "onZoom",
  StartLoading = "onStartLoading",
  EndLoading = "onEndLoading",
}

export interface AppEventDetailMap {
  [AppEvent.Activate]: undefined;
  [AppEvent.Deactivate]: undefined;
  [AppEvent.LoadData]: {
    caller: any;
    mei?: string;
    currentId?: string;
    reload?: boolean;
    lightEndLoading?: boolean;
  };
  [AppEvent.Select]: {
    id: string;
    element?: string;
    elementType?: string;
    caller: any;
  };
  [AppEvent.EditData]: {
    id?: string;
    caller?: any;
  };
  [AppEvent.Resized]: undefined;
  [AppEvent.CursorActivity]: {
    id: string;
    activity: string;
    caller: any;
  };
  [AppEvent.Page]: undefined;
  [AppEvent.Zoom]: undefined;
  [AppEvent.StartLoading]: {
    light: boolean;
    msg: string;
  };
  [AppEvent.EndLoading]: undefined;
}

export type AppCustomEvent<K extends AppEvent> = CustomEvent<
  AppEventDetailMap[K]
>;

export function createAppEvent<K extends AppEvent>(
  type: K,
  detail?: AppEventDetailMap[K],
): AppCustomEvent<K> {
  return new CustomEvent(type, { detail }) as AppCustomEvent<K>;
}

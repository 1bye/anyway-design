import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AlertReferenceComparison } from "./alert-reference";
import { App } from "./app";
import { ComponentPlayground } from "./component-playground";
import { ControlsReferenceComparison } from "./controls-reference";
import { DatePickerReferenceComparison } from "./date-picker-reference";
import { DesktopReferenceComparison } from "./desktop-reference";
import { DockGlassPlayground } from "./dock-glass-playground";
import { DockReferenceComparison } from "./dock-reference";
import { FileColumnsReferenceComparison } from "./file-columns-reference";
import { FileDialogReferenceComparison } from "./file-dialog-reference";
import { FileGalleryReferenceComparison } from "./file-gallery-reference";
import { FileInfoReferenceComparison } from "./file-info-reference";
import { FileListReferenceComparison } from "./file-list-reference";
import { FileRenameReferenceComparison } from "./file-rename-reference";
import { FinderActionsReferenceComparison } from "./finder-actions-reference";
import { FinderDragReferenceComparison } from "./finder-drag-reference";
import { InputControlsReferenceComparison } from "./input-controls-reference";
import { MenuReferenceComparison } from "./menu-reference";
import { NewFolderReferenceComparison } from "./new-folder-reference";
import { NotificationCenterReferenceComparison } from "./notification-center-reference";
import { PopoverReferenceComparison } from "./popover-reference";
import { ProgressReferenceComparison } from "./progress-reference";
import { QuickLookReferenceComparison } from "./quick-look-reference";
import { SelectionControlsReferenceComparison } from "./selection-controls-reference";
import { TextFieldsReferenceComparison } from "./text-fields-reference";
import { ToggleControlsReferenceComparison } from "./toggle-controls-reference";
import { WindowReferenceComparison } from "./window-reference";
import "@anyway-design/macos/styles.css";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
	throw new Error("The platform lab root element is missing.");
}
const view = new URLSearchParams(window.location.search).get("view");
let page = <ComponentPlayground />;
if (view === "desktop-lab") {
	page = <App />;
} else if (view === "desktop-reference") {
	page = <DesktopReferenceComparison />;
} else if (view === "dock-reference") {
	page = <DockReferenceComparison />;
} else if (view === "dock-glass") {
	page = <DockGlassPlayground />;
} else if (view === "window-reference") {
	page = <WindowReferenceComparison />;
} else if (view === "finder-drag-reference") {
	page = <FinderDragReferenceComparison />;
} else if (view === "finder-actions-reference") {
	page = <FinderActionsReferenceComparison />;
} else if (view === "menu-reference") {
	page = <MenuReferenceComparison />;
} else if (view === "controls-reference") {
	page = <ControlsReferenceComparison />;
} else if (view === "file-list-reference") {
	page = <FileListReferenceComparison />;
} else if (view === "folder-list-reference") {
	page = <FileListReferenceComparison folders />;
} else if (view === "quick-look-reference") {
	page = <QuickLookReferenceComparison />;
} else if (view === "file-rename-reference") {
	page = <FileRenameReferenceComparison />;
} else if (view === "file-dialog-reference") {
	page = <FileDialogReferenceComparison />;
} else if (view === "file-columns-reference") {
	page = <FileColumnsReferenceComparison />;
} else if (view === "new-folder-reference") {
	page = <NewFolderReferenceComparison />;
} else if (view === "file-gallery-reference") {
	page = <FileGalleryReferenceComparison />;
} else if (view === "file-info-reference") {
	page = <FileInfoReferenceComparison />;
} else if (view === "input-controls-reference") {
	page = <InputControlsReferenceComparison />;
} else if (view === "selection-controls-reference") {
	page = <SelectionControlsReferenceComparison />;
} else if (view === "alert-reference") {
	page = <AlertReferenceComparison />;
} else if (view === "progress-reference") {
	page = <ProgressReferenceComparison />;
} else if (view === "popover-reference") {
	page = <PopoverReferenceComparison />;
} else if (view === "text-fields-reference") {
	page = <TextFieldsReferenceComparison />;
} else if (view === "toggle-controls-reference") {
	page = <ToggleControlsReferenceComparison />;
} else if (view === "date-picker-reference") {
	page = <DatePickerReferenceComparison />;
} else if (view === "notification-center-reference") {
	page = <NotificationCenterReferenceComparison />;
}
createRoot(root).render(<StrictMode>{page}</StrictMode>);

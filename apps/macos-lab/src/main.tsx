import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { ControlsReferenceComparison } from "./controls-reference";
import { DockGlassPlayground } from "./dock-glass-playground";
import { DockReferenceComparison } from "./dock-reference";
import { FileColumnsReferenceComparison } from "./file-columns-reference";
import { FileDialogReferenceComparison } from "./file-dialog-reference";
import { FileListReferenceComparison } from "./file-list-reference";
import { FileRenameReferenceComparison } from "./file-rename-reference";
import { MenuReferenceComparison } from "./menu-reference";
import { QuickLookReferenceComparison } from "./quick-look-reference";
import { WindowReferenceComparison } from "./window-reference";
import "@anyway-design/macos/styles.css";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
	throw new Error("The platform lab root element is missing.");
}
const view = new URLSearchParams(window.location.search).get("view");
let page = <App />;
if (view === "dock-reference") {
	page = <DockReferenceComparison />;
} else if (view === "dock-glass") {
	page = <DockGlassPlayground />;
} else if (view === "window-reference") {
	page = <WindowReferenceComparison />;
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
}
createRoot(root).render(<StrictMode>{page}</StrictMode>);

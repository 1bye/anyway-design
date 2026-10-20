import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { DockGlassPlayground } from "./dock-glass-playground";
import { DockReferenceComparison } from "./dock-reference";
import { MenuReferenceComparison } from "./menu-reference";
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
}
createRoot(root).render(<StrictMode>{page}</StrictMode>);

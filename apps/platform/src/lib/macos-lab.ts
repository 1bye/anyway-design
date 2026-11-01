import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";

export const MACOS_LAB_PATH = "/macos-lab/index.html";
const components = new Set(PLAYGROUND_ENTRIES.map((entry) => entry.id));
const views = new Set([
	...PLAYGROUND_ENTRIES.map((entry) => entry.reference).filter(Boolean),
	"desktop-lab",
	"dock-glass",
	"folder-list-reference",
]);

export function readLabSelection(search: Record<string, unknown>): {
	component?: string;
	view?: string;
} {
	return {
		component:
			typeof search.component === "string" && components.has(search.component)
				? search.component
				: undefined,
		view:
			typeof search.view === "string" && views.has(search.view)
				? search.view
				: undefined,
	};
}

export function getMacosLabUrl(search: Record<string, unknown>): string {
	const { component, view } = readLabSelection(search);
	const params = new URLSearchParams(
		view ? { view } : { component: component ?? "finder" }
	);
	return `${MACOS_LAB_PATH}?${params}`;
}

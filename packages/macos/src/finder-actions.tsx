import type { MacFinderFile } from "./finder-model";
import type { MacMenuEntry } from "./menu";
import type { MacQuickLookItem } from "./quick-look";
import { WindowSymbol } from "./window-symbol";

export interface MacFinderActionContext {
	defaultActions: readonly MacMenuEntry[];
	/** Folder receiving actions such as New Folder. Can be a virtual collection ID. */
	locationId: string;
	selectedFiles: readonly MacFinderFile[];
	selectedIds: readonly string[];
}
export type MacFinderFileActions =
	| readonly MacMenuEntry[]
	| ((context: MacFinderActionContext) => readonly MacMenuEntry[]);
export interface FinderCapabilities {
	create: boolean;
	open: boolean;
	operations?: (context: MacFinderActionContext) => readonly MacMenuEntry[];
	rename: boolean;
	selectAll: boolean;
}

const FILE_SHORTCUTS = new Map([
	["i", "info"],
	["o", "open"],
	["a", "select-all"],
	["c", "copy"],
	["v", "paste"],
	["d", "duplicate"],
	["z", "undo"],
	["Backspace", "trash"],
	["Delete", "trash"],
]);

const ACTION_ORDER = [
	"open",
	"trash",
	"info",
	"rename",
	"duplicate",
	"quick-look",
	"copy",
	"paste",
	"move-here",
	"new-folder",
	"select-all",
	"undo",
	"redo",
];

export function finderFileShortcut(
	event: {
		key: string;
		code?: string;
		metaKey: boolean;
		ctrlKey: boolean;
		altKey: boolean;
		shiftKey: boolean;
	},
	fileTarget: boolean
): string | undefined {
	if (event.metaKey || event.ctrlKey) {
		const key = event.key.toLowerCase();
		if (
			event.altKey &&
			!event.shiftKey &&
			(key === "v" || event.code === "KeyV")
		) {
			return "move-here";
		}
		if (event.shiftKey && !event.altKey && key === "z") {
			return "redo";
		}
		if (event.altKey || event.shiftKey) {
			return;
		}
		return FILE_SHORTCUTS.get(event.key) ?? FILE_SHORTCUTS.get(key);
	}
	if (fileTarget && event.key === " " && !event.altKey && !event.shiftKey) {
		return "quick-look";
	}
}

export function finderSelectedFiles(
	files: readonly MacFinderFile[],
	ids: readonly string[]
): MacFinderFile[] {
	const seen = new Set<string>();
	const byId = new Map(
		files.filter((file) => !file.disabled).map((file) => [file.id, file])
	);
	return ids.flatMap((id) => {
		const file = byId.get(id);
		if (!file || seen.has(id)) {
			return [];
		}
		seen.add(id);
		return [file];
	});
}

/** Right-clicking a selected item preserves its group; other items replace it. */
export function finderContextSelection(
	selected: readonly string[],
	id?: string
): string[] {
	if (!id) {
		return [];
	}
	return selected.includes(id) ? [...selected] : [id];
}

export function finderActionContext(
	files: readonly MacFinderFile[],
	ids: readonly string[],
	locationId: string,
	capabilities: FinderCapabilities
): MacFinderActionContext {
	const selectedFiles = finderSelectedFiles(files, ids);
	const [single] = selectedFiles.length === 1 ? selectedFiles : [];
	const folder = files.find(
		(file) => file.id === locationId && file.kind === "folder" && !file.disabled
	);
	const defaultActions: MacMenuEntry[] = [];
	if (selectedFiles.length) {
		defaultActions.push(
			{
				disabled: !(
					single?.kind === "folder" ||
					(capabilities.open &&
						selectedFiles.every((file) => file.kind !== "folder"))
				),
				icon: <WindowSymbol name="open" />,
				id: "open",
				label: "Open",
				shortcut: "⌘O",
			},
			{
				icon: <WindowSymbol name="eye" />,
				id: "quick-look",
				label: "Quick Look",
				shortcut: "Space",
			}
		);
	}
	defaultActions.push({
		disabled: selectedFiles.length ? !single : !folder,
		icon: <WindowSymbol name="info" />,
		id: "info",
		label: "Get Info",
		separatorBefore: Boolean(selectedFiles.length),
		shortcut: "⌘I",
	});
	if (selectedFiles.length) {
		defaultActions.push({
			disabled: !(capabilities.rename && single && !single.locked),
			icon: <WindowSymbol name="rename" />,
			id: "rename",
			label: "Rename",
		});
	}
	defaultActions.push(
		{
			disabled: !(capabilities.create && folder && !folder.locked),
			id: "new-folder",
			label: "New Folder",
			separatorBefore: true,
			shortcut: "⇧⌘N",
		},
		{
			disabled: !capabilities.selectAll,
			id: "select-all",
			label: "Select All",
			shortcut: "⌘A",
		}
	);
	const context = {
		defaultActions,
		locationId,
		selectedFiles,
		selectedIds: selectedFiles.map((file) => file.id),
	};
	if (capabilities.operations) {
		defaultActions.push(...capabilities.operations(context));

		defaultActions.sort(
			(a, b) => ACTION_ORDER.indexOf(a.id) - ACTION_ORDER.indexOf(b.id)
		);
	}
	return context;
}

export function finderConfiguredActions(
	context: MacFinderActionContext,
	configured?: MacFinderFileActions
): MacMenuEntry[] {
	const items =
		typeof configured === "function"
			? configured(context)
			: (configured ?? context.defaultActions);
	return items.map((entry) => {
		if (entry.type === "palette") {
			return entry;
		}
		const builtin = context.defaultActions.find((item) => item.id === entry.id);
		return {
			...entry,
			disabled:
				entry.disabled || (builtin?.type !== "palette" && builtin?.disabled),
			items: entry.items
				? finderConfiguredActions(context, entry.items)
				: undefined,
		};
	});
}

/** Respect disabled ancestors and overrides for imperative and keyboard actions too. */
export function finderActionEnabled(
	items: readonly MacMenuEntry[],
	id: string
): boolean | undefined {
	for (const item of items) {
		if (item.type === "palette") {
			if (item.colors.some((color) => color.id === id)) {
				return true;
			}
		} else {
			if (item.id === id) {
				return !item.disabled;
			}
			if (item.items) {
				const enabled = finderActionEnabled(item.items, id);
				if (enabled !== undefined) {
					return !item.disabled && enabled;
				}
			}
		}
	}
}

export function finderQuickLookItem(file: MacFinderFile): MacQuickLookItem {
	const src =
		file.preview?.src ??
		(file.preview?.text === undefined ? file.thumbnail : undefined);
	const text = file.preview?.text;
	let preview: MacQuickLookItem["preview"];
	if (src || text !== undefined) {
		preview = {
			alt: file.preview?.alt,
			presentation:
				file.preview?.presentation ??
				(file.kind === "image" ? "image" : "document"),
			src,
			text,
		};
	}
	return { ...file, openLabel: "Open", preview, subtitle: file.kindLabel };
}

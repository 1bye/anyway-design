import type { MacFileGalleryItem } from "./file-gallery";
import { groupFileItems } from "./file-groups";
import type { MacFileInfoItem } from "./file-info";
import type { MacFileListItem, MacFileSort } from "./file-list";
import { sortFileList } from "./file-list-sort";
import { FILE_KIND_LABELS } from "./file-list-tree";

export type MacFinderView = "icons" | "list" | "columns" | "gallery";
export type MacFinderGroup = "none" | "kind" | "date" | "size" | "tags";
export interface MacFinderFile
	extends Omit<MacFileGalleryItem, "children">,
		Omit<MacFileInfoItem, "children" | "preview"> {
	parentId?: string;
	shared?: boolean;
}
export interface MacFinderTab {
	column?: string;
	columnRoot?: string;
	group: MacFinderGroup;
	history: string[];
	id: string;
	index: number;
	query: string;
	searchOpen: boolean;
	selected: string[];
	sort: MacFileSort;
	view: MacFinderView;
}
/** A virtual sidebar location, such as Recents or a tag collection. IDs must not collide with files. */
export interface MacFinderCollection {
	filter: (file: MacFinderFile) => boolean;
	id: string;
	label: string;
}
export const FINDER_VIEWS: readonly MacFinderView[] = [
	"icons",
	"list",
	"columns",
	"gallery",
];

export function finderCanNavigate(
	files: readonly MacFinderFile[],
	collections: readonly MacFinderCollection[],
	id: string
): boolean {
	return (
		collections.some((entry) => entry.id === id) ||
		files.some(
			(file) => file.id === id && file.kind === "folder" && !file.disabled
		)
	);
}

/** Resolve removed folders, stale selections, and newly restricted views without mutating caller data. */
export function resolveFinderTab(
	tab: MacFinderTab,
	files: readonly MacFinderFile[],
	collections: readonly MacFinderCollection[],
	rootId: string,
	views: readonly MacFinderView[]
): MacFinderTab {
	const history = tab.history.filter((id) =>
		finderCanNavigate(files, collections, id)
	);
	const preceding = tab.history
		.slice(0, tab.index + 1)
		.filter((id) => finderCanNavigate(files, collections, id)).length;
	const current = {
		...tab,
		history: history.length ? history : [rootId],
		index: Math.max(0, preceding - 1),
	};
	const changed = finderLocation(current) !== finderLocation(tab);
	const ids = new Set(
		files.filter((file) => !file.disabled).map((file) => file.id)
	);
	return {
		...current,
		column:
			!changed && current.column && ids.has(current.column)
				? current.column
				: undefined,
		columnRoot:
			!changed &&
			current.columnRoot &&
			finderCanNavigate(files, collections, current.columnRoot)
				? current.columnRoot
				: undefined,
		query: changed ? "" : current.query,
		searchOpen: !changed && current.searchOpen,
		selected: changed ? [] : current.selected.filter((id) => ids.has(id)),
		view: views.includes(current.view) ? current.view : (views[0] ?? "icons"),
	};
}

export function finderShortcut(event: {
	key: string;
	metaKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
	shiftKey: boolean;
}): string | undefined {
	const modifier = event.metaKey || event.ctrlKey;
	if (modifier && !event.altKey) {
		if (event.shiftKey && event.key.toLowerCase() === "n") {
			return "new-folder";
		}
		if (event.shiftKey) {
			return;
		}
		if (event.key.toLowerCase() === "f") {
			return "search";
		}
		if (event.key === "[") {
			return "back";
		}
		if (event.key === "]") {
			return "forward";
		}
		return (
			{ "1": "icons", "2": "list", "3": "columns", "4": "gallery" } as Record<
				string,
				string
			>
		)[event.key];
	}
	if (event.altKey && !modifier && !event.shiftKey) {
		if (event.key === "ArrowLeft") {
			return "back";
		}
		if (event.key === "ArrowRight") {
			return "forward";
		}
	}
}

export function createFinderTab(id: string, location: string): MacFinderTab {
	return {
		group: "none",
		history: [location],
		id,
		index: 0,
		query: "",
		searchOpen: false,
		selected: [],
		sort: { column: "name", direction: "ascending" },
		view: "icons",
	};
}
export function finderLocation(tab: MacFinderTab): string {
	return tab.history[tab.index] ?? tab.history[0] ?? "";
}
export function navigateFinderTab(
	tab: MacFinderTab,
	location: string
): MacFinderTab {
	if (finderLocation(tab) === location) {
		return {
			...tab,
			column: undefined,
			columnRoot: undefined,
			query: "",
			searchOpen: false,
			selected: [],
		};
	}
	const history = [...tab.history.slice(0, tab.index + 1), location];
	return {
		...tab,
		column: undefined,
		columnRoot: undefined,
		history,
		index: history.length - 1,
		query: "",
		searchOpen: false,
		selected: [],
	};
}
export function stepFinderHistory(
	tab: MacFinderTab,
	step: number
): MacFinderTab {
	const index = Math.max(0, Math.min(tab.history.length - 1, tab.index + step));
	return index === tab.index
		? tab
		: {
				...tab,
				column: undefined,
				columnRoot: undefined,
				index,
				query: "",
				searchOpen: false,
				selected: [],
			};
}

export function selectFinderColumn(
	tab: MacFinderTab,
	file: MacFinderFile | undefined,
	selected: string[],
	collections: readonly MacFinderCollection[] = []
): MacFinderTab {
	if (
		tab.query.trim() ||
		collections.some((entry) => entry.id === finderLocation(tab))
	) {
		return { ...tab, column: file?.id, selected };
	}
	const root = tab.columnRoot ?? finderLocation(tab);
	const location = file?.kind === "folder" ? file.id : (file?.parentId ?? root);
	return {
		...navigateFinderTab(tab, location),
		column: file?.id,
		columnRoot: root,
		selected,
	};
}

export function finderPath(
	files: readonly MacFinderFile[],
	id: string
): MacFinderFile[] {
	const path: MacFinderFile[] = [];
	const seen = new Set<string>();
	let file = files.find((entry) => entry.id === id);
	while (file && !seen.has(file.id)) {
		seen.add(file.id);
		path.unshift(file);
		file = files.find((entry) => entry.id === file?.parentId);
	}
	return path;
}

export function finderLocationFiles(
	files: readonly MacFinderFile[],
	location: string,
	query = "",
	collections: readonly MacFinderCollection[] = []
): MacFinderFile[] {
	const collection = collections.find((entry) => entry.id === location);
	const text = query.trim().toLocaleLowerCase();
	return files.filter((file) => {
		if (!file.parentId) {
			return false;
		}
		let included = file.parentId === location;
		if (text && !collection) {
			included = finderPath(files, file.id)
				.slice(0, -1)
				.some((parent) => parent.id === location);
		}
		if (collection) {
			included = collection.filter(file);
		}
		return (
			included &&
			(!text ||
				`${file.name} ${file.tags?.map((tag) => tag.label).join(" ") ?? ""}`
					.toLocaleLowerCase()
					.includes(text))
		);
	});
}

function finderSizeGroup(file: MacFileListItem): string {
	if (file.kind === "folder") {
		return "Folders";
	}
	if (file.size === undefined || !Number.isFinite(file.size)) {
		return "Unknown Size";
	}
	if (file.size < 100_000) {
		return "Under 100 KB";
	}
	if (file.size < 1_000_000) {
		return "100 KB to 1 MB";
	}
	return "1 MB or Larger";
}
function finderDateGroup(file: MacFileListItem, now: number): string {
	if (file.modifiedAt === undefined || !Number.isFinite(file.modifiedAt)) {
		return "Unknown Date";
	}
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const age = (today.getTime() - file.modifiedAt) / 86_400_000;
	if (age <= 0) {
		return "Today";
	}
	if (age <= 1) {
		return "Yesterday";
	}
	if (age <= 7) {
		return "Previous 7 Days";
	}
	if (age <= 30) {
		return "Previous 30 Days";
	}
	return "Earlier";
}

export function finderGroupLabel(
	file: MacFileListItem,
	group: MacFinderGroup,
	now: number
): string {
	if (group === "kind") {
		return file.kindLabel ?? FILE_KIND_LABELS[file.kind ?? "document"];
	}
	if (group === "tags") {
		return file.tags?.[0]?.label ?? "No Tags";
	}
	if (group === "size") {
		return finderSizeGroup(file);
	}
	if (group === "date") {
		return finderDateGroup(file, now);
	}
	return "";
}

export function arrangeFinderFiles<T extends MacFileListItem>(
	items: readonly T[],
	sort: MacFileSort,
	group: MacFinderGroup,
	now: number
): T[] {
	const sorted = sortFileList(
		items.map((file) => ({
			...file,
			kindLabel: file.kindLabel ?? FILE_KIND_LABELS[file.kind ?? "document"],
		})),
		sort
	);
	return groupFileItems(
		sorted,
		group === "none" ? undefined : (file) => finderGroupLabel(file, group, now)
	).flatMap((section) => [...section.items]);
}

export function finderColumnItems(
	files: readonly MacFinderFile[],
	items: readonly MacFinderFile[],
	tab: MacFinderTab,
	now: number,
	ancestors = new Set<string>()
): (MacFinderFile & { children?: readonly MacFileListItem[] })[] {
	return arrangeFinderFiles(items, tab.sort, tab.group, now).map((file) => {
		const children = files.filter((child) => child.parentId === file.id);
		return {
			...file,
			children:
				file.kind === "folder" && !tab.query.trim() && !ancestors.has(file.id)
					? finderColumnItems(
							files,
							children,
							tab,
							now,
							new Set([...ancestors, file.id])
						)
					: undefined,
		};
	});
}

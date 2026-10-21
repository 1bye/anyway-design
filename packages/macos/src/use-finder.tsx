/** biome-ignore-all lint/performance/noJsxPropsBind: Default sidebar icons have no event handlers. */
import {
	type KeyboardEvent,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import type { MacFileGroupBy } from "./file-groups";
import { MacFileIcon } from "./file-icons";
import { fileNewFolderError, fileNewFolderName } from "./file-new-folder";
import type { MacFinderInitialTab, MacFinderProps } from "./finder";
import {
	createFinderTab,
	FINDER_VIEWS,
	finderCanNavigate,
	finderColumnItems,
	finderGroupLabel,
	finderLocation,
	finderLocationFiles,
	finderPath,
	finderShortcut,
	type MacFinderCollection,
	type MacFinderFile,
	type MacFinderTab,
	type MacFinderView,
	navigateFinderTab,
	resolveFinderTab,
	stepFinderHistory,
} from "./finder-model";
import type { MacMenuEntry } from "./menu";

const EMPTY_COLLECTIONS: readonly MacFinderCollection[] = [];

function initialFinderTabs(
	initial: readonly MacFinderInitialTab[] | undefined,
	location: string,
	view: MacFinderView
) {
	const entries = initial?.length
		? initial
		: [{ id: "finder-initial", location }];
	return entries.map((entry) => ({
		...createFinderTab(entry.id, entry.location),
		selected: [...(entry.selectedIds ?? [])],
		view: entry.view ?? view,
	}));
}
/** A Tahoe Finder window with per-tab history, search, grouping and four file views. */
export function useFinder({
	files: items,
	rootId,
	defaultLocation = rootId,
	defaultTabs,
	defaultView = "icons",
	views = FINDER_VIEWS,
	sidebarGroups,
	collections = EMPTY_COLLECTIONS,
	showSidebar = true,
	showToolbar = true,
	showTabs = true,
	showExtensions = false,
	toolbarDisabled = false,
	onOpen,
	onRename,
	onCreateFolder,
	validateRename,
	onLocationChange,
	onViewChange,
	onSelectionChange,
	onAction,
	ref,
	...props
}: MacFinderProps) {
	const [now] = useState(Date.now);
	const allowedViews = views.length ? views : FINDER_VIEWS;
	const initialLocation = finderCanNavigate(items, collections, defaultLocation)
		? defaultLocation
		: rootId;
	const [tabs, setTabs] = useState(() =>
		initialFinderTabs(defaultTabs, initialLocation, defaultView)
	);
	const [activeTab, setActiveTab] = useState(tabs[0].id);
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const root = useRef<HTMLDivElement>(null);
	const rawTab = tabs.find((entry) => entry.id === activeTab) ?? tabs[0];
	const tab = useMemo(
		() => resolveFinderTab(rawTab, items, collections, rootId, allowedViews),
		[rawTab, items, collections, rootId, allowedViews]
	);
	const location = finderLocation(tab);
	const groups = sidebarGroups ?? [
		{
			id: "folders",
			items: items
				.filter(
					(file) =>
						file.parentId === rootId && file.kind === "folder" && !file.disabled
				)
				.map((file) => ({
					icon: file.icon ?? (
						<MacFileIcon
							height={16}
							name="folder"
							style={{ height: 16, width: 16 }}
							width={16}
						/>
					),
					id: file.id,
					label: file.name,
				})),
		},
	];
	const editableView = allowedViews.find((view) => view !== "gallery");
	const selectedFile =
		tab.selected.length === 1
			? items.find((file) => file.id === tab.selected[0])
			: undefined;
	const physical = items.some(
		(file) => file.id === location && file.kind === "folder" && !file.disabled
	);
	const canCreate = Boolean(onCreateFolder && physical);
	const canRename = Boolean(
		onRename && selectedFile && !selectedFile.disabled && editableView
	);

	const label = (id: string): string =>
		items.find((file) => file.id === id)?.name ??
		collections.find((entry) => entry.id === id)?.label ??
		groups.flatMap((group) => group.items).find((entry) => entry.id === id)
			?.label ??
		id;
	const notify = (next: MacFinderTab) => {
		if (finderLocation(next) !== location) {
			onLocationChange?.(finderLocation(next));
		}
		if (next.view !== tab.view) {
			onViewChange?.(next.view);
		}
		if (
			next.selected.length !== tab.selected.length ||
			next.selected.some((id, index) => id !== tab.selected[index])
		) {
			onSelectionChange?.([...next.selected]);
		}
	};
	const commit = (next: MacFinderTab) => {
		setTabs((entries) =>
			entries.map((entry) => (entry.id === activeTab ? next : entry))
		);
		notify(next);
	};
	const activate = (id: string) => {
		const next = tabs.find((entry) => entry.id === id);
		if (!next || id === activeTab) {
			return;
		}
		setActiveTab(id);
		setRenamingId(null);
		notify(resolveFinderTab(next, items, collections, rootId, allowedViews));
	};

	const updateTab = (patch: Partial<MacFinderTab>) =>
		commit({ ...tab, ...patch });
	const navigate = (id: string) => {
		if (!finderCanNavigate(items, collections, id)) {
			return;
		}
		commit(navigateFinderTab(tab, id));
		setRenamingId(null);
	};
	const history = (step: number) => {
		const next = stepFinderHistory(tab, step);
		if (next === tab) {
			return;
		}
		commit(resolveFinderTab(next, items, collections, rootId, allowedViews));
		setRenamingId(null);
	};
	const visible = useMemo(
		() => finderLocationFiles(items, location, tab.query, collections),
		[items, location, tab.query, collections]
	);
	const tree = useMemo(() => {
		const source =
			tab.view === "columns" && tab.columnRoot && !tab.query.trim()
				? finderLocationFiles(items, tab.columnRoot, "", collections)
				: visible;
		return finderColumnItems(items, source, tab, now);
	}, [items, visible, tab, now, collections]);
	const groupBy: MacFileGroupBy | undefined = useMemo(
		() =>
			tab.group === "none"
				? undefined
				: (file) => finderGroupLabel(file, tab.group, now),
		[tab.group, now]
	);
	const select = (selected: string[]) => updateTab({ selected });
	const query = (value: string) => {
		const ids = new Set(
			finderLocationFiles(items, location, value, collections).map(
				(file) => file.id
			)
		);
		updateTab({
			column: undefined,
			columnRoot: undefined,
			query: value,
			selected: tab.selected.filter((id) => ids.has(id)),
		});
		setRenamingId(null);
	};
	const search = (expanded: boolean) => {
		if (expanded) {
			const input = root.current?.querySelector<HTMLInputElement>(
				".mac-finder-toolbar-search input"
			);
			input?.focus();
			input?.select();
		}
		updateTab({
			column: undefined,
			columnRoot: undefined,
			query: expanded ? tab.query : "",
			searchOpen: expanded,
			selected: [],
		});
	};
	const changeView = (view: MacFinderView) => {
		if (!allowedViews.includes(view)) {
			return;
		}
		updateTab({
			column: undefined,
			columnRoot: undefined,
			selected: tab.selected.filter((id) =>
				visible.some((file) => file.id === id)
			),
			view,
		});
		setRenamingId(null);
	};
	const create = (parentId = location) => {
		if (
			!(
				onCreateFolder &&
				items.some(
					(file) =>
						file.id === parentId && file.kind === "folder" && !file.disabled
				)
			)
		) {
			return;
		}
		const folder: MacFinderFile = {
			id: crypto.randomUUID(),
			kind: "folder",
			modifiedAt: Date.now(),
			name: fileNewFolderName(
				items.filter((file) => file.parentId === parentId)
			),
			parentId,
		};
		onCreateFolder(folder);
		updateTab({
			column: tab.view === "columns" ? folder.id : undefined,
			query: "",
			searchOpen: false,
			selected: [folder.id],
			view: tab.view === "gallery" ? (editableView ?? tab.view) : tab.view,
		});
		setRenamingId(onRename && editableView ? folder.id : null);
	};
	const open = (id: string) => {
		const file = items.find((entry) => entry.id === id);
		if (!file || file.disabled) {
			return;
		}
		if (file.kind === "folder") {
			navigate(id);
		} else {
			onOpen?.(id);
		}
	};
	const command = (id: string) => {
		if (id === "new-folder") {
			create();
		} else if (id === "select-all") {
			select(visible.filter((file) => !file.disabled).map((file) => file.id));
		} else if (FINDER_VIEWS.includes(id as MacFinderView)) {
			changeView(id as MacFinderView);
		} else if (id === "rename" && canRename) {
			if (tab.view === "gallery" && editableView) {
				changeView(editableView);
			}
			setRenamingId(tab.selected[0]);
		} else if (id === "open" && tab.selected.length === 1) {
			open(tab.selected[0]);
		}
		onAction?.(id, tab.selected);
	};
	useImperativeHandle(ref, () => ({ command, navigate }));
	const key = (event: KeyboardEvent<HTMLDivElement>) => {
		if (toolbarDisabled || event.nativeEvent.isComposing) {
			return;
		}
		const shortcut = finderShortcut(event);
		if (
			!shortcut ||
			(shortcut === "search" && !showToolbar) ||
			(FINDER_VIEWS.includes(shortcut as MacFinderView) &&
				!allowedViews.includes(shortcut as MacFinderView)) ||
			(shortcut === "new-folder" && !canCreate)
		) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		if (event.repeat) {
			return;
		}
		if (shortcut === "search") {
			search(true);
		} else if (shortcut === "back") {
			history(-1);
		} else if (shortcut === "forward") {
			history(1);
		} else {
			command(shortcut);
		}
	};
	const fileProps = {
		active: props.active,
		groupBy,
		items: tree,
		label: `${label(location)} files`,
		onNewFolder: canCreate ? () => create() : undefined,
		onOpen: open,
		onRename,
		onRenamingChange: setRenamingId,
		onSelectionChange: select,
		renamingId,
		selectedIds: tab.selected,
		showExtensions,
		validateRename: (id: string, name: string) =>
			validateRename?.(id, name) ??
			fileNewFolderError(
				name,
				items.filter(
					(file) =>
						file.parentId === items.find((entry) => entry.id === id)?.parentId
				),
				id
			),
	};
	const path = finderPath(items, selectedFile?.id ?? location);
	const sidebarIds = new Set(
		groups.flatMap((group) => group.items).map((entry) => entry.id)
	);
	const sidebarLocation =
		[...finderPath(items, location)]
			.reverse()
			.find((file) => sidebarIds.has(file.id))?.id ?? location;
	const actions: MacMenuEntry[] = [
		{
			disabled: !selectedFile || (selectedFile.kind !== "folder" && !onOpen),
			id: "open",
			label: "Open",
		},
		{
			disabled: !canCreate,
			id: "new-folder",
			label: "New Folder",
			shortcut: "⇧⌘N",
		},
		{ disabled: !canRename, id: "rename", label: "Rename" },
		{
			disabled: !visible.length,
			id: "select-all",
			label: "Select All",
			separatorBefore: true,
			shortcut: "⌘A",
		},
	];

	return {
		actions,
		activate,
		activeTab,
		allowedViews,
		canCreate,
		changeView,
		collections,
		command,
		commit,
		create,
		fileProps,
		groupBy,
		groups,
		history,
		items,
		key,
		label,
		location,
		navigate,
		onCreateFolder,
		open,
		path,
		physical,
		props,
		query,
		renamingId,
		root,
		rootId,
		search,
		select,
		selectedFile,
		setActiveTab,
		setRenamingId,
		setTabs,
		showSidebar,
		showTabs,
		showToolbar,
		sidebarLocation,
		tab,
		tabs,
		toolbarDisabled,
		tree,
		updateTab,
		visible,
	};
}

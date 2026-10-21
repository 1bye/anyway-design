/** biome-ignore-all lint/performance/noJsxPropsBind: Local Finder example interactions. */
import { MacFileColumns } from "@anyway-design/macos/file-columns";
import {
	MacFileGallery,
	type MacFileGalleryItem,
} from "@anyway-design/macos/file-gallery";
import type { MacFileGroupBy } from "@anyway-design/macos/file-groups";
import { MacFileList } from "@anyway-design/macos/file-list";
import {
	fileNewFolderError,
	fileNewFolderName,
} from "@anyway-design/macos/file-new-folder";
import { MacFileGrid } from "@anyway-design/macos/files";
import { MacTabs } from "@anyway-design/macos/tabs";
import { MacWindow, type MacWindowProps } from "@anyway-design/macos/window";
import { WindowSidebar } from "@anyway-design/macos/window-sidebar";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import {
	type KeyboardEvent,
	type Ref,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { createFinderFiles } from "./finder-browser-data";
import {
	createFinderTab,
	FINDER_VIRTUAL_LOCATIONS,
	type FinderFile,
	type FinderTab,
	type FinderView,
	finderColumnItems,
	finderGroupLabel,
	finderLocation,
	finderLocationFiles,
	finderPath,
	finderShortcut,
	navigateFinderTab,
	selectFinderColumn,
	stepFinderHistory,
} from "./finder-browser-model";
import { FinderNavigation, FinderToolbar } from "./finder-toolbar";
import { PLAYGROUND_SIDEBAR } from "./playground-data";

export interface FinderHandle {
	command: (id: string) => void;
	navigate: (id: string) => void;
}
interface FinderExampleProps
	extends Omit<
		MacWindowProps,
		"children" | "sidebar" | "toolbar" | "toolbarLeading" | "footer"
	> {
	focus?: "toolbar" | "sidebar";
	onEvent: (message: string) => void;
	ref?: Ref<FinderHandle>;
	showSidebar?: boolean;
	showToolbar?: boolean;
	toolbarDisabled?: boolean;
}

function finderGalleryItem(file: MacFileGalleryItem): MacFileGalleryItem {
	if (file.thumbnail) {
		return { ...file, preview: { src: file.thumbnail } };
	}
	if (file.kind === "folder") {
		return file;
	}
	return {
		...file,
		preview: {
			text: `${file.name}\n\nA sample document for the component playground.`,
		},
	};
}

/** A single in-memory Finder for the window, desktop, and cropped component studies. */
export function PlaygroundFinder({
	focus,
	onEvent,
	ref,
	showSidebar = true,
	showToolbar = true,
	toolbarDisabled = false,
	title = "Documents",
	...props
}: FinderExampleProps) {
	const [now] = useState(Date.now);
	const [items, setItems] = useState(() => createFinderFiles(now));
	const [tabs, setTabs] = useState(() => [
		{ ...createFinderTab("documents", "documents"), selected: ["brief"] },
		createFinderTab("home", "home"),
	]);
	const [activeTab, setActiveTab] = useState("documents");
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const sequence = useRef(0);
	const root = useRef<HTMLDivElement>(null);
	const tab = tabs.find((entry) => entry.id === activeTab) ?? tabs[0];
	const location = finderLocation(tab);
	const label = (id: string): string => {
		const name = items.find((file) => file.id === id)?.name;
		if (id === "documents" && name === "Documents") {
			return title;
		}
		return (
			name ??
			PLAYGROUND_SIDEBAR.flatMap((group) => group.items).find(
				(entry) => entry.id === id
			)?.label ??
			"Home"
		);
	};
	const updateTab = useCallback(
		(patch: Partial<FinderTab>) => {
			setTabs((entries) =>
				entries.map((entry) =>
					entry.id === activeTab ? { ...entry, ...patch } : entry
				)
			);
		},
		[activeTab]
	);
	const navigate = (id: string) => {
		if (
			!(
				FINDER_VIRTUAL_LOCATIONS.has(id) ||
				items.some(
					(file) => file.id === id && file.kind === "folder" && !file.disabled
				)
			)
		) {
			return;
		}
		setTabs((entries) =>
			entries.map((entry) =>
				entry.id === activeTab ? navigateFinderTab(entry, id) : entry
			)
		);
		setRenamingId(null);
		onEvent(`onNavigate → ${label(id)}`);
	};
	const history = (step: number) => {
		const next = stepFinderHistory(tab, step);
		if (next === tab) {
			return;
		}
		setTabs((entries) =>
			entries.map((entry) =>
				entry.id === activeTab ? stepFinderHistory(entry, step) : entry
			)
		);
		setRenamingId(null);
		onEvent(`onNavigate → ${label(finderLocation(next))}`);
	};
	const visible = useMemo(
		() => finderLocationFiles(items, location, tab.query),
		[items, location, tab.query]
	);
	const tree = useMemo(() => {
		const source =
			tab.view === "columns" && tab.columnRoot && !tab.query.trim()
				? finderLocationFiles(items, tab.columnRoot)
				: visible;
		return finderColumnItems(items, source, tab, now);
	}, [items, visible, tab, now]);
	const groupBy: MacFileGroupBy | undefined = useMemo(
		() =>
			tab.group === "none"
				? undefined
				: (file) => finderGroupLabel(file, tab.group, now),
		[tab.group, now]
	);
	const select = useCallback(
		(selected: string[]) => updateTab({ selected }),
		[updateTab]
	);
	const query = (value: string) => {
		const ids = new Set(
			finderLocationFiles(items, location, value).map((file) => file.id)
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
				".finder-toolbar-search input"
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
	const changeView = (view: FinderView) => {
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
			FINDER_VIRTUAL_LOCATIONS.has(parentId) ||
			!items.some((file) => file.id === parentId && file.kind === "folder")
		) {
			onEvent("Choose a folder before creating a new folder.");
			return;
		}
		const folder: FinderFile = {
			id: crypto.randomUUID(),
			kind: "folder",
			modifiedAt: Date.now(),
			modifiedLabel: "Just now",
			name: fileNewFolderName(
				items.filter((file) => file.parentId === parentId)
			),
			parentId,
		};
		setItems((files) => [...files, folder]);
		updateTab({
			column: tab.view === "columns" ? folder.id : undefined,
			query: "",
			searchOpen: false,
			selected: [folder.id],
			view: tab.view === "gallery" ? "icons" : tab.view,
		});
		setRenamingId(folder.id);
	};
	const open = (id: string) => {
		const file = items.find((entry) => entry.id === id);
		if (file?.kind === "folder") {
			navigate(id);
		} else {
			onEvent(`onOpen → ${file?.name ?? id}`);
		}
	};
	const command = (id: string) => {
		if (id === "new-folder") {
			create();
		} else if (id === "select-all") {
			select(visible.filter((file) => !file.disabled).map((file) => file.id));
		} else if (["icons", "list", "columns", "gallery"].includes(id)) {
			changeView(id as FinderView);
		} else if (id === "rename" && tab.selected.length === 1) {
			setRenamingId(tab.selected[0]);
		} else if (id === "open" && tab.selected.length === 1) {
			open(tab.selected[0]);
		}
		onEvent(`onAction → ${id}`);
	};
	useImperativeHandle(ref, () => ({ command, navigate }));
	const key = (event: KeyboardEvent<HTMLDivElement>) => {
		if (focus || toolbarDisabled || event.nativeEvent.isComposing) {
			return;
		}
		const shortcut = finderShortcut(event);
		if (!shortcut) {
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
		onNewFolder: () => create(),
		onOpen: open,
		onRename: (id: string, name: string) =>
			setItems((files) =>
				files.map((file) => (file.id === id ? { ...file, name } : file))
			),
		onRenamingChange: setRenamingId,
		onSelectionChange: select,
		renamingId,
		selectedIds: tab.selected,
		showExtensions: false,
		validateRename: (id: string, name: string) =>
			fileNewFolderError(
				name,
				items.filter(
					(file) =>
						file.parentId === items.find((entry) => entry.id === id)?.parentId
				),
				id
			),
	};
	let fileView = <MacFileGrid {...fileProps} />;
	if (tab.view === "list") {
		fileView = (
			<MacFileList
				{...fileProps}
				minRows={14}
				onSortChange={(sort) => {
					updateTab({ sort });
					onEvent(`onSortChange → ${sort.column} ${sort.direction}`);
				}}
				sort={tab.sort}
			/>
		);
	}
	if (tab.view === "columns") {
		fileView = (
			<MacFileColumns
				{...fileProps}
				onNewFolder={(id) => create(id ?? location)}
				onValueChange={(column, selected) =>
					setTabs((entries) =>
						entries.map((entry) =>
							entry.id === activeTab
								? selectFinderColumn(
										entry,
										items.find((file) => file.id === column),
										selected
									)
								: entry
						)
					)
				}
				sort={tab.sort}
				value={tab.column}
			/>
		);
	}
	if (tab.view === "gallery") {
		const gallery = tree.map(finderGalleryItem);
		fileView = (
			<MacFileGallery
				active={props.active}
				groupBy={groupBy}
				items={gallery}
				onOpen={open}
				onSelectionChange={select}
				selectedIds={tab.selected}
			/>
		);
	}
	const physical = !FINDER_VIRTUAL_LOCATIONS.has(location);
	const selectedFile =
		tab.selected.length === 1
			? items.find((file) => file.id === tab.selected[0])
			: undefined;
	const path = finderPath(items, selectedFile?.id ?? location);
	const sidebarLocation =
		finderPath(items, location).find((file) => file.parentId === "home")?.id ??
		location;
	return (
		<div className="pg-finder-window" onKeyDownCapture={key} ref={root}>
			<MacWindow
				{...props}
				footer={
					<FinderFooter
						count={visible.length}
						hidden={focus !== undefined}
						label={label}
						location={location}
						navigate={navigate}
						path={path}
						query={tab.query}
						selectedCount={tab.selected.length}
					/>
				}
				sidebar={
					showSidebar ? (
						<div
							aria-hidden={focus === "toolbar" || undefined}
							inert={focus === "toolbar"}
						>
							<WindowSidebar
								groups={PLAYGROUND_SIDEBAR}
								label="Finder sidebar"
								onSelect={navigate}
								selected={sidebarLocation}
							/>
						</div>
					) : undefined
				}
				title={label(location)}
				toolbar={
					showToolbar ? (
						<div
							aria-hidden={focus === "sidebar" || undefined}
							inert={focus === "sidebar"}
							style={{ display: "contents" }}
						>
							<FinderToolbar
								disabled={toolbarDisabled}
								filename={selectedFile?.name ?? "selection"}
								group={tab.group}
								onAction={command}
								onGroupChange={(group) => updateTab({ group })}
								onSortChange={(sort) => updateTab({ sort })}
								onViewChange={changeView}
								search={{
									label: `Search ${label(location)}`,
									onOpenChange: search,
									onValueChange: query,
									open: tab.searchOpen,
									value: tab.query,
								}}
								sort={tab.sort}
								view={tab.view}
							/>
						</div>
					) : undefined
				}
				toolbarLeading={
					showToolbar ? (
						<div
							aria-hidden={focus === "sidebar" || undefined}
							inert={focus === "sidebar"}
						>
							<FinderNavigation
								backDisabled={toolbarDisabled || tab.index === 0}
								forwardDisabled={
									toolbarDisabled || tab.index === tab.history.length - 1
								}
								onBack={() => history(-1)}
								onForward={() => history(1)}
							/>
						</div>
					) : undefined
				}
				variant="finder"
			>
				<div
					aria-hidden={focus !== undefined || undefined}
					className="pg-finder-tabs"
					inert={focus !== undefined}
				>
					<MacTabs
						label="Finder tabs"
						onAdd={() => {
							sequence.current += 1;
							const id = `finder-tab-${sequence.current}`;
							setTabs((entries) => [
								...entries,
								createFinderTab(id, physical ? location : "documents"),
							]);
							setActiveTab(id);
							setRenamingId(null);
						}}
						onClose={(id) => {
							const remaining = tabs.filter((entry) => entry.id !== id);
							if (!remaining.length) {
								props.onClose?.();
								return;
							}
							setTabs(remaining);
							if (activeTab === id) {
								setActiveTab(remaining[0].id);
							}
							setRenamingId(null);
						}}
						onReorder={(ids) =>
							setTabs((entries) =>
								ids.flatMap((id) => entries.filter((entry) => entry.id === id))
							)
						}
						onValueChange={(id) => {
							setActiveTab(id);
							setRenamingId(null);
						}}
						tabs={tabs.map((entry) => ({
							content:
								visible.length || (tab.view === "columns" && tree.length) ? (
									fileView
								) : (
									<div className="finder-empty" role="status">
										<WindowSymbol
											name={tab.query.trim() ? "search" : "open"}
											size={36}
										/>
										<strong>
											{tab.query.trim() ? "No results" : "This folder is empty"}
										</strong>
										<span>
											{tab.query.trim()
												? "Try a different name or tag."
												: "Create a folder with ⇧⌘N."}
										</span>
										{physical && !tab.query.trim() ? (
											<button onClick={() => create()} type="button">
												New Folder
											</button>
										) : null}
									</div>
								),
							id: entry.id,
							label: label(finderLocation(entry)),
						}))}
						value={activeTab}
					/>
				</div>
			</MacWindow>
		</div>
	);
}

function FinderFooter({
	hidden,
	path,
	location,
	label,
	navigate,
	count,
	query,
	selectedCount,
}: {
	hidden: boolean;
	path: FinderFile[];
	location: string;
	label: (id: string) => string;
	navigate: (id: string) => void;
	count: number;
	query: string;
	selectedCount: number;
}) {
	return (
		<div
			aria-hidden={hidden || undefined}
			className="finder-footer"
			inert={hidden}
		>
			<nav aria-label="Finder path" className="finder-path-bar">
				{path.length ? (
					path.map((file, index) => (
						<span className="finder-path-part" key={file.id}>
							{index > 0 ? (
								<WindowSymbol name="chevron-right" size={8} />
							) : null}
							{file.kind === "folder" ? (
								<button
									aria-current={file.id === location ? "location" : undefined}
									onClick={() => navigate(file.id)}
									type="button"
								>
									<WindowSymbol name="open" size={13} />
									{label(file.id)}
								</button>
							) : (
								<span>{file.name}</span>
							)}
						</span>
					))
				) : (
					<span>{label(location)}</span>
				)}
			</nav>
			<span aria-live="polite">
				{count} {count === 1 ? "item" : "items"}
				{query.trim() ? ` matching “${query.trim()}”` : ""}
				{selectedCount ? ` · ${selectedCount} selected` : ""}
			</span>
		</div>
	);
}

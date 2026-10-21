/** biome-ignore-all lint/performance/noJsxPropsBind: Local Finder example interactions. */
import { MacFileColumns } from "@anyway-design/macos/file-columns";
import { MacFileGallery } from "@anyway-design/macos/file-gallery";
import {
	MacFileList,
	type MacFileListItem,
} from "@anyway-design/macos/file-list";
import { MacFileGrid } from "@anyway-design/macos/files";
import { MacTabs } from "@anyway-design/macos/tabs";
import { MacWindow, type MacWindowProps } from "@anyway-design/macos/window";
import { WindowSidebar } from "@anyway-design/macos/window-sidebar";
import { useRef, useState } from "react";
import {
	FinderNavigation,
	FinderToolbar,
	type FinderView,
} from "./finder-toolbar";
import {
	PLAYGROUND_FILES,
	PLAYGROUND_GALLERY,
	PLAYGROUND_SIDEBAR,
} from "./playground-data";
import { useFinderFolderCreation } from "./use-finder-folder-creation";

interface FinderExampleProps
	extends Omit<
		MacWindowProps,
		"children" | "sidebar" | "toolbar" | "toolbarLeading" | "footer"
	> {
	focus?: "toolbar" | "sidebar";
	onEvent: (message: string) => void;
	showSidebar?: boolean;
	showToolbar?: boolean;
	toolbarDisabled?: boolean;
}

/** The same Finder anatomy for the full window and its cropped component studies. */
export function PlaygroundFinder({
	focus,
	onEvent,
	showSidebar = true,
	showToolbar = true,
	toolbarDisabled = false,
	title,
	...props
}: FinderExampleProps) {
	const [tabs, setTabs] = useState([
		{ id: "documents", location: "documents" },
		{ id: "home", location: "home" },
	]);
	const [tab, setTab] = useState("documents");
	const sequence = useRef(0);
	const [view, setView] = useState<FinderView>("icons");
	const [items, setItems] = useState<MacFileListItem[]>(PLAYGROUND_FILES);
	const [selected, setSelected] = useState<string[]>(["brief"]);
	const [column, setColumn] = useState<string>();
	const creation = useFinderFolderCreation(items, setItems, setSelected);
	const location =
		tabs.find((item) => item.id === tab)?.location ?? "documents";
	const label = (id: string) =>
		id === "documents"
			? title
			: (PLAYGROUND_SIDEBAR.flatMap((group) => group.items).find(
					(item) => item.id === id
				)?.label ?? "Home");
	const navigate = (id: string) => {
		setTabs(
			tabs.map((item) => (item.id === tab ? { ...item, location: id } : item))
		);
		setSelected([]);
		onEvent(`onSelect → ${id}`);
	};
	let visible = items;
	if (location === "home" || location === "desktop") {
		visible = items.filter((file) => file.kind === "folder");
	}
	if (location === "downloads") {
		visible = items.filter(
			(file) => file.kind === "archive" || file.kind === "image"
		);
	}
	if (location === "shared" || location === "work") {
		visible = items.filter((file) => file.tags?.length);
	}
	const fileProps = {
		active: props.active,
		items: visible,
		label: `${label(location)} files`,
		onNewFolder: creation.create,
		onOpen: (id: string) => onEvent(`onOpen → ${id}`),
		onRename: creation.rename,
		onRenamingChange: creation.setRenamingId,
		onSelectionChange: (ids: string[]) => {
			setSelected(ids);
			onEvent(`onSelectionChange → ${JSON.stringify(ids)}`);
		},
		renamingId: creation.renamingId,
		selectedIds: selected,
		validateRename: creation.validate,
	};
	let files = <MacFileGrid {...fileProps} />;
	if (view === "list") {
		files = <MacFileList {...fileProps} minRows={14} resizable />;
	}
	if (view === "columns") {
		files = (
			<MacFileColumns {...fileProps} onValueChange={setColumn} value={column} />
		);
	}
	if (view === "gallery") {
		files = (
			<MacFileGallery
				active={props.active}
				items={PLAYGROUND_GALLERY.filter((file) =>
					visible.some((item) => item.id === file.id)
				)}
				onSelectionChange={fileProps.onSelectionChange}
				selectedIds={selected}
			/>
		);
	}
	const command = (id: string) => {
		if (id === "rename" && selected.length === 1) {
			creation.setRenamingId(selected[0]);
		}
		onEvent(`onAction → ${id}`);
	};
	return (
		<div className="pg-finder-window">
			<MacWindow
				{...props}
				footer={`${visible.length} ${visible.length === 1 ? "item" : "items"}`}
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
								selected={location}
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
								filename={
									items.find((item) => item.id === selected[0])?.name ??
									"selection"
								}
								onAction={command}
								onViewChange={setView}
								view={view}
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
								backDisabled={toolbarDisabled || location === "documents"}
								onBack={() => navigate("documents")}
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
							setTabs([...tabs, { id, location: "documents" }]);
							setTab(id);
							onEvent("onAdd → Finder tab");
						}}
						onClose={(id) => {
							const remaining = tabs.filter((item) => item.id !== id);
							if (!remaining.length) {
								props.onClose?.();
								return;
							}
							setTabs(remaining);
							if (tab === id) {
								setTab(remaining[0].id);
							}
						}}
						onReorder={(ids) =>
							setTabs(
								ids.flatMap((id) => tabs.filter((item) => item.id === id))
							)
						}
						onValueChange={(id) => {
							setTab(id);
							setSelected([]);
							onEvent(`onValueChange → ${id}`);
						}}
						tabs={tabs.map((item) => ({
							content: files,
							id: item.id,
							label: label(item.location),
						}))}
						value={tab}
					/>
				</div>
			</MacWindow>
		</div>
	);
}

/** biome-ignore-all lint/performance/noJsxPropsBind: Finder chrome delegates to its shared controller. */

import type { Ref } from "react";
import type { MacGetInfoProps } from "./file-info";
import type { MacFileRenameProps } from "./file-rename";
import type {
	MacFinderActionContext,
	MacFinderFileActions,
} from "./finder-actions";
import { FinderContent } from "./finder-content";
import { FinderFooter } from "./finder-footer";
import {
	createFinderTab,
	finderLocation,
	type MacFinderCollection,
	type MacFinderFile,
	type MacFinderView,
	resolveFinderTab,
} from "./finder-model";
import { FinderOverlays } from "./finder-overlays";
import { MacFinderNavigation, MacFinderToolbar } from "./finder-toolbar";
import { MacTabs } from "./tabs";
import { useFinder } from "./use-finder";
import { MacWindow, type MacWindowProps } from "./window";
import { WindowSidebar, type WindowSidebarGroup } from "./window-sidebar";
export interface MacFinderHandle {
	command: (id: string) => void;
	navigate: (id: string) => void;
}
export type {
	MacFinderActionContext,
	MacFinderFileActions,
} from "./finder-actions";
export type {
	MacFinderCollection,
	MacFinderFile,
	MacFinderGroup,
	MacFinderView,
} from "./finder-model";

export interface MacFinderInitialTab {
	id: string;
	location: string;
	selectedIds?: readonly string[];
	view?: MacFinderView;
}

export interface MacFinderProps
	extends Omit<
		MacWindowProps,
		| "children"
		| "sidebar"
		| "toolbar"
		| "toolbarLeading"
		| "footer"
		| "title"
		| "variant"
	> {
	collections?: readonly MacFinderCollection[];
	defaultLocation?: string;
	defaultTabs?: readonly MacFinderInitialTab[];
	defaultView?: MacFinderView;
	fileActions?: MacFinderFileActions;
	/** Caller-owned flat hierarchy. IDs must be unique; parentId points to a folder in this array. */
	files: readonly MacFinderFile[];
	onAction?: (
		id: string,
		selectedIds: readonly string[],
		context: MacFinderActionContext
	) => void;
	/** Append this proposed folder to files. Omit to disable folder creation. */
	onCreateFolder?: (folder: MacFinderFile) => void;
	onInfoChange?: MacGetInfoProps["onInfoChange"];
	onLocationChange?: (id: string) => void;
	onOpen?: (id: string) => void;
	/** Update files with the renamed item. Omit to disable renaming. */
	onRename?: (id: string, name: string) => void;
	onSelectionChange?: (ids: string[]) => void;
	onViewChange?: (view: MacFinderView) => void;
	ref?: Ref<MacFinderHandle>;
	/** Default location and fallback when a location is removed. Include this folder in files. */
	rootId: string;
	showExtensions?: boolean;
	showSidebar?: boolean;
	showTabs?: boolean;
	showToolbar?: boolean;
	sidebarGroups?: WindowSidebarGroup[];
	toolbarDisabled?: boolean;
	validateRename?: MacFileRenameProps["validateRename"];
	views?: readonly MacFinderView[];
}

/** A Tahoe Finder window with caller-owned files and independent navigation in each tab. */
export function MacFinder(props: MacFinderProps) {
	const browser = useFinder(props);
	const {
		activate,
		root,
		key,
		groups,
		label,
		location,
		sidebarLocation,
		showSidebar,
		showToolbar,
		showTabs,
		toolbarDisabled,
		actions,
		allowedViews,
		tab,
		tabs,
		activeTab,
		setTabs,
		setActiveTab,
		setRenamingId,
		navigate,
		history,
		command,
		changeView,
		updateTab,
		search,
		query,
		visible,
		path,
		physical,
		rootId,
		items,
		collections,
	} = browser;
	const content = <FinderContent browser={browser} />;
	return (
		<div className="mac-finder-window" onKeyDownCapture={key} ref={root}>
			<MacWindow
				{...browser.props}
				footer={
					<FinderFooter
						count={visible.length}
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
						<WindowSidebar
							groups={groups}
							label="Finder sidebar"
							onSelect={navigate}
							selected={sidebarLocation}
						/>
					) : undefined
				}
				title={label(location)}
				toolbar={
					showToolbar ? (
						<MacFinderToolbar
							actions={actions}
							disabled={toolbarDisabled}
							fileActionsDisabled={!(props.onAction && tab.selected.length)}
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
							views={allowedViews}
						/>
					) : undefined
				}
				toolbarLeading={
					showToolbar ? (
						<MacFinderNavigation
							backDisabled={toolbarDisabled || tab.index === 0}
							forwardDisabled={
								toolbarDisabled || tab.index === tab.history.length - 1
							}
							onBack={() => history(-1)}
							onForward={() => history(1)}
						/>
					) : undefined
				}
				variant="finder"
			>
				<div className="mac-finder-tabs">
					{showTabs ? (
						<MacTabs
							label="Finder tabs"
							onAdd={() => {
								const id = crypto.randomUUID();
								setTabs((entries) => [
									...entries,
									{
										...createFinderTab(id, physical ? location : rootId),
										group: tab.group,
										sort: tab.sort,
										view: tab.view,
									},
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
									ids.flatMap((id) =>
										entries.filter((entry) => entry.id === id)
									)
								)
							}
							onValueChange={activate}
							tabs={tabs.map((entry) => ({
								content,
								id: entry.id,
								label: label(
									finderLocation(
										resolveFinderTab(
											entry,
											items,
											collections,
											rootId,
											allowedViews
										)
									)
								),
							}))}
							value={activeTab}
						/>
					) : (
						content
					)}
				</div>
			</MacWindow>
			<FinderOverlays browser={browser} />
		</div>
	);
}

/** biome-ignore-all lint/performance/noJsxPropsBind: All file views share the same Finder state and callbacks. */
import { MacFileColumns } from "./file-columns";
import { MacFileGallery } from "./file-gallery";
import { MacFileList } from "./file-list";
import { MacFileGrid } from "./files";
import { finderActionEnabled } from "./finder-actions";
import { selectFinderColumn } from "./finder-model";
import { MacContextMenu } from "./menu";
import type { useFinder } from "./use-finder";
import { WindowSymbol } from "./window-symbol";

type FinderBrowser = ReturnType<typeof useFinder>;
export function FinderContent({ browser }: { browser: FinderBrowser }) {
	return (
		<MacContextMenu
			items={browser.fileActions.menuItems}
			onAction={browser.fileActions.contextAction}
			trigger={
				<div
					className="mac-finder-browser"
					onContextMenuCapture={browser.fileActions.contextMenu}
					tabIndex={-1}
				>
					<FinderBody browser={browser} />
				</div>
			}
		/>
	);
}
function FinderBody({ browser }: { browser: FinderBrowser }) {
	const { visible, tree, tab } = browser;
	const canCreate =
		browser.canCreate &&
		finderActionEnabled(browser.actions, "new-folder") !== false;
	if (!(visible.length || (tab.view === "columns" && tree.length))) {
		let hint = "There are no files to display.";
		if (canCreate) {
			hint = "Create a folder with ⇧⌘N.";
		}
		if (tab.query.trim()) {
			hint = "Try a different name or tag.";
		}
		return (
			<div className="mac-finder-empty" role="status">
				<WindowSymbol name={tab.query.trim() ? "search" : "open"} size={36} />
				<strong>
					{tab.query.trim() ? "No results" : "This folder is empty"}
				</strong>
				<span>{hint}</span>
				{canCreate && !tab.query.trim() ? (
					<button
						onClick={() => browser.fileActions.run("new-folder")}
						type="button"
					>
						New Folder
					</button>
				) : null}
			</div>
		);
	}
	return <FinderFiles browser={browser} />;
}
function FinderFiles({ browser }: { browser: FinderBrowser }) {
	const {
		fileProps,
		tab,
		updateTab,
		commit,
		items,
		collections,
		location,
		tree,
		groupBy,
		select,
	} = browser;
	if (tab.view === "list") {
		return (
			<MacFileList
				{...fileProps}
				minRows={14}
				onSortChange={(sort) => updateTab({ sort })}
				sort={tab.sort}
			/>
		);
	}
	if (tab.view === "columns") {
		return (
			<MacFileColumns
				{...fileProps}
				multiple
				onNewFolder={
					browser.onCreateFolder
						? (id) => browser.fileActions.run("new-folder", [], id ?? location)
						: undefined
				}
				onValueChange={(column, selected) =>
					commit(
						selectFinderColumn(
							tab,
							items.find((file) => file.id === column),
							selected,
							collections
						)
					)
				}
				sort={tab.sort}
				value={tab.column ?? tab.selected.at(-1)}
			/>
		);
	}
	if (tab.view === "gallery") {
		return (
			<MacFileGallery
				active={browser.props.active}
				groupBy={groupBy}
				items={tree}
				onGetInfo={browser.fileActions.requestInfo}
				onOpen={browser.fileActions.requestOpen}
				onQuickLook={browser.fileActions.requestPreview}
				onSelectionChange={select}
				selectedIds={tab.selected}
			/>
		);
	}
	return <MacFileGrid {...fileProps} />;
}

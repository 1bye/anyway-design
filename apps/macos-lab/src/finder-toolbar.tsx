/** biome-ignore-all lint/performance/noJsxPropsBind: Small Finder demo command handlers. */
import { MacSearchField } from "@anyway-design/macos/controls";
import type { MacFileSort } from "@anyway-design/macos/file-list";
import { MacMenuButton, type MacMenuEntry } from "@anyway-design/macos/menu";
import {
	WindowSymbol,
	type WindowSymbolName,
} from "@anyway-design/macos/window-symbol";
import {
	WindowToolbarButton,
	WindowToolbarGroup,
} from "@anyway-design/macos/window-toolbar";
import { useEffect, useRef } from "react";
import { FinderActions } from "./finder-actions";
import type { FinderGroup, FinderView } from "./finder-browser-model";

export type { FinderView } from "./finder-browser-model";

const VIEWS: { id: FinderView; label: string; symbol: WindowSymbolName }[] = [
	{ id: "icons", label: "as Icons", symbol: "icon-view" },
	{ id: "list", label: "as List", symbol: "list-view" },
	{ id: "columns", label: "as Columns", symbol: "column-view" },
	{ id: "gallery", label: "as Gallery", symbol: "photos" },
];
const GROUPS: MacMenuEntry[] = [
	{ id: "group-none", label: "None" },
	{ id: "group-kind", label: "Kind", separatorBefore: true },
	{ id: "group-date", label: "Date Modified" },
	{ id: "group-size", label: "Size" },
	{ id: "group-tags", label: "Tags" },
];
const SORT_COLUMNS: {
	id: string;
	label: string;
	column: MacFileSort["column"];
}[] = [
	{ column: "name", id: "sort-name", label: "Name" },
	{ column: "kind", id: "sort-kind", label: "Kind" },
	{ column: "modified", id: "sort-modified", label: "Date Modified" },
	{ column: "size", id: "sort-size", label: "Size" },
];
export function FinderToolbar({
	disabled = false,
	filename = "Project brief.pdf",
	onAction,
	onOpenChange,
	onViewChange,
	view = "icons",
	group = "none",
	onGroupChange,
	sort = { column: "name", direction: "ascending" },
	onSortChange,
	search,
}: {
	disabled?: boolean;
	filename?: string;
	onAction: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
	onViewChange?: (view: FinderView) => void;
	view?: FinderView;
	group?: FinderGroup;
	onGroupChange?: (group: FinderGroup) => void;
	sort?: MacFileSort;
	onSortChange?: (sort: MacFileSort) => void;
	search?: {
		open: boolean;
		value: string;
		label: string;
		onOpenChange: (open: boolean) => void;
		onValueChange: (value: string) => void;
	};
}) {
	const field = useRef<HTMLInputElement>(null);
	const searchButton = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (!search?.open) {
			return;
		}
		field.current?.focus();
		return () => searchButton.current?.focus();
	}, [search?.open]);
	const arrange = (id: string) => {
		const groupItem = GROUPS.find((item) => item.id === id);
		if (groupItem) {
			onGroupChange?.(id.slice(6) as FinderGroup);
		}
		const column = SORT_COLUMNS.find((item) => item.id === id);
		if (column) {
			onSortChange?.({ ...sort, column: column.column });
		}
		if (id === "sort-ascending" || id === "sort-descending") {
			onSortChange?.({
				...sort,
				direction: id === "sort-ascending" ? "ascending" : "descending",
			});
		}
		onAction(id);
	};
	if (search?.open) {
		return (
			<div className="finder-toolbar-search">
				<MacSearchField
					aria-label={search.label}
					disabled={disabled}
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							event.preventDefault();
							event.stopPropagation();
							search.onOpenChange(false);
						}
					}}
					onValueChange={search.onValueChange}
					placeholder={search.label}
					ref={field}
					value={search.value}
				/>
				<button
					disabled={disabled}
					onClick={() => search.onOpenChange(false)}
					type="button"
				>
					Cancel
				</button>
			</div>
		);
	}

	const current = VIEWS.find((item) => item.id === view) ?? VIEWS[0];
	return (
		<>
			<WindowToolbarGroup label="View">
				<MacMenuButton
					items={VIEWS.map((item) => ({
						checked: item.id === view,
						closeOnClick: true,
						id: item.id,
						label: item.label,
						shortcut: `⌘${VIEWS.indexOf(item) + 1}`,
					}))}
					onAction={(id) => {
						const next = VIEWS.find((item) => item.id === id);
						if (next) {
							onViewChange?.(next.id);
							onAction(`view-${id}`);
						}
					}}
					onOpenChange={onOpenChange}
					trigger={
						<WindowToolbarButton disabled={disabled} label="Change view">
							<WindowSymbol name={current.symbol} />
							<WindowSymbol
								className="mac-toolbar-indicator"
								name="chevron-up-down"
							/>
						</WindowToolbarButton>
					}
				/>
			</WindowToolbarGroup>
			<WindowToolbarGroup label="Arrange">
				<MacMenuButton
					items={[
						...GROUPS.map((item) => ({
							...item,
							checked: item.id === `group-${group}`,
							closeOnClick: true,
						})),
						{
							id: "sort-by",
							items: [
								...SORT_COLUMNS.map((item) => ({
									checked: item.column === sort.column,
									closeOnClick: true,
									id: item.id,
									label: item.label,
								})),
								{
									checked: sort.direction === "ascending",
									closeOnClick: true,
									id: "sort-ascending",
									label: "Ascending",
									separatorBefore: true,
								},
								{
									checked: sort.direction === "descending",
									closeOnClick: true,
									id: "sort-descending",
									label: "Descending",
								},
							],
							label: "Sort By",
							separatorBefore: true,
						},
					]}
					onAction={arrange}
					onOpenChange={onOpenChange}
					trigger={
						<WindowToolbarButton disabled={disabled} label="Group items">
							<WindowSymbol name="group" />
							<WindowSymbol
								className="mac-toolbar-indicator"
								name="chevron-down"
							/>
						</WindowToolbarButton>
					}
				/>
			</WindowToolbarGroup>
			<WindowToolbarGroup label="File actions">
				<WindowToolbarButton
					disabled={disabled}
					label="Share"
					onClick={() => onAction("share")}
				>
					<WindowSymbol name="share" />
				</WindowToolbarButton>
				<WindowToolbarButton
					disabled={disabled}
					label="Tags"
					onClick={() => onAction("tags")}
				>
					<WindowSymbol name="tag" />
				</WindowToolbarButton>
				<FinderActions
					disabled={disabled}
					filename={filename}
					onAction={onAction}
					onOpenChange={onOpenChange}
				/>
			</WindowToolbarGroup>
			<WindowToolbarGroup label="Search">
				<WindowToolbarButton
					disabled={disabled}
					label="Search"
					onClick={() => {
						search?.onOpenChange(true);
						onAction("search");
					}}
					ref={searchButton}
				>
					<WindowSymbol name="search" />
				</WindowToolbarButton>
			</WindowToolbarGroup>
		</>
	);
}

export function FinderNavigation({
	backDisabled = false,
	onBack,
	onForward,
	forwardDisabled = true,
}: {
	backDisabled?: boolean;
	forwardDisabled?: boolean;
	onBack: () => void;
	onForward?: () => void;
}) {
	return (
		<WindowToolbarGroup label="Navigation">
			<WindowToolbarButton
				className="mac-toolbar-back"
				disabled={backDisabled}
				label="Back"
				onClick={onBack}
			>
				<WindowSymbol name="chevron-left" />
			</WindowToolbarButton>
			<WindowToolbarButton
				disabled={forwardDisabled}
				label="Forward"
				onClick={onForward}
			>
				<WindowSymbol name="chevron-right" />
			</WindowToolbarButton>
		</WindowToolbarGroup>
	);
}

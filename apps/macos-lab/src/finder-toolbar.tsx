/** biome-ignore-all lint/performance/noJsxPropsBind: Small Finder demo command handlers. */
import { MacMenuButton, type MacMenuEntry } from "@anyway-design/macos/menu";
import {
	WindowSymbol,
	type WindowSymbolName,
} from "@anyway-design/macos/window-symbol";
import {
	WindowToolbarButton,
	WindowToolbarGroup,
} from "@anyway-design/macos/window-toolbar";
import { FinderActions } from "./finder-actions";

export type FinderView = "icons" | "list" | "columns" | "gallery";
const VIEWS: { id: FinderView; label: string; symbol: WindowSymbolName }[] = [
	{ id: "icons", label: "as Icons", symbol: "icon-view" },
	{ id: "list", label: "as List", symbol: "list-view" },
	{ id: "columns", label: "as Columns", symbol: "column-view" },
	{ id: "gallery", label: "as Gallery", symbol: "photos" },
];
const GROUPS: MacMenuEntry[] = [
	{ checked: true, id: "group-none", label: "None" },
	{ id: "group-kind", label: "Kind", separatorBefore: true },
	{ id: "group-date", label: "Date Modified" },
	{ id: "group-size", label: "Size" },
	{ id: "group-tags", label: "Tags" },
];
export function FinderToolbar({
	disabled = false,
	filename = "Project brief.pdf",
	onAction,
	onOpenChange,
	onViewChange,
	view = "icons",
}: {
	disabled?: boolean;
	filename?: string;
	onAction: (id: string) => void;
	onOpenChange?: (open: boolean) => void;
	onViewChange?: (view: FinderView) => void;
	view?: FinderView;
}) {
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
					items={GROUPS}
					onAction={onAction}
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
					onClick={() => onAction("search")}
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

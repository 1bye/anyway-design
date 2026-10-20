import {
	type ChangeEvent,
	type FocusEvent,
	type KeyboardEvent,
	useCallback,
	useId,
} from "react";
import { MacButton, MacSearchField, MacTextField } from "./controls";
import type {
	MacFileDialogDirectory,
	MacFileDialogType,
	MacFileDialogView,
} from "./file-dialog-model";
import { MacFileIcon } from "./file-icons";
import type { MacFileSort } from "./file-list";
import { fileRenameSelection } from "./file-rename";
import { MacMenuButton } from "./menu";
import { WindowSymbol } from "./window-symbol";

function selectBasename(event: FocusEvent<HTMLInputElement>) {
	const input = event.currentTarget;
	input.setSelectionRange(0, fileRenameSelection(input.value));
}

export function FileDialogFields({
	name,
	tags,
	showTags,
	error,
	errorId,
	validation,
	onNameChange,
	onTagsChange,
	onValidate,
}: {
	name: string;
	tags: string;
	showTags: boolean;
	error: string;
	errorId: string;
	validation?: string;
	onNameChange: (value: string) => void;
	onTagsChange: (value: string) => void;
	onValidate: (error: string) => void;
}) {
	const nameId = useId();
	const tagsId = useId();
	const changeName = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => onNameChange(event.target.value),
		[onNameChange]
	);
	const changeTags = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => onTagsChange(event.target.value),
		[onTagsChange]
	);
	const validate = useCallback(
		() => onValidate(validation ?? ""),
		[validation, onValidate]
	);
	return (
		<div className="mac-file-dialog-fields">
			<label htmlFor={nameId}>
				<span>Save As:</span>
				<MacTextField
					aria-describedby={error ? errorId : undefined}
					aria-invalid={Boolean(error)}
					data-filename
					id={nameId}
					onBlur={validate}
					onChange={changeName}
					onFocus={selectBasename}
					value={name}
				/>
			</label>
			{showTags ? (
				<label htmlFor={tagsId}>
					<span>Tags:</span>
					<MacTextField id={tagsId} onChange={changeTags} value={tags} />
				</label>
			) : null}
		</div>
	);
}

interface FileDialogToolbarProps {
	backDisabled: boolean;
	canToggleSidebar: boolean;
	directoryId: string;
	expanded: boolean;
	forwardDisabled: boolean;
	locations: readonly MacFileDialogDirectory[];
	onBack: () => void;
	onExpand: () => void;
	onForward: () => void;
	onNavigate: (id: string) => void;
	onQueryChange: (value: string) => void;
	onSortChange: (sort: MacFileSort) => void;
	onToggleSidebar: () => void;
	onViewChange: (view: MacFileDialogView) => void;
	query: string;
	saveMode: boolean;
	showBrowser: boolean;
	sidebar: boolean;
	sort: MacFileSort;
	view: MacFileDialogView;
}
const SORT_COLUMNS = ["name", "kind", "size", "modified"] as const;
export function FileDialogToolbar({
	backDisabled,
	forwardDisabled,
	onBack,
	onForward,
	onNavigate,
	onExpand,
	onToggleSidebar,
	onQueryChange,
	onSortChange,
	onViewChange,
	query,
	sort,
	sidebar,
	canToggleSidebar,
	locations,
	directoryId,
	expanded,
	saveMode,
	showBrowser,
	view,
}: FileDialogToolbarProps) {
	const viewAction = useCallback(
		(id: string) => {
			if (id === "sidebar") {
				onToggleSidebar();
			} else if (id === "list" || id === "columns") {
				onViewChange(id);
			}
		},
		[onToggleSidebar, onViewChange]
	);
	const changeLocation = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => onNavigate(event.target.value),
		[onNavigate]
	);
	const changeSort = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const column = SORT_COLUMNS.find((value) => value === event.target.value);
			if (column) {
				onSortChange({ column, direction: "ascending" });
			}
		},
		[onSortChange]
	);
	const searchKey = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Escape" && query && !event.nativeEvent.isComposing) {
				event.preventDefault();
				event.stopPropagation();
				onQueryChange("");
			}
		},
		[query, onQueryChange]
	);
	return (
		<div className="mac-file-dialog-toolbar">
			{showBrowser ? (
				<div className="mac-file-dialog-navigation">
					<div className="mac-file-dialog-history">
						<button
							aria-label="Back"
							disabled={backDisabled}
							onClick={onBack}
							type="button"
						>
							<WindowSymbol name="chevron-left" size={14} />
						</button>
						<button
							aria-label="Forward"
							disabled={forwardDisabled}
							onClick={onForward}
							type="button"
						>
							<WindowSymbol name="chevron-right" size={14} />
						</button>
					</div>
					<MacMenuButton
						items={[
							{
								disabled: !canToggleSidebar,
								id: "sidebar",
								label: sidebar ? "Hide Sidebar" : "Show Sidebar",
							},
							{
								disabled: true,
								id: "view-label",
								label: "Show items as:",
								separatorBefore: true,
							},
							{
								checked: view === "list",
								closeOnClick: true,
								id: "list",
								label: "List",
							},
							{
								checked: view === "columns",
								closeOnClick: true,
								id: "columns",
								label: "Columns",
							},
						]}
						onAction={viewAction}
						positionerProps={{ align: "start" }}
						trigger={
							<button
								aria-label="View options"
								className="mac-file-dialog-view"
								title={`View: ${view === "list" ? "List" : "Columns"}`}
								type="button"
							>
								<WindowSymbol
									name={view === "list" ? "list-view" : "column-view"}
									size={16}
								/>
								<WindowSymbol name="chevron-down" size={10} />
							</button>
						}
					/>
					<label className="mac-file-dialog-sort">
						<WindowSymbol name="group" size={16} />
						<select
							aria-label="Sort files"
							onChange={changeSort}
							value={sort.column}
						>
							<option value="name">Name</option>
							<option value="kind">Kind</option>
							<option value="size">Size</option>
							<option value="modified">Date Added</option>
						</select>
						<WindowSymbol name="chevron-down" size={10} />
					</label>
				</div>
			) : (
				<span className="mac-file-dialog-where-label">Where:</span>
			)}
			<div className="mac-file-dialog-location">
				<MacFileIcon name="folder" />
				<select
					aria-label="Where"
					onChange={changeLocation}
					value={directoryId}
				>
					{locations.map((entry) => (
						<option key={entry.id} value={entry.id}>
							{entry.name}
						</option>
					))}
				</select>
				<WindowSymbol name="chevron-up-down" size={14} />
			</div>
			{saveMode ? (
				<button
					aria-expanded={expanded}
					aria-label={expanded ? "Show fewer options" : "Show more options"}
					className="mac-file-dialog-expand"
					onClick={onExpand}
					type="button"
				>
					<WindowSymbol name="chevron-down" size={16} />
				</button>
			) : null}
			{showBrowser ? (
				<MacSearchField
					aria-label="Search this folder"
					onKeyDown={searchKey}
					onValueChange={onQueryChange}
					value={query}
				/>
			) : null}
		</div>
	);
}

export function FileDialogFooter({
	fileTypes,
	saveMode,
	typeId,
	onTypeChange,
	error,
	errorId,
	onCancel,
	canSubmit,
}: {
	fileTypes: readonly MacFileDialogType[];
	saveMode: boolean;
	typeId: string;
	onTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
	error: string;
	errorId: string;
	onCancel: () => void;
	canSubmit: boolean;
}) {
	return (
		<footer className="mac-file-dialog-footer">
			{fileTypes.length > 1 ? (
				<label className="mac-file-dialog-type">
					{saveMode ? "File Format:" : "Enable:"}
					<select aria-label="File type" onChange={onTypeChange} value={typeId}>
						{fileTypes.map((entry) => (
							<option key={entry.id} value={entry.id}>
								{entry.label}
							</option>
						))}
					</select>
				</label>
			) : null}
			{error ? (
				<p id={errorId} role="alert">
					{error}
				</p>
			) : null}
			<div className="mac-file-dialog-actions">
				<MacButton onClick={onCancel}>Cancel</MacButton>
				<MacButton disabled={!canSubmit} type="submit" variant="primary">
					{saveMode ? "Save" : "Open"}
				</MacButton>
			</div>
		</footer>
	);
}

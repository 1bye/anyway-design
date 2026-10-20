import {
	type CSSProperties,
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useMemo,
	useRef,
	useState,
} from "react";
import { MacFileIcon } from "./file-icons";
import {
	focusFileTarget,
	isAdditiveSelection,
	requestFileOpen,
	requestFilePreview,
} from "./file-interactions";
import {
	FILE_LIST_COLUMNS,
	fileColumnWidth,
	type MacFileListColumn,
	type MacFileSort,
	sortFileList,
} from "./file-list-sort";
import type { MacFileRenameProps } from "./file-rename";
import { FileRenameField } from "./file-rename-field";
import { selectFileIds } from "./file-selection";
import { MacFileThumbnail } from "./file-thumbnail";
import type { MacFile } from "./files";
import { useFileRename } from "./use-file-rename";
import { WindowSymbol } from "./window-symbol";

export type { MacFileListColumn, MacFileSort } from "./file-list-sort";

export interface MacFileListItem extends MacFile {
	kindLabel?: string;
	modifiedAt?: number;
	modifiedLabel?: string;
	size?: number;
	sizeLabel?: string;
}

type ColumnWidths = Partial<Record<MacFileListColumn, number>>;
export interface MacFileListProps extends MacFileRenameProps {
	active?: boolean;
	className?: string;
	columns?: readonly MacFileListColumn[];
	columnWidths?: ColumnWidths;
	defaultSort?: MacFileSort;
	items: readonly MacFileListItem[];
	label?: string;
	minRows?: number;
	onColumnWidthsChange?: (widths: ColumnWidths) => void;
	onOpen?: (id: string) => void;
	onQuickLook?: (id: string) => void;
	onSelectionChange: (ids: string[]) => void;
	onSortChange?: (sort: MacFileSort) => void;
	resizable?: boolean;
	selectedIds: readonly string[];
	showExtensions?: boolean;
	sort?: MacFileSort;
	style?: CSSProperties;
}

const DEFAULT_COLUMNS: readonly MacFileListColumn[] = [
	"name",
	"modified",
	"size",
	"kind",
];
const DEFAULT_SORT: MacFileSort = { column: "name", direction: "ascending" };
const KINDS = {
	archive: "ZIP archive",
	document: "Document",
	folder: "Folder",
	image: "Image",
	pdf: "PDF Document",
	text: "Text document",
} as const;
const EXTENSION = /\.[^.]+$/;
const DATE = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short",
});
const SIZE = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

function byteLabel(bytes: number | undefined) {
	if (bytes === undefined || !Number.isFinite(bytes)) {
		return "--";
	}
	if (bytes < 1000) {
		return `${bytes} bytes`;
	}
	const unit = Math.min(3, Math.floor(Math.log10(bytes) / 3));
	return `${SIZE.format(bytes / 1000 ** unit)} ${["bytes", "KB", "MB", "GB"][unit]}`;
}

function listRow(target: EventTarget) {
	return target instanceof Element
		? target.closest<HTMLTableRowElement>("tr[data-file-id]")
		: null;
}

function enabledListRow(target: EventTarget) {
	const row = listRow(target);
	return row?.getAttribute("aria-disabled") === "true" ? null : row;
}

function FileListName({
	file,
	showExtensions,
	editor,
}: {
	file: MacFileListItem;
	showExtensions: boolean;
	editor?: ReactNode;
}) {
	const name =
		showExtensions || file.name.startsWith(".")
			? file.name
			: file.name.replace(EXTENSION, "");
	const documentThumbnail =
		file.kind === "pdf" || file.kind === "text" || file.kind === "document";
	return (
		<div className="mac-file-list-name">
			<span className="mac-file-list-disclosure">
				{file.kind === "folder" ? (
					<WindowSymbol name="chevron-right" size={8} />
				) : null}
			</span>
			<span aria-hidden="true" className="mac-file-list-icon">
				{file.thumbnail ? (
					<MacFileThumbnail
						fit={file.thumbnailFit}
						presentation={
							file.thumbnailStyle ?? (documentThumbnail ? "document" : "image")
						}
						src={file.thumbnail}
					/>
				) : (
					(file.icon ?? <MacFileIcon name={file.kind ?? "document"} />)
				)}
			</span>
			{editor ?? (
				<span className="mac-file-list-filename" title={file.name}>
					{name}
				</span>
			)}
			{file.tags?.length ? (
				<span
					aria-label={`Tags: ${file.tags.map((tag) => tag.label).join(", ")}`}
					className="mac-file-tags"
					role="img"
				>
					{file.tags.map((tag) => (
						<span
							className="mac-file-tag"
							key={tag.label}
							style={{ backgroundColor: tag.color }}
						/>
					))}
				</span>
			) : null}
		</div>
	);
}

function cellValue(file: MacFileListItem, column: MacFileListColumn) {
	if (column === "kind") {
		return file.kindLabel ?? KINDS[file.kind ?? "document"];
	}
	if (column === "size") {
		return file.sizeLabel ?? byteLabel(file.size);
	}
	if (column === "modified") {
		return (
			file.modifiedLabel ??
			(file.modifiedAt !== undefined &&
			!Number.isNaN(new Date(file.modifiedAt).getTime())
				? DATE.format(file.modifiedAt)
				: "--")
		);
	}
	return file.name;
}

interface ResizeSession {
	column: MacFileListColumn;
	scale: number;
	startX: number;
	width: number;
	widths: ColumnWidths;
}

function useColumnResize(
	widths: ColumnWidths,
	change: (widths: ColumnWidths) => void
) {
	const drag: RefObject<ResizeSession | null> = useRef(null);
	const start = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			if (event.button !== 0) {
				return;
			}
			const column = event.currentTarget.dataset.column as MacFileListColumn;
			const header = event.currentTarget.parentElement;
			if (!header) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			const rect = header.getBoundingClientRect();
			drag.current = {
				column,
				scale: rect.width / Number.parseFloat(getComputedStyle(header).width),
				startX: event.clientX,
				width: fileColumnWidth(
					column,
					widths[column] ?? FILE_LIST_COLUMNS[column].width
				),
				widths,
			};
			event.currentTarget.setPointerCapture(event.pointerId);
			event.currentTarget.focus({ preventScroll: true });
		},
		[widths]
	);
	const move = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			const session = drag.current;
			if (session) {
				change({
					...session.widths,
					[session.column]: fileColumnWidth(
						session.column,
						session.width + (event.clientX - session.startX) / session.scale
					),
				});
			}
		},
		[change]
	);
	const end = useCallback(() => {
		drag.current = null;
	}, []);
	const cancel = useCallback(() => {
		if (drag.current) {
			change(drag.current.widths);
			drag.current = null;
		}
	}, [change]);
	const key = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			if (event.key === "Escape" && drag.current) {
				event.preventDefault();
				cancel();
				return;
			}
			const column = event.currentTarget.dataset.column as MacFileListColumn;
			let width = widths[column] ?? FILE_LIST_COLUMNS[column].width;
			if (event.key === "ArrowLeft") {
				width -= 10;
			} else if (event.key === "ArrowRight") {
				width += 10;
			} else if (event.key === "Home") {
				width = FILE_LIST_COLUMNS[column].min;
			} else if (event.key === "End") {
				width = FILE_LIST_COLUMNS[column].max;
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			change({ ...widths, [column]: fileColumnWidth(column, width) });
		},
		[widths, change, cancel]
	);
	const reset = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const column = event.currentTarget.dataset.column as MacFileListColumn;
			change({ ...widths, [column]: FILE_LIST_COLUMNS[column].width });
		},
		[widths, change]
	);
	return { cancel, end, key, move, reset, start };
}

export function MacFileList({
	items,
	selectedIds,
	onSelectionChange,
	onOpen,
	onQuickLook,
	onRename,
	onRenamingChange,
	renamingId,
	validateRename,
	sort: controlledSort,
	defaultSort = DEFAULT_SORT,
	onSortChange,
	columnWidths,
	onColumnWidthsChange,
	columns = DEFAULT_COLUMNS,
	label = "Files",
	active = true,
	resizable = true,
	showExtensions = true,
	minRows = 0,
	className = "",
	style,
}: MacFileListProps) {
	const rename = useFileRename({
		items,
		onRename,
		onRenamingChange,
		onSelectionChange,
		renamingId,
		selectedIds,
	});
	const [internalSort, setInternalSort] = useState(defaultSort);
	const [internalWidths, setInternalWidths] = useState<ColumnWidths>({});
	const [focusId, setFocusId] = useState<string>();
	const anchor = useRef<string>(undefined);
	const typeahead = useRef({ text: "", time: 0 });
	const sort = controlledSort ?? internalSort;
	const widths = columnWidths ?? internalWidths;
	const sorted = useMemo(
		() =>
			sortFileList(
				items.map((item) => ({
					...item,
					kindLabel: item.kindLabel ?? KINDS[item.kind ?? "document"],
				})),
				sort
			),
		[items, sort]
	);
	const ids = sorted.filter((item) => !item.disabled).map((item) => item.id);
	const tabStop =
		ids.find((id) => id === focusId) ??
		ids.find((id) => selectedIds.includes(id)) ??
		ids[0];
	const changeWidths = useCallback(
		(next: ColumnWidths) => {
			if (columnWidths === undefined) {
				setInternalWidths(next);
			}
			onColumnWidthsChange?.(next);
		},
		[columnWidths, onColumnWidthsChange]
	);
	const resize = useColumnResize(widths, changeWidths);
	const changeSort = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const column = event.currentTarget.dataset.column as MacFileListColumn;
			const next: MacFileSort = {
				column,
				direction:
					sort.column === column && sort.direction === "ascending"
						? "descending"
						: "ascending",
			};
			if (controlledSort === undefined) {
				setInternalSort(next);
			}
			onSortChange?.(next);
		},
		[sort, controlledSort, onSortChange]
	);
	const select = useCallback(
		(id: string, extend: boolean, toggle: boolean) => {
			if (extend) {
				anchor.current ??= selectedIds[0] ?? id;
			} else {
				anchor.current = id;
			}
			onSelectionChange(
				selectFileIds(ids, selectedIds, id, {
					anchor: anchor.current,
					extend,
					toggle,
				})
			);
			setFocusId(id);
		},
		[ids, selectedIds, onSelectionChange]
	);
	const click = useCallback(
		(event: MouseEvent<HTMLTableElement>) => {
			if (
				event.target instanceof Element &&
				event.target.closest(".mac-file-rename")
			) {
				return;
			}
			const row = listRow(event.target);
			if (row?.dataset.fileId && row.getAttribute("aria-disabled") !== "true") {
				row.focus({ preventScroll: true });
				select(row.dataset.fileId, event.shiftKey, isAdditiveSelection(event));
			} else if (
				!row &&
				event.target instanceof Element &&
				!event.target.closest("thead")
			) {
				anchor.current = undefined;
				onSelectionChange([]);
			}
		},
		[select, onSelectionChange]
	);
	const open = useCallback(
		(event: MouseEvent<HTMLTableElement>) => {
			if (
				event.target instanceof Element &&
				event.target.closest(".mac-file-rename")
			) {
				return;
			}
			const row = listRow(event.target);
			if (row?.dataset.fileId && row.getAttribute("aria-disabled") !== "true") {
				onOpen?.(row.dataset.fileId);
			}
		},
		[onOpen]
	);
	const focus = useCallback((event: FocusEvent<HTMLTableElement>) => {
		const id = enabledListRow(event.target)?.dataset.fileId;
		if (id) {
			setFocusId(id);
		}
	}, []);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLTableElement>) => {
			const id = enabledListRow(event.target)?.dataset.fileId;
			if (!id || event.nativeEvent.isComposing) {
				return;
			}
			const additive = isAdditiveSelection(event);
			if (
				rename.key(event, id) ||
				requestFileOpen(event, id, onOpen) ||
				requestFilePreview(event, id, onQuickLook)
			) {
				return;
			}
			if (event.key === "Escape") {
				event.preventDefault();
				anchor.current = undefined;
				onSelectionChange([]);
				return;
			}
			if (event.key === " ") {
				event.preventDefault();
				select(id, event.shiftKey, additive);
				return;
			}
			if (additive && event.key.toLowerCase() === "a") {
				event.preventDefault();
				onSelectionChange(ids);
				return;
			}
			const next = listKeyTarget(event, sorted, ids, id, typeahead.current);
			if (event.key.startsWith("Arrow") || next) {
				event.preventDefault();
			}
			if (!next) {
				return;
			}
			const row = [
				...event.currentTarget.querySelectorAll<HTMLTableRowElement>(
					"tr[data-file-id]"
				),
			].find((entry) => entry.dataset.fileId === next);
			focusFileTarget(row);
			select(next, event.shiftKey, event.shiftKey && additive);
		},
		[sorted, ids, onOpen, onQuickLook, onSelectionChange, select, rename.key]
	);
	const totalWidth = columns.reduce(
		(total, column) =>
			total +
			fileColumnWidth(
				column,
				widths[column] ?? FILE_LIST_COLUMNS[column].width
			),
		0
	);
	return (
		<div
			className={`mac-file-list ${className}`}
			data-active={active}
			style={style}
		>
			<table
				aria-label={label}
				aria-multiselectable="true"
				className="mac-file-list-table"
				onClick={click}
				onDoubleClick={open}
				onFocus={focus}
				onKeyDown={keyDown}
				// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: Native table/header semantics are retained in this keyboard-selectable data grid.
				role="grid"
				style={{ width: totalWidth }}
			>
				<colgroup>
					{columns.map((column) => (
						<col
							key={column}
							style={{
								width: fileColumnWidth(
									column,
									widths[column] ?? FILE_LIST_COLUMNS[column].width
								),
							}}
						/>
					))}
				</colgroup>
				<thead>
					<tr>
						{columns.map((column) => (
							<th
								aria-sort={sort.column === column ? sort.direction : undefined}
								data-column={column}
								key={column}
								scope="col"
							>
								<button
									className="mac-file-list-sort"
									data-column={column}
									onClick={changeSort}
									type="button"
								>
									{FILE_LIST_COLUMNS[column].label}
									{sort.column === column ? (
										<WindowSymbol
											className="mac-file-list-sort-arrow"
											name="chevron-down"
											size={8}
										/>
									) : null}
								</button>
								{resizable ? (
									// biome-ignore lint/a11y/useSemanticElements: This is a focusable, interactive column splitter with pointer capture and keyboard resizing.
									<button
										aria-label={`Resize ${FILE_LIST_COLUMNS[column].label} column`}
										aria-orientation="vertical"
										aria-valuemax={FILE_LIST_COLUMNS[column].max}
										aria-valuemin={FILE_LIST_COLUMNS[column].min}
										aria-valuenow={Math.round(
											fileColumnWidth(
												column,
												widths[column] ?? FILE_LIST_COLUMNS[column].width
											)
										)}
										className="mac-file-list-resize"
										data-column={column}
										onDoubleClick={resize.reset}
										onKeyDown={resize.key}
										onLostPointerCapture={resize.end}
										onPointerCancel={resize.cancel}
										onPointerDown={resize.start}
										onPointerMove={resize.move}
										onPointerUp={resize.end}
										role="separator"
										type="button"
									/>
								) : null}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{sorted.map((file) => (
						<tr
							aria-disabled={file.disabled || undefined}
							aria-selected={selectedIds.includes(file.id)}
							data-file-id={file.id}
							data-renaming={rename.id === file.id || undefined}
							key={file.id}
							tabIndex={file.id === tabStop ? 0 : -1}
						>
							{columns.map((column) => (
								<td data-column={column} key={column}>
									{column === "name" ? (
										<FileListName
											editor={
												rename.id === file.id && onRename ? (
													<FileRenameField
														file={file}
														onCommit={onRename}
														onEnd={rename.end}
														validate={validateRename}
													/>
												) : undefined
											}
											file={file}
											showExtensions={showExtensions}
										/>
									) : (
										cellValue(file, column)
									)}
								</td>
							))}
						</tr>
					))}
					{Array.from(
						{ length: Math.max(0, minRows - sorted.length) },
						(_, index) => (
							// biome-ignore lint/a11y/noAriaHiddenOnFocusable: Empty stripe rows are inert and have no tabindex or focusable children.
							<tr
								aria-hidden="true"
								className="mac-file-list-empty-row"
								inert
								// biome-ignore lint/suspicious/noArrayIndexKey: Stateless filler slots are fixed positions, not sortable file identities.
								key={`empty-${index}`}
							>
								<td colSpan={columns.length} />
							</tr>
						)
					)}
				</tbody>
			</table>
			{items.length === 0 ? (
				<p className="mac-file-list-empty">No items</p>
			) : null}
		</div>
	);
}

function listKeyTarget(
	event: KeyboardEvent<HTMLTableElement>,
	items: readonly MacFileListItem[],
	ids: string[],
	id: string,
	history: { text: string; time: number }
) {
	const index = ids.indexOf(id);
	if (event.key === "ArrowDown") {
		return ids[Math.min(ids.length - 1, index + 1)];
	}
	if (event.key === "ArrowUp") {
		return ids[Math.max(0, index - 1)];
	}
	if (event.key === "Home") {
		return ids.at(0);
	}
	if (event.key === "End") {
		return ids.at(-1);
	}
	if (
		event.key.length !== 1 ||
		event.metaKey ||
		event.ctrlKey ||
		event.altKey
	) {
		return;
	}
	const now = Date.now();
	const key = event.key.toLocaleLowerCase();
	history.text =
		now - history.time < 700 && history.text !== key ? history.text + key : key;
	history.time = now;
	const start = items.findIndex((item) => item.id === id) + 1;
	return [...items.slice(start), ...items.slice(0, start)].find(
		(item) =>
			!item.disabled && item.name.toLocaleLowerCase().startsWith(history.text)
	)?.id;
}

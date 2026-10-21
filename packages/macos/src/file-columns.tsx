import {
	type CSSProperties,
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	FILE_COLUMN_WIDTH,
	type FileBrowserColumn,
	fileBrowserColumns,
	fileBrowserColumnWidth,
	fileColumnArrow,
	fileColumnPath,
	type MacFileColumnItem,
} from "./file-column-model";
import { MacFileColumnPreview } from "./file-column-preview";
import { FileColumnResize } from "./file-column-resize";
import type { MacFileGroupBy } from "./file-groups";
import { MacFileList, type MacFileSort } from "./file-list";
import { requestNewFolder } from "./file-new-folder";
import type { MacFileRenameProps } from "./file-rename";

export type { MacFileColumnItem } from "./file-column-model";

const NAME_COLUMN = ["name"] as const;
const DEFAULT_SORT: MacFileSort = { column: "name", direction: "ascending" };

export interface MacFileColumnsProps extends MacFileRenameProps {
	active?: boolean;
	className?: string;
	columnWidth?: number;
	columnWidths?: readonly number[];
	groupBy?: MacFileGroupBy;
	items: readonly MacFileColumnItem[];
	label?: string;
	multiple?: boolean;
	onColumnWidthsChange?: (widths: number[]) => void;
	onGetInfo?: (id: string) => void;
	onNewFolder?: (parentId: string | undefined) => void;
	onOpen?: (id: string) => void;
	onQuickLook?: (id: string) => void;
	onValueChange: (id: string | undefined, selectedIds: string[]) => void;
	previewWidth?: number;
	renderPreview?: (file: MacFileColumnItem) => ReactNode;
	resizable?: boolean;
	selectedIds?: readonly string[];
	showExtensions?: boolean;
	showPreview?: boolean;
	sort?: MacFileSort;
	style?: CSSProperties;
	value: string | undefined;
}

interface BrowserColumnProps extends MacFileRenameProps {
	active: boolean;
	column: FileBrowserColumn;
	groupBy?: MacFileGroupBy;
	index: number;
	label: string;
	multiple: boolean;
	onGetInfo?: (id: string) => void;
	onOpen?: (id: string) => void;
	onQuickLook?: (id: string) => void;
	onResize: (index: number, width: number) => void;
	onSelect: (id: string | undefined, selectedIds: string[]) => void;
	resizable: boolean;
	selectedIds: readonly string[];
	showExtensions: boolean;
	sort: MacFileSort;
	width: number;
}
function BrowserColumn({
	column,
	index,
	label,
	width,
	onResize,
	onSelect,
	resizable,
	selectedIds,
	...props
}: BrowserColumnProps) {
	const items = useMemo(
		() => column.items.map((file) => ({ ...file, children: undefined })),
		[column.items]
	);
	const select = useCallback(
		(ids: string[]) => onSelect(ids.at(-1) ?? column.parentId, ids),
		[onSelect, column.parentId]
	);
	const resize = useCallback(
		(value: number) => onResize(index, value),
		[index, onResize]
	);
	return (
		<div
			className="mac-file-browser-column"
			data-column-index={index}
			data-finder-parent-id={column.parentId}
			style={{ width }}
		>
			<MacFileList
				{...props}
				columns={NAME_COLUMN}
				columnWidths={{ name: width - 21 }}
				expandedIds={column.selectedId ? [column.selectedId] : []}
				folderDisclosure="indicator"
				items={items}
				label={items.length ? label : `${label}, empty`}
				onSelectionChange={select}
				resizable={false}
				selectedIds={selectedIds}
			/>
			{resizable ? (
				<FileColumnResize label={label} onChange={resize} width={width} />
			) : null}
		</div>
	);
}

function columnSelection(
	column: FileBrowserColumn,
	value: string | undefined,
	selectedIds?: readonly string[]
): readonly string[] {
	if (selectedIds?.length && column.items.some((file) => file.id === value)) {
		return selectedIds.filter((id) =>
			column.items.some((file) => file.id === id)
		);
	}
	return column.selectedId ? [column.selectedId] : [];
}

export function MacFileColumns({
	onGetInfo,
	items,
	groupBy,
	value,
	onValueChange,
	label = "Files",
	multiple = false,
	selectedIds,
	active = true,
	columnWidth = FILE_COLUMN_WIDTH.default,
	columnWidths,
	onColumnWidthsChange,
	previewWidth = 240,
	renderPreview,
	showPreview = true,
	resizable = true,
	showExtensions = true,
	sort = DEFAULT_SORT,
	onOpen,
	onNewFolder,
	onQuickLook,
	onRename,
	onRenamingChange,
	renamingId,
	validateRename,
	className = "",
	style,
}: MacFileColumnsProps) {
	const path = useMemo(() => fileColumnPath(items, value), [items, value]);
	const many = multiple && (selectedIds?.length ?? 0) > 1;
	const columns = useMemo(
		() => fileBrowserColumns(items, many ? path.slice(0, -1) : path, sort),
		[items, path, sort, many]
	);
	const selected = path.at(-1);
	const createFolder = useCallback(() => {
		onNewFolder?.(
			!many && selected?.kind === "folder" ? selected.id : path.at(-2)?.id
		);
	}, [selected, path, onNewFolder, many]);
	const preview =
		showPreview && !many && selected && selected.kind !== "folder"
			? selected
			: undefined;
	const [internalWidths, setInternalWidths] = useState<readonly number[]>([]);
	const widths = columnWidths ?? internalWidths;
	const browser: RefObject<HTMLElement | null> = useRef(null);
	const pendingFocus = useRef<string | undefined>(undefined);
	const hasPreview = Boolean(preview);
	const reveal = useCallback(() => {
		const root = browser.current;
		const last = hasPreview
			? root?.querySelector<HTMLElement>(".mac-file-browser-preview")
			: root?.querySelector<HTMLElement>(
					`[data-column-index="${columns.length - 1}"]`
				);
		const current = root?.querySelector<HTMLElement>(
			`[data-column-index="${Math.max(0, path.length - 1)}"]`
		);
		if (root && last && current) {
			root.scrollLeft = Math.min(
				current.offsetLeft,
				Math.max(0, last.offsetLeft + last.offsetWidth - root.clientWidth)
			);
		}
	}, [hasPreview, columns.length, path.length]);
	useLayoutEffect(() => {
		const root = browser.current;
		if (!root) {
			return;
		}
		const observer = new ResizeObserver(reveal);
		observer.observe(root);
		reveal();
		return () => observer.disconnect();
	}, [reveal]);
	useLayoutEffect(() => {
		if (value && !selected) {
			onValueChange(undefined, []);
		}
	}, [value, selected, onValueChange]);
	useLayoutEffect(() => {
		const root = browser.current;
		if (!root) {
			return;
		}
		const rows = root.querySelectorAll<HTMLElement>("tr[data-file-id]");
		const target = [...rows].find(
			(row) => row.dataset.fileId === value && pendingFocus.current === value
		);
		if (target) {
			target.focus({ preventScroll: true });
			target.scrollIntoView({ block: "nearest", inline: "nearest" });
		}
		pendingFocus.current = undefined;
		reveal();
	}, [value, reveal]);
	const resize = useCallback(
		(index: number, width: number) => {
			const next = Array.from(
				{ length: Math.max(widths.length, index + 1) },
				(_, position) => widths[position] ?? fileBrowserColumnWidth(columnWidth)
			);
			next[index] = width;
			if (columnWidths === undefined) {
				setInternalWidths(next);
			}
			onColumnWidthsChange?.(next);
		},
		[widths, columnWidth, columnWidths, onColumnWidthsChange]
	);
	const key = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			if (
				!(
					event.target instanceof Element &&
					event.target.closest(".mac-file-rename")
				) &&
				requestNewFolder(event, onNewFolder ? createFolder : undefined)
			) {
				return;
			}
			if (
				event.defaultPrevented ||
				event.nativeEvent.isComposing ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				!(event.target instanceof Element) ||
				event.target.closest(".mac-file-rename")
			) {
				return;
			}
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
				return;
			}
			const row = event.target.closest<HTMLElement>("tr[data-file-id]");
			const id = row?.dataset.fileId;
			const index = Number(
				row?.closest<HTMLElement>("[data-column-index]")?.dataset.columnIndex
			);
			if (!(id && columns[index])) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			const next = fileColumnArrow(columns[index], id, event.key, sort);
			if (next) {
				pendingFocus.current = next;
				onValueChange(next, [next]);
			}
		},
		[columns, sort, onValueChange, onNewFolder, createFolder]
	);
	return (
		<section
			aria-label={label}
			className={`mac-file-columns ${className}`}
			onKeyDownCapture={key}
			ref={browser}
			style={style}
		>
			{columns.map((column, index) => (
				<BrowserColumn
					active={active && column.items.some((file) => file.id === value)}
					column={column}
					groupBy={groupBy}
					index={index}
					key={
						column.parentId === undefined ? "root" : `folder:${column.parentId}`
					}
					label={path[index - 1]?.name ?? label}
					multiple={multiple}
					onGetInfo={onGetInfo}
					onOpen={onOpen}
					onQuickLook={onQuickLook}
					onRename={onRename}
					onRenamingChange={onRenamingChange}
					onResize={resize}
					onSelect={onValueChange}
					renamingId={renamingId}
					resizable={resizable}
					selectedIds={columnSelection(column, value, selectedIds)}
					showExtensions={showExtensions}
					sort={sort}
					validateRename={validateRename}
					width={fileBrowserColumnWidth(widths[index] ?? columnWidth)}
				/>
			))}
			{preview ? (
				<div
					className="mac-file-browser-preview"
					style={{ width: fileBrowserColumnWidth(previewWidth) }}
				>
					{renderPreview ? (
						renderPreview(preview)
					) : (
						<MacFileColumnPreview
							file={preview}
							key={`${preview.id}:${preview.preview?.src ?? ""}`}
						/>
					)}
				</div>
			) : null}
		</section>
	);
}

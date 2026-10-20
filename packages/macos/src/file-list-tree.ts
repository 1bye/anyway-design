import type { MacFileListItem } from "./file-list";
import { type MacFileSort, sortFileList } from "./file-list-sort";

export const FILE_KIND_LABELS = {
	archive: "ZIP archive",
	document: "Document",
	folder: "Folder",
	image: "Image",
	pdf: "PDF Document",
	text: "Text document",
} as const;

export interface FileListRow {
	depth: number;
	file: MacFileListItem;
	parentId?: string;
	position: number;
	siblingCount: number;
}

export function flattenFileList(
	items: readonly MacFileListItem[],
	sort: MacFileSort
): FileListRow[] {
	const rows: FileListRow[] = [];
	const visit = (
		siblings: readonly MacFileListItem[],
		depth: number,
		parentId?: string
	) => {
		const sorted = sortFileList(
			siblings.map((file) => ({
				...file,
				kindLabel: file.kindLabel ?? FILE_KIND_LABELS[file.kind ?? "document"],
			})),
			sort
		);
		for (const [index, file] of sorted.entries()) {
			rows.push({
				depth,
				file,
				parentId,
				position: index + 1,
				siblingCount: sorted.length,
			});
			if (file.kind === "folder" && file.children) {
				visit(file.children, depth + 1, file.id);
			}
		}
	};
	visit(items, 0);
	return rows;
}

export function visibleFileListRows(
	rows: readonly FileListRow[],
	expandedIds: readonly string[]
): FileListRow[] {
	const expanded = new Set(expandedIds);
	const visible: FileListRow[] = [];
	let hiddenBelow: number | undefined;
	for (const row of rows) {
		if (hiddenBelow !== undefined && row.depth > hiddenBelow) {
			continue;
		}
		hiddenBelow = undefined;
		visible.push(row);
		if (
			row.file.kind === "folder" &&
			(!expanded.has(row.file.id) || row.file.disabled)
		) {
			hiddenBelow = row.depth;
		}
	}
	return visible;
}

export function visibleFileListAncestor(
	rows: readonly FileListRow[],
	visibleIds: ReadonlySet<string>,
	id?: string
): string | undefined {
	let row = rows.find((entry) => entry.file.id === id);
	while (row) {
		if (visibleIds.has(row.file.id) && !row.file.disabled) {
			return row.file.id;
		}
		row = rows.find((entry) => entry.file.id === row?.parentId);
	}
}

export function fileListArrowAction(
	row: FileListRow,
	key: string,
	expanded: boolean
): { type: "expand" | "collapse" | "focus"; id: string } | undefined {
	if (row.file.disabled) {
		return;
	}
	if (key === "ArrowRight" && row.file.kind === "folder") {
		return { id: row.file.id, type: "expand" };
	}
	if (key !== "ArrowLeft") {
		return;
	}
	if (row.file.kind === "folder" && expanded) {
		return { id: row.file.id, type: "collapse" };
	}
	if (row.parentId) {
		return { id: row.parentId, type: "focus" };
	}
}

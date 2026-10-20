import type { MacFileListItem } from "./file-list";
import { type MacFileSort, sortFileList } from "./file-list-sort";
import { FILE_KIND_LABELS } from "./file-list-tree";

export interface MacFileColumnItem extends MacFileListItem {
	children?: readonly MacFileColumnItem[];
	preview?: {
		alt?: string;
		details?: readonly { label: string; value: string }[];
		src?: string;
		text?: string;
	};
}

export interface FileBrowserColumn {
	items: readonly MacFileColumnItem[];
	parentId?: string;
	selectedId?: string;
}

function sortColumnItems(
	items: readonly MacFileColumnItem[],
	sort: MacFileSort
) {
	return sortFileList(
		items.map((file) => ({
			...file,
			kindLabel: file.kindLabel ?? FILE_KIND_LABELS[file.kind ?? "document"],
		})),
		sort
	);
}

export function fileColumnPath(
	items: readonly MacFileColumnItem[],
	id: string | undefined
): MacFileColumnItem[] {
	if (!id) {
		return [];
	}
	for (const file of items) {
		if (file.disabled) {
			continue;
		}
		if (file.id === id) {
			return [file];
		}
		if (file.kind === "folder" && file.children) {
			const child = fileColumnPath(file.children, id);
			if (child.length) {
				return [file, ...child];
			}
		}
	}
	return [];
}

export function fileBrowserColumns(
	items: readonly MacFileColumnItem[],
	path: readonly MacFileColumnItem[],
	sort: MacFileSort
): FileBrowserColumn[] {
	const columns: FileBrowserColumn[] = [
		{ items: sortColumnItems(items, sort), selectedId: path[0]?.id },
	];
	for (const [index, file] of path.entries()) {
		if (file.kind !== "folder") {
			break;
		}
		columns.push({
			items: sortColumnItems(file.children ?? [], sort),
			parentId: file.id,
			selectedId: path[index + 1]?.id,
		});
	}
	return columns;
}

export function fileColumnArrow(
	column: FileBrowserColumn,
	id: string,
	key: string,
	sort: MacFileSort
): string | undefined {
	const files = column.items.filter((file) => !file.disabled);
	const index = files.findIndex((file) => file.id === id);
	if (index < 0) {
		return;
	}
	if (key === "ArrowLeft") {
		return column.parentId;
	}
	const current = files[index];
	if (key === "ArrowRight" && current.kind === "folder") {
		return sortColumnItems(current.children ?? [], sort).find(
			(file) => !file.disabled
		)?.id;
	}
	if (key === "Home") {
		return files[0]?.id;
	}
	if (key === "End") {
		return files.at(-1)?.id;
	}
	if (key === "ArrowDown") {
		return files[Math.min(files.length - 1, index + 1)]?.id;
	}
	if (key === "ArrowUp") {
		return files[Math.max(0, index - 1)]?.id;
	}
}

export const FILE_COLUMN_WIDTH = { default: 245, max: 600, min: 160 } as const;
export function fileBrowserColumnWidth(width: number): number {
	return Number.isFinite(width)
		? Math.min(FILE_COLUMN_WIDTH.max, Math.max(FILE_COLUMN_WIDTH.min, width))
		: FILE_COLUMN_WIDTH.default;
}

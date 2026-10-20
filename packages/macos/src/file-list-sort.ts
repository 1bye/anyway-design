export type MacFileListColumn = "name" | "modified" | "size" | "kind";
export interface MacFileSort {
	column: MacFileListColumn;
	direction: "ascending" | "descending";
}

export interface FileListValues {
	kindLabel?: string;
	modifiedAt?: number;
	name: string;
	size?: number;
}

const NAMES = new Intl.Collator(undefined, {
	numeric: true,
	sensitivity: "base",
});

export function sortFileList<T extends FileListValues>(
	items: readonly T[],
	sort: MacFileSort
): T[] {
	const direction = sort.direction === "ascending" ? 1 : -1;
	return [...items].sort((a, b) => {
		if (sort.column === "name") {
			return NAMES.compare(a.name, b.name) * direction;
		}
		if (sort.column === "kind") {
			return NAMES.compare(a.kindLabel ?? "", b.kindLabel ?? "") * direction;
		}
		const key = sort.column === "size" ? "size" : "modifiedAt";
		const first = a[key];
		const second = b[key];
		const firstMissing = first === undefined || !Number.isFinite(first);
		const secondMissing = second === undefined || !Number.isFinite(second);
		if (firstMissing) {
			return secondMissing ? 0 : 1;
		}
		if (secondMissing) {
			return -1;
		}
		return (first - second) * direction;
	});
}

export const FILE_LIST_COLUMNS = {
	kind: { label: "Kind", max: 480, min: 90, width: 150 },
	modified: { label: "Date Modified", max: 480, min: 120, width: 180 },
	name: { label: "Name", max: 900, min: 140, width: 300 },
	size: { label: "Size", max: 240, min: 64, width: 90 },
} as const;

export function fileColumnWidth(
	column: MacFileListColumn,
	width: number
): number {
	const bounds = FILE_LIST_COLUMNS[column];
	if (!Number.isFinite(width)) {
		return bounds.width;
	}
	return Math.min(bounds.max, Math.max(bounds.min, width));
}

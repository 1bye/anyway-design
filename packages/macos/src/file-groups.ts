import type { MacFileListItem } from "./file-list";

export type MacFileGroupBy = (file: MacFileListItem) => string;

/** Retains the caller's group order and never duplicates a file across groups. */
export function groupFileItems<T>(
	items: readonly T[],
	groupBy?: (file: T) => string
): { label?: string; items: readonly T[] }[] {
	if (!groupBy) {
		return [{ items }];
	}
	const groups = new Map<string, T[]>();
	for (const file of items) {
		const label = groupBy(file);
		const group = groups.get(label);
		if (group) {
			group.push(file);
		} else {
			groups.set(label, [file]);
		}
	}
	return [...groups].map(([label, files]) => ({ items: files, label }));
}

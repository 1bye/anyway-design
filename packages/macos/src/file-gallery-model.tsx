import type { MacFileColumnItem } from "./file-column-model";
import type { MacFileListItem } from "./file-list";

export interface MacFileGalleryItem extends MacFileListItem {
	preview?: NonNullable<MacFileColumnItem["preview"]> & {
		moreDetails?: readonly { label: string; value: string }[];
		presentation?: "image" | "document";
	};
}

/** Preserve visual order and omit removed, disabled, or duplicate selections. */
export function fileGallerySelection(
	items: readonly MacFileGalleryItem[],
	selectedIds: readonly string[]
): MacFileGalleryItem[] {
	const selected = new Set(selectedIds);
	return items.filter((file) => !file.disabled && selected.has(file.id));
}

/** A multiple selection only reports metadata shared by every selected item. */
export function fileGalleryDetails(files: readonly MacFileGalleryItem[]) {
	const [first] = files;
	if (!first) {
		return [];
	}
	const details = (file: MacFileGalleryItem) =>
		file.preview?.details ??
		(file.modifiedLabel
			? [{ label: "Modified", value: file.modifiedLabel }]
			: []);
	return details(first).filter((detail) =>
		files.every((file) =>
			details(file).some(
				(other) => other.label === detail.label && other.value === detail.value
			)
		)
	);
}

export function fileGalleryTags(files: readonly MacFileGalleryItem[]) {
	return (files[0]?.tags ?? []).filter((tag) =>
		files.every((file) =>
			file.tags?.some(
				(other) => other.label === tag.label && other.color === tag.color
			)
		)
	);
}

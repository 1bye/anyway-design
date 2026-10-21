import type { MacFileListItem } from "./file-list";
import { FILE_KIND_LABELS } from "./file-list-tree";
import { fileRenameError, fileRenameSelection } from "./file-rename";

export type MacGetInfoSection =
	| "general"
	| "more"
	| "name"
	| "comments"
	| "open-with"
	| "preview"
	| "permissions";
export interface MacFileInfoDetail {
	label: string;
	value: string;
}
export interface MacFileInfoItem extends MacFileListItem {
	applicationId?: string;
	applications?: readonly { id: string; label: string }[];
	comments?: string;
	defaultApplicationId?: string;
	extensionHidden?: boolean;
	general?: readonly MacFileInfoDetail[];
	locked?: boolean;
	moreInfo?: readonly MacFileInfoDetail[];
	permissions?: {
		summary: string;
		entries: readonly { id: string; name: string; privilege: string }[];
	};
	preview?: { src: string; alt?: string };
	shared?: boolean;
	stationeryPad?: boolean;
}

export const DEFAULT_INFO_SECTIONS: readonly MacGetInfoSection[] = [
	"general",
	"more",
	"name",
];

export function fileInfoGeneral(
	file: MacFileInfoItem
): readonly MacFileInfoDetail[] {
	if (file.general) {
		return file.general;
	}
	const details = [
		{
			label: "Kind",
			value: file.kindLabel ?? FILE_KIND_LABELS[file.kind ?? "document"],
		},
	];
	if (file.sizeLabel) {
		details.push({ label: "Size", value: file.sizeLabel });
	}
	if (file.modifiedLabel) {
		details.push({ label: "Modified", value: file.modifiedLabel });
	}
	return details;
}

export function fileInfoHasExtension(file: MacFileInfoItem): boolean {
	return (
		fileRenameSelection(file.name, file.kind === "folder") < file.name.length
	);
}

export function fileInfoDisplayName(file: MacFileInfoItem): string {
	return file.extensionHidden && fileInfoHasExtension(file)
		? file.name.slice(0, fileRenameSelection(file.name))
		: file.name;
}

export function fileInfoNameError(
	file: MacFileInfoItem,
	name: string,
	validate?: (id: string, name: string) => string | undefined
) {
	if (file.locked) {
		return "The file is locked.";
	}
	return fileRenameError(name) ?? validate?.(file.id, name);
}

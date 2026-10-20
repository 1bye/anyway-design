import type { MacFileListItem } from "./file-list";
import { fileRenameError } from "./file-rename";

export interface MacFileDialogDirectory {
	id: string;
	items: readonly MacFileListItem[];
	name: string;
	parentId?: string;
}

export interface MacFileDialogType {
	extensions: readonly string[];
	id: string;
	label: string;
}

export type MacFileDialogResult =
	| { directoryId: string; fileIds: string[]; mode: "open" }
	| {
			directoryId: string;
			mode: "save";
			name: string;
			replaceId?: string;
			tags: string;
	  };

export function fileDialogTrail(
	directories: readonly MacFileDialogDirectory[],
	id: string
): MacFileDialogDirectory[] {
	const trail: MacFileDialogDirectory[] = [];
	const seen = new Set<string>();
	let current = directories.find((directory) => directory.id === id);
	while (current && !seen.has(current.id)) {
		trail.unshift(current);
		seen.add(current.id);
		const { parentId } = current;
		current = directories.find((directory) => directory.id === parentId);
	}
	return trail;
}

const LEADING_DOTS = /^\.+/;
function extensions(type: MacFileDialogType) {
	return type.extensions.map((extension) =>
		extension.replace(LEADING_DOTS, "").toLocaleLowerCase()
	);
}

export function fileDialogAccepts(
	file: Pick<MacFileListItem, "name" | "kind">,
	type?: MacFileDialogType
): boolean {
	return (
		file.kind === "folder" ||
		!type?.extensions.length ||
		extensions(type).some((extension) =>
			file.name.toLocaleLowerCase().endsWith(`.${extension}`)
		)
	);
}

export function fileDialogSaveTarget(
	draft: string,
	items: readonly MacFileListItem[],
	type?: MacFileDialogType
): { error?: string; name: string; replaceId?: string } {
	let name = draft;
	const invalid = fileRenameError(name);
	if (invalid) {
		return { error: invalid, name };
	}
	if (type?.extensions.length && !fileDialogAccepts({ name }, type)) {
		if (name.includes(".")) {
			return {
				error: `Use ${extensions(type)
					.map((ext) => `.${ext}`)
					.join(" or ")} for ${type.label}.`,
				name,
			};
		}
		name = `${name}.${extensions(type)[0]}`;
	}
	const normalized = name.normalize("NFC").toLocaleLowerCase();
	const generatedError = fileRenameError(name);
	if (generatedError) {
		return { error: generatedError, name };
	}
	const existing = items.find(
		(item) => item.name.normalize("NFC").toLocaleLowerCase() === normalized
	);
	if (existing?.kind === "folder" || existing?.disabled) {
		return { error: `“${name}” is unavailable. Choose another name.`, name };
	}
	return { name, replaceId: existing?.id };
}

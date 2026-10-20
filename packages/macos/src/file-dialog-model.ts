import type { MacFileColumnItem } from "./file-column-model";
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

export type MacFileDialogView = "list" | "columns";

export function fileDialogItems(
	directory: MacFileDialogDirectory,
	query: string,
	type?: MacFileDialogType
): MacFileListItem[] {
	return directory.items
		.filter((item) =>
			item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
		)
		.map((item) => ({
			...item,
			disabled: item.disabled || !fileDialogAccepts(item, type),
		}));
}

/** Only the supplied root and its reachable folders become browser columns. */
export function fileDialogColumns(
	directories: readonly MacFileDialogDirectory[],
	directoryId: string,
	query: string,
	type?: MacFileDialogType
): MacFileColumnItem[] {
	const [root] = fileDialogTrail(directories, directoryId);
	const byId = new Map(
		directories.map((directory) => [directory.id, directory])
	);
	const visit = (
		directory: MacFileDialogDirectory,
		ancestors: Set<string>
	): MacFileColumnItem[] => {
		const seen = new Set(ancestors).add(directory.id);
		return fileDialogItems(
			directory,
			directory.id === directoryId ? query : "",
			type
		).map((item) => {
			const child = item.kind === "folder" ? byId.get(item.id) : undefined;
			return {
				...item,
				children:
					child && !seen.has(child.id) && !item.disabled
						? visit(child, seen)
						: undefined,
			};
		});
	};
	return root ? visit(root, new Set()) : [];
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

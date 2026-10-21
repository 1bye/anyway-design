import { fileRenameSelection } from "./file-rename";
import { finderMove } from "./finder-drop";
import {
	finderLocation,
	finderLocationFiles,
	finderPath,
	type MacFinderCollection,
	type MacFinderFile,
	type MacFinderTab,
} from "./finder-model";

export type MacFinderOperation =
	| "paste"
	| "move"
	| "duplicate"
	| "trash"
	| "rename"
	| "new-folder"
	| "info";
export interface MacFinderChange {
	action: MacFinderOperation | "undo" | "redo";
	ids: readonly string[];
	label: string;
	operation: MacFinderOperation;
}
export interface FinderOperation {
	files: MacFinderFile[];
	ids: string[];
	label: string;
	operation: MacFinderOperation;
}
export interface FinderOperationResult {
	error?: string;
	value?: FinderOperation;
}
const COPY_SUFFIX = / copy(?: (\d+))?$/;
export const finderNameKey = (name: string) =>
	name.normalize("NFC").toLocaleLowerCase();

export function finderOperationLabel(
	action: string,
	files: readonly MacFinderFile[]
): string {
	return `${action} of ${files.length === 1 ? `“${files[0].name}”` : `${files.length} Items`}`;
}
export function finderSubtree(
	files: readonly MacFinderFile[],
	ids: readonly string[]
) {
	const unique = new Set(ids);
	const selected = files.filter((file) => unique.has(file.id));
	if (
		!selected.length ||
		selected.length !== unique.size ||
		selected.some((file) => file.disabled || !file.parentId)
	) {
		return;
	}
	const roots = selected.filter(
		(file) =>
			!finderPath(files, file.id)
				.slice(0, -1)
				.some((parent) => unique.has(parent.id))
	);
	if (!roots.length) {
		return;
	}
	const children = new Map<string, MacFinderFile[]>();
	for (const file of files) {
		if (file.parentId) {
			const list = children.get(file.parentId) ?? [];
			list.push(file);
			children.set(file.parentId, list);
		}
	}
	const result: MacFinderFile[] = [];
	const seen = new Set<string>();
	const pending = [...roots];
	while (pending.length) {
		const file = pending.shift();
		if (!file || file.disabled || seen.has(file.id)) {
			return;
		}
		seen.add(file.id);
		result.push(file);
		pending.push(...(children.get(file.id) ?? []));
	}
	return { files: result, roots };
}
export function finderCopyName(
	file: MacFinderFile,
	names: ReadonlySet<string>,
	forceCopy: boolean
): string {
	if (!(forceCopy || names.has(finderNameKey(file.name)))) {
		return file.name;
	}
	const end = fileRenameSelection(file.name, file.kind === "folder");
	const extension = file.name.slice(end);
	let base = file.name.slice(0, end);
	const suffix = COPY_SUFFIX.exec(base);
	let number = suffix ? Number(suffix[1] ?? 1) + 1 : 1;
	if (!Number.isSafeInteger(number)) {
		number = 2;
	}
	if (suffix) {
		base = base.slice(0, suffix.index);
	}
	let candidate: string;
	do {
		candidate = `${base} copy${number === 1 ? "" : ` ${number}`}${extension}`;
		number += 1;
	} while (names.has(finderNameKey(candidate)));
	return candidate;
}

/** Copies are metadata trees with fresh IDs; preview URLs remain caller-owned immutable references. */
export function finderClone(
	files: readonly MacFinderFile[],
	ids: readonly string[],
	parentId?: string,
	idFactory = () => crypto.randomUUID()
): FinderOperationResult {
	const tree = finderSubtree(files, ids);
	if (!tree) {
		return { error: "The copied items are no longer available." };
	}
	const duplicate = parentId === undefined;
	const destinations = new Set(
		tree.roots.map((file) => parentId ?? file.parentId ?? "")
	);
	for (const destinationId of destinations) {
		const folder = files.find((file) => file.id === destinationId);
		if (folder?.kind !== "folder" || folder.disabled || folder.locked) {
			return { error: "Choose a writable folder." };
		}
		if (
			finderPath(files, destinationId).some((file) =>
				tree.roots.some((root) => root.id === file.id)
			)
		) {
			return {
				error: "A folder cannot be copied into itself or its children.",
			};
		}
	}
	const existing = new Set(files.map((file) => file.id));
	const copies = new Map<string, string>();
	for (const file of tree.files) {
		const id = idFactory();
		if (!id || existing.has(id)) {
			return { error: "Could not create a unique file ID." };
		}
		existing.add(id);
		copies.set(file.id, id);
	}
	const rootIds = new Set(tree.roots.map((file) => file.id));
	const names = new Map<string, Set<string>>();
	for (const destination of destinations) {
		names.set(
			destination,
			new Set(
				files
					.filter((file) => file.parentId === destination)
					.map((file) => finderNameKey(file.name))
			)
		);
	}
	const cloned = tree.files.map((file) => {
		const root = rootIds.has(file.id);
		const destination = root
			? (parentId ?? file.parentId)
			: copies.get(file.parentId ?? "");
		const reserved = names.get(destination ?? "") ?? new Set<string>();
		const name = root ? finderCopyName(file, reserved, duplicate) : file.name;
		reserved.add(finderNameKey(name));
		return {
			...file,
			id: copies.get(file.id) ?? "",
			name,
			parentId: destination,
		};
	});
	return {
		value: {
			files: [...files, ...cloned],
			ids: tree.roots.map((file) => copies.get(file.id) ?? ""),
			label: finderOperationLabel(duplicate ? "Duplicate" : "Copy", tree.roots),
			operation: duplicate ? "duplicate" : "paste",
		},
	};
}
export function finderMoveOperation(
	files: readonly MacFinderFile[],
	ids: readonly string[],
	parentId: string
): FinderOperationResult {
	const result = finderMove(files, ids, parentId);
	if (result.reason) {
		return { error: result.reason };
	}
	const moving = new Set(result.ids);
	return {
		value: {
			files: files.map((file) =>
				moving.has(file.id) ? { ...file, parentId } : file
			),
			ids: result.ids,
			label: finderOperationLabel(
				"Move",
				files.filter((file) => moving.has(file.id))
			),
			operation: "move",
		},
	};
}
export function finderTrash(
	files: readonly MacFinderFile[],
	ids: readonly string[]
): FinderOperationResult {
	const tree = finderSubtree(files, ids);
	if (
		!tree ||
		tree.files.some((file) => file.locked) ||
		tree.roots.some((file) => {
			const parent = files.find((entry) => entry.id === file.parentId);
			return parent?.kind !== "folder" || parent.locked || parent.disabled;
		})
	) {
		return { error: "These items cannot be moved to Trash." };
	}
	const removed = new Set(tree.files.map((file) => file.id));
	return {
		value: {
			files: files.filter((file) => !removed.has(file.id)),
			ids: tree.roots.map((file) => file.id),
			label: finderOperationLabel("Move", tree.roots),
			operation: "trash",
		},
	};
}

/** Keep operation results selectable inside expanded lists and ancestor columns. */
export function finderOperationSelection(
	files: readonly MacFinderFile[],
	ids: readonly string[],
	tab: MacFinderTab,
	collections: readonly MacFinderCollection[]
): string[] {
	const location = finderLocation(tab);
	const available = new Set(
		finderLocationFiles(files, location, tab.query, collections).map(
			(file) => file.id
		)
	);
	const hierarchical =
		(tab.view === "list" || tab.view === "columns") &&
		!tab.query.trim() &&
		!collections.some((collection) => collection.id === location);
	const scope =
		tab.view === "columns" ? (tab.columnRoot ?? location) : location;
	return ids.filter(
		(id) =>
			available.has(id) ||
			(hierarchical &&
				finderPath(files, id)
					.slice(0, -1)
					.some((parent) => parent.id === scope))
	);
}

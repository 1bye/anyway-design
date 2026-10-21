import { finderPath, type MacFinderFile } from "./finder-model";

export interface MacFinderDropContext {
	destination: MacFinderFile;
	/** External filenames are unavailable until the browser delivers a drop. */
	external: boolean;
	files: readonly MacFinderFile[];
}

export interface FinderMove {
	ids: string[];
	reason?: string;
}

export function finderDragFiles(
	files: readonly MacFinderFile[],
	selectedIds: readonly string[],
	id: string
): MacFinderFile[] {
	const ids = new Set(selectedIds.includes(id) ? selectedIds : [id]);
	const primary = files.find((file) => file.id === id);
	return primary
		? [primary, ...files.filter((file) => file.id !== id && ids.has(file.id))]
		: [];
}

/** Validate an atomic move, remove redundant descendants, and never overwrite existing names. */
export function finderMove(
	files: readonly MacFinderFile[],
	ids: readonly string[],
	parentId: string
): FinderMove {
	const destination = files.find((file) => file.id === parentId);
	if (
		destination?.kind !== "folder" ||
		destination.disabled ||
		destination.locked
	) {
		return { ids: [], reason: "Choose a writable folder." };
	}
	const unique = new Set(ids);
	const source = files.filter((file) => unique.has(file.id));
	if (
		!source.length ||
		source.length !== unique.size ||
		source.some((file) => file.disabled || file.locked || !file.parentId)
	) {
		return { ids: [], reason: "These items cannot be moved." };
	}
	if (finderPath(files, parentId).some((file) => unique.has(file.id))) {
		return {
			ids: [],
			reason: "A folder cannot be moved into itself or its children.",
		};
	}
	const moving = source.filter(
		(file) =>
			file.parentId !== parentId &&
			!finderPath(files, file.id)
				.slice(0, -1)
				.some((parent) => unique.has(parent.id))
	);
	if (!moving.length) {
		return { ids: [], reason: "These items are already in this folder." };
	}
	const names = new Set(
		files
			.filter((file) => file.parentId === parentId)
			.map((file) => file.name.normalize("NFC").toLocaleLowerCase())
	);
	for (const file of moving) {
		const name = file.name.normalize("NFC").toLocaleLowerCase();
		if (names.has(name)) {
			return {
				ids: [],
				reason: `“${file.name}” already exists in this folder.`,
			};
		}
		names.add(name);
	}
	return { ids: moving.map((file) => file.id) };
}

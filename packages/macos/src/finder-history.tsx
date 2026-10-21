import { fileRenameError } from "./file-rename";
import type { MacFinderFile } from "./finder-model";
import { type FinderOperation, finderNameKey } from "./finder-operations";

interface FilePatch {
	after?: MacFinderFile;
	before?: MacFinderFile;
	index: number;
}
export interface FinderHistoryEntry {
	change: Omit<FinderOperation, "files">;
	patches: FilePatch[];
}
const fileKeys = (file: MacFinderFile) =>
	Object.keys(file) as (keyof MacFinderFile)[];
function changedKeys(before: MacFinderFile, after: MacFinderFile) {
	return [...new Set([...fileKeys(before), ...fileKeys(after)])].filter(
		(key) =>
			!Object.is(before[key], after[key]) ||
			Object.hasOwn(before, key) !== Object.hasOwn(after, key)
	);
}
export function finderHistoryEntry(
	before: readonly MacFinderFile[],
	change: FinderOperation
): FinderHistoryEntry {
	const next = new Map(change.files.map((file) => [file.id, file]));
	const previous = new Map(before.map((file) => [file.id, file]));
	const patches: FilePatch[] = [];
	for (const [index, file] of before.entries()) {
		const after = next.get(file.id);
		if (!after || changedKeys(file, after).length) {
			patches.push({ after, before: file, index });
		}
	}
	for (const [index, file] of change.files.entries()) {
		if (!previous.has(file.id)) {
			patches.push({ after: file, index });
		}
	}
	return {
		change: {
			ids: change.ids,
			label: change.label,
			operation: change.operation,
		},
		patches,
	};
}
function patchFile(
	actual: MacFinderFile | undefined,
	expected: MacFinderFile | undefined,
	desired: MacFinderFile | undefined
): MacFinderFile | null | undefined {
	if (!expected) {
		return actual ? undefined : desired;
	}
	if (!actual) {
		return;
	}
	const keys = desired ? changedKeys(expected, desired) : fileKeys(expected);
	if (
		keys.some(
			(key) =>
				!Object.is(actual[key], expected[key]) ||
				Object.hasOwn(actual, key) !== Object.hasOwn(expected, key)
		)
	) {
		return;
	}
	if (!desired) {
		return changedKeys(actual, expected).length ? undefined : null;
	}
	const updated = { ...actual };
	for (const key of keys) {
		if (Object.hasOwn(desired, key)) {
			Reflect.set(updated, key, desired[key]);
		} else {
			Reflect.deleteProperty(updated, key);
		}
	}
	return updated;
}
function validPlacement(
	actual: MacFinderFile | undefined,
	desired: MacFinderFile,
	after: readonly MacFinderFile[],
	byId: ReadonlyMap<string, MacFinderFile>
): boolean {
	const parent = byId.get(desired.parentId ?? "");
	if (
		parent?.kind !== "folder" ||
		parent.locked ||
		parent.disabled ||
		actual?.locked ||
		actual?.disabled ||
		fileRenameError(desired.name)
	) {
		return false;
	}
	if (
		after.some(
			(file) =>
				file.id !== desired.id &&
				file.parentId === desired.parentId &&
				finderNameKey(file.name) === finderNameKey(desired.name)
		)
	) {
		return false;
	}
	const seen = new Set([desired.id]);
	let ancestor: MacFinderFile | undefined = parent;
	while (ancestor) {
		if (seen.has(ancestor.id)) {
			return false;
		}
		seen.add(ancestor.id);
		ancestor = byId.get(ancestor.parentId ?? "");
	}
	return true;
}
function validRestoration(
	before: readonly MacFinderFile[],
	after: readonly MacFinderFile[],
	patches: readonly FilePatch[],
	redo: boolean
) {
	const byId = new Map(after.map((file) => [file.id, file]));
	const original = new Map(before.map((file) => [file.id, file]));
	for (const patch of patches) {
		const desired = redo ? patch.after : patch.before;
		const id = (desired ?? patch.before ?? patch.after)?.id;
		if (!id) {
			return false;
		}
		const actual = original.get(id);
		if (!desired) {
			const parent = byId.get(actual?.parentId ?? "");
			if (
				after.some((file) => file.parentId === id) ||
				parent?.locked ||
				parent?.disabled
			) {
				return false;
			}
			continue;
		}
		if (actual?.name === desired.name && actual.parentId === desired.parentId) {
			continue;
		}
		if (!validPlacement(actual, desired, after, byId)) {
			return false;
		}
	}
	return true;
}
/** Reverse only fields touched by the operation; preserve unrelated caller changes and reject conflicts atomically. */
export function finderApplyHistory(
	files: readonly MacFinderFile[],
	entry: FinderHistoryEntry,
	redo: boolean
): MacFinderFile[] | undefined {
	const byId = new Map(files.map((file) => [file.id, file]));
	const replacements = new Map<string, MacFinderFile | null>();
	const additions: { file: MacFinderFile; index: number }[] = [];
	for (const patch of entry.patches) {
		const expected = redo ? patch.before : patch.after;
		const desired = redo ? patch.after : patch.before;
		const id = (expected ?? desired)?.id;
		if (!id) {
			return;
		}
		const next = patchFile(byId.get(id), expected, desired);
		if (next === undefined) {
			return;
		}
		if (!expected && next) {
			additions.push({ file: next, index: patch.index });
		} else {
			replacements.set(id, next);
		}
	}
	const next = files.flatMap((file) => {
		const replacement = replacements.get(file.id);
		return replacement === null ? [] : [replacement ?? file];
	});
	for (const item of additions.sort((a, b) => a.index - b.index)) {
		next.splice(Math.min(next.length, item.index), 0, item.file);
	}
	return validRestoration(files, next, entry.patches, redo) ? next : undefined;
}

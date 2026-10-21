import { expect, test } from "bun:test";
import { finderApplyHistory, finderHistoryEntry } from "../src/finder-history";
import { createFinderTab, type MacFinderFile } from "../src/finder-model";
import {
	type FinderOperation,
	finderClone,
	finderCopyName,
	finderMoveOperation,
	finderOperationSelection,
	finderSubtree,
	finderTrash,
} from "../src/finder-operations";

const files: MacFinderFile[] = [
	{ id: "root", kind: "folder", name: "Workspace" },
	{ id: "a", kind: "folder", name: "Source", parentId: "root" },
	{ id: "b", kind: "folder", name: "Archive", parentId: "root" },
	{ id: "brand", kind: "folder", name: "Brand", parentId: "a" },
	{
		id: "note",
		kind: "text",
		name: "Notes.txt",
		parentId: "a",
		preview: { text: "Original text" },
	},
	{ id: "colors", kind: "text", name: "Colors.txt", parentId: "brand" },
];
const factory = () => {
	let index = 0;
	return () => {
		index += 1;
		return `copy-${index}`;
	};
};
const required = (value: FinderOperation | undefined) => {
	if (!value) {
		throw new Error("Expected a valid operation");
	}
	return value;
};

test("folder copies remap every parent and ID, preserve previews and leave original records untouched", () => {
	const before = JSON.stringify(files);
	const operation = required(
		finderClone(files, ["a", "note"], "b", factory()).value
	);
	expect(operation.ids).toEqual(["copy-1"]);
	expect(operation.files.find((file) => file.id === "copy-1")).toMatchObject({
		name: "Source",
		parentId: "b",
	});
	expect(operation.files.find((file) => file.id === "copy-2")).toMatchObject({
		name: "Brand",
		parentId: "copy-1",
	});
	expect(
		operation.files.find(
			(file) => file.name === "Notes.txt" && file.id !== "note"
		)?.preview?.text
	).toBe("Original text");
	expect(
		operation.files.find(
			(file) => file.name === "Colors.txt" && file.id !== "colors"
		)?.parentId
	).toBe("copy-2");
	expect(JSON.stringify(files)).toBe(before);
});
test("duplicate names spare extensions, folders, dotfiles and existing copy suffixes", () => {
	const name = (filename: string, kind: MacFinderFile["kind"] = "text") =>
		finderCopyName(
			{ id: "x", kind, name: filename },
			new Set(["notes copy.txt", "notes copy 2.txt"]),
			true
		);
	expect(name("Notes.txt")).toBe("Notes copy 3.txt");
	expect(name("Notes copy.txt")).toBe("Notes copy 3.txt");
	expect(name("Design.v2", "folder")).toBe("Design.v2 copy");
	expect(name(".env")).toBe(".env copy");
	expect(
		finderCopyName({ id: "x", name: "Café.txt" }, new Set(["café.txt"]), false)
	).toBe("Café copy.txt");
});
test("copy and duplicate reject unavailable branches, recursive targets, locked destinations and ID collisions", () => {
	expect(finderClone(files, ["a"], "brand", factory()).value).toBeUndefined();
	expect(finderClone(files, ["root"], "b", factory()).value).toBeUndefined();
	expect(finderClone(files, ["missing"], "b", factory()).value).toBeUndefined();
	expect(finderClone(files, ["a"], "b", () => "note").value).toBeUndefined();
	expect(
		finderClone(
			files.map((file) => (file.id === "b" ? { ...file, locked: true } : file)),
			["a"],
			"b",
			factory()
		).value
	).toBeUndefined();
	expect(
		finderSubtree(
			files.map((file) =>
				file.id === "colors" ? { ...file, disabled: true } : file
			),
			["a"]
		)
	).toBeUndefined();
});
test("Trash removes an entire subtree atomically and protects locked files and the root", () => {
	const operation = required(finderTrash(files, ["a", "colors"]).value);
	expect(operation.ids).toEqual(["a"]);
	expect(operation.files.map((file) => file.id)).toEqual(["root", "b"]);
	expect(finderTrash(files, ["root"]).value).toBeUndefined();
	expect(
		finderTrash(
			files.map((file) =>
				file.id === "colors" ? { ...file, locked: true } : file
			),
			["a"]
		).value
	).toBeUndefined();
});
test("copy, duplicate, move and Trash round-trip through Undo and Redo without changing IDs", () => {
	const operations = [
		finderClone(files, ["a"], "b", factory()),
		finderClone(files, ["note"], undefined, factory()),
		finderMoveOperation(files, ["note"], "b"),
		finderTrash(files, ["a"]),
	];
	for (const result of operations) {
		const operation = required(result.value);
		const entry = finderHistoryEntry(files, operation);
		const undone = finderApplyHistory(operation.files, entry, false);
		expect(undone).toEqual(files);
		expect(undone && finderApplyHistory(undone, entry, true)).toEqual(
			operation.files
		);
	}
});
test("undoing a rename preserves unrelated field and file changes, and refuses a newer rename", () => {
	const after = files.map((file) =>
		file.id === "note" ? { ...file, name: "Renamed.txt" } : file
	);
	const entry = finderHistoryEntry(files, {
		files: after,
		ids: ["note"],
		label: "Rename",
		operation: "rename",
	});
	const external = after.map((file) =>
		file.id === "note" ? { ...file, comments: "New caller comment" } : file
	);
	const unrelated: MacFinderFile = {
		id: "external",
		name: "External.txt",
		parentId: "root",
	};
	const undone = finderApplyHistory([...external, unrelated], entry, false);
	expect(undone?.find((file) => file.id === "note")).toMatchObject({
		comments: "New caller comment",
		name: "Notes.txt",
	});
	expect(undone).toContain(unrelated);
	expect(
		finderApplyHistory(
			after.map((file) =>
				file.id === "note" ? { ...file, name: "Newer.txt" } : file
			),
			entry,
			false
		)
	).toBeUndefined();
});
test("restoring Trash refuses a missing parent, duplicate name or reused ID", () => {
	const operation = required(finderTrash(files, ["note"]).value);
	const entry = finderHistoryEntry(files, operation);
	expect(
		finderApplyHistory(
			operation.files.filter((file) => file.id !== "a"),
			entry,
			false
		)
	).toBeUndefined();
	expect(
		finderApplyHistory(
			[
				...operation.files,
				{ id: "conflict", name: "NOTES.TXT", parentId: "a" },
			],
			entry,
			false
		)
	).toBeUndefined();
	expect(
		finderApplyHistory(
			[...operation.files, { id: "note", name: "Reused.txt", parentId: "b" }],
			entry,
			false
		)
	).toBeUndefined();
});
test("Undo never removes an added folder's new children or a copy edited by the caller", () => {
	const operation = required(finderClone(files, ["a"], "b", factory()).value);
	const entry = finderHistoryEntry(files, operation);
	expect(
		finderApplyHistory(
			[
				...operation.files,
				{ id: "new-child", name: "New.txt", parentId: operation.ids[0] },
			],
			entry,
			false
		)
	).toBeUndefined();
	expect(
		finderApplyHistory(
			operation.files.map((file) =>
				file.id === operation.ids[0] ? { ...file, comments: "User edit" } : file
			),
			entry,
			false
		)
	).toBeUndefined();
});
test("an Undo move detects destination changes that would introduce a cycle", () => {
	const operation = required(finderMoveOperation(files, ["brand"], "b").value);
	const entry = finderHistoryEntry(files, operation);
	const changed = operation.files.map((file) =>
		file.id === "a" ? { ...file, parentId: "brand" } : file
	);
	expect(finderApplyHistory(changed, entry, false)).toBeUndefined();
});

test("operation selection retains nested list and ancestor column results without selecting other folders", () => {
	const tab = { ...createFinderTab("main", "a"), view: "list" as const };
	expect(
		finderOperationSelection(files, ["colors", "note", "b"], tab, [])
	).toEqual(["colors", "note"]);
	const column = { ...tab, columnRoot: "root", view: "columns" as const };
	expect(
		finderOperationSelection(files, ["a", "b", "note"], column, [])
	).toEqual(["a", "b", "note"]);
	expect(
		finderOperationSelection(
			files,
			["colors", "b"],
			{ ...tab, view: "icons" },
			[]
		)
	).toEqual([]);
	expect(
		finderOperationSelection(
			files,
			["colors", "note"],
			{ ...tab, query: "Notes" },
			[]
		)
	).toEqual(["note"]);
});

test("Undo can remove an unchanged locked copy but respects a subsequently locked parent", () => {
	const original = files.map((file) =>
		file.id === "note" ? { ...file, locked: true } : file
	);
	const copy = required(finderClone(original, ["note"], "b", factory()).value);
	const entry = finderHistoryEntry(original, copy);
	expect(finderApplyHistory(copy.files, entry, false)).toEqual(original);
	expect(
		finderApplyHistory(
			copy.files.map((file) =>
				file.id === "b" ? { ...file, locked: true } : file
			),
			entry,
			false
		)
	).toBeUndefined();
	expect(
		finderApplyHistory(
			copy.files.map((file) =>
				file.id === copy.ids[0]
					? { ...file, comments: "New caller data" }
					: file
			),
			entry,
			false
		)
	).toBeUndefined();
});

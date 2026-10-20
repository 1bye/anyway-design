import { expect, test } from "bun:test";
import type { MacFileListItem } from "../src/file-list";
import {
	fileListArrowAction,
	flattenFileList,
	visibleFileListAncestor,
	visibleFileListRows,
} from "../src/file-list-tree";

const items: MacFileListItem[] = [
	{ children: [], id: "z", kind: "folder", name: "Zeta" },
	{
		children: [
			{ id: "a/10", kind: "image", name: "Photo 10.webp", size: 10 },
			{
				children: [{ id: "a/b/type", kind: "text", name: "Type.txt" }],
				id: "a/b",
				kind: "folder",
				name: "Brand",
			},
			{ id: "a/2", kind: "image", name: "Photo 2.webp", size: 2 },
		],
		id: "a",
		kind: "folder",
		name: "Alpha",
	},
	{
		children: [{ id: "offline/hidden", kind: "text", name: "Hidden.txt" }],
		disabled: true,
		id: "offline",
		kind: "folder",
		name: "Unavailable",
	},
];
const sort = { column: "name", direction: "ascending" } as const;

test("hierarchy sorting stays within each folder and records depth, parent, and sibling positions", () => {
	const before = JSON.stringify(items);
	const rows = flattenFileList(items, sort);
	expect(rows.map((row) => row.file.id)).toEqual([
		"a",
		"a/b",
		"a/b/type",
		"a/2",
		"a/10",
		"offline",
		"offline/hidden",
		"z",
	]);
	expect(rows[2]).toMatchObject({
		depth: 2,
		parentId: "a/b",
		position: 1,
		siblingCount: 1,
	});
	expect(rows[4]).toMatchObject({
		depth: 1,
		parentId: "a",
		position: 3,
		siblingCount: 3,
	});
	expect(
		flattenFileList(items, { ...sort, direction: "descending" }).map(
			(row) => row.file.id
		)
	).toEqual([
		"z",
		"offline",
		"offline/hidden",
		"a",
		"a/10",
		"a/2",
		"a/b",
		"a/b/type",
	]);
	expect(JSON.stringify(items)).toBe(before);
});

test("collapsed and disabled branches hide descendants while retaining nested expansion state", () => {
	const rows = flattenFileList(items, sort);
	expect(visibleFileListRows(rows, []).map((row) => row.file.id)).toEqual([
		"a",
		"offline",
		"z",
	]);
	expect(
		visibleFileListRows(rows, ["a", "offline"]).map((row) => row.file.id)
	).toEqual(["a", "a/b", "a/2", "a/10", "offline", "z"]);
	expect(visibleFileListRows(rows, ["a/b"]).map((row) => row.file.id)).toEqual([
		"a",
		"offline",
		"z",
	]);
	expect(
		visibleFileListRows(rows, ["a", "a/b"]).map((row) => row.file.id)
	).toEqual(["a", "a/b", "a/b/type", "a/2", "a/10", "offline", "z"]);
	expect(visibleFileListRows([], [])).toEqual([]);
});

test("focus recovers to the nearest visible ancestor without choosing a disabled file", () => {
	const rows = flattenFileList(items, sort);
	expect(visibleFileListAncestor(rows, new Set(["a", "a/b"]), "a/b/type")).toBe(
		"a/b"
	);
	expect(visibleFileListAncestor(rows, new Set(["a"]), "a/b/type")).toBe("a");
	expect(
		visibleFileListAncestor(rows, new Set(["offline"]), "offline/hidden")
	).toBeUndefined();
	expect(
		visibleFileListAncestor(rows, new Set(["a"]), "removed")
	).toBeUndefined();
});

test("Finder arrows open in place, close expanded folders, and select a parent from children", () => {
	const rows = flattenFileList(items, sort);
	const folder = rows.find((row) => row.file.id === "a/b");
	const child = rows.find((row) => row.file.id === "a/b/type");
	const disabled = rows.find((row) => row.file.id === "offline");
	if (!(folder && child && disabled)) {
		throw new Error("Missing tree fixture");
	}
	expect(fileListArrowAction(folder, "ArrowRight", false)).toEqual({
		id: "a/b",
		type: "expand",
	});
	expect(fileListArrowAction(folder, "ArrowRight", true)).toEqual({
		id: "a/b",
		type: "expand",
	});
	expect(fileListArrowAction(folder, "ArrowLeft", true)).toEqual({
		id: "a/b",
		type: "collapse",
	});
	expect(fileListArrowAction(folder, "ArrowLeft", false)).toEqual({
		id: "a",
		type: "focus",
	});
	expect(fileListArrowAction(child, "ArrowLeft", false)).toEqual({
		id: "a/b",
		type: "focus",
	});
	expect(fileListArrowAction(child, "ArrowRight", false)).toBeUndefined();
	expect(fileListArrowAction(disabled, "ArrowRight", false)).toBeUndefined();
	expect(fileListArrowAction(folder, "ArrowDown", false)).toBeUndefined();
});

test("kind sorting uses the same defaults at every depth", () => {
	const tree: MacFileListItem[] = [
		{
			children: [
				{ id: "text", kind: "text", name: "B" },
				{ id: "folder", kind: "folder", name: "Z" },
				{ id: "image", kind: "image", name: "A" },
			],
			id: "root",
			kind: "folder",
			name: "Root",
		},
	];
	expect(
		flattenFileList(tree, { column: "kind", direction: "ascending" }).map(
			(row) => row.file.id
		)
	).toEqual(["root", "folder", "image", "text"]);
});

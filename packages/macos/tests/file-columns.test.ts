import { expect, test } from "bun:test";
import {
	fileBrowserColumns,
	fileBrowserColumnWidth,
	fileColumnArrow,
	fileColumnPath,
	type MacFileColumnItem,
} from "../src/file-column-model";

const sort = { column: "name", direction: "ascending" } as const;
const items: MacFileColumnItem[] = [
	{ children: [], id: "empty", kind: "folder", name: "Archive" },
	{
		children: [
			{
				children: [
					{ id: "ten", name: "Color 10.txt" },
					{ id: "two", name: "Color 2.txt" },
					{ disabled: true, id: "disabled", name: "Color 3.txt" },
				],
				id: "nested",
				kind: "folder",
				name: "Brand",
			},
			{ id: "readme", name: "Read me.txt" },
		],
		id: "folder",
		kind: "folder",
		name: "Design",
	},
	{
		children: [{ id: "hidden", name: "Hidden.txt" }],
		disabled: true,
		id: "locked",
		kind: "folder",
		name: "Offline",
	},
];

test("a file path selects ancestors and creates sorted sibling columns without mutating input", () => {
	const path = fileColumnPath(items, "two");
	expect(path.map((file) => file.id)).toEqual(["folder", "nested", "two"]);
	const columns = fileBrowserColumns(items, path, sort);
	expect(columns.map((column) => column.selectedId)).toEqual([
		"folder",
		"nested",
		"two",
	]);
	expect(columns[2].items.map((file) => file.id)).toEqual([
		"two",
		"disabled",
		"ten",
	]);
	expect(items[1].children?.[0].children?.[0].id).toBe("ten");
});

test("empty folders keep an empty column; missing, disabled and hidden selections cannot expose branches", () => {
	expect(
		fileBrowserColumns(items, fileColumnPath(items, "empty"), sort)
	).toHaveLength(2);
	expect(
		fileBrowserColumns(items, fileColumnPath(items, "empty"), sort)[1].items
	).toEqual([]);
	for (const id of [undefined, "missing", "hidden", "locked", "disabled"]) {
		expect(fileColumnPath(items, id)).toEqual([]);
	}
	const columns = fileBrowserColumns(
		items,
		fileColumnPath(items, "readme"),
		sort
	);
	expect(columns).toHaveLength(2);
	expect(columns[1].items.map((file) => file.id)).toEqual(["nested", "readme"]);
});

test("Left returns to the parent and Right enters the first enabled sorted child", () => {
	const columns = fileBrowserColumns(items, fileColumnPath(items, "two"), sort);
	expect(fileColumnArrow(columns[0], "folder", "ArrowRight", sort)).toBe(
		"nested"
	);
	expect(fileColumnArrow(columns[1], "nested", "ArrowRight", sort)).toBe("two");
	expect(fileColumnArrow(columns[2], "two", "ArrowLeft", sort)).toBe("nested");
	expect(
		fileColumnArrow(columns[0], "folder", "ArrowLeft", sort)
	).toBeUndefined();
	expect(
		fileColumnArrow(columns[0], "empty", "ArrowRight", sort)
	).toBeUndefined();
	expect(fileColumnArrow(columns[2], "two", "ArrowDown", sort)).toBe("ten");
	expect(fileColumnArrow(columns[2], "ten", "ArrowDown", sort)).toBe("ten");
	expect(fileColumnArrow(columns[2], "ten", "Home", sort)).toBe("two");
	expect(fileColumnArrow(columns[2], "two", "End", sort)).toBe("ten");
	expect(fileColumnArrow(columns[2], "disabled", "Home", sort)).toBeUndefined();
});

test("column resizing rejects nonfinite widths and enforces pointer and keyboard bounds", () => {
	expect(fileBrowserColumnWidth(Number.NaN)).toBe(245);
	expect(fileBrowserColumnWidth(Number.POSITIVE_INFINITY)).toBe(245);
	expect(fileBrowserColumnWidth(20)).toBe(160);
	expect(fileBrowserColumnWidth(900)).toBe(600);
	expect(fileBrowserColumnWidth(279.5)).toBe(279.5);
});

test("kind sorting supplies the same default kind labels as the other file views", () => {
	const columns = fileBrowserColumns(
		[
			{ id: "text", kind: "text", name: "A.txt" },
			{ children: [], id: "folder", kind: "folder", name: "Z" },
		],
		[],
		{ column: "kind", direction: "ascending" }
	);
	expect(columns[0].items.map((file) => file.id)).toEqual(["folder", "text"]);
	expect(columns[0].items[0].kindLabel).toBe("Folder");
});

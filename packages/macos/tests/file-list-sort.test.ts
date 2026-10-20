import { expect, test } from "bun:test";
import { fileColumnWidth, sortFileList } from "../src/file-list-sort";

test("file sorting uses natural names and preserves selection identities and input order", () => {
	const items = [
		{ id: "ten", name: "Photo 10.jpg" },
		{ id: "two", name: "Photo 2.jpg" },
		{ id: "archive", name: "Archive" },
	];
	expect(
		sortFileList(items, { column: "name", direction: "ascending" }).map(
			(item) => item.id
		)
	).toEqual(["archive", "two", "ten"]);
	expect(
		sortFileList(items, { column: "name", direction: "descending" }).map(
			(item) => item.id
		)
	).toEqual(["ten", "two", "archive"]);
	expect(items.map((item) => item.id)).toEqual(["ten", "two", "archive"]);
});

test("numeric sorting uses bytes and timestamps rather than display labels", () => {
	const items = [
		{ modifiedAt: 300, name: "a", size: 1200, sizeLabel: "1.2 KB" },
		{ modifiedAt: 100, name: "b", size: 90, sizeLabel: "90 bytes" },
		{ modifiedAt: 200, name: "c", size: 1200, sizeLabel: "1.2 KB" },
		{ name: "folder" },
		{ name: "invalid", size: Number.NaN },
	];
	expect(
		sortFileList(items, { column: "size", direction: "ascending" }).map(
			(item) => item.name
		)
	).toEqual(["b", "a", "c", "folder", "invalid"]);
	expect(
		sortFileList(items, { column: "size", direction: "descending" }).map(
			(item) => item.name
		)
	).toEqual(["a", "c", "b", "folder", "invalid"]);
	expect(
		sortFileList(items, { column: "modified", direction: "descending" }).map(
			(item) => item.name
		)
	).toEqual(["a", "c", "b", "folder", "invalid"]);
	expect(
		sortFileList(
			[
				{ kindLabel: "Text", name: "b" },
				{ kindLabel: "Folder", name: "a" },
			],
			{ column: "kind", direction: "ascending" }
		).map((item) => item.name)
	).toEqual(["a", "b"]);
});

test("column widths have finite keyboard and pointer bounds", () => {
	expect(fileColumnWidth("name", 20)).toBe(140);
	expect(fileColumnWidth("size", 9999)).toBe(240);
	expect(fileColumnWidth("modified", 181.5)).toBe(181.5);
	expect(fileColumnWidth("kind", Number.NaN)).toBe(150);
});

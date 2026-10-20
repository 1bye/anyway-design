import { expect, test } from "bun:test";
import {
	fileDialogAccepts,
	fileDialogColumns,
	fileDialogItems,
	fileDialogSaveTarget,
	fileDialogTrail,
	type MacFileDialogDirectory,
} from "../src/file-dialog-model";

const text = { extensions: [".txt"], id: "text", label: "Plain Text" };

test("filters allow folders, match extensions case-insensitively, and support all files", () => {
	expect(fileDialogAccepts({ kind: "folder", name: "Photos" }, text)).toBe(
		true
	);
	expect(fileDialogAccepts({ name: "NOTES.TXT" }, text)).toBe(true);
	expect(fileDialogAccepts({ name: "Notes.txt.exe" }, text)).toBe(false);
	expect(fileDialogAccepts({ name: "Photo.webp" })).toBe(true);
});

test("dialog columns connect supplied folders and keep search local without changing source data", () => {
	const directories: MacFileDialogDirectory[] = [
		{
			id: "root",
			items: [
				{ id: "design", kind: "folder", name: "Design" },
				{ id: "root-file", name: "Other.txt" },
				{ disabled: true, id: "locked", kind: "folder", name: "Locked" },
			],
			name: "Demo",
		},
		{
			id: "design",
			items: [
				{ id: "notes", name: "Notes.TXT" },
				{ id: "image", name: "Photo.webp" },
			],
			name: "Design",
			parentId: "root",
		},
		{
			id: "locked",
			items: [{ id: "secret", name: "Hidden.txt" }],
			name: "Locked",
			parentId: "root",
		},
	];
	const columns = fileDialogColumns(directories, "design", "NOTE", text);
	expect(columns.map((item) => item.id)).toEqual([
		"design",
		"root-file",
		"locked",
	]);
	expect(columns[0].children?.map((item) => item.id)).toEqual(["notes"]);
	expect(columns[2].children).toBeUndefined();
	expect(
		fileDialogColumns(directories, "design", "", text)[0].children?.[1].disabled
	).toBe(true);
	expect(
		fileDialogColumns(directories, "design", "", undefined)[0].children?.[1]
			.disabled
	).toBe(false);
	expect(fileDialogItems(directories[1], "Photo", text)[0].disabled).toBe(true);
	expect(directories[0].items[0].children).toBeUndefined();
	expect(directories[1].items).toHaveLength(2);
	expect(fileDialogColumns(directories, "missing", "", text)).toEqual([]);
});

test("dialog column data tolerates empty folders, missing directory records, and cycles", () => {
	const directories: MacFileDialogDirectory[] = [
		{
			id: "a",
			items: [{ id: "b", kind: "folder", name: "B" }],
			name: "A",
			parentId: "b",
		},
		{
			id: "b",
			items: [
				{ id: "a", kind: "folder", name: "A" },
				{ id: "empty", kind: "folder", name: "Empty" },
				{ id: "missing", kind: "folder", name: "Missing" },
			],
			name: "B",
			parentId: "a",
		},
		{ id: "empty", items: [], name: "Empty", parentId: "b" },
	];
	const columns = fileDialogColumns(directories, "b", "");
	expect(columns[0].children?.[0].children).toBeUndefined();
	expect(columns[0].children?.[1].children).toEqual([]);
	expect(columns[0].children?.[2].children).toBeUndefined();
});

test("save validates names and extensions before detecting replacement", () => {
	const items = [
		{ id: "existing", name: "Résumé.txt" },
		{ id: "folder", kind: "folder" as const, name: "Resources.txt" },
	];
	expect(fileDialogSaveTarget("Brief", items, text)).toEqual({
		name: "Brief.txt",
		replaceId: undefined,
	});
	expect(
		fileDialogSaveTarget("RE\u0301SUME\u0301.TXT", items, text).replaceId
	).toBe("existing");
	expect(
		fileDialogSaveTarget("Resources.txt", items, text).error
	).toBeDefined();
	for (const name of ["", "  ", "../Notes", "disk:name", "brief.pdf"]) {
		expect(fileDialogSaveTarget(name, items, text).error).toBeDefined();
	}
	expect(fileDialogSaveTarget(".env", [], undefined).error).toBeUndefined();
	expect(
		fileDialogSaveTarget(
			"locked.txt",
			[{ disabled: true, id: "locked", name: "locked.txt" }],
			text
		).error
	).toBeDefined();
	expect(
		fileDialogSaveTarget("Brief", [], {
			extensions: ["folder/file"],
			id: "invalid",
			label: "Invalid",
		}).error
	).toBeDefined();
});

test("directory trails tolerate missing parents and cycles in caller data", () => {
	const directories = [
		{ id: "root", items: [], name: "Demo" },
		{ id: "child", items: [], name: "Photos", parentId: "root" },
	];
	expect(
		fileDialogTrail(directories, "child").map((directory) => directory.id)
	).toEqual(["root", "child"]);
	expect(fileDialogTrail(directories, "unknown")).toEqual([]);
	expect(
		fileDialogTrail(
			[{ ...directories[0], parentId: "child" }, directories[1]],
			"child"
		)
	).toHaveLength(2);
});

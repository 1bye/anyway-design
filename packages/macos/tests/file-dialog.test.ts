import { expect, test } from "bun:test";
import {
	fileDialogAccepts,
	fileDialogSaveTarget,
	fileDialogTrail,
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

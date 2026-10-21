import { expect, test } from "bun:test";
import {
	fileNewFolderError,
	fileNewFolderName,
	isNewFolderKey,
} from "../src/file-new-folder";

test("New Folder chooses the first available native name without mutating siblings", () => {
	const items = [
		{ id: "first", name: "UNTITLED FOLDER" },
		{ id: "second", name: "untitled folder 2" },
		{ id: "fourth", name: "untitled folder 4" },
	];
	expect(fileNewFolderName([])).toBe("untitled folder");
	expect(fileNewFolderName(items)).toBe("untitled folder 3");
	expect(items).toHaveLength(3);
});

test("New Folder validates every sibling, including files, Unicode and records without IDs", () => {
	const items = [{ name: "Résumé" }, { id: "locked", name: "Taken" }];
	expect(fileNewFolderError("RE\u0301SUME\u0301", items)).toBe(
		"This name is already taken."
	);
	expect(fileNewFolderError("taken", items)).toBe(
		"This name is already taken."
	);
	expect(fileNewFolderError("Taken", items, "locked")).toBeUndefined();
	for (const name of [
		"",
		" ",
		".",
		"..",
		"folder/name",
		"folder:name",
		"name\n",
	]) {
		expect(fileNewFolderError(name, [])).toBeDefined();
	}
	expect(fileNewFolderError(".hidden", [])).toBeUndefined();
	expect(fileNewFolderError("Project.v2", [])).toBeUndefined();
	expect(fileNewFolderError(" Folder ", [])).toBeUndefined();
});

test("New Folder uses Command/Control Shift N and leaves other shortcuts alone", () => {
	const plain = {
		altKey: false,
		ctrlKey: false,
		key: "N",
		metaKey: true,
		shiftKey: true,
	};
	expect(isNewFolderKey(plain)).toBe(true);
	expect(
		isNewFolderKey({ ...plain, ctrlKey: true, key: "n", metaKey: false })
	).toBe(true);
	for (const event of [
		{ ...plain, shiftKey: false },
		{ ...plain, metaKey: false },
		{ ...plain, altKey: true },
		{ ...plain, key: "m" },
	]) {
		expect(isNewFolderKey(event)).toBe(false);
	}
});

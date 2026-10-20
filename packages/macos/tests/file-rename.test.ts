import { expect, test } from "bun:test";
import { requestFileOpen } from "../src/file-interactions";
import {
	fileRenameError,
	fileRenameSelection,
	isRenameKey,
} from "../src/file-rename";

test("rename selects the basename and keeps dotfiles and dotted folders whole", () => {
	for (const [name, end] of [
		["Agreement for Services.pdf", 22],
		["archive.tar.gz", 11],
		["README", 6],
		[".env.local", 10],
		[".gitignore", 10],
		["report.", 7],
		["Résumé.pdf", 6],
	] as const) {
		expect(fileRenameSelection(name)).toBe(end);
	}
	expect(fileRenameSelection("Project.v2", true)).toBe(10);
});

test("rename rejects empty, navigation, separator, and control-character names without trimming valid input", () => {
	for (const name of [
		"",
		"  ",
		".",
		"..",
		"folder/file",
		"disk:name",
		"a\u0000b",
		"a\nb",
		"a\tb",
		"a\u007fb",
	]) {
		expect(fileRenameError(name)).toBeDefined();
	}
	for (const name of [
		"Résumé.pdf",
		".env.local",
		"archive.tar.gz",
		"📸 Photo.webp",
		" File with spaces .txt",
	]) {
		expect(fileRenameError(name)).toBeUndefined();
	}
});

test("only an unmodified Return requests inline renaming", () => {
	const key = {
		altKey: false,
		ctrlKey: false,
		key: "Enter",
		metaKey: false,
		shiftKey: false,
	};
	expect(isRenameKey(key)).toBe(true);
	for (const modifier of [
		"altKey",
		"ctrlKey",
		"metaKey",
		"shiftKey",
	] as const) {
		expect(isRenameKey({ ...key, [modifier]: true })).toBe(false);
	}
	expect(isRenameKey({ ...key, key: " " })).toBe(false);
});

test("file opening accepts Return or Command/Control-O and does not repeat", () => {
	const opened: string[] = [];
	let prevented = 0;
	const key = {
		altKey: false,
		ctrlKey: false,
		key: "Enter",
		metaKey: false,
		preventDefault: () => {
			prevented += 1;
		},
		repeat: false,
		shiftKey: false,
	};
	const open = (id: string) => opened.push(id);
	expect(requestFileOpen(key, "a", open)).toBe(true);
	expect(requestFileOpen({ ...key, key: "o", metaKey: true }, "b", open)).toBe(
		true
	);
	expect(requestFileOpen({ ...key, ctrlKey: true, key: "o" }, "c", open)).toBe(
		true
	);
	expect(requestFileOpen({ ...key, repeat: true }, "a", open)).toBe(true);
	expect(requestFileOpen({ ...key, key: "o" }, "a", open)).toBe(false);
	expect(
		requestFileOpen(
			{ ...key, key: "o", metaKey: true, shiftKey: true },
			"a",
			open
		)
	).toBe(false);
	expect(
		requestFileOpen(
			{ ...key, altKey: true, ctrlKey: true, key: "o" },
			"a",
			open
		)
	).toBe(false);
	expect(requestFileOpen({ ...key, key: " " }, "a", open)).toBe(false);
	expect(opened).toEqual(["a", "b", "c"]);
	expect(prevented).toBe(4);
});

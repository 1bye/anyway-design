import { expect, test } from "bun:test";
import {
	fileInfoDisplayName,
	fileInfoGeneral,
	fileInfoHasExtension,
	fileInfoNameError,
	type MacFileInfoItem,
} from "../src/file-info-model";
import { requestFileInfo } from "../src/file-interactions";

const file: MacFileInfoItem = {
	id: "photo",
	kind: "image",
	name: "Clouds.webp",
};

test("Get Info hides only the last suffix and preserves the canonical name", () => {
	expect(fileInfoDisplayName({ ...file, extensionHidden: true })).toBe(
		"Clouds"
	);
	expect(fileInfoDisplayName(file)).toBe("Clouds.webp");
	expect(file.name).toBe("Clouds.webp");
	expect(
		fileInfoDisplayName({
			...file,
			extensionHidden: true,
			name: "archive.tar.gz",
		})
	).toBe("archive.tar");
	for (const item of [
		{ ...file, name: ".env.local" },
		{ ...file, name: "report." },
		{ ...file, name: "README" },
		{ ...file, kind: "folder" as const, name: "Project.v2" },
	]) {
		expect(fileInfoHasExtension(item)).toBe(false);
		expect(fileInfoDisplayName({ ...item, extensionHidden: true })).toBe(
			item.name
		);
	}
});

test("Get Info uses supplied metadata and never invents dates or sizes", () => {
	expect(fileInfoGeneral(file)).toEqual([{ label: "Kind", value: "Image" }]);
	expect(
		fileInfoGeneral({
			...file,
			kindLabel: "WebP Image",
			modifiedLabel: "Today",
			sizeLabel: "46 KB",
		})
	).toEqual([
		{ label: "Kind", value: "WebP Image" },
		{ label: "Size", value: "46 KB" },
		{ label: "Modified", value: "Today" },
	]);
	const details = [{ label: "Where", value: "A supplied location" }];
	expect(fileInfoGeneral({ ...file, general: details })).toBe(details);
	expect(fileInfoGeneral({ ...file, general: [] })).toEqual([]);
});

test("Get Info validates names and respects locked files and caller collisions", () => {
	const validated: string[] = [];
	const validate = (id: string, name: string) => {
		validated.push(`${id}:${name}`);
		return name === "Taken.webp" ? "Already exists." : undefined;
	};
	for (const name of ["", " ", ".", "..", "a/b", "a:b", "a\nb"]) {
		expect(fileInfoNameError(file, name, validate)).toBeDefined();
	}
	expect(validated).toEqual([]);
	expect(
		fileInfoNameError({ ...file, locked: true }, "New.webp", validate)
	).toBe("The file is locked.");
	expect(validated).toEqual([]);
	expect(fileInfoNameError(file, "Taken.webp", validate)).toBe(
		"Already exists."
	);
	expect(fileInfoNameError(file, "Résumé.webp", validate)).toBeUndefined();
	expect(validated).toEqual(["photo:Taken.webp", "photo:Résumé.webp"]);
});

test("Get Info shortcut accepts Command or Control I once and leaves unrelated keys alone", () => {
	const requested: string[] = [];
	let prevented = 0;
	const key = {
		altKey: false,
		ctrlKey: false,
		key: "i",
		metaKey: true,
		preventDefault: () => {
			prevented += 1;
		},
		repeat: false,
		shiftKey: false,
	};
	const info = (id: string) => requested.push(id);
	expect(requestFileInfo(key, "a", info)).toBe(true);
	expect(
		requestFileInfo(
			{ ...key, ctrlKey: true, key: "I", metaKey: false },
			"b",
			info
		)
	).toBe(true);
	expect(requestFileInfo({ ...key, repeat: true }, "a", info)).toBe(true);
	for (const changes of [
		{ altKey: true },
		{ shiftKey: true },
		{ metaKey: false },
		{ key: "o" },
		{ defaultPrevented: true },
		{ nativeEvent: { isComposing: true } },
	]) {
		expect(requestFileInfo({ ...key, ...changes }, "a", info)).toBe(false);
	}
	expect(requestFileInfo(key, "a")).toBe(false);
	expect(requested).toEqual(["a", "b"]);
	expect(prevented).toBe(3);
});

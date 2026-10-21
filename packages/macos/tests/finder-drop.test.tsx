import { expect, test } from "bun:test";
import { finderDragFiles, finderMove } from "../src/finder-drop";
import type { MacFinderFile } from "../src/finder-model";

const files: MacFinderFile[] = [
	{ id: "root", kind: "folder", name: "Root" },
	{ id: "a", kind: "folder", name: "Source", parentId: "root" },
	{ id: "b", kind: "folder", name: "Destination", parentId: "root" },
	{ id: "child", kind: "folder", name: "Child", parentId: "a" },
	{ id: "leaf", kind: "text", name: "Notes.txt", parentId: "child" },
	{ id: "image", kind: "image", name: "Clouds.webp", parentId: "a" },
	{
		id: "locked",
		kind: "folder",
		locked: true,
		name: "Locked",
		parentId: "root",
	},
	{
		disabled: true,
		id: "offline",
		kind: "folder",
		name: "Offline",
		parentId: "root",
	},
];
test("dragging a selected file keeps its group; an unselected file starts its own group", () => {
	expect(
		finderDragFiles(files, ["image", "leaf"], "image").map((file) => file.id)
	).toEqual(["image", "leaf"]);
	expect(
		finderDragFiles(files, ["image", "leaf"], "leaf").map((file) => file.id)
	).toEqual(["leaf", "image"]);
	expect(
		finderDragFiles(files, ["image", "leaf"], "child").map((file) => file.id)
	).toEqual(["child"]);
});
test("moves preserve caller data and collapse selected descendants into their parent", () => {
	const before = JSON.stringify(files);
	expect(finderMove(files, ["child", "leaf", "image", "image"], "b")).toEqual({
		ids: ["child", "image"],
	});
	expect(JSON.stringify(files)).toBe(before);
});
test("a move cannot create a cycle or move the root", () => {
	for (const destination of ["a", "child"]) {
		expect(finderMove(files, ["a"], destination).ids).toEqual([]);
	}
	expect(finderMove(files, ["root"], "b").ids).toEqual([]);
});
test("disabled, locked, stale, and non-folder targets reject the entire move", () => {
	for (const destination of ["locked", "offline", "missing", "leaf"]) {
		expect(finderMove(files, ["image"], destination).ids).toEqual([]);
	}
	for (const source of ["locked", "offline", "missing"]) {
		expect(finderMove(files, ["image", source], "b").ids).toEqual([]);
	}
	expect(finderMove(files, [], "b").ids).toEqual([]);
});
test("same-folder moves are no-ops, while mixed collection selections move only changing items", () => {
	expect(finderMove(files, ["image"], "a").ids).toEqual([]);
	expect(finderMove(files, ["image", "leaf"], "a").ids).toEqual(["leaf"]);
});
test("conflicting names are rejected atomically, including case and Unicode equivalents", () => {
	const destination: MacFinderFile = {
		id: "other",
		name: "CLOUDS.WEBP",
		parentId: "b",
	};
	expect(
		finderMove([...files, destination], ["image", "leaf"], "b").ids
	).toEqual([]);
	const unicode: MacFinderFile[] = [
		{ id: "composed", name: "Café.txt", parentId: "a" },
		{ id: "decomposed", name: "Cafe\u0301.txt", parentId: "b" },
	];
	expect(finderMove([...files, ...unicode], ["composed"], "b").ids).toEqual([]);
	const duplicate = { ...files[5], id: "duplicate", parentId: "child" };
	expect(
		finderMove([...files, duplicate], ["image", "duplicate"], "b").ids
	).toEqual([]);
});

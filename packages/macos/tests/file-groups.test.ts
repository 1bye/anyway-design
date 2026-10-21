import { expect, test } from "bun:test";
import { groupFileItems } from "../src/file-groups";

test("grouped files keep visual group and item order without changing the input", () => {
	const files = [
		{ id: "a", kind: "pdf" },
		{ id: "b", kind: "image" },
		{ id: "c", kind: "pdf" },
	];
	const groups = groupFileItems(files, (file) => file.kind);
	expect(
		groups.map((group) => [group.label, group.items.map((file) => file.id)])
	).toEqual([
		["pdf", ["a", "c"]],
		["image", ["b"]],
	]);
	expect(files.map((file) => file.id)).toEqual(["a", "b", "c"]);
	expect(groupFileItems(files)[0].items).toBe(files);
	expect(groupFileItems([], () => "Empty")).toEqual([]);
});

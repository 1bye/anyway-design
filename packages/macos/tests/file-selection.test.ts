import { expect, test } from "bun:test";
import { fileGridNeighbor, selectFileIds } from "../src/file-selection";

test("file selection replaces, toggles, and extends from a stable anchor", () => {
	const ids = ["a", "b", "c", "d"];
	expect(selectFileIds(ids, ["a"], "c")).toEqual(["c"]);
	expect(selectFileIds(ids, ["a"], "c", { toggle: true })).toEqual(["a", "c"]);
	expect(selectFileIds(ids, ["a", "c"], "a", { toggle: true })).toEqual(["c"]);
	expect(selectFileIds(ids, ["b"], "d", { anchor: "b", extend: true })).toEqual(
		["b", "c", "d"]
	);
	expect(
		selectFileIds(ids, ["b", "c", "d"], "a", { anchor: "b", extend: true })
	).toEqual(["a", "b"]);
	expect(
		selectFileIds(ids, ["a"], "d", { anchor: "c", extend: true, toggle: true })
	).toEqual(["a", "c", "d"]);
});

test("ranges skip disabled or removed ids and tolerate a removed anchor", () => {
	expect(
		selectFileIds(["a", "c"], ["a"], "c", { anchor: "a", extend: true })
	).toEqual(["a", "c"]);
	expect(
		selectFileIds(["a", "c"], ["a"], "c", { anchor: "removed", extend: true })
	).toEqual(["c"]);
	expect(selectFileIds(["a"], ["a"], "missing")).toEqual(["a"]);
});

test("vertical navigation follows rendered columns and a short last row", () => {
	const positions = [
		{ id: "a", x: 50, y: 0 },
		{ id: "b", x: 150, y: 0 },
		{ id: "c", x: 250, y: 0 },
		{ id: "d", x: 50, y: 100 },
		{ id: "e", x: 150, y: 100 },
	];
	expect(fileGridNeighbor(positions, "c", "down")).toBe("e");
	expect(fileGridNeighbor(positions, "e", "up")).toBe("b");
	expect(fileGridNeighbor(positions, "b", "up")).toBeUndefined();
	expect(fileGridNeighbor(positions, "missing", "down")).toBeUndefined();
	expect(
		fileGridNeighbor(
			[
				{ id: "a", x: 50, y: 0 },
				{ id: "b", x: 50, y: 100 },
			],
			"a",
			"down"
		)
	).toBe("b");
});

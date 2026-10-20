import { expect, test } from "bun:test";
import { reorderTabs, tabAfterClose, tabDragLayout } from "../src/tab-order";

test("closing skips disabled tabs and falls back left at the end", () => {
	const tabs = [
		{ id: "home" },
		{ disabled: true, id: "locked" },
		{ id: "documents" },
		{ disabled: true, id: "offline" },
	];
	expect(tabAfterClose(tabs, "home")).toBe("documents");
	expect(tabAfterClose(tabs, "documents")).toBe("home");
	expect(tabAfterClose([{ id: "only" }], "only")).toBe("");
	expect(tabAfterClose(tabs, "missing")).toBe("");
	expect(tabAfterClose(tabs.slice(1, 3), "documents")).toBe("");
});

test("drag preview follows the pointer, shifts neighbors across their centers, and clamps to the track", () => {
	const slots = [
		{ id: "a", left: 0, width: 100 },
		{ id: "b", left: 100, width: 100 },
		{ id: "c", left: 200, width: 100 },
	];
	const before = tabDragLayout(slots, "c", -75);
	expect(before.order).toEqual(["a", "b", "c"]);
	expect(before.offsets.get("c")).toBe(-75);
	const crossed = tabDragLayout(slots, "c", -125);
	expect(crossed.order).toEqual(["a", "c", "b"]);
	expect(crossed.offsets.get("c")).toBe(-125);
	expect(crossed.offsets.get("b")).toBe(100);
	expect(tabDragLayout(slots, "c", -1000).offsets.get("c")).toBe(-200);
	expect(tabDragLayout(slots, "a", 1000).offsets.get("a")).toBe(200);
	expect(tabDragLayout(slots, "c", 0).order).toEqual(["a", "b", "c"]);
	expect(slots.map((slot) => slot.left)).toEqual([0, 100, 200]);
});

test("drag preview preserves unequal widths and handles empty or missing tabs", () => {
	const slots = [
		{ id: "a", left: 0, width: 80 },
		{ id: "b", left: 80, width: 120 },
	];
	const layout = tabDragLayout(slots, "a", 110);
	expect(layout.order).toEqual(["b", "a"]);
	expect(layout.offsets.get("b")).toBe(-80);
	expect(layout.offsets.get("a")).toBe(110);
	expect(tabDragLayout([], "a", 20).order).toEqual([]);
	expect(tabDragLayout(slots, "missing", 20).offsets.size).toBe(0);
});

test("reordering places tabs on either side without losing IDs or mutating input", () => {
	const ids = ["a", "b", "c", "d"];
	expect(reorderTabs(ids, "a", "c", true)).toEqual(["b", "c", "a", "d"]);
	expect(reorderTabs(ids, "d", "b", false)).toEqual(["a", "d", "b", "c"]);
	expect(reorderTabs(ids, "b", "c", false)).toEqual(ids);
	expect(reorderTabs(ids, "b", "b", true)).toEqual(ids);
	expect(reorderTabs(ids, "missing", "a", false)).toEqual(ids);
	expect(reorderTabs(ids, "b", "missing", false)).toEqual(ids);
	expect(ids).toEqual(["a", "b", "c", "d"]);
});

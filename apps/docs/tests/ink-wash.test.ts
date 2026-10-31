import { expect, it } from "bun:test";
import {
	addInkBloom,
	INK_LIFETIME_MS,
	type InkBloom,
	pruneInkBlooms,
} from "../src/lib/ink-wash";

it("collects nearby drops into a pool without depositing on every event", () => {
	const blooms: InkBloom[] = [];
	expect(addInkBloom(blooms, 20, 20, 0)).toBe(true);
	expect(addInkBloom(blooms, 22, 20, 10)).toBe(false);
	expect(addInkBloom(blooms, 24, 20, 100)).toBe(true);
	expect(blooms).toHaveLength(1);
	expect(blooms[0].volume).toBe(2);
	expect(blooms[0].x).toBe(22);
	expect(blooms[0].born).toBe(100);
});

it("joins touching pools and caps their growth", () => {
	const blooms: InkBloom[] = [];
	addInkBloom(blooms, 0, 0, 0);
	addInkBloom(blooms, 18, 0, 100);
	expect(blooms).toHaveLength(2);
	addInkBloom(blooms, 9, 0, 200);
	expect(blooms).toHaveLength(1);
	expect(blooms[0].volume).toBe(3);
	for (let deposit = 3; deposit < 100; deposit += 1) {
		addInkBloom(blooms, 9, 0, deposit * 100);
	}
	expect(blooms[0].volume).toBe(16);
});

it("expires old pools even when another pool has been refreshed", () => {
	const blooms: InkBloom[] = [];
	addInkBloom(blooms, 0, 0, 0);
	addInkBloom(blooms, 200, 0, 100);
	addInkBloom(blooms, 0, 0, 200);
	pruneInkBlooms(blooms, INK_LIFETIME_MS + 100);
	expect(blooms).toHaveLength(1);
	expect(blooms[0].x).toBe(0);
	pruneInkBlooms(blooms, INK_LIFETIME_MS + 200);
	expect(blooms).toHaveLength(0);
});

it("bounds the total number of separate ink pools", () => {
	const blooms: InkBloom[] = [];
	for (let deposit = 0; deposit < 100; deposit += 1) {
		addInkBloom(blooms, deposit * 40, 0, deposit * 100);
	}
	expect(blooms).toHaveLength(48);
});

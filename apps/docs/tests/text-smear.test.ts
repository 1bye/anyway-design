import { expect, it } from "bun:test";
import {
	addTextSmear,
	pruneTextSmears,
	TEXT_SMEAR_LIFETIME_MS,
	type TextSmear,
} from "../src/lib/text-smear";

it("captures the pointer direction with a bounded pull, ignoring idle and oversampled input", () => {
	const smears: TextSmear[] = [];
	addTextSmear(smears, 100, 100, 300, -400, 0);
	expect(smears).toHaveLength(1);
	expect(Math.hypot(smears[0].dx, smears[0].dy)).toBeCloseTo(14);
	expect(smears[0].dx).toBeGreaterThan(0);
	expect(smears[0].dy).toBeLessThan(0);
	addTextSmear(smears, 101, 100, 2, 0, 10);
	addTextSmear(smears, 100, 100, 0, 0, 50);
	expect(smears).toHaveLength(1);
	expect(smears[0].x).toBe(100);
	expect(smears[0].y).toBe(100);
});

it("bounds the smear trail and clears it completely after input stops", () => {
	const smears: TextSmear[] = [];
	for (let sample = 0; sample < 30; sample += 1) {
		addTextSmear(smears, sample * 5, 50, 5, 0, sample * 24);
	}
	expect(smears).toHaveLength(8);
	const last = smears.at(-1);
	if (!last) {
		throw new Error("Expected a pointer trail");
	}
	pruneTextSmears(smears, last.born + TEXT_SMEAR_LIFETIME_MS);
	expect(smears).toHaveLength(0);
});

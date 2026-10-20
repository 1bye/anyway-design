import { expect, test } from "bun:test";
import { fileLabelPath } from "../src/file-label-shape";

const NON_FINITE = /NaN|Infinity/;

test("two label lines share one closed surface with rounded inward corners", () => {
	const path = fileLabelPath([
		{ bottom: 13, left: 0, right: 80, top: 0 },
		{ bottom: 26, left: 20, right: 60, top: 13 },
	]);
	expect(path.match(/M/g)).toHaveLength(1);
	expect(path.match(/Z/g)).toHaveLength(1);
	expect(path).toContain("Q60,13 60,17");
	expect(path).toContain("Q20,13 16,13");
	expect(path).not.toContain("NaN");
});

test("wider second lines, equal widths, and tiny width changes stay finite", () => {
	for (const inset of [0, 0.01, 10, -10]) {
		const path = fileLabelPath([
			{ bottom: 13, left: 10, right: 70, top: 0 },
			{ bottom: 26, left: 10 + inset, right: 70 - inset, top: 13 },
		]);
		expect(path.startsWith("M")).toBe(true);
		expect(path.endsWith("Z")).toBe(true);
		expect(path).not.toMatch(NON_FINITE);
	}
	expect(fileLabelPath([{ bottom: 13, left: 0, right: 20, top: 0 }])).toContain(
		"L16,0Q20,0 20,4"
	);
	expect(fileLabelPath([])).toBe("");
	expect(fileLabelPath([{ bottom: 0, left: 0, right: 0, top: 0 }])).toBe("");
});

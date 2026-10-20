import { describe, expect, test } from "bun:test";
import { dockLayout, dockScale } from "../src/dock-math";

describe("Dock magnification", () => {
	test("peaks under the pointer and returns to the resting size at both edges", () => {
		expect(dockScale(0, 120, 1.8)).toBe(1.8);
		expect(dockScale(120, 120, 1.8)).toBe(1);
		expect(dockScale(-120, 120, 1.8)).toBe(1);
		expect(dockScale(300, 120, 1.8)).toBe(1);
	});
	test("moves neighbors symmetrically and continuously", () => {
		expect(dockScale(60, 120, 1.8)).toBeCloseTo(1.4);
		expect(dockScale(-60, 120, 1.8)).toBeCloseTo(1.4);
		expect(dockScale(119.99, 120, 1.8)).toBeCloseTo(1, 6);
	});
	test("handles disabled magnification and an empty influence range", () => {
		expect(dockScale(0, 120, 1)).toBe(1);
		expect(dockScale(0, 0, 1.8)).toBe(1);
		expect(dockScale(0, 120, 0)).toBe(1);
	});
});

describe("expanded Dock layout", () => {
	const size = 50;
	const centers = [25, 79, 133, 187, 241, 295, 349];

	test("spreads growth across three neighbors while keeping a stable baseline", () => {
		const { scales, shifts } = dockLayout(centers, size, 187, 2.2);
		expect(scales[3]).toBeCloseTo(2.2, 6);
		expect(scales[2]).toBeGreaterThan(1.95);
		expect(scales[1]).toBeGreaterThan(1.45);
		expect(scales[1]).toBeLessThan(1.65);
		expect(scales[0]).toBeGreaterThan(1.05);
		expect(scales[0]).toBeLessThan(1.15);
		expect(shifts[3]).toBeCloseTo(0, 2);
		expect(shifts[0]).toBeCloseTo(-(shifts[6] ?? 0), 2);
	});

	test("keeps the largest icon nearest the pointer, including the ends and separator", () => {
		const grouped = [25, 79, 133, 187, 265, 319];
		for (const pointer of [-35, 0, 25, 95, 135, 185, 230, 275, 319, 365]) {
			const { scales, shifts } = dockLayout(grouped, size, pointer, 2.2);
			const distances = grouped.map((center, index) =>
				Math.abs(center + (shifts[index] ?? 0) - pointer)
			);
			const nearest = distances.indexOf(Math.min(...distances));
			expect(scales[nearest]).toBe(Math.max(...scales));
		}
		expect(dockLayout(grouped, size, -100, 2.2).scales[0]).toBeCloseTo(2.2, 6);
		expect(dockLayout(grouped, size, 450, 2.2).scales.at(-1)).toBeCloseTo(
			2.2,
			6
		);
	});

	test("preserves gaps and centered expansion throughout a sweep", () => {
		const grouped = [25, 79, 133, 187, 265, 319];
		for (const pointer of [-35, 25, 95, 187, 230, 319, 365]) {
			const layout = dockLayout(grouped, size, pointer, 2.2);
			let previousRight = 0;
			for (const [index, center] of grouped.entries()) {
				const scale = layout.scales[index] ?? 1;
				const shift = layout.shifts[index] ?? 0;
				const left = center + shift - (size * scale) / 2;
				const right = center + shift + (size * scale) / 2;
				if (index === 0) {
					expect(left).toBeCloseTo(-layout.growth / 2, 6);
				} else {
					expect(left - previousRight).toBeCloseTo(index === 4 ? 28 : 4, 6);
				}
				previousRight = right;
			}
			expect(previousRight).toBeCloseTo(344 + layout.growth / 2, 6);
			const next = dockLayout(grouped, size, pointer + 0.01, 2.2);
			for (const [index, shift] of layout.shifts.entries()) {
				expect(Math.abs((next.shifts[index] ?? 0) - shift)).toBeLessThan(0.05);
			}
		}
	});

	test("scales with icon size and resets cleanly when magnification ends", () => {
		const layout = dockLayout(centers, size, 95, 2.2);
		const doubled = dockLayout(
			centers.map((center) => center * 2),
			100,
			190,
			2.2
		);
		expect(doubled.scales).toEqual(layout.scales);
		expect(doubled.shifts).toEqual(layout.shifts.map((shift) => shift * 2));
		for (const [pointer, magnification] of [
			[null, 2.2],
			[95, 1],
			[95, Number.NaN],
		] as const) {
			const rest = dockLayout(centers, size, pointer, magnification);
			expect(rest.growth).toBe(0);
			expect(rest.scales.every((scale) => scale === 1)).toBe(true);
			expect(rest.shifts.every((shift) => shift === 0)).toBe(true);
		}
		expect(dockLayout([], size, 0, 2.2).growth).toBe(0);
	});
});

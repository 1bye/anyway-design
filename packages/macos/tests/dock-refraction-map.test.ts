import { expect, test } from "bun:test";
import {
	createRefractionMap,
	DISPLACEMENT_SCALE,
} from "../src/dock-refraction-map";

function vector(map: Uint8ClampedArray, width: number, x: number, y: number) {
	const offset = (y * width + x) * 4;
	return [
		((map[offset] ?? 128) / 255 - 0.5) * DISPLACEMENT_SCALE,
		((map[offset + 1] ?? 128) / 255 - 0.5) * DISPLACEMENT_SCALE,
	] as const;
}

test("keeps the center still and bends opposite edges inward symmetrically", () => {
	const width = 200;
	const map = createRefractionMap(width, 80, 26);
	const center = vector(map, width, 100, 40);
	expect(Math.abs(center[0])).toBeLessThan(0.03);
	expect(Math.abs(center[1])).toBeLessThan(0.03);
	const left = vector(map, width, 0, 40);
	const right = vector(map, width, 199, 40);
	expect(left[0]).toBeGreaterThan(4);
	expect(right[0]).toBeLessThan(-4);
	expect(left[0] + right[0]).toBeCloseTo(0, 1);
	expect(vector(map, width, 100, 0)[1]).toBeGreaterThan(4);
	expect(vector(map, width, 100, 79)[1]).toBeLessThan(-4);
});

test("curves corners in both axes and rotates with a vertical Dock", () => {
	const horizontal = createRefractionMap(200, 80, 26);
	const vertical = createRefractionMap(80, 200, 26);
	const corner = vector(horizontal, 200, 8, 8);
	const rotated = vector(vertical, 80, 8, 8);
	expect(corner[0]).toBeGreaterThan(0);
	expect(corner[1]).toBeGreaterThan(0);
	expect(corner[0]).toEqual(rotated[1]);
	expect(corner[1]).toEqual(rotated[0]);
	const alpha = horizontal.filter((_, index) => index % 4 === 3);
	expect(alpha.every((value) => value === 255)).toBe(true);
});

test("clamps the radius and rejects invalid map dimensions", () => {
	expect(createRefractionMap(4, 4, 100)).toEqual(createRefractionMap(4, 4, 2));
	expect(() => createRefractionMap(0, 40, 10)).toThrow(RangeError);
	expect(() => createRefractionMap(20.5, 40, 10)).toThrow(RangeError);
	expect(() => createRefractionMap(20, 40, Number.NaN)).toThrow(RangeError);
});

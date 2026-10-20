import { expect, test } from "bun:test";
import { quickLookTransition } from "../src/quick-look-transition";

const target = { height: 468, width: 724, x: 278, y: 126 };
const viewport = { height: 720, width: 1280 };

test("Quick Look clips a partially visible source to the viewport", () => {
	const origin = quickLookTransition(
		{ height: 40, width: 40, x: -10, y: 700 },
		target,
		viewport
	);
	expect(origin?.x).toBe(-625);
	expect(origin?.y).toBe(350);
	expect(origin?.scale).toBeCloseTo(20 / 468);
});

test("Quick Look starts at the thumbnail center with an undistorted scale", () => {
	const source = { height: 36, width: 64, x: 100, y: 600 };
	const origin = quickLookTransition(source, target, viewport);
	expect(origin?.x).toBe(-508);
	expect(origin?.y).toBe(258);
	expect(origin?.scale).toBeCloseTo(36 / 468);
	expect(origin?.scale).toBeLessThan(64 / 724);
});

test("Quick Look fades when its source is missing, offscreen, or invalid", () => {
	expect(quickLookTransition(undefined, target, viewport)).toBeUndefined();
	for (const source of [
		{ height: 20, width: 20, x: -40, y: 10 },
		{ height: 20, width: 20, x: 10, y: 800 },
		{ height: 20, width: 20, x: 1300, y: 10 },
		{ height: 20, width: 0, x: 10, y: 10 },
		{ height: 20, width: 20, x: Number.NaN, y: 10 },
	]) {
		expect(quickLookTransition(source, target, viewport)).toBeUndefined();
	}
	expect(
		quickLookTransition(
			{ height: 720, width: 1280, x: 0, y: 0 },
			target,
			viewport
		)?.scale
	).toBe(1);
});

import { expect, test } from "bun:test";
import { sliderTickCovered, sliderTickPositions } from "../src/slider-ticks";

test("slider tick marks include both endpoints and space intermediate marks evenly", () => {
	expect(sliderTickPositions(2)).toEqual([0, 1]);
	expect(sliderTickPositions(5)).toEqual([0, 0.25, 0.5, 0.75, 1]);
	expect(sliderTickPositions(3.9)).toEqual([0, 0.5, 1]);
});
test("slider tick marks reject invalid counts and bound rendered work", () => {
	for (const count of [
		undefined,
		-5,
		0,
		1,
		Number.NaN,
		Number.POSITIVE_INFINITY,
	]) {
		expect(sliderTickPositions(count)).toEqual([]);
	}
	const ticks = sliderTickPositions(1_000_000);
	expect(ticks).toHaveLength(101);
	expect(ticks[0]).toBe(0);
	expect(ticks.at(-1)).toBe(1);
});

test("slider hides only the tick at the current thumb value, including endpoints", () => {
	const ticks = sliderTickPositions(5);
	for (const value of [0, 25, 50, 75, 100]) {
		expect(ticks.filter((tick) => sliderTickCovered(tick, value))).toEqual([
			value / 100,
		]);
	}
	expect(ticks.some((tick) => sliderTickCovered(tick, 26))).toBe(false);
	expect(sliderTickCovered(0, -10)).toBe(true);
	expect(sliderTickCovered(1, 110)).toBe(true);
});

test("slider tick coverage normalizes custom ranges and decimal steps", () => {
	expect(sliderTickCovered(0.75, 0.5, -1, 1)).toBe(true);
	expect(sliderTickCovered(0.5, 15, 10, 20)).toBe(true);
	expect(sliderTickCovered(0.5, 0.1 + 0.2, 0.1, 0.5)).toBe(true);
	expect(sliderTickCovered(0.5, 0.31, 0.1, 0.5)).toBe(false);
	expect(sliderTickCovered(0, 5, 5, 5)).toBe(false);
	expect(sliderTickCovered(0, 5, 10, 0)).toBe(false);
	expect(sliderTickCovered(0, Number.NaN)).toBe(false);
});

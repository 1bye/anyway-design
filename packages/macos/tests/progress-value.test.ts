import { expect, test } from "bun:test";
import { progressValue } from "../src/progress-value";

test("progress distinguishes unknown work from zero and clamps within the supplied maximum", () => {
	expect(progressValue(null).indeterminate).toBe(true);
	expect(progressValue(undefined).indeterminate).toBe(true);
	expect(progressValue(0)).toEqual({
		indeterminate: false,
		max: 100,
		percent: 0,
		value: 0,
	});
	expect(progressValue(2, 8).percent).toBe(25);
	expect(progressValue(-5, 8).value).toBe(0);
	expect(progressValue(12, 8)).toEqual({
		indeterminate: false,
		max: 8,
		percent: 100,
		value: 8,
	});
});

test("nonfinite values and invalid maxima cannot leak invalid ARIA or CSS values", () => {
	for (const value of [
		Number.NaN,
		Number.POSITIVE_INFINITY,
		Number.NEGATIVE_INFINITY,
	]) {
		expect(progressValue(value).value).toBe(0);
		expect(progressValue(value).indeterminate).toBe(false);
	}
	for (const max of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
		expect(progressValue(50, max)).toEqual({
			indeterminate: false,
			max: 100,
			percent: 50,
			value: 50,
		});
	}
	expect(progressValue(Number.MAX_VALUE, Number.MAX_VALUE).percent).toBe(100);
});

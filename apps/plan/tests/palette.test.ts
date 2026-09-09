import { expect, test } from "bun:test";
import {
	createPageScroll,
	PALETTE_ROWS,
	paletteColumns,
} from "../src/lib/palette";

test("pages fit three complete rows on narrow and wide docks", () => {
	for (const width of [260, 320, 530, 770]) {
		const columns = paletteColumns(width);
		expect(columns * 44 + (columns - 1) * 4).toBeLessThanOrEqual(width);
		expect((columns + 1) * 44 + columns * 4).toBeGreaterThan(width);
		expect(columns * PALETTE_ROWS).toBe(columns * 3);
	}
	expect(paletteColumns(0)).toBe(1);
});

test("fast continuous scrolling advances pages without a gesture lock", () => {
	const scroll = createPageScroll();
	const wheel = {
		ctrlKey: false,
		deltaMode: 0,
		deltaX: 0,
		deltaY: 60,
		timeStamp: 0,
	};
	expect(scroll(wheel)).toBe(0);
	expect(scroll({ ...wheel, timeStamp: 16 })).toBe(1);
	expect(scroll({ ...wheel, deltaY: 300, timeStamp: 32 })).toBe(2);
	expect(scroll({ ...wheel, timeStamp: 48 })).toBe(1);
	expect(scroll({ ...wheel, deltaY: -240, timeStamp: 64 })).toBe(-2);
	expect(scroll({ ...wheel, deltaY: 100, timeStamp: 80 })).toBe(0);
	expect(scroll({ ...wheel, deltaY: -120, timeStamp: 96 })).toBe(-1);
	expect(scroll({ ...wheel, timeStamp: 112 })).toBe(0);
	// A pause discards partial movement from the previous gesture.
	expect(scroll({ ...wheel, timeStamp: 300 })).toBe(0);
});

test("wheel paging supports mouse lines, whole pages, horizontal motion and pinch", () => {
	const scroll = createPageScroll();
	const wheel = {
		ctrlKey: false,
		deltaMode: 0,
		deltaX: 0,
		deltaY: 0,
		timeStamp: 0,
	};
	expect(scroll({ ...wheel, deltaMode: 1, deltaY: 3, timeStamp: 300 })).toBe(1);
	expect(scroll({ ...wheel, deltaMode: 2, deltaY: 2, timeStamp: 600 })).toBe(2);
	expect(scroll({ ...wheel, ctrlKey: true, deltaY: 120, timeStamp: 900 })).toBe(
		0
	);
	expect(scroll({ ...wheel, deltaX: -360, timeStamp: 1200 })).toBe(-3);
});

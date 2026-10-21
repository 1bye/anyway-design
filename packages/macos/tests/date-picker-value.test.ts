import { expect, test } from "bun:test";
import {
	calendarDays,
	calendarKeyDate,
	clampDateValue,
	parseDateValue,
	setDateSegment,
	shiftDateValue,
} from "../src/date-picker-value";

test("accepts local ISO dates and rejects rollover, invalid times, offsets, and extra parts", () => {
	expect(parseDateValue("2024-02-29", "date")?.day).toBe(29);
	for (const value of [
		"2026-02-29",
		"1900-02-29",
		"0000-01-01",
		"2026-13-01",
		"2026-01-00",
		"2026-1-01",
		"2026-01-01T12:00",
	]) {
		expect(parseDateValue(value, "date")).toBeNull();
	}
	for (const value of ["24:00", "12:60", "2:30", "12:30Z"]) {
		expect(parseDateValue(value, "time")).toBeNull();
	}
	expect(parseDateValue("2026-10-20T14:35", "datetime")?.hour).toBe(14);
	expect(parseDateValue("2026-10-20T14:35T00", "datetime")).toBeNull();
});

test("month and year edits preserve valid days, including leap years and centuries", () => {
	expect(shiftDateValue("2024-01-31", "date", "month", 1)).toBe("2024-02-29");
	expect(shiftDateValue("2024-02-29", "date", "year", 1)).toBe("2025-02-28");
	expect(shiftDateValue("2026-12-31", "date", "month", 1)).toBe("2027-01-31");
	expect(setDateSegment("2026-01-31", "date", "month", 2)).toBe("2026-02-28");
	expect(setDateSegment("2000-02-29", "date", "year", 1900)).toBe("1900-02-28");
});

test("time stepping wraps and datetime stepping carries without a timezone conversion", () => {
	expect(shiftDateValue("23:59", "time", "minute", 1)).toBe("00:00");
	expect(shiftDateValue("00:00", "time", "minute", -1)).toBe("23:59");
	expect(shiftDateValue("2026-12-31T23:59", "datetime", "minute", 1)).toBe(
		"2027-01-01T00:00"
	);
	expect(setDateSegment("14:35", "time", "hour", 12)).toBe("12:35");
	expect(setDateSegment("14:35", "time", "period", 0)).toBe("02:35");
	expect(setDateSegment("00:35", "time", "hour", 12)).toBe("00:35");
	expect(setDateSegment("14:35", "time", "hour", 0, "h23")).toBe("00:35");
});

test("bounds clamp at both ends and reject malformed or reversed ranges", () => {
	expect(clampDateValue("2026-10-01", "date", "2026-10-10", "2026-10-25")).toBe(
		"2026-10-10"
	);
	expect(clampDateValue("2026-10-31", "date", "2026-10-10", "2026-10-25")).toBe(
		"2026-10-25"
	);
	expect(() => clampDateValue("12:00", "time", "18:00", "09:00")).toThrow();
	expect(() => clampDateValue("2026-10-20", "date", "bad")).toThrow();
	expect(() => clampDateValue("2026-10-20", "date", "")).toThrow();
	expect(shiftDateValue("0001-01-01", "date", "day", -1)).toBe("0001-01-01");
	expect(shiftDateValue("9999-12-31", "date", "year", 1)).toBe("9999-12-31");
});

test("calendar cells include adjacent months and always span six Sunday-first weeks", () => {
	const days = calendarDays("2026-10-20");
	expect(days).toHaveLength(42);
	expect(days[0]).toBe("2026-09-27");
	expect(days[41]).toBe("2026-11-07");
	expect(new Set(days).size).toBe(42);
});

test("calendar navigation crosses weeks, months, and years while clamping leap days", () => {
	expect(calendarKeyDate("2026-10-31", "ArrowRight")).toBe("2026-11-01");
	expect(calendarKeyDate("2026-10-21", "ArrowUp")).toBe("2026-10-14");
	expect(calendarKeyDate("2026-10-21", "Home")).toBe("2026-10-18");
	expect(calendarKeyDate("2026-10-21", "End")).toBe("2026-10-24");
	expect(calendarKeyDate("2024-02-29", "PageDown", true)).toBe("2025-02-28");
	expect(calendarKeyDate("2026-01-31", "PageDown")).toBe("2026-02-28");
	expect(calendarKeyDate("2026-10-21", "Tab")).toBeNull();
	expect(calendarKeyDate("2026-10-21", "toString")).toBeNull();
});

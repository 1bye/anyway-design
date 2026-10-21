export type DatePickerMode = "date" | "time" | "datetime";
export type DateSegment =
	| "month"
	| "day"
	| "year"
	| "hour"
	| "minute"
	| "period";
export interface DateParts {
	day: number;
	hour: number;
	minute: number;
	month: number;
	year: number;
}

export interface DateValueChangeDetails {
	cancel: () => void;
	event?: Event;
	isCanceled: boolean;
}

export function dateChangeDetails(event?: Event): DateValueChangeDetails {
	const details: DateValueChangeDetails = {
		cancel() {
			details.isCanceled = true;
		},
		event,
		isCanceled: false,
	};
	return details;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
export const padDatePart = (value: number, length = 2) =>
	String(value).padStart(length, "0");

export function daysInMonth(year: number, month: number): number {
	if (month === 2) {
		return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
	}
	return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function parseDateValue(
	value: string,
	mode: DatePickerMode
): DateParts | null {
	const [dateText, timeText] =
		mode === "time" ? ["2000-01-01", value] : value.split("T");
	const date = DATE_PATTERN.exec(dateText);
	const time =
		mode === "date" ? ["", "0", "0"] : TIME_PATTERN.exec(timeText ?? "");
	if (
		!(date && time) ||
		(mode === "date" && value.includes("T")) ||
		value.split("T").length > 2
	) {
		return null;
	}
	const parts = {
		day: Number(date[3]),
		hour: Number(time[1]),
		minute: Number(time[2]),
		month: Number(date[2]),
		year: Number(date[1]),
	};
	if (
		parts.year < 1 ||
		parts.month < 1 ||
		parts.month > 12 ||
		parts.day < 1 ||
		parts.day > daysInMonth(parts.year, parts.month) ||
		parts.hour > 23 ||
		parts.minute > 59
	) {
		return null;
	}
	return parts;
}

export function formatDateValue(
	parts: DateParts,
	mode: DatePickerMode
): string {
	const date = `${padDatePart(parts.year, 4)}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`;
	const time = `${padDatePart(parts.hour)}:${padDatePart(parts.minute)}`;
	if (mode === "date") {
		return date;
	}
	return mode === "time" ? time : `${date}T${time}`;
}

export function localDateValue(mode: DatePickerMode = "date"): string {
	const now = new Date();
	return formatDateValue(
		{
			day: now.getDate(),
			hour: now.getHours(),
			minute: now.getMinutes(),
			month: now.getMonth() + 1,
			year: now.getFullYear(),
		},
		mode
	);
}

export function requireDateValue(
	value: string,
	mode: DatePickerMode
): DateParts {
	const parts = parseDateValue(value, mode);
	if (!parts) {
		throw new Error(
			`Invalid ${mode} value: expected a valid, zero-padded local ISO date/time.`
		);
	}
	return parts;
}

export function clampDateValue(
	value: string,
	mode: DatePickerMode,
	min?: string,
	max?: string
): string {
	requireDateValue(value, mode);
	if (min !== undefined) {
		requireDateValue(min, mode);
	}
	if (max !== undefined) {
		requireDateValue(max, mode);
	}
	if (min && max && min > max) {
		throw new Error("Date picker min must not be later than max.");
	}
	if (min && value < min) {
		return min;
	}
	return max && value > max ? max : value;
}

export function segmentRange(
	parts: DateParts,
	segment: DateSegment,
	hourCycle: "h12" | "h23" = "h12"
): [number, number] {
	switch (segment) {
		case "year":
			return [1, 9999];
		case "month":
			return [1, 12];
		case "day":
			return [1, daysInMonth(parts.year, parts.month)];
		case "hour":
			return hourCycle === "h12" ? [1, 12] : [0, 23];
		case "minute":
			return [0, 59];
		case "period":
			return [0, 1];
		default:
			throw new Error("Unknown date segment.");
	}
}

export function setDateSegment(
	value: string,
	mode: DatePickerMode,
	segment: DateSegment,
	next: number,
	hourCycle: "h12" | "h23" = "h12"
): string {
	const parts = requireDateValue(value, mode);
	const [low, high] = segmentRange(parts, segment, hourCycle);
	const number = Math.max(low, Math.min(high, Math.trunc(next)));
	if (!Number.isFinite(number)) {
		return value;
	}
	if (segment === "period") {
		parts.hour = (parts.hour % 12) + number * 12;
	} else if (segment === "hour" && hourCycle === "h12") {
		parts.hour = (number % 12) + Math.floor(parts.hour / 12) * 12;
	} else {
		parts[segment] = number;
	}
	parts.day = Math.min(parts.day, daysInMonth(parts.year, parts.month));
	return formatDateValue(parts, mode);
}

export function datePartsToUTC(parts: DateParts): Date {
	const date = new Date(0);
	date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
	date.setUTCHours(parts.hour, parts.minute, 0, 0);
	return date;
}

export function shiftDateValue(
	value: string,
	mode: DatePickerMode,
	segment: DateSegment,
	amount: number
): string {
	const parts = requireDateValue(value, mode);
	if (segment === "year" || segment === "month") {
		const month = Math.max(
			12,
			Math.min(
				9999 * 12 + 11,
				parts.year * 12 +
					parts.month -
					1 +
					amount * (segment === "year" ? 12 : 1)
			)
		);
		parts.year = Math.floor(month / 12);
		parts.month = (month % 12) + 1;
		parts.day = Math.min(parts.day, daysInMonth(parts.year, parts.month));
		return formatDateValue(parts, mode);
	}
	const date = datePartsToUTC(parts);
	const minutes = { day: 1440, hour: 60, minute: 1, period: 720 }[segment];
	date.setUTCMinutes(date.getUTCMinutes() + amount * minutes);
	if (date.getUTCFullYear() < 1) {
		return mode === "time"
			? "00:00"
			: `0001-01-01${mode === "datetime" ? "T00:00" : ""}`;
	}
	if (date.getUTCFullYear() > 9999) {
		return mode === "time"
			? "23:59"
			: `9999-12-31${mode === "datetime" ? "T23:59" : ""}`;
	}
	return formatDateValue(
		{
			day: date.getUTCDate(),
			hour: date.getUTCHours(),
			minute: date.getUTCMinutes(),
			month: date.getUTCMonth() + 1,
			year: date.getUTCFullYear(),
		},
		mode
	);
}

export function calendarDays(value: string): string[] {
	const parts = requireDateValue(value, "date");
	const first = { ...parts, day: 1 };
	const start = datePartsToUTC(first);
	start.setUTCDate(1 - start.getUTCDay());
	return Array.from({ length: 42 }, (_, index) => {
		const day = new Date(start);
		day.setUTCDate(start.getUTCDate() + index);
		return formatDateValue(
			{
				day: day.getUTCDate(),
				hour: 0,
				minute: 0,
				month: day.getUTCMonth() + 1,
				year: day.getUTCFullYear(),
			},
			"date"
		);
	});
}

export function calendarKeyDate(
	value: string,
	key: string,
	shift = false
): string | null {
	const dayOffsets: Record<string, number> = {
		ArrowDown: 7,
		ArrowLeft: -1,
		ArrowRight: 1,
		ArrowUp: -7,
	};
	if (Object.hasOwn(dayOffsets, key)) {
		return shiftDateValue(value, "date", "day", dayOffsets[key]);
	}
	if (key === "PageUp" || key === "PageDown") {
		return shiftDateValue(
			value,
			"date",
			shift ? "year" : "month",
			key === "PageUp" ? -1 : 1
		);
	}
	if (key === "Home" || key === "End") {
		const weekday = datePartsToUTC(requireDateValue(value, "date")).getUTCDay();
		return shiftDateValue(
			value,
			"date",
			"day",
			key === "Home" ? -weekday : 6 - weekday
		);
	}
	return null;
}

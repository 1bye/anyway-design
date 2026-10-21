/** biome-ignore-all lint/performance/noJsxPropsBind: Calendar cells bind their date to native events. */
import {
	type ComponentPropsWithRef,
	type KeyboardEvent,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	calendarDays,
	calendarKeyDate,
	clampDateValue,
	type DateValueChangeDetails,
	dateChangeDetails,
	datePartsToUTC,
	localDateValue,
	parseDateValue,
	requireDateValue,
	shiftDateValue,
} from "./date-picker-value";
import { useControlValue } from "./use-control-value";

export interface MacCalendarProps
	extends Omit<ComponentPropsWithRef<"section">, "defaultValue" | "onChange"> {
	defaultValue?: string;
	disabled?: boolean;
	form?: string;
	label: string;
	max?: string;
	min?: string;
	name?: string;
	onValueChange?: (value: string, details: DateValueChangeDetails) => void;
	readOnly?: boolean;
	today?: string;
	value?: string;
}
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
	month: "short",
	timeZone: "UTC",
	year: "numeric",
});
const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
	dateStyle: "full",
	timeZone: "UTC",
});
const WEEKDAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

export function MacCalendar({
	label,
	value,
	defaultValue,
	onValueChange,
	disabled = false,
	readOnly = false,
	min,
	max,
	name,
	form,
	today = localDateValue(),
	className = "",
	...props
}: MacCalendarProps) {
	const [initialDefault] = useState(today);
	const control = useControlValue<string, DateValueChangeDetails>({
		defaultValue: defaultValue ?? initialDefault,
		form,
		onChange: onValueChange,
		value,
	});
	const selected = clampDateValue(control.value, "date", min, max);
	requireDateValue(today, "date");
	const [navigation, setNavigation] = useState({
		anchor: selected,
		date: selected,
	});
	const [focused, setFocused] = useState(selected);
	const shouldFocus = useRef<boolean>(false);
	const buttons = useRef(new Map<string, HTMLButtonElement>());
	const month = navigation.anchor === selected ? navigation.date : selected;
	const days = calendarDays(month);
	const headingId = useId();
	const monthParts = requireDateValue(month, "date");
	const heading = MONTH_FORMAT.format(datePartsToUTC(monthParts));
	const allowed = (date: string) =>
		Boolean(parseDateValue(date, "date")) &&
		(!min || date >= min) &&
		(!max || date <= max);
	const tabDate =
		days.find((date) => date === focused && allowed(date)) ??
		days.find((date) => date === selected) ??
		days.find(
			(date) => date.slice(0, 7) === month.slice(0, 7) && allowed(date)
		);
	useLayoutEffect(() => {
		// biome-ignore lint/suspicious/noUnnecessaryConditions: Keyboard event handlers update the ref before this focus effect.
		if (shouldFocus.current) {
			buttons.current.get(focused)?.focus();
			shouldFocus.current = false;
		}
	}, [focused]);
	const choose = (next: string, event: Event) => {
		if (disabled || readOnly || !allowed(next)) {
			return;
		}
		const details = dateChangeDetails(event);
		control.change(next, details);
		if (!details.isCanceled) {
			setNavigation({ anchor: next, date: next });
		}
	};
	const navigate = (amount: number) =>
		setNavigation({
			anchor: selected,
			date: shiftDateValue(month, "date", "month", amount),
		});
	const keyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
		const target = calendarKeyDate(date, event.key, event.shiftKey);
		if (!target) {
			return;
		}
		event.preventDefault();
		const next = clampDateValue(target, "date", min, max);
		shouldFocus.current = true;
		setFocused(next);
		setNavigation({ anchor: selected, date: next });
	};
	return (
		<section
			{...props}
			aria-label={label}
			className={`mac-calendar ${className}`}
			data-disabled={disabled || undefined}
			data-readonly={readOnly || undefined}
		>
			<input
				disabled={disabled}
				form={form}
				name={name}
				ref={control.inputRef}
				type="hidden"
				value={selected}
			/>
			<div className="mac-calendar-header">
				<strong aria-live="polite" id={headingId}>
					{heading}
				</strong>
				<div className="mac-calendar-navigation">
					<button
						aria-label="Previous month"
						disabled={
							disabled ||
							(min !== undefined && month.slice(0, 7) <= min.slice(0, 7))
						}
						onClick={() => navigate(-1)}
						type="button"
					>
						<span aria-hidden="true" className="mac-calendar-previous" />
					</button>
					<button
						aria-label="Go to today"
						disabled={disabled}
						onClick={() =>
							setNavigation({
								anchor: selected,
								date: clampDateValue(today, "date", min, max),
							})
						}
						type="button"
					>
						<span aria-hidden="true" className="mac-calendar-today-dot" />
					</button>
					<button
						aria-label="Next month"
						disabled={
							disabled ||
							(max !== undefined && month.slice(0, 7) >= max.slice(0, 7))
						}
						onClick={() => navigate(1)}
						type="button"
					>
						<span aria-hidden="true" className="mac-calendar-next" />
					</button>
				</div>
			</div>
			{/* The APG date picker uses native table semantics enhanced with grid navigation. */}
			{/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: This is an interactive calendar grid per the WAI-ARIA date picker pattern. */}
			<table aria-labelledby={headingId} aria-readonly={readOnly} role="grid">
				<thead>
					<tr>
						{WEEKDAYS.map((day) => (
							<th abbr={day} key={day} scope="col">
								{day.slice(0, 2)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: 6 }, (_, week) => (
						<tr key={days[week * 7]}>
							{days.slice(week * 7, week * 7 + 7).map((date) => {
								const parts = parseDateValue(date, "date");
								return (
									<td
										aria-selected={date === selected}
										key={date}
										// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: Calendar grid cells contain their roving-focus date buttons.
										role="gridcell"
										tabIndex={-1}
									>
										<button
											aria-current={date === today ? "date" : undefined}
											aria-label={
												parts
													? DAY_FORMAT.format(datePartsToUTC(parts))
													: "Outside supported date range"
											}
											aria-pressed={date === selected}
											data-outside={
												date.slice(0, 7) !== month.slice(0, 7) || undefined
											}
											disabled={disabled || !allowed(date)}
											onClick={(event) => choose(date, event.nativeEvent)}
											onFocus={() => setFocused(date)}
											onKeyDown={(event) => keyDown(event, date)}
											ref={(element) => {
												if (element) {
													buttons.current.set(date, element);
												} else {
													buttons.current.delete(date);
												}
											}}
											tabIndex={date === tabDate ? 0 : -1}
											type="button"
										>
											{Number(date.split("-")[2])}
										</button>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}

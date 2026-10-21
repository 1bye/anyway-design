/** biome-ignore-all lint/performance/noJsxPropsBind: Date segments bind their semantic field to native input events. */
import { Popover } from "@base-ui/react/popover";
import {
	type ComponentPropsWithRef,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { MacCalendar } from "./calendar";
import {
	clampDateValue,
	type DatePickerMode,
	type DateSegment,
	type DateValueChangeDetails,
	dateChangeDetails,
	localDateValue,
	padDatePart,
	requireDateValue,
	segmentRange,
	setDateSegment,
	shiftDateValue,
} from "./date-picker-value";
import { useMacOSPortal } from "./environment";
import { useControlValue } from "./use-control-value";
import { WindowSymbol } from "./window-symbol";

export interface MacDatePickerProps
	extends Omit<ComponentPropsWithRef<"fieldset">, "onChange" | "defaultValue"> {
	calendar?: boolean;
	defaultValue?: string;
	form?: string;
	hourCycle?: "h12" | "h23";
	label: string;
	max?: string;
	min?: string;
	mode?: DatePickerMode;
	onValueChange?: (value: string, details: DateValueChangeDetails) => void;
	readOnly?: boolean;
	size?: "regular" | "small";
	today?: string;
	value?: string;
}
const SEPARATORS: Partial<Record<DateSegment, string>> = {
	hour: ",  ",
	minute: ":",
	period: " ",
};
const SEGMENT_NAMES = {
	day: "Day",
	hour: "Hour",
	minute: "Minute",
	month: "Month",
	period: "AM or PM",
	year: "Year",
};

// shortcut: Overlay attachment and mouse hold-repeat await native motion calibration.
export function MacDatePicker({
	label,
	mode = "date",
	value,
	defaultValue,
	onValueChange,
	min,
	max,
	disabled = false,
	readOnly = false,
	hourCycle = "h12",
	size = "regular",
	calendar = true,
	today,
	name,
	form,
	className = "",
	...props
}: MacDatePickerProps) {
	const [initialDefault] = useState(() => localDateValue(mode));
	const control = useControlValue<string, DateValueChangeDetails>({
		defaultValue: defaultValue ?? initialDefault,
		form,
		onChange: onValueChange,
		value,
	});
	const current = clampDateValue(control.value, mode, min, max);
	const parts = requireDateValue(current, mode);
	const [selected, setSelected] = useState<DateSegment>(
		mode === "time" ? "hour" : "month"
	);
	const [editing, setEditing] = useState<{
		segment: DateSegment;
		text: string;
		resetKey: number;
	} | null>(null);
	const [open, setOpen] = useState(false);
	const inputs = useRef(new Map<DateSegment, HTMLInputElement>());
	const field = useRef<HTMLSpanElement>(null);
	const popup = useRef<HTMLDivElement>(null);
	const container = useMacOSPortal();
	const segments: DateSegment[] = [];
	if (mode !== "time") {
		segments.push("month", "day", "year");
	}
	if (mode !== "date") {
		segments.push("hour", "minute");
		if (hourCycle === "h12") {
			segments.push("period");
		}
	}
	const activeSegment = segments.includes(selected) ? selected : segments[0];
	useEffect(() => {
		if (disabled || readOnly) {
			setOpen(false);
		}
	}, [disabled, readOnly]);
	const commit = (next: string, event: Event): boolean => {
		if (disabled || readOnly) {
			return false;
		}
		const bounded = clampDateValue(next, mode, min, max);
		const details = dateChangeDetails(event);
		if (bounded !== current) {
			control.change(bounded, details);
		}
		return !details.isCanceled;
	};
	const finishEditing = (event: Event, segment: DateSegment) => {
		const draft = editing;
		if (
			draft &&
			draft.segment === segment &&
			draft.resetKey === control.resetKey &&
			draft.text !== "" &&
			segment !== "period"
		) {
			commit(
				setDateSegment(current, mode, segment, Number(draft.text), hourCycle),
				event
			);
		}
		setEditing(null);
	};
	const display = (segment: DateSegment) => {
		if (segment === "period") {
			return parts.hour >= 12 ? "PM" : "AM";
		}
		if (segment === "hour" && hourCycle === "h12") {
			return String(parts.hour % 12 || 12);
		}
		return segment === "year"
			? padDatePart(parts.year, 4)
			: padDatePart(parts[segment]);
	};
	const segmentText = (segment: DateSegment) =>
		editing?.segment === segment && editing.resetKey === control.resetKey
			? editing.text
			: display(segment);
	const step = (amount: number, event: Event) => {
		setEditing(null);
		commit(shiftDateValue(current, mode, activeSegment, amount), event);
	};
	const navigationKey = (
		event: KeyboardEvent<HTMLInputElement>,
		segment: DateSegment
	) => {
		if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
			event.preventDefault();
			const next =
				segments[
					segments.indexOf(segment) + (event.key === "ArrowLeft" ? -1 : 1)
				];
			if (next) {
				inputs.current.get(next)?.focus();
			}
			return true;
		}
		if (
			(event.key === " " || (event.altKey && event.key === "ArrowDown")) &&
			mode !== "time" &&
			calendar &&
			!disabled &&
			!readOnly
		) {
			event.preventDefault();
			setOpen(true);
			return true;
		}
		if (event.key === "Escape") {
			setEditing(null);
			return true;
		}
		return false;
	};
	const keyDown = (
		event: KeyboardEvent<HTMLInputElement>,
		segment: DateSegment
	) => {
		if (navigationKey(event, segment)) {
			return;
		}
		if (readOnly || disabled) {
			return;
		}
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			step(event.key === "ArrowUp" ? 1 : -1, event.nativeEvent);
		}
		if (segment === "period" && ["a", "p", "A", "P"].includes(event.key)) {
			event.preventDefault();
			commit(
				setDateSegment(
					current,
					mode,
					"period",
					event.key.toLowerCase() === "p" ? 1 : 0
				),
				event.nativeEvent
			);
		}
	};
	const body = (
		<fieldset
			{...props}
			aria-label={label}
			className={`mac-date-picker ${className}`}
			data-mode={mode}
			data-readonly={readOnly || undefined}
			data-size={size}
			disabled={disabled}
		>
			<input
				disabled={disabled}
				form={form}
				name={name}
				type="hidden"
				value={current}
			/>
			<span className="mac-date-field" ref={field}>
				{segments.map((segment, index) => {
					const [low, high] = segmentRange(parts, segment, hourCycle);
					const separator = SEPARATORS[segment] ?? "/";
					let number =
						segment === "period" ? Math.floor(parts.hour / 12) : parts[segment];
					if (segment === "hour" && hourCycle === "h12") {
						number = parts.hour % 12 || 12;
					}
					return (
						<span className="mac-date-part" key={segment}>
							{index > 0 ? (
								<span aria-hidden="true" className="mac-date-separator">
									{separator}
								</span>
							) : null}
							<span className="mac-date-segment-wrap">
								<span aria-hidden="true" className="mac-date-measure">
									{segmentText(segment) || "0"}
								</span>
								<input
									aria-label={`${label}: ${SEGMENT_NAMES[segment]}`}
									aria-readonly={readOnly || undefined}
									aria-valuemax={high}
									aria-valuemin={low}
									aria-valuenow={number}
									aria-valuetext={display(segment)}
									autoComplete="off"
									className="mac-date-segment"
									data-segment={segment}
									form={form}
									inputMode={segment === "period" ? "text" : "numeric"}
									onBlur={(event) => finishEditing(event.nativeEvent, segment)}
									onChange={(event) => {
										if (readOnly || segment === "period") {
											return;
										}
										const text = event.currentTarget.value
											.replace(/\D/g, "")
											.slice(0, segment === "year" ? 4 : 2);
										const next = Number(text);
										const valid =
											text !== "" &&
											next >= low &&
											next <= high &&
											(segment !== "year" || text.length === 4);
										if (
											valid &&
											!commit(
												setDateSegment(current, mode, segment, next, hourCycle),
												event.nativeEvent
											)
										) {
											setEditing(null);
											return;
										}
										setEditing({ resetKey: control.resetKey, segment, text });
									}}
									onFocus={(event) => {
										setSelected(segment);
										event.currentTarget.select();
									}}
									onKeyDown={(event) => keyDown(event, segment)}
									readOnly={readOnly || segment === "period"}
									ref={(element) => {
										if (element) {
											inputs.current.set(segment, element);
										} else {
											inputs.current.delete(segment);
										}
										if (index === 0) {
											return control.inputRef(element);
										}
									}}
									role="spinbutton"
									type="text"
									value={segmentText(segment)}
								/>
							</span>
						</span>
					);
				})}
			</span>
			<span className="mac-date-stepper">
				{[1, -1].map((direction) => (
					<button
						aria-label={`${direction === 1 ? "Increase" : "Decrease"} ${label}`}
						disabled={disabled || readOnly}
						key={direction}
						onClick={(event) => step(direction, event.nativeEvent)}
						onMouseDown={(event) => event.preventDefault()}
						tabIndex={-1}
						type="button"
					>
						<WindowSymbol name="stepper-chevron-down" size={12} />
					</button>
				))}
			</span>
			{mode !== "time" && calendar ? (
				<Popover.Trigger
					aria-label={`Choose date: ${label}`}
					className="mac-date-calendar-trigger"
					disabled={disabled || readOnly}
					type="button"
				>
					<span aria-hidden="true">▦</span>
				</Popover.Trigger>
			) : null}
		</fieldset>
	);
	return (
		<Popover.Root
			onOpenChange={(next) => {
				if (!(next && (disabled || readOnly))) {
					setOpen(next);
				}
			}}
			open={open && !disabled && !readOnly}
		>
			{body}
			<Popover.Portal container={container}>
				<Popover.Positioner
					align="start"
					anchor={field}
					className="mac-date-positioner"
					side="bottom"
					sideOffset={0}
				>
					<Popover.Popup
						aria-label={`Choose date: ${label}`}
						className="mac-date-popup"
						finalFocus={() => inputs.current.get(activeSegment) ?? false}
						initialFocus={() =>
							popup.current?.querySelector<HTMLButtonElement>(
								".mac-date-popup [aria-pressed=true]"
							) ?? true
						}
						ref={popup}
					>
						<MacCalendar
							label={`${label} calendar`}
							max={max?.slice(0, 10)}
							min={min?.slice(0, 10)}
							onValueChange={(next, details) => {
								const combined =
									mode === "datetime" ? `${next}T${current.slice(11)}` : next;
								control.change(
									clampDateValue(combined, mode, min, max),
									details
								);
								if (!details.isCanceled) {
									setOpen(false);
								}
							}}
							today={today}
							value={current.slice(0, 10)}
						/>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}

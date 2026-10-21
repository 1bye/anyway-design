/** biome-ignore-all lint/performance/noJsxPropsBind: Interactive component playground handlers. */
import { MacCalendar } from "@anyway-design/macos/calendar";
import { MacCheckbox } from "@anyway-design/macos/checkbox";
import { MacComboBox } from "@anyway-design/macos/combo-box";
import {
	MacButton,
	MacSearchField,
	MacSwitch,
	MacTextField,
} from "@anyway-design/macos/controls";
import { MacDatePicker } from "@anyway-design/macos/date-picker";
import { MacPopUpButton } from "@anyway-design/macos/pop-up-button";
import { MacProgressBar, MacSpinner } from "@anyway-design/macos/progress";
import { MacRadio, MacRadioGroup } from "@anyway-design/macos/radio";
import { MacSegmentedControl } from "@anyway-design/macos/segmented-control";
import { MacSlider } from "@anyway-design/macos/slider";
import { MacStepper } from "@anyway-design/macos/stepper";
import type { ComponentType } from "react";
import type { PlaygroundDemoProps } from "./playground-catalog";
import { LAYOUT_ITEMS, PERIOD_ITEMS } from "./toggle-controls-samples";

const common = ({ values }: PlaygroundDemoProps) => ({
	disabled: Boolean(values.disabled),
	readOnly: Boolean(values.readOnly),
	size: values.size === "small" ? ("small" as const) : ("regular" as const),
});
const choice = ({ values }: PlaygroundDemoProps) => ({
	active: Boolean(values.active),
	disabled: Boolean(values.disabled),
	readOnly: Boolean(values.readOnly),
});
const REPORT_OPTIONS = PERIOD_ITEMS.map((item) => ({
	...item,
	disabled: item.value === "month",
}));

const FORM_DEMOS: Record<string, ComponentType<PlaygroundDemoProps>> = {
	button: (props) => (
		<MacButton
			disabled={Boolean(props.values.disabled)}
			onClick={() => props.onEvent(`onClick → ${props.values.label}`)}
			size={common(props).size}
			variant={props.values.variant === "primary" ? "primary" : "default"}
		>
			{String(props.values.label)}
		</MacButton>
	),
	calendar: (props) => (
		<MacCalendar
			defaultValue="2026-10-20"
			disabled={Boolean(props.values.disabled)}
			label="Departure"
			max={props.values.bounded ? "2026-11-15" : undefined}
			min={props.values.bounded ? "2026-10-10" : undefined}
			name="departure"
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
			readOnly={Boolean(props.values.readOnly)}
		/>
	),
	checkbox: (props) => (
		<MacCheckbox
			{...choice(props)}
			defaultChecked={Boolean(props.values.checked)}
			indeterminate={Boolean(props.values.indeterminate)}
			label={String(props.values.label)}
			name="notifications"
			onCheckedChange={(value) => props.onEvent(`onCheckedChange → ${value}`)}
		/>
	),
	"combo-box": (props) => (
		<MacComboBox
			{...common(props)}
			active={Boolean(props.values.active)}
			defaultValue={String(props.values.value)}
			items={["Day", "Week", "Month", "Quarter", "Year"]}
			label="Report frequency"
			mode={
				props.values.mode === "none" ||
				props.values.mode === "inline" ||
				props.values.mode === "both"
					? props.values.mode
					: "list"
			}
			name="frequency"
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
		/>
	),
	"date-picker": (props) => {
		const mode =
			props.values.mode === "datetime" || props.values.mode === "time"
				? props.values.mode
				: "date";
		const value = {
			date: "2026-10-20",
			datetime: "2026-10-20T14:35",
			time: "14:35",
		}[mode];
		return (
			<MacDatePicker
				{...common(props)}
				calendar={Boolean(props.values.calendar)}
				defaultValue={value}
				hourCycle={props.values.hourCycle === "h23" ? "h23" : "h12"}
				label="Appointment"
				mode={mode}
				name="appointment"
				onValueChange={(next) => props.onEvent(`onValueChange → ${next}`)}
			/>
		);
	},
	"pop-up-button": (props) => (
		<MacPopUpButton
			{...common(props)}
			active={Boolean(props.values.active)}
			defaultValue={String(props.values.value)}
			items={REPORT_OPTIONS}
			label="Report frequency"
			name="frequency"
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
		/>
	),
	radio: (props) => (
		<MacRadioGroup
			defaultValue={String(props.values.value)}
			disabled={Boolean(props.values.disabled)}
			label="Report frequency"
			name="frequency"
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
			readOnly={Boolean(props.values.readOnly)}
		>
			{REPORT_OPTIONS.map((option) => (
				<MacRadio
					active={Boolean(props.values.active)}
					disabled={option.disabled}
					key={option.value}
					label={option.label}
					value={option.value}
				/>
			))}
		</MacRadioGroup>
	),
	"search-field": (props) => (
		<MacSearchField
			{...common(props)}
			aria-label="Search"
			defaultValue={String(props.values.value)}
			name="query"
			onSearch={(value) => props.onEvent(`onSearch → ${value}`)}
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
			placeholder={String(props.values.placeholder)}
		/>
	),
	"segmented-control": (props) => (
		<MacSegmentedControl
			{...common(props)}
			defaultValue={props.values.icons ? "list" : "week"}
			items={props.values.icons ? LAYOUT_ITEMS : REPORT_OPTIONS}
			label="View"
			name="view"
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
		/>
	),
	slider: (props) => (
		<MacSlider
			active={Boolean(props.values.active)}
			defaultValue={Number(props.values.value)}
			disabled={Boolean(props.values.disabled)}
			label="Volume"
			max={100}
			min={0}
			name="volume"
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
			step={Number(props.values.step)}
			tickMarks={Number(props.values.tickMarks)}
		/>
	),
	stepper: (props) => (
		<MacStepper
			{...choice(props)}
			defaultValue={Number(props.values.value)}
			label="Quantity"
			max={100}
			min={0}
			name="quantity"
			onValueChange={(value) => props.onEvent(`onValueChange → ${value}`)}
			step={Number(props.values.step)}
		/>
	),
	switch: (props) => (
		<MacSwitch
			{...common(props)}
			defaultChecked={Boolean(props.values.checked)}
			label={String(props.values.label)}
			name="notifications"
			onCheckedChange={(value) => props.onEvent(`onCheckedChange → ${value}`)}
		/>
	),
	"text-field": (props) => (
		<MacTextField
			{...common(props)}
			aria-label="Project name"
			defaultValue={String(props.values.value)}
			name="project"
			onChange={(event) =>
				props.onEvent(`onChange → ${event.currentTarget.value}`)
			}
			placeholder={String(props.values.placeholder)}
			type={props.values.type === "password" ? "password" : "text"}
		/>
	),
};

export function FormDemo(props: PlaygroundDemoProps) {
	const Demo = FORM_DEMOS[props.entry.id];
	return (
		<form
			className="pg-form-demo"
			onReset={() => props.onEvent("Form reset → initial values restored")}
			onSubmit={(event) => {
				event.preventDefault();
				props.onEvent(
					"FormData → " +
						JSON.stringify(
							Object.fromEntries(new FormData(event.currentTarget))
						)
				);
			}}
		>
			<div className="pg-control-example">
				<Demo {...props} />
			</div>
			{props.entry.id === "button" ? null : (
				<div className="pg-example-actions">
					<MacButton size="small" type="reset">
						Reset form
					</MacButton>
					<MacButton size="small" type="submit">
						Submit form
					</MacButton>
				</div>
			)}
		</form>
	);
}
export function ProgressDemo({ entry, values }: PlaygroundDemoProps) {
	const props = {
		active: Boolean(values.active),
		hidesWhenStopped: Boolean(values.hidesWhenStopped),
		label: "Export progress",
		running: Boolean(values.running),
		size: values.size === "small" ? ("small" as const) : ("regular" as const),
	};
	return (
		<div className="pg-progress-demo">
			{entry.id === "spinner" ? (
				<MacSpinner {...props} />
			) : (
				<MacProgressBar
					{...props}
					value={values.indeterminate ? null : Number(values.value)}
				/>
			)}
			<span>
				{entry.id === "spinner" || values.indeterminate
					? "Working…"
					: `${String(values.value)}% complete`}
			</span>
		</div>
	);
}

export const FORM_DEMO_IDS = Object.keys(FORM_DEMOS);

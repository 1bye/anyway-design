import { MacCheckbox } from "@anyway-design/macos/checkbox";
import { MacRadio, MacRadioGroup } from "@anyway-design/macos/radio";
import { MacSlider } from "@anyway-design/macos/slider";
import { MacStepper } from "@anyway-design/macos/stepper";

export const INPUT_ROWS = [
	{ id: "checkbox", label: "Checkbox", top: 76 },
	{ id: "mixed", label: "Mixed checkbox", top: 112 },
	{ id: "radio", label: "Radio button", top: 158 },
	{ id: "slider", label: "Slider", top: 208 },
	{ id: "ticks", label: "Ticked slider", top: 258 },
	{ id: "stepper", label: "Stepper", top: 316 },
] as const;
const COLUMNS = ["Default", "Selected / middle", "Disabled"] as const;

function InputSample({
	row,
	column,
	active,
}: {
	row: (typeof INPUT_ROWS)[number];
	column: number;
	active: boolean;
}) {
	const disabled = column === 2;
	const label = `${row.label}: ${COLUMNS[column]}`;
	if (row.id === "radio") {
		return (
			<MacRadioGroup defaultValue={column ? "option" : ""} label={label}>
				<MacRadio
					active={active}
					disabled={disabled}
					label="Option"
					value="option"
				/>
			</MacRadioGroup>
		);
	}
	if (row.id === "checkbox" || row.id === "mixed") {
		return (
			<MacCheckbox
				active={active}
				aria-label={label}
				defaultChecked={column > 0}
				disabled={disabled}
				indeterminate={row.id === "mixed"}
				label="Option"
			/>
		);
	}
	if (row.id === "stepper") {
		return (
			<MacStepper
				active={active}
				defaultValue={column === 1 ? 9 : 4}
				disabled={disabled}
				label={label}
				max={9}
				min={0}
			/>
		);
	}
	const ticks = row.id === "ticks";
	const tickValue = column ? 75 : 25;
	const continuousValue = column ? 50 : 0;
	return (
		<MacSlider
			active={active}
			defaultValue={ticks ? tickValue : continuousValue}
			disabled={disabled}
			label={label}
			step={ticks ? 25 : 1}
			style={{ width: 132 }}
			tickMarks={ticks ? 5 : 0}
		/>
	);
}

export function InputControlsCanvas({ active }: { active: boolean }) {
	return (
		<div className="input-study-canvas">
			<strong className="input-study-native-title">
				TAHOE / NATIVE APPKIT
			</strong>
			{COLUMNS.map((name, column) => (
				<span
					className="input-study-column"
					key={name}
					style={{ left: 168 + column * 148 }}
				>
					{name}
				</span>
			))}
			{INPUT_ROWS.map((row) => (
				<div key={row.id}>
					<span className="input-study-row-label" style={{ top: row.top + 3 }}>
						{row.label}
					</span>
					{COLUMNS.map((name, column) => (
						<div
							className="input-study-sample"
							key={name}
							style={{ left: 168 + column * 148, top: row.top }}
						>
							<InputSample active={active} column={column} row={row} />
						</div>
					))}
				</div>
			))}
			<span className="input-study-native-footer">
				NSButton · NSSlider · NSStepper
			</span>
		</div>
	);
}

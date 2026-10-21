import { MacComboBox } from "@anyway-design/macos/combo-box";
import {
	MacPopUpButton,
	type MacPopUpOption,
} from "@anyway-design/macos/pop-up-button";

export const QUALITY_OPTIONS: readonly MacPopUpOption[] = [
	{ label: "Automatic", value: "automatic" },
	{ label: "High Quality", value: "high" },
	{ label: "Compact", value: "compact" },
	{ disabled: true, label: "Unavailable", value: "unavailable" },
];
export const DESTINATIONS = [
	"Documents",
	"Downloads",
	"Desktop",
	"Applications",
];
export type SelectionReferenceState = "closed" | "popup" | "combo";
const ROWS = [
	{ label: "Pop-up button", top: 72 },
	{ label: "Small pop-up", top: 126 },
	{ label: "Combo box", top: 190 },
	{ label: "Small combo box", top: 244 },
];

function SelectionSample({
	row,
	column,
	state,
	onStateChange,
}: {
	column: number;
	onStateChange: (state: SelectionReferenceState) => void;
	row: number;
	state: SelectionReferenceState;
}) {
	const disabled = column === 1;
	const small = row % 2 === 1;
	const label = `${ROWS[row]?.label}: ${disabled ? "Disabled" : "Enabled"}`;
	const regularEnabled = !(small || disabled);
	if (row < 2) {
		return (
			<MacPopUpButton
				defaultValue="high"
				disabled={disabled}
				items={QUALITY_OPTIONS}
				label={label}
				onOpenChange={
					regularEnabled
						? (open) => onStateChange(open ? "popup" : "closed")
						: undefined
				}
				open={regularEnabled ? state === "popup" : undefined}
				size={small ? "small" : "regular"}
			/>
		);
	}
	return (
		<MacComboBox
			defaultValue="Documents"
			disabled={disabled}
			items={DESTINATIONS}
			label={label}
			onOpenChange={
				regularEnabled
					? (open) => onStateChange(open ? "combo" : "closed")
					: undefined
			}
			open={regularEnabled ? state === "combo" : undefined}
			size={small ? "small" : "regular"}
		/>
	);
}

export function SelectionControlsCanvas({
	state,
	onStateChange,
}: {
	onStateChange: (state: SelectionReferenceState) => void;
	state: SelectionReferenceState;
}) {
	return (
		<div className="selection-study-canvas">
			<strong className="selection-study-title">TAHOE / NATIVE APPKIT</strong>
			{["Enabled", "Disabled"].map((label, column) => (
				<span
					className="selection-study-column"
					key={label}
					style={{ left: 176 + column * 208 }}
				>
					{label}
				</span>
			))}
			{ROWS.map((row, index) => (
				<div key={row.label}>
					<span
						className="selection-study-row-label"
						style={{ top: row.top + 5 }}
					>
						{row.label}
					</span>
					{[0, 1].map((column) => (
						<div
							className="selection-study-sample"
							key={column}
							style={{
								left: 176 + column * 208,
								top: row.top + (index < 2 ? 1 : 0),
							}}
						>
							<SelectionSample
								column={column}
								onStateChange={onStateChange}
								row={index}
								state={state}
							/>
						</div>
					))}
				</div>
			))}
			<span className="selection-study-footer">
				NSPopUpButton · NSComboBox · regular & small
			</span>
		</div>
	);
}

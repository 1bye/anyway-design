import { MacSwitch } from "@1bye/macos/controls";
import {
	MacSegmentedControl,
	type MacSegmentedItem,
} from "@1bye/macos/segmented-control";
import { WindowSymbol } from "@1bye/macos/window-symbol";

export type ToggleFocus = "normal" | "switch" | "segment";
export const PERIOD_ITEMS: readonly MacSegmentedItem[] = [
	{ label: "Day", value: "day" },
	{ label: "Week", value: "week" },
	{ label: "Month", value: "month" },
];
export const PARTIAL_PERIOD_ITEMS = PERIOD_ITEMS.map((item) => ({
	...item,
	disabled: item.value === "month",
}));
export const LAYOUT_ITEMS: readonly MacSegmentedItem[] = [
	{ icon: <WindowSymbol name="icon-view" />, label: "Icons", value: "icons" },
	{ icon: <WindowSymbol name="list-view" />, label: "List", value: "list" },
	{
		icon: <WindowSymbol name="column-view" />,
		label: "Columns",
		value: "columns",
	},
];
const SWITCH_ROWS = [
	"Switch off",
	"Switch on",
	"Disabled off",
	"Disabled on",
] as const;
const SEGMENT_ROWS = [
	"Segments",
	"Disabled item",
	"Disabled group",
	"Icon segments",
] as const;

export function ToggleControlsCanvas({ focus }: { focus: ToggleFocus }) {
	return (
		<div className="toggle-study-canvas">
			<strong className="input-study-native-title">
				TAHOE / NATIVE APPKIT
			</strong>
			{["Regular", "Small"].map((title, column) => (
				<span
					className="input-study-column"
					key={title}
					style={{ left: 176 + column * 216 }}
				>
					{title}
				</span>
			))}
			{SWITCH_ROWS.map((title, row) => (
				<div key={title}>
					<span
						className="input-study-row-label"
						style={{ top: 75 + row * 40 }}
					>
						{title}
					</span>
					{["regular", "small"].map((size, column) => (
						<div
							className="toggle-study-switch"
							data-reference-focus={
								focus === "switch" && row === 1 && column === 0
							}
							key={size}
							style={{ left: 176 + column * 216, top: 72 + row * 40 }}
						>
							<MacSwitch
								aria-label={`${title}: ${column === 0 ? "Regular" : "Small"}`}
								defaultChecked={row % 2 === 1}
								disabled={row >= 2}
								label=""
								size={size as "regular" | "small"}
							/>
						</div>
					))}
				</div>
			))}
			{SEGMENT_ROWS.map((title, row) => (
				<div key={title}>
					<span
						className="input-study-row-label"
						style={{ top: 277 + row * 44 }}
					>
						{title}
					</span>
					{["regular", "small"].map((size, column) => {
						let items = PERIOD_ITEMS;
						if (row === 1) {
							items = PARTIAL_PERIOD_ITEMS;
						}
						if (row === 3) {
							items = LAYOUT_ITEMS;
						}
						return (
							<div
								className="toggle-study-segments"
								data-reference-focus={
									focus === "segment" && row === 0 && column === 0
								}
								key={size}
								style={{ left: 176 + column * 216, top: 272 + row * 44 }}
							>
								<MacSegmentedControl
									defaultValue={row === 3 ? "list" : "week"}
									disabled={row === 2}
									items={items}
									label={`${title}: ${column === 0 ? "Regular" : "Small"}`}
									size={size as "regular" | "small"}
									style={{ width: 176 }}
								/>
							</div>
						);
					})}
				</div>
			))}
			<span className="input-study-native-footer toggle-study-native-footer">
				NSSwitch · NSSegmentedControl · select one
			</span>
		</div>
	);
}

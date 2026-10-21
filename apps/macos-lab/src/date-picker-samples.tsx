import { MacCalendar } from "@anyway-design/macos/calendar";
import { MacDatePicker } from "@anyway-design/macos/date-picker";

export type DateFocus = "normal" | "focus";
const ROWS = ["Date", "Time", "Date & time", "Disabled date"];
const MODES = ["date", "time", "datetime", "date"] as const;
const VALUES = ["2026-10-20", "14:35", "2026-10-20T14:35", "2026-10-20"];
const SIZES = ["regular", "small"] as const;
export function DatePickerCanvas({ focus }: { focus: DateFocus }) {
	return (
		<div className="date-study-canvas">
			<strong className="input-study-native-title">
				TAHOE / NATIVE APPKIT
			</strong>
			{["Regular", "Small"].map((title, column) => (
				<span
					className="input-study-column"
					key={title}
					style={{ left: 168 + column * 242, top: 48 }}
				>
					{title}
				</span>
			))}
			{ROWS.map((title, row) => (
				<div key={title}>
					<span
						className="input-study-row-label"
						style={{ top: 84 + row * 44 }}
					>
						{title}
					</span>
					{SIZES.map((size, column) => (
						<div
							className="date-study-picker"
							data-reference-focus={
								focus === "focus" && row === 0 && column === 0
							}
							key={size}
							style={{ left: 168 + column * 242, top: 80 + row * 44 }}
						>
							<MacDatePicker
								defaultValue={VALUES[row]}
								disabled={row === 3}
								label={`${title}: ${column === 0 ? "Regular" : "Small"}`}
								mode={MODES[row]}
								size={size}
								today="2026-10-21"
							/>
						</div>
					))}
				</div>
			))}
			<span className="input-study-row-label" style={{ top: 286 }}>
				Calendar
			</span>
			<MacCalendar
				className="date-study-calendar"
				defaultValue="2026-10-20"
				label="Reference calendar"
				style={{ left: 168, top: 280 }}
				today="2026-10-21"
			/>
			<span className="input-study-native-footer" style={{ top: 534 }}>
				NSDatePicker · Gregorian · en_US · UTC
			</span>
		</div>
	);
}

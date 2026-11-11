import { MacProgressBar, MacSpinner } from "@1bye/macos/progress";

export const PROGRESS_ROWS = [
	{ id: "empty", label: "Empty", top: 72, value: 0 },
	{ id: "half", label: "50% complete", top: 108, value: 50 },
	{ id: "complete", label: "Complete", top: 144, value: 100 },
	{ id: "indeterminate", label: "Indeterminate", top: 190, value: null },
	{ id: "stopped-bar", label: "Stopped bar", top: 232, value: null },
	{ id: "spinner", label: "Spinner", top: 280, value: null },
	{ id: "stopped-spinner", label: "Stopped spinner", top: 326, value: null },
] as const;
const SIZES = ["regular", "small"] as const;

export function ProgressCanvas() {
	return (
		<div className="progress-study-canvas">
			<strong className="progress-study-title">TAHOE / NATIVE APPKIT</strong>
			{SIZES.map((size, column) => (
				<span
					className="progress-study-column"
					key={size}
					style={{ left: 176 + column * 208 }}
				>
					{column === 0 ? "Regular" : "Small"}
				</span>
			))}
			{PROGRESS_ROWS.map((row) => (
				<div key={row.id}>
					<span
						className="progress-study-row-label"
						style={{ top: row.top + 8 }}
					>
						{row.label}
					</span>
					{SIZES.map((size, column) => (
						<div
							className="progress-study-sample"
							key={size}
							style={{ left: 176 + column * 208, top: row.top }}
						>
							{row.id === "spinner" || row.id === "stopped-spinner" ? (
								<MacSpinner
									label={`${row.label}: ${size}`}
									running={row.id === "spinner"}
									size={size}
								/>
							) : (
								<MacProgressBar
									label={`${row.label}: ${size}`}
									running={row.id !== "stopped-bar"}
									size={size}
									value={row.value}
								/>
							)}
						</div>
					))}
				</div>
			))}
			<span className="progress-study-footer">
				NSProgressIndicator · bar &amp; spinning · regular &amp; small
			</span>
		</div>
	);
}

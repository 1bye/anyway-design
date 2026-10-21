import { MacSearchField, MacTextField } from "@anyway-design/macos/controls";

export type FieldFocus = "normal" | "text" | "search";
const ROWS = [
	{ label: "Empty", y: 72 },
	{ label: "Filled", y: 112 },
	{ label: "Password", y: 152 },
	{ label: "Read-only", y: 192 },
	{ label: "Disabled", y: 232 },
	{ label: "Search empty", y: 296 },
	{ label: "Search filled", y: 336 },
	{ label: "Search disabled", y: 376 },
	{ label: "Search read-only", y: 416 },
] as const;

export function TextFieldsCanvas({ focus }: { focus: FieldFocus }) {
	const focusedRow = focus === "text" ? 0 : 5;
	const hasFocus = focus !== "normal";
	return (
		<div className="text-fields-canvas">
			<strong className="input-study-native-title">
				TAHOE / NATIVE APPKIT
			</strong>
			{["Regular", "Small"].map((size, column) => (
				<span
					className="input-study-column"
					key={size}
					style={{ left: 176 + column * 216 }}
				>
					{size}
				</span>
			))}
			{ROWS.map((row, index) => (
				<div key={row.label}>
					<span className="input-study-row-label" style={{ top: row.y + 4 }}>
						{row.label}
					</span>
					{["regular", "small"].map((size, column) => {
						const search = index >= 5;
						const filled = index !== 0 && index !== 5;
						const filledValue = search ? "Tahoe" : "Design system";
						const props = {
							"aria-label": `${row.label}: ${column === 0 ? "Regular" : "Small"}`,
							defaultValue: filled ? filledValue : "",
							disabled: index === 4 || index === 7,
							readOnly: index === 3 || index === 8,
							size: size as "regular" | "small",
						};
						return (
							<div
								className="text-fields-sample"
								data-reference-focus={
									column === 0 && hasFocus && index === focusedRow
								}
								key={size}
								style={{ left: 176 + column * 216, top: row.y }}
							>
								{search ? (
									<MacSearchField {...props} />
								) : (
									<MacTextField
										{...props}
										autoComplete="off"
										placeholder="Project name"
										type={index === 2 ? "password" : "text"}
									/>
								)}
							</div>
						);
					})}
				</div>
			))}
			<span className="input-study-native-footer text-fields-native-footer">
				NSTextField · NSSecureTextField · NSSearchField
			</span>
		</div>
	);
}

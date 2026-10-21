/** biome-ignore-all lint/performance/noJsxPropsBind: Local control workbench callbacks. */
import { MacButton } from "@anyway-design/macos/controls";
import { MacDatePicker } from "@anyway-design/macos/date-picker";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { type FormEvent, useState } from "react";

export function DatePickerWorkbench({ dark }: { dark: boolean }) {
	const [date, setDate] = useState("2026-10-20");
	const [time, setTime] = useState("14:35");
	const [disabled, setDisabled] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [bounded, setBounded] = useState(false);
	const [h24, setH24] = useState(false);
	const [prevent, setPrevent] = useState(false);
	const [preventReset, setPreventReset] = useState(false);
	const [purple, setPurple] = useState(false);
	const [result, setResult] = useState(
		"Change a date, edit a time, or submit a form."
	);
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setResult(
			`Form values: ${JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))}`
		);
	};
	return (
		<section className="input-workbench">
			<h2>Choose a day. Set a time.</h2>
			<p>
				Arrow keys step through a selected segment. Space opens its calendar;
				arrows move across days, Page Up/Down changes months, Shift+Page Up/Down
				changes years, and Enter chooses a day. Escape returns focus to the
				field.
			</p>
			<div className="window-study-controls">
				<label>
					<input
						checked={disabled}
						onChange={(event) => setDisabled(event.target.checked)}
						type="checkbox"
					/>{" "}
					Disable controlled fields
				</label>
				<label>
					<input
						checked={readOnly}
						onChange={(event) => setReadOnly(event.target.checked)}
						type="checkbox"
					/>{" "}
					Read-only controlled fields
				</label>
				<label>
					<input
						checked={bounded}
						onChange={(event) => {
							setDate("2026-10-20");
							setBounded(event.target.checked);
						}}
						type="checkbox"
					/>{" "}
					Limit to Oct 10–Nov 15
				</label>
				<label>
					<input
						checked={h24}
						onChange={(event) => setH24(event.target.checked)}
						type="checkbox"
					/>{" "}
					24-hour time
				</label>
				<label>
					<input
						checked={purple}
						onChange={(event) => setPurple(event.target.checked)}
						type="checkbox"
					/>{" "}
					Purple accent
				</label>
			</div>
			<MacOSEnvironment
				accentColor={purple ? "#a34be0" : "#007aff"}
				appearance={dark ? "dark" : "light"}
			>
				<form
					className="input-workbench-form"
					onReset={() => {
						setDate("2026-10-20");
						setTime("14:35");
					}}
					onSubmit={submit}
				>
					<div className="date-workbench-fields">
						<strong>Controlled values</strong>
						<div className="date-workbench-field">
							<span>Appointment date</span>
							<MacDatePicker
								disabled={disabled}
								label="Appointment date"
								max={bounded ? "2026-11-15" : undefined}
								min={bounded ? "2026-10-10" : undefined}
								name="date"
								onValueChange={(next, details) => {
									if (prevent) {
										details.cancel();
										setResult("Date change canceled.");
									} else {
										setDate(next);
									}
								}}
								readOnly={readOnly}
								value={date}
							/>
						</div>
						<div className="date-workbench-field">
							<span>Appointment time</span>
							<MacDatePicker
								disabled={disabled}
								hourCycle={h24 ? "h23" : "h12"}
								label="Appointment time"
								mode="time"
								name="time"
								onValueChange={(next, details) => {
									if (prevent) {
										details.cancel();
										setResult("Time change canceled.");
									} else {
										setTime(next);
									}
								}}
								readOnly={readOnly}
								value={time}
							/>
						</div>
					</div>
					<div>
						<label>
							<input
								checked={prevent}
								onChange={(event) => setPrevent(event.target.checked)}
								type="checkbox"
							/>{" "}
							Prevent value changes
						</label>
						<p>
							Local values: {date} · {time}
						</p>
						<div className="date-workbench-actions">
							<MacButton type="reset">Reset controlled</MacButton>
							<MacButton type="submit" variant="primary">
								Submit controlled
							</MacButton>
						</div>
					</div>
				</form>
				<form
					className="input-workbench-form date-workbench-form"
					onReset={(event) => {
						if (preventReset) {
							event.preventDefault();
							setResult("Reset prevented.");
						} else {
							setResult("Uncontrolled defaults restored.");
						}
					}}
					onSubmit={submit}
				>
					<div className="date-workbench-fields">
						<strong>Uncontrolled defaults</strong>
						<div className="date-workbench-field">
							<span>Leap-day reminder · small</span>
							<MacDatePicker
								defaultValue="2024-02-29T23:59"
								label="Reminder"
								mode="datetime"
								name="reminder"
								size="small"
							/>
						</div>
					</div>
					<div>
						<label>
							<input
								checked={preventReset}
								onChange={(event) => setPreventReset(event.target.checked)}
								type="checkbox"
							/>{" "}
							Prevent default reset
						</label>
						<div className="date-workbench-actions">
							<MacButton type="reset">Reset defaults</MacButton>
							<MacButton type="submit">Submit defaults</MacButton>
						</div>
					</div>
				</form>
			</MacOSEnvironment>
			<p aria-live="polite" className="input-workbench-notice">
				{result}
			</p>
		</section>
	);
}

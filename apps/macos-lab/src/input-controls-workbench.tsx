/** biome-ignore-all lint/performance/noJsxPropsBind: Local state for the controls workbench. */
import { MacCheckbox } from "@1bye/macos/checkbox";
import { MacButton } from "@1bye/macos/controls";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacRadio, MacRadioGroup } from "@1bye/macos/radio";
import { MacSlider } from "@1bye/macos/slider";
import { MacStepper } from "@1bye/macos/stepper";
import { type FormEvent, useState } from "react";

export function InputControlsWorkbench({ dark }: { dark: boolean }) {
	const [formats, setFormats] = useState(["png"]);
	const [quality, setQuality] = useState("balanced");
	const [compression, setCompression] = useState(60);
	const [copies, setCopies] = useState<number | null>(4);
	const [decimal, setDecimal] = useState<number | null>(0.25);
	const [disabled, setDisabled] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [notice, setNotice] = useState("");
	const [accent, setAccent] = useState("#007aff");
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setNotice(
			`Submitted: ${JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))}`
		);
	};
	return (
		<section className="input-workbench">
			<h2>Try the controls.</h2>
			<p>
				Use Space for checkboxes, arrows within the radio group, and arrows /
				Home / End for numeric controls. Press and hold the stepper arrows to
				repeat.
			</p>
			<div className="window-study-controls">
				<label>
					<input
						checked={disabled}
						onChange={(event) => setDisabled(event.target.checked)}
						type="checkbox"
					/>{" "}
					Disable workbench
				</label>
				<label>
					<input
						checked={readOnly}
						onChange={(event) => setReadOnly(event.target.checked)}
						type="checkbox"
					/>{" "}
					Read-only choices and steppers
				</label>
				<label>
					Workbench accent{" "}
					<select
						aria-label="Workbench accent"
						onChange={(event) => setAccent(event.target.value)}
						value={accent}
					>
						<option value="#007aff">Blue</option>
						<option value="#af52de">Purple</option>
						<option value="#ff9500">Orange</option>
					</select>
				</label>
			</div>
			<MacOSEnvironment
				accentColor={accent}
				appearance={dark ? "dark" : "light"}
				preset="tahoe"
			>
				<form
					aria-label="Controlled controls"
					className="input-workbench-form"
					onReset={() => {
						setFormats(["png"]);
						setQuality("balanced");
						setCompression(60);
						setCopies(4);
						setDecimal(0.25);
						setNotice("Controlled values reset.");
					}}
					onSubmit={submit}
				>
					<fieldset>
						<legend>Formats</legend>
						<MacCheckbox
							checked={formats.length === 2}
							disabled={disabled}
							indeterminate={formats.length === 1}
							label="All formats"
							onCheckedChange={(next) =>
								setFormats(next ? ["png", "jpeg"] : [])
							}
							readOnly={readOnly}
						/>
						{["png", "jpeg"].map((format) => (
							<MacCheckbox
								checked={formats.includes(format)}
								disabled={disabled}
								key={format}
								label={format.toUpperCase()}
								name={`format-${format}`}
								onCheckedChange={(checked) =>
									setFormats((before) =>
										checked
											? [...before, format]
											: before.filter((item) => item !== format)
									)
								}
								readOnly={readOnly}
								value={format}
							/>
						))}
					</fieldset>
					<fieldset>
						<legend>Export quality</legend>
						<MacRadioGroup
							disabled={disabled}
							label="Export quality"
							name="quality"
							onValueChange={setQuality}
							readOnly={readOnly}
							value={quality}
						>
							<MacRadio label="Compact" value="compact" />
							<MacRadio label="Balanced" value="balanced" />
							<MacRadio disabled label="Unavailable" value="unavailable" />
							<MacRadio label="Original" value="original" />
						</MacRadioGroup>
					</fieldset>
					<div className="input-workbench-number">
						<span className="input-workbench-label">
							Compression <output>{compression}%</output>
						</span>
						<MacSlider
							disabled={disabled}
							id="input-compression"
							label="Compression"
							name="compression"
							onValueChange={setCompression}
							onValueCommitted={(value) =>
								setNotice(`Slider committed: ${value}`)
							}
							value={compression}
						/>
					</div>
					<div className="input-workbench-number">
						<label htmlFor="input-copies">
							Copies <span>0–9</span>
						</label>
						<MacStepper
							disabled={disabled}
							id="input-copies"
							label="Copies"
							max={9}
							min={0}
							name="copies"
							onValueChange={setCopies}
							readOnly={readOnly}
							required
							value={copies}
						/>
					</div>
					<div className="input-workbench-number">
						<label htmlFor="input-adjustment">
							Adjustment <span>−1–1 · step 0.25</span>
						</label>
						<MacStepper
							disabled={disabled}
							id="input-adjustment"
							label="Adjustment"
							max={1}
							min={-1}
							name="adjustment"
							onValueChange={setDecimal}
							readOnly={readOnly}
							step={0.25}
							value={decimal}
						/>
					</div>
					<div className="input-workbench-actions">
						<MacButton type="reset">Reset values</MacButton>
						<MacButton disabled={disabled} type="submit" variant="primary">
							Submit values
						</MacButton>
					</div>
				</form>
				<form
					aria-label="Uncontrolled controls"
					className="input-workbench-uncontrolled"
					onReset={() => setNotice("Uncontrolled defaults restored.")}
					onSubmit={submit}
				>
					<h3>Uncontrolled / native form reset</h3>
					<MacCheckbox
						defaultChecked
						disabled={disabled}
						label="Include metadata"
						name="metadata"
						readOnly={readOnly}
					/>
					<MacRadioGroup
						defaultValue="screen"
						disabled={disabled}
						label="Uncontrolled destination"
						name="destination"
						readOnly={readOnly}
					>
						<MacRadio label="Screen" value="screen" />
						<MacRadio label="Print" value="print" />
					</MacRadioGroup>
					<MacSlider
						defaultValue={25}
						disabled={disabled}
						label="Uncontrolled scale"
						name="scale"
						step={25}
						tickMarks={5}
					/>
					<MacStepper
						defaultValue={2}
						disabled={disabled}
						label="Uncontrolled count"
						max={5}
						min={0}
						name="count"
						readOnly={readOnly}
					/>
					<MacButton type="reset">Restore defaults</MacButton>
					<MacButton disabled={disabled} type="submit">
						Submit defaults
					</MacButton>
				</form>
			</MacOSEnvironment>
			<output aria-live="polite" className="input-workbench-notice">
				{notice || "Changes stay in this preview."}
			</output>
		</section>
	);
}

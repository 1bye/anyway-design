/** biome-ignore-all lint/performance/noJsxPropsBind: Local workbench callbacks. */
import { MacComboBox } from "@anyway-design/macos/combo-box";
import { MacButton } from "@anyway-design/macos/controls";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { MacPopUpButton } from "@anyway-design/macos/pop-up-button";
import { useState } from "react";
import { DESTINATIONS, QUALITY_OPTIONS } from "./selection-controls-samples";

const FONT_SUGGESTIONS = ["Helvetica", "Helvetica Neue", "Georgia", "Menlo"];
const LONG_OPTIONS = Array.from({ length: 64 }, (_, index) => ({
	disabled: index % 9 === 8,
	label: `Preset ${index + 1}`,
	value: `preset-${index + 1}`,
}));

export function SelectionControlsWorkbench({ dark }: { dark: boolean }) {
	const [quality, setQuality] = useState<string | null>("automatic");
	const [destination, setDestination] = useState("Documents");
	const [disabled, setDisabled] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [submitted, setSubmitted] = useState("No values submitted.");
	return (
		<section className="input-workbench">
			<h2>Try selection and custom text.</h2>
			<p>
				Type to find a pop-up option. In a combo box, enter your own value or
				choose a suggestion. Arrows navigate, Enter chooses, and Escape
				dismisses.
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
					Read-only workbench
				</label>
			</div>
			<MacOSEnvironment appearance={dark ? "dark" : "light"}>
				<form
					className="input-workbench-form selection-workbench-form"
					onReset={() => {
						setQuality("automatic");
						setDestination("Documents");
						setSubmitted("Defaults restored.");
					}}
					onSubmit={(event) => {
						event.preventDefault();
						setSubmitted(
							JSON.stringify(
								Object.fromEntries(new FormData(event.currentTarget))
							)
						);
					}}
				>
					<div>
						<p>Quality · controlled selection</p>
						<MacPopUpButton
							disabled={disabled}
							items={QUALITY_OPTIONS}
							label="Quality"
							name="quality"
							onValueChange={setQuality}
							readOnly={readOnly}
							required
							value={quality}
						/>
					</div>
					<div>
						<p>Destination · controlled, accepts custom text</p>
						<MacComboBox
							disabled={disabled}
							items={DESTINATIONS}
							label="Destination"
							name="destination"
							onValueChange={setDestination}
							readOnly={readOnly}
							required
							value={destination}
						/>
					</div>
					<div>
						<p>Long list · uncontrolled, disabled options</p>
						<MacPopUpButton
							defaultValue="preset-28"
							disabled={disabled}
							items={LONG_OPTIONS}
							label="Preset"
							name="preset"
							readOnly={readOnly}
						/>
					</div>
					<div>
						<p>Font · uncontrolled, filtered suggestions</p>
						<MacComboBox
							defaultValue="Helvetica"
							disabled={disabled}
							items={FONT_SUGGESTIONS}
							label="Font"
							mode="list"
							name="font"
							readOnly={readOnly}
						/>
					</div>
					<div className="input-workbench-actions">
						<MacButton type="reset">Restore defaults</MacButton>
						<MacButton type="submit" variant="primary">
							Submit values
						</MacButton>
					</div>
				</form>
			</MacOSEnvironment>
			<output className="input-workbench-notice">{submitted}</output>
		</section>
	);
}

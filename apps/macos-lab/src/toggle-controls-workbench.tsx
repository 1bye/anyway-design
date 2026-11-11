/** biome-ignore-all lint/performance/noJsxPropsBind: Local control workbench callbacks. */
import { MacButton, MacSwitch } from "@1bye/macos/controls";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacSegmentedControl } from "@1bye/macos/segmented-control";
import { MacTabs } from "@1bye/macos/tabs";
import { type FormEvent, useRef, useState } from "react";
import {
	LAYOUT_ITEMS,
	PARTIAL_PERIOD_ITEMS,
	PERIOD_ITEMS,
} from "./toggle-controls-samples";

export function ToggleControlsWorkbench({ dark }: { dark: boolean }) {
	const [enabled, setEnabled] = useState(true);
	const [period, setPeriod] = useState("week");
	const [tab, setTab] = useState("files");
	const [disabled, setDisabled] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [reduced, setReduced] = useState(false);
	const [customAccent, setCustomAccent] = useState(false);
	const [preventChange, setPreventChange] = useState(false);
	const [preventReset, setPreventReset] = useState(false);
	const [result, setResult] = useState(
		"Toggle a switch, choose a segment, or submit either form."
	);
	const switchRef = useRef<HTMLInputElement>(null);
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setResult(
			`Form values: ${JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))}`
		);
	};
	return (
		<section className="input-workbench">
			<h2>Change a setting. Choose a view.</h2>
			<p>
				Space toggles the focused switch. Arrow keys move and select among
				enabled segments. Native form reset restores uncontrolled defaults.
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
						checked={reduced}
						onChange={(event) => setReduced(event.target.checked)}
						type="checkbox"
					/>{" "}
					Reduced motion
				</label>
				<label>
					<input
						checked={customAccent}
						onChange={(event) => setCustomAccent(event.target.checked)}
						type="checkbox"
					/>{" "}
					Purple accent
				</label>
			</div>
			<MacOSEnvironment
				accentColor={customAccent ? "#a34be0" : "#007aff"}
				appearance={dark ? "dark" : "light"}
				reduceMotion={reduced}
			>
				<form
					className="input-workbench-form"
					onReset={() => {
						setEnabled(true);
						setPeriod("week");
						setResult("Controlled defaults restored.");
					}}
					onSubmit={submit}
				>
					<fieldset>
						<legend>Controlled settings</legend>
						<MacSwitch
							checked={enabled}
							disabled={disabled}
							label="Notifications"
							name="notifications"
							onCheckedChange={setEnabled}
							readOnly={readOnly}
							ref={switchRef}
							value="enabled"
						/>
						<p className="toggle-workbench-label">Summary period</p>
						<MacSegmentedControl
							disabled={disabled}
							items={PERIOD_ITEMS}
							label="Summary period"
							name="period"
							onValueChange={(value, details) => {
								if (preventChange) {
									details.cancel();
									setResult("Selection change canceled.");
									return;
								}
								setPeriod(value);
							}}
							readOnly={readOnly}
							required
							value={period}
						/>
					</fieldset>
					<fieldset>
						<legend>State and form behavior</legend>
						<label>
							<input
								checked={preventChange}
								onChange={(event) => setPreventChange(event.target.checked)}
								type="checkbox"
							/>{" "}
							Prevent selection changes
						</label>
						<div className="toggle-workbench-actions">
							<MacButton
								disabled={disabled}
								onClick={() => switchRef.current?.focus()}
							>
								Focus notifications
							</MacButton>
							<MacButton type="reset">Reset controlled</MacButton>
							<MacButton type="submit" variant="primary">
								Submit controlled
							</MacButton>
						</div>
					</fieldset>
				</form>
				<form
					className="input-workbench-form toggle-workbench-defaults"
					onReset={(event) => {
						if (preventReset) {
							event.preventDefault();
							setResult("Reset prevented; edited defaults were preserved.");
							return;
						}
						setResult("Uncontrolled defaults restored.");
					}}
					onSubmit={submit}
				>
					<fieldset>
						<legend>Uncontrolled defaults</legend>
						<MacSwitch
							defaultChecked
							label="Include metadata"
							name="metadata"
							size="small"
						/>
						<p className="toggle-workbench-label">
							Default period · Month disabled
						</p>
						<MacSegmentedControl
							defaultValue="week"
							items={PARTIAL_PERIOD_ITEMS}
							label="Default period"
							name="defaultPeriod"
							size="small"
						/>
						<p className="toggle-workbench-label">Layout</p>
						<MacSegmentedControl
							defaultValue="list"
							items={LAYOUT_ITEMS}
							label="Layout"
							name="layout"
						/>
					</fieldset>
					<fieldset>
						<legend>Native reset</legend>
						<label>
							<input
								checked={preventReset}
								onChange={(event) => setPreventReset(event.target.checked)}
								type="checkbox"
							/>{" "}
							Prevent default reset
						</label>
						<div className="toggle-workbench-actions">
							<MacButton type="reset">Reset defaults</MacButton>
							<MacButton type="submit">Submit defaults</MacButton>
						</div>
					</fieldset>
				</form>
				<div className="toggle-workbench-tabs">
					<h3>Segmented tabs share the same styling</h3>
					<MacTabs
						label="Preview sections"
						onValueChange={setTab}
						tabs={[
							{
								content: <p>Your files appear here.</p>,
								id: "files",
								label: "Files",
							},
							{
								content: <p>Recent activity appears here.</p>,
								id: "activity",
								label: "Activity",
							},
							{ content: null, disabled: true, id: "shared", label: "Shared" },
						]}
						value={tab}
						variant="segmented"
					/>
				</div>
			</MacOSEnvironment>
			<p aria-live="polite" className="input-workbench-notice">
				{result}
			</p>
		</section>
	);
}

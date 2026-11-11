/** biome-ignore-all lint/performance/noJsxPropsBind: Local workbench state and form callbacks. */
import { MacButton, MacSearchField, MacTextField } from "@1bye/macos/controls";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { type FormEvent, useRef, useState } from "react";

export function TextFieldsWorkbench({ dark }: { dark: boolean }) {
	const [name, setName] = useState("Design system");
	const [query, setQuery] = useState("Tahoe");
	const [disabled, setDisabled] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [preventReset, setPreventReset] = useState(false);
	const [result, setResult] = useState(
		"Edit a field, submit a search, or reset either form."
	);
	const search = useRef<HTMLInputElement>(null);
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		setResult(`Form values: ${JSON.stringify(Object.fromEntries(data))}`);
	};
	return (
		<section className="input-workbench">
			<h2>Type, search, and reset.</h2>
			<p>
				Return or the magnifying glass submits a search. Escape or the clear
				button clears editable text and keeps focus in the field. Tab moves to
				the next field.
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
			</div>
			<MacOSEnvironment
				appearance={dark ? "dark" : "light"}
				className="text-fields-workbench"
			>
				<form
					className="input-workbench-form"
					onReset={() => {
						setName("Design system");
						setQuery("Tahoe");
					}}
					onSubmit={submit}
				>
					<fieldset>
						<legend>Controlled fields</legend>
						<label htmlFor="fields-project">Project name</label>
						<MacTextField
							disabled={disabled}
							id="fields-project"
							name="project"
							onChange={(event) => setName(event.target.value)}
							readOnly={readOnly}
							required
							value={name}
						/>
						<label htmlFor="fields-search">Search components</label>
						<MacSearchField
							disabled={disabled}
							id="fields-search"
							name="query"
							onSearch={(value) =>
								setResult(`Search submitted: ${value || "(empty)"}`)
							}
							onValueChange={setQuery}
							readOnly={readOnly}
							ref={search}
							value={query}
						/>
					</fieldset>
					<fieldset>
						<legend>Editing and focus</legend>
						<p className="text-fields-hint">
							Required Project name uses browser form validation. Disabled
							fields are omitted from submission; read-only fields remain
							selectable.
						</p>
						<div className="text-fields-actions">
							<MacButton
								disabled={disabled}
								onClick={() => search.current?.focus()}
							>
								Focus search
							</MacButton>
							<MacButton type="reset">Reset controlled</MacButton>
							<MacButton type="submit" variant="primary">
								Submit controlled
							</MacButton>
						</div>
					</fieldset>
				</form>
				<form
					className="input-workbench-form text-fields-uncontrolled"
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
						<label htmlFor="fields-default-name">Default project</label>
						<MacTextField
							defaultValue="Untitled"
							id="fields-default-name"
							name="defaultProject"
							size="small"
						/>
						<label htmlFor="fields-default-query">Default search</label>
						<MacSearchField
							defaultValue="Tahoe"
							id="fields-default-query"
							name="defaultQuery"
							size="small"
						/>
					</fieldset>
					<fieldset>
						<legend>Native form reset</legend>
						<label>
							<input
								checked={preventReset}
								onChange={(event) => setPreventReset(event.target.checked)}
								type="checkbox"
							/>{" "}
							Prevent default reset
						</label>
						<div className="text-fields-actions">
							<MacButton type="reset">Reset defaults</MacButton>
							<MacButton type="submit">Submit defaults</MacButton>
						</div>
					</fieldset>
				</form>
			</MacOSEnvironment>
			<p aria-live="polite" className="input-workbench-notice">
				{result}
			</p>
		</section>
	);
}

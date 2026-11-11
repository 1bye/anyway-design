import { CopyButton } from "@anyway-design/docs/copy-button";
import { PlaygroundChoice } from "@anyway-design/docs/playground-choice";
import {
	PLAYGROUND_ENVIRONMENT,
	type PlaygroundEntry,
	type PlaygroundProperty,
	playgroundDefaults,
} from "macos-lab/catalog";
import { playgroundExample } from "macos-lab/examples";
import { type ChangeEvent, useCallback, useId, useState } from "react";
import { getMacosLabUrl } from "../lib/macos-lab";
import { MacosLivePreview } from "./macos-live-preview";

const initialProps = new Set([
	"value",
	"checked",
	"modal",
	"mode",
	"view",
	"section",
	"expanded",
	"defaultOpen",
]);
const booleanOptions = [
	{ label: "Off", value: false },
	{ label: "On", value: true },
] as const;
const appearanceOptions = [
	{ label: "Light", value: "light" },
	{ label: "Dark", value: "dark" },
] as const;
const presetOptions = [
	{ label: "Tahoe", value: "tahoe" },
	{ label: "Sequoia", value: "sequoia" },
] as const;

function PropertyControl({
	property,
	value,
	onChange,
}: {
	property: PlaygroundProperty;
	value: string | boolean | number;
	onChange: (key: string, value: string | boolean | number) => void;
}) {
	const id = useId();
	const changeBoolean = useCallback(
		(next: boolean) => onChange(property.key, next),
		[onChange, property.key]
	);
	const changeInput = useCallback(
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const next = event.target.value;
			if (typeof property.initial !== "number") {
				onChange(property.key, next);
			} else if (next !== "" && Number.isFinite(Number(next))) {
				onChange(
					property.key,
					Math.min(
						property.max ?? Number(next),
						Math.max(property.min ?? Number(next), Number(next))
					)
				);
			}
		},
		[onChange, property]
	);
	if (typeof property.initial === "boolean") {
		return (
			<PlaygroundChoice
				label={property.label}
				onValueChange={changeBoolean}
				options={booleanOptions}
				value={Boolean(value)}
			/>
		);
	}
	return (
		<div className="platform-property-control">
			<label htmlFor={id}>{property.label}</label>
			{property.options ? (
				<select id={id} onChange={changeInput} value={String(value)}>
					{property.options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			) : (
				<input
					id={id}
					max={property.max}
					min={property.min}
					onChange={changeInput}
					step={property.step ?? 1}
					type={typeof property.initial === "number" ? "number" : "text"}
					value={String(value)}
				/>
			)}
		</div>
	);
}

export default function MacosComponentPage({
	entry,
}: {
	entry: PlaygroundEntry;
}) {
	const [values, setValues] = useState(() => playgroundDefaults(entry));
	const [environment, setEnvironment] = useState(PLAYGROUND_ENVIRONMENT);
	const [revision, setRevision] = useState(0);
	const [tab, setTab] = useState("preview");
	const [event, setEvent] = useState("");
	const changeProperty = useCallback(
		(key: string, value: string | number | boolean) => {
			setValues((current) => ({ ...current, [key]: value }));
			if (initialProps.has(key)) {
				setRevision((current) => current + 1);
			}
		},
		[]
	);
	const changeAppearance = useCallback(
		(appearance: "light" | "dark") =>
			setEnvironment((current) => ({ ...current, appearance })),
		[]
	);
	const changePreset = useCallback(
		(preset: "tahoe" | "sequoia") =>
			setEnvironment((current) => ({ ...current, preset })),
		[]
	);
	const showPreview = useCallback(() => setTab("preview"), []);
	const showCode = useCallback(() => setTab("code"), []);
	const reset = useCallback(() => {
		setValues(playgroundDefaults(entry));
		setEnvironment(PLAYGROUND_ENVIRONMENT);
		setRevision((current) => current + 1);
		setEvent("Preview reset.");
	}, [entry]);
	const code = playgroundExample(entry, values, environment);
	return (
		<>
			<section
				aria-label={`${entry.title} example`}
				className="platform-component-example not-prose my-6 rounded-2xl bg-fd-muted/45"
			>
				<div className="flex flex-wrap items-center justify-between gap-3 p-4">
					<fieldset aria-label="Example view" className="flex gap-1">
						<button
							aria-pressed={tab === "preview"}
							className="platform-example-tab"
							onClick={showPreview}
							type="button"
						>
							Preview
						</button>
						<button
							aria-pressed={tab === "code"}
							className="platform-example-tab"
							onClick={showCode}
							type="button"
						>
							Code
						</button>
					</fieldset>
					<div className="flex items-center gap-2">
						<CopyButton text={code} />
						<button
							className="min-h-11 rounded-full px-3 text-sm hover:bg-fd-accent"
							onClick={reset}
							type="button"
						>
							Reset
						</button>
					</div>
				</div>
				<div hidden={tab !== "preview"}>
					<MacosLivePreview
						entry={entry}
						environment={environment}
						onEvent={setEvent}
						onPropertyChange={changeProperty}
						revision={revision}
						values={values}
					/>
				</div>
				<div className="p-4" hidden={tab !== "code"}>
					<pre
						className="max-h-[640px] overflow-auto rounded-xl bg-fd-background p-4 text-xs leading-relaxed"
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the code region.
						tabIndex={0}
					>
						<code>{code}</code>
					</pre>
				</div>
				<output
					aria-label="Latest preview event"
					aria-live="polite"
					className="block min-h-6 px-5 text-fd-muted-foreground text-xs"
				>
					{event}
				</output>
				<div className="docs-playground-controls p-4">
					<h2 className="mb-3 font-medium text-sm">Controls</h2>
					<div className="grid gap-2 sm:grid-cols-2">
						<PlaygroundChoice
							label="Appearance"
							onValueChange={changeAppearance}
							options={appearanceOptions}
							value={environment.appearance}
						/>
						<PlaygroundChoice
							label="Preset"
							onValueChange={changePreset}
							options={presetOptions}
							value={environment.preset}
						/>
						{entry.properties.map((property) => (
							<PropertyControl
								key={property.key}
								onChange={changeProperty}
								property={property}
								value={values[property.key] ?? property.initial}
							/>
						))}
					</div>
				</div>
			</section>
			<h2 id="usage">Usage</h2>
			<p>
				Import <code>{entry.imports}</code> from{" "}
				<code>@1bye/macos/{entry.module}</code>. Load the shared stylesheet once
				and wrap the component in <code>MacOSEnvironment</code>. The Code view
				includes the current props and environment setup.
			</p>
			<h2 id="properties">Properties</h2>
			{entry.properties.length ? (
				<div className="overflow-x-auto">
					<table>
						<thead>
							<tr>
								<th>Property</th>
								<th>Default</th>
								<th>Values</th>
							</tr>
						</thead>
						<tbody>
							{entry.properties.map((property) => (
								<tr key={property.key}>
									<td>
										<code>{property.key}</code>
									</td>
									<td>
										<code>{String(property.initial)}</code>
									</td>
									<td>
										{property.options?.join(" · ") ?? typeof property.initial}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p>
					This example uses the component’s standard configuration. The
					generated code shows its composition and event handlers.
				</p>
			)}
			<h2 id="native-reference">Native reference</h2>
			<p>
				<a
					href={getMacosLabUrl({ component: entry.id })}
					rel="noopener noreferrer"
					target="_blank"
				>
					Open in the full lab ↗
				</a>
				{entry.reference ? (
					<>
						{" "}
						·{" "}
						<a
							href={getMacosLabUrl({ view: entry.reference })}
							rel="noopener noreferrer"
							target="_blank"
						>
							Compare with macOS ↗
						</a>
					</>
				) : null}
			</p>
		</>
	);
}

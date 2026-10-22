/** biome-ignore-all lint/performance/noJsxPropsBind: Playground inspector and navigation handlers. */
import {
	ArrowLeft,
	ArrowUpRight,
	Check,
	ChevronRight,
	Code2,
	Copy,
	Monitor,
	RotateCcw,
	Search,
	Settings2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	PLAYGROUND_ENTRIES,
	PLAYGROUND_ENVIRONMENT,
	type PlaygroundEntry,
	type PlaygroundEnvironment,
	type PlaygroundProperty,
	playgroundDefaults,
	playgroundEntry,
	playgroundMatches,
} from "./playground-catalog";
import { playgroundExample } from "./playground-examples";
import { PlaygroundPreview } from "./playground-preview";
import "./playground.css";

const INITIAL_PROPS = new Set([
	"value",
	"checked",
	"modal",
	"mode",
	"view",
	"section",
	"expanded",
	"defaultOpen",
]);

function selectedEntry(): PlaygroundEntry {
	return playgroundEntry(
		new URLSearchParams(window.location.search).get("component")
	);
}

interface PropertyProps {
	onChange: (key: string, value: string | number | boolean) => void;
	property: PlaygroundProperty;
	value: string | number | boolean;
}
function PropertyField({ property, value, onChange }: PropertyProps) {
	const { key, label, options, initial, min, max, step } = property;
	const id = `pg-property-${key}`;
	if (typeof initial === "boolean") {
		return (
			<label className="pg-check-row" htmlFor={id}>
				<span>{label}</span>
				<input
					checked={Boolean(value)}
					id={id}
					onChange={(event) => onChange(key, event.target.checked)}
					type="checkbox"
				/>
			</label>
		);
	}
	return (
		<label className="pg-field" htmlFor={id}>
			<span>{label}</span>
			{options ? (
				<select
					id={id}
					onChange={(event) => onChange(key, event.target.value)}
					value={String(value)}
				>
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			) : (
				<input
					id={id}
					max={max}
					min={min}
					onChange={(event) => {
						const next = event.target.value;
						if (typeof initial === "number") {
							const number = Number(next);
							if (next !== "" && Number.isFinite(number)) {
								onChange(
									key,
									Math.min(max ?? number, Math.max(min ?? number, number))
								);
							}
						} else {
							onChange(key, next);
						}
					}}
					step={step ?? 1}
					type={typeof initial === "number" ? "number" : "text"}
					value={String(value)}
				/>
			)}
		</label>
	);
}

interface EnvironmentProps {
	onChange: (next: PlaygroundEnvironment) => void;
	value: PlaygroundEnvironment;
}
function EnvironmentFields({ value, onChange }: EnvironmentProps) {
	return (
		<fieldset className="pg-fieldset">
			<legend>Environment</legend>
			<label className="pg-field">
				<span>Preset</span>
				<select
					onChange={(event) =>
						onChange({
							...value,
							preset: event.target.value === "sequoia" ? "sequoia" : "tahoe",
						})
					}
					value={value.preset}
				>
					<option value="tahoe">macOS Tahoe</option>
					<option value="sequoia">macOS Sequoia</option>
				</select>
			</label>
			<label className="pg-field">
				<span>Appearance</span>
				<select
					onChange={(event) =>
						onChange({
							...value,
							appearance: event.target.value === "dark" ? "dark" : "light",
						})
					}
					value={value.appearance}
				>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
			</label>
			<label className="pg-field pg-color-field">
				<span>Accent color</span>
				<input
					onChange={(event) =>
						onChange({ ...value, accentColor: event.target.value })
					}
					type="color"
					value={value.accentColor}
				/>
				<code>{value.accentColor}</code>
			</label>
			<label className="pg-check-row">
				<span>Reduce motion</span>
				<input
					checked={value.reduceMotion}
					onChange={(event) =>
						onChange({ ...value, reduceMotion: event.target.checked })
					}
					type="checkbox"
				/>
			</label>
			<label className="pg-check-row">
				<span>Reduce transparency</span>
				<input
					checked={value.reduceTransparency}
					onChange={(event) =>
						onChange({ ...value, reduceTransparency: event.target.checked })
					}
					type="checkbox"
				/>
			</label>
			<p className="pg-field-note">
				Native comparisons are calibrated against Tahoe. Preset support varies
				by component.
			</p>
		</fieldset>
	);
}

function PlaygroundSession({
	entry,
	environment,
	onEnvironmentChange,
}: {
	entry: PlaygroundEntry;
	environment: PlaygroundEnvironment;
	onEnvironmentChange: (next: PlaygroundEnvironment) => void;
}) {
	const [values, setValues] = useState(() => playgroundDefaults(entry));
	const [revision, setRevision] = useState(0);
	const [tab, setTab] = useState("preview");
	const [background, setBackground] = useState("auto");
	const [width, setWidth] = useState(entry.width);
	const [zoom, setZoom] = useState<"fit" | "actual">("fit");
	const [event, setEvent] = useState(
		"Interact with the preview to see its events."
	);
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState(false);
	const change = (key: string, value: string | number | boolean) => {
		setValues((current) => ({ ...current, [key]: value }));
		if (INITIAL_PROPS.has(key)) {
			setRevision((current) => current + 1);
		}
		setCopied(false);
	};
	const reset = () => {
		setValues(playgroundDefaults(entry));
		setRevision((current) => current + 1);
		setWidth(entry.width);
		setBackground("auto");
		setZoom("fit");
		setEvent("Preview reset.");
		setCopied(false);
	};
	const source = playgroundExample(entry, values, environment);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(source);
			setCopied(true);
			setCopyError(false);
		} catch {
			setCopyError(true);
		}
	};
	const { properties } = entry;
	return (
		<div className="pg-workspace">
			<main className="pg-main" id="playground-content" tabIndex={-1}>
				<div className="pg-breadcrumb">
					Components <ChevronRight size={13} /> {entry.group}
				</div>
				<header className="pg-entry-header">
					<div>
						<h1>{entry.title}</h1>
						<p>{entry.description}</p>
					</div>
					{entry.reference ? (
						<a className="pg-reference-link" href={`/?view=${entry.reference}`}>
							Native comparison <ArrowUpRight size={15} />
						</a>
					) : null}
				</header>
				<section
					aria-label={`${entry.title} example`}
					className="pg-example-card"
				>
					<div className="pg-example-toolbar">
						<fieldset aria-label="Example view" className="pg-view-tabs">
							<button
								aria-pressed={tab === "preview"}
								onClick={() => setTab("preview")}
								type="button"
							>
								<Monitor size={14} />
								Preview
							</button>
							<button
								aria-pressed={tab === "code"}
								onClick={() => setTab("code")}
								type="button"
							>
								<Code2 size={14} />
								Code
							</button>
						</fieldset>
						<div className="pg-example-tools">
							{tab === "preview" ? (
								<label className="pg-zoom">
									<span className="pg-sr-only">Preview zoom</span>
									<select
										onChange={(e) =>
											setZoom(e.target.value === "actual" ? "actual" : "fit")
										}
										value={zoom}
									>
										<option value="fit">Fit to canvas</option>
										<option value="actual">Actual size</option>
									</select>
								</label>
							) : (
								<button className="pg-text-button" onClick={copy} type="button">
									{copied ? <Check size={14} /> : <Copy size={14} />}
									{copied ? "Copied" : "Copy code"}
								</button>
							)}
							<button
								aria-label="Reset preview"
								className="pg-icon-button"
								onClick={reset}
								title="Reset preview"
								type="button"
							>
								<RotateCcw size={15} />
							</button>
						</div>
					</div>
					<div hidden={tab !== "preview"}>
						<PlaygroundPreview
							background={background}
							canvasWidth={width}
							entry={entry}
							environment={environment}
							onEvent={setEvent}
							onPropertyChange={change}
							revision={revision}
							values={values}
							zoom={zoom}
						/>
					</div>
					<div className="pg-code-view" hidden={tab !== "code"}>
						<p>
							Usage example · replace sample data and image paths with your own.
						</p>
						{copyError ? (
							<p role="status">
								Clipboard unavailable. Select and copy the code below.
							</p>
						) : null}
						<pre>
							<code>{source}</code>
						</pre>
					</div>
					<div className="pg-event-strip">
						<span className="pg-event-dot" />
						<output aria-label="Latest preview event" aria-live="polite">
							{event}
						</output>
					</div>
				</section>
				<div className="pg-module-line">
					<Code2 size={14} />
					<code>@anyway-design/macos/{entry.module}</code>
					<span>{entry.imports}</span>
				</div>
				<div className="pg-example-note">
					<Settings2 size={16} />
					<p>
						Adjust props in the inspector. Initial-value changes restart the
						example; Reset restores its defaults. File actions use sample data
						in memory.
					</p>
				</div>
			</main>
			<aside aria-label="Component inspector" className="pg-inspector">
				<div className="pg-inspector-heading">
					<h2>Inspector</h2>
					<button className="pg-text-button" onClick={reset} type="button">
						Reset
					</button>
				</div>
				<fieldset className="pg-fieldset">
					<legend>Component props</legend>
					{properties.length ? (
						properties.map((property) => (
							<PropertyField
								key={property.key}
								onChange={change}
								property={property}
								value={values[property.key] ?? property.initial}
							/>
						))
					) : (
						<p className="pg-field-note">
							This example is interactive. Use its controls directly in the
							preview.
						</p>
					)}
				</fieldset>
				<EnvironmentFields
					onChange={(next) => {
						onEnvironmentChange(next);
						setCopied(false);
					}}
					value={environment}
				/>
				<fieldset className="pg-fieldset">
					<legend>Canvas</legend>
					<label className="pg-field">
						<span>
							Width <output>{width}px</output>
						</span>
						<input
							aria-label="Canvas width"
							max={1200}
							min={320}
							onChange={(e) => setWidth(Number(e.target.value))}
							step={20}
							type="range"
							value={width}
						/>
					</label>
					<label className="pg-field">
						<span>Background</span>
						<select
							onChange={(e) => setBackground(e.target.value)}
							value={background}
						>
							<option value="auto">Automatic</option>
							<option value="neutral">Neutral</option>
							<option value="wallpaper">Wallpaper</option>
							<option value="checker">Checkerboard</option>
						</select>
					</label>
				</fieldset>
			</aside>
		</div>
	);
}

export function ComponentPlayground() {
	const [entry, setEntry] = useState(selectedEntry);
	const [search, setSearch] = useState("");
	const [environment, setEnvironment] = useState(PLAYGROUND_ENVIRONMENT);
	useEffect(() => {
		const pop = () => setEntry(selectedEntry());
		window.addEventListener("popstate", pop);
		return () => window.removeEventListener("popstate", pop);
	}, []);
	const matches = PLAYGROUND_ENTRIES.filter((item) =>
		playgroundMatches(item, search)
	);
	const groups = [...new Set(matches.map((item) => item.group))];
	const navigate = (item: PlaygroundEntry) => {
		const url = new URL(window.location.href);
		url.searchParams.delete("view");
		url.searchParams.set("component", item.id);
		window.history.pushState(null, "", url);
		setEntry(item);
	};
	return (
		<div className="pg-app">
			<a className="pg-skip" href="#playground-content">
				Skip to component
			</a>
			<aside aria-label="Component library" className="pg-library">
				<a className="pg-brand" href="/">
					<span className="pg-brand-mark">a</span>
					<span>
						anyway<span className="pg-brand-sub">macOS component library</span>
					</span>
				</a>
				<div className="pg-library-heading">
					<h2>Playground</h2>
					<span>{PLAYGROUND_ENTRIES.length}</span>
				</div>
				<div className="pg-library-search">
					<Search size={15} />
					<input
						aria-label="Search components"
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Find a component…"
						type="search"
						value={search}
					/>
					{search ? (
						<button
							aria-label="Clear search"
							onClick={() => setSearch("")}
							type="button"
						>
							<X size={13} />
						</button>
					) : null}
				</div>
				<nav aria-label="Components" className="pg-component-nav">
					{groups.map((group) => (
						<div className="pg-nav-group" key={group}>
							<h3>{group}</h3>
							{matches
								.filter((item) => item.group === group)
								.map((item) => (
									<a
										aria-current={entry.id === item.id ? "page" : undefined}
										href={`/?component=${item.id}`}
										key={item.id}
										onClick={(event) => {
											if (
												!(
													event.metaKey ||
													event.ctrlKey ||
													event.shiftKey ||
													event.altKey
												)
											) {
												event.preventDefault();
												navigate(item);
											}
										}}
									>
										{item.title}
										{entry.id === item.id ? <ChevronRight size={13} /> : null}
									</a>
								))}
						</div>
					))}
					{matches.length ? null : (
						<p className="pg-no-results">
							No components match “{search}”.
							<button onClick={() => setSearch("")} type="button">
								Clear search
							</button>
						</p>
					)}
				</nav>
				<a className="pg-library-footer" href="/?view=desktop-lab">
					<ArrowLeft size={14} />
					Desktop lab
					<ArrowUpRight size={13} />
				</a>
			</aside>
			<PlaygroundSession
				entry={entry}
				environment={environment}
				key={entry.id}
				onEnvironmentChange={setEnvironment}
			/>
		</div>
	);
}

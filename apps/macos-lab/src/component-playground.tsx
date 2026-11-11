/** biome-ignore-all lint/performance/noJsxPropsBind: Playground inspector and navigation handlers. */
import { Select } from "@base-ui/react/select";
import {
	ArrowUpRight,
	Check,
	ChevronDown,
	Copy,
	Layers,
	PanelLeftClose,
	PanelLeftOpen,
	RotateCcw,
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
} from "./playground-catalog";
import { playgroundExample } from "./playground-examples";
import { PlaygroundPreview } from "./playground-preview";
import "./playground.css";
import "./playground-shell.css";

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
const MOBILE_SIDEBAR_QUERY = "(max-width: 700px)";

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

function InspectorSelect({
	label,
	onChange,
	options,
	value,
}: {
	label: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	value: string;
}) {
	return (
		<Select.Root
			items={options}
			onValueChange={(next) => {
				if (next !== null) {
					onChange(next);
				}
			}}
			value={value}
		>
			<Select.Trigger aria-label={label} className="pg-select-trigger">
				<Select.Value />
				<ChevronDown size={14} />
			</Select.Trigger>
			<Select.Portal>
				<Select.Positioner
					align="end"
					alignItemWithTrigger={false}
					className="pg-select-positioner"
					sideOffset={4}
				>
					<Select.Popup className="pg-select-popup">
						<Select.List>
							{options.map((option) => (
								<Select.Item
									className="pg-select-item"
									key={option.value}
									value={option.value}
								>
									<Select.ItemText>{option.label}</Select.ItemText>
									<Select.ItemIndicator>
										<Check size={14} />
									</Select.ItemIndicator>
								</Select.Item>
							))}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}

function PropertyField({ property, value, onChange }: PropertyProps) {
	const { key, label, options, initial, min, max, step } = property;
	const id = `pg-property-${key}`;
	if (typeof initial === "boolean") {
		return (
			<label className="pg-check-row" htmlFor={id}>
				<span>{label}</span>
				<input
					aria-checked={Boolean(value)}
					checked={Boolean(value)}
					id={id}
					onChange={(event) => onChange(key, event.target.checked)}
					role="switch"
					type="checkbox"
				/>
			</label>
		);
	}
	return (
		<div className="pg-field">
			<span>{label}</span>
			{options ? (
				<InspectorSelect
					label={label}
					onChange={(next) => onChange(key, next)}
					options={options.map((option) => ({ label: option, value: option }))}
					value={String(value)}
				/>
			) : (
				<input
					aria-label={label}
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
		</div>
	);
}

interface EnvironmentProps {
	onChange: (next: PlaygroundEnvironment) => void;
	value: PlaygroundEnvironment;
}
function EnvironmentFields({ value, onChange }: EnvironmentProps) {
	return (
		<fieldset className="pg-fieldset">
			<legend className="pg-sr-only">Environment</legend>
			<div className="pg-field">
				<span>Preset</span>
				<InspectorSelect
					label="Preset"
					onChange={(next) =>
						onChange({
							...value,
							preset: next === "sequoia" ? "sequoia" : "tahoe",
						})
					}
					options={[
						{ label: "macOS Tahoe", value: "tahoe" },
						{ label: "macOS Sequoia", value: "sequoia" },
					]}
					value={value.preset}
				/>
			</div>
			<div className="pg-field">
				<span>Appearance</span>
				<InspectorSelect
					label="Appearance"
					onChange={(next) =>
						onChange({
							...value,
							appearance: next === "dark" ? "dark" : "light",
						})
					}
					options={[
						{ label: "Light", value: "light" },
						{ label: "Dark", value: "dark" },
					]}
					value={value.appearance}
				/>
			</div>
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
					aria-checked={value.reduceMotion}
					checked={value.reduceMotion}
					onChange={(event) =>
						onChange({ ...value, reduceMotion: event.target.checked })
					}
					role="switch"
					type="checkbox"
				/>
			</label>
			<label className="pg-check-row">
				<span>Reduce transparency</span>
				<input
					aria-checked={value.reduceTransparency}
					checked={value.reduceTransparency}
					onChange={(event) =>
						onChange({ ...value, reduceTransparency: event.target.checked })
					}
					role="switch"
					type="checkbox"
				/>
			</label>
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
	const [event, setEvent] = useState("");
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
				<header className="pg-entry-header">
					<h1>{entry.title}</h1>
					<span aria-hidden="true" className="pg-title-rule" />
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
								Preview
							</button>
							<button
								aria-pressed={tab === "code"}
								onClick={() => setTab("code")}
								type="button"
							>
								Code
							</button>
						</fieldset>
						<div className="pg-example-tools">
							{tab === "preview" ? (
								<div className="pg-zoom">
									<InspectorSelect
										label="Preview zoom"
										onChange={(next) =>
											setZoom(next === "actual" ? "actual" : "fit")
										}
										options={[
											{ label: "Fit to canvas", value: "fit" },
											{ label: "Actual size", value: "actual" },
										]}
										value={zoom}
									/>
								</div>
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
						<p>@1bye/macos/{entry.module}</p>
						{copyError ? (
							<p role="status">
								Clipboard unavailable. Select and copy the code below.
							</p>
						) : null}
						<pre>
							<code>{source}</code>
						</pre>
					</div>
					<output
						aria-label="Latest preview event"
						aria-live="polite"
						className="pg-sr-only"
					>
						{event}
					</output>
				</section>
			</main>
			<aside aria-label="Component inspector" className="pg-inspector">
				<div className="pg-inspector-heading">
					<h2>Preview settings</h2>
					<button className="pg-text-button" onClick={reset} type="button">
						Reset
					</button>
				</div>
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
					<div className="pg-field">
						<span>Background</span>
						<InspectorSelect
							label="Background"
							onChange={setBackground}
							options={[
								{ label: "Automatic", value: "auto" },
								{ label: "Neutral", value: "neutral" },
								{ label: "Wallpaper", value: "wallpaper" },
								{ label: "Checkerboard", value: "checker" },
							]}
							value={background}
						/>
					</div>
				</fieldset>
				{properties.length ? (
					<div className="pg-component-properties">
						<div className="pg-inspector-heading">
							<h2>Component</h2>
						</div>
						<fieldset className="pg-fieldset">
							<legend>{entry.title}</legend>
							{properties.map((property) => (
								<PropertyField
									key={property.key}
									onChange={change}
									property={property}
									value={values[property.key] ?? property.initial}
								/>
							))}
						</fieldset>
					</div>
				) : null}
			</aside>
		</div>
	);
}

export function ComponentPlayground() {
	const [entry, setEntry] = useState(selectedEntry);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(
		() => window.matchMedia(MOBILE_SIDEBAR_QUERY).matches
	);
	const [environment, setEnvironment] = useState(PLAYGROUND_ENVIRONMENT);
	useEffect(() => {
		const pop = () => setEntry(selectedEntry());
		window.addEventListener("popstate", pop);
		return () => window.removeEventListener("popstate", pop);
	}, []);
	const groups = [...new Set(PLAYGROUND_ENTRIES.map((item) => item.group))];
	const navigate = (item: PlaygroundEntry) => {
		const url = new URL(window.location.href);
		url.searchParams.delete("view");
		url.searchParams.set("component", item.id);
		window.history.pushState(null, "", url);
		setEntry(item);
		if (window.matchMedia(MOBILE_SIDEBAR_QUERY).matches) {
			setSidebarCollapsed(true);
			requestAnimationFrame(() =>
				document
					.getElementById("playground-content")
					?.focus({ preventScroll: true })
			);
		}
	};
	return (
		<div className="pg-app" data-sidebar-collapsed={sidebarCollapsed}>
			<a className="pg-skip" href="#playground-content">
				Skip to component
			</a>
			<header className="pg-site-header">
				<a className="pg-brand" href="?">
					<img
						alt="Anyway"
						height={52}
						src="/brand/anyway-wordmark.png"
						width={104}
					/>
				</a>
				<div className="pg-header-links">
					<span className="pg-platform">macOS</span>
					<a
						href="https://github.com/1bye/anyway-design"
						rel="noopener noreferrer"
						target="_blank"
					>
						GitHub <ArrowUpRight size={13} />
					</a>
				</div>
			</header>
			<nav aria-label="Playground navigation" className="pg-top-nav">
				<button
					aria-controls="pg-component-nav"
					aria-expanded={!sidebarCollapsed}
					aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					className="pg-collapse"
					onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
					type="button"
				>
					{sidebarCollapsed ? (
						<PanelLeftOpen size={16} />
					) : (
						<PanelLeftClose size={16} />
					)}
				</button>
				<a
					aria-current="page"
					className="pg-top-link"
					href={`?component=${entry.id}`}
				>
					<Layers size={14} />
					Components
				</a>
				{entry.reference ? (
					<a
						aria-label="Native comparison"
						className="pg-top-link pg-comparison-link"
						href={`?view=${entry.reference}`}
						title="Native comparison"
					>
						<span>Native comparison</span> <ArrowUpRight size={14} />
					</a>
				) : null}
			</nav>
			<aside aria-label="Component library" className="pg-library">
				<nav
					aria-label="Components"
					className="pg-component-nav"
					id="pg-component-nav"
				>
					{groups.map((group) => (
						<div className="pg-nav-group" key={group}>
							<h3>{group}</h3>
							{PLAYGROUND_ENTRIES.filter((item) => item.group === group).map(
								(item) => (
									<a
										aria-current={entry.id === item.id ? "page" : undefined}
										href={`?component=${item.id}`}
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
									</a>
								)
							)}
						</div>
					))}
				</nav>
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

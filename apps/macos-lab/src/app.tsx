/** biome-ignore-all lint/performance/noJsxPropsBind: This small interactive lab intentionally uses local handlers; pointer animation is isolated in the Dock. */
import type { MacOSAppearance } from "@anyway-design/macos/environment";
import {
	ArrowDownToLine,
	Check,
	ChevronRight,
	Code2,
	Columns2,
	Command,
	Copy,
	ExternalLink,
	Layers3,
	LayoutPanelTop,
	Monitor,
	Moon,
	MousePointer2,
	PanelBottom,
	PanelTop,
	RotateCcw,
	Settings2,
	SlidersHorizontal,
	Sun,
	Terminal,
	X,
} from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import {
	type ComponentName,
	DesktopScene,
	type SceneSettings,
	type Wallpaper,
} from "./scene";

const DEFAULTS: SceneSettings = {
	accentColor: "#007aff",
	active: true,
	appearance: "light",
	dockAutoHide: false,
	dockPosition: "bottom",
	dockSize: 52,
	magnification: 1.65,
	preset: "tahoe",
	reduceMotion: false,
	reduceTransparency: false,
	wallpaper: "clouds",
};
const COMPONENTS = [
	{
		description:
			"Familiar pieces, working together. Explore the desktop, then get into the details.",
		icon: Monitor,
		id: "desktop",
		subtitle: "The whole picture.",
		title: "Desktop",
	},
	{
		description:
			"Application menus with keyboard navigation, shortcuts, and translucent surfaces.",
		icon: PanelTop,
		id: "menu-bar",
		subtitle: "Always in its place.",
		title: "Menu bar",
	},
	{
		description:
			"Continuous magnification, running indicators, badges, and three places to call home.",
		icon: PanelBottom,
		id: "dock",
		subtitle: "Your favorites, within reach.",
		title: "Dock",
	},
	{
		description:
			"Window chrome, traffic lights, sidebars, and the subtle difference between active and inactive.",
		icon: LayoutPanelTop,
		id: "window",
		subtitle: "A frame that feels familiar.",
		title: "Window",
	},
	{
		description:
			"Segmented controls and document tabs with closing, reordering, and overflow.",
		icon: Columns2,
		id: "tabs",
		subtitle: "A small change of context.",
		title: "Tabs",
	},
	{
		description:
			"Buttons, switches, and fields with familiar proportions and responsive states.",
		icon: SlidersHorizontal,
		id: "controls",
		subtitle: "It's in the little things.",
		title: "Controls",
	},
] as const;
function Segmented<T extends string>({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: T;
	options: {
		value: T;
		label: ReactNode;
	}[];
	onChange: (value: T) => void;
}) {
	return (
		<fieldset aria-label={label} className="lab-segmented">
			{options.map((option) => (
				<button
					aria-pressed={value === option.value}
					key={option.value}
					onClick={() => onChange(option.value)}
					type="button"
				>
					{option.label}
				</button>
			))}
		</fieldset>
	);
}
function Toggle({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<label className="inspector-toggle">
			<span>{label}</span>
			<input
				aria-checked={checked}
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				role="switch"
				type="checkbox"
			/>
		</label>
	);
}
function Range({
	label,
	value,
	min,
	max,
	step = 1,
	unit,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	unit: string;
	onChange: (value: number) => void;
}) {
	const id = useId();
	return (
		<div className="inspector-range">
			<label htmlFor={id}>
				{label}
				<output>
					{value}
					{unit}
				</output>
			</label>
			<input
				id={id}
				max={max}
				min={min}
				onChange={(event) => onChange(Number(event.target.value))}
				step={step}
				type="range"
				value={value}
			/>
		</div>
	);
}
function exampleCode(component: ComponentName, settings: SceneSettings) {
	const environment = `preset="${settings.preset}"\n      appearance="${settings.appearance}"\n      accentColor="${settings.accentColor}"\n      reduceTransparency={${settings.reduceTransparency}}\n      reduceMotion={${settings.reduceMotion}}`;
	let imports = "";
	let state = "";
	let content = "";
	if (component === "dock" || component === "desktop") {
		imports = 'import { Dock } from "@anyway-design/macos/dock";';
		content = `<Dock\n        autoHide={${settings.dockAutoHide}}\n        size={${settings.dockSize}}\n        magnification={${settings.magnification}}\n        position="${settings.dockPosition}"\n        items={[\n          { id: "finder", label: "Finder", icon: "/assets/finder.webp", running: true },\n          { id: "safari", label: "Safari", icon: "/assets/safari.webp" },\n          { id: "mail", label: "Mail", icon: "/assets/mail.webp", badge: "2" },\n        ]}\n        onActivate={(id) => setSelected(id)}\n      />\n      <p aria-live="polite">{selected}</p>`;
		state = '  const [selected, setSelected] = useState("");\n';
	} else if (component === "menu-bar") {
		imports = 'import { MenuBar } from "@anyway-design/macos/menu-bar";';
		content =
			'<MenuBar\n        menus={[{ id: "file", label: "File", items: [\n          { id: "new", label: "New Window", shortcut: "⌘N" },\n        ] }]}\n        status="Tue 20 Oct 9:41"\n        onAction={(id) => setSelected(id)}\n      />\n      <p aria-live="polite">{selected}</p>';
		state = '  const [selected, setSelected] = useState("");\n';
	} else if (component === "window") {
		imports =
			'import { MacWindow } from "@anyway-design/macos/window";\nimport { WindowSidebar } from "@anyway-design/macos/window-sidebar";\nimport { WindowSymbol } from "@anyway-design/macos/window-symbol";\nimport { WindowToolbarButton, WindowToolbarGroup } from "@anyway-design/macos/window-toolbar";';
		content = `{open ? <MacWindow\n        title={selected}\n        active={${settings.active}}\n        sidebarWidth={165}\n        onClose={() => setOpen(false)}\n        sidebar={<WindowSidebar\n          selected={selected}\n          onSelect={setSelected}\n          groups={[{ id: "favorites", label: "Favorites", items: [\n            { id: "Documents", label: "Documents", icon: <WindowSymbol name="document" /> },\n            { id: "Downloads", label: "Downloads", icon: <WindowSymbol name="downloads" /> },\n          ] }]}\n        />}\n        toolbar={<WindowToolbarGroup label="View">\n          <WindowToolbarButton label="Refresh" onClick={() => setSelected("Documents")}>Refresh</WindowToolbarButton>\n        </WindowToolbarGroup>}\n      >\n        <p>Your application goes here.</p>\n      </MacWindow> : <button onClick={() => setOpen(true)}>Reopen</button>}`;
		state =
			'  const [open, setOpen] = useState(true);\n  const [selected, setSelected] = useState("Documents");\n';
	} else if (component === "tabs") {
		imports = 'import { MacTabs } from "@anyway-design/macos/tabs";';
		state = '  const [tab, setTab] = useState("all");\n';
		content =
			'<MacTabs\n        variant="segmented"\n        value={tab}\n        onValueChange={setTab}\n        tabs={[\n          { id: "all", label: "All files", content: <p>All files</p> },\n          { id: "recent", label: "Recent", content: <p>Recent files</p> },\n        ]}\n      />';
	} else {
		imports =
			'import { MacSwitch, MacButton, MacTextField, MacSearchField } from "@anyway-design/macos/controls";';
		state =
			'  const [enabled, setEnabled] = useState(true);\n  const [query, setQuery] = useState("");\n';
		content =
			'<div style={{ display: "grid", gap: 16, width: 320 }}>\n        <MacSwitch label="Notifications" checked={enabled} onCheckedChange={setEnabled} />\n        <label>Project name <MacTextField defaultValue="Design system" /></label>\n        <MacSearchField aria-label="Search components" value={query} onValueChange={setQuery} />\n        <MacButton variant="primary" onClick={() => setEnabled(true)}>Enable</MacButton>\n      </div>';
	}
	if (component === "desktop") {
		imports +=
			'\nimport { MenuBar } from "@anyway-design/macos/menu-bar";\nimport { MacWindow } from "@anyway-design/macos/window";';
		state += "  const [open, setOpen] = useState(true);\n";
		content = `<MenuBar menus={[{ id: "file", label: "File", items: [{ id: "new", label: "New Window" }] }]} onAction={() => setOpen(true)} />\n      {open ? <MacWindow title="Documents" active={${settings.active}} onClose={() => setOpen(false)} style={{ position: "absolute", top: 60, left: 40, width: 600, height: 280 }}>\n        <p>Your application goes here.</p>\n      </MacWindow> : null}\n      ${content.replace("onActivate={(id) => setSelected(id)}", "onActivate={(id) => { setSelected(id); setOpen(true); }}")}`;
	}
	return `import { useState } from "react";\nimport { MacOSEnvironment } from "@anyway-design/macos/environment";\n${imports}\nimport "@anyway-design/macos/styles.css";\n\nexport function Example() {\n${state}  return (\n    <MacOSEnvironment\n      ${environment}\n      style={{ minHeight: 480, padding: 32, background: "#64819b" }}\n    >\n      ${content}\n    </MacOSEnvironment>\n  );\n}`;
}
function ReferenceLinks({ component }: { component: ComponentName }) {
	if (component === "dock") {
		return (
			<>
				<a className="copy-button" href="/?view=dock-reference">
					<Columns2 size={14} /> Compare with Apple
				</a>
				<a className="copy-button" href="/?view=dock-glass">
					Try live glass
				</a>
			</>
		);
	}
	if (component === "window") {
		return (
			<>
				<a className="copy-button" href="/?view=window-reference">
					<Columns2 size={14} /> Compare with Apple
				</a>
				<a className="copy-button" href="/?view=menu-reference">
					Compare menus
				</a>
			</>
		);
	}
	if (component === "menu-bar") {
		return (
			<a className="copy-button" href="/?view=menu-reference">
				Compare menus with Apple
			</a>
		);
	}
	if (component === "tabs") {
		return (
			<a className="copy-button" href="/?view=window-reference">
				<Columns2 size={14} /> Compare document tabs with Apple
			</a>
		);
	}
	if (component === "controls") {
		return (
			<a className="copy-button" href="/?view=controls-reference">
				<Columns2 size={14} /> Compare with native AppKit
			</a>
		);
	}
	return null;
}

function initialComponent(): ComponentName {
	const component = new URLSearchParams(window.location.search).get(
		"component"
	);
	return COMPONENTS.find((entry) => entry.id === component)?.id ?? "desktop";
}

export function App() {
	const [settings, setSettings] = useState(DEFAULTS);
	const [component, setComponent] = useState<ComponentName>(initialComponent);
	const [mode, setMode] = useState<"preview" | "compare" | "code">("preview");
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState(false);
	const [revision, setRevision] = useState(0);
	const [nativeScale, setNativeScale] = useState(false);
	const [reference, setReference] = useState<string | null>(null);
	const [referenceOpacity, setReferenceOpacity] = useState(50);
	const selection =
		COMPONENTS.find((item) => item.id === component) ?? COMPONENTS[0];
	const source = exampleCode(component, settings);

	useEffect(
		() => () => {
			if (reference) {
				URL.revokeObjectURL(reference);
			}
		},
		[reference]
	);
	useEffect(() => {
		if (!copied) {
			return;
		}
		const timer = window.setTimeout(() => setCopied(false), 2000);
		return () => window.clearTimeout(timer);
	}, [copied]);
	async function copy() {
		try {
			await navigator.clipboard.writeText(source);
			setCopied(true);
			setCopyError(false);
		} catch {
			setCopyError(true);
			setMode("code");
		}
	}
	return (
		<div className="lab">
			<header className="lab-header">
				<a className="lab-brand" href="/">
					<span className="brand-mark">
						<Command size={19} />
					</span>
					anyway
					<span className="brand-divider" />
					<span className="brand-product">platform</span>
					<span className="alpha-badge">LAB</span>
				</a>
				<div className="header-right">
					<span className="react-label">
						<i />
						React components
					</span>
					<a
						href="https://developer.apple.com/design/human-interface-guidelines/designing-for-macos"
						rel="noopener noreferrer"
						target="_blank"
					>
						Design guidelines
						<ExternalLink size={12} />
					</a>
				</div>
			</header>
			<div className="lab-layout">
				<aside className="library">
					<div className="library-platform">
						<Monitor size={17} />
						<span>macOS</span>
						<span className="platform-count">06</span>
					</div>
					<p className="nav-label">COMPONENTS</p>
					<nav aria-label="Components">
						{COMPONENTS.map(({ id, title, icon: Icon }) => (
							<button
								aria-current={component === id ? "page" : undefined}
								key={id}
								onClick={() => setComponent(id)}
								type="button"
							>
								<Icon size={16} />
								<span>{title}</span>
								{component === id ? <ChevronRight size={13} /> : null}
							</button>
						))}
					</nav>
					<div className="library-note">
						<Layers3 size={18} />
						<strong>
							Two generations.
							<br />
							One component API.
						</strong>
						<p>
							Switch between Sequoia and Tahoe without changing your markup.
						</p>
					</div>
					<div className="library-footer">
						<span className="small-logo">a.</span>Made with attention.
					</div>
				</aside>
				<main>
					<div className="page-heading">
						<div className="breadcrumb">
							Components
							<ChevronRight size={12} />
							<span>macOS</span>
						</div>
						<div className="heading-row">
							<h1>{selection.title}</h1>
							<span className="component-tag">
								{component === "desktop" ? "COMPOSITION" : "COMPONENT"}
							</span>
						</div>
						<p>{selection.description}</p>
					</div>
					<div className="workbench">
						<div className="workbench-toolbar">
							<Segmented
								label="Preview mode"
								onChange={setMode}
								options={[
									{
										label: (
											<>
												<MousePointer2 size={13} />
												Preview
											</>
										),
										value: "preview",
									},
									{
										label: (
											<>
												<Columns2 size={13} />
												Compare
											</>
										),
										value: "compare",
									},
									{
										label: (
											<>
												<Code2 size={13} />
												Code
											</>
										),
										value: "code",
									},
								]}
								value={mode}
							/>
							<div className="workbench-actions">
								<button
									aria-label="Show at actual size"
									aria-pressed={nativeScale}
									className="actual-size-button"
									onClick={() => {
										setNativeScale((value) => !value);
										setMode("preview");
									}}
									title="Toggle actual size / fit to preview"
									type="button"
								>
									1:1
								</button>
								<span>
									{settings.preset === "tahoe" ? "Tahoe 26" : "Sequoia 15"}
								</span>
								<button
									aria-label="Reset preview interactions"
									onClick={() => setRevision((value) => value + 1)}
									title="Reset preview interactions"
									type="button"
								>
									<RotateCcw size={15} />
								</button>
							</div>
						</div>
						{mode === "code" ? (
							<div className="code-view">
								<div>
									<Terminal size={14} />
									<span>example.tsx</span>
									<button onClick={copy} type="button">
										{copied ? <Check size={13} /> : <Copy size={13} />}
										{copied ? "Copied" : "Copy"}
									</button>
								</div>
								<pre>
									<code>{source}</code>
								</pre>
							</div>
						) : (
							<div
								className={`preview-area ${mode === "compare" ? "comparison" : ""}`}
							>
								{mode === "compare" ? (
									(["sequoia", "tahoe"] as const).map((preset) => (
										<DesktopScene
											caption={preset === "sequoia" ? "Sequoia 15" : "Tahoe 26"}
											component={component}
											key={`${preset}-${component}-${revision}`}
											settings={{ ...settings, preset }}
										/>
									))
								) : (
									<div
										className="reference-stage"
										data-native-scale={nativeScale}
									>
										<DesktopScene
											component={component}
											key={`${component}-${revision}`}
											nativeScale={nativeScale}
											settings={settings}
										/>
										{reference ? (
											<img
												alt="Native reference overlay"
												className="reference-image"
												height={640}
												src={reference}
												style={{ opacity: referenceOpacity / 100 }}
												width={1000}
											/>
										) : null}
									</div>
								)}
							</div>
						)}
						<div className="workbench-footer">
							<span>
								<i />
								Live React preview
							</span>
							<span>{previewSizeLabel(mode, nativeScale)}</span>
						</div>
					</div>
					<div className="below-preview">
						<div>
							<h2>{selection.subtitle}</h2>
							<p>
								{component === "desktop"
									? "Open a menu. Switch a tab. Hover the Dock. Every detail is interactive."
									: "Change the properties on the right. The component and its code stay in sync."}
							</p>
						</div>
						<ReferenceLinks component={component} />
						<button className="copy-button" onClick={copy} type="button">
							{copied ? <Check size={14} /> : <Copy size={14} />}
							{copied ? "Copied example" : "Copy example"}
						</button>
					</div>
					{copyError ? (
						<p role="status">
							Clipboard unavailable. Select and copy the example in the Code
							tab.
						</p>
					) : null}
					<div className="fidelity-note">
						<span className="fidelity-dot" />
						<p>
							<strong>Fidelity workbench</strong> · These are working browser
							reproductions. Native screenshot calibration is still pending.
						</p>
						<span>v0.1</span>
					</div>
				</main>
				<Inspector
					component={component}
					onReferenceLoaded={() => setMode("preview")}
					onReset={() => {
						setSettings(DEFAULTS);
						setRevision((value) => value + 1);
					}}
					reference={reference}
					referenceOpacity={referenceOpacity}
					setReference={setReference}
					setReferenceOpacity={setReferenceOpacity}
					setSettings={setSettings}
					settings={settings}
				/>
			</div>
		</div>
	);
}

function previewSizeLabel(mode: string, nativeScale: boolean) {
	if (mode === "compare") {
		return "Same props · separate presets";
	}
	return `1000 × 640 · ${nativeScale ? "actual size" : "scaled to fit"}`;
}

function Inspector({
	settings,
	setSettings,
	component,
	reference,
	setReference,
	referenceOpacity,
	setReferenceOpacity,
	onReset,
	onReferenceLoaded,
}: {
	settings: SceneSettings;
	setSettings: React.Dispatch<React.SetStateAction<SceneSettings>>;
	component: ComponentName;
	reference: string | null;
	setReference: (value: string | null) => void;
	referenceOpacity: number;
	setReferenceOpacity: (value: number) => void;
	onReset: () => void;
	onReferenceLoaded: () => void;
}) {
	const update = <K extends keyof SceneSettings>(
		key: K,
		value: SceneSettings[K]
	) => setSettings((current) => ({ ...current, [key]: value }));
	return (
		<aside aria-label="Component properties" className="inspector">
			<div className="inspector-heading">
				<Settings2 size={15} />
				<h2>Properties</h2>
				<button
					aria-label="Reset all properties"
					onClick={() => {
						onReset();
					}}
					title="Reset all properties"
					type="button"
				>
					<RotateCcw size={13} />
				</button>
			</div>
			<section>
				<h3>Environment</h3>
				<label className="field-label" htmlFor="preset">
					macOS version
				</label>
				<select
					id="preset"
					onChange={(event) => {
						const preset = event.target.value;
						if (preset === "sequoia" || preset === "tahoe") {
							update("preset", preset);
						}
					}}
					value={settings.preset}
				>
					<option value="sequoia">Sequoia 15</option>
					<option value="tahoe">Tahoe 26</option>
				</select>
				<span className="field-label">Appearance</span>
				<Segmented<MacOSAppearance>
					label="Appearance"
					onChange={(value) => update("appearance", value)}
					options={[
						{
							label: (
								<>
									<Sun size={13} />
									Light
								</>
							),
							value: "light",
						},
						{
							label: (
								<>
									<Moon size={13} />
									Dark
								</>
							),
							value: "dark",
						},
					]}
					value={settings.appearance}
				/>
				<span className="field-label">Wallpaper</span>
				<fieldset aria-label="Wallpaper" className="wallpaper-choices">
					{(["clouds", "dusk", "graphite"] as Wallpaper[]).map((wallpaper) => (
						<button
							aria-label={`${wallpaper} wallpaper`}
							aria-pressed={settings.wallpaper === wallpaper}
							className={`wallpaper-${wallpaper}`}
							key={wallpaper}
							onClick={() => update("wallpaper", wallpaper)}
							type="button"
						>
							{settings.wallpaper === wallpaper ? <Check size={13} /> : null}
						</button>
					))}
				</fieldset>
				<span className="field-label">Accent color</span>
				<fieldset aria-label="Accent color" className="accent-choices">
					{[
						["Blue", "#007aff"],
						["Purple", "#af52de"],
						["Pink", "#ff2d55"],
						["Orange", "#ff9500"],
						["Green", "#28b34b"],
						["Graphite", "#73737a"],
					].map(([name, color]) => (
						<button
							aria-label={`${name} accent`}
							aria-pressed={settings.accentColor === color}
							key={color}
							onClick={() => update("accentColor", color)}
							style={{ backgroundColor: color }}
							type="button"
						>
							{settings.accentColor === color ? <Check size={11} /> : null}
						</button>
					))}
				</fieldset>
			</section>
			{component === "desktop" || component === "dock" ? (
				<section>
					<h3>Dock</h3>
					<Toggle
						checked={settings.dockAutoHide}
						label="Auto-hide"
						onChange={(value) => update("dockAutoHide", value)}
					/>
					<Range
						label="Icon size"
						max={64}
						min={32}
						onChange={(value) => update("dockSize", value)}
						unit=" px"
						value={settings.dockSize}
					/>
					<Range
						label="Magnification"
						max={2.5}
						min={1}
						onChange={(value) => update("magnification", value)}
						step={0.05}
						unit="×"
						value={settings.magnification}
					/>
					<span className="field-label">Position</span>
					<Segmented<SceneSettings["dockPosition"]>
						label="Dock position"
						onChange={(value) => update("dockPosition", value)}
						options={[
							{ label: "Left", value: "left" },
							{ label: "Bottom", value: "bottom" },
							{ label: "Right", value: "right" },
						]}
						value={settings.dockPosition}
					/>
				</section>
			) : null}
			<section>
				<h3>State & accessibility</h3>
				{component !== "dock" && component !== "menu-bar" ? (
					<Toggle
						checked={settings.active}
						label="Active window"
						onChange={(value) => update("active", value)}
					/>
				) : null}
				<Toggle
					checked={settings.reduceTransparency}
					label="Reduce transparency"
					onChange={(value) => update("reduceTransparency", value)}
				/>
				<Toggle
					checked={settings.reduceMotion}
					label="Reduce motion"
					onChange={(value) => update("reduceMotion", value)}
				/>
			</section>
			<section className="reference-controls">
				<h3>Native reference</h3>
				<p>
					Overlay a matching 1000 × 640 capture to compare edges and materials.
				</p>
				<label className="reference-upload">
					<ArrowDownToLine size={13} />
					{reference ? "Replace reference" : "Load screenshot"}
					<input
						accept="image/png,image/jpeg,image/webp"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) {
								setReference(URL.createObjectURL(file));
								onReferenceLoaded();
							}
						}}
						type="file"
					/>
				</label>
				{reference ? (
					<>
						<Range
							label="Overlay opacity"
							max={100}
							min={0}
							onChange={setReferenceOpacity}
							unit="%"
							value={referenceOpacity}
						/>
						<button
							className="remove-reference"
							onClick={() => setReference(null)}
							type="button"
						>
							<X size={12} />
							Remove reference
						</button>
					</>
				) : null}
			</section>
		</aside>
	);
}

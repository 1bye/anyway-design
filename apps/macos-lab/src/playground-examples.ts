import { type AlertSampleName, alertSample } from "./alert-samples";
import { DOCK_ITEMS } from "./dock-items";
import type {
	PlaygroundEntry,
	PlaygroundEnvironment,
	PlaygroundValues,
} from "./playground-catalog";

interface ExampleFragment {
	body: string;
	imports?: string[];
	state?: string;
}
type Example = (values: PlaygroundValues) => ExampleFragment;
const json = (value: unknown) => JSON.stringify(value);
function attrs(values: PlaygroundValues, names: string[]): string {
	return names.map((name) => ` ${name}={${json(values[name])}}`).join("");
}
const editable = (values: PlaygroundValues) =>
	attrs(values, ["disabled", "readOnly", "size"]);
const items =
	'[{ id: "brief", name: "Project brief.pdf", kind: "pdf" }, { id: "clouds", name: "Clouds.webp", kind: "image", thumbnail: "/assets/clouds.webp" }]';
const menu =
	'[{ id: "open", label: "Open", shortcut: "⌘O" }, { id: "copy", label: "Copy", shortcut: "⌘C" }, { id: "paste", label: "Paste", disabled: true }]';
const periods =
	'[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month", disabled: true }]';
const buttonImport =
	'import { MacButton } from "@anyway-design/macos/controls";';
const fileImport = 'import type { MacFile } from "@anyway-design/macos/files";';
const EXAMPLES: Record<string, Example> = {
	button: (v) => ({
		body:
			"<MacButton" +
			attrs(v, ["disabled", "size", "variant"]) +
			' onClick={() => console.info("Clicked")}>{' +
			json(v.label) +
			"}</MacButton>",
	}),
	calendar: (v) => ({
		body:
			'<MacCalendar label="Departure" name="departure" defaultValue="2026-10-20"' +
			attrs(v, ["disabled", "readOnly"]) +
			(v.bounded ? ' min="2026-10-10" max="2026-11-15"' : "") +
			" />",
	}),
	checkbox: (v) => ({
		body:
			"<MacCheckbox" +
			attrs(v, ["label", "disabled", "readOnly", "active", "indeterminate"]) +
			' name="notifications" defaultChecked={' +
			json(v.checked) +
			"} />",
	}),
	"combo-box": (v) => ({
		body:
			'<MacComboBox label="Report frequency" name="frequency"' +
			editable(v) +
			attrs(v, ["active", "mode"]) +
			" defaultValue={" +
			json(v.value) +
			'} items={["Day", "Week", "Month", "Quarter", "Year"]} />',
	}),
	"context-menu": () => ({
		body:
			"<MacContextMenu items={" +
			menu +
			'} onAction={(id) => console.info(id)} trigger={<button type="button">Right-click this file</button>} />',
	}),
	"date-picker": (v) => ({
		body:
			'<MacDatePicker label="Appointment" name="appointment"' +
			editable(v) +
			attrs(v, ["mode", "hourCycle", "calendar"]) +
			" defaultValue={" +
			json(
				{ date: "2026-10-20", datetime: "2026-10-20T14:35", time: "14:35" }[
					String(v.mode)
				]
			) +
			"} />",
	}),
	"file-icons": (v) => ({
		body: `<div style={{ display: "flex", gap: 24 }}>
  <MacFileIcon name="pdf" style={{ width: ${v.iconSize}, height: ${v.iconSize} }} />
  <MacFileIcon name="folder" style={{ width: ${v.iconSize}, height: ${v.iconSize} }} />
  <MacFolderPreviewIcon style={{ width: ${v.iconSize}, height: ${v.iconSize} }} />
</div>`,
	}),
	"file-thumbnail": (v) => ({
		body:
			'<MacFileThumbnail src="/assets/clouds.webp" alt="My image"' +
			attrs(v, ["presentation", "fit"]) +
			" />",
	}),
	menu: (v) => ({
		body:
			"<MacMenuButton" +
			attrs(v, ["defaultOpen"]) +
			" items={" +
			menu +
			"} onAction={(id) => console.info(id)} trigger={<MacButton>{" +
			json(v.label) +
			"}</MacButton>} />",
		imports: [buttonImport],
	}),
	"menu-bar": () => ({
		body:
			'<MenuBar menus={[{ id: "apple", accessibleLabel: "Apple", label: <AppleMark />, items: [{ id: "about", label: "About This Mac" }] }, { id: "file", label: "File", items: ' +
			menu +
			" }]} onAction={(id) => console.info(id)} status={<span>9:41</span>} />",
	}),
	"pop-up-button": (v) => ({
		body:
			'<MacPopUpButton label="Report frequency" name="frequency"' +
			editable(v) +
			attrs(v, ["active"]) +
			" defaultValue={" +
			json(v.value) +
			"} items={" +
			periods +
			"} />",
	}),
	popover: (v) => ({
		body:
			"<MacPopover title={" +
			json(v.title) +
			'} description="Choose how this folder is displayed." defaultOpen={' +
			json(v.defaultOpen) +
			"} positionerProps={{ side: " +
			json(v.side) +
			" }} trigger={<MacButton>View options</MacButton>}><p>Your popover content</p><MacPopoverClose>Done</MacPopoverClose></MacPopover>",
		imports: [buttonImport],
	}),
	progress: (v) => ({
		body:
			'<MacProgressBar label="Export progress"' +
			attrs(v, ["active", "size", "running", "hidesWhenStopped"]) +
			" value={" +
			(v.indeterminate ? "null" : json(v.value)) +
			"} />",
	}),
	radio: (v) => ({
		body:
			'<MacRadioGroup label="Report frequency" name="frequency" defaultValue={' +
			json(v.value) +
			"}" +
			attrs(v, ["disabled", "readOnly"]) +
			'><MacRadio label="Day" value="day"' +
			attrs(v, ["active"]) +
			' /><MacRadio label="Week" value="week"' +
			attrs(v, ["active"]) +
			' /><MacRadio label="Month" value="month" disabled /></MacRadioGroup>',
	}),
	"search-field": (v) => ({
		body:
			'<MacSearchField aria-label="Search" name="query"' +
			editable(v) +
			attrs(v, ["placeholder"]) +
			" defaultValue={" +
			json(v.value) +
			"} onSearch={(query) => console.info(query)} />",
	}),
	"segmented-control": (v) => ({
		body:
			'<MacSegmentedControl label="View" name="view"' +
			editable(v) +
			" items={" +
			(v.icons
				? '[{ value: "icons", label: "Icons", icon: <WindowSymbol name="icon-view" /> }, { value: "list", label: "List", icon: <WindowSymbol name="list-view" /> }, { value: "columns", label: "Columns", icon: <WindowSymbol name="column-view" /> }]'
				: periods) +
			'} defaultValue="' +
			(v.icons ? "list" : "week") +
			'" />',
		imports: v.icons
			? ['import { WindowSymbol } from "@anyway-design/macos/window-symbol";']
			: [],
	}),
	sidebar: () => ({
		body: '<WindowSidebar groups={[{ id: "favorites", label: "Favorites", items: [{ id: "documents", label: "Documents" }, { id: "downloads", label: "Downloads" }] }]} selected={selected} onSelect={setSelected} />',
		state: 'const [selected, setSelected] = useState("documents");',
	}),
	slider: (v) => ({
		body:
			'<MacSlider label="Volume" name="volume" min={0} max={100} defaultValue={' +
			json(v.value) +
			"}" +
			attrs(v, ["step", "tickMarks", "disabled", "active"]) +
			" />",
	}),
	spinner: (v) => ({
		body:
			'<MacSpinner label="Export progress"' +
			attrs(v, ["active", "size", "running", "hidesWhenStopped"]) +
			" />",
	}),
	stepper: (v) => ({
		body:
			'<MacStepper label="Quantity" name="quantity" min={0} max={100} defaultValue={' +
			json(v.value) +
			"}" +
			attrs(v, ["step", "disabled", "readOnly", "active"]) +
			" />",
	}),
	switch: (v) => ({
		body:
			"<MacSwitch" +
			editable(v) +
			attrs(v, ["label"]) +
			' name="notifications" defaultChecked={' +
			json(v.checked) +
			"} />",
	}),
	symbols: (v) => ({
		body:
			"<WindowSymbol name={" +
			json(v.name) +
			"} size={" +
			json(v.iconSize) +
			"} />",
	}),
	tabs: (v) => ({
		body: `<MacTabs label="Document tabs" value={tab} onValueChange={setTab}${attrs(v, ["variant"])}
  tabs={tabs.map((item) => ({ ...item, content: <p>{item.label}</p> }))}
  onAdd={() => { const id = crypto.randomUUID(); setTabs([...tabs, { id, label: "Untitled" }]); setTab(id); }}
  ${v.closable ? 'onClose={(id) => { setTabs(tabs.filter((item) => item.id !== id)); if (tab === id) { setTab(tabs.find((item) => item.id !== id)?.id ?? ""); } }}' : ""}
  ${v.reorderable ? "onReorder={(ids) => setTabs(ids.flatMap((id) => tabs.filter((item) => item.id === id)))}" : ""}
/>`,
		state:
			'const [tabs, setTabs] = useState([{ id: "documents", label: "Documents" }, { id: "home", label: "Home" }]);\nconst [tab, setTab] = useState("documents");',
	}),
	"text-field": (v) => ({
		body:
			'<MacTextField aria-label="Project name" name="project"' +
			editable(v) +
			attrs(v, ["placeholder", "type"]) +
			" defaultValue={" +
			json(v.value) +
			"} />",
	}),
	toolbar: (v) => ({
		body:
			'<WindowToolbarGroup label="File actions"><WindowToolbarButton label="Share"' +
			attrs(v, ["disabled"]) +
			' onClick={() => console.info("Share")}><WindowSymbol name="share" /></WindowToolbarButton><WindowToolbarButton label="Tags"' +
			attrs(v, ["disabled"]) +
			'><WindowSymbol name="tag" /></WindowToolbarButton></WindowToolbarGroup>',
		imports: [
			'import { WindowSymbol } from "@anyway-design/macos/window-symbol";',
		],
	}),
	"traffic-lights": (v) => ({
		body:
			"<TrafficLights" +
			attrs(v, ["active"]) +
			' onClose={() => console.info("Close")} onMinimize={() => console.info("Minimize")} onZoom={() => console.info("Zoom")} />',
	}),
	window: (v) => ({
		body:
			"<MacWindow" +
			attrs(v, ["title", "active", "sidebarWidth"]) +
			(v.sidebar
				? ' sidebar={<WindowSidebar groups={[{ id: "favorites", label: "Favorites", items: [{ id: "documents", label: "Documents" }] }]} selected="documents" onSelect={() => {}} />}'
				: "") +
			(v.toolbar
				? ' toolbar={<WindowToolbarGroup label="Actions"><WindowToolbarButton label="Share"><WindowSymbol name="share" /></WindowToolbarButton></WindowToolbarGroup>}'
				: "") +
			"><div style={{ padding: 24 }}>Your app content</div></MacWindow>",
		imports: [
			'import { WindowSidebar } from "@anyway-design/macos/window-sidebar";',
			'import { WindowToolbarGroup, WindowToolbarButton } from "@anyway-design/macos/window-toolbar";',
			'import { WindowSymbol } from "@anyway-design/macos/window-symbol";',
		],
	}),
};

function fileExample(
	entry: PlaygroundEntry,
	values: PlaygroundValues
): ExampleFragment {
	const state =
		'const [selected, setSelected] = useState<string[]>(["brief"]);\nconst items: MacFile[] = ' +
		items +
		";";
	const props =
		" items={items} selectedIds={selected} onSelectionChange={setSelected}" +
		attrs(values, ["active"]);
	if (entry.id === "file-grid" || entry.id === "file-rename") {
		return {
			body:
				"<MacFileGrid" +
				props +
				` style={{ "--mac-file-icon-size": "${values.iconSize ?? 64}px" } as CSSProperties}` +
				attrs(values, ["showExtensions"]) +
				(entry.id === "file-rename"
					? " renamingId={renaming} onRenamingChange={setRenaming} onRename={(id, name) => setItems(items.map((item) => item.id === id ? { ...item, name } : item))}"
					: "") +
				" />",
			imports: [fileImport, 'import type { CSSProperties } from "react";'],
			state:
				(entry.id === "file-rename"
					? state.replace(
							`const items: MacFile[] = ${items};`,
							`const [items, setItems] = useState<MacFile[]>(${items});`
						)
					: state) +
				(entry.id === "file-rename"
					? "\nconst [renaming, setRenaming] = useState<string | null>(null);"
					: ""),
		};
	}
	if (entry.id === "folder-list") {
		return {
			body:
				"<MacFileList" +
				props +
				attrs(values, ["showExtensions"]) +
				' defaultExpandedIds={["projects"]} />',
			imports: [
				'import type { MacFileListItem } from "@anyway-design/macos/file-list";',
			],
			state:
				'const [selected, setSelected] = useState<string[]>([]);\nconst items: MacFileListItem[] = [{ id: "projects", name: "Projects", kind: "folder", children: [{ id: "notes", name: "Notes.txt", kind: "text" }] }];',
		};
	}
	if (entry.id === "file-columns") {
		return {
			body:
				"<MacFileColumns items={items} value={value} onValueChange={setValue}" +
				attrs(values, [
					"active",
					"showExtensions",
					"showPreview",
					"resizable",
				]) +
				" />",
			imports: [
				'import type { MacFileColumnItem } from "@anyway-design/macos/file-columns";',
			],
			state:
				'const [value, setValue] = useState<string | undefined>("projects");\nconst items: MacFileColumnItem[] = [{ id: "projects", name: "Projects", kind: "folder", children: [{ id: "notes", name: "Notes.txt", kind: "text" }] }];',
		};
	}
	if (entry.id === "file-gallery") {
		return {
			body: `<MacFileGallery${props}${attrs(values, ["showInfo"])} />`,
			imports: [fileImport],
			state,
		};
	}
	return {
		body:
			"<MacFileList" +
			props +
			attrs(values, ["showExtensions", "resizable"]) +
			" />",
		imports: [fileImport],
		state,
	};
}
function wrapPanel(
	modalName: string,
	inlineName: string,
	props: string,
	modal: boolean,
	inlineProps = ""
): ExampleFragment {
	if (!modal) {
		return { body: `<${inlineName}${inlineProps}${props} />` };
	}
	return {
		body: `<>
  <MacButton onClick={() => setOpen(true)}>Open preview</MacButton>
  <${modalName} open={open} onOpenChange={setOpen}${props} />
</>`,
		imports: [buttonImport],
		state: "const [open, setOpen] = useState(false);",
	};
}
function panelExample(
	entry: PlaygroundEntry,
	v: PlaygroundValues
): ExampleFragment {
	const modal = Boolean(v.modal);
	if (entry.id === "alert") {
		const {
			height: _height,
			label: _label,
			suppressionLabel,
			...props
		} = alertSample(v.sample as AlertSampleName);
		const suppression = suppressionLabel
			? ` suppression={${json({ label: suppressionLabel })}}`
			: "";
		return wrapPanel(
			"MacAlert",
			"MacAlertPanel",
			` {...${json(props)}}${suppression} onAction={(id) => console.info(id)}`,
			modal
		);
	}
	if (entry.id === "new-folder") {
		return wrapPanel(
			"MacNewFolderDialog",
			"MacNewFolderPanel",
			' parentName="Documents" items={[]} onCreate={(name) => console.info(name)}',
			modal,
			" autoFocus={false} onCancel={() => {}}"
		);
	}
	if (entry.id === "file-dialog") {
		return wrapPanel(
			"MacFileDialog",
			"MacFileDialogPanel",
			`${attrs(v, ["mode", "multiple"])} defaultExpanded={${json(v.expanded)}} defaultView={${json(v.view)}} directories={[{ id: "root", name: "Documents", items: [{ id: "brief", name: "Project brief.txt", kind: "text" }] }]} initialDirectoryId="root" initialName="Untitled.txt" onConfirm={(result) => console.info(result)}`,
			modal,
			" onCancel={() => {}}"
		);
	}
	if (entry.id === "get-info") {
		return wrapPanel(
			"MacGetInfo",
			"MacGetInfoPanel",
			`${attrs(v, ["active"])} file={{ id: "brief", name: "Project brief.pdf", kind: "pdf", sizeLabel: "240 KB" }}`,
			modal,
			" onClose={() => {}}"
		);
	}
	return wrapPanel(
		"MacQuickLook",
		"MacQuickLookPanel",
		modal
			? ' value="clouds" onValueChange={(id) => console.info(id)} items={[{ id: "clouds", name: "Clouds.webp", preview: { src: "/assets/clouds.webp" } }]}'
			: ' item={{ id: "clouds", name: "Clouds.webp", preview: { src: "/assets/clouds.webp" } }} onClose={() => {}} style={{ width: 680, height: 400 }}',
		modal
	);
}
const NAMED_IMPORT = /^(import(?: type)? \{ )(.+)( \} from .+;)$/;
const CODE_WORDS = /[A-Za-z_$][\w$]*/g;
function usedImport(statement: string, code: string): string[] {
	const used = new Set(["MacOSEnvironment", ...(code.match(CODE_WORDS) ?? [])]);
	const match = statement.match(NAMED_IMPORT);
	if (!match) {
		return [statement];
	}
	const names = match[2]
		.split(",")
		.map((name) => name.trim())
		.filter((name) => used.has(name));
	return names.length ? [`${match[1]}${names.join(", ")}${match[3]}`] : [];
}
export function playgroundExample(
	entry: PlaygroundEntry,
	values: PlaygroundValues,
	environment: PlaygroundEnvironment
): string {
	let fragment = EXAMPLES[entry.id]?.(values);
	if (
		[
			"file-grid",
			"file-list",
			"folder-list",
			"file-columns",
			"file-gallery",
			"file-rename",
		].includes(entry.id)
	) {
		fragment = fileExample(entry, values);
	}
	if (
		["alert", "new-folder", "file-dialog", "quick-look", "get-info"].includes(
			entry.id
		)
	) {
		fragment = panelExample(entry, values);
	}
	if (entry.id === "dock") {
		fragment = {
			body:
				`<Dock items={${json(Array.from({ length: Number(values.count) }, (_, index) => ({ ...DOCK_ITEMS[index % DOCK_ITEMS.length], id: `app-${index}` })))}}` +
				attrs(values, [
					"size",
					"magnification",
					"position",
					"adaptive",
					"autoHide",
					"glass",
				]) +
				" onActivate={(id) => console.info(id)} />",
		};
	}
	if (entry.id === "desktop") {
		fragment = {
			body: `<MenuBar menus={[{ id: "file", label: "File", items: ${menu} }]} />
<MacWindow title="Documents" style={{ position: "absolute", left: 160, top: 100 }}><MacFileGrid items={${items}} selectedIds={selected} onSelectionChange={setSelected} /></MacWindow>
<Dock items={${json(DOCK_ITEMS)}} />`,
			imports: [
				'import { MacWindow } from "@anyway-design/macos/window";',
				'import { MacFileGrid } from "@anyway-design/macos/files";',
				'import { MenuBar } from "@anyway-design/macos/menu-bar";',
				'import { Dock } from "@anyway-design/macos/dock";',
			],
			state: "const [selected, setSelected] = useState<string[]>([]);",
		};
	}
	if (!fragment) {
		throw new Error(`Missing playground example: ${entry.id}`);
	}
	const imports = new Set([
		'import { MacOSEnvironment } from "@anyway-design/macos/environment";',
		...(entry.module === "environment"
			? []
			: [
					"import { " +
						entry.imports +
						' } from "@anyway-design/macos/' +
						entry.module +
						'";',
				]),
		...(fragment.imports ?? []),
	]);
	if (fragment.state) {
		imports.add('import { useState } from "react";');
	}
	imports.add('import "@anyway-design/macos/styles.css";');
	return (
		[...imports]
			.flatMap((statement) =>
				usedImport(statement, `${fragment.state ?? ""}\n${fragment.body}`)
			)
			.join("\n") +
		"\n\nexport function Example() {\n  " +
		(fragment.state ? `${fragment.state.split("\n").join("\n  ")}\n  ` : "") +
		"return (\n    <MacOSEnvironment preset={" +
		json(environment.preset) +
		"} appearance={" +
		json(environment.appearance) +
		"} accentColor={" +
		json(environment.accentColor) +
		"} reduceMotion={" +
		json(environment.reduceMotion) +
		"} reduceTransparency={" +
		json(environment.reduceTransparency) +
		'} style={{ position: "relative", width: ' +
		entry.width +
		", minHeight: " +
		entry.height +
		" }}>\n      " +
		fragment.body +
		"\n    </MacOSEnvironment>\n  );\n}\n"
	);
}

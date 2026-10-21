import { NATIVE_SYMBOLS } from "@anyway-design/macos/native-symbols";

export type PlaygroundValues = Partial<
	Record<string, string | number | boolean>
>;
export interface PlaygroundProperty {
	initial: string | number | boolean;
	key: string;
	label: string;
	max?: number;
	min?: number;
	options?: readonly string[];
	step?: number;
}
export interface PlaygroundEntry {
	description: string;
	group: string;
	height: number;
	id: string;
	imports: string;
	module: string;
	properties: readonly PlaygroundProperty[];
	reference: string;
	title: string;
	width: number;
}
export interface PlaygroundEnvironment {
	accentColor: string;
	appearance: "light" | "dark";
	preset: "tahoe" | "sequoia";
	reduceMotion: boolean;
	reduceTransparency: boolean;
}
export interface PlaygroundDemoProps {
	entry: PlaygroundEntry;
	environment: PlaygroundEnvironment;
	onEvent: (message: string) => void;
	onPropertyChange: (key: string, value: string | number | boolean) => void;
	values: PlaygroundValues;
}
export const PLAYGROUND_ENVIRONMENT: PlaygroundEnvironment = {
	accentColor: "#007aff",
	appearance: "light",
	preset: "tahoe",
	reduceMotion: false,
	reduceTransparency: false,
};
const size: PlaygroundProperty = {
	initial: "regular",
	key: "size",
	label: "Size",
	options: ["regular", "small"],
};
const disabled: PlaygroundProperty = {
	initial: false,
	key: "disabled",
	label: "Disabled",
};
const readOnly: PlaygroundProperty = {
	initial: false,
	key: "readOnly",
	label: "Read only",
};
const active: PlaygroundProperty = {
	initial: true,
	key: "active",
	label: "Active",
};
const checked: PlaygroundProperty = {
	initial: true,
	key: "checked",
	label: "Initially checked",
};
const label: PlaygroundProperty = {
	initial: "Allow notifications",
	key: "label",
	label: "Label",
};
const extensions: PlaygroundProperty = {
	initial: true,
	key: "showExtensions",
	label: "Show extensions",
};
const editable = [disabled, readOnly];
const fileProperties = [active, extensions];
function defineEntry(
	id: string,
	title: string,
	group: string,
	module: string,
	imports: string,
	reference: string,
	description: string,
	properties: readonly PlaygroundProperty[] = [],
	width = 640,
	height = 400
): PlaygroundEntry {
	return {
		description,
		group,
		height,
		id,
		imports,
		module,
		properties,
		reference,
		title,
		width,
	};
}
export const PLAYGROUND_ENTRIES: readonly PlaygroundEntry[] = [
	defineEntry(
		"desktop",
		"Desktop",
		"Window & navigation",
		"environment",
		"MacOSEnvironment",
		"window-reference",
		"A working desktop composition. Open menus, switch views, and bring an app to the front.",
		[],
		1000,
		640
	),
	defineEntry(
		"dock",
		"Dock",
		"Window & navigation",
		"dock",
		"Dock",
		"dock-reference",
		"Refractive glass, smooth magnification, adaptive sizing, and auto-hide.",
		[
			{ initial: 52, key: "size", label: "Icon size", max: 80, min: 24 },
			{
				initial: 1.65,
				key: "magnification",
				label: "Magnification",
				max: 2.5,
				min: 1,
				step: 0.05,
			},
			{
				initial: "bottom",
				key: "position",
				label: "Position",
				options: ["bottom", "left", "right"],
			},
			{ initial: true, key: "adaptive", label: "Adaptive sizing" },
			{ initial: false, key: "autoHide", label: "Auto-hide" },
			{
				initial: "refractive",
				key: "glass",
				label: "Glass",
				options: ["refractive", "blur"],
			},
			{ initial: 6, key: "count", label: "Items", max: 24, min: 3 },
		],
		800,
		480
	),
	defineEntry(
		"window",
		"Window",
		"Window & navigation",
		"window",
		"MacWindow",
		"window-reference",
		"A Finder browser with search, per-tab Back/Forward history, a clickable path bar, and sorting and grouping across all four file views.",
		[
			active,
			{ initial: "Documents", key: "title", label: "Title" },
			{ initial: true, key: "sidebar", label: "Show sidebar" },
			{ initial: true, key: "toolbar", label: "Show toolbar" },
			{
				initial: 165,
				key: "sidebarWidth",
				label: "Sidebar width",
				max: 240,
				min: 130,
			},
		],
		800,
		520
	),

	defineEntry(
		"finder",
		"Finder",
		"Files & Finder",
		"finder",
		"MacFinder",
		"finder-actions-reference",
		"Reusable Finder with four views, Quick Look, Get Info, drag and drop, clipboard actions, Duplicate, Trash, and Undo/Redo.",
		[
			active,
			{ initial: "Documents", key: "title", label: "Folder name" },
			{
				initial: "icons",
				key: "view",
				label: "Initial view",
				options: ["icons", "list", "columns", "gallery"],
			},
			{
				initial: "all",
				key: "views",
				label: "Available views",
				options: ["all", "icons-and-list", "gallery-only"],
			},
			{ initial: true, key: "sidebar", label: "Show sidebar" },
			{ initial: true, key: "toolbar", label: "Show toolbar" },
			{ initial: true, key: "tabs", label: "Show tabs" },
			{ initial: false, key: "readOnly", label: "Read only" },
			{ initial: true, key: "customActions", label: "Custom file actions" },
		],
		800,
		520
	),
	defineEntry(
		"traffic-lights",
		"Traffic lights",
		"Window & navigation",
		"window",
		"TrafficLights",
		"window-reference",
		"Close, minimize, and zoom controls with active, inactive, and hover states.",
		[active]
	),
	defineEntry(
		"toolbar",
		"Toolbar",
		"Window & navigation",
		"window-toolbar",
		"WindowToolbarGroup, WindowToolbarButton",
		"window-reference",
		"Finder’s navigation, view, grouping, file actions, and search in their window context.",
		[disabled],
		840,
		340
	),
	defineEntry(
		"sidebar",
		"Sidebar",
		"Window & navigation",
		"window-sidebar",
		"WindowSidebar",
		"window-reference",
		"The floating Finder sidebar, centered in a cropped window corner with live selection.",
		[],
		640,
		540
	),
	defineEntry(
		"tabs",
		"Tabs",
		"Window & navigation",
		"tabs",
		"MacTabs",
		"window-reference",
		"Document tabs with closing, creation, reordering, and overflow.",
		[
			{
				initial: "document",
				key: "variant",
				label: "Variant",
				options: ["document", "segmented"],
			},
			{ initial: true, key: "closable", label: "Allow closing" },
			{ initial: true, key: "reorderable", label: "Allow reordering" },
		],
		760,
		380
	),
	defineEntry(
		"menu-bar",
		"Menu bar",
		"Menus & overlays",
		"menu-bar",
		"MenuBar, AppleMark",
		"menu-reference",
		"Application menus, nested commands, shortcuts, and keyboard navigation.",
		[],
		800,
		420
	),
	defineEntry(
		"menu",
		"Pop-up menu",
		"Menus & overlays",
		"menu",
		"MacMenuButton",
		"menu-reference",
		"Open a command menu with submenus, checkmarks, and disabled items.",
		[
			{ initial: "Actions", key: "label", label: "Trigger label" },
			{ initial: false, key: "defaultOpen", label: "Initially open" },
		]
	),
	defineEntry(
		"context-menu",
		"Context menu",
		"Menus & overlays",
		"menu",
		"MacContextMenu",
		"menu-reference",
		"Right-click the target, or use Shift+F10, to open a context menu."
	),
	defineEntry(
		"popover",
		"Popover",
		"Menus & overlays",
		"popover",
		"MacPopover, MacPopoverClose",
		"popover-reference",
		"An anchored popover with focus restoration, outside dismissal, and configurable placement.",
		[
			{ initial: "View Options", key: "title", label: "Title" },
			{
				initial: "bottom",
				key: "side",
				label: "Side",
				options: ["bottom", "top", "left", "right"],
			},
			{ initial: false, key: "defaultOpen", label: "Initially open" },
		],
		720,
		480
	),
	defineEntry(
		"alert",
		"Alerts & confirmations",
		"Menus & overlays",
		"alert",
		"MacAlert, MacAlertPanel",
		"alert-reference",
		"Information, warnings, destructive confirmations, and document sheets.",
		[
			{
				initial: "save",
				key: "sample",
				label: "Scenario",
				options: ["information", "save", "warning", "critical", "sheet"],
			},
			{ initial: false, key: "modal", label: "Use modal dialog" },
		],
		760,
		520
	),
	defineEntry(
		"button",
		"Button",
		"Form controls",
		"controls",
		"MacButton",
		"controls-reference",
		"Primary and neutral buttons, regular and small, with native keyboard behavior.",
		[
			{ initial: "Continue", key: "label", label: "Label" },
			size,
			disabled,
			{
				initial: "primary",
				key: "variant",
				label: "Variant",
				options: ["primary", "default"],
			},
		]
	),
	defineEntry(
		"text-field",
		"Text field",
		"Form controls",
		"controls",
		"MacTextField",
		"text-fields-reference",
		"Editable text and secure fields with native focus and disabled states.",
		[
			size,
			...editable,
			{ initial: "My project", key: "value", label: "Initial text" },
			{ initial: "Project name", key: "placeholder", label: "Placeholder" },
			{
				initial: "text",
				key: "type",
				label: "Type",
				options: ["text", "password"],
			},
		]
	),
	defineEntry(
		"search-field",
		"Search field",
		"Form controls",
		"controls",
		"MacSearchField",
		"text-fields-reference",
		"Search input with submission, clearing, and focus restoration.",
		[
			size,
			...editable,
			{ initial: "", key: "value", label: "Initial query" },
			{
				initial: "Search components",
				key: "placeholder",
				label: "Placeholder",
			},
		]
	),
	defineEntry(
		"checkbox",
		"Checkbox",
		"Form controls",
		"checkbox",
		"MacCheckbox",
		"input-controls-reference",
		"Checked, unchecked, mixed, disabled, and read-only checkbox states.",
		[
			label,
			checked,
			...editable,
			active,
			{ initial: false, key: "indeterminate", label: "Mixed state" },
		]
	),
	defineEntry(
		"radio",
		"Radio group",
		"Form controls",
		"radio",
		"MacRadioGroup, MacRadio",
		"input-controls-reference",
		"A single choice with arrow-key navigation and disabled options.",
		[
			...editable,
			active,
			{
				initial: "week",
				key: "value",
				label: "Initial choice",
				options: ["day", "week", "month"],
			},
		]
	),
	defineEntry(
		"switch",
		"Switch",
		"Form controls",
		"controls",
		"MacSwitch",
		"toggle-controls-reference",
		"Fully rounded regular and small switches with click and Space-key toggling.",
		[label, checked, size, ...editable]
	),
	defineEntry(
		"slider",
		"Slider",
		"Form controls",
		"slider",
		"MacSlider",
		"input-controls-reference",
		"Continuous or ticked sliders with keyboard stepping and covered-tick hiding.",
		[
			disabled,
			active,
			{ initial: 50, key: "value", label: "Initial value", max: 100, min: 0 },
			{ initial: 0, key: "tickMarks", label: "Tick marks", max: 11, min: 0 },
			{ initial: 5, key: "step", label: "Step", max: 25, min: 1 },
		]
	),
	defineEntry(
		"stepper",
		"Stepper",
		"Form controls",
		"stepper",
		"MacStepper",
		"input-controls-reference",
		"Numeric entry with increment/decrement buttons and a bounded range.",
		[
			...editable,
			active,
			{ initial: 5, key: "value", label: "Initial value", max: 100, min: 0 },
			{ initial: 1, key: "step", label: "Step", max: 10, min: 1 },
		]
	),
	defineEntry(
		"segmented-control",
		"Segmented control",
		"Form controls",
		"segmented-control",
		"MacSegmentedControl",
		"toggle-controls-reference",
		"Single-value segments with text or icons and disabled-item navigation.",
		[size, ...editable, { initial: false, key: "icons", label: "Use icons" }]
	),
	defineEntry(
		"pop-up-button",
		"Pop-up button",
		"Form controls",
		"pop-up-button",
		"MacPopUpButton",
		"selection-controls-reference",
		"A native-style selection menu aligned with the current option.",
		[
			size,
			...editable,
			active,
			{
				initial: "week",
				key: "value",
				label: "Initial choice",
				options: ["day", "week", "month"],
			},
		]
	),
	defineEntry(
		"combo-box",
		"Combo box",
		"Form controls",
		"combo-box",
		"MacComboBox",
		"selection-controls-reference",
		"Editable text with suggestions, filtering, and arbitrary values.",
		[
			size,
			...editable,
			active,
			{ initial: "Week", key: "value", label: "Initial text" },
			{
				initial: "list",
				key: "mode",
				label: "Completion",
				options: ["none", "list", "inline", "both"],
			},
		]
	),
	defineEntry(
		"date-picker",
		"Date & time picker",
		"Form controls",
		"date-picker",
		"MacDatePicker",
		"date-picker-reference",
		"Editable segments, a separate stepper, and a keyboard-accessible calendar.",
		[
			size,
			...editable,
			{
				initial: "date",
				key: "mode",
				label: "Mode",
				options: ["date", "time", "datetime"],
			},
			{
				initial: "h12",
				key: "hourCycle",
				label: "Hour cycle",
				options: ["h12", "h23"],
			},
			{ initial: true, key: "calendar", label: "Calendar overlay" },
		]
	),
	defineEntry(
		"calendar",
		"Calendar",
		"Form controls",
		"calendar",
		"MacCalendar",
		"date-picker-reference",
		"A Gregorian calendar with month navigation and roving keyboard focus.",
		[
			...editable,
			{ initial: false, key: "bounded", label: "Limit to Oct 10–Nov 15" },
		]
	),
	defineEntry(
		"progress",
		"Progress bar",
		"Feedback",
		"progress",
		"MacProgressBar",
		"progress-reference",
		"Determinate and indeterminate progress with active and stopped states.",
		[
			size,
			active,
			{ initial: 62, key: "value", label: "Progress", max: 100, min: 0 },
			{ initial: false, key: "indeterminate", label: "Indeterminate" },
			{ initial: true, key: "running", label: "Running" },
			{ initial: false, key: "hidesWhenStopped", label: "Hide when stopped" },
		]
	),
	defineEntry(
		"spinner",
		"Spinner",
		"Feedback",
		"progress",
		"MacSpinner",
		"progress-reference",
		"Native-style activity indicators with regular, small, and stopped states.",
		[
			size,
			active,
			{ initial: true, key: "running", label: "Running" },
			{ initial: false, key: "hidesWhenStopped", label: "Hide when stopped" },
		]
	),
	defineEntry(
		"file-grid",
		"File grid",
		"Files & Finder",
		"files",
		"MacFileGrid",
		"window-reference",
		"Native file artwork, connected filename selection, tags, and multiselection.",
		[
			...fileProperties,
			{
				initial: 64,
				key: "iconSize",
				label: "Icon size",
				max: 96,
				min: 32,
				step: 8,
			},
		],
		760,
		480
	),
	defineEntry(
		"file-list",
		"File list",
		"Files & Finder",
		"file-list",
		"MacFileList",
		"file-list-reference",
		"Sortable, resizable Finder columns with keyboard selection and metadata.",
		[
			...fileProperties,
			{ initial: true, key: "resizable", label: "Resizable columns" },
		],
		900,
		460
	),
	defineEntry(
		"folder-list",
		"Expandable folders",
		"Files & Finder",
		"file-list",
		"MacFileList",
		"folder-list-reference",
		"Expand folders in place with disclosure controls and Left/Right navigation.",
		fileProperties,
		900,
		460
	),
	defineEntry(
		"file-columns",
		"Column view",
		"Files & Finder",
		"file-columns",
		"MacFileColumns",
		"file-columns-reference",
		"Browse nested folders with independently resizable columns and a preview pane.",
		[
			...fileProperties,
			{ initial: true, key: "showPreview", label: "Preview pane" },
			{ initial: true, key: "resizable", label: "Resizable columns" },
		],
		960,
		500
	),
	defineEntry(
		"file-gallery",
		"Gallery view",
		"Files & Finder",
		"file-gallery",
		"MacFileGallery",
		"file-gallery-reference",
		"Large previews, a selectable filmstrip, metadata, and quick actions.",
		[active, { initial: true, key: "showInfo", label: "Information panel" }],
		900,
		520
	),
	defineEntry(
		"file-rename",
		"Inline renaming",
		"Files & Finder",
		"files",
		"MacFileGrid",
		"file-rename-reference",
		"Press Return on a selected file or use Rename. The basename is selected for editing.",
		fileProperties,
		760,
		460
	),
	defineEntry(
		"new-folder",
		"New Folder",
		"Files & Finder",
		"new-folder",
		"MacNewFolderPanel, MacNewFolderDialog",
		"new-folder-reference",
		"Create a folder with live naming validation. Demo files stay in memory.",
		[{ initial: false, key: "modal", label: "Use modal dialog" }],
		760,
		480
	),
	defineEntry(
		"file-dialog",
		"Open & Save dialogs",
		"Files & Finder",
		"file-dialog",
		"MacFileDialog, MacFileDialogPanel",
		"file-dialog-reference",
		"Browse folders, filter file types, create folders, open files, or choose a save target.",
		[
			{
				initial: "open",
				key: "mode",
				label: "Mode",
				options: ["open", "save"],
			},
			{
				initial: "list",
				key: "view",
				label: "Initial view",
				options: ["list", "columns"],
			},
			{ initial: true, key: "expanded", label: "Expanded save panel" },
			{ initial: false, key: "multiple", label: "Allow multiple files" },
			{ initial: false, key: "modal", label: "Use modal dialog" },
		],
		960,
		580
	),
	defineEntry(
		"quick-look",
		"Quick Look",
		"Files & Finder",
		"quick-look",
		"MacQuickLook, MacQuickLookPanel",
		"quick-look-reference",
		"Preview a file, step through neighboring items, or open a modal Quick Look panel.",
		[{ initial: false, key: "modal", label: "Use modal panel" }],
		800,
		520
	),
	defineEntry(
		"get-info",
		"Get Info",
		"Files & Finder",
		"file-info",
		"MacGetInfo, MacGetInfoPanel",
		"file-info-reference",
		"A file inspector with editable names, comments, flags, and collapsible sections.",
		[active, { initial: false, key: "modal", label: "Use floating inspector" }],
		640,
		620
	),
	defineEntry(
		"file-icons",
		"File icons",
		"Assets",
		"file-icons",
		"MacFileIcon, MacFolderPreviewIcon",
		"window-reference",
		"Native folder, document, PDF, image, archive, and text artwork.",
		[
			{
				initial: 64,
				key: "iconSize",
				label: "Icon size",
				max: 128,
				min: 32,
				step: 8,
			},
		],
		720,
		400
	),
	defineEntry(
		"file-thumbnail",
		"Image & document masks",
		"Assets",
		"file-thumbnail",
		"MacFileThumbnail",
		"window-reference",
		"One image becomes a photo or paper document with a fold, clipping, and shadow.",
		[
			{
				initial: "document",
				key: "presentation",
				label: "Presentation",
				options: ["document", "image"],
			},
			{
				initial: "contain",
				key: "fit",
				label: "Image fit",
				options: ["contain", "cover"],
			},
		]
	),
	defineEntry(
		"symbols",
		"Native symbols",
		"Assets",
		"window-symbol",
		"WindowSymbol",
		"window-reference",
		"The native Tahoe glyph set. Select a symbol to see its name and copy its usage.",
		[
			{
				initial: "share",
				key: "name",
				label: "Selected symbol",
				options: Object.keys(NATIVE_SYMBOLS),
			},
			{
				initial: 24,
				key: "iconSize",
				label: "Symbol size",
				max: 48,
				min: 16,
				step: 4,
			},
		],
		800,
		540
	),
];

export function playgroundDefaults(entry: PlaygroundEntry): PlaygroundValues {
	return Object.fromEntries(
		entry.properties.map((property) => [property.key, property.initial])
	);
}
export function playgroundEntry(id: string | null): PlaygroundEntry {
	const alias = id === "controls" ? "button" : id;
	return (
		PLAYGROUND_ENTRIES.find((item) => item.id === alias) ??
		PLAYGROUND_ENTRIES[0]
	);
}
const SEARCH_WORDS = /\s+/;

export function playgroundMatches(
	entry: PlaygroundEntry,
	search: string
): boolean {
	const text = [entry.title, entry.group, entry.description, entry.imports]
		.join(" ")
		.toLowerCase();
	return search
		.toLowerCase()
		.trim()
		.split(SEARCH_WORDS)
		.every((word) => text.includes(word));
}

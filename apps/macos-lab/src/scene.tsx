/** biome-ignore-all lint/performance/noJsxPropsBind: This small interactive lab intentionally uses local handlers; pointer animation is isolated in the Dock. */
import { MacButton, MacSwitch } from "@anyway-design/macos/controls";
import { Dock } from "@anyway-design/macos/dock";
import {
	type MacOSAppearance,
	MacOSEnvironment,
	type MacOSPreset,
} from "@anyway-design/macos/environment";
import {
	AppleMark,
	type MacMenu,
	MenuBar,
} from "@anyway-design/macos/menu-bar";
import { MacTabs } from "@anyway-design/macos/tabs";
import { MacWindow, type MacWindowProps } from "@anyway-design/macos/window";
import { WindowSidebar } from "@anyway-design/macos/window-sidebar";
import {
	WindowSymbol,
	type WindowSymbolName,
} from "@anyway-design/macos/window-symbol";
import {
	WindowToolbarButton,
	WindowToolbarGroup,
} from "@anyway-design/macos/window-toolbar";
import {
	BatteryFull,
	Cloud,
	House,
	Search,
	SlidersHorizontal,
	Wifi,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { DOCK_ITEMS } from "./dock-items";
import { FinderActions } from "./finder-actions";
export type ComponentName =
	| "desktop"
	| "menu-bar"
	| "dock"
	| "window"
	| "tabs"
	| "controls";
export type Wallpaper = "clouds" | "dusk" | "graphite";
export interface SceneSettings {
	accentColor: string;
	active: boolean;
	appearance: MacOSAppearance;
	dockAutoHide: boolean;
	dockPosition: "bottom" | "left" | "right";
	dockSize: number;
	magnification: number;
	preset: MacOSPreset;
	reduceMotion: boolean;
	reduceTransparency: boolean;
	wallpaper: Wallpaper;
}
const MENUS: MacMenu[] = [
	{
		accessibleLabel: "Apple",
		id: "apple",
		items: [
			{ id: "about", label: "About This Mac" },
			{ id: "settings", label: "System Settings…", separatorBefore: true },
			{ disabled: true, id: "sleep", label: "Sleep", separatorBefore: true },
			{ disabled: true, id: "restart", label: "Restart…" },
			{ disabled: true, id: "shutdown", label: "Shut Down…" },
		],
		label: <AppleMark />,
	},
	{
		id: "finder",
		items: [
			{ id: "about-finder", label: "About Finder" },
			{
				id: "settings",
				label: "Settings…",
				separatorBefore: true,
				shortcut: "⌘,",
			},
			{
				id: "hide",
				label: "Hide Finder",
				separatorBefore: true,
				shortcut: "⌘H",
			},
			{ id: "show", label: "Show All" },
		],
		label: <strong>Finder</strong>,
	},
	{
		id: "file",
		items: [
			{ id: "new-window", label: "New Finder Window", shortcut: "⌘N" },
			{ id: "new-folder", label: "New Folder", shortcut: "⇧⌘N" },
			{
				id: "close",
				label: "Close Window",
				separatorBefore: true,
				shortcut: "⌘W",
			},
		],
		label: "File",
	},
	{
		id: "edit",
		items: [
			{ disabled: true, id: "undo", label: "Undo", shortcut: "⌘Z" },
			{ disabled: true, id: "redo", label: "Redo", shortcut: "⇧⌘Z" },
			{
				id: "select-all",
				label: "Select All",
				separatorBefore: true,
				shortcut: "⌘A",
			},
		],
		label: "Edit",
	},
	{
		id: "view",
		items: [
			{ id: "icons", label: "as Icons", shortcut: "⌘1" },
			{ id: "list", label: "as List", shortcut: "⌘2" },
			{
				id: "toggle-sidebar",
				label: "Toggle Sidebar",
				separatorBefore: true,
				shortcut: "⌃⌘S",
			},
		],
		label: "View",
	},
	{
		id: "window",
		items: [
			{ id: "minimize", label: "Minimize", shortcut: "⌘M" },
			{ id: "zoom", label: "Zoom" },
			{ id: "show", label: "Bring All to Front", separatorBefore: true },
		],
		label: "Window",
	},
];
const SIDEBAR: { icon: WindowSymbolName; label: string }[] = [
	{ icon: "recents", label: "Recents" },
	{ icon: "favorites", label: "Favorites" },
	{ icon: "desktop", label: "Desktop" },
	{ icon: "document", label: "Documents" },
	{ icon: "downloads", label: "Downloads" },
];
const FINDER_SIDEBAR_GROUPS = [
	{
		id: "favorites",
		items: SIDEBAR.map(({ icon, label }) => ({
			icon: <WindowSymbol name={icon} />,
			id: label,
			label,
		})),
		label: "Favorites",
	},
	{
		id: "cloud",
		items: [
			{
				icon: <WindowSymbol name="cloud" />,
				id: "iCloud Drive",
				label: "iCloud Drive",
			},
		],
		label: "iCloud",
	},
	{
		id: "tags",
		items: [
			{
				icon: <span className="finder-tag-dot" />,
				id: "Personal",
				label: "Personal",
			},
			{
				icon: <span className="finder-tag-dot finder-tag-work" />,
				id: "Work",
				label: "Work",
			},
		],
		label: "Tags",
	},
];
const INITIAL_FOLDERS = [
	"Applications",
	"Design resources",
	"Projects",
	"Screenshots",
	"Wallpapers",
	"Weekend ideas",
];
function ControlsExample() {
	const [notifications, setNotifications] = useState(true);
	const [sounds, setSounds] = useState(false);
	const [saved, setSaved] = useState(false);
	return (
		<div className="controls-example">
			<div className="sample-heading">
				<SlidersHorizontal />
				<h3>Make yourself at home.</h3>
				<p>A few familiar controls, down to the details.</p>
			</div>
			<div className="sample-setting">
				<MacSwitch
					checked={notifications}
					label="Allow notifications"
					onCheckedChange={setNotifications}
				/>
			</div>
			<div className="sample-setting">
				<MacSwitch
					checked={sounds}
					label="Play interface sounds"
					onCheckedChange={setSounds}
				/>
			</div>
			<label className="sample-input-label">
				Display name
				<input defaultValue="My Mac" />
			</label>
			<div className="sample-buttons">
				<span aria-live="polite">{saved ? "Preferences saved" : ""}</span>
				<MacButton
					onClick={() => {
						setNotifications(true);
						setSounds(false);
						setSaved(false);
					}}
				>
					Reset
				</MacButton>
				<MacButton onClick={() => setSaved(true)} variant="primary">
					Done
				</MacButton>
			</div>
		</div>
	);
}
export function DesktopScene({
	settings,
	component,
	caption,
	nativeScale = false,
}: {
	settings: SceneSettings;
	component: ComponentName;
	caption?: string;
	nativeScale?: boolean;
}) {
	const { viewport, scale } = usePreviewScale();
	const [windowVisible, setWindowVisible] = useState(true);
	const [zoomed, setZoomed] = useState(false);
	const [selected, setSelected] = useState("Documents");
	const [tab, setTab] = useState("all");
	const [folders, setFolders] = useState(INITIAL_FOLDERS);
	const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
	const [listView, setListView] = useState(false);
	const [sidebarVisible, setSidebarVisible] = useState(true);
	const [notice, setNotice] = useState("");
	const [app, setApp] = useState("Finder");

	useEffect(() => {
		if (!notice) {
			return;
		}
		const timer = window.setTimeout(() => setNotice(""), 2600);
		return () => window.clearTimeout(timer);
	}, [notice]);
	function action(id: string) {
		switch (id) {
			case "hide":
			case "close":
			case "minimize":
				setWindowVisible(false);
				break;
			case "show":
			case "new-window":
				setApp("Finder");
				setWindowVisible(true);
				break;
			case "zoom":
				setZoomed((value) => !value);
				break;
			case "new-folder":
				setFolders((values) => [...values, `Untitled ${values.length - 5}`]);
				setWindowVisible(true);
				break;
			case "icons":
				setListView(false);
				break;
			case "list":
				setListView(true);
				break;
			case "select-all":
				setSelectedFolders(folders);
				break;
			case "toggle-sidebar":
				setSidebarVisible((value) => !value);
				break;
			case "settings":
				setApp("Settings");
				setWindowVisible(true);
				break;
			default:
				setNotice(
					`macOS ${settings.preset === "tahoe" ? "Tahoe" : "Sequoia"} · React preview`
				);
		}
	}
	const isControls = component === "controls" || app === "Settings";
	const showWindow = component !== "dock" && component !== "menu-bar";
	const windowTitle = isControls ? "Preferences" : selected;
	const folderContent = (
		<FinderFiles
			folders={folders}
			listView={listView}
			selectedFolders={selectedFolders}
			setSelected={setSelected}
			setSelectedFolders={setSelectedFolders}
			tab={tab}
		/>
	);
	const tabs = [
		{ content: folderContent, id: "all", label: "All files" },
		{ content: folderContent, id: "recent", label: "Recent" },
		{
			content: (
				<div className="empty-folder">
					<Cloud size={40} />
					<h3>Nothing shared yet</h3>
					<p>Your shared files will appear here.</p>
				</div>
			),
			id: "shared",
			label: "Shared",
		},
	];
	const sidebar = (
		<WindowSidebar
			groups={FINDER_SIDEBAR_GROUPS}
			onSelect={setSelected}
			selected={selected}
		/>
	);
	const toolbarLeading = (
		<WindowToolbarGroup label="Navigation">
			<WindowToolbarButton
				label="Go to Documents"
				onClick={() => setSelected("Documents")}
			>
				<WindowSymbol name="chevron-left" />
			</WindowToolbarButton>
			<WindowToolbarButton
				label="Go to Downloads"
				onClick={() => setSelected("Downloads")}
			>
				<WindowSymbol name="chevron-right" />
			</WindowToolbarButton>
		</WindowToolbarGroup>
	);
	const toolbar = (
		<FinderToolbar
			listView={listView}
			onAction={(id) => setNotice(`${id} activated`)}
			setApp={setApp}
			setListView={setListView}
		/>
	);
	return (
		<div className="scene-wrapper">
			{caption ? (
				<div className="scene-caption">
					<span />
					{caption}
					<small>{settings.appearance}</small>
				</div>
			) : null}
			<div
				className="scene-viewport"
				ref={viewport}
				style={{
					height: `${640 * scale}px`,
					width: nativeScale ? 1000 : "100%",
				}}
			>
				<MacOSEnvironment
					{...settings}
					className={`desktop-scene wallpaper-${settings.wallpaper}`}
					style={
						{
							height: 640,
							transform: `scale(${scale})`,
							transformOrigin: "top left",
							width: 1000,
						} as CSSProperties
					}
				>
					<MenuBar
						menus={MENUS}
						onAction={action}
						status={
							<>
								<BatteryFull />
								<Wifi />
								<Search />
								<SlidersHorizontal />
								<span>Tue 20 Oct&nbsp; 9:41</span>
							</>
						}
					/>
					<SceneIntro component={component} />
					{showWindow && windowVisible ? (
						<div className="scene-window" data-zoomed={zoomed}>
							<MacWindow
								active={settings.active}
								{...getWindowChrome({
									app,
									count: folders.length,
									isControls,
									sidebar,
									sidebarVisible,
									title: windowTitle,
									toolbar,
									toolbarLeading,
								})}
								onClose={() => setWindowVisible(false)}
								onMinimize={() => setWindowVisible(false)}
								onZoom={() => setZoomed((value) => !value)}
								zoomed={zoomed}
							>
								{isControls ? (
									<ControlsExample />
								) : (
									<MacTabs
										label="File views"
										onValueChange={setTab}
										tabs={tabs}
										value={tab}
										variant={component === "tabs" ? "segmented" : "document"}
									/>
								)}
							</MacWindow>
						</div>
					) : null}
					{!windowVisible && showWindow ? (
						<button
							className="restore-window"
							onClick={() => setWindowVisible(true)}
							type="button"
						>
							<House size={17} /> Reopen window
						</button>
					) : null}
					<SceneDock
						component={component}
						setApp={setApp}
						setNotice={setNotice}
						setSelected={setSelected}
						settings={settings}
						setWindowVisible={setWindowVisible}
					/>
					<div
						aria-live="polite"
						className="scene-notice"
						data-visible={Boolean(notice)}
					>
						{notice}
					</div>
				</MacOSEnvironment>
			</div>
		</div>
	);
}

function FinderFiles({
	folders,
	tab,
	listView,
	selectedFolders,
	setSelectedFolders,
	setSelected,
}: {
	folders: string[];
	tab: string;
	listView: boolean;
	selectedFolders: string[];
	setSelectedFolders: (value: string[]) => void;
	setSelected: (value: string) => void;
}) {
	return (
		<div className="finder-files" data-list={listView}>
			{folders
				.filter((_, index) => tab !== "recent" || index < 3)
				.map((folder) => (
					<button
						aria-pressed={selectedFolders.includes(folder)}
						className="finder-file"
						key={folder}
						onClick={() => setSelectedFolders([folder])}
						onDoubleClick={() => {
							setSelected(folder);
							setSelectedFolders([]);
						}}
						type="button"
					>
						<svg aria-hidden className="folder-art" viewBox="0 0 80 64">
							<path
								d="M3 12a5 5 0 0 1 5-5h22l7 7h35a5 5 0 0 1 5 5v36a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"
								fill="#30a9dd"
							/>
							<path
								d="M3 22a5 5 0 0 1 5-5h64a5 5 0 0 1 5 5v33a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"
								fill="#6bc9f1"
							/>
							<path d="M7 18h66" stroke="#b4e8ff" strokeWidth="1.5" />
						</svg>
						<span>{folder}</span>
						{listView ? <small>Folder</small> : null}
					</button>
				))}
		</div>
	);
}

function FinderToolbar({
	listView,
	setListView,
	setApp,
	onAction,
}: {
	listView: boolean;
	onAction: (id: string) => void;
	setListView: React.Dispatch<React.SetStateAction<boolean>>;
	setApp: (value: string) => void;
}) {
	return (
		<WindowToolbarGroup label="View options">
			<WindowToolbarButton
				label={listView ? "Show icons" : "Show list"}
				onClick={() => setListView((value) => !value)}
			>
				<WindowSymbol name={listView ? "icon-view" : "list-view"} />
			</WindowToolbarButton>
			<WindowToolbarButton
				label="Open preferences"
				onClick={() => setApp("Settings")}
			>
				<WindowSymbol name="settings" />
			</WindowToolbarButton>
			<FinderActions filename="selection" onAction={onAction} />
		</WindowToolbarGroup>
	);
}

function SceneIntro({ component }: { component: ComponentName }) {
	return component === "dock" || component === "menu-bar" ? (
		<div className="scene-intro">
			<span>
				{component === "dock"
					? "A familiar place for your favorites."
					: "Everything, right where you expect it."}
			</span>
			<p>
				{component === "dock"
					? "Move across the Dock. Open an app. Make it your own."
					: "Click a menu, then try the arrow keys."}
			</p>
		</div>
	) : null;
}

function SceneDock({
	component,
	settings,
	setNotice,
	setApp,
	setSelected,
	setWindowVisible,
}: {
	component: ComponentName;
	settings: SceneSettings;
	setNotice: (value: string) => void;
	setApp: (value: string) => void;
	setSelected: (value: string) => void;
	setWindowVisible: (value: boolean) => void;
}) {
	const showDock = component === "desktop" || component === "dock";
	return showDock ? (
		<Dock
			autoHide={settings.dockAutoHide}
			items={DOCK_ITEMS}
			magnification={settings.reduceMotion ? 1 : settings.magnification}
			onActivate={(id) => {
				const item = DOCK_ITEMS.find((entry) => entry.id === id);
				if (component === "dock" || (id !== "finder" && id !== "downloads")) {
					setNotice(`${item?.label ?? "App"} selected`);
				} else {
					setApp("Finder");
					setSelected(id === "downloads" ? "Downloads" : "Documents");
					setWindowVisible(true);
				}
			}}
			position={settings.dockPosition}
			size={settings.dockSize}
		/>
	) : null;
}

function usePreviewScale() {
	const viewport = useRef<HTMLDivElement | null>(null);
	const [scale, setScale] = useState(1);
	useEffect(() => {
		const element = viewport.current;
		if (element === null) {
			return;
		}
		const observer = new ResizeObserver(([entry]) => {
			if (entry) {
				setScale(entry.contentRect.width / 1000);
			}
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	return { scale, viewport };
}

function getWindowChrome({
	isControls,
	count,
	sidebarVisible,
	sidebar,
	app,
	title,
	toolbar,
	toolbarLeading,
}: {
	isControls: boolean;
	count: number;
	sidebarVisible: boolean;
	sidebar: React.ReactNode;
	app: string;
	title: string;
	toolbar: React.ReactNode;
	toolbarLeading: React.ReactNode;
}): Pick<
	MacWindowProps,
	"footer" | "sidebar" | "title" | "toolbar" | "toolbarLeading"
> {
	return {
		footer: isControls ? undefined : `${count} items · 128.4 GB available`,
		sidebar: !isControls && sidebarVisible ? sidebar : undefined,
		title: app === "Finder" || isControls ? title : app,
		toolbar: isControls ? undefined : toolbar,
		toolbarLeading: isControls ? undefined : toolbarLeading,
	};
}

/** biome-ignore-all lint/performance/noJsxPropsBind: This small interactive lab intentionally uses local handlers; pointer animation is isolated in the Dock. */
import {
	MacButton,
	MacSearchField,
	MacSwitch,
	MacTextField,
} from "@anyway-design/macos/controls";
import { Dock } from "@anyway-design/macos/dock";
import {
	type MacOSAppearance,
	MacOSEnvironment,
	type MacOSPreset,
} from "@anyway-design/macos/environment";
import { MacFileColumns } from "@anyway-design/macos/file-columns";
import { MacFileGallery } from "@anyway-design/macos/file-gallery";
import {
	MacFileList,
	type MacFileListItem,
} from "@anyway-design/macos/file-list";
import { MacFileGrid } from "@anyway-design/macos/files";
import {
	AppleMark,
	type MacMenu,
	MenuBar,
} from "@anyway-design/macos/menu-bar";
import { MacTabs } from "@anyway-design/macos/tabs";
import { MacWindow, type MacWindowProps } from "@anyway-design/macos/window";
import { WindowSidebar } from "@anyway-design/macos/window-sidebar";
import {
	BatteryFull,
	House,
	Search,
	SlidersHorizontal,
	Wifi,
} from "lucide-react";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { DOCK_ITEMS } from "./dock-items";
import {
	FinderNavigation,
	FinderToolbar,
	type FinderView,
} from "./finder-toolbar";
import { PLAYGROUND_FILES, PLAYGROUND_SIDEBAR } from "./playground-data";
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
const INITIAL_FOLDERS = PLAYGROUND_FILES.map((file) => file.name);
function ControlsExample() {
	const displayNameId = useId();
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
			<MacSearchField
				aria-label="Search settings"
				placeholder="Search settings"
			/>
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
			<label className="sample-input-label" htmlFor={displayNameId}>
				Display name
				<MacTextField defaultValue="My Mac" id={displayNameId} />
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
	const [finderView, setFinderView] = useState<FinderView>("icons");
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
				setFinderView("icons");
				break;
			case "list":
				setFinderView("list");
				break;
			case "select-all":
				setSelectedFolders(visibleFolders);
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
	const finderTitle = tab === "recent" ? "Home" : selected;
	const windowTitle = isControls ? "Preferences" : finderTitle;
	const visibleFolders = folders.filter(
		(name) =>
			tab !== "recent" ||
			!PLAYGROUND_FILES.some(
				(file) => file.name === name && file.kind !== "folder"
			)
	);
	const folderContent = (
		<FinderFiles
			folders={visibleFolders}
			onFileOpen={(id) => setNotice(`Open callback → ${id}`)}
			selectedFolders={selectedFolders}
			setSelected={setSelected}
			setSelectedFolders={setSelectedFolders}
			view={finderView}
		/>
	);
	const tabs = [
		{ content: folderContent, id: "all", label: selected },
		{ content: folderContent, id: "recent", label: "Home" },
	];
	const sidebar = (
		<WindowSidebar
			groups={PLAYGROUND_SIDEBAR}
			onSelect={(id) => {
				const item = PLAYGROUND_SIDEBAR.flatMap((group) => group.items).find(
					(entry) => entry.id === id
				);
				setSelected(item?.label ?? "Documents");
				setTab("all");
			}}
			selected={tab === "recent" ? undefined : selected.toLowerCase()}
		/>
	);
	const toolbarLeading = (
		<FinderNavigation
			backDisabled={selected === "Documents"}
			onBack={() => {
				setSelected("Documents");
				setTab("all");
			}}
		/>
	);
	const toolbar = (
		<FinderToolbar
			onAction={(id) => setNotice(`${id} activated`)}
			onViewChange={setFinderView}
			view={finderView}
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
								variant={isControls ? "standard" : "finder"}
								{...getWindowChrome({
									app,
									count: visibleFolders.length,
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
	onFileOpen,
	view,
	selectedFolders,
	setSelectedFolders,
	setSelected,
}: {
	folders: string[];
	view: FinderView;
	onFileOpen: (id: string) => void;
	selectedFolders: string[];
	setSelectedFolders: (value: string[]) => void;
	setSelected: (value: string) => void;
}) {
	const [column, setColumn] = useState<string>();
	const openFolder = useCallback(
		(folder: string) => {
			if (
				PLAYGROUND_FILES.some(
					(file) => file.name === folder && file.kind !== "folder"
				)
			) {
				onFileOpen(folder);
				return;
			}
			setSelected(folder);
			setSelectedFolders([]);
		},
		[onFileOpen, setSelected, setSelectedFolders]
	);
	const items: MacFileListItem[] = folders.map((name) => ({
		...PLAYGROUND_FILES.find((file) => file.name === name),
		id: name,
		kind: PLAYGROUND_FILES.find((file) => file.name === name)?.kind ?? "folder",
		name,
	}));
	if (view === "columns") {
		return (
			<MacFileColumns
				items={items}
				onOpen={openFolder}
				onValueChange={(id, ids) => {
					setColumn(id);
					setSelectedFolders(ids);
				}}
				selectedIds={selectedFolders}
				showExtensions={false}
				value={column}
			/>
		);
	}
	if (view === "gallery") {
		return (
			<MacFileGallery
				items={items}
				onSelectionChange={setSelectedFolders}
				selectedIds={selectedFolders}
			/>
		);
	}
	if (view === "list") {
		return (
			<MacFileList
				items={items}
				minRows={10}
				onOpen={openFolder}
				onSelectionChange={setSelectedFolders}
				selectedIds={selectedFolders}
				showExtensions={false}
			/>
		);
	}
	return (
		<MacFileGrid
			className="finder-icon-grid"
			items={items}
			onOpen={openFolder}
			onSelectionChange={setSelectedFolders}
			selectedIds={selectedFolders}
			showExtensions={false}
		/>
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
		footer: isControls
			? undefined
			: `${count} ${count === 1 ? "item" : "items"} · 128.4 GB available`,
		sidebar: !isControls && sidebarVisible ? sidebar : undefined,
		title: app === "Finder" || isControls ? title : app,
		toolbar: isControls ? undefined : toolbar,
		toolbarLeading: isControls ? undefined : toolbarLeading,
	};
}

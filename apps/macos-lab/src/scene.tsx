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
import {
	AppleMark,
	type MacMenu,
	MenuBar,
} from "@anyway-design/macos/menu-bar";
import { MacWindow } from "@anyway-design/macos/window";
import {
	BatteryFull,
	House,
	Search,
	SlidersHorizontal,
	Wifi,
} from "lucide-react";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { DOCK_ITEMS } from "./dock-items";
import { type FinderHandle, PlaygroundFinder } from "./playground-finder";
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
			{ id: "columns", label: "as Columns", shortcut: "⌘3" },
			{ id: "gallery", label: "as Gallery", shortcut: "⌘4" },
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
	const finder = useRef<FinderHandle>(null);
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
				finder.current?.command("new-folder");
				setApp("Finder");
				setWindowVisible(true);
				break;
			case "icons":
				finder.current?.command("icons");
				break;
			case "list":
				finder.current?.command("list");
				break;
			case "columns":
			case "gallery":
				finder.current?.command(id);
				break;
			case "select-all":
				finder.current?.command("select-all");
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
					{showWindow ? (
						<>
							<div
								className="scene-window"
								data-zoomed={zoomed}
								hidden={!windowVisible || isControls}
							>
								<PlaygroundFinder
									active={settings.active}
									onClose={() => setWindowVisible(false)}
									onEvent={setNotice}
									onMinimize={() => setWindowVisible(false)}
									onZoom={() => setZoomed((value) => !value)}
									ref={finder}
									showSidebar={sidebarVisible}
									title="Documents"
									zoomed={zoomed}
								/>
							</div>
							{isControls && windowVisible ? (
								<div className="scene-window" data-zoomed={zoomed}>
									<MacWindow
										active={settings.active}
										onClose={() => setWindowVisible(false)}
										onMinimize={() => setWindowVisible(false)}
										onZoom={() => setZoomed((value) => !value)}
										title="Preferences"
										zoomed={zoomed}
									>
										<ControlsExample />
									</MacWindow>
								</div>
							) : null}
						</>
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
						onNavigate={(id) => finder.current?.navigate(id)}
						setApp={setApp}
						setNotice={setNotice}
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
	onNavigate,
	setWindowVisible,
}: {
	component: ComponentName;
	settings: SceneSettings;
	setNotice: (value: string) => void;
	setApp: (value: string) => void;
	onNavigate: (value: string) => void;
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
					if (id === "downloads") {
						onNavigate("downloads");
					}
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

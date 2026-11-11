/** biome-ignore-all lint/performance/noJsxPropsBind: The playground owns its window state and callbacks. */
import {
	MacDesktop,
	type MacDesktopFrames,
	type MacDesktopWindow,
} from "@1bye/macos/desktop";
import { Dock } from "@1bye/macos/dock";
import {
	type MacOSAppearance,
	MacOSEnvironment,
} from "@1bye/macos/environment";
import { MenuBar } from "@1bye/macos/menu-bar";
import { MacWindow } from "@1bye/macos/window";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { DesktopMenuStatus } from "./desktop-menu-status";
import { DOCK_ITEMS } from "./dock-items";
import type { PlaygroundDemoProps } from "./playground-catalog";
import { type FinderHandle, PlaygroundFinder } from "./playground-finder";
import { DESKTOP_MENUS } from "./scene";
import { SettingsExample } from "./settings-demo";
import "./desktop-demo.css";

export const DESKTOP_DOCUMENTS = [
	{
		frame: { height: 310, width: 420, x: 52, y: 58 },
		id: "notes",
		text: "Project notes\n\nA place for the next good idea.\n\nDrag this window by its title bar.\nResize from any edge or corner.\n\nClick Planning to bring it forward.",
		title: "Project notes",
	},
	{
		frame: { height: 280, width: 390, x: 294, y: 172 },
		id: "planning",
		text: "Planning\n\nDesign review\nThursday, October 22 · 10:00 AM\n\nPrototype the details.\nKeep the interaction simple.\nMake room for what matters.",
		title: "Planning",
	},
] as const;

function DocumentWindow({
	active,
	title,
	text,
	onClose,
	onZoom,
}: {
	active: boolean;
	title: string;
	text: string;
	onClose?: () => void;
	onZoom?: () => void;
}) {
	return (
		<MacWindow
			active={active}
			onClose={onClose}
			onMinimize={onClose}
			onZoom={onZoom}
			style={
				{
					"--mac-window-radius": "16px",
					"--mac-window-titlebar-height": "32px",
				} as CSSProperties
			}
			title={title}
		>
			<textarea
				aria-label={`${title} document`}
				className="desktop-document-text"
				defaultValue={text}
				spellCheck={false}
			/>
		</MacWindow>
	);
}

export function DesktopReferenceScene({
	activeId,
	frames,
	onActiveChange,
	onFrameChange,
	onEvent,
}: {
	activeId: string | null;
	frames: MacDesktopFrames;
	onActiveChange: (id: string | null) => void;
	onEvent: (message: string) => void;
	onFrameChange: NonNullable<Parameters<typeof MacDesktop>[0]["onFrameChange"]>;
}) {
	const windows: MacDesktopWindow[] = DESKTOP_DOCUMENTS.map((document) => ({
		defaultFrame: document.frame,
		id: document.id,
		render: ({ active }) => (
			<DocumentWindow
				active={active}
				onClose={() => onEvent("Use Reset to restore the reference layout")}
				text={document.text}
				title={document.title}
			/>
		),
		title: document.title,
	}));
	return (
		<MacDesktop
			activeWindowId={activeId}
			className="desktop-reference-live"
			frames={frames}
			onActiveWindowChange={onActiveChange}
			onFrameChange={onFrameChange}
			windows={windows}
		/>
	);
}

export function DesktopDemo({
	values,
	onEvent,
	environment,
}: PlaygroundDemoProps) {
	const [activeId, setActive] = useState<string | null>("finder");
	const [frames, setFrames] = useState<MacDesktopFrames>({});
	const [closed, setClosed] = useState<readonly string[]>(["settings"]);
	const [sidebar, setSidebar] = useState(true);
	const [brightness, setBrightness] = useState(70);
	const [appearance, setAppearance] = useState<MacOSAppearance>();
	const finder = useRef<FinderHandle>(null);
	const [pendingCommand, setPendingCommand] = useState<string | null>(null);
	useEffect(() => {
		if (pendingCommand && !closed.includes("finder")) {
			finder.current?.command(pendingCommand);
			setPendingCommand(null);
		}
	}, [pendingCommand, closed]);
	const activate = (id: string) => {
		setClosed((current) => current.filter((item) => item !== id));
		setActive(id);
	};
	const close = (id: string) => {
		setClosed((current) => [...current, id]);
		setActive(
			["finder", "notes", "settings"].find(
				(other) => other !== id && !closed.includes(other)
			) ?? null
		);
		onEvent(`Closed ${id}`);
	};
	const zoom = (id: string, fallback: MacDesktopWindow["defaultFrame"]) =>
		setFrames((current) => ({
			...current,
			[id]:
				current[id]?.width === 960
					? fallback
					: { height: 500, width: 960, x: 20, y: 48 },
		}));
	const definitions: MacDesktopWindow[] = [
		{
			defaultFrame: { height: 420, width: 690, x: 70, y: 100 },
			draggable: values.draggable !== false,
			id: "finder",
			minSize: { height: 260, width: 450 },
			render: ({ active }) => (
				<PlaygroundFinder
					active={active}
					onClose={() => close("finder")}
					onEvent={onEvent}
					onMinimize={() => close("finder")}
					onZoom={() =>
						zoom("finder", { height: 420, width: 690, x: 70, y: 100 })
					}
					ref={finder}
					showSidebar={sidebar}
					style={{ height: "100%", width: "100%" }}
					title="Documents"
				/>
			),
			resizable: values.resizable !== false,
			title: "Documents",
		},
		{
			defaultFrame: { height: 290, width: 350, x: 600, y: 58 },
			draggable: values.draggable !== false,
			id: "notes",
			render: ({ active }) => (
				<DocumentWindow
					active={active}
					onClose={() => close("notes")}
					onZoom={() =>
						zoom("notes", { height: 290, width: 350, x: 600, y: 58 })
					}
					text={DESKTOP_DOCUMENTS[0].text.replace(
						"Click Planning",
						"Click Finder"
					)}
					title="Project notes"
				/>
			),
			resizable: values.resizable !== false,
			title: "Project notes",
		},
	];

	definitions.push({
		defaultFrame: { height: 460, width: 660, x: 200, y: 80 },
		draggable: values.draggable !== false,
		id: "settings",
		minSize: { height: 340, width: 500 },
		render: ({ active }) => (
			<SettingsExample
				active={active}
				onClose={() => close("settings")}
				onEvent={onEvent}
				onMinimize={() => close("settings")}
				onZoom={() =>
					zoom("settings", { height: 460, width: 660, x: 200, y: 80 })
				}
				style={{ height: "100%", width: "100%" }}
			/>
		),
		resizable: values.resizable !== false,
		title: "Preferences",
	});
	const windows = definitions.map((window) => ({
		...window,
		open: !closed.includes(window.id),
	}));
	const action = (id: string) => {
		if (definitions.some((window) => window.id === id)) {
			activate(id);
			return;
		}
		switch (id) {
			case "hide":
			case "close":
			case "minimize":
				if (activeId) {
					close(activeId);
				}
				break;
			case "show":
			case "new-window":
				activate("finder");
				break;
			case "zoom":
				if (activeId) {
					const window = definitions.find((item) => item.id === activeId);
					if (window) {
						zoom(activeId, window.defaultFrame);
					}
				}
				break;
			case "toggle-sidebar":
				setSidebar((current) => !current);
				break;
			case "new-folder":
				activate("finder");
				setPendingCommand(id);
				break;
			case "icons":
			case "list":
			case "columns":
			case "gallery":
			case "select-all":
				activate("finder");
				setPendingCommand(id);
				break;
			case "appearance":
				setAppearance((current) =>
					(current ?? environment.appearance) === "light" ? "dark" : "light"
				);
				break;
			case "settings":
			case "battery-settings":
			case "wifi-settings":
			case "edit-controls":
				activate("settings");
				break;
			case "notification-center":
				break;
			default:
				onEvent(id);
		}
	};
	const menus = DESKTOP_MENUS.map((menu) => {
		if (menu.id === "window") {
			return {
				...menu,
				items: [
					...menu.items,
					...definitions.map((window) => ({
						checked: window.id === activeId,
						closeOnClick: true,
						id: window.id,
						label: window.title,
					})),
				],
			};
		}
		if (menu.id === "finder") {
			return {
				...menu,
				label: (
					<strong>
						{{ finder: "Finder", notes: "Notes", settings: "Settings" }[
							activeId ?? "finder"
						] ?? "Finder"}
					</strong>
				),
			};
		}
		return menu;
	});
	return (
		<MacOSEnvironment
			{...environment}
			appearance={appearance ?? environment.appearance}
			style={{ height: "100%", width: "100%" }}
		>
			<MacDesktop
				activeWindowId={activeId}
				className="desktop-demo"
				frames={frames}
				insets={{ bottom: 88, left: 12, right: 12, top: 42 }}
				onActiveWindowChange={(id) => {
					setActive(id);
					onEvent(`Active window → ${id ?? "desktop"}`);
				}}
				onFrameChange={(id, frame, reason) => {
					setFrames((current) => ({ ...current, [id]: frame }));
					onEvent(
						`${reason} ${id} → ${Math.round(frame.x)}, ${Math.round(frame.y)} · ${Math.round(frame.width)} × ${Math.round(frame.height)}`
					);
				}}
				windows={windows}
			>
				<MenuBar
					menus={menus}
					onAction={action}
					status={
						<DesktopMenuStatus
							onAction={action}
							onEvent={onEvent}
							onStatusChange={(value) => setBrightness(value.brightness)}
						/>
					}
				/>
				<div
					aria-hidden
					className="scene-display-shade"
					style={{ opacity: Math.max(0, (70 - brightness) / 130) }}
				/>
				<Dock
					items={DOCK_ITEMS}
					onActivate={(id) => {
						if (id === "finder" || id === "downloads") {
							activate("finder");
						} else if (id === "taada") {
							activate("notes");
						} else {
							action(id === "settings" ? "settings" : `${id} selected`);
						}
					}}
					size={52}
				/>
				{closed.length ? (
					<div className="desktop-reopen">
						{closed
							.filter((id) => id !== "settings")
							.map((id) => (
								<button key={id} onClick={() => activate(id)} type="button">
									Reopen {id === "finder" ? "Finder" : "Project notes"}
								</button>
							))}
					</div>
				) : null}
			</MacDesktop>
		</MacOSEnvironment>
	);
}

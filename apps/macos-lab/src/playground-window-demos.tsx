/** biome-ignore-all lint/performance/noJsxPropsBind: Local interactive playground events. */
import { MacCheckbox } from "@anyway-design/macos/checkbox";
import { MacButton } from "@anyway-design/macos/controls";
import { Dock } from "@anyway-design/macos/dock";
import { MacContextMenu, MacMenuButton } from "@anyway-design/macos/menu";
import { AppleMark, MenuBar } from "@anyway-design/macos/menu-bar";
import { MacPopover, MacPopoverClose } from "@anyway-design/macos/popover";
import { MacTabs } from "@anyway-design/macos/tabs";
import { TrafficLights } from "@anyway-design/macos/window";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import { useRef, useState } from "react";
import { DOCK_ITEMS } from "./dock-items";
import type { PlaygroundDemoProps } from "./playground-catalog";
import { PLAYGROUND_MENU } from "./playground-data";
import { PlaygroundFinder } from "./playground-finder";
import { DesktopScene } from "./scene";

export function DesktopDemo({ environment }: PlaygroundDemoProps) {
	return (
		<div className="pg-desktop-example">
			<DesktopScene
				component="desktop"
				settings={{
					...environment,
					active: true,
					dockAutoHide: false,
					dockPosition: "bottom",
					dockSize: 52,
					magnification: 1.65,
					wallpaper: "clouds",
				}}
			/>
		</div>
	);
}
export function DockDemo({ values, onEvent }: PlaygroundDemoProps) {
	const items = Array.from({ length: Number(values.count) }, (_, index) => ({
		...DOCK_ITEMS[index % DOCK_ITEMS.length],
		id: `app-${index}`,
		label:
			DOCK_ITEMS[index % DOCK_ITEMS.length].label +
			(index >= DOCK_ITEMS.length ? ` ${index + 1}` : ""),
	}));
	return (
		<>
			<div className="pg-wallpaper-caption">
				<strong>Your apps, at home.</strong>
				<span>Move across the Dock to magnify.</span>
			</div>
			<Dock
				adaptive={Boolean(values.adaptive)}
				autoHide={Boolean(values.autoHide)}
				glass={values.glass === "blur" ? "blur" : "refractive"}
				items={items}
				magnification={Number(values.magnification)}
				onActivate={(id) =>
					onEvent(`onActivate → ${items.find((item) => item.id === id)?.label}`)
				}
				position={
					values.position === "left" || values.position === "right"
						? values.position
						: "bottom"
				}
				size={Number(values.size)}
			/>
		</>
	);
}
export function ToolbarDemo({ values, onEvent }: PlaygroundDemoProps) {
	return (
		<section
			aria-label="Finder toolbar close-up"
			className="pg-finder-crop pg-finder-toolbar-crop"
		>
			<PlaygroundFinder
				focus="toolbar"
				onEvent={onEvent}
				sidebarWidth={165}
				style={{ height: 430, width: 760 }}
				title="Documents"
				toolbarDisabled={Boolean(values.disabled)}
			/>
		</section>
	);
}
export function WindowDemo(props: PlaygroundDemoProps) {
	const [visible, setVisible] = useState(true);
	const [zoomed, setZoomed] = useState(false);
	const action = (name: string) => {
		props.onEvent(name);
		setVisible(false);
	};
	if (!visible) {
		return (
			<MacButton onClick={() => setVisible(true)}>Reopen window</MacButton>
		);
	}
	return (
		<PlaygroundFinder
			active={Boolean(props.values.active)}
			onClose={() => action("onClose → window closed")}
			onEvent={props.onEvent}
			onMinimize={() => action("onMinimize → window minimized")}
			onZoom={() => {
				setZoomed(!zoomed);
				props.onEvent(`onZoom → ${!zoomed}`);
			}}
			showSidebar={Boolean(props.values.sidebar)}
			showToolbar={Boolean(props.values.toolbar)}
			sidebarWidth={Number(props.values.sidebarWidth)}
			style={{
				height: zoomed ? 480 : 450,
				maxWidth: "calc(100% - 40px)",
				width: zoomed ? 760 : 740,
			}}
			title={String(props.values.title)}
			zoomed={zoomed}
		/>
	);
}
export function TrafficDemo({ values, onEvent }: PlaygroundDemoProps) {
	return (
		<div className="pg-traffic-example">
			<TrafficLights
				active={Boolean(values.active)}
				onClose={() => onEvent("onClose")}
				onMinimize={() => onEvent("onMinimize")}
				onZoom={() => onEvent("onZoom")}
			/>
		</div>
	);
}
export function SidebarDemo({ onEvent }: PlaygroundDemoProps) {
	return (
		<section
			aria-label="Finder sidebar in a window corner"
			className="pg-finder-crop pg-finder-sidebar-crop"
		>
			<PlaygroundFinder
				focus="sidebar"
				onEvent={onEvent}
				sidebarWidth={165}
				style={{ height: 440, width: 760 }}
				title="Documents"
			/>
		</section>
	);
}
export function TabsDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [tabs, setTabs] = useState(["Documents", "Home", "Downloads"]);
	const [selected, setSelected] = useState("Documents");
	const nextTab = useRef(1);
	const close = (id: string) => {
		const remaining = tabs.filter((tab) => tab !== id);
		setTabs(remaining);
		if (selected === id) {
			setSelected(remaining[0] ?? "");
		}
		onEvent(`onClose → ${id}`);
	};
	return (
		<div className="pg-tabs-example">
			<MacTabs
				label="Document tabs"
				onAdd={() => {
					const id = `Untitled ${nextTab.current}`;
					nextTab.current += 1;
					setTabs([...tabs, id]);
					setSelected(id);
					onEvent(`onAdd → ${id}`);
				}}
				onClose={values.closable ? close : undefined}
				onReorder={
					values.reorderable
						? (ids) => {
								setTabs(ids);
								onEvent(`onReorder → ${ids.join(", ")}`);
							}
						: undefined
				}
				onValueChange={(id) => {
					setSelected(id);
					onEvent(`onValueChange → ${id}`);
				}}
				tabs={tabs.map((id) => ({
					content: (
						<div className="pg-tab-content">
							<WindowSymbol name="document" size={32} />
							<h3>{id}</h3>
							<p>Your content belongs here.</p>
						</div>
					),
					id,
					label: id,
				}))}
				value={selected}
				variant={values.variant === "segmented" ? "segmented" : "document"}
			/>
		</div>
	);
}
export function MenuBarDemo({ onEvent }: PlaygroundDemoProps) {
	return (
		<>
			<MenuBar
				menus={[
					{
						accessibleLabel: "Apple",
						id: "apple",
						items: [{ id: "about", label: "About This Mac" }],
						label: <AppleMark />,
					},
					{
						id: "app",
						items: PLAYGROUND_MENU,
						label: <strong>Playground</strong>,
					},
					{ id: "file", items: PLAYGROUND_MENU, label: "File" },
					{ id: "view", items: PLAYGROUND_MENU, label: "View" },
				]}
				onAction={(id) => onEvent(`onAction → ${id}`)}
				status={<span>Wed 21 Oct&nbsp; 9:41</span>}
			/>
			<div className="pg-wallpaper-caption">
				<strong>Everything in its place.</strong>
				<span>Open a menu, then try the arrow keys.</span>
			</div>
		</>
	);
}
export function MenuDemo({ entry, values, onEvent }: PlaygroundDemoProps) {
	const [preview, setPreview] = useState(true);
	const items = PLAYGROUND_MENU.map((item) =>
		item.id === "preview-pane" ? { ...item, checked: preview } : item
	);
	const action = (id: string) => {
		if (id === "preview-pane") {
			setPreview(!preview);
		}
		onEvent(`onAction → ${id}`);
	};
	if (entry.id === "context-menu") {
		return (
			<MacContextMenu
				items={items}
				onAction={action}
				trigger={
					<button className="pg-context-target" type="button">
						<WindowSymbol name="document" size={32} />
						<strong>Project brief.pdf</strong>
						<span>Right-click or press Shift+F10</span>
					</button>
				}
			/>
		);
	}
	return (
		<MacMenuButton
			defaultOpen={Boolean(values.defaultOpen)}
			items={items}
			onAction={action}
			trigger={<MacButton>{String(values.label)}</MacButton>}
		/>
	);
}
export function PopoverDemo({ values, onEvent }: PlaygroundDemoProps) {
	const side =
		values.side === "top" || values.side === "left" || values.side === "right"
			? values.side
			: "bottom";
	return (
		<MacPopover
			defaultOpen={Boolean(values.defaultOpen)}
			description="Choose how this folder is displayed."
			onOpenChange={(open) => onEvent(`onOpenChange → ${open}`)}
			positionerProps={{ side }}
			title={String(values.title)}
			trigger={<MacButton>View options</MacButton>}
		>
			<MacCheckbox
				label="Show hidden items"
				onCheckedChange={(value) => onEvent(`onCheckedChange → ${value}`)}
			/>
			<div className="pg-popover-actions">
				<MacPopoverClose>Done</MacPopoverClose>
			</div>
		</MacPopover>
	);
}

import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { type ComponentType, useLayoutEffect, useRef, useState } from "react";
import { DesktopDemo } from "./desktop-demo";
import { NotificationCenterDemo } from "./notification-demo";
import type { PlaygroundDemoProps } from "./playground-catalog";
import {
	FileIconsDemo,
	FilesDemo,
	GalleryDemo,
	SymbolsDemo,
	ThumbnailDemo,
} from "./playground-file-demos";
import { FORM_DEMO_IDS, FormDemo, ProgressDemo } from "./playground-form-demos";
import {
	AlertDemo,
	FileDialogDemo,
	InfoDemo,
	NewFolderDemo,
	QuickLookDemo,
} from "./playground-panel-demos";
import {
	DockDemo,
	MenuBarDemo,
	MenuDemo,
	PopoverDemo,
	SidebarDemo,
	TabsDemo,
	ToolbarDemo,
	TrafficDemo,
	WindowDemo,
} from "./playground-window-demos";
import { SettingsDemo } from "./settings-demo";

const DEMOS: Record<string, ComponentType<PlaygroundDemoProps>> = {
	...Object.fromEntries(FORM_DEMO_IDS.map((id) => [id, FormDemo])),
	alert: AlertDemo,
	calendar: FormDemo,
	"context-menu": MenuDemo,
	desktop: DesktopDemo,
	dock: DockDemo,
	"file-columns": FilesDemo,
	"file-dialog": FileDialogDemo,
	"file-gallery": GalleryDemo,
	"file-grid": FilesDemo,
	"file-icons": FileIconsDemo,
	"file-list": FilesDemo,
	"file-rename": FilesDemo,
	"file-thumbnail": ThumbnailDemo,
	finder: WindowDemo,
	"folder-list": FilesDemo,
	"get-info": InfoDemo,
	menu: MenuDemo,
	"menu-bar": MenuBarDemo,
	"new-folder": NewFolderDemo,
	"notification-center": NotificationCenterDemo,
	popover: PopoverDemo,
	progress: ProgressDemo,
	"quick-look": QuickLookDemo,
	settings: SettingsDemo,
	sidebar: SidebarDemo,
	spinner: ProgressDemo,
	symbols: SymbolsDemo,
	tabs: TabsDemo,
	toolbar: ToolbarDemo,
	"traffic-lights": TrafficDemo,
	window: WindowDemo,
};
const WALLPAPER = new Set([
	"dock",
	"finder",
	"settings",
	"window",
	"menu-bar",
	"traffic-lights",
	"toolbar",
	"notification-center",
]);

interface PreviewProps extends PlaygroundDemoProps {
	background: string;
	canvasWidth: number;
	revision: number;
	zoom: "fit" | "actual";
}
export function PlaygroundPreview({
	background,
	canvasWidth,
	revision,
	zoom,
	...props
}: PreviewProps) {
	const host = useRef<HTMLDivElement>(null);
	const [available, setAvailable] = useState(800);
	useLayoutEffect(() => {
		const node = host.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: Refs are nullable during mount and teardown.
		if (!node) {
			return;
		}

		const observer = new ResizeObserver(([entry]) =>
			setAvailable(entry.contentRect.width)
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);
	const scale =
		zoom === "actual"
			? 1
			: Math.min(1, Math.max(0.1, (available - 48) / canvasWidth));
	const Demo = DEMOS[props.entry.id];
	const automatic = WALLPAPER.has(props.entry.id) ? "wallpaper" : "neutral";
	const surface = background === "auto" ? automatic : background;
	return (
		<div className="pg-preview-host" ref={host}>
			<div className="pg-preview-scroll">
				<div
					className="pg-preview-sizer"
					style={{
						height: props.entry.height * scale,
						width: canvasWidth * scale,
					}}
				>
					<MacOSEnvironment
						{...props.environment}
						className={`pg-canvas pg-canvas-${props.entry.id} pg-surface-${surface}`}
						style={{
							height: props.entry.height,
							transform: `scale(${scale})`,
							width: canvasWidth,
						}}
					>
						<Demo {...props} key={revision} />
					</MacOSEnvironment>
				</div>
			</div>
			<div className="pg-canvas-caption">
				<span>
					{canvasWidth} × {props.entry.height}
				</span>
				<span>
					{Math.round(scale * 100)}% ·{" "}
					{props.environment.preset === "tahoe" ? "Tahoe" : "Sequoia"}{" "}
					{props.environment.appearance}
				</span>
			</div>
		</div>
	);
}

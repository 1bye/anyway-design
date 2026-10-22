import { type CSSProperties, type ReactNode, useId } from "react";

export interface TrafficLightsProps {
	active?: boolean;
	onClose?: () => void;
	onMinimize?: () => void;
	onZoom?: () => void;
}

export function TrafficLights({
	active = true,
	onClose,
	onMinimize,
	onZoom,
}: TrafficLightsProps) {
	return (
		<div className="mac-traffic-lights" data-active={active}>
			<button
				aria-label="Close window"
				className="mac-traffic-close"
				onClick={onClose}
				type="button"
			>
				<svg aria-hidden viewBox="0 0 12 12">
					<path d="m4 4 4 4m0-4L4 8" />
				</svg>
			</button>
			<button
				aria-label="Minimize window"
				className="mac-traffic-minimize"
				onClick={onMinimize}
				type="button"
			>
				<svg aria-hidden viewBox="0 0 12 12">
					<path d="M3 6h6" />
				</svg>
			</button>
			<button
				aria-label="Zoom window"
				className="mac-traffic-zoom"
				onClick={onZoom}
				type="button"
			>
				<svg aria-hidden viewBox="0 0 12 12">
					<path className="mac-zoom-symbol" d="M3 3h4L3 7zm6 6H5l4-4z" />
				</svg>
			</button>
		</div>
	);
}

export interface MacWindowProps extends TrafficLightsProps {
	children: ReactNode;
	footer?: ReactNode;
	/** Keep mounted and toggle open for an immediate open and short close fade. */
	open?: boolean;
	sidebar?: ReactNode;
	sidebarWidth?: number;
	style?: CSSProperties;
	title: string;
	toolbar?: ReactNode;
	toolbarLeading?: ReactNode;
	variant?: "standard" | "finder";
	zoomed?: boolean;
}

export function MacWindow({
	title,
	children,
	sidebar,
	sidebarWidth = 165,
	toolbar,
	toolbarLeading,
	footer,
	active = true,
	open = true,
	variant = "standard",
	zoomed = false,
	style,
	...actions
}: MacWindowProps) {
	const titleId = useId();
	return (
		<section
			aria-hidden={open ? undefined : true}
			aria-labelledby={titleId}
			className="mac-window"
			data-active={active}
			data-sidebar={Boolean(sidebar)}
			data-variant={variant}
			data-zoomed={zoomed}
			hidden={!open}
			inert={!open}
			style={
				{
					"--mac-window-sidebar-width": `${sidebarWidth}px`,
					...style,
				} as CSSProperties
			}
		>
			<header className="mac-window-titlebar" data-mac-drag-region>
				<div className="mac-window-controls">
					<TrafficLights active={active} {...actions} />
				</div>
				<div className="mac-window-heading">
					{toolbarLeading ? (
						<div className="mac-window-toolbar-leading">{toolbarLeading}</div>
					) : null}
					<h2 id={titleId}>{title}</h2>
					{toolbar ? <div className="mac-window-toolbar">{toolbar}</div> : null}
				</div>
			</header>
			<div className="mac-window-body">
				{sidebar ? (
					<aside className="mac-window-sidebar">{sidebar}</aside>
				) : null}
				<div className="mac-window-content">{children}</div>
			</div>
			{footer ? <footer className="mac-window-footer">{footer}</footer> : null}
		</section>
	);
}

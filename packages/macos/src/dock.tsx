import {
	type CSSProperties,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
} from "react";
import { DockBackdropFilter } from "./dock-backdrop-filter";
import { useDockAutoHide, useDockFit } from "./dock-behavior";
import { DockGlass, type DockGlassBackdrop } from "./dock-glass";
import { dockLayout } from "./dock-math";
export interface DockItem {
	badge?: string;
	icon: string | ReactNode;
	id: string;
	label: string;
	running?: boolean;
	separatorBefore?: boolean;
}
export interface DockProps {
	adaptive?: boolean;
	autoHide?: boolean;
	glass?: "refractive" | "blur";
	glassBackdrop?: DockGlassBackdrop;
	hideDelay?: number;
	items: DockItem[];
	magnification?: number;
	onActivate?: (id: string) => void;
	position?: "bottom" | "left" | "right";
	revealDelay?: number;
	size?: number;
}
export function Dock({
	adaptive = true,
	autoHide = false,
	glass = "refractive",
	glassBackdrop,
	items,
	size = 52,
	magnification = 1.65,
	position = "bottom",
	hideDelay = 500,
	revealDelay = 120,
	onActivate,
}: DockProps) {
	const root = useRef<HTMLElement | null>(null);
	const area = useRef<HTMLDivElement | null>(null);
	const reveal = useRef<HTMLButtonElement | null>(null);
	const dockId = useId();
	const vertical = position !== "bottom";
	useDockFit(root, area, {
		adaptive,
		itemCount: items.length,
		magnification,
		size,
		vertical,
	});
	useDockAutoHide(root, area, reveal, {
		autoHide: autoHide && items.length > 0,
		hideDelay,
		revealDelay,
	});
	const handleActivate = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const { id } = event.currentTarget.dataset;
			if (id) {
				onActivate?.(id);
			}
		},
		[onActivate]
	);
	useEffect(() => {
		const node = root.current;
		if (node === null) {
			return;
		}
		if (items.length === 0) {
			node.style.setProperty("--dock-growth", "0px");
			return;
		}
		const buttons = Array.from(
			node.querySelectorAll<HTMLButtonElement>(".mac-dock-item")
		);
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		let frame = 0;
		let pointer: number | null = null;
		const paint = () => {
			frame = 0;
			const noMotion =
				reducedMotion.matches || Boolean(node.closest("[data-reduce-motion]"));
			const bounds = node.getBoundingClientRect();
			const zoom = vertical
				? bounds.height / node.offsetHeight
				: bounds.width / node.offsetWidth;
			const centers = buttons.map((button) =>
				vertical
					? button.offsetTop + button.offsetHeight / 2
					: button.offsetLeft + button.offsetWidth / 2
			);
			const origin = vertical ? bounds.top : bounds.left;
			const localPointer =
				pointer === null || noMotion || !zoom
					? null
					: (pointer - origin) / zoom;
			const layout = dockLayout(centers, size, localPointer, magnification);
			for (const [index, button] of buttons.entries()) {
				button.style.setProperty("--dock-shift", `${layout.shifts[index]}px`);
				button.style.setProperty("--dock-scale", String(layout.scales[index]));
			}
			node.style.setProperty("--dock-growth", `${layout.growth}px`);
		};
		const schedule = () => {
			if (!frame) {
				frame = requestAnimationFrame(paint);
			}
		};
		const move = (event: PointerEvent) => {
			if (event.pointerType === "touch") {
				return;
			}
			pointer = vertical ? event.clientY : event.clientX;
			schedule();
		};
		const reset = () => {
			pointer = null;
			schedule();
		};
		node.addEventListener("pointermove", move);
		node.addEventListener("pointerleave", reset);
		node.addEventListener("pointercancel", reset);
		reducedMotion.addEventListener("change", schedule);
		const resize = new ResizeObserver(schedule);
		const container = area.current;
		if (container !== null) {
			resize.observe(container);
		}
		paint();
		return () => {
			cancelAnimationFrame(frame);
			resize.disconnect();
			node.removeEventListener("pointermove", move);
			node.removeEventListener("pointerleave", reset);
			node.removeEventListener("pointercancel", reset);
			reducedMotion.removeEventListener("change", schedule);
		};
	}, [items, magnification, size, vertical]);
	return (
		<div className="mac-dock-area" data-position={position} ref={area}>
			{autoHide && items.length > 0 ? (
				<button
					aria-controls={dockId}
					aria-expanded={false}
					aria-label="Show Dock"
					className="mac-dock-reveal"
					ref={reveal}
					type="button"
				/>
			) : null}
			<nav
				aria-label="Dock"
				className="mac-dock"
				data-auto-hide={autoHide || undefined}
				data-position={position}
				id={dockId}
				ref={root}
				style={{ "--dock-size": `${size}px` } as CSSProperties}
			>
				<div aria-hidden className="mac-dock-surface">
					{glassBackdrop && glass === "refractive" ? (
						<DockGlass backdrop={glassBackdrop} />
					) : null}
					{!glassBackdrop && glass === "refractive" ? (
						<DockBackdropFilter />
					) : null}
				</div>
				{items.map((item) => (
					<button
						aria-label={`Open ${item.label}`}
						className="mac-dock-item"
						data-id={item.id}
						data-running={item.running || undefined}
						data-separator={item.separatorBefore || undefined}
						key={item.id}
						onClick={handleActivate}
						type="button"
					>
						<span className="mac-dock-art">
							{typeof item.icon === "string" ? (
								<img
									alt=""
									draggable={false}
									height={128}
									src={item.icon}
									width={128}
								/>
							) : (
								item.icon
							)}
							{item.badge ? (
								<span className="mac-dock-badge">{item.badge}</span>
							) : null}
						</span>
						<span className="mac-dock-tooltip">{item.label}</span>
						<span aria-hidden className="mac-dock-dot" />
					</button>
				))}
			</nav>
		</div>
	);
}

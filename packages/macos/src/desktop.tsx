/** biome-ignore-all lint/performance/noJsxPropsBind: Window events bind stable caller-owned IDs. Pointer frames bypass React. */
import {
	type CSSProperties,
	type FocusEvent,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useDesktopInteraction } from "./desktop-interaction";
import {
	desktopBounds,
	desktopWindowOrder,
	fitDesktopFrame,
	type MacDesktopFrame,
	type MacDesktopFrames,
	type MacDesktopInsets,
	type MacDesktopResizeEdge,
	type MacDesktopWindow,
	resizeDesktopFrame,
} from "./desktop-model";

export type {
	MacDesktopFrame,
	MacDesktopFrames,
	MacDesktopInsets,
	MacDesktopResizeEdge,
	MacDesktopSize,
	MacDesktopWindow,
} from "./desktop-model";

export interface MacDesktopProps {
	activeWindowId?: string | null;
	children?: ReactNode;
	className?: string;
	defaultActiveWindowId?: string | null;
	frames?: MacDesktopFrames;
	insets?: MacDesktopInsets;
	label?: string;
	onActiveWindowChange?: (id: string | null) => void;
	onFrameChange?: (
		id: string,
		frame: MacDesktopFrame,
		reason: "move" | "resize"
	) => void;
	style?: CSSProperties;
	windows: readonly MacDesktopWindow[];
}
const EDGES: readonly MacDesktopResizeEdge[] = [
	"n",
	"e",
	"s",
	"w",
	"ne",
	"nw",
	"se",
	"sw",
];
const INTERACTIVE =
	"button, input, textarea, select, a, [contenteditable]:not([contenteditable='false']), [role='button'], [role='tab'], [role='slider'], [data-mac-no-drag]";
const EMPTY_INSETS: MacDesktopInsets = {};

function resizeEdge(target: Element): MacDesktopResizeEdge | undefined {
	const edge =
		target.closest<HTMLElement>("[data-resize-edge]")?.dataset.resizeEdge;
	return EDGES.find((value) => value === edge);
}

export function MacDesktop({
	windows,
	activeWindowId,
	defaultActiveWindowId,
	frames,
	onFrameChange,
	onActiveWindowChange,
	insets = EMPTY_INSETS,
	label = "Desktop",
	className = "",
	children,
	style,
}: MacDesktopProps) {
	const root = useRef<HTMLElement | null>(null);
	const elements = useRef(new Map<string, HTMLElement>());
	const lastFocus = useRef(new Map<string, HTMLElement>());
	const instructions = useId();
	const [size, setSize] = useState({ height: 0, width: 0 });
	const [internalFrames, setFrames] = useState<Record<string, MacDesktopFrame>>(
		{}
	);
	const [stack, setStack] = useState(() => ({
		activeId:
			defaultActiveWindowId === undefined
				? (windows.at(-1)?.id ?? null)
				: defaultActiveWindowId,
		order: windows.map((window) => window.id),
	}));
	const ids = windows.map((window) => window.id);
	const reconciled = desktopWindowOrder(ids, stack.order);
	const added = reconciled.filter((id) => !stack.order.includes(id));
	const requestedActive =
		activeWindowId === undefined
			? (added.at(-1) ?? stack.activeId)
			: activeWindowId;
	const validActive = requestedActive !== null && ids.includes(requestedActive);
	const activeId =
		validActive || requestedActive === null
			? requestedActive
			: (reconciled.at(-1) ?? null);
	const order = desktopWindowOrder(ids, reconciled, activeId);
	const bounds = desktopBounds(size, insets);
	useLayoutEffect(() => {
		const element = root.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: Refs are nullable during mount and teardown.
		if (!element) {
			return;
		}
		const measure = () =>
			setSize((current) =>
				current.width === element.clientWidth &&
				current.height === element.clientHeight
					? current
					: { height: element.clientHeight, width: element.clientWidth }
			);
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		measure();
		return () => observer.disconnect();
	}, []);
	const previousActive = useRef(activeId);
	const activeRef = useRef(activeId);
	activeRef.current = activeId;
	useLayoutEffect(() => {
		const available = new Set(windows.map((window) => window.id));
		for (const id of lastFocus.current.keys()) {
			if (!available.has(id)) {
				lastFocus.current.delete(id);
			}
		}
		const changed = previousActive.current !== activeId;
		const removed =
			previousActive.current && !elements.current.has(previousActive.current);
		previousActive.current = activeId;
		const frame = activeId ? elements.current.get(activeId) : null;
		if (changed && frame && !frame.contains(document.activeElement)) {
			const remembered = activeId ? lastFocus.current.get(activeId) : null;
			(remembered?.isConnected ? remembered : frame).focus({
				preventScroll: true,
			});
		} else if (removed && document.activeElement === document.body) {
			root.current?.focus({ preventScroll: true });
		}
		setStack((current) =>
			current.activeId === activeId &&
			current.order.length === order.length &&
			current.order.every((id, index) => id === order[index])
				? current
				: { activeId, order }
		);
	}, [activeId, windows, order]);
	const activate = (id: string | null) => {
		if (activeRef.current === id) {
			return;
		}
		activeRef.current = id;
		setStack((current) => ({
			activeId: id,
			order: desktopWindowOrder(ids, current.order, id),
		}));
		onActiveWindowChange?.(id);
	};
	const commit = (
		id: string,
		frame: MacDesktopFrame,
		reason: "move" | "resize"
	) => {
		setFrames((current) => ({ ...current, [id]: frame }));
		onFrameChange?.(id, frame, reason);
	};
	const interaction = useDesktopInteraction({
		bounds,
		onCommit: commit,
		root,
		windows,
	});
	const pointerDown = (
		event: PointerEvent<HTMLElement>,
		window: MacDesktopWindow,
		frame: MacDesktopFrame
	) => {
		if (event.button !== 0 || !(event.target instanceof Element)) {
			return;
		}
		const { target } = event;
		event.currentTarget.dataset.pointerFocus = "true";
		activate(window.id);
		const control = target.closest<HTMLElement>(INTERACTIVE);
		const dragRegion = target.closest("[data-mac-drag-region]");
		const edge = resizeEdge(target);
		if (!control || edge) {
			const previous = lastFocus.current.get(window.id);
			if (
				!dragRegion &&
				previous?.isConnected &&
				event.currentTarget.contains(previous)
			) {
				previous.focus({ preventScroll: true });
			} else {
				event.currentTarget.focus({ preventScroll: true });
			}
		} else if (window.id !== activeId) {
			control.focus({ preventScroll: true });
		}
		if (
			(edge && window.resizable !== false) ||
			(!edge && dragRegion && !control && window.draggable !== false)
		) {
			interaction.start(event, window, frame, edge);
		}
	};
	const focus = (event: FocusEvent<HTMLElement>, id: string) => {
		if (
			event.target instanceof HTMLElement &&
			event.currentTarget.contains(event.target) &&
			event.target !== event.currentTarget &&
			!event.target.closest("[data-resize-edge]")
		) {
			lastFocus.current.set(id, event.target);
		}
		if (id !== activeId) {
			activate(id);
		}
	};
	const keyDown = (
		event: KeyboardEvent<HTMLElement>,
		window: MacDesktopWindow,
		frame: MacDesktopFrame
	) => {
		delete event.currentTarget.dataset.pointerFocus;
		if (
			event.target !== event.currentTarget ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey
		) {
			return;
		}
		const offset = {
			ArrowDown: [0, 10],
			ArrowLeft: [-10, 0],
			ArrowRight: [10, 0],
			ArrowUp: [0, -10],
		}[event.key];
		if (
			!offset ||
			(event.shiftKey ? window.resizable === false : window.draggable === false)
		) {
			return;
		}
		event.preventDefault();
		const [dx, dy] = offset;
		const next = event.shiftKey
			? resizeDesktopFrame(frame, "se", dx, dy, bounds, window)
			: fitDesktopFrame(
					{ ...frame, x: frame.x + dx, y: frame.y + dy },
					bounds,
					window
				);
		commit(window.id, next, event.shiftKey ? "resize" : "move");
	};
	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: The desktop background deactivates windows and Escape cancels pointer operations.
		<section
			aria-label={label}
			className={`mac-desktop ${className}`}
			onKeyDown={(event) => {
				if (event.key === "Escape" && interaction.isInteracting()) {
					event.preventDefault();
					interaction.cancel();
				}
			}}
			onPointerDown={(event) => {
				if (event.target === event.currentTarget) {
					activate(null);
					event.currentTarget.focus({ preventScroll: true });
				}
			}}
			ref={root}
			style={style}
			tabIndex={-1}
		>
			<span className="mac-desktop-instructions" id={instructions}>
				Focus a window frame and use arrow keys to move it. Hold Shift with an
				arrow key to resize. Tab moves into its controls. Escape cancels a
				pointer operation.
			</span>
			<div className="mac-desktop-windows">
				{windows.map((window) => {
					const frame = fitDesktopFrame(
						frames?.[window.id] ??
							internalFrames[window.id] ??
							window.defaultFrame,
						bounds,
						window
					);
					const active = activeId === window.id;
					return (
						// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Nonmodal window frames support focus, pointer operations, and keyboard movement.
						<div
							aria-describedby={instructions}
							aria-label={`${window.title} window`}
							aria-modal={false}
							className="mac-desktop-window"
							data-active={active}
							data-window-id={window.id}
							key={window.id}
							onBlurCapture={(event) => {
								if (!event.currentTarget.contains(event.relatedTarget)) {
									delete event.currentTarget.dataset.pointerFocus;
								}
							}}
							onFocusCapture={(event) => focus(event, window.id)}
							onKeyDown={(event) => keyDown(event, window, frame)}
							onLostPointerCapture={interaction.cancel}
							onPointerCancel={interaction.cancel}
							onPointerDownCapture={(event) =>
								pointerDown(event, window, frame)
							}
							onPointerMove={interaction.move}
							onPointerUp={interaction.finish}
							ref={(element) => {
								if (element) {
									elements.current.set(window.id, element);
								} else {
									elements.current.delete(window.id);
								}
							}}
							role="dialog"
							style={{
								height: frame.height,
								transform: `translate(${frame.x}px, ${frame.y}px)`,
								width: frame.width,
								zIndex: order.indexOf(window.id) + 1,
							}}
							// biome-ignore lint/a11y/noNoninteractiveTabindex: The window frame is the keyboard target for moving and resizing.
							tabIndex={0}
						>
							{window.render({ active, frame })}
							{window.resizable === false
								? null
								: EDGES.map((edge) => (
										<button
											aria-label={`Resize ${window.title} from ${edge}`}
											className="mac-desktop-resize"
											data-resize-edge={edge}
											key={edge}
											tabIndex={-1}
											type="button"
										/>
									))}
						</div>
					);
				})}
			</div>
			{children}
		</section>
	);
}

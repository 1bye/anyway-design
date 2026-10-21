/** biome-ignore-all lint/suspicious/noUnnecessaryConditions: Pointer, drag, animation, and portal callbacks update nullable refs between events. */
import {
	type DragEvent,
	type MouseEvent,
	type PointerEvent,
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import type { MacFinderProps } from "./finder";
import type { FinderDragImage } from "./finder-drag-preview";
import { finderDragFiles, finderMove } from "./finder-drop";
import type { MacFinderFile } from "./finder-model";

interface DragOptions {
	canDrop: MacFinderProps["canDrop"];
	columnRootId: string;
	files: readonly MacFinderFile[];
	locationId: string;
	onImport: MacFinderProps["onImport"];
	onMove: MacFinderProps["onMove"];
	onSelect: (ids: string[], sourceId?: string) => void;
	onSpringOpen: (id: string) => void;
	restore: () => void;
	root: RefObject<HTMLDivElement | null>;
	selectedIds: readonly string[];
	springLoadDelay: number;
}
interface DragSession {
	files: MacFinderFile[];
	id: number;
	offsetX: number;
	offsetY: number;
	restore: () => void;
	scale: number;
	springOpened: boolean;
	started: boolean;
	x: number;
	y: number;
}
interface DropTarget {
	element: HTMLElement;
	id: string;
	spring: boolean;
}
const EDITOR =
	"input, textarea, select, [contenteditable='true'], [data-renaming='true']";

function dropTarget(
	root: HTMLElement,
	node: Element | null,
	options: DragOptions
): DropTarget | undefined {
	if (!(node && root.contains(node)) || node.closest(EDITOR)) {
		return;
	}
	const file = node.closest<HTMLElement>("[data-file-id]");
	if (file?.dataset.fileId) {
		return { element: file, id: file.dataset.fileId, spring: true };
	}
	const location = node.closest<HTMLElement>("[data-finder-location-id]");
	if (location?.dataset.finderLocationId) {
		return {
			element: location,
			id: location.dataset.finderLocationId,
			spring: true,
		};
	}
	const browser = node.closest<HTMLElement>(".mac-finder-browser");
	if (browser) {
		const column = node.closest<HTMLElement>("[data-column-index]");
		return {
			element: column ?? browser,
			id: column
				? (column.dataset.finderParentId ?? options.columnRootId)
				: options.locationId,
			spring: false,
		};
	}
}

const SCROLLABLE = /auto|scroll/;
function edgeStep(value: number, start: number, end: number) {
	if (value < start + 26) {
		return -8;
	}
	return value > end - 26 ? 8 : 0;
}
function dropDecision(config: DragOptions, current: DragSession, id: string) {
	const destination = config.files.find((file) => file.id === id);
	const move = finderMove(
		config.files,
		current.files.map((file) => file.id),
		id
	);
	if (
		destination?.kind !== "folder" ||
		destination.disabled ||
		destination.locked
	) {
		return { allowed: false, destination, reason: "Choose a writable folder." };
	}
	const enabled =
		current.id < 0
			? Boolean(config.onImport)
			: Boolean(config.onMove && move.ids.length);
	const allowed =
		enabled &&
		(config.canDrop?.({
			destination,
			external: current.id < 0,
			files: current.files,
		}) ??
			true);
	return { allowed, destination, reason: move.reason };
}
function scrollAtPoint(
	node: Element | null,
	root: HTMLElement,
	x: number,
	y: number
) {
	let element = node;
	while (element && root.contains(element)) {
		if (element instanceof HTMLElement) {
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			const dy = edgeStep(y, rect.top, rect.bottom);
			const dx = edgeStep(x, rect.left, rect.right);
			if (
				dy &&
				element.scrollHeight > element.clientHeight &&
				SCROLLABLE.test(style.overflowY)
			) {
				element.scrollTop += dy;
				return;
			}
			if (
				dx &&
				element.scrollWidth > element.clientWidth &&
				SCROLLABLE.test(style.overflowX)
			) {
				element.scrollLeft += dx;
				return;
			}
		}
		element = element.parentElement;
	}
}

export function useFinderDrag(options: DragOptions) {
	const latest = useRef(options);
	useLayoutEffect(() => {
		latest.current = options;
	});
	const session = useRef<DragSession | null>(null);
	const target = useRef<DropTarget | undefined>(undefined);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const frame = useRef(0);
	const position = useRef<HTMLDivElement>(null);
	const suppressClickUntil = useRef(0);
	const [image, setImage] = useState<FinderDragImage | null>(null);
	const [status, setStatus] = useState("");
	const lastStatus = useRef("");
	const announce = useCallback((message: string) => {
		if (lastStatus.current !== message) {
			lastStatus.current = message;
			setStatus(message);
		}
	}, []);
	const clearTarget = useCallback(() => {
		clearTimeout(timer.current);
		timer.current = undefined;
		target.current?.element.removeAttribute("data-finder-drop-target");
		target.current?.element.removeAttribute("data-finder-spring-loading");
		target.current = undefined;
	}, []);
	const finish = useCallback(
		(cancelled: boolean) => {
			if (session.current === null) {
				return;
			}
			const { current } = session;
			session.current = null;
			cancelAnimationFrame(frame.current);
			clearTarget();
			latest.current.root.current?.removeAttribute("data-finder-dragging");
			latest.current.root.current?.removeAttribute("data-finder-drop-allowed");
			if (current.started) {
				setImage(null);
				if (current.id >= 0) {
					suppressClickUntil.current = performance.now() + 100;
					const root = latest.current.root.current;
					if (root?.hasPointerCapture(current.id)) {
						root.releasePointerCapture(current.id);
					}
				}
				if (cancelled && current.springOpened) {
					current.restore();
				}
				const id = current.files[0]?.id;
				if (id) {
					frame.current = requestAnimationFrame(() => {
						const nodes =
							latest.current.root.current?.querySelectorAll<HTMLElement>(
								"button[data-file-id], tr[data-file-id]"
							) ?? [];
						const source = [...nodes].find(
							(node) => node.dataset.fileId === id
						);
						(
							source ??
							latest.current.root.current?.querySelector<HTMLElement>(
								".mac-finder-browser"
							)
						)?.focus({ preventScroll: true });
					});
				}
			}
		},
		[clearTarget]
	);
	useEffect(() => {
		const cancel = () => finish(true);
		const key = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape" && session.current?.started) {
				event.preventDefault();
				event.stopPropagation();
				finish(true);
				announce("Move cancelled.");
			}
		};
		window.addEventListener("blur", cancel);
		document.addEventListener("keydown", key, true);
		return () => {
			window.removeEventListener("blur", cancel);
			document.removeEventListener("keydown", key, true);
			cancelAnimationFrame(frame.current);
			clearTarget();
		};
	}, [announce, clearTarget, finish]);
	const springOpen = useCallback(
		(next: DropTarget) => {
			const { current } = session;
			if (!current?.started || target.current?.id !== next.id) {
				return;
			}
			const decision = dropDecision(latest.current, current, next.id);
			if (!decision.allowed) {
				clearTarget();
				return;
			}
			current.springOpened = true;
			clearTarget();
			latest.current.onSpringOpen(next.id);
			announce(
				`Opened ${decision.destination?.name ?? "folder"}. Continue dragging, or press Escape to cancel.`
			);
		},
		[announce, clearTarget]
	);
	const resolve = useCallback(
		(x: number, y: number) => {
			const { current } = session;
			const config = latest.current;
			const root = config.root.current;
			if (!(current?.started && root)) {
				return;
			}
			const node = document.elementFromPoint(x, y);
			const next = dropTarget(root, node, config);
			const { allowed, destination, reason } = dropDecision(
				config,
				current,
				next?.id ?? ""
			);
			position.current?.setAttribute("data-drop-allowed", String(allowed));
			root.setAttribute("data-finder-drop-allowed", String(allowed));
			if (!(allowed && next && destination)) {
				clearTarget();
				announce(reason ?? "This destination is unavailable.");
				return;
			}
			if (
				target.current?.element === next.element &&
				target.current.id === next.id
			) {
				return;
			}
			clearTarget();
			target.current = next;
			next.element.setAttribute("data-finder-drop-target", "true");
			announce(
				`${current.id < 0 ? "Import" : `Move ${current.files.length} ${current.files.length === 1 ? "item" : "items"}`} to ${destination.name}.`
			);
			if (next.spring && next.id !== config.locationId) {
				next.element.setAttribute("data-finder-spring-loading", "true");
				timer.current = setTimeout(
					() => springOpen(next),
					config.springLoadDelay
				);
			}
		},
		[announce, clearTarget, springOpen]
	);
	const tick = useCallback(
		function tickDrag() {
			const { current } = session;
			const root = latest.current.root.current;
			if (!(current?.started && root)) {
				return;
			}
			if (position.current) {
				position.current.style.transform = `translate3d(${current.x - current.offsetX}px, ${current.y - current.offsetY}px, 0) scale(${current.scale})`;
			}
			resolve(current.x, current.y);
			scrollAtPoint(
				document.elementFromPoint(current.x, current.y),
				root,
				current.x,
				current.y
			);
			frame.current = requestAnimationFrame(tickDrag);
		},
		[resolve]
	);
	const down = (event: PointerEvent<HTMLDivElement>) => {
		if (
			!options.onMove ||
			event.button !== 0 ||
			!event.isPrimary ||
			!(event.target instanceof Element) ||
			event.target.closest(EDITOR)
		) {
			return;
		}
		if (
			event.target.closest(
				".mac-file-list-disclosure, .mac-file-list-resize, .mac-file-column-resize"
			)
		) {
			return;
		}
		const source = event.target.closest<HTMLElement>("[data-file-id]");
		const id = source?.dataset.fileId;
		if (!(id && source && options.root.current?.contains(source))) {
			return;
		}
		const files = finderDragFiles(options.files, options.selectedIds, id);
		if (
			!files.length ||
			files.some((file) => file.disabled || file.locked || !file.parentId)
		) {
			return;
		}
		const art =
			source.querySelector<HTMLElement>(
				".mac-file-artwork, .mac-file-list-icon"
			) ?? source;
		const rect = art.getBoundingClientRect();
		const scale = rect.width / (art.offsetWidth || rect.width || 1);
		session.current = {
			files,
			id: event.pointerId,
			offsetX: Math.min(64 * scale, Math.max(0, event.clientX - rect.x)),
			offsetY: Math.min(64 * scale, Math.max(0, event.clientY - rect.y)),
			restore: options.restore,
			scale,
			springOpened: false,
			started: false,
			x: event.clientX,
			y: event.clientY,
		};
	};
	const move = (event: PointerEvent<HTMLDivElement>) => {
		const { current } = session;
		if (!current || current.id !== event.pointerId) {
			return;
		}
		if (!current.started) {
			if (
				Math.hypot(event.clientX - current.x, event.clientY - current.y) < 5
			) {
				return;
			}
			current.started = true;
			options.root.current?.setPointerCapture(event.pointerId);
			options.root.current?.setAttribute("data-finder-dragging", "true");
			options.onSelect(
				current.files.map((file) => file.id),
				current.files[0]?.id
			);
			const environment = options.root.current?.closest<HTMLElement>(".macos");
			setImage({
				accent: environment
					? getComputedStyle(environment).getPropertyValue("--mac-accent")
					: "#007aff",
				appearance: environment?.dataset.appearance ?? "light",
				files: current.files,
				size:
					event.target instanceof Element &&
					event.target.closest(".mac-file-list")
						? 32
						: 64,
			});
			frame.current = requestAnimationFrame(tick);
		}
		event.preventDefault();
		current.x = event.clientX;
		current.y = event.clientY;
	};
	const up = (event: PointerEvent<HTMLDivElement>) => {
		const { current } = session;
		if (!current || current.id !== event.pointerId) {
			return;
		}
		if (!current.started) {
			session.current = null;
			return;
		}
		resolve(event.clientX, event.clientY);
		const parent = target.current?.id;
		const result = finderMove(
			options.files,
			current.files.map((file) => file.id),
			parent ?? ""
		);
		if (!(parent && result.ids.length && options.onMove)) {
			finish(true);
			announce(result.reason ?? "Move cancelled.");
			return;
		}
		finish(false);
		options.onSelect(options.locationId === parent ? result.ids : []);
		options.onMove(result.ids, parent);
		announce(
			`Moved ${result.ids.length} ${result.ids.length === 1 ? "item" : "items"} to ${options.files.find((file) => file.id === parent)?.name ?? "folder"}.`
		);
	};
	const externalOver = (event: DragEvent<HTMLDivElement>) => {
		if (
			!event.dataTransfer.types.includes("Files") ||
			(session.current?.id !== undefined && session.current.id >= 0)
		) {
			return;
		}
		event.preventDefault();
		if (!session.current) {
			session.current = {
				files: [],
				id: -1,
				offsetX: 0,
				offsetY: 0,
				restore: options.restore,
				scale: 1,
				springOpened: false,
				started: true,
				x: event.clientX,
				y: event.clientY,
			};
			frame.current = requestAnimationFrame(tick);
		}
		session.current.x = event.clientX;
		session.current.y = event.clientY;
		resolve(event.clientX, event.clientY);
		event.dataTransfer.dropEffect = target.current ? "copy" : "none";
	};
	return {
		handlers: {
			onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
				if (performance.now() < suppressClickUntil.current) {
					event.preventDefault();
					event.stopPropagation();
				}
			},
			onDragLeave: (event: DragEvent<HTMLDivElement>) => {
				if (
					session.current?.id === -1 &&
					!options.root.current?.contains(
						document.elementFromPoint(event.clientX, event.clientY)
					)
				) {
					finish(true);
				}
			},
			onDragOver: externalOver,
			onDragStartCapture: (event: DragEvent<HTMLDivElement>) => {
				if (
					event.target instanceof Element &&
					event.target.closest("[data-file-id]")
				) {
					event.preventDefault();
				}
			},
			onDrop: (event: DragEvent<HTMLDivElement>) => {
				if (!event.dataTransfer.types.includes("Files")) {
					return;
				}
				event.preventDefault();
				event.stopPropagation();
				externalOver(event);
				const parent = target.current?.id;
				const directories = [...event.dataTransfer.items].some(
					(item) => item.webkitGetAsEntry?.()?.isDirectory
				);
				const files = [...event.dataTransfer.files];
				if (!parent || directories || !files.length || !options.onImport) {
					finish(true);
					announce(
						directories
							? "Drop individual files; folder imports are not supported."
							: "Import cancelled."
					);
					return;
				}
				finish(false);
				options.onImport(files, parent);
				announce(
					`Imported ${files.length} ${files.length === 1 ? "file" : "files"}.`
				);
			},
			onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
				if (event.target === event.currentTarget) {
					finish(true);
				}
			},
			onPointerCancel: () => finish(true),
			onPointerDownCapture: down,
			onPointerMoveCapture: move,
			onPointerUpCapture: up,
		},
		image,
		position,
		status,
	};
}

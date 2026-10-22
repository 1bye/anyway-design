/** biome-ignore-all lint/suspicious/noUnnecessaryConditions: Mutable gesture refs change between independent browser events. */
import {
	type PointerEvent as ReactPointerEvent,
	type RefObject,
	useEffect,
	useLayoutEffect,
	useRef,
} from "react";
import {
	fitDesktopFrame,
	type MacDesktopFrame,
	type MacDesktopResizeEdge,
	type MacDesktopWindow,
	resizeDesktopFrame,
} from "./desktop-model";

export function applyDesktopFrame(
	element: HTMLElement,
	frame: MacDesktopFrame
) {
	element.style.transform = `translate(${frame.x}px, ${frame.y}px)`;
	element.style.width = `${frame.width}px`;
	element.style.height = `${frame.height}px`;
}

interface Gesture {
	clientX: number;
	clientY: number;
	edge?: MacDesktopResizeEdge;
	element: HTMLElement;
	frame: MacDesktopFrame;
	original: MacDesktopFrame;
	pointerId: number;
	scaleX: number;
	scaleY: number;
	window: MacDesktopWindow;
}
export function useDesktopInteraction({
	root,
	bounds,
	onCommit,
	windows,
}: {
	windows: readonly MacDesktopWindow[];
	bounds: MacDesktopFrame;
	onCommit: (
		id: string,
		frame: MacDesktopFrame,
		reason: "move" | "resize"
	) => void;
	root: RefObject<HTMLElement | null>;
}) {
	const gesture = useRef<Gesture | null>(null);
	const animation = useRef<number | null>(null);
	const cancelFrame = () => {
		if (animation.current !== null) {
			cancelAnimationFrame(animation.current);
			animation.current = null;
		}
	};
	const release = () => {
		const { current } = gesture;
		gesture.current = null;
		cancelFrame();
		if (root.current) {
			delete root.current.dataset.interaction;
			root.current.style.removeProperty("--desktop-cursor");
		}
		if (current?.element.hasPointerCapture(current.pointerId)) {
			current.element.releasePointerCapture(current.pointerId);
		}
		return current;
	};
	const cancel = () => {
		const current = release();
		if (current) {
			applyDesktopFrame(
				current.element,
				fitDesktopFrame(current.original, bounds, current.window)
			);
		}
	};
	useLayoutEffect(() => {
		if (
			gesture.current &&
			!windows.some((window) => window.id === gesture.current?.window.id)
		) {
			cancel();
		}
	});
	useEffect(() => {
		const blur = () => {
			const { current } = gesture;
			if (!current) {
				return;
			}
			gesture.current = null;
			if (animation.current !== null) {
				cancelAnimationFrame(animation.current);
				animation.current = null;
			}
			applyDesktopFrame(current.element, current.original);
			const desktop = current.element.closest<HTMLElement>(".mac-desktop");
			if (desktop) {
				delete desktop.dataset.interaction;
				desktop.style.removeProperty("--desktop-cursor");
			}
			if (current.element.hasPointerCapture(current.pointerId)) {
				current.element.releasePointerCapture(current.pointerId);
			}
		};
		window.addEventListener("blur", blur);
		return () => {
			window.removeEventListener("blur", blur);
			blur();
		};
	}, []);
	const start = (
		event: ReactPointerEvent<HTMLElement>,
		window: MacDesktopWindow,
		frame: MacDesktopFrame,
		edge?: MacDesktopResizeEdge
	) => {
		if (
			gesture.current ||
			event.button !== 0 ||
			!event.isPrimary ||
			!root.current
		) {
			return;
		}
		event.preventDefault();
		const desktop = root.current;
		const rect = desktop.getBoundingClientRect();
		const element = event.currentTarget;
		gesture.current = {
			clientX: event.clientX,
			clientY: event.clientY,
			edge,
			element,
			frame,
			original: frame,
			pointerId: event.pointerId,
			scaleX: rect.width / desktop.offsetWidth || 1,
			scaleY: rect.height / desktop.offsetHeight || 1,
			window,
		};
		desktop.dataset.interaction = edge ? "resize" : "move";
		desktop.style.setProperty(
			"--desktop-cursor",
			edge ? `${edge}-resize` : "default"
		);
		element.setPointerCapture(event.pointerId);
	};
	const move = (event: ReactPointerEvent<HTMLElement>) => {
		const { current } = gesture;
		if (!current || current.pointerId !== event.pointerId) {
			return;
		}
		const dx = (event.clientX - current.clientX) / current.scaleX;
		const dy = (event.clientY - current.clientY) / current.scaleY;
		current.frame = current.edge
			? resizeDesktopFrame(
					current.original,
					current.edge,
					dx,
					dy,
					bounds,
					current.window
				)
			: fitDesktopFrame(
					{
						...current.original,
						x: current.original.x + dx,
						y: current.original.y + dy,
					},
					bounds,
					current.window
				);
		if (animation.current === null) {
			animation.current = requestAnimationFrame(() => {
				animation.current = null;
				const latest = gesture.current;
				if (latest) {
					applyDesktopFrame(latest.element, latest.frame);
				}
			});
		}
	};
	const finish = (event: ReactPointerEvent<HTMLElement>) => {
		if (gesture.current?.pointerId !== event.pointerId) {
			return;
		}
		move(event);
		const current = release();
		if (!current) {
			return;
		}
		applyDesktopFrame(current.element, current.frame);
		if (
			Object.keys(current.frame).some(
				(key) =>
					current.frame[key as keyof MacDesktopFrame] !==
					current.original[key as keyof MacDesktopFrame]
			)
		) {
			onCommit(
				current.window.id,
				current.frame,
				current.edge ? "resize" : "move"
			);
		}
	};
	return {
		cancel,
		finish,
		isInteracting: () => gesture.current !== null,
		move,
		start,
	};
}

import type { ReactNode } from "react";

export interface MacDesktopSize {
	height: number;
	width: number;
}
export interface MacDesktopFrame extends MacDesktopSize {
	x: number;
	y: number;
}
export interface MacDesktopInsets {
	bottom?: number;
	left?: number;
	right?: number;
	top?: number;
}
export type MacDesktopResizeEdge =
	| "n"
	| "s"
	| "e"
	| "w"
	| "ne"
	| "nw"
	| "se"
	| "sw";
export interface MacDesktopWindow {
	defaultFrame: MacDesktopFrame;
	draggable?: boolean;
	id: string;
	maxSize?: MacDesktopSize;
	minSize?: MacDesktopSize;
	render: (state: { active: boolean; frame: MacDesktopFrame }) => ReactNode;
	resizable?: boolean;
	title: string;
}
export type MacDesktopFrames = Readonly<Record<string, MacDesktopFrame>>;

const finite = (value: number, fallback: number) =>
	Number.isFinite(value) ? value : fallback;
const clamp = (value: number, minimum: number, maximum: number) =>
	Math.min(maximum, Math.max(minimum, value));

export function desktopBounds(
	size: MacDesktopSize,
	insets: MacDesktopInsets = {}
): MacDesktopFrame {
	const width = Math.max(0, finite(size.width, 0));
	const height = Math.max(0, finite(size.height, 0));
	const x = clamp(finite(insets.left ?? 0, 0), 0, Math.max(0, width - 1));
	const y = clamp(finite(insets.top ?? 0, 0), 0, Math.max(0, height - 1));
	return {
		height: Math.max(
			height > 0 ? 1 : 0,
			height - y - Math.max(0, finite(insets.bottom ?? 0, 0))
		),
		width: Math.max(
			width > 0 ? 1 : 0,
			width - x - Math.max(0, finite(insets.right ?? 0, 0))
		),
		x,
		y,
	};
}

function frameLimits(
	window: Pick<MacDesktopWindow, "minSize" | "maxSize">,
	bounds: MacDesktopFrame
) {
	const maxWidth = Math.max(
		1,
		Math.min(
			finite(
				window.maxSize?.width ?? Number.POSITIVE_INFINITY,
				Number.MAX_SAFE_INTEGER
			),
			bounds.width || Number.MAX_SAFE_INTEGER
		)
	);
	const maxHeight = Math.max(
		1,
		Math.min(
			finite(
				window.maxSize?.height ?? Number.POSITIVE_INFINITY,
				Number.MAX_SAFE_INTEGER
			),
			bounds.height || Number.MAX_SAFE_INTEGER
		)
	);
	return {
		maxHeight,
		maxWidth,
		minHeight: clamp(finite(window.minSize?.height ?? 160, 160), 1, maxHeight),
		minWidth: clamp(finite(window.minSize?.width ?? 260, 260), 1, maxWidth),
	};
}

export function fitDesktopFrame(
	frame: MacDesktopFrame,
	bounds: MacDesktopFrame,
	window: Pick<MacDesktopWindow, "minSize" | "maxSize"> = {}
): MacDesktopFrame {
	const { minWidth, minHeight, maxWidth, maxHeight } = frameLimits(
		window,
		bounds
	);
	const width = clamp(finite(frame.width, minWidth), minWidth, maxWidth);
	const height = clamp(finite(frame.height, minHeight), minHeight, maxHeight);
	return {
		height,
		width,
		x: clamp(
			finite(frame.x, bounds.x),
			bounds.x,
			bounds.width ? bounds.x + bounds.width - width : Number.MAX_SAFE_INTEGER
		),
		y: clamp(
			finite(frame.y, bounds.y),
			bounds.y,
			bounds.height
				? bounds.y + bounds.height - height
				: Number.MAX_SAFE_INTEGER
		),
	};
}

export function resizeDesktopFrame(
	original: MacDesktopFrame,
	edge: MacDesktopResizeEdge,
	dx: number,
	dy: number,
	bounds: MacDesktopFrame,
	window: Pick<MacDesktopWindow, "minSize" | "maxSize"> = {}
): MacDesktopFrame {
	const frame = fitDesktopFrame(original, bounds, window);
	const limits = frameLimits(window, bounds);
	const result = { ...frame };
	const right = frame.x + frame.width;
	const bottom = frame.y + frame.height;
	const offsetX = finite(dx, 0);
	const offsetY = finite(dy, 0);
	if (edge.includes("w")) {
		result.x = clamp(
			frame.x + offsetX,
			Math.max(bounds.x, right - limits.maxWidth),
			right - limits.minWidth
		);
		result.width = right - result.x;
	} else if (edge.includes("e")) {
		result.width = clamp(
			frame.width + offsetX,
			limits.minWidth,
			Math.min(
				limits.maxWidth,
				bounds.width ? bounds.x + bounds.width - frame.x : limits.maxWidth
			)
		);
	}
	if (edge.includes("n")) {
		result.y = clamp(
			frame.y + offsetY,
			Math.max(bounds.y, bottom - limits.maxHeight),
			bottom - limits.minHeight
		);
		result.height = bottom - result.y;
	} else if (edge.includes("s")) {
		result.height = clamp(
			frame.height + offsetY,
			limits.minHeight,
			Math.min(
				limits.maxHeight,
				bounds.height ? bounds.y + bounds.height - frame.y : limits.maxHeight
			)
		);
	}
	return result;
}

/** Keep DOM order stable; only this compact, deduplicated list controls z-index. */
export function desktopWindowOrder(
	ids: readonly string[],
	previous: readonly string[],
	activeId?: string | null
): string[] {
	const available = new Set(ids);
	const seen = new Set<string>();
	const order: string[] = [];
	for (const id of [...previous, ...ids]) {
		if (available.has(id) && !seen.has(id) && id !== activeId) {
			order.push(id);
			seen.add(id);
		}
	}
	if (activeId && available.has(activeId)) {
		order.push(activeId);
	}
	return order;
}

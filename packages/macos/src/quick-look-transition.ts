export interface QuickLookRect {
	height: number;
	width: number;
	x: number;
	y: number;
}

/** A missing or offscreen source uses the native panel's fade fallback. */
export function quickLookTransition(
	source: QuickLookRect | undefined,
	target: QuickLookRect,
	viewport: { width: number; height: number }
): { scale: number; x: number; y: number } | undefined {
	if (
		!(
			source &&
			[
				source.x,
				source.y,
				source.width,
				source.height,
				target.x,
				target.y,
				target.width,
				target.height,
				viewport.width,
				viewport.height,
			].every(Number.isFinite)
		) ||
		source.width <= 0 ||
		source.height <= 0 ||
		target.width <= 0 ||
		target.height <= 0 ||
		viewport.width <= 0 ||
		viewport.height <= 0 ||
		source.x + source.width <= 0 ||
		source.y + source.height <= 0 ||
		source.x >= viewport.width ||
		source.y >= viewport.height
	) {
		return;
	}
	const left = Math.max(0, source.x);
	const top = Math.max(0, source.y);
	const right = Math.min(viewport.width, source.x + source.width);
	const bottom = Math.min(viewport.height, source.y + source.height);
	return {
		scale: Math.min(
			1,
			(right - left) / target.width,
			(bottom - top) / target.height
		),
		x: (left + right) / 2 - (target.x + target.width / 2),
		y: (top + bottom) / 2 - (target.y + target.height / 2),
	};
}

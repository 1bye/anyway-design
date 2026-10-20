/** A compact cosine falloff keeps adjacent icons moving continuously. */
export function dockScale(
	distance: number,
	influence: number,
	magnification: number
): number {
	if (influence <= 0 || Math.abs(distance) >= influence) {
		return 1;
	}
	const weight = (1 + Math.cos((Math.PI * distance) / influence)) / 2;
	return 1 + (Math.max(1, magnification) - 1) * weight;
}

// shortcut: approximate the filmed Tahoe wave; re-fit with a direct screen capture.
const INFLUENCE_IN_ICON_SIZES = 4;
const FOCUS_SEARCH_STEPS = 18;

/** Reserve the whole wave, so fitting never changes while the pointer moves. */
export function dockFitScale({
	availableLength,
	availableDepth,
	length,
	depth,
	size,
	itemCount,
	magnification,
}: {
	availableLength: number;
	availableDepth: number;
	length: number;
	depth: number;
	size: number;
	itemCount: number;
	magnification: number;
}): number {
	const extra = size * Math.max(0, magnification - 1);
	// A packed cosine wave sums to four icon widths; gaps only reduce it.
	const growth = extra * Math.min(itemCount, INFLUENCE_IN_ICON_SIZES);
	if (length <= 0 || depth <= 0) {
		return 1;
	}
	return Math.max(
		0,
		Math.min(
			1,
			availableLength / (length + growth),
			availableDepth / (depth + extra)
		)
	);
}

/** Where a resting coordinate lands after its surrounding icons have expanded. */
function expandedFocus(
	centers: readonly number[],
	size: number,
	focus: number,
	influence: number,
	magnification: number
): number {
	let position = focus;
	for (const center of centers) {
		const growth =
			size * (dockScale(center - focus, influence, magnification) - 1);
		const fraction = Math.min(1, Math.max(0, (focus - center) / size + 0.5));
		position += growth * (fraction - 0.5);
	}
	return position;
}

/**
 * Resolve the pointer through the expanded layout, then distribute growth.
 * Reading animated DOM positions instead would feed each frame back into itself.
 */
export function dockLayout(
	centers: readonly number[],
	size: number,
	pointer: number | null,
	magnification: number
): { scales: number[]; shifts: number[]; growth: number } {
	const [first] = centers;
	const last = centers.at(-1);
	if (
		first === undefined ||
		last === undefined ||
		pointer === null ||
		!Number.isFinite(pointer) ||
		!Number.isFinite(size) ||
		size <= 0 ||
		!Number.isFinite(magnification) ||
		magnification <= 1
	) {
		return {
			growth: 0,
			scales: centers.map(() => 1),
			shifts: centers.map(() => 0),
		};
	}
	const influence = size * INFLUENCE_IN_ICON_SIZES;
	// The end icon holds the crest until the pointer leaves the expanded Dock.
	let low = first;
	let high = last;
	for (let step = 0; step < FOCUS_SEARCH_STEPS; step += 1) {
		const focus = (low + high) / 2;
		if (
			expandedFocus(centers, size, focus, influence, magnification) < pointer
		) {
			low = focus;
		} else {
			high = focus;
		}
	}
	const focus = (low + high) / 2;
	const scales = centers.map((center) =>
		dockScale(center - focus, influence, magnification)
	);
	const amounts = scales.map((scale) => size * (scale - 1));
	const growth = amounts.reduce((sum, amount) => sum + amount, 0);
	let preceding = 0;
	const shifts = amounts.map((amount) => {
		const shift = preceding + amount / 2 - growth / 2;
		preceding += amount;
		return shift;
	});
	return { growth, scales, shifts };
}

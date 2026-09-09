export const PALETTE_ROWS = 3;
export const PALETTE_ITEM_SIZE = 44;
export const PALETTE_GAP = 4;

export function paletteColumns(width: number): number {
	return Math.max(
		1,
		Math.floor((width + PALETTE_GAP) / (PALETTE_ITEM_SIZE + PALETTE_GAP))
	);
}

const SCROLL_PAGE_DISTANCE = 120;

// Page by distance, preserving the remainder so a continuous gesture keeps moving.
export function createPageScroll() {
	let accumulated = 0;
	let lastTime = Number.NEGATIVE_INFINITY;
	return (
		event: Pick<
			WheelEvent,
			"deltaX" | "deltaY" | "deltaMode" | "timeStamp" | "ctrlKey"
		>
	): number => {
		if (event.ctrlKey) {
			return 0;
		}
		const delta =
			Math.abs(event.deltaY) >= Math.abs(event.deltaX)
				? event.deltaY
				: event.deltaX;
		if (event.timeStamp - lastTime > 160 || delta * accumulated < 0) {
			accumulated = 0;
		}
		lastTime = event.timeStamp;
		let unit = 1;
		if (event.deltaMode === 1) {
			unit = SCROLL_PAGE_DISTANCE / 3;
		} else if (event.deltaMode === 2) {
			unit = SCROLL_PAGE_DISTANCE;
		}
		accumulated += delta * unit;
		const pages = Math.trunc(accumulated / SCROLL_PAGE_DISTANCE);
		if (!pages) {
			return 0;
		}
		accumulated -= pages * SCROLL_PAGE_DISTANCE;
		return pages;
	};
}

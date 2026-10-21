export function sliderTickPositions(count = 0): number[] {
	if (!Number.isFinite(count) || count < 2) {
		return [];
	}
	const length = Math.min(101, Math.trunc(count));
	return Array.from({ length }, (_, index) => index / (length - 1));
}

export function sliderTickCovered(
	position: number,
	value: number,
	min = 0,
	max = 100
): boolean {
	if (!Number.isFinite(value) || max <= min) {
		return false;
	}
	const fraction = (Math.min(max, Math.max(min, value)) - min) / (max - min);
	// Decimal steps may introduce rounding error; don't hide adjacent marks.
	return Math.abs(fraction - position) < 1e-9;
}

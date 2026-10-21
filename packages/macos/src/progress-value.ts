export function progressValue(value: number | null | undefined, max = 100) {
	const limit = Number.isFinite(max) && max > 0 ? max : 100;
	const indeterminate = value === null || value === undefined;
	const finite =
		typeof value === "number" && Number.isFinite(value) ? value : 0;
	const current = Math.min(limit, Math.max(0, finite));
	return {
		indeterminate,
		max: limit,
		percent: (current / limit) * 100,
		value: current,
	};
}

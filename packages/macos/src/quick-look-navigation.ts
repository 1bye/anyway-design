export interface QuickLookIdentity {
	disabled?: boolean;
	id: string;
}

/** Resolve a removed selection and clamp navigation at enabled endpoints. */
export function quickLookNeighbor<T extends QuickLookIdentity>(
	items: readonly T[],
	id: string,
	direction: -1 | 0 | 1
): T | undefined {
	const enabled = items.filter((item) => !item.disabled);
	const index = enabled.findIndex((item) => item.id === id);
	if (index < 0) {
		return enabled[0];
	}
	return enabled[Math.max(0, Math.min(enabled.length - 1, index + direction))];
}

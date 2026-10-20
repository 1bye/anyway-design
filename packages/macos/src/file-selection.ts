export function selectFileIds(
	ids: readonly string[],
	selected: readonly string[],
	target: string,
	options: { anchor?: string; extend?: boolean; toggle?: boolean } = {}
): string[] {
	if (!ids.includes(target)) {
		return [...selected];
	}
	if (options.extend) {
		const anchor = ids.indexOf(options.anchor ?? target);
		const end = ids.indexOf(target);
		const start = anchor < 0 ? end : anchor;
		const range = ids.slice(Math.min(start, end), Math.max(start, end) + 1);
		return options.toggle
			? ids.filter((id) => selected.includes(id) || range.includes(id))
			: range;
	}
	if (options.toggle) {
		return ids.filter((id) =>
			id === target ? !selected.includes(id) : selected.includes(id)
		);
	}
	return [target];
}

export function fileGridNeighbor(
	positions: readonly { id: string; x: number; y: number }[],
	id: string,
	direction: "up" | "down"
): string | undefined {
	const current = positions.find((position) => position.id === id);
	if (!current) {
		return;
	}
	const candidates = positions.filter((position) =>
		direction === "down"
			? position.y > current.y + 1
			: position.y < current.y - 1
	);
	const row = candidates.reduce(
		(nearest, position) => Math.min(nearest, Math.abs(position.y - current.y)),
		Number.POSITIVE_INFINITY
	);
	return candidates
		.filter((position) => Math.abs(Math.abs(position.y - current.y) - row) < 1)
		.sort((a, b) => Math.abs(a.x - current.x) - Math.abs(b.x - current.x))[0]
		?.id;
}

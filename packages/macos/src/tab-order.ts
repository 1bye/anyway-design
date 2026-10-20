interface TabIdentity {
	disabled?: boolean;
	id: string;
}

/** Prefer the next enabled tab, then the closest enabled tab to the left. */
export function tabAfterClose(
	tabs: readonly TabIdentity[],
	id: string
): string {
	const index = tabs.findIndex((tab) => tab.id === id);
	if (index < 0) {
		return "";
	}
	return (
		tabs.slice(index + 1).find((tab) => !tab.disabled)?.id ??
		tabs
			.slice(0, index)
			.reverse()
			.find((tab) => !tab.disabled)?.id ??
		""
	);
}

export function reorderTabs(
	ids: readonly string[],
	id: string,
	target: string,
	after: boolean
): string[] {
	if (id === target || !ids.includes(id) || !ids.includes(target)) {
		return [...ids];
	}
	const result = ids.filter((entry) => entry !== id);
	result.splice(result.indexOf(target) + Number(after), 0, id);
	return result;
}

export interface TabSlot {
	id: string;
	left: number;
	width: number;
}

/** Preview a reorder while keeping the dragged tab directly under the pointer. */
export function tabDragLayout(
	slots: readonly TabSlot[],
	id: string,
	delta: number
) {
	const dragged = slots.find((slot) => slot.id === id);
	const [first] = slots;
	const last = slots.at(-1);
	if (!(dragged && first && last)) {
		return {
			offsets: new Map<string, number>(),
			order: slots.map((slot) => slot.id),
		};
	}
	const left = Math.max(
		first.left,
		Math.min(last.left + last.width - dragged.width, dragged.left + delta)
	);
	const center = left + dragged.width / 2;
	const remaining = slots.filter((slot) => slot.id !== id);
	const index = remaining.filter(
		(slot) => center > slot.left + slot.width / 2
	).length;
	const order = [...remaining];
	order.splice(index, 0, dragged);
	const offsets = new Map<string, number>();
	let nextLeft = first.left;
	for (const slot of order) {
		offsets.set(
			slot.id,
			slot.id === id ? left - slot.left : nextLeft - slot.left
		);
		nextLeft += slot.width;
	}
	return { offsets, order: order.map((slot) => slot.id) };
}

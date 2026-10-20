import type { KeyboardEvent } from "react";

export function isAdditiveSelection(event: {
	metaKey: boolean;
	ctrlKey: boolean;
}) {
	return event.metaKey || event.ctrlKey;
}

export function focusFileTarget(target: HTMLElement | null | undefined) {
	target?.focus({ preventScroll: true });
	target?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

type PreviewKey = Pick<
	KeyboardEvent,
	| "key"
	| "altKey"
	| "ctrlKey"
	| "metaKey"
	| "shiftKey"
	| "repeat"
	| "preventDefault"
>;

export function requestFilePreview(
	event: PreviewKey,
	id: string,
	onQuickLook?: (id: string) => void
): boolean {
	if (
		!onQuickLook ||
		event.key !== " " ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	) {
		return false;
	}
	event.preventDefault();
	if (!event.repeat) {
		onQuickLook(id);
	}
	return true;
}

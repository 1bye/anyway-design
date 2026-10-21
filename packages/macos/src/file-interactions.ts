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

export function requestFileOpen(
	event: PreviewKey,
	id: string,
	onOpen?: (id: string) => void
): boolean {
	if (
		event.key !== "Enter" &&
		!(
			(event.metaKey || event.ctrlKey) &&
			!event.altKey &&
			!event.shiftKey &&
			event.key.toLowerCase() === "o"
		)
	) {
		return false;
	}
	event.preventDefault();
	if (!event.repeat) {
		onOpen?.(id);
	}
	return true;
}

export function requestFileInfo(
	event: PreviewKey & {
		defaultPrevented?: boolean;
		nativeEvent?: { isComposing?: boolean };
	},
	id: string,
	onGetInfo?: (id: string) => void
): boolean {
	if (
		!onGetInfo ||
		event.defaultPrevented ||
		event.nativeEvent?.isComposing ||
		event.key.toLowerCase() !== "i" ||
		!(event.metaKey || event.ctrlKey) ||
		event.altKey ||
		event.shiftKey
	) {
		return false;
	}
	event.preventDefault();
	if (!event.repeat) {
		onGetInfo(id);
	}
	return true;
}

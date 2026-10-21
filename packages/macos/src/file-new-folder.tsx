import type { KeyboardEvent } from "react";
import { fileRenameError } from "./file-rename";

interface NamedItem {
	id?: string;
	name: string;
}

export function fileNewFolderError(
	name: string,
	items: readonly NamedItem[],
	excludeId?: string
): string | undefined {
	if (!name.trim()) {
		return "Enter a folder name.";
	}
	const invalid = fileRenameError(name);
	if (invalid) {
		return invalid;
	}
	const normalized = name.normalize("NFC").toLocaleLowerCase();
	if (
		items.some(
			(item) =>
				(excludeId === undefined || item.id !== excludeId) &&
				item.name.normalize("NFC").toLocaleLowerCase() === normalized
		)
	) {
		return "This name is already taken.";
	}
}

export function fileNewFolderName(items: readonly NamedItem[]): string {
	const names = new Set(
		items.map((item) => item.name.normalize("NFC").toLocaleLowerCase())
	);
	let name = "untitled folder";
	let suffix = 2;
	while (names.has(name)) {
		name = `untitled folder ${suffix}`;
		suffix += 1;
	}
	return name;
}

export function isNewFolderKey(
	event: Pick<
		KeyboardEvent,
		"key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"
	>
): boolean {
	return (
		(event.metaKey || event.ctrlKey) &&
		event.shiftKey &&
		!event.altKey &&
		event.key.toLocaleLowerCase() === "n"
	);
}

export function requestNewFolder(
	event: KeyboardEvent,
	create?: () => void
): boolean {
	if (
		!create ||
		event.defaultPrevented ||
		event.nativeEvent.isComposing ||
		!isNewFolderKey(event)
	) {
		return false;
	}
	event.preventDefault();
	event.stopPropagation();
	if (!event.repeat) {
		create();
	}
	return true;
}

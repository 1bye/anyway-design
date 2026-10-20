import type { KeyboardEvent } from "react";

export interface MacFileRenameProps {
	onRename?: (id: string, name: string) => void;
	onRenamingChange?: (id: string | null) => void;
	renamingId?: string | null;
	validateRename?: (id: string, name: string) => string | undefined;
}

// Finder selects the basename, but folders and dotfiles have no extension to spare.
export function fileRenameSelection(name: string, folder = false): number {
	const dot = name.lastIndexOf(".");
	return !(folder || name.startsWith(".")) && dot > 0 && dot < name.length - 1
		? dot
		: name.length;
}

// biome-ignore lint/suspicious/noControlCharactersInRegex: Reject invisible control characters in caller-supplied filenames.
const INVALID_NAME = /[/:\u0000-\u001f\u007f]/;
export function fileRenameError(name: string): string | undefined {
	if (!name.trim() || name === "." || name === "..") {
		return "Enter a file name.";
	}
	if (INVALID_NAME.test(name)) {
		return "Names cannot contain a colon, slash, or control character.";
	}
}

export function isRenameKey(
	event: Pick<
		KeyboardEvent,
		"key" | "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
	>
): boolean {
	return (
		event.key === "Enter" &&
		!(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
	);
}

import type { MacFileDialogDirectory } from "@1bye/macos/file-dialog";
import { fileNewFolderError } from "@1bye/macos/file-new-folder";

export function createPanelFolder(
	directories: readonly MacFileDialogDirectory[],
	parentId: string,
	name: string,
	id: string
): MacFileDialogDirectory[] {
	const parent = directories.find((directory) => directory.id === parentId);
	if (!parent) {
		throw new Error("This folder is no longer available.");
	}
	const error = fileNewFolderError(name, parent.items);
	if (error) {
		throw new Error(error);
	}
	return [
		...directories.map((directory) =>
			directory.id === parentId
				? {
						...directory,
						items: [
							...directory.items,
							{ id, kind: "folder" as const, modifiedLabel: "Just now", name },
						],
					}
				: directory
		),
		{ id, items: [], name, parentId },
	];
}

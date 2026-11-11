import type { MacFileListItem } from "@1bye/macos/file-list";
import {
	fileNewFolderError,
	fileNewFolderName,
} from "@1bye/macos/file-new-folder";
import { useCallback, useState } from "react";
import { renameFolderFile } from "./folder-list-reference-data";

function folderChildren(
	items: readonly MacFileListItem[],
	parentId?: string
): readonly MacFileListItem[] | undefined {
	if (parentId === undefined) {
		return items;
	}
	for (const item of items) {
		if (item.kind !== "folder" || item.disabled) {
			continue;
		}
		if (item.id === parentId) {
			return item.children ?? [];
		}
		const nested = folderChildren(item.children ?? [], parentId);
		if (nested) {
			return nested;
		}
	}
}

function insertFolder(
	items: readonly MacFileListItem[],
	parentId: string | undefined,
	folder: MacFileListItem
): MacFileListItem[] {
	if (parentId === undefined) {
		return [...items, folder];
	}
	return items.map((item) => {
		if (item.id === parentId) {
			return { ...item, children: [...(item.children ?? []), folder] };
		}
		return item.children
			? { ...item, children: insertFolder(item.children, parentId, folder) }
			: item;
	});
}

function siblings(
	items: readonly MacFileListItem[],
	id: string
): readonly MacFileListItem[] {
	if (items.some((item) => item.id === id)) {
		return items;
	}
	for (const item of items) {
		const nested = siblings(item.children ?? [], id);
		if (nested.length) {
			return nested;
		}
	}
	return [];
}

export function useFinderFolderCreation(
	items: readonly MacFileListItem[],
	onItemsChange: (items: MacFileListItem[]) => void,
	onSelectionChange: (ids: string[]) => void
) {
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const create = useCallback(
		(parentId?: string) => {
			const children = folderChildren(items, parentId);
			if (!children) {
				return;
			}
			const folder: MacFileListItem = {
				children: [],
				id: crypto.randomUUID(),
				kind: "folder",
				modifiedLabel: "Just now",
				name: fileNewFolderName(children),
			};
			onItemsChange(insertFolder(items, parentId, folder));
			onSelectionChange([folder.id]);
			setRenamingId(folder.id);
		},
		[items, onItemsChange, onSelectionChange]
	);
	const rename = useCallback(
		(id: string, name: string) => {
			onItemsChange(renameFolderFile(items, id, name));
		},
		[items, onItemsChange]
	);
	const validate = useCallback(
		(id: string, name: string) =>
			fileNewFolderError(name, siblings(items, id), id),
		[items]
	);
	return { create, rename, renamingId, setRenamingId, validate };
}

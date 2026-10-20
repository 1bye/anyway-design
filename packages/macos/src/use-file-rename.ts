import { type KeyboardEvent, useCallback, useState } from "react";
import { isRenameKey, type MacFileRenameProps } from "./file-rename";
import type { MacFile } from "./files";

export function useFileRename({
	items,
	onRename,
	onRenamingChange,
	renamingId,
	selectedIds,
	onSelectionChange,
}: MacFileRenameProps & {
	items: readonly MacFile[];
	selectedIds: readonly string[];
	onSelectionChange: (ids: string[]) => void;
}) {
	const [internalId, setInternalId] = useState<string | null>(null);
	const requestedId = renamingId === undefined ? internalId : renamingId;
	const id =
		onRename && items.some((file) => file.id === requestedId && !file.disabled)
			? requestedId
			: null;
	const change = useCallback(
		(next: string | null) => {
			if (renamingId === undefined) {
				setInternalId(next);
			}
			onRenamingChange?.(next);
		},
		[renamingId, onRenamingChange]
	);
	const end = useCallback(() => change(null), [change]);
	const key = useCallback(
		(event: KeyboardEvent, fileId: string) => {
			if (!(onRename && isRenameKey(event))) {
				return false;
			}
			event.preventDefault();
			if (!event.repeat && selectedIds.length < 2) {
				onSelectionChange([fileId]);
				change(fileId);
			}
			return true;
		},
		[onRename, selectedIds.length, onSelectionChange, change]
	);
	return { end, id, key };
}

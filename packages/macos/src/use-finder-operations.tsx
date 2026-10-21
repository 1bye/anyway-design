/** biome-ignore-all lint/suspicious/noUnnecessaryConditions: Event callbacks update clipboard and history refs between renders. */
import { useLayoutEffect, useRef, useState } from "react";
import type { MacFileInfoChanges } from "./file-info";
import { fileNewFolderError } from "./file-new-folder";
import type { MacFinderProps } from "./finder";
import type { MacFinderActionContext } from "./finder-actions";
import { finderMove } from "./finder-drop";
import {
	type FinderHistoryEntry,
	finderApplyHistory,
	finderHistoryEntry,
} from "./finder-history";
import type { MacFinderFile } from "./finder-model";
import {
	type FinderOperation,
	type FinderOperationResult,
	finderClone,
	finderMoveOperation,
	finderOperationLabel,
	finderSubtree,
	finderTrash,
	type MacFinderChange,
} from "./finder-operations";
import type { MacMenuEntry } from "./menu";
import { WindowSymbol } from "./window-symbol";

interface OperationOptions {
	canDrop: MacFinderProps["canDrop"];
	files: readonly MacFinderFile[];
	onFilesChange: MacFinderProps["onFilesChange"];
	onResult: (change: MacFinderChange, files: readonly MacFinderFile[]) => void;
	rootId: string;
}
const HISTORY_LIMIT = 100;
export function useFinderOperations({
	files,
	onFilesChange,
	onResult,
	canDrop,
	rootId,
}: OperationOptions) {
	const data = useRef(files);
	useLayoutEffect(() => {
		data.current = files;
	}, [files]);
	const history = useRef<{
		undo: FinderHistoryEntry[];
		redo: FinderHistoryEntry[];
	}>({ redo: [], undo: [] });
	const clipboard = useRef<string[]>([]);
	const [, refresh] = useState(0);
	const [status, setStatus] = useState("");
	const notify = () => refresh((value) => value + 1);
	const emit = (
		operation: FinderOperation,
		action: MacFinderChange["action"] = operation.operation
	) => {
		const change: MacFinderChange = {
			action,
			ids: operation.ids,
			label: operation.label,
			operation: operation.operation,
		};
		data.current = operation.files;
		onFilesChange?.(operation.files, change);
		onResult(change, operation.files);
		setStatus(
			`${({ redo: "Redid", undo: "Undid" } as Record<string, string>)[action] ?? "Completed"} ${operation.label}.`
		);
		notify();
	};
	const publish = (result: FinderOperationResult) => {
		if (!onFilesChange) {
			return;
		}
		if (!result.value) {
			setStatus(result.error ?? "This operation is unavailable.");
			return;
		}
		const entry = finderHistoryEntry(data.current, result.value);
		if (!entry.patches.length) {
			return;
		}
		history.current.undo = [
			...history.current.undo.slice(-(HISTORY_LIMIT - 1)),
			entry,
		];
		history.current.redo = [];
		emit(result.value);
	};
	const step = (redo: boolean) => {
		if (!onFilesChange) {
			return;
		}
		const source = redo ? history.current.redo : history.current.undo;
		const entry = source.at(-1);
		if (!entry) {
			return;
		}
		const next = finderApplyHistory(data.current, entry, redo);
		if (!next) {
			setStatus(
				"Cannot change these items because newer file changes conflict with this operation."
			);
			return;
		}
		source.pop();
		(redo ? history.current.undo : history.current.redo).push(entry);
		emit({ ...entry.change, files: next }, redo ? "redo" : "undo");
	};
	const targetAllowed = (ids: readonly string[], parentId: string) => {
		const destination = data.current.find((file) => file.id === parentId);
		const tree = finderSubtree(data.current, ids);
		return Boolean(
			destination?.kind === "folder" &&
				!destination.locked &&
				!destination.disabled &&
				tree &&
				!tree.files.some((file) => file.id === rootId) &&
				(canDrop?.({ destination, external: false, files: tree.roots }) ?? true)
		);
	};
	const copyAllowed = (ids: readonly string[]) => {
		const tree = finderSubtree(data.current, ids);
		return Boolean(tree && !tree.files.some((file) => file.id === rootId));
	};
	const pasteAllowed = (parentId: string) => {
		const tree = finderSubtree(data.current, clipboard.current);
		return Boolean(
			onFilesChange &&
				tree &&
				targetAllowed(clipboard.current, parentId) &&
				!tree.files.some((file) => file.id === parentId)
		);
	};
	const actions = (context: MacFinderActionContext): MacMenuEntry[] => {
		const ids = context.selectedIds;
		const tree = finderSubtree(data.current, ids);
		const undo = history.current.undo.at(-1);
		const redo = history.current.redo.at(-1);
		const count = clipboard.current.length;
		let copyLabel = "Copy";
		if (ids.length === 1) {
			copyLabel = `Copy “${context.selectedFiles[0].name}”`;
		}
		if (ids.length > 1) {
			copyLabel = `Copy ${ids.length} Items`;
		}
		return [
			{
				disabled: !(
					onFilesChange &&
					copyAllowed(ids) &&
					finderTrash(data.current, ids).value
				),
				icon: <WindowSymbol name="trash" />,
				id: "trash",
				label: "Move to Trash",
				separatorBefore: true,
				shortcut: "⌘⌫",
			},
			{
				disabled: !(
					onFilesChange &&
					tree?.roots.every((file) =>
						targetAllowed([file.id], file.parentId ?? "")
					)
				),
				icon: <WindowSymbol name="duplicate" />,
				id: "duplicate",
				label: "Duplicate",
				shortcut: "⌘D",
			},
			{
				disabled: !copyAllowed(ids),
				icon: <WindowSymbol name="copy" />,
				id: "copy",
				label: copyLabel,
				separatorBefore: true,
				shortcut: "⌘C",
			},
			{
				disabled: !pasteAllowed(context.locationId),
				id: "paste",
				label: `Paste ${count > 1 ? `${count} Items` : "Item"}`,
				shortcut: "⌘V",
			},
			{
				disabled: !(
					pasteAllowed(context.locationId) &&
					finderMove(data.current, clipboard.current, context.locationId).ids
						.length
				),
				id: "move-here",
				label: `Move ${count > 1 ? "Items" : "Item"} Here`,
				shortcut: "⌥⌘V",
			},
			{
				disabled: !(
					onFilesChange &&
					undo &&
					finderApplyHistory(data.current, undo, false)
				),
				id: "undo",
				label: undo ? `Undo ${undo.change.label}` : "Undo",
				separatorBefore: true,
				shortcut: "⌘Z",
			},
			{
				disabled: !(
					onFilesChange &&
					redo &&
					finderApplyHistory(data.current, redo, true)
				),
				id: "redo",
				label: redo ? `Redo ${redo.change.label}` : "Redo",
				shortcut: "⇧⌘Z",
			},
		];
	};
	const run = (id: string, context: MacFinderActionContext) => {
		const selected = context.selectedIds;
		const parent = context.locationId;
		if (id === "copy") {
			clipboard.current = [...selected];
			setStatus(
				`Copied ${selected.length} ${selected.length === 1 ? "item" : "items"}.`
			);
			notify();
		} else if (id === "paste" && pasteAllowed(parent)) {
			publish(finderClone(data.current, clipboard.current, parent));
		} else if (id === "move-here" && pasteAllowed(parent)) {
			publish(finderMoveOperation(data.current, clipboard.current, parent));
		} else if (id === "duplicate" && copyAllowed(selected)) {
			publish(finderClone(data.current, selected));
		} else if (id === "trash" && copyAllowed(selected)) {
			publish(finderTrash(data.current, selected));
		} else if (id === "undo" || id === "redo") {
			step(id === "redo");
		}
	};
	return {
		actions,
		create: (file: MacFinderFile) => {
			const parent = data.current.find((entry) => entry.id === file.parentId);
			if (
				parent?.kind !== "folder" ||
				parent.locked ||
				parent.disabled ||
				data.current.some((entry) => entry.id === file.id) ||
				fileNewFolderError(
					file.name,
					data.current.filter((entry) => entry.parentId === file.parentId)
				)
			) {
				return;
			}
			publish({
				value: {
					files: [...data.current, file],
					ids: [file.id],
					label: "New Folder",
					operation: "new-folder",
				},
			});
		},
		info: (id: string, changes: MacFileInfoChanges) => {
			const file = data.current.find((entry) => entry.id === id);
			if (!file || file.disabled) {
				return;
			}
			publish({
				value: {
					files: data.current.map((entry) =>
						entry.id === id ? { ...entry, ...changes } : entry
					),
					ids: [id],
					label: finderOperationLabel("Change Info", [file]),
					operation: "info",
				},
			});
		},
		move: (ids: readonly string[], parentId: string) => {
			if (targetAllowed(ids, parentId)) {
				publish(finderMoveOperation(data.current, ids, parentId));
			}
		},
		rename: (id: string, name: string) => {
			const file = data.current.find((entry) => entry.id === id);
			const parent = data.current.find((entry) => entry.id === file?.parentId);
			if (
				!file ||
				id === rootId ||
				parent?.kind !== "folder" ||
				parent.locked ||
				parent.disabled ||
				file.locked ||
				file.disabled ||
				fileNewFolderError(
					name,
					data.current.filter((entry) => entry.parentId === file.parentId),
					id
				)
			) {
				return;
			}
			publish({
				value: {
					files: data.current.map((entry) =>
						entry.id === id ? { ...entry, name } : entry
					),
					ids: [id],
					label: finderOperationLabel("Rename", [file]),
					operation: "rename",
				},
			});
		},
		run,
		status,
	};
}

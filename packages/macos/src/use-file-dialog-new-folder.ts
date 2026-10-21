import {
	type RefObject,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import type { MacFileDialogDirectory } from "./file-dialog-model";

export type MacCreateFolder = (
	directoryId: string,
	name: string
) => string | Promise<string>;

export function useFileDialogNewFolder({
	directories,
	directory,
	onCreateFolder,
	onNavigate,
	panel,
}: {
	directories: readonly MacFileDialogDirectory[];
	directory?: MacFileDialogDirectory;
	onCreateFolder?: MacCreateFolder;
	onNavigate: (id: string) => void;
	panel: RefObject<HTMLFormElement | null>;
}) {
	const [parent, setParent] = useState<MacFileDialogDirectory>();
	const [pendingId, setPendingId] = useState<string>();
	const created = useRef<boolean>(false);
	const current =
		directories.find((entry) => entry.id === parent?.id) ?? parent;
	const request = useCallback(() => {
		if (onCreateFolder && directory) {
			created.current = false;
			setParent(directory);
		}
	}, [directory, onCreateFolder]);
	const change = useCallback((open: boolean) => {
		if (!open) {
			setParent(undefined);
		}
	}, []);
	const create = useCallback(
		async (name: string) => {
			if (!(onCreateFolder && current)) {
				throw new Error("This folder is no longer available.");
			}
			const id = await onCreateFolder(current.id, name);
			if (id.length === 0 || directories.some((entry) => entry.id === id)) {
				throw new Error(
					"Return a new, unique directory ID after creating the folder."
				);
			}
			created.current = true;
			setPendingId(id);
		},
		[onCreateFolder, current, directories]
	);
	useLayoutEffect(() => {
		if (pendingId && directories.some((entry) => entry.id === pendingId)) {
			onNavigate(pendingId);
			setPendingId(undefined);
		}
	}, [pendingId, directories, onNavigate]);
	const returnFocus = useCallback(() => {
		// biome-ignore lint/suspicious/noUnnecessaryConditions: Creation updates the ref before the dialog restores focus.
		if (created.current) {
			return (
				[
					...(panel.current?.querySelectorAll<HTMLElement>(
						".mac-file-dialog-browser tr[tabindex='0'], .mac-file-dialog-browser table[tabindex='0']"
					) ?? []),
				].at(-1) ?? null
			);
		}
		return (
			panel.current?.querySelector<HTMLElement>(
				".mac-file-dialog-new-folder"
			) ?? null
		);
	}, [panel]);
	return {
		dialogProps: {
			items: current?.items ?? [],
			onCreate: create,
			onOpenChange: change,
			open: Boolean(parent),
			parentName: current?.name ?? "",
			returnFocus,
		},
		open: Boolean(parent),
		request: onCreateFolder && directory ? request : undefined,
	};
}

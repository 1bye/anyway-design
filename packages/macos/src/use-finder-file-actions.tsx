import {
	type KeyboardEvent,
	type MouseEvent,
	type RefObject,
	useCallback,
	useState,
} from "react";
import type { MacFinderProps } from "./finder";
import {
	type FinderCapabilities,
	finderActionContext,
	finderActionEnabled,
	finderConfiguredActions,
	finderContextSelection,
	finderFileShortcut,
	finderQuickLookItem,
	type MacFinderActionContext,
} from "./finder-actions";
import { finderPath, type MacFinderFile } from "./finder-model";

interface FinderFileActionsOptions {
	capabilities: FinderCapabilities;
	columnRootId: string;
	configuration: MacFinderProps["fileActions"];
	files: readonly MacFinderFile[];
	locationId: string;
	onAction: MacFinderProps["onAction"];
	onCreate: (parentId: string) => void;
	onOpen: (id: string) => void;
	onRename: (id: string) => void;
	onSelect: (ids: string[], column?: string) => void;
	onSelectAll: (parentId: string) => void;
	root: RefObject<HTMLDivElement | null>;
	selectedIds: readonly string[];
	viewIds: readonly string[];
}
export function useFinderFileActions({
	capabilities,
	columnRootId,
	configuration,
	files,
	locationId,
	onAction,
	onCreate,
	onOpen,
	onRename,
	onSelect,
	onSelectAll,
	root,
	selectedIds,
	viewIds,
}: FinderFileActionsOptions) {
	const [contextTarget, setContextTarget] = useState<{
		ids: string[];
		parent: string;
	}>();
	const [preview, setPreview] = useState({
		ids: [] as string[],
		open: false,
		value: "",
	});
	const [info, setInfo] = useState({ id: "", open: false });
	const context = finderActionContext(
		files,
		selectedIds,
		locationId,
		capabilities
	);
	const menuContext = contextTarget
		? finderActionContext(
				files,
				contextTarget.ids,
				contextTarget.parent,
				capabilities
			)
		: context;
	const actions = finderConfiguredActions(context, configuration);
	const menuItems = finderConfiguredActions(menuContext, configuration);
	const source = useCallback(
		(id: string) => {
			const nodes =
				root.current?.querySelectorAll<HTMLElement>(
					"button[data-file-id], tr[data-file-id]"
				) ?? [];
			return [...nodes].find((node) => node.dataset.fileId === id) ?? null;
		},
		[root]
	);
	const artwork = useCallback(
		(id: string) => {
			const node = source(id);
			return (
				node?.querySelector<HTMLElement>(
					".mac-file-artwork, .mac-file-list-icon"
				) ?? node
			);
		},
		[source]
	);
	const focusTarget = useCallback(
		(id: string) =>
			source(id) ??
			root.current?.querySelector<HTMLElement>(
				"[data-file-id][tabindex='0']"
			) ??
			root.current?.querySelector<HTMLElement>(".mac-finder-browser") ??
			null,
		[source, root]
	);
	const handlers: Record<string, (target: MacFinderActionContext) => void> = {
		info: (target) => {
			const current = target.selectedFiles[0]?.id ?? target.locationId;
			if (!files.some((file) => file.id === current && !file.disabled)) {
				return;
			}
			setPreview((previous) => ({ ...previous, open: false }));
			setInfo({ id: current, open: true });
		},
		"new-folder": (target) => onCreate(target.locationId),
		open: (target) => {
			for (const file of target.selectedFiles) {
				onOpen(file.id);
			}
		},
		"quick-look": (target) => {
			const [current] = target.selectedFiles;
			if (!current) {
				return;
			}
			const scope =
				source(current.id)?.closest(".mac-file-browser-column") ?? root.current;
			const rendered = [
				...(scope?.querySelectorAll<HTMLElement>(
					"button[data-file-id], tr[data-file-id]"
				) ?? []),
			].flatMap((node) => (node.dataset.fileId ? [node.dataset.fileId] : []));
			const available = rendered.length ? rendered : viewIds;
			const group =
				target.selectedFiles.length > 1
					? available.filter((id) => target.selectedIds.includes(id))
					: available;

			setInfo((previous) => ({ ...previous, open: false }));
			setPreview({
				ids: [
					...new Set(
						group.includes(current.id) ? group : [current.id, ...group]
					),
				],
				open: true,
				value: current.id,
			});
		},
		rename: (target) => {
			const [file] = target.selectedFiles;
			if (
				capabilities.rename &&
				file &&
				!file.locked &&
				target.selectedFiles.length === 1
			) {
				onRename(file.id);
			}
		},
		"select-all": (target) => onSelectAll(target.locationId),
	};
	const run = (
		id: string,
		ids: readonly string[] = selectedIds,
		parent = locationId
	) => {
		const target = finderActionContext(files, ids, parent, capabilities);
		const configured = finderConfiguredActions(target, configuration);
		const enabled =
			finderActionEnabled(configured, id) ??
			finderActionEnabled(target.defaultActions, id);
		if (enabled === false) {
			return;
		}
		const handler = Object.hasOwn(handlers, id) ? handlers[id] : undefined;
		handler?.(target);
		onAction?.(id, target.selectedIds, target);
	};

	const canRun = (id: string, ids: readonly string[] = selectedIds) => {
		const target = finderActionContext(files, ids, locationId, capabilities);
		return (
			(finderActionEnabled(
				finderConfiguredActions(target, configuration),
				id
			) ?? finderActionEnabled(target.defaultActions, id)) !== false
		);
	};
	const columnParent = (target: Element) => {
		const column = target.closest<HTMLElement>("[data-column-index]");
		return column ? (column.dataset.finderParentId ?? columnRootId) : undefined;
	};
	const key = (event: KeyboardEvent<HTMLDivElement>) => {
		if (
			!(event.target instanceof Element) ||
			event.defaultPrevented ||
			event.target.closest("input, textarea, select, [contenteditable='true']")
		) {
			return false;
		}
		const id =
			event.target.closest<HTMLElement>("[data-file-id]")?.dataset.fileId;
		const action = finderFileShortcut(event, Boolean(id));
		if (!action) {
			return false;
		}
		event.preventDefault();
		if (!event.repeat) {
			run(
				action,
				id ? finderContextSelection(selectedIds, id) : selectedIds,
				columnParent(event.target) ?? locationId
			);
		}
		return true;
	};
	const requestOpen = (id: string) =>
		run("open", finderContextSelection(selectedIds, id));

	const requestPreview = (id: string) =>
		run("quick-look", finderContextSelection(selectedIds, id));
	const requestInfo = (id: string) =>
		run("info", finderContextSelection(selectedIds, id));
	const contextMenu = (event: MouseEvent<HTMLDivElement>) => {
		if (!(event.target instanceof Element)) {
			return;
		}
		if (
			event.target.closest("input, textarea, select, [contenteditable='true']")
		) {
			event.stopPropagation();
			return;
		}
		const node = event.target.closest<HTMLElement>("[data-file-id]");
		const file = files.find((entry) => entry.id === node?.dataset.fileId);
		if (file?.disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		const ids = finderContextSelection(selectedIds, file?.id);
		const parent = columnParent(event.target) ?? file?.parentId ?? locationId;
		const target = finderActionContext(files, ids, parent, capabilities);
		if (!finderConfiguredActions(target, configuration).length) {
			event.preventDefault();
			event.stopPropagation();
		}

		setContextTarget({ ids, parent });
		onSelect(ids, file?.id);
	};
	const infoFile = files.find((file) => file.id === info.id && !file.disabled);
	const quickLookItems = preview.ids.flatMap((id) => {
		const file = files.find((entry) => entry.id === id && !entry.disabled);
		return file ? [finderQuickLookItem(file)] : [];
	});
	const path = infoFile
		? finderPath(files, infoFile.id)
				.slice(0, -1)
				.map((file) => file.name)
				.join(" ▸ ")
		: "";
	return {
		actions,
		canRun,
		contextAction: (id: string) =>
			run(id, menuContext.selectedIds, menuContext.locationId),
		contextMenu,
		info: {
			file: infoFile,
			onOpenChange: (open: boolean) =>
				setInfo((previous) => ({ ...previous, open })),
			open: info.open && Boolean(infoFile),
			path,
			returnFocus: () => focusTarget(info.id),
		},
		key,
		menuItems,
		quickLook: {
			getSourceElement: artwork,
			items: quickLookItems,
			onOpenChange: (open: boolean) =>
				setPreview((previous) => ({ ...previous, open })),
			onValueChange: (id: string) => {
				setPreview((previous) => ({ ...previous, value: id }));
				if (preview.ids.length > 1 && selectedIds.length <= 1) {
					onSelect([id], id);
				}
			},
			open: preview.open && Boolean(quickLookItems.length),
			returnFocus: () => focusTarget(preview.value),
			value: preview.value,
		},
		requestInfo,
		requestOpen,
		requestPreview,
		run,
	};
}

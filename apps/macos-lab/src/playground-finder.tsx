/** biome-ignore-all lint/performance/noJsxPropsBind: The playground owns its example files. */
import {
	MacFinder,
	type MacFinderCollection,
	type MacFinderHandle,
	type MacFinderProps,
} from "@1bye/macos/finder";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFinderFiles } from "./finder-browser-data";
import { finderImports } from "./finder-import";
import { PLAYGROUND_SIDEBAR } from "./playground-data";

export type FinderHandle = MacFinderHandle;
interface FinderExampleProps extends Omit<MacFinderProps, "files" | "rootId"> {
	customActions?: boolean;
	focus?: "toolbar" | "sidebar";
	onEvent: (message: string) => void;
	readOnly?: boolean;
	title?: string;
}
const COLLECTIONS: readonly MacFinderCollection[] = [
	{ filter: (file) => file.kind !== "folder", id: "recents", label: "Recents" },
	{ filter: (file) => file.shared === true, id: "shared", label: "Shared" },
	...["Urgent", "Work", "Vacation"].map((label) => ({
		filter: (file: Parameters<MacFinderCollection["filter"]>[0]) =>
			file.tags?.some((tag) => tag.label === label) ?? false,
		id: label.toLowerCase(),
		label,
	})),
];
const TABS = [
	{ id: "documents", location: "documents", selectedIds: ["brief"] },
	{ id: "home", location: "home" },
];

/** The same public Finder, with caller-owned fixtures and accessibility for the cropped studies. */
export function PlaygroundFinder({
	focus,
	onEvent,
	title = "Documents",
	readOnly = false,
	customActions = false,
	ref,
	...props
}: FinderExampleProps) {
	const [items, setItems] = useState(() => createFinderFiles(Date.now()));
	const root = useRef<HTMLDivElement>(null);
	const objectUrls = useRef<string[]>([]);
	useEffect(
		() => () => {
			for (const url of objectUrls.current) {
				URL.revokeObjectURL(url);
			}
		},
		[]
	);
	useLayoutEffect(() => {
		const selector = [
			".mac-finder-tabs",
			".mac-window-footer",
			focus === "sidebar" ? ".mac-window-heading" : ".mac-window-sidebar",
		].join(", ");
		const nodes = root.current?.querySelectorAll<HTMLElement>(selector) ?? [];
		for (const node of nodes) {
			node.inert = Boolean(focus);
			if (focus) {
				node.setAttribute("aria-hidden", "true");
			} else {
				node.removeAttribute("aria-hidden");
			}
		}
	}, [focus]);
	const files = items.map((file) =>
		file.id === "documents" && file.name === "Documents"
			? { ...file, name: title }
			: file
	);
	const canReview = customActions && !readOnly;
	return (
		<div ref={root} style={{ display: "contents" }}>
			<MacFinder
				collections={COLLECTIONS}
				defaultTabs={TABS}
				fileActions={
					customActions
						? ({ defaultActions, selectedFiles }) => [
								...defaultActions,
								{
									disabled: readOnly || !selectedFiles.length,
									id: "mark-reviewed",
									label: "Mark as Reviewed",
									separatorBefore: true,
								},
							]
						: undefined
				}
				files={files}
				onAction={(id, ids) => {
					if (id === "mark-reviewed" && canReview) {
						setItems((previous) =>
							previous.map((file) =>
								ids.includes(file.id)
									? {
											...file,
											tags: [
												...(file.tags ?? []).filter(
													(tag) => tag.label !== "Reviewed"
												),
												{ color: "#30b956", label: "Reviewed" },
											],
										}
									: file
							)
						);
					}
					onEvent(`onAction → ${id} · ${ids.join(", ")}`);
				}}
				onFilesChange={
					readOnly
						? undefined
						: (next, change) => {
								setItems(next);
								onEvent(`${change.action} → ${change.label}`);
							}
				}
				onImport={
					readOnly
						? undefined
						: (incoming, parentId) => {
								const imported = finderImports(
									incoming,
									parentId,
									files,
									objectUrls.current
								);
								setItems((previous) => [...previous, ...imported]);
								onEvent(`onImport → ${imported.length} files → ${parentId}`);
							}
				}
				onLocationChange={(id) =>
					onEvent(
						`onNavigate → ${files.find((file) => file.id === id)?.name ?? id}`
					)
				}
				onOpen={(id) =>
					onEvent(
						`onOpen → ${files.find((file) => file.id === id)?.name ?? id}`
					)
				}
				onSelectionChange={(ids) =>
					onEvent(`onSelectionChange → ${ids.join(", ")}`)
				}
				onViewChange={(view) => onEvent(`onViewChange → ${view}`)}
				ref={ref}
				rootId="home"
				sidebarGroups={PLAYGROUND_SIDEBAR}
				{...props}
			/>
		</div>
	);
}

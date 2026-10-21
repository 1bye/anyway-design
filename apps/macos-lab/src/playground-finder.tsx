/** biome-ignore-all lint/performance/noJsxPropsBind: The playground owns its example files. */
import {
	MacFinder,
	type MacFinderCollection,
	type MacFinderHandle,
	type MacFinderProps,
} from "@anyway-design/macos/finder";
import { useLayoutEffect, useRef, useState } from "react";
import { createFinderFiles } from "./finder-browser-data";
import { PLAYGROUND_SIDEBAR } from "./playground-data";

export type FinderHandle = MacFinderHandle;
interface FinderExampleProps extends Omit<MacFinderProps, "files" | "rootId"> {
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
	ref,
	...props
}: FinderExampleProps) {
	const [items, setItems] = useState(() => createFinderFiles(Date.now()));
	const root = useRef<HTMLDivElement>(null);
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
	return (
		<div ref={root} style={{ display: "contents" }}>
			<MacFinder
				collections={COLLECTIONS}
				defaultTabs={TABS}
				files={files}
				onAction={(id) => onEvent(`onAction → ${id}`)}
				onCreateFolder={
					readOnly
						? undefined
						: (folder) => {
								setItems((previous) => [...previous, folder]);
								onEvent(`onCreateFolder → ${folder.name}`);
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
				onRename={
					readOnly
						? undefined
						: (id, name) => {
								setItems((previous) =>
									previous.map((file) =>
										file.id === id ? { ...file, name } : file
									)
								);
								onEvent(`onRename → ${name}`);
							}
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

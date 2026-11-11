/** biome-ignore-all lint/performance/noJsxPropsBind: Local dialog playground handlers. */
import { MacAlert, MacAlertPanel } from "@1bye/macos/alert";
import { MacButton } from "@1bye/macos/controls";
import { MacFileDialog, MacFileDialogPanel } from "@1bye/macos/file-dialog";
import { MacGetInfo, MacGetInfoPanel } from "@1bye/macos/file-info";
import type { MacFileListItem } from "@1bye/macos/file-list";
import { MacNewFolderDialog, MacNewFolderPanel } from "@1bye/macos/new-folder";
import { MacQuickLook, MacQuickLookPanel } from "@1bye/macos/quick-look";
import { useRef, useState } from "react";
import { type AlertSampleName, alertSample } from "./alert-samples";
import { createPanelFolder } from "./create-panel-folder";
import { PANEL_DIRECTORIES, PANEL_TYPES } from "./file-dialog-reference-data";
import { INFO_FILES } from "./file-info-reference-data";
import type { PlaygroundDemoProps } from "./playground-catalog";
import { PLAYGROUND_FILES, PLAYGROUND_QUICK_LOOK } from "./playground-data";

export function AlertDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [open, setOpen] = useState(false);
	const sample = alertSample(values.sample as AlertSampleName);
	const props = {
		...sample,
		onAction: (id: string) => onEvent(`onAction → ${id}`),
		suppression: sample.suppressionLabel
			? { label: sample.suppressionLabel }
			: undefined,
	};
	return values.modal ? (
		<>
			<MacButton onClick={() => setOpen(true)}>Show alert</MacButton>
			<MacAlert {...props} onOpenChange={setOpen} open={open} />
		</>
	) : (
		<MacAlertPanel {...props} />
	);
}
export function NewFolderDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [items, setItems] = useState<MacFileListItem[]>(PLAYGROUND_FILES);
	const [open, setOpen] = useState(!values.modal);
	const trigger = useRef<HTMLButtonElement>(null);
	const props = {
		items,
		onCreate: (name: string) => {
			setItems([...items, { id: crypto.randomUUID(), kind: "folder", name }]);
			setOpen(false);
			onEvent(`onCreate → ${name}`);
		},
		parentName: "Documents",
	};
	return (
		<div className="pg-panel-example">
			{open ? null : (
				<MacButton onClick={() => setOpen(true)} ref={trigger}>
					Create a folder
				</MacButton>
			)}
			{values.modal ? (
				<MacNewFolderDialog
					{...props}
					onOpenChange={setOpen}
					open={open}
					returnFocus={trigger}
				/>
			) : null}
			{!values.modal && open ? (
				<MacNewFolderPanel
					{...props}
					autoFocus={false}
					onCancel={() => {
						setOpen(false);
						onEvent("onCancel");
					}}
				/>
			) : null}
		</div>
	);
}
export function FileDialogDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [directories, setDirectories] = useState(PANEL_DIRECTORIES);
	const [open, setOpen] = useState(!values.modal);
	const trigger = useRef<HTMLButtonElement>(null);
	const mode = values.mode === "save" ? ("save" as const) : ("open" as const);
	const props = {
		defaultExpanded: Boolean(values.expanded),
		defaultView:
			values.view === "columns" ? ("columns" as const) : ("list" as const),
		directories,
		fileTypes: PANEL_TYPES,
		initialDirectoryId: "root",
		initialName: "Project brief.txt",
		mode,
		multiple: Boolean(values.multiple),
		onConfirm: (result: unknown) => {
			onEvent(`onConfirm → ${JSON.stringify(result)}`);
			setOpen(false);
		},
		onCreateFolder: (parent: string, name: string) => {
			const id = crypto.randomUUID();
			setDirectories(createPanelFolder(directories, parent, name, id));
			onEvent(`onCreateFolder → ${name}`);
			return id;
		},
	};
	return (
		<div className="pg-panel-example">
			{open ? null : (
				<MacButton onClick={() => setOpen(true)} ref={trigger}>
					{mode === "open" ? "Open a file…" : "Save a file…"}
				</MacButton>
			)}
			{values.modal ? (
				<MacFileDialog
					{...props}
					onOpenChange={setOpen}
					open={open}
					returnFocus={trigger}
				/>
			) : null}
			{!values.modal && open ? (
				<MacFileDialogPanel
					{...props}
					onCancel={() => {
						setOpen(false);
						onEvent("onCancel");
					}}
				/>
			) : null}
		</div>
	);
}
export function QuickLookDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [id, setId] = useState("clouds");
	const [open, setOpen] = useState(!values.modal);
	const [expanded, setExpanded] = useState(false);
	const trigger = useRef<HTMLButtonElement>(null);
	const item =
		PLAYGROUND_QUICK_LOOK.find((file) => file.id === id) ??
		PLAYGROUND_QUICK_LOOK[0];
	const props = {
		onMarkup: () => onEvent(`onMarkup → ${id}`),
		onOpenFile: () => onEvent(`onOpenFile → ${id}`),
		onShare: () => onEvent(`onShare → ${id}`),
	};
	return (
		<div className="pg-panel-example">
			{open ? null : (
				<MacButton onClick={() => setOpen(true)} ref={trigger}>
					Quick Look
				</MacButton>
			)}
			{values.modal ? (
				<MacQuickLook
					{...props}
					items={PLAYGROUND_QUICK_LOOK}
					onOpenChange={setOpen}
					onValueChange={setId}
					open={open}
					returnFocus={trigger}
					style={{ height: 420, width: 680 }}
					value={id}
				/>
			) : null}
			{!values.modal && open ? (
				<MacQuickLookPanel
					{...props}
					expanded={expanded}
					item={item}
					nextDisabled={id !== "clouds"}
					onClose={() => setOpen(false)}
					onExpand={() => setExpanded(!expanded)}
					onNext={() => setId("brief")}
					onPrevious={() => setId("clouds")}
					previousDisabled={id === "clouds"}
					style={{ height: expanded ? 480 : 400, width: expanded ? 760 : 680 }}
				/>
			) : null}
		</div>
	);
}
export function InfoDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [file, setFile] = useState(INFO_FILES[0]);
	const [open, setOpen] = useState(!values.modal);
	const trigger = useRef<HTMLButtonElement>(null);
	const props = {
		active: Boolean(values.active),
		file,
		onInfoChange: (_id: string, changes: Partial<typeof file>) => {
			setFile({ ...file, ...changes });
			onEvent(`onInfoChange → ${JSON.stringify(changes)}`);
		},
		onRename: (_id: string, name: string) => {
			setFile({ ...file, name });
			onEvent(`onRename → ${name}`);
		},
	};
	return (
		<div className="pg-panel-example">
			{open ? null : (
				<MacButton onClick={() => setOpen(true)} ref={trigger}>
					Get Info
				</MacButton>
			)}
			{values.modal ? (
				<MacGetInfo
					{...props}
					onOpenChange={setOpen}
					open={open}
					returnFocus={trigger}
				/>
			) : null}
			{!values.modal && open ? (
				<MacGetInfoPanel {...props} onClose={() => setOpen(false)} />
			) : null}
		</div>
	);
}

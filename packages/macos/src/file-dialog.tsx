import { Dialog } from "@base-ui/react/dialog";
import {
	type ChangeEvent,
	type CSSProperties,
	type FormEvent,
	type KeyboardEvent,
	type RefObject,
	useCallback,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { MacButton } from "./controls";
import { useMacOSPortal } from "./environment";
import {
	FileDialogFields,
	FileDialogFooter,
	FileDialogToolbar,
} from "./file-dialog-chrome";
import {
	fileDialogAccepts,
	fileDialogSaveTarget,
	fileDialogTrail,
	type MacFileDialogDirectory,
	type MacFileDialogResult,
	type MacFileDialogType,
} from "./file-dialog-model";
import { MacFileIcon } from "./file-icons";
import { MacFileList, type MacFileSort } from "./file-list";
import { sortFileList } from "./file-list-sort";
import { WindowSidebar, type WindowSidebarGroup } from "./window-sidebar";

export type {
	MacFileDialogDirectory,
	MacFileDialogResult,
	MacFileDialogType,
} from "./file-dialog-model";

export interface MacFileDialogPanelProps {
	active?: boolean;
	className?: string;
	defaultExpanded?: boolean;
	directories: readonly MacFileDialogDirectory[];
	fileTypes?: readonly MacFileDialogType[];
	initialDirectoryId: string;
	initialName?: string;
	initialSelectedIds?: readonly string[];
	mode: "open" | "save";
	multiple?: boolean;
	onCancel: () => void;
	onConfirm: (result: MacFileDialogResult) => void;
	showTags?: boolean;
	sidebarGroups?: WindowSidebarGroup[];
	style?: CSSProperties;
}

const COLUMNS = ["name", "size", "kind", "modified"] as const;
const WIDTHS = { kind: 115, modified: 188, name: 460, size: 97 };
const COLUMN_LABELS = { modified: "Date Added" };

function FileDialogEmpty({ count, query }: { count: number; query: string }) {
	if (count) {
		return null;
	}
	return (
		<p className="mac-file-dialog-empty">
			{query ? "No matching files" : "This folder is empty"}
		</p>
	);
}

function ReplaceFile({
	name,
	onCancel,
	onReplace,
}: {
	name: string | undefined;
	onCancel: () => void;
	onReplace: () => void;
}) {
	const container = useMacOSPortal();
	const change = useCallback(
		(open: boolean) => {
			if (!open) {
				onCancel();
			}
		},
		[onCancel]
	);
	return (
		<Dialog.Root onOpenChange={change} open={Boolean(name)}>
			<Dialog.Portal container={container}>
				<Dialog.Backdrop className="mac-file-dialog-backdrop" />
				<Dialog.Popup className="mac-file-dialog-replace" initialFocus={true}>
					<Dialog.Close className="mac-file-dialog-sr-only" tabIndex={-1}>
						Cancel replacement
					</Dialog.Close>
					<MacFileIcon name="document" />
					<Dialog.Title>
						“{name}” already exists. Do you want to replace it?
					</Dialog.Title>
					<Dialog.Description>
						A file with this name already exists in this location.
					</Dialog.Description>
					<div>
						<MacButton onClick={onCancel}>Cancel</MacButton>
						<MacButton onClick={onReplace} variant="primary">
							Replace
						</MacButton>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** A data-driven panel; it never reads or writes the host filesystem. */
export function MacFileDialogPanel({
	mode,
	directories,
	initialDirectoryId,
	initialName = "Untitled.txt",
	initialSelectedIds = [],
	fileTypes = [],
	multiple = false,
	onConfirm,
	onCancel,
	defaultExpanded = true,
	sidebarGroups,
	showTags = true,
	active = true,
	className = "",
	style,
}: MacFileDialogPanelProps) {
	const [history, setHistory] = useState({
		ids: [initialDirectoryId],
		index: 0,
	});
	const directory =
		directories.find((entry) => entry.id === history.ids[history.index]) ??
		directories[0];
	const [selected, setSelected] = useState<readonly string[]>(() =>
		multiple && mode === "open"
			? initialSelectedIds
			: initialSelectedIds.slice(0, 1)
	);
	const [query, setQuery] = useState("");
	const [name, setName] = useState(initialName);
	const [tags, setTags] = useState("");
	const [expanded, setExpanded] = useState(defaultExpanded);
	const [sidebar, setSidebar] = useState(Boolean(sidebarGroups?.length));
	const [typeId, setTypeId] = useState(fileTypes[0]?.id ?? "");
	const [error, setError] = useState("");
	const [sort, setSort] = useState<MacFileSort>({
		column: "name",
		direction: "ascending",
	});
	const [widths, setWidths] =
		useState<Partial<Record<(typeof COLUMNS)[number], number>>>(WIDTHS);
	const [replacement, setReplacement] =
		useState<Extract<MacFileDialogResult, { mode: "save" }>>();
	const errorId = useId();
	const saveMode = mode === "save";
	const showBrowser = !saveMode || expanded;
	const type = fileTypes.find((entry) => entry.id === typeId);
	const directoryId = directory?.id ?? "";
	const panel = useRef<HTMLFormElement>(null);
	const lastDirectory = useRef(directoryId);
	useLayoutEffect(() => {
		if (lastDirectory.current === directoryId) {
			return;
		}
		lastDirectory.current = directoryId;
		const row = panel.current?.querySelector<HTMLElement>(
			"tr[data-file-id][tabindex='0']"
		);
		const target =
			row ?? panel.current?.querySelector<HTMLElement>("input[type=search]");
		target?.focus({ preventScroll: true });
	}, [directoryId]);
	const trail = fileDialogTrail(directories, directoryId);
	const items = useMemo(
		() =>
			(directory?.items ?? [])
				.filter((item) =>
					item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
				)
				.map((item) => ({
					...item,
					disabled: item.disabled || !fileDialogAccepts(item, type),
				})),
		[directory, query, type]
	);
	const chosen = useMemo(
		() =>
			sortFileList(items, sort).filter(
				(item) => !item.disabled && selected.includes(item.id)
			),
		[items, sort, selected]
	);
	const saveTarget = fileDialogSaveTarget(name, directory?.items ?? [], type);
	const canSubmit =
		Boolean(directory) && (saveMode ? !saveTarget.error : chosen.length > 0);
	const resetBrowser = useCallback(() => {
		setSelected([]);
		setQuery("");
		setError("");
	}, []);
	const navigate = useCallback(
		(id: string) => {
			if (
				!directories.some((entry) => entry.id === id) ||
				id === directory?.id
			) {
				return;
			}
			setHistory((current) => ({
				ids: [...current.ids.slice(0, current.index + 1), id],
				index: current.index + 1,
			}));
			resetBrowser();
		},
		[directories, directory?.id, resetBrowser]
	);
	const back = useCallback(() => {
		setHistory((current) => ({
			...current,
			index: Math.max(0, current.index - 1),
		}));
		resetBrowser();
	}, [resetBrowser]);
	const forward = useCallback(() => {
		setHistory((current) => ({
			...current,
			index: Math.min(current.ids.length - 1, current.index + 1),
		}));
		resetBrowser();
	}, [resetBrowser]);
	const save = useCallback(
		(draft: string) => {
			if (!directory) {
				return;
			}
			const target = fileDialogSaveTarget(draft, directory.items, type);
			if (target.error) {
				setError(target.error);
				return;
			}
			const result: Extract<MacFileDialogResult, { mode: "save" }> = {
				directoryId: directory.id,
				mode: "save",
				name: target.name,
				replaceId: target.replaceId,
				tags,
			};
			if (result.replaceId) {
				setReplacement(result);
			} else {
				onConfirm(result);
			}
		},
		[directory, type, tags, onConfirm]
	);
	const openFile = useCallback(
		(id: string) => {
			const item = items.find((entry) => entry.id === id);
			if (!(directory && item) || item.disabled) {
				return;
			}
			if (item.kind === "folder") {
				navigate(id);
				return;
			}
			if (saveMode) {
				setName(item.name);
				save(item.name);
				return;
			}
			const fileIds =
				multiple && selected.includes(id)
					? chosen
							.filter((entry) => entry.kind !== "folder")
							.map((entry) => entry.id)
					: [id];
			onConfirm({ directoryId: directory.id, fileIds, mode: "open" });
		},
		[
			directory,
			items,
			navigate,
			saveMode,
			save,
			multiple,
			selected,
			chosen,
			onConfirm,
		]
	);
	const select = useCallback(
		(ids: string[]) => {
			const next = multiple && !saveMode ? ids : ids.slice(-1);
			setSelected(next);
			const item = directory?.items.find((entry) => entry.id === next[0]);
			if (saveMode && item && item.kind !== "folder") {
				setName(item.name);
				setError("");
			}
		},
		[multiple, saveMode, directory]
	);
	const submit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (saveMode) {
				save(name);
				return;
			}
			const folder = chosen.find((item) => item.kind === "folder");
			if (folder) {
				navigate(folder.id);
			} else if (directory && chosen.length) {
				onConfirm({
					directoryId: directory.id,
					fileIds: chosen.map((item) => item.id),
					mode: "open",
				});
			}
		},
		[saveMode, save, name, chosen, navigate, directory, onConfirm]
	);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLFormElement>) => {
			if (event.defaultPrevented || event.nativeEvent.isComposing) {
				return;
			}
			if (
				(event.metaKey || event.ctrlKey) &&
				event.key === "ArrowUp" &&
				directory?.parentId &&
				!(event.target instanceof HTMLInputElement)
			) {
				event.preventDefault();
				navigate(directory.parentId);
			}
		},
		[directory?.parentId, navigate]
	);
	const escapeKey = useCallback(
		(event: KeyboardEvent<HTMLFormElement>) => {
			if (
				event.key !== "Escape" ||
				event.nativeEvent.isComposing ||
				replacement
			) {
				return;
			}
			if (
				event.target instanceof HTMLInputElement &&
				event.target.type === "search" &&
				event.target.value
			) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			onCancel();
		},
		[onCancel, replacement]
	);
	const dismissReplacement = useCallback(() => setReplacement(undefined), []);
	const replace = useCallback(() => {
		if (replacement) {
			onConfirm(replacement);
			setReplacement(undefined);
		}
	}, [replacement, onConfirm]);
	const expandFolder = useCallback(
		(ids: string[]) => {
			const id = ids.at(-1);
			if (id) {
				navigate(id);
			}
		},
		[navigate]
	);
	const changeName = useCallback(
		(value: string) => {
			setName(value);
			setError(
				fileDialogSaveTarget(value, directory?.items ?? [], type).error ?? ""
			);
		},
		[directory, type]
	);
	const changeType = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const next = fileTypes.find((entry) => entry.id === event.target.value);
			setTypeId(event.target.value);
			setSelected([]);
			setError(
				saveMode
					? (fileDialogSaveTarget(name, directory?.items ?? [], next).error ??
							"")
					: ""
			);
		},
		[fileTypes, saveMode, name, directory]
	);
	const toggleSidebar = useCallback(() => setSidebar((value) => !value), []);
	const toggleExpanded = useCallback(() => setExpanded((value) => !value), []);
	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape and folder navigation are keyboard shortcuts for this composite form.
		<form
			aria-label={`${saveMode ? "Save" : "Open"} file panel`}
			className={`mac-file-dialog-panel ${className}`}
			data-active={active}
			data-compact={!showBrowser || undefined}
			data-mode={mode}
			data-sidebar={(showBrowser && sidebar) || undefined}
			onKeyDown={keyDown}
			onKeyDownCapture={escapeKey}
			onSubmit={submit}
			ref={panel}
			style={style}
		>
			{showBrowser && sidebar && sidebarGroups ? (
				<aside className="mac-file-dialog-sidebar">
					<WindowSidebar
						groups={sidebarGroups}
						label="File locations"
						onSelect={navigate}
						selected={directory?.id}
					/>
				</aside>
			) : null}
			<div className="mac-file-dialog-main">
				{saveMode ? (
					<FileDialogFields
						error={error}
						errorId={errorId}
						name={name}
						onNameChange={changeName}
						onTagsChange={setTags}
						onValidate={setError}
						showTags={showTags}
						tags={tags}
						validation={saveTarget.error}
					/>
				) : null}
				<FileDialogToolbar
					backDisabled={history.index === 0}
					canToggleSidebar={Boolean(sidebarGroups?.length)}
					directoryId={directoryId}
					expanded={expanded}
					forwardDisabled={history.index === history.ids.length - 1}
					locations={showBrowser ? trail : directories}
					onBack={back}
					onExpand={toggleExpanded}
					onForward={forward}
					onNavigate={navigate}
					onQueryChange={setQuery}
					onSortChange={setSort}
					onToggleSidebar={toggleSidebar}
					query={query}
					saveMode={saveMode}
					showBrowser={showBrowser}
					sidebar={sidebar}
					sort={sort}
				/>
				{showBrowser ? (
					<div className="mac-file-dialog-browser">
						<MacFileList
							active={active}
							columnLabels={COLUMN_LABELS}
							columns={COLUMNS}
							columnWidths={widths}
							expandedIds={[]}
							items={items}
							key={directory?.id}
							label={directory?.name ?? "Files"}
							minRows={20}
							multiple={mode === "open" && multiple}
							onColumnWidthsChange={setWidths}
							onExpandedChange={expandFolder}
							onOpen={openFile}
							onSelectionChange={select}
							onSortChange={setSort}
							selectedIds={selected}
							sort={sort}
						/>
						<FileDialogEmpty count={items.length} query={query} />
					</div>
				) : null}
				<FileDialogFooter
					canSubmit={canSubmit}
					error={error}
					errorId={errorId}
					fileTypes={fileTypes}
					onCancel={onCancel}
					onTypeChange={changeType}
					saveMode={saveMode}
					typeId={typeId}
				/>
			</div>
			<ReplaceFile
				name={replacement?.name}
				onCancel={dismissReplacement}
				onReplace={replace}
			/>
		</form>
	);
}

export interface MacFileDialogProps
	extends Omit<MacFileDialogPanelProps, "onCancel"> {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	returnFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
}

export function MacFileDialog({
	open,
	onOpenChange,
	onConfirm,
	returnFocus,
	style,
	...props
}: MacFileDialogProps) {
	const container = useMacOSPortal();
	const popup = useRef<HTMLDivElement>(null);
	const close = useCallback(() => onOpenChange(false), [onOpenChange]);
	const confirm = useCallback(
		(result: MacFileDialogResult) => {
			onConfirm(result);
			onOpenChange(false);
		},
		[onConfirm, onOpenChange]
	);
	const initialFocus = useCallback(
		() =>
			popup.current?.querySelector<HTMLElement>(
				"[data-filename], tr[aria-selected=true], tr[data-file-id][tabindex='0']"
			) ?? popup.current,
		[]
	);
	return (
		<Dialog.Root
			disablePointerDismissal
			onOpenChange={onOpenChange}
			open={open}
		>
			<Dialog.Portal container={container}>
				<Dialog.Backdrop className="mac-file-dialog-backdrop" />
				<Dialog.Popup
					aria-describedby={undefined}
					className="mac-file-dialog-popup"
					finalFocus={returnFocus}
					initialFocus={initialFocus}
					ref={popup}
					style={style}
				>
					<Dialog.Title className="mac-file-dialog-sr-only">
						{props.mode === "save" ? "Save" : "Open"}
					</Dialog.Title>
					<Dialog.Close className="mac-file-dialog-sr-only" tabIndex={-1}>
						Cancel file dialog
					</Dialog.Close>
					<MacFileDialogPanel {...props} onCancel={close} onConfirm={confirm} />
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

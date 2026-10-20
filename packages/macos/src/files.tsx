import {
	type ComponentPropsWithRef,
	type CSSProperties,
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useRef,
	useState,
} from "react";
import { MacFileIcon, type MacFileIconName } from "./file-icons";
import {
	focusFileTarget,
	isAdditiveSelection,
	requestFileOpen,
	requestFilePreview,
} from "./file-interactions";
import { FileLabel } from "./file-label";
import type { MacFileRenameProps } from "./file-rename";
import { FileRenameField } from "./file-rename-field";
import { fileGridNeighbor, selectFileIds } from "./file-selection";
import { MacFileThumbnail, type MacFileThumbnailProps } from "./file-thumbnail";
import { useFileRename } from "./use-file-rename";

export interface MacFileTag {
	color: string;
	label: string;
}

export interface MacFile {
	disabled?: boolean;
	icon?: ReactNode;
	id: string;
	kind?: MacFileIconName;
	name: string;
	tags?: readonly MacFileTag[];
	thumbnail?: string;
	thumbnailFit?: MacFileThumbnailProps["fit"];
	thumbnailStyle?: MacFileThumbnailProps["presentation"];
}

export interface MacFileItemProps
	extends Omit<ComponentPropsWithRef<"button">, "children"> {
	file: MacFile;
	selected?: boolean;
	showExtensions?: boolean;
}

const EXTENSION = /\.[^.]+$/;

export function MacFileItem({
	file,
	selected = false,
	showExtensions = true,
	className = "",
	...props
}: MacFileItemProps) {
	const name =
		showExtensions || file.name.startsWith(".")
			? file.name
			: file.name.replace(EXTENSION, "");
	const tags = file.tags ?? [];
	const documentThumbnail =
		file.kind === "pdf" || file.kind === "text" || file.kind === "document";
	return (
		<button
			aria-label={`${file.name}${tags.length ? `, tags: ${tags.map((tag) => tag.label).join(", ")}` : ""}`}
			aria-pressed={selected}
			className={`mac-file-item ${className}`}
			disabled={file.disabled}
			title={file.name}
			type="button"
			{...props}
		>
			<span aria-hidden="true" className="mac-file-artwork">
				{file.thumbnail ? (
					<MacFileThumbnail
						fit={file.thumbnailFit}
						presentation={
							file.thumbnailStyle ?? (documentThumbnail ? "document" : "image")
						}
						src={file.thumbnail}
					/>
				) : (
					(file.icon ?? <MacFileIcon name={file.kind ?? "document"} />)
				)}
			</span>
			<FileLabel selected={selected}>
				{tags.length ? (
					<span className="mac-file-tags">
						{tags.map((tag) => (
							<span
								className="mac-file-tag"
								key={tag.label}
								style={{ backgroundColor: tag.color }}
							/>
						))}
					</span>
				) : null}
				{name.replaceAll("_", "\u200b_")}
			</FileLabel>
		</button>
	);
}

export interface MacFileGridProps extends MacFileRenameProps {
	active?: boolean;
	className?: string;
	items: readonly MacFile[];
	label?: string;
	onOpen?: (id: string) => void;
	onQuickLook?: (id: string) => void;
	onSelectionChange: (ids: string[]) => void;
	selectedIds: readonly string[];
	showExtensions?: boolean;
	style?: CSSProperties;
}

function fileButton(target: EventTarget) {
	return target instanceof Element
		? target.closest<HTMLButtonElement>("button[data-file-id]")
		: null;
}

function navigationTarget(
	key: string,
	buttons: HTMLButtonElement[],
	id: string
) {
	const ids = buttons.map((button) => button.dataset.fileId ?? "");
	const index = ids.indexOf(id);
	switch (key) {
		case "ArrowLeft":
			return ids[Math.max(0, index - 1)];
		case "ArrowRight":
			return ids[Math.min(ids.length - 1, index + 1)];
		case "Home":
			return ids.at(0);
		case "End":
			return ids.at(-1);
		case "ArrowUp":
		case "ArrowDown":
			return fileGridNeighbor(
				buttons.map((button) => {
					const rect = button.getBoundingClientRect();
					return {
						id: button.dataset.fileId ?? "",
						x: rect.x + rect.width / 2,
						y: rect.y,
					};
				}),
				id,
				key === "ArrowUp" ? "up" : "down"
			);
		default:
			return;
	}
}

function typeaheadTarget(
	event: KeyboardEvent<HTMLFieldSetElement>,
	items: readonly MacFile[],
	id: string,
	history: { text: string; time: number }
) {
	if (
		event.key.length !== 1 ||
		event.key === " " ||
		event.metaKey ||
		event.ctrlKey ||
		event.altKey
	) {
		return;
	}
	const now = Date.now();
	const key = event.key.toLocaleLowerCase();
	const text =
		now - history.time < 700 && history.text !== key ? history.text + key : key;
	const index = items.findIndex((item) => item.id === id);
	const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
	history.text = text;
	history.time = now;
	return ordered.find(
		(item) => !item.disabled && item.name.toLocaleLowerCase().startsWith(text)
	)?.id;
}

export function MacFileGrid({
	items,
	selectedIds,
	onSelectionChange,
	onOpen,
	onQuickLook,
	onRename,
	onRenamingChange,
	renamingId,
	validateRename,
	label = "Files",
	active = true,
	showExtensions = true,
	className = "",
	style,
}: MacFileGridProps) {
	const rename = useFileRename({
		items,
		onRename,
		onRenamingChange,
		onSelectionChange,
		renamingId,
		selectedIds,
	});
	const [focusId, setFocusId] = useState<string>();
	const anchor = useRef<string>(undefined);
	const typeahead = useRef({ text: "", time: 0 });
	const enabledIds = items
		.filter((item) => !item.disabled)
		.map((item) => item.id);
	const tabStop =
		enabledIds.find((id) => id === focusId) ??
		enabledIds.find((id) => selectedIds.includes(id)) ??
		enabledIds[0];
	const select = useCallback(
		(id: string, extend: boolean, toggle: boolean) => {
			if (extend) {
				anchor.current ??= selectedIds[0] ?? id;
			} else {
				anchor.current = id;
			}
			onSelectionChange(
				selectFileIds(enabledIds, selectedIds, id, {
					anchor: anchor.current,
					extend,
					toggle,
				})
			);
			setFocusId(id);
		},
		[enabledIds, onSelectionChange, selectedIds]
	);
	const click = useCallback(
		(event: MouseEvent<HTMLFieldSetElement>) => {
			const button = fileButton(event.target);
			const id = button?.dataset.fileId;
			if (id && !button.disabled) {
				select(id, event.shiftKey, isAdditiveSelection(event));
			} else if (event.target === event.currentTarget) {
				anchor.current = undefined;
				onSelectionChange([]);
			}
		},
		[onSelectionChange, select]
	);
	const open = useCallback(
		(event: MouseEvent<HTMLFieldSetElement>) => {
			const button = fileButton(event.target);
			if (button?.dataset.fileId && !button.disabled) {
				onOpen?.(button.dataset.fileId);
			}
		},
		[onOpen]
	);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLFieldSetElement>) => {
			const id = fileButton(event.target)?.dataset.fileId;
			if (!id || event.nativeEvent.isComposing) {
				return;
			}
			const additive = isAdditiveSelection(event);
			if (
				rename.key(event, id) ||
				requestFileOpen(event, id, onOpen) ||
				requestFilePreview(event, id, onQuickLook)
			) {
				return;
			}
			const buttons = [
				...event.currentTarget.querySelectorAll<HTMLButtonElement>(
					"button[data-file-id]:not(:disabled)"
				),
			];
			if (event.key === "Escape") {
				event.preventDefault();
				anchor.current = undefined;
				onSelectionChange([]);
				return;
			}
			if (additive && event.key.toLowerCase() === "a") {
				event.preventDefault();
				onSelectionChange(enabledIds);
				return;
			}
			const typed = typeaheadTarget(event, items, id, typeahead.current);
			const next = navigationTarget(event.key, buttons, id) ?? typed;
			if (event.key.startsWith("Arrow") || next) {
				event.preventDefault();
			}
			if (!next) {
				return;
			}
			const button = buttons.find((entry) => entry.dataset.fileId === next);
			focusFileTarget(button);
			select(next, event.shiftKey, event.shiftKey && additive);
		},
		[
			enabledIds,
			items,
			onOpen,
			onQuickLook,
			onSelectionChange,
			select,
			rename.key,
		]
	);
	const focus = useCallback((event: FocusEvent<HTMLFieldSetElement>) => {
		const id = fileButton(event.target)?.dataset.fileId;
		if (id) {
			setFocusId(id);
		}
	}, []);
	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Delegated events come from the native file buttons; the group also clears selection on its empty background.
		<fieldset
			aria-label={label}
			className={`mac-file-grid ${className}`}
			data-active={active}
			onClick={click}
			onDoubleClick={open}
			onFocus={focus}
			onKeyDown={keyDown}
			style={style}
		>
			{items.map((file) => (
				<div className="mac-file-grid-item" key={file.id}>
					<MacFileItem
						data-file-id={file.id}
						data-renaming={rename.id === file.id || undefined}
						file={file}
						selected={selectedIds.includes(file.id)}
						showExtensions={showExtensions}
						tabIndex={rename.id !== file.id && file.id === tabStop ? 0 : -1}
					/>
					{rename.id === file.id && onRename ? (
						<FileRenameField
							file={file}
							multiline
							onCommit={onRename}
							onEnd={rename.end}
							validate={validateRename}
						/>
					) : null}
				</div>
			))}
		</fieldset>
	);
}

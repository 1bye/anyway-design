/** biome-ignore-all lint/performance/noJsxPropsBind: Local Finder playground handlers. */
import { MacButton } from "@anyway-design/macos/controls";
import { MacFileColumns } from "@anyway-design/macos/file-columns";
import { MacFileGallery } from "@anyway-design/macos/file-gallery";
import {
	MacFileIcon,
	MacFolderPreviewIcon,
} from "@anyway-design/macos/file-icons";
import {
	type MacFileInfoChanges,
	MacGetInfo,
} from "@anyway-design/macos/file-info";
import { MacFileList } from "@anyway-design/macos/file-list";
import { flattenFileList } from "@anyway-design/macos/file-list-tree";
import { MacFileThumbnail } from "@anyway-design/macos/file-thumbnail";
import { MacFileGrid } from "@anyway-design/macos/files";
import { MacQuickLook } from "@anyway-design/macos/quick-look";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { COLUMN_REFERENCE_ITEMS } from "./file-columns-reference-data";
import { GALLERY_ACTIONS } from "./file-gallery-reference-data";
import {
	FOLDER_LIST_EXPANDED_IDS,
	FOLDER_LIST_REFERENCE_ITEMS,
} from "./folder-list-reference-data";
import type { PlaygroundDemoProps } from "./playground-catalog";
import {
	PLAYGROUND_FILES,
	PLAYGROUND_GALLERY,
	PLAYGROUND_SYMBOLS,
} from "./playground-data";
import { useFinderFolderCreation } from "./use-finder-folder-creation";

export function FilesDemo({ entry, values, onEvent }: PlaygroundDemoProps) {
	const browserRef = useRef<HTMLDivElement>(null);
	const getSourceElement = useCallback((id: string) => {
		const files =
			browserRef.current?.querySelectorAll<HTMLElement>("[data-file-id]") ?? [];
		const file = [...files].find((element) => element.dataset.fileId === id);
		return (
			file?.querySelector<HTMLElement>(
				".mac-file-artwork, .mac-file-list-icon"
			) ??
			file ??
			null
		);
	}, []);
	const nested = entry.id === "folder-list" || entry.id === "file-columns";
	const [items, setItems] = useState(() => {
		if (entry.id === "file-columns") {
			return COLUMN_REFERENCE_ITEMS;
		}
		if (entry.id === "folder-list") {
			return FOLDER_LIST_REFERENCE_ITEMS;
		}
		return PLAYGROUND_FILES;
	});
	const [infoChanges, setInfoChanges] = useState<
		Record<string, MacFileInfoChanges>
	>({});
	const [selected, setSelected] = useState<string[]>(
		nested ? ["Design resources/Brand"] : ["brief"]
	);
	const [column, setColumn] = useState<string | undefined>(
		"Design resources/Brand"
	);
	const [quickLook, setQuickLook] = useState(false);
	const [info, setInfo] = useState(false);
	const [target, setTarget] = useState("brief");
	const creation = useFinderFolderCreation(items, setItems, setSelected);
	const select = (ids: string[]) => {
		setSelected(ids);
		onEvent(`onSelectionChange → ${JSON.stringify(ids)}`);
	};
	const preview = (id: string) => {
		setTarget(id);
		setQuickLook(true);
		onEvent(`onQuickLook → ${id}`);
	};
	const inspect = (id: string) => {
		setTarget(id);
		setInfo(true);
		onEvent(`onGetInfo → ${id}`);
	};
	const allFiles = flattenFileList(items, {
		column: "name",
		direction: "ascending",
	}).map((row) => row.file);
	const current = allFiles.find((file) => file.id === target) ?? items[0];
	const props = {
		active: Boolean(values.active),
		items,
		label: "Playground files",
		onGetInfo: inspect,
		onNewFolder: creation.create,
		onOpen: (id: string) => onEvent(`onOpen → ${id}`),
		onQuickLook: preview,
		onRename: (id: string, name: string) => {
			creation.rename(id, name);
			onEvent(`onRename → ${name}`);
		},
		onRenamingChange: creation.setRenamingId,
		onSelectionChange: select,
		renamingId: creation.renamingId,
		selectedIds: selected,
		showExtensions: Boolean(values.showExtensions),
		validateRename: creation.validate,
	};
	let browser = (
		<MacFileGrid
			{...props}
			style={
				{
					"--mac-file-icon-size": `${Number(values.iconSize ?? 64)}px`,
					"--mac-file-row-height": `${Number(values.iconSize ?? 64) + 48}px`,
				} as CSSProperties
			}
		/>
	);
	if (entry.id === "file-list" || entry.id === "folder-list") {
		browser = (
			<MacFileList
				{...props}
				defaultExpandedIds={FOLDER_LIST_EXPANDED_IDS}
				minRows={12}
				resizable={entry.id === "folder-list" || Boolean(values.resizable)}
			/>
		);
	}
	if (entry.id === "file-columns") {
		browser = (
			<MacFileColumns
				{...props}
				onValueChange={(id, ids) => {
					setColumn(id);
					select(ids);
				}}
				resizable={Boolean(values.resizable)}
				showPreview={Boolean(values.showPreview)}
				value={column}
			/>
		);
	}
	return (
		<div className="pg-files-demo">
			<div className="pg-file-actions">
				<MacButton onClick={() => creation.create()} size="small">
					New Folder
				</MacButton>
				<MacButton
					disabled={selected.length !== 1}
					onClick={() => creation.setRenamingId(selected[0])}
					size="small"
				>
					Rename
				</MacButton>
				<MacButton
					disabled={selected.length !== 1}
					onClick={() => preview(selected[0])}
					size="small"
				>
					Quick Look
				</MacButton>
				<MacButton
					disabled={selected.length !== 1}
					onClick={() => inspect(selected[0])}
					size="small"
				>
					Get Info
				</MacButton>
			</div>
			<div className="pg-file-browser" ref={browserRef}>
				{browser}
			</div>
			<MacQuickLook
				getSourceElement={getSourceElement}
				items={allFiles.map((file) => ({
					...file,
					preview:
						file.kind === "image" ? { src: "/assets/clouds.webp" } : undefined,
				}))}
				onOpenChange={setQuickLook}
				onValueChange={setTarget}
				open={quickLook}
				value={target}
			/>
			<MacGetInfo
				file={{ ...current, ...infoChanges[current.id] }}
				onInfoChange={(_, changes) => {
					setInfoChanges({
						...infoChanges,
						[current.id]: { ...infoChanges[current.id], ...changes },
					});
					onEvent(`onInfoChange → ${JSON.stringify(changes)}`);
				}}
				onOpenChange={setInfo}
				onRename={creation.rename}
				open={info}
			/>
		</div>
	);
}
export function GalleryDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [selected, setSelected] = useState(["clouds"]);
	return (
		<div className="pg-gallery-example">
			<MacFileGallery
				actions={GALLERY_ACTIONS}
				active={Boolean(values.active)}
				items={PLAYGROUND_GALLERY}
				onAction={(id, ids) => onEvent(`onAction → ${id} · ${ids.join(", ")}`)}
				onOpen={(id) => onEvent(`onOpen → ${id}`)}
				onSelectionChange={(ids) => {
					setSelected(ids);
					onEvent(`onSelectionChange → ${JSON.stringify(ids)}`);
				}}
				selectedIds={selected}
				showInfo={Boolean(values.showInfo)}
			/>
		</div>
	);
}
export function FileIconsDemo({ values }: PlaygroundDemoProps) {
	return (
		<div
			className="pg-icon-grid"
			style={
				{ "--pg-icon-size": `${Number(values.iconSize)}px` } as CSSProperties
			}
		>
			{(["folder", "document", "pdf", "text", "image", "archive"] as const).map(
				(name) => (
					<div key={name}>
						<MacFileIcon name={name} />
						<span>{name}</span>
					</div>
				)
			)}
			<div>
				<MacFolderPreviewIcon />
				<span>folder preview</span>
			</div>
		</div>
	);
}
export function ThumbnailDemo({ values, onEvent }: PlaygroundDemoProps) {
	const [image, setImage] = useState<string>();
	useEffect(
		() => () => {
			if (image) {
				URL.revokeObjectURL(image);
			}
		},
		[image]
	);
	return (
		<div className="pg-thumbnail-example">
			<MacFileThumbnail
				alt="Sample thumbnail"
				fit={values.fit === "cover" ? "cover" : "contain"}
				presentation={values.presentation === "document" ? "document" : "image"}
				src={image ?? "/assets/clouds.webp"}
			/>
			<label className="pg-upload-label">
				Use your image
				<input
					accept="image/*"
					onChange={(event) => {
						const file = event.currentTarget.files?.[0];
						if (file?.type.startsWith("image/")) {
							setImage(URL.createObjectURL(file));
							onEvent(`Local image → ${file.name}`);
						}
					}}
					type="file"
				/>
			</label>
		</div>
	);
}
export function SymbolsDemo({
	values,
	onEvent,
	onPropertyChange,
}: PlaygroundDemoProps) {
	return (
		<div className="pg-symbol-grid">
			{PLAYGROUND_SYMBOLS.map((name) => (
				<button
					aria-pressed={values.name === name}
					key={name}
					onClick={() => {
						onPropertyChange("name", name);
						onEvent(`WindowSymbol → ${name}`);
					}}
					type="button"
				>
					<WindowSymbol name={name} size={Number(values.iconSize)} />
					<span>{name}</span>
				</button>
			))}
		</div>
	);
}

import {
	type CSSProperties,
	type MouseEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { FileColumnArt } from "./file-column-preview";
import {
	fileGalleryDetails,
	fileGallerySelection,
	fileGalleryTags,
	type MacFileGalleryItem,
} from "./file-gallery-model";
import { MacFileIcon } from "./file-icons";
import { FILE_KIND_LABELS } from "./file-list-tree";
import { MacFileThumbnail } from "./file-thumbnail";
import { MacFileGrid } from "./files";

export type { MacFileGalleryItem } from "./file-gallery-model";

const FOLDER_PREVIEW = new URL(
	"./assets/native-file-icons/folder-preview.png",
	import.meta.url
).href;

function GalleryFolderIcon() {
	return (
		<img
			alt=""
			className="mac-file-icon"
			draggable={false}
			height={64}
			src={FOLDER_PREVIEW}
			width={64}
		/>
	);
}

export interface MacFileGalleryAction {
	disabled?: boolean;
	icon: ReactNode;
	id: string;
	label: string;
}

export interface MacFileGalleryProps {
	actions?: readonly MacFileGalleryAction[];
	active?: boolean;
	className?: string;
	defaultExpandedInfo?: boolean;
	items: readonly MacFileGalleryItem[];
	label?: string;
	onAction?: (actionId: string, selectedIds: string[]) => void;
	onEditTags?: (selectedIds: string[]) => void;
	onOpen?: (id: string) => void;
	onQuickLook?: (id: string) => void;
	onSelectionChange: (ids: string[]) => void;
	renderPreview?: (file: MacFileGalleryItem) => ReactNode;
	selectedIds: readonly string[];
	showInfo?: boolean;
	style?: CSSProperties;
}

function GalleryArtwork({ file }: { file: MacFileGalleryItem }) {
	return (
		<FileColumnArt
			file={{
				...file,
				preview: {
					...file.preview,
					src:
						file.preview?.src ??
						(file.preview?.text === undefined ? file.thumbnail : undefined),
				},
			}}
		/>
	);
}

function GalleryTags({
	tags,
	onEdit,
	multiple,
}: {
	multiple: boolean;
	onEdit?: () => void;
	tags: MacFileGalleryItem["tags"];
}) {
	if (tags?.length) {
		return (
			<div className="mac-file-column-tags">
				{tags.map((tag) => (
					<span key={tag.label}>
						<i style={{ background: tag.color }} />
						{tag.label}
					</span>
				))}
			</div>
		);
	}
	if (onEdit) {
		return (
			<button
				className="mac-file-gallery-add-tags"
				onClick={onEdit}
				type="button"
			>
				Add Tags…
			</button>
		);
	}
	return (
		<p className="mac-file-gallery-no-tags">
			{multiple ? "No common tags" : "No tags"}
		</p>
	);
}

function GalleryInformation({
	files,
	defaultExpanded,
	onEditTags,
}: {
	defaultExpanded: boolean;
	files: readonly MacFileGalleryItem[];
	onEditTags?: () => void;
}) {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const toggle = useCallback(() => setExpanded((value) => !value), []);
	const detailsId = useId();
	const file = files.length === 1 ? files[0] : undefined;
	const details = fileGalleryDetails(files);
	const more = file?.preview?.moreDetails;
	const tags = fileGalleryTags(files);
	const icon = file?.icon ?? <MacFileIcon name={file?.kind ?? "document"} />;
	return (
		<div className="mac-file-gallery-information">
			<header className="mac-file-gallery-heading">
				<span aria-hidden="true" className="mac-file-gallery-small-art">
					{file?.thumbnail ? (
						<MacFileThumbnail
							presentation={file.thumbnailStyle}
							src={file.thumbnail}
						/>
					) : (
						icon
					)}
				</span>
				<div>
					<h3>{file?.name ?? `${files.length} items`}</h3>
					{file ? (
						<p>
							{[
								file.kindLabel ?? FILE_KIND_LABELS[file.kind ?? "document"],
								file.sizeLabel,
							]
								.filter(Boolean)
								.join(" - ")}
						</p>
					) : null}
				</div>
			</header>
			{details.length || more?.length ? (
				<>
					<div className="mac-file-gallery-info-title">
						<h4>Information</h4>
						{more?.length ? (
							<button
								aria-controls={detailsId}
								aria-expanded={expanded}
								onClick={toggle}
								type="button"
							>
								{expanded ? "Show Less" : "Show More"}
							</button>
						) : null}
					</div>
					<dl id={detailsId}>
						{[...details, ...(expanded && more ? more : [])].map((detail) => (
							<div key={detail.label}>
								<dt>{detail.label}</dt>
								<dd>{detail.value}</dd>
							</div>
						))}
					</dl>
				</>
			) : null}
			<h4 className="mac-file-gallery-tags-title">Tags</h4>
			<GalleryTags
				multiple={files.length > 1}
				onEdit={onEditTags}
				tags={tags}
			/>
		</div>
	);
}

/** Gallery works on supplied previews and metadata; opening remains a callback. */
export function MacFileGallery({
	items,
	selectedIds,
	onSelectionChange,
	onOpen,
	onQuickLook,
	actions,
	onAction,
	onEditTags,
	active = true,
	defaultExpandedInfo = false,
	showInfo = true,
	renderPreview,
	label = "Files",
	className = "",
	style,
}: MacFileGalleryProps) {
	const root: RefObject<HTMLElement | null> = useRef(null);
	const displayItems = useMemo(
		() =>
			items.map((entry) =>
				entry.kind === "folder" && !entry.icon
					? { ...entry, icon: <GalleryFolderIcon /> }
					: entry
			),
		[items]
	);
	const files = useMemo(
		() => fileGallerySelection(displayItems, selectedIds),
		[displayItems, selectedIds]
	);
	const file = files.length === 1 ? files[0] : undefined;
	const selectionKey = JSON.stringify(files.map((entry) => entry.id));
	useLayoutEffect(() => {
		if (files.length !== selectedIds.length) {
			onSelectionChange(files.map((entry) => entry.id));
		}
	}, [files, selectedIds.length, onSelectionChange]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: Selection and data changes reposition filmstrip buttons before measuring their offsets.
	useLayoutEffect(() => {
		const strip = root.current?.querySelector<HTMLElement>(".mac-file-grid");
		if (!strip) {
			return;
		}
		const reveal = () => {
			const selected = (
				strip.querySelector<HTMLElement>(".mac-file-item:focus") ??
				strip.querySelector<HTMLElement>(".mac-file-item[aria-pressed='true']")
			)?.parentElement;
			if (!selected) {
				return;
			}
			const left = selected.offsetLeft;
			const right = left + selected.offsetWidth;
			if (left < strip.scrollLeft) {
				strip.scrollLeft = left;
			} else if (right > strip.scrollLeft + strip.clientWidth) {
				strip.scrollLeft = right - strip.clientWidth;
			}
		};
		const observer = new ResizeObserver(reveal);
		observer.observe(strip);
		reveal();
		return () => observer.disconnect();
	}, [selectionKey, items]);
	const action = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const id = event.currentTarget.dataset.action;
			if (id && files.length) {
				onAction?.(
					id,
					files.map((entry) => entry.id)
				);
			}
		},
		[files, onAction]
	);
	const editTags = useCallback(
		() => onEditTags?.(files.map((entry) => entry.id)),
		[files, onEditTags]
	);
	return (
		<section
			aria-label={label}
			className={`mac-file-gallery ${className}`}
			data-active={active}
			data-info={showInfo}
			ref={root}
			style={style}
		>
			<div className="mac-file-gallery-layout">
				<div className="mac-file-gallery-browser">
					<section
						aria-label={file ? `Preview of ${file.name}` : "Gallery preview"}
						className="mac-file-gallery-stage"
					>
						{files.length ? (
							<div className="mac-file-gallery-stack" data-multiple={!file}>
								{(file ? [file] : files.slice(-3)).map((entry) => (
									<div
										className="mac-file-gallery-art"
										data-presentation={entry.preview?.presentation ?? "image"}
										key={`${entry.id}:${entry.preview?.src ?? entry.thumbnail ?? ""}`}
									>
										{renderPreview ? (
											renderPreview(entry)
										) : (
											<GalleryArtwork file={entry} />
										)}
									</div>
								))}
							</div>
						) : (
							<p className="mac-file-gallery-empty" role="status">
								{items.some((entry) => !entry.disabled)
									? "Select a file to preview"
									: "No files"}
							</p>
						)}
					</section>
					<MacFileGrid
						active={active}
						items={displayItems}
						label={`${label} filmstrip`}
						onOpen={onOpen}
						onQuickLook={onQuickLook}
						onSelectionChange={onSelectionChange}
						selectedIds={files.map((entry) => entry.id)}
					/>
				</div>
				{showInfo ? (
					<aside
						aria-label="File information"
						className="mac-file-gallery-aside"
					>
						{files.length ? (
							<GalleryInformation
								defaultExpanded={defaultExpandedInfo}
								files={files}
								key={selectionKey}
								onEditTags={onEditTags ? editTags : undefined}
							/>
						) : null}
						{files.length && actions?.length && onAction ? (
							<section
								aria-label="Quick actions"
								className="mac-file-gallery-actions"
							>
								{actions.map((entry) => (
									<button
										data-action={entry.id}
										disabled={entry.disabled}
										key={entry.id}
										onClick={action}
										type="button"
									>
										<span aria-hidden="true">{entry.icon}</span>
										{entry.label}
									</button>
								))}
							</section>
						) : null}
					</aside>
				) : null}
			</div>
		</section>
	);
}

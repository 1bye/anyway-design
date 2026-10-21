import { Dialog } from "@base-ui/react/dialog";
import {
	type ChangeEvent,
	type CSSProperties,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { useMacOSPortal } from "./environment";
import { FileColumnArt } from "./file-column-preview";
import { MacFileIcon, MacFolderPreviewIcon } from "./file-icons";
import {
	DEFAULT_INFO_SECTIONS,
	fileInfoDisplayName,
	fileInfoGeneral,
	fileInfoHasExtension,
	type MacFileInfoDetail,
	type MacFileInfoItem,
	type MacGetInfoSection,
} from "./file-info-model";
import { GetInfoNameField } from "./file-info-name";
import type { MacFileRenameProps } from "./file-rename";
import { TrafficLights, type TrafficLightsProps } from "./window";
import { WindowSymbol } from "./window-symbol";

export type { MacFileInfoItem, MacGetInfoSection } from "./file-info-model";

type InfoFlag = "extensionHidden" | "locked" | "shared" | "stationeryPad";
export type MacFileInfoChanges = Partial<
	Pick<MacFileInfoItem, InfoFlag | "comments" | "applicationId">
>;
type InfoChange = (id: string, changes: MacFileInfoChanges) => void;

function closeInfoKey(event: KeyboardEvent<HTMLElement>, onClose: () => void) {
	if (
		(event.metaKey || event.ctrlKey) &&
		!event.altKey &&
		!event.shiftKey &&
		!event.nativeEvent.isComposing &&
		event.key.toLowerCase() === "w"
	) {
		event.preventDefault();
		event.stopPropagation();
		if (!event.repeat) {
			onClose();
		}
	}
}

function InfoArt({ file }: { file: MacFileInfoItem }) {
	if (file.icon) {
		return file.icon;
	}
	return file.kind === "folder" ? (
		<MacFolderPreviewIcon />
	) : (
		<MacFileIcon name={file.kind ?? "document"} />
	);
}

function InfoSection({
	id,
	label,
	open,
	onToggle,
	children,
}: {
	children: ReactNode;
	id: MacGetInfoSection;
	label: string;
	onToggle: (id: MacGetInfoSection) => void;
	open: boolean;
}) {
	const bodyId = useId();
	const toggle = useCallback(() => onToggle(id), [id, onToggle]);
	const key = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
				return;
			}
			event.preventDefault();
			if ((event.key === "ArrowRight") !== open) {
				onToggle(id);
			}
		},
		[id, onToggle, open]
	);
	return (
		<section className="mac-get-info-section" data-section={id}>
			<h3>
				<button
					aria-controls={bodyId}
					aria-expanded={open}
					onClick={toggle}
					onKeyDown={key}
					type="button"
				>
					<WindowSymbol name="chevron-right" size={11} />
					{label}:
				</button>
			</h3>
			<div hidden={!open} id={bodyId}>
				{children}
			</div>
		</section>
	);
}

function InfoDetails({
	details,
	general = false,
}: {
	details: readonly MacFileInfoDetail[];
	general?: boolean;
}) {
	return (
		<dl className="mac-get-info-details" data-general={general}>
			{details.map((entry) => (
				<div key={entry.label}>
					<dt>{entry.label}:</dt>
					<dd>{entry.value}</dd>
				</div>
			))}
		</dl>
	);
}

function InfoCheckbox({
	file,
	flag,
	label,
	disabled = false,
	onChange,
}: {
	disabled?: boolean;
	file: MacFileInfoItem;
	flag: InfoFlag;
	label: string;
	onChange?: InfoChange;
}) {
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onChange?.(file.id, { [flag]: event.target.checked }),
		[file.id, flag, onChange]
	);
	return (
		<label className="mac-get-info-checkbox">
			<span className="mac-get-info-checkbox-box">
				<input
					checked={file[flag] ?? false}
					disabled={disabled || !onChange}
					onChange={change}
					type="checkbox"
				/>
				<WindowSymbol name="check" size={11} />
			</span>
			{label}
		</label>
	);
}

function GeneralInfo({
	file,
	onChange,
}: {
	file: MacFileInfoItem;
	onChange?: InfoChange;
}) {
	const folder = file.kind === "folder";
	return (
		<div className="mac-get-info-general">
			<InfoDetails details={fileInfoGeneral(file)} general />
			<div className="mac-get-info-flags">
				<InfoCheckbox
					file={file}
					flag={folder ? "shared" : "stationeryPad"}
					label={folder ? "Shared folder" : "Stationery pad"}
					onChange={onChange}
				/>
				<InfoCheckbox
					file={file}
					flag="locked"
					label="Locked"
					onChange={onChange}
				/>
			</div>
		</div>
	);
}

// shortcut: Permissions are read-only; add editing when an owning storage adapter exists.
function InfoPermissions({ file }: { file: MacFileInfoItem }) {
	return (
		<div className="mac-get-info-permissions">
			<p>{file.permissions?.summary}</p>
			<table aria-label="Sharing & Permissions">
				<thead>
					<tr>
						<th scope="col">Name</th>
						<th scope="col">Privilege</th>
					</tr>
				</thead>
				<tbody>
					{file.permissions?.entries.map((entry) => (
						<tr key={entry.id}>
							<td>{entry.name}</td>
							<td>{entry.privilege}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function InfoOpenWith({
	file,
	onChange,
	onChangeAll,
}: {
	file: MacFileInfoItem;
	onChange?: InfoChange;
	onChangeAll?: (id: string) => void;
}) {
	const change = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) =>
			onChange?.(file.id, { applicationId: event.target.value }),
		[file.id, onChange]
	);
	const all = useCallback(() => onChangeAll?.(file.id), [file.id, onChangeAll]);
	return (
		<div className="mac-get-info-open-with">
			<select
				aria-label="Open with"
				disabled={!onChange}
				onChange={change}
				value={file.applicationId}
			>
				{file.applications?.map((application) => (
					<option key={application.id} value={application.id}>
						{application.label}
					</option>
				))}
			</select>
			<p>Use this application to open all documents like this one.</p>
			<button
				disabled={
					!onChangeAll || file.applicationId === file.defaultApplicationId
				}
				onClick={all}
				type="button"
			>
				Change All…
			</button>
		</div>
	);
}

export interface MacGetInfoPanelProps
	extends Pick<MacFileRenameProps, "onRename" | "validateRename">,
		TrafficLightsProps {
	className?: string;
	defaultExpandedSections?: readonly MacGetInfoSection[];
	expandedSections?: readonly MacGetInfoSection[];
	file: MacFileInfoItem;
	onChangeAll?: (id: string) => void;
	onClose: () => void;
	onEditTags?: (id: string) => void;
	onExpandedSectionsChange?: (sections: MacGetInfoSection[]) => void;
	onInfoChange?: InfoChange;
	style?: CSSProperties;
}

export function MacGetInfoPanel({
	file,
	active = true,
	onClose,
	onMinimize,
	onZoom,
	onRename,
	validateRename,
	onInfoChange,
	onChangeAll,
	onEditTags,
	expandedSections,
	defaultExpandedSections = DEFAULT_INFO_SECTIONS,
	onExpandedSectionsChange,
	className = "",
	style,
}: MacGetInfoPanelProps) {
	const titleId = useId();
	const [internal, setInternal] = useState(defaultExpandedSections);
	const expanded = expandedSections ?? internal;
	const toggle = useCallback(
		(id: MacGetInfoSection) => {
			const next = expanded.includes(id)
				? expanded.filter((entry) => entry !== id)
				: [...expanded, id];
			if (expandedSections === undefined) {
				setInternal(next);
			}
			onExpandedSectionsChange?.(next);
		},
		[expanded, expandedSections, onExpandedSectionsChange]
	);
	const editTags = useCallback(
		() => onEditTags?.(file.id),
		[file.id, onEditTags]
	);
	const comments = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) =>
			onInfoChange?.(file.id, { comments: event.target.value }),
		[file.id, onInfoChange]
	);
	const pointer = useCallback((event: PointerEvent<HTMLElement>) => {
		if (
			event.target instanceof Element &&
			event.target.closest(".mac-traffic-close")
		) {
			event.preventDefault();
		}
	}, []);
	const key = useCallback(
		(event: KeyboardEvent<HTMLElement>) => closeInfoKey(event, onClose),
		[onClose]
	);
	const sections: {
		id: MacGetInfoSection;
		label: string;
		show: boolean;
		content: ReactNode;
	}[] = [
		{
			content: <GeneralInfo file={file} onChange={onInfoChange} />,
			id: "general",
			label: "General",
			show: true,
		},
		{
			content: (
				<div className="mac-get-info-more">
					<InfoDetails details={file.moreInfo ?? []} />
				</div>
			),
			id: "more",
			label: "More Info",
			show: file.moreInfo !== undefined,
		},
		{
			content: (
				<>
					<GetInfoNameField
						file={file}
						key={file.id}
						onRename={onRename}
						validateRename={validateRename}
					/>
					<div className="mac-get-info-hide-extension">
						<InfoCheckbox
							disabled={!fileInfoHasExtension(file) || file.locked}
							file={file}
							flag="extensionHidden"
							label="Hide extension"
							onChange={onInfoChange}
						/>
					</div>
				</>
			),
			id: "name",
			label: "Name & Extension",
			show: true,
		},
		{
			content: (
				<div className="mac-get-info-comments">
					<textarea
						aria-label="Comments"
						onChange={comments}
						readOnly={!onInfoChange}
						value={file.comments ?? ""}
					/>
				</div>
			),
			id: "comments",
			label: "Comments",
			show: true,
		},
		{
			content: (
				<InfoOpenWith
					file={file}
					onChange={onInfoChange}
					onChangeAll={onChangeAll}
				/>
			),
			id: "open-with",
			label: "Open with",
			show: Boolean(file.applications?.length),
		},
		{
			content: (
				<div className="mac-get-info-preview">
					<FileColumnArt
						file={{ ...file, icon: <InfoArt file={file} /> }}
						key={`${file.id}:${file.preview?.src ?? ""}`}
					/>
				</div>
			),
			id: "preview",
			label: "Preview",
			show: true,
		},
		{
			content: <InfoPermissions file={file} />,
			id: "permissions",
			label: "Sharing & Permissions",
			show: Boolean(file.permissions),
		},
	];
	return (
		<section
			aria-labelledby={titleId}
			className={`mac-get-info-panel ${className}`}
			data-active={active}
			onKeyDownCapture={key}
			style={style}
		>
			{/* Closing discards an unfinished name before a blur can commit it. */}
			<header className="mac-get-info-titlebar" onPointerDownCapture={pointer}>
				<TrafficLights
					active={active}
					onClose={onClose}
					onMinimize={onMinimize}
					onZoom={onZoom}
				/>
				<span aria-hidden="true" className="mac-get-info-title-icon">
					<InfoArt file={file} />
				</span>
				<h2 id={titleId}>{fileInfoDisplayName(file)} Info</h2>
			</header>
			<div className="mac-get-info-body">
				<header className="mac-get-info-summary">
					<span aria-hidden="true">
						<InfoArt file={file} />
					</span>
					<strong>{fileInfoDisplayName(file)}</strong>
					<span className="mac-get-info-size">{file.sizeLabel}</span>
					<p>{file.modifiedLabel ? `Modified: ${file.modifiedLabel}` : ""}</p>
				</header>
				<button
					aria-label={file.tags?.length ? "Edit tags" : "Add Tags"}
					className="mac-get-info-tags"
					disabled={!onEditTags}
					onClick={editTags}
					type="button"
				>
					{file.tags?.length
						? file.tags.map((tag) => (
								<span key={tag.label}>
									<i style={{ background: tag.color }} />
									{tag.label}
								</span>
							))
						: "Add Tags…"}
				</button>
				{sections
					.filter((section) => section.show)
					.map((section) => (
						<InfoSection
							id={section.id}
							key={section.id}
							label={section.label}
							onToggle={toggle}
							open={expanded.includes(section.id)}
						>
							{section.content}
						</InfoSection>
					))}
			</div>
		</section>
	);
}

export interface MacGetInfoProps extends Omit<MacGetInfoPanelProps, "onClose"> {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	returnFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
}

export function MacGetInfo({
	open,
	onOpenChange,
	returnFocus,
	...props
}: MacGetInfoProps) {
	const container = useMacOSPortal();
	const popup = useRef<HTMLDivElement>(null);
	const close = useCallback(() => onOpenChange(false), [onOpenChange]);
	const key = useCallback(
		(event: KeyboardEvent<HTMLElement>) => closeInfoKey(event, close),
		[close]
	);
	const change = useCallback(
		(value: boolean, details: Dialog.Root.ChangeEventDetails) => {
			if (details.reason === "escape-key") {
				details.cancel();
				return;
			}
			onOpenChange(value);
		},
		[onOpenChange]
	);
	return (
		<Dialog.Root
			disablePointerDismissal
			modal={false}
			onOpenChange={change}
			open={open}
		>
			<Dialog.Portal container={container}>
				<Dialog.Popup
					aria-describedby={undefined}
					className="mac-get-info-dialog"
					finalFocus={returnFocus}
					initialFocus={popup}
					onKeyDownCapture={key}
					ref={popup}
				>
					<Dialog.Title className="mac-file-dialog-sr-only">
						{fileInfoDisplayName(props.file)} Info
					</Dialog.Title>
					<MacGetInfoPanel {...props} onClose={close} />
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

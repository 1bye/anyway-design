import { Dialog } from "@base-ui/react/dialog";
import {
	type CSSProperties,
	type KeyboardEvent,
	type RefObject,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useMacOSPortal } from "./environment";
import { MacFileIcon } from "./file-icons";
import type { MacFile } from "./files";
import { quickLookNeighbor } from "./quick-look-navigation";
import { quickLookTransition } from "./quick-look-transition";
import { WindowSymbol } from "./window-symbol";

export interface MacQuickLookItem extends MacFile {
	openLabel?: string;
	preview?: {
		alt?: string;
		presentation?: "image" | "document";
		src: string;
	};
	subtitle?: string;
}

export interface MacQuickLookPanelProps {
	className?: string;
	expanded?: boolean;
	item: MacQuickLookItem;
	nextDisabled?: boolean;
	onClose: () => void;
	onExpand?: () => void;
	onMarkup?: (id: string) => void;
	onNext?: () => void;
	onOpenFile?: (id: string) => void;
	onPrevious?: () => void;
	onShare?: (id: string) => void;
	previousDisabled?: boolean;
	style?: CSSProperties;
}

function QuickLookContent({ item }: { item: MacQuickLookItem }) {
	const [failed, setFailed] = useState(false);
	const [loading, setLoading] = useState(true);
	const fail = useCallback(() => {
		setFailed(true);
		setLoading(false);
	}, []);
	const loaded = useCallback(() => setLoading(false), []);
	if (!item.preview || failed) {
		return (
			<div className="mac-quick-look-fallback">
				{item.icon ?? <MacFileIcon name={item.kind ?? "document"} />}
				<strong>{item.name}</strong>
				<p>
					{failed
						? "Preview unavailable"
						: (item.subtitle ?? "No preview available")}
				</p>
			</div>
		);
	}
	return (
		<div
			aria-busy={loading}
			className="mac-quick-look-preview"
			data-presentation={item.preview.presentation ?? "image"}
		>
			{loading ? (
				<span className="mac-quick-look-loading" role="status">
					Loading preview…
				</span>
			) : null}
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions lint/correctness/useImageSize: Image lifecycle events handle failures; the fixed preview viewport reserves layout space without knowing source dimensions. */}
			<img
				alt={item.preview.alt ?? item.name}
				draggable={false}
				onError={fail}
				onLoad={loaded}
				src={item.preview.src}
			/>
		</div>
	);
}

/** The same chrome can be embedded in a desktop or rendered by MacQuickLook. */
export function MacQuickLookPanel({
	item,
	onClose,
	onExpand,
	expanded = false,
	onPrevious,
	onNext,
	previousDisabled,
	nextDisabled,
	onOpenFile,
	onShare,
	onMarkup,
	className = "",
	style,
}: MacQuickLookPanelProps) {
	const open = useCallback(() => onOpenFile?.(item.id), [item.id, onOpenFile]);
	const share = useCallback(() => onShare?.(item.id), [item.id, onShare]);
	const markup = useCallback(() => onMarkup?.(item.id), [item.id, onMarkup]);
	return (
		<section
			aria-label={`Quick Look: ${item.name}`}
			className={`mac-quick-look ${className}`}
			style={style}
		>
			<header className="mac-quick-look-toolbar">
				<button
					aria-label="Close Quick Look"
					className="mac-quick-look-round"
					onClick={onClose}
					type="button"
				>
					<WindowSymbol name="quick-look-close" size={16} />
				</button>
				{onExpand ? (
					<button
						aria-label={expanded ? "Exit full size" : "Enter full size"}
						aria-pressed={expanded}
						className="mac-quick-look-round"
						onClick={onExpand}
						type="button"
					>
						<WindowSymbol name="quick-look-fullscreen" size={16} />
					</button>
				) : null}
				{onPrevious || onNext ? (
					<fieldset
						aria-label="Preview navigation"
						className="mac-quick-look-navigation"
					>
						<button
							aria-label="Previous file"
							disabled={previousDisabled || !onPrevious}
							onClick={onPrevious}
							type="button"
						>
							<WindowSymbol name="chevron-left" size={14} />
						</button>
						<button
							aria-label="Next file"
							disabled={nextDisabled || !onNext}
							onClick={onNext}
							type="button"
						>
							<WindowSymbol name="chevron-right" size={14} />
						</button>
					</fieldset>
				) : null}
				<span
					aria-live="polite"
					className="mac-quick-look-title"
					title={item.name}
				>
					{item.name}
				</span>
				<div className="mac-quick-look-actions">
					{onMarkup && item.preview?.presentation === "document" ? (
						<button
							aria-label="Mark up document"
							onClick={markup}
							type="button"
						>
							<WindowSymbol name="markup" size={16} />
						</button>
					) : null}
					{onShare ? (
						<button aria-label="Share file" onClick={share} type="button">
							<WindowSymbol name="share" size={16} />
						</button>
					) : null}
					{onOpenFile ? (
						<button
							className="mac-quick-look-open"
							onClick={open}
							type="button"
						>
							{item.openLabel ?? "Open with Preview"}
						</button>
					) : null}
				</div>
			</header>
			<div className="mac-quick-look-body">
				<QuickLookContent
					item={item}
					key={`${item.id}:${item.preview?.src ?? ""}`}
				/>
			</div>
		</section>
	);
}

export interface MacQuickLookProps {
	getSourceElement?: (id: string) => HTMLElement | null;
	items: readonly MacQuickLookItem[];
	onMarkup?: (id: string) => void;
	onOpenChange: (open: boolean) => void;
	onOpenFile?: (id: string) => void;
	onShare?: (id: string) => void;
	onValueChange: (id: string) => void;
	open: boolean;
	returnFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
	style?: CSSProperties;
	value: string;
}

function isEditable(target: EventTarget) {
	return (
		target instanceof Element &&
		Boolean(target.closest("input, textarea, select, [contenteditable=true]"))
	);
}

export function MacQuickLook({
	items,
	value,
	onValueChange,
	open,
	onOpenChange,
	onOpenFile,
	onShare,
	onMarkup,
	returnFocus,
	getSourceElement,
	style,
}: MacQuickLookProps) {
	const container = useMacOSPortal();
	const popup = useRef<HTMLDivElement>(null);
	const [expanded, setExpanded] = useState(false);
	const current = quickLookNeighbor(items, value, 0);
	const previous = quickLookNeighbor(items, current?.id ?? "", -1);
	const next = quickLookNeighbor(items, current?.id ?? "", 1);
	const multiple = items.filter((item) => !item.disabled).length > 1;
	const updateSourceMotion = useCallback(
		(node: HTMLDivElement | null) => {
			const view = node?.ownerDocument.defaultView;
			if (!(node && view)) {
				return;
			}
			const element = current && getSourceElement?.(current.id);
			const width = node.offsetWidth;
			const height = node.offsetHeight;
			const origin = quickLookTransition(
				element?.isConnected ? element.getBoundingClientRect() : undefined,
				{
					height,
					width,
					x: (view.innerWidth - width) / 2,
					y: (view.innerHeight - height) / 2,
				},
				{ height: view.innerHeight, width: view.innerWidth }
			);
			node.style.setProperty("--mac-quick-look-from-x", `${origin?.x ?? 0}px`);
			node.style.setProperty("--mac-quick-look-from-y", `${origin?.y ?? 0}px`);
			node.style.setProperty(
				"--mac-quick-look-from-scale",
				`${origin?.scale ?? 1}`
			);
			node.toggleAttribute("data-source-motion", Boolean(origin));
		},
		[current, getSourceElement]
	);
	const setPopup = useCallback(
		(node: HTMLDivElement | null) => {
			popup.current = node;
			updateSourceMotion(node);
		},
		[updateSourceMotion]
	);
	useLayoutEffect(() => {
		if (!open) {
			updateSourceMotion(popup.current);
		}
	}, [open, updateSourceMotion]);
	const close = useCallback(() => onOpenChange(false), [onOpenChange]);
	const expand = useCallback(() => setExpanded((was) => !was), []);
	const goPrevious = useCallback(() => {
		if (previous) {
			onValueChange(previous.id);
		}
	}, [previous, onValueChange]);
	const goNext = useCallback(() => {
		if (next) {
			onValueChange(next.id);
		}
	}, [next, onValueChange]);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (
				event.defaultPrevented ||
				event.nativeEvent.isComposing ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				isEditable(event.target)
			) {
				return;
			}
			if (
				event.key === " " &&
				!(event.target instanceof Element && event.target.closest("button, a"))
			) {
				event.preventDefault();
				if (!event.repeat) {
					close();
				}
			} else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
				event.preventDefault();
				if (event.key === "ArrowLeft") {
					goPrevious();
				} else {
					goNext();
				}
			}
		},
		[close, goPrevious, goNext]
	);
	return (
		<Dialog.Root onOpenChange={onOpenChange} open={open && Boolean(current)}>
			<Dialog.Portal container={container}>
				<Dialog.Backdrop className="mac-quick-look-backdrop" />
				<Dialog.Popup
					aria-describedby={undefined}
					className="mac-quick-look-dialog"
					data-expanded={expanded || undefined}
					finalFocus={returnFocus}
					initialFocus={popup}
					onKeyDown={keyDown}
					ref={setPopup}
					style={style}
				>
					<Dialog.Title className="mac-quick-look-sr-only">
						Quick Look: {current?.name}
					</Dialog.Title>
					<Dialog.Close className="mac-quick-look-sr-only" tabIndex={-1}>
						Close preview
					</Dialog.Close>
					{current ? (
						<MacQuickLookPanel
							expanded={expanded}
							item={current}
							nextDisabled={next?.id === current.id}
							onClose={close}
							onExpand={expand}
							onMarkup={onMarkup}
							onNext={multiple ? goNext : undefined}
							onOpenFile={onOpenFile}
							onPrevious={multiple ? goPrevious : undefined}
							onShare={onShare}
							previousDisabled={previous?.id === current.id}
						/>
					) : null}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for the Quick Look study. */
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacFileList, type MacFileSort } from "@1bye/macos/file-list";
import { sortFileList } from "@1bye/macos/file-list-sort";
import { MacFileGrid } from "@1bye/macos/files";
import {
	MacQuickLook,
	type MacQuickLookItem,
	MacQuickLookPanel,
} from "@1bye/macos/quick-look";
import { ArrowLeft } from "lucide-react";
import {
	type CSSProperties,
	type MouseEvent,
	type RefObject,
	type UIEvent,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import "./dock-reference.css";
import "./window-reference.css";
import "./quick-look-reference.css";

const IMAGE: MacQuickLookItem = {
	id: "photo",
	kind: "image",
	name: "Photo 2.webp",
	preview: {
		alt: "Sunlit clouds against a deep blue sky",
		src: "/assets/clouds.webp",
	},
	thumbnail: "/assets/clouds.webp",
};
const ITEMS: MacQuickLookItem[] = [
	IMAGE,
	{
		id: "brief",
		kind: "pdf",
		name: "Project brief.pdf",
		preview: {
			alt: "Studio project brief with an illustration and three design principles",
			presentation: "document",
			src: "/assets/native-quick-look/document-preview.svg",
		},
		thumbnail: "/assets/native-quick-look/document-preview.svg",
	},
	{
		disabled: true,
		id: "offline",
		kind: "document",
		name: "Offline document.pages",
	},
	{
		id: "archive",
		kind: "archive",
		name: "Round one.zip",
		openLabel: "Open with Archive Utility",
		subtitle: "ZIP archive · 158 bytes",
	},
	{
		id: "missing",
		kind: "image",
		name: "Unavailable image.jpg",
		preview: { src: "data:image/png;base64,bm90LWFuLWltYWdl" },
	},
];
const CROPS = {
	actions: { height: 70, label: "Actions", width: 300, x: 423 },
	full: { height: 468, label: "Full preview", width: 723, x: 0 },
	title: { height: 70, label: "Title & controls", width: 340, x: 0 },
} as const;

export function QuickLookReferenceComparison() {
	const [detail, setDetail] = useState<keyof typeof CROPS>("full");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [visible, setVisible] = useState(true);
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("photo");
	const [selected, setSelected] = useState(["photo"]);
	const [list, setList] = useState(false);
	const [sort, setSort] = useState<MacFileSort>({
		column: "name",
		direction: "ascending",
	});
	const ordered = useMemo(
		() => (list ? sortFileList(ITEMS, sort) : ITEMS),
		[list, sort]
	);
	const [dark, setDark] = useState(false);
	const [narrow, setNarrow] = useState(false);
	const [reduceMotion, setReduceMotion] = useState(false);
	const [notice, setNotice] = useState("");
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const files = useRef<HTMLDivElement>(null);
	const launchSource = useRef<{
		element: HTMLElement | null;
		id: string;
		trigger?: HTMLElement;
	} | null>(null);
	const fileSource = useCallback((id: string) => {
		const file = [
			...(files.current?.querySelectorAll<HTMLElement>("[data-file-id]") ?? []),
		].find((entry) => entry.dataset.fileId === id);
		return (
			file?.querySelector<HTMLElement>(
				".mac-file-artwork, .mac-file-list-icon"
			) ??
			file ??
			null
		);
	}, []);
	const getSourceElement = useCallback(
		(id: string) =>
			launchSource.current?.id === id
				? launchSource.current.element
				: fileSource(id),
		[fileSource]
	);
	const crop = CROPS[detail];
	const width = crop.width + 48;
	const scale = zoom === "fit" ? fit : Number(zoom);
	useLayoutEffect(() => {
		const el = live.current;
		if (!el) {
			return;
		}
		const resize = () => setFit(Math.min(1, el.clientWidth / width));
		const observer = new ResizeObserver(resize);
		observer.observe(el);
		resize();
		return () => observer.disconnect();
	}, [width]);
	const sync = useCallback((event: UIEvent<HTMLElement>) => {
		const from = event.currentTarget;
		const to = from === live.current ? native.current : live.current;
		if (
			to &&
			(Math.abs(to.scrollLeft - from.scrollLeft) > 1 ||
				Math.abs(to.scrollTop - from.scrollTop) > 1)
		) {
			to.scrollTo(from.scrollLeft, from.scrollTop);
		}
	}, []);
	const scrollStart = useCallback(() => {
		live.current?.scrollTo(0, 0);
		native.current?.scrollTo(0, 0);
	}, []);
	const preview = useCallback(
		(id: string) => {
			launchSource.current = { element: fileSource(id), id };
			setValue(id);
			setSelected([id]);
			setOpen(true);
		},
		[fileSource]
	);
	const previewComparison = useCallback(
		(event?: MouseEvent<HTMLElement>) => {
			preview("photo");
			launchSource.current = {
				element:
					detail === "full"
						? live.current
						: (live.current?.querySelector<HTMLElement>(
								".mac-quick-look-round"
							) ?? null),
				id: "photo",
				trigger: event?.currentTarget,
			};
		},
		[detail, preview]
	);
	const navigate = useCallback((id: string) => {
		setValue(id);
		setSelected([id]);
	}, []);
	const returnFocus = useCallback(() => {
		if (
			launchSource.current?.id === value &&
			launchSource.current.trigger?.isConnected
		) {
			return launchSource.current.trigger;
		}
		return (
			files.current?.querySelector<HTMLElement>(
				'[data-file-id][aria-selected="true"], [data-file-id][aria-pressed="true"]'
			) ?? null
		);
	}, [value]);
	const openFile = useCallback(
		(id: string) =>
			setNotice(
				`Open callback: ${ITEMS.find((item) => item.id === id)?.name ?? id}`
			),
		[]
	);
	const share = useCallback(
		(id: string) =>
			setNotice(
				`Share callback: ${ITEMS.find((item) => item.id === id)?.name ?? id}`
			),
		[]
	);
	const markup = useCallback(
		(id: string) =>
			setNotice(
				`Markup callback: ${ITEMS.find((item) => item.id === id)?.name ?? id}`
			),
		[]
	);
	const reset = useCallback(() => {
		setVisible(true);
		setDetail("full");
		setZoom("fit");
		setNotice("");
		scrollStart();
	}, [scrollStart]);
	return (
		<main
			className="dock-study quick-study"
			style={
				{
					"--quick-study-height": `${crop.height + 48}px`,
					"--quick-study-offset": `${24 - crop.x}px`,
					"--quick-study-width": `${width}px`,
					"--quick-study-zoom": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?view=file-list-reference">
					<ArrowLeft size={15} /> Back to the file-list study
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · QUICK LOOK STUDY</p>
				<h1>A preview, without opening.</h1>
				<p>
					Live React chrome beside Quick Look captured on this Mac, with the
					same image and panel dimensions.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset aria-label="Detail" className="dock-study-jump">
					{(["full", "title", "actions"] as const).map((id) => (
						<button
							aria-pressed={detail === id}
							key={id}
							onClick={() => {
								setDetail(id as keyof typeof CROPS);
								scrollStart();
							}}
							type="button"
						>
							{CROPS[id].label}
						</button>
					))}
				</fieldset>
				<label>
					Shared zoom{" "}
					<select
						onChange={(event) => {
							setZoom(event.target.value);
							scrollStart();
						}}
						value={zoom}
					>
						<option value="fit">Fit both</option>
						<option value="1">1×</option>
						<option value="1.5">1.5×</option>
						<option value="2">2×</option>
					</select>
				</label>
			</div>
			<div className="window-study-controls">
				<button onClick={reset} type="button">
					Reset native match
				</button>
				<button onClick={previewComparison} type="button">
					Try interactive Quick Look
				</button>
				<a href="?view=file-rename-reference">Compare inline rename ↗</a>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our Quick Look</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our Quick Look close-up. Scroll to inspect."
						className="quick-study-viewport"
						onScroll={sync}
						ref={live}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the synchronized comparison viewport.
						tabIndex={0}
					>
						<div className="quick-study-scene">
							<MacOSEnvironment className="quick-study-live" preset="tahoe">
								{visible ? (
									<MacQuickLookPanel
										item={IMAGE}
										onClose={() => setVisible(false)}
										onExpand={previewComparison}
										onOpenFile={openFile}
										onShare={share}
									/>
								) : (
									<button
										className="quick-study-reopen"
										onClick={() => setVisible(true)}
										type="button"
									>
										Reopen Quick Look
									</button>
								)}
							</MacOSEnvironment>
						</div>
					</section>
					<footer>723 × 468 logical pixels · Same source image</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a
							href="/assets/native-quick-look/tahoe-image.jpg"
							rel="noopener"
							target="_blank"
						>
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native Quick Look close-up. Scroll to inspect."
						className="quick-study-viewport"
						onScroll={sync}
						ref={native}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the synchronized comparison viewport.
						tabIndex={0}
					>
						<div className="quick-study-scene">
							<img
								alt="Native Tahoe Quick Look displaying sunlit clouds with close, full screen, share, and Open with Preview controls"
								className="quick-study-native"
								draggable={false}
								height={936}
								src="/assets/native-quick-look/tahoe-image.jpg"
								width={1446}
							/>
						</div>
					</section>
					<footer>Tahoe 26.6.2 · Native capture at 2×</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					The native side is a fixed capture of the demo image. The left panel
					renders its toolbar, frame, and content live. Title & controls and
					Actions provide matching close-ups.
				</p>
				<p>
					The workbench below exercises Space to open, ← / → to change files,
					and Space or Escape to close. Open, Share, and Markup report
					callbacks. Full size expands within the browser; these controls do not
					launch native apps.
				</p>
			</div>
			<section
				aria-labelledby="quick-workbench-heading"
				className="quick-workbench"
			>
				<h2 id="quick-workbench-heading">Select a file. Press Space.</h2>
				<p>
					Images, a supplied document page, an archive fallback, and a failed
					preview. Disabled files are skipped.
				</p>
				<div className="window-study-controls">
					<label>
						<input
							checked={list}
							onChange={(event) => setList(event.target.checked)}
							type="checkbox"
						/>{" "}
						List view
					</label>
					<label>
						<input
							checked={dark}
							onChange={(event) => setDark(event.target.checked)}
							type="checkbox"
						/>{" "}
						Dark file area
					</label>
					<label>
						<input
							checked={narrow}
							onChange={(event) => setNarrow(event.target.checked)}
							type="checkbox"
						/>{" "}
						Narrow container
					</label>
					<label>
						<input
							checked={reduceMotion}
							onChange={(event) => setReduceMotion(event.target.checked)}
							type="checkbox"
						/>{" "}
						Reduce motion
					</label>
					<button
						disabled={!selected.length}
						onClick={() => preview(selected[0] ?? "photo")}
						type="button"
					>
						Quick Look selected
					</button>
				</div>
				<MacOSEnvironment
					appearance={dark ? "dark" : "light"}
					className="quick-workbench-environment"
					preset="tahoe"
					reduceMotion={reduceMotion}
					style={{ maxWidth: narrow ? 340 : 900 }}
				>
					<div className="quick-workbench-files" ref={files}>
						{list ? (
							<MacFileList
								items={ITEMS}
								onOpen={openFile}
								onQuickLook={preview}
								onSelectionChange={setSelected}
								onSortChange={setSort}
								selectedIds={selected}
								sort={sort}
							/>
						) : (
							<MacFileGrid
								items={ITEMS}
								onOpen={openFile}
								onQuickLook={preview}
								onSelectionChange={setSelected}
								selectedIds={selected}
							/>
						)}
					</div>
					<MacQuickLook
						getSourceElement={getSourceElement}
						items={ordered}
						onMarkup={markup}
						onOpenChange={setOpen}
						onOpenFile={openFile}
						onShare={share}
						onValueChange={navigate}
						open={open}
						returnFocus={returnFocus}
						value={value}
					/>
				</MacOSEnvironment>
				<p className="quick-study-limit">
					Document previews use a supplied page image, with scrolling. PDF
					parsing, native annotation tools, and OS window detachment are outside
					this first pass.
				</p>
			</section>
			<p aria-live="polite" className="dock-study-selection">
				{notice || "Select a file in the workbench to try Quick Look."}
			</p>
		</main>
	);
}

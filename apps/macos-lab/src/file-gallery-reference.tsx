/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for this interactive comparison. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import {
	MacFileGallery,
	type MacFileGalleryItem,
} from "@anyway-design/macos/file-gallery";
import { MacQuickLook } from "@anyway-design/macos/quick-look";
import { ArrowLeft } from "lucide-react";
import {
	type CSSProperties,
	type RefObject,
	type UIEvent,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	GALLERY_ACTIONS,
	GALLERY_CROPS,
	GALLERY_ITEMS,
	GALLERY_PRESETS,
} from "./file-gallery-reference-data";
import "./dock-reference.css";
import "./window-reference.css";
import "./file-gallery-reference.css";

const PRESETS = ["image", "text", "folder", "information"] as const;

export function FileGalleryReferenceComparison() {
	const [preset, setPreset] = useState<keyof typeof GALLERY_PRESETS>("image");
	const [generation, setGeneration] = useState(0);
	const [selected, setSelected] = useState<string[]>(["clouds"]);
	const [detail, setDetail] = useState<keyof typeof GALLERY_CROPS>("all");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [dark, setDark] = useState(false);
	const [active, setActive] = useState(false);
	const [narrow, setNarrow] = useState(false);
	const [info, setInfo] = useState(true);
	const [extra, setExtra] = useState(false);
	const [empty, setEmpty] = useState(false);
	const [broken, setBroken] = useState(false);
	const [notice, setNotice] = useState("");
	const [quickLook, setQuickLook] = useState(false);
	const [previewId, setPreviewId] = useState("clouds");
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const crop = GALLERY_CROPS[detail];
	const sceneWidth = crop.width + 32;
	const sceneHeight = crop.height + 32;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const image = `/assets/native-file-gallery/tahoe-${preset}.png`;
	const files = useMemo<MacFileGalleryItem[]>(() => {
		if (empty) {
			return [];
		}
		const items = GALLERY_ITEMS.map((file) =>
			broken && file.id === "clouds"
				? {
						...file,
						preview: { ...file.preview, src: "/unavailable-preview.webp" },
					}
				: file
		);
		if (!extra) {
			return items;
		}
		return [
			...items,
			{ disabled: true, id: "offline", kind: "image", name: "Offline image" },
			...Array.from({ length: 30 }, (_, index) => ({
				...GALLERY_ITEMS[0],
				id: `image-${index}`,
				kind: "image" as const,
				name: `Cloud study ${index + 1}.webp`,
			})),
		];
	}, [extra, empty, broken]);
	const quickLookItems = useMemo(
		() =>
			files.map((file) => ({
				...file,
				preview: file.preview?.src ? { src: file.preview.src } : undefined,
			})),
		[files]
	);
	const actions =
		selected.length === 1 && selected[0] === "clouds"
			? GALLERY_ACTIONS
			: GALLERY_ACTIONS.slice(-1);
	useLayoutEffect(() => {
		const element = live.current;
		if (!element) {
			return;
		}
		const resize = () => setFit(Math.min(1, element.clientWidth / sceneWidth));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, [sceneWidth]);
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
	const reset = useCallback((state: keyof typeof GALLERY_PRESETS) => {
		setGeneration((value) => value + 1);
		setPreset(state);
		setSelected([...GALLERY_PRESETS[state].ids]);
		setDark(false);
		setActive(false);
		setNarrow(false);
		setInfo(true);
		setExtra(false);
		setEmpty(false);
		setBroken(false);
		setNotice("");
		setQuickLook(false);
		live.current?.scrollTo(0, 0);
		native.current?.scrollTo(0, 0);
	}, []);
	const open = useCallback(
		(id: string) => setNotice(`Open callback: ${id}`),
		[]
	);
	const action = useCallback(
		(id: string, ids: string[]) =>
			setNotice(`${id} callback: ${ids.join(", ")}`),
		[]
	);
	const preview = useCallback((id: string) => {
		setPreviewId(id);
		setSelected([id]);
		setQuickLook(true);
	}, []);
	const source = useCallback(
		(id: string) =>
			[...(live.current?.querySelectorAll<HTMLElement>("[data-file-id]") ?? [])]
				.find((element) => element.dataset.fileId === id)
				?.querySelector<HTMLElement>(".mac-file-artwork") ?? null,
		[]
	);
	const returnFocus = useCallback(
		() =>
			[
				...(live.current?.querySelectorAll<HTMLElement>("[data-file-id]") ??
					[]),
			].find((element) => element.dataset.fileId === previewId) ?? null,
		[previewId]
	);
	return (
		<main
			className="dock-study gallery-study"
			style={
				{
					"--gallery-study-height": `${sceneHeight}px`,
					"--gallery-study-left": `${16 - crop.x}px`,
					"--gallery-study-top": `${16 - crop.y}px`,
					"--gallery-study-width": `${sceneWidth}px`,
					"--gallery-study-zoom": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="/">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / FINDER GALLERY</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">FINDER, IN FOCUS.</p>
				<h1>Gallery, beside the real thing.</h1>
				<p>The same files, fitted preview, filmstrip, and information pane.</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset
					aria-label="Native Gallery presets"
					className="dock-study-jump"
				>
					{PRESETS.map((state) => (
						<button
							aria-pressed={state === preset}
							key={state}
							onClick={() => reset(state)}
							type="button"
						>
							{GALLERY_PRESETS[state].label}
						</button>
					))}
				</fieldset>
				<label>
					Shared zoom{" "}
					<select
						aria-label="Shared zoom"
						onChange={(event) => setZoom(event.target.value)}
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
				<label>
					Detail{" "}
					<select
						aria-label="Detail"
						onChange={(event) => {
							setDetail(event.target.value as keyof typeof GALLERY_CROPS);
							live.current?.scrollTo(0, 0);
							native.current?.scrollTo(0, 0);
						}}
						value={detail}
					>
						{Object.entries(GALLERY_CROPS).map(([value, entry]) => (
							<option key={value} value={value}>
								{entry.label}
							</option>
						))}
					</select>
				</label>
				<label>
					<input
						checked={dark}
						onChange={(event) => setDark(event.target.checked)}
						type="checkbox"
					/>{" "}
					Dark
				</label>
				<label>
					<input
						checked={active}
						onChange={(event) => setActive(event.target.checked)}
						type="checkbox"
					/>{" "}
					Active
				</label>
				<label>
					<input
						checked={info}
						onChange={(event) => setInfo(event.target.checked)}
						type="checkbox"
					/>{" "}
					Information pane
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
						checked={extra}
						onChange={(event) => setExtra(event.target.checked)}
						type="checkbox"
					/>{" "}
					Long filmstrip
				</label>
				<label>
					<input
						checked={broken}
						onChange={(event) => setBroken(event.target.checked)}
						type="checkbox"
					/>{" "}
					Failed preview
				</label>
				<label>
					<input
						checked={empty}
						onChange={(event) => setEmpty(event.target.checked)}
						type="checkbox"
					/>{" "}
					Empty
				</label>
				<button onClick={() => reset(preset)} type="button">
					Reset native match
				</button>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our Gallery</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our Gallery comparison"
						className="gallery-study-viewport"
						onScroll={sync}
						ref={live}
					>
						<div className="gallery-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="gallery-study-live"
								preset="tahoe"
								style={narrow ? { width: 460 } : undefined}
							>
								<MacFileGallery
									actions={actions}
									active={active}
									defaultExpandedInfo={preset === "information"}
									items={files}
									key={`${preset}:${generation}`}
									label="Demo files"
									onAction={action}
									onEditTags={(ids) => action("edit-tags", ids)}
									onOpen={open}
									onQuickLook={preview}
									onSelectionChange={setSelected}
									selectedIds={selected}
									showInfo={info}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>
						Click a thumbnail · ← / → browse · Space for Quick Look
					</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native Gallery comparison"
						className="gallery-study-viewport"
						onScroll={sync}
						ref={native}
					>
						<div className="gallery-study-scene">
							<img
								alt={`Native Tahoe Finder Gallery, ${GALLERY_PRESETS[preset].label.toLowerCase()}`}
								className="gallery-study-native"
								draggable={false}
								height={1316}
								src={image}
								width={2100}
							/>
						</div>
					</section>
					<footer>Finder on this Mac · Tahoe 26.6.2 · Captured at 2×</footer>
				</section>
			</div>
			<output aria-live="polite" className="dock-study-selection">
				{notice || `Selected: ${selected.join(", ") || "none"}`}
			</output>
			<div className="dock-study-notes">
				<p>
					Both sides use the same original Clouds.webp and generated Notes.txt.
					Shared zoom, detail crops, and scrolling keep the comparison aligned.
					Presets restore the native state; the other controls affect the live
					side.
				</p>
				<p>
					Use ← / →, Home / End, or type a filename to select. Shift extends
					selection; ⌘/Ctrl-click toggles it; ⌘/Ctrl+A selects all. Double-click
					or ⌘/Ctrl+O reports Open. Space opens the existing Quick Look preview.
				</p>
				<p>
					The information pane reads supplied metadata. Show More expands
					additional fields. Tags are read-only; native tag editing is not
					included. Quick actions report callbacks. Preview decoding and file
					operations belong to the caller. The multiple-selection stack and dark
					appearance are first passes, without separate native calibration.
				</p>
				<p>
					<a href="/?view=file-info-reference">Compare Get Info ↗</a> ·{" "}
					<a href="/?view=file-columns-reference">Compare Columns ↗</a> ·{" "}
					<a href="/?view=new-folder-reference">Compare New Folder ↗</a>
				</p>
			</div>
			<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
				<MacQuickLook
					getSourceElement={source}
					items={quickLookItems}
					onOpenChange={setQuickLook}
					onOpenFile={open}
					onValueChange={(id) => {
						setPreviewId(id);
						setSelected([id]);
					}}
					open={quickLook}
					returnFocus={returnFocus}
					value={previewId}
				/>
			</MacOSEnvironment>
		</main>
	);
}

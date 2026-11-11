/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for this interactive comparison. */
import { MacOSEnvironment } from "@1bye/macos/environment";
import {
	type MacFileInfoChanges,
	MacGetInfoPanel,
} from "@1bye/macos/file-info";
import type { MacFileInfoItem } from "@1bye/macos/file-info-model";
import { ArrowLeft } from "lucide-react";
import {
	type CSSProperties,
	type RefObject,
	type UIEvent,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { INFO_FILES, INFO_PRESETS } from "./file-info-reference-data";
import { FileInfoWorkbench } from "./file-info-workbench";
import "./dock-reference.css";
import "./window-reference.css";
import "./file-info-reference.css";

const PRESETS = ["image", "folder", "preview"] as const;
const DETAILS = {
	all: { height: 0, label: "Full inspector", width: 349, x: 0, y: 0 },
	general: { height: 165, label: "General", width: 349, x: 0, y: 120 },
	header: { height: 120, label: "Title and summary", width: 349, x: 0, y: 0 },
	name: { height: 80, label: "Name & Extension", width: 349, x: 0, y: 332 },
} as const;

export function FileInfoReferenceComparison() {
	const [preset, setPreset] = useState<keyof typeof INFO_PRESETS>("image");
	const [generation, setGeneration] = useState(0);
	const [file, setFile] = useState<MacFileInfoItem>(INFO_FILES[0]);
	const [detail, setDetail] = useState<keyof typeof DETAILS>("all");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [notice, setNotice] = useState("");
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const state = INFO_PRESETS[preset];
	const crop = DETAILS[detail];
	const sceneWidth = crop.width + 32;
	const sceneHeight = (crop.height || state.height) + 32;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const image = `/assets/native-file-info/tahoe-info-${preset}.png`;
	useLayoutEffect(() => {
		const element = live.current;
		if (!element) {
			return;
		}
		const resize = () =>
			setFit(Math.min(1, element.clientWidth / sceneWidth, 380 / sceneHeight));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, [sceneWidth, sceneHeight]);
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
	const reset = useCallback((next: keyof typeof INFO_PRESETS) => {
		setPreset(next);
		setFile(
			INFO_FILES.find((entry) => entry.id === INFO_PRESETS[next].id) ??
				INFO_FILES[0]
		);
		setGeneration((value) => value + 1);
		setNotice("");
		live.current?.scrollTo(0, 0);
		native.current?.scrollTo(0, 0);
	}, []);
	const change = useCallback(
		(_id: string, patch: MacFileInfoChanges) =>
			setFile((current) => ({ ...current, ...patch })),
		[]
	);
	const rename = useCallback((_id: string, name: string) => {
		setFile((current) => ({ ...current, name }));
		setNotice(`Renamed to ${name}`);
	}, []);
	const action = useCallback(
		() =>
			setNotice(
				"Use the workbench below to open and close a floating inspector."
			),
		[]
	);
	return (
		<main
			className="dock-study info-study"
			style={
				{
					"--info-study-height": `${sceneHeight}px`,
					"--info-study-left": `${16 - crop.x}px`,
					"--info-study-top": `${16 - crop.y}px`,
					"--info-study-width": `${sceneWidth}px`,
					"--info-study-zoom": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / FINDER GET INFO</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">THE DETAILS, RECONSTRUCTED.</p>
				<h1>Get Info, beside the real thing.</h1>
				<p>The same file, native measurements, and a live inspector.</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset
					aria-label="Native Get Info presets"
					className="dock-study-jump"
				>
					{PRESETS.map((next) => (
						<button
							aria-pressed={preset === next}
							key={next}
							onClick={() => reset(next)}
							type="button"
						>
							{INFO_PRESETS[next].label}
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
							setDetail(event.target.value as keyof typeof DETAILS);
							live.current?.scrollTo(0, 0);
							native.current?.scrollTo(0, 0);
						}}
						value={detail}
					>
						{Object.entries(DETAILS).map(([value, entry]) => (
							<option key={value} value={value}>
								{entry.label}
							</option>
						))}
					</select>
				</label>
				<button onClick={() => reset(preset)} type="button">
					Reset native match
				</button>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our Get Info</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our Get Info comparison"
						className="info-study-viewport"
						onScroll={sync}
						ref={live}
					>
						<div className="info-study-scene">
							<MacOSEnvironment className="info-study-live" preset="tahoe">
								<MacGetInfoPanel
									defaultExpandedSections={state.expanded}
									file={file}
									key={generation}
									onClose={action}
									onEditTags={action}
									onInfoChange={change}
									onMinimize={action}
									onRename={rename}
									onZoom={action}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>
						349-point inspector · Collapsible sections · Editable name
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
						aria-label="Native Get Info comparison"
						className="info-study-viewport"
						onScroll={sync}
						ref={native}
					>
						<div className="info-study-scene">
							<img
								alt={`Native Tahoe Finder Get Info, ${state.label.toLowerCase()}`}
								className="info-study-native"
								draggable={false}
								height={state.height * 2}
								src={image}
								width={698}
							/>
						</div>
					</section>
					<footer>Finder on this Mac · Tahoe 26.6.2 · Captured at 2×</footer>
				</section>
			</div>
			<output aria-live="polite" className="dock-study-selection">
				{notice ||
					"Expand a section or edit the filename. Reset restores the native state."}
			</output>
			<div className="dock-study-notes">
				<p>
					Unaltered native captures of the same Clouds.webp and a generated
					folder. Shared zoom, detail crops, and scrolling keep both sides
					aligned. The native image is fixed; edits affect our inspector.
				</p>
				<p>
					Return or leaving the name field commits a valid name. Escape restores
					the current name and keeps the inspector open. Permissions display
					caller-supplied data; application associations and tag editing report
					callbacks. No files on your Mac are changed.
				</p>
				<p>
					<a href="?view=file-gallery-reference">Compare Gallery ↗</a> ·{" "}
					<a href="?view=file-columns-reference">Compare Columns ↗</a>
				</p>
			</div>
			<FileInfoWorkbench />
		</main>
	);
}

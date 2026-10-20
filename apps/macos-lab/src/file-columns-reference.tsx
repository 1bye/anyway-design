/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for the native column comparison. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import {
	type MacFileColumnItem,
	MacFileColumns,
} from "@anyway-design/macos/file-columns";
import type { MacFileSort } from "@anyway-design/macos/file-list";
import { flattenFileList } from "@anyway-design/macos/file-list-tree";
import {
	MacQuickLook,
	type MacQuickLookItem,
} from "@anyway-design/macos/quick-look";
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
	COLUMN_REFERENCE_ITEMS,
	COLUMN_REFERENCE_STATES,
} from "./file-columns-reference-data";
import { renameFolderFile } from "./folder-list-reference-data";
import "./dock-reference.css";
import "./window-reference.css";
import "./file-columns-reference.css";

const NAME_SORT: MacFileSort = { column: "name", direction: "ascending" };

export function FileColumnsReferenceComparison() {
	const [preset, setPreset] =
		useState<keyof typeof COLUMN_REFERENCE_STATES>("folders");
	const [items, setItems] = useState(COLUMN_REFERENCE_ITEMS);
	const [value, setValue] = useState<string | undefined>(
		COLUMN_REFERENCE_STATES.folders.value
	);
	const [widths, setWidths] = useState<readonly number[]>([]);
	const [dark, setDark] = useState(true);
	const [active, setActive] = useState(false);
	const [narrow, setNarrow] = useState(false);
	const [extra, setExtra] = useState(false);
	const [preview, setPreview] = useState(true);
	const [sort, setSort] = useState(NAME_SORT);
	const [detail, setDetail] = useState("all");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [notice, setNotice] = useState("");
	const [quickLook, setQuickLook] = useState(false);
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const reference = COLUMN_REFERENCE_STATES[preset];
	const crop =
		detail === "preview"
			? { height: 470, width: 240, x: 490 }
			: { height: detail === "rows" ? 126 : 470, width: reference.width, x: 0 };
	const sceneWidth = crop.width + 48;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const image = `/assets/native-file-columns/tahoe-${preset}.png`;
	const files = useMemo<MacFileColumnItem[]>(
		() =>
			extra
				? [
						...items,
						{
							children: [],
							disabled: true,
							id: "offline",
							kind: "folder",
							name: "Offline folder",
						},
						{
							id: "long",
							kind: "text",
							name: "A long filename that should truncate when this column is narrow.txt",
							preview: { text: "A caller-supplied text preview." },
						},
						...Array.from({ length: 32 }, (_, index) => ({
							id: `sample-${index}`,
							kind: "text" as const,
							name: `Sample ${index + 1}.txt`,
							preview: { text: `Demonstration file ${index + 1}.` },
						})),
					]
				: items,
		[items, extra]
	);
	const previewItems = useMemo<MacQuickLookItem[]>(
		() =>
			flattenFileList(files, sort).map(({ file }) => ({
				...file,
				preview:
					file.kind === "image" ? { src: "/assets/clouds.webp" } : undefined,
			})),
		[files, sort]
	);
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
	const reset = useCallback(
		(state: keyof typeof COLUMN_REFERENCE_STATES = preset) => {
			setPreset(state);
			setValue(COLUMN_REFERENCE_STATES[state].value);
			setActive(COLUMN_REFERENCE_STATES[state].active);
			setWidths([]);
			setItems(COLUMN_REFERENCE_ITEMS);
			setDark(true);
			setNarrow(false);
			setExtra(false);
			setPreview(true);
			setSort(NAME_SORT);
			setNotice("");
			live.current?.scrollTo(0, 0);
			native.current?.scrollTo(0, 0);
		},
		[preset]
	);
	const open = useCallback(
		(id: string) => setNotice(`Open callback: ${id}`),
		[]
	);
	const rename = useCallback((id: string, name: string) => {
		setItems((current) => renameFolderFile(current, id, name));
		setNotice(`Renamed to “${name}”.`);
	}, []);
	const showQuickLook = useCallback((id: string) => {
		setValue(id);
		setQuickLook(true);
	}, []);
	const returnFocus = useCallback(
		() =>
			[
				...(live.current?.querySelectorAll<HTMLElement>("tr[data-file-id]") ??
					[]),
			].find((row) => row.dataset.fileId === value) ?? null,
		[value]
	);
	const source = useCallback(
		(id: string) =>
			[
				...(live.current?.querySelectorAll<HTMLElement>("tr[data-file-id]") ??
					[]),
			]
				.find((row) => row.dataset.fileId === id)
				?.querySelector<HTMLElement>(".mac-file-list-icon") ?? null,
		[]
	);
	return (
		<main
			className="dock-study column-study"
			style={
				{
					"--column-reference-width": `${reference.width}px`,
					"--column-study-height": `${crop.height + 48}px`,
					"--column-study-offset": `${24 - crop.x}px`,
					"--column-study-width": `${sceneWidth}px`,
					"--column-study-zoom": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="/?view=file-dialog-reference">
					<ArrowLeft size={15} /> Back to Open / Save
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · COLUMN VIEW STUDY</p>
				<h1>A path, one column at a time.</h1>
				<p>
					Connected React columns beside Finder on this Mac, browsing the same
					generated folders and image.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset aria-label="Native column state" className="dock-study-jump">
					{Object.entries(COLUMN_REFERENCE_STATES).map(([id, state]) => (
						<button
							aria-pressed={preset === id}
							key={id}
							onClick={() => {
								setDetail("all");
								reset(id as keyof typeof COLUMN_REFERENCE_STATES);
							}}
							type="button"
						>
							{state.label}
						</button>
					))}
				</fieldset>
				<label>
					Shared zoom{" "}
					<select
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
							setDetail(event.target.value);
							live.current?.scrollTo(0, 0);
							native.current?.scrollTo(0, 0);
						}}
						value={detail}
					>
						<option value="all">Columns & preview</option>
						<option value="rows">Rows & spacing</option>
						<option disabled={preset !== "image"} value="preview">
							Preview details
						</option>
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
					Active selection
				</label>
				<label>
					<input
						checked={preview}
						onChange={(event) => setPreview(event.target.checked)}
						type="checkbox"
					/>{" "}
					Preview column
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
					Extra states
				</label>
				<label>
					Sort{" "}
					<select
						aria-label="File order"
						onChange={(event) =>
							setSort({
								column: "name",
								direction:
									event.target.value === "descending"
										? "descending"
										: "ascending",
							})
						}
						value={sort.direction}
					>
						<option value="ascending">Name ↑</option>
						<option value="descending">Name ↓</option>
					</select>
				</label>
				<button onClick={() => setValue("Archive")} type="button">
					Empty folder
				</button>
				<button onClick={() => reset()} type="button">
					Reset native match
				</button>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our columns</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our column comparison"
						className="column-study-viewport"
						onScroll={sync}
						ref={live}
					>
						<div className="column-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="column-study-live"
								preset="tahoe"
								style={narrow ? { width: 420 } : undefined}
							>
								<MacFileColumns
									active={active}
									columnWidths={widths}
									items={files}
									label="Demo files"
									onColumnWidthsChange={setWidths}
									onOpen={open}
									onQuickLook={showQuickLook}
									onRename={rename}
									onValueChange={setValue}
									showPreview={preview}
									sort={sort}
									value={value}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>
						Single-click folders · ← / → navigate · Drag dividers to resize
					</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Finder</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native column comparison"
						className="column-study-viewport"
						onScroll={sync}
						ref={native}
					>
						<div className="column-study-scene">
							<div className="column-study-native">
								<img
									alt={`Native Tahoe Finder ${reference.label.toLowerCase()} of generated demo files`}
									draggable={false}
									height={1148}
									src={image}
									width={reference.width * 2}
								/>
							</div>
						</div>
					</section>
					<footer>
						Tahoe 26.6.2 ·{" "}
						{reference.active ? "Active file" : "Inactive folder"} · Browser
						crop at 2×
					</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					The matched captures use 245px folder columns, 22px rows, and the same
					original image. Gray selections retain the folder path; the current
					selection turns blue when active. Native file icons can differ with
					installed-app associations.
				</p>
				<p>
					Click a folder to reveal its children. Right selects its first enabled
					child; Left returns to the parent. ↑ / ↓, Home / End, and typeahead
					navigate siblings. Return renames; ⌘/Ctrl+O or double-click reports an
					open callback. Space opens Quick Look.
				</p>
				<p>
					Drag a divider, or focus it and use ← / → in 10px steps. Home / End
					use the width limits; double-click restores 245px; Escape cancels a
					drag. Each column scrolls vertically, and smaller containers scroll
					horizontally as the path grows.
				</p>
				<p>
					The native side is a fixed browser crop; changes affect the live side.
					The preview comparison focuses on artwork and information. Finder’s
					tag editor, Show More, and system Quick Actions are not reproduced.
					Preview content and metadata are supplied by the caller; files stay in
					React state.
				</p>
			</div>
			<output aria-live="polite" className="dock-study-selection">
				{notice || `Selected: ${value ?? "none"}`}
			</output>
			<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
				<MacQuickLook
					getSourceElement={source}
					items={previewItems}
					onOpenChange={setQuickLook}
					onOpenFile={open}
					onValueChange={setValue}
					open={quickLook}
					returnFocus={returnFocus}
					value={value ?? ""}
				/>
			</MacOSEnvironment>
		</main>
	);
}

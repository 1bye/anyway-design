/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for the file-list calibration page. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import {
	MacFileList,
	type MacFileListItem,
	type MacFileSort,
} from "@anyway-design/macos/file-list";
import {
	flattenFileList,
	visibleFileListRows,
} from "@anyway-design/macos/file-list-tree";
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
	FILE_LIST_REFERENCE_ITEMS,
	FILE_LIST_REFERENCE_WIDTHS,
} from "./file-list-reference-data";
import {
	FOLDER_LIST_EXPANDED_IDS,
	FOLDER_LIST_REFERENCE_ITEMS,
} from "./folder-list-reference-data";
import { useFinderFolderCreation } from "./use-finder-folder-creation";
import "./dock-reference.css";
import "./window-reference.css";
import "./file-list-reference.css";

const CROPS = {
	all: { label: "All columns", width: 920, x: 0 },
	details: { label: "Details", width: 409.5, x: 510.5 },
	name: { label: "Name", width: 510.5, x: 0 },
} as const;
const INITIAL_SORT: MacFileSort = { column: "name", direction: "ascending" };

export function FileListReferenceComparison({
	folders = false,
}: {
	folders?: boolean;
}) {
	const [folderItems, setFolderItems] = useState(
		folders ? FOLDER_LIST_REFERENCE_ITEMS : FILE_LIST_REFERENCE_ITEMS
	);
	const [expandedIds, setExpandedIds] = useState<string[]>(
		folders ? FOLDER_LIST_EXPANDED_IDS : []
	);
	const [capture, setCapture] = useState<"expanded" | "collapsed">("expanded");
	const referenceImage = folders
		? `/assets/native-folder-list/tahoe-${capture}.jpg`
		: "/assets/native-file-list/tahoe-finder-dark.jpg";
	const [detail, setDetail] = useState<keyof typeof CROPS>("all");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [dark, setDark] = useState(true);
	const [active, setActive] = useState(true);
	const [extra, setExtra] = useState(false);
	const [sort, setSort] = useState(INITIAL_SORT);
	const [widths, setWidths] = useState<
		Partial<typeof FILE_LIST_REFERENCE_WIDTHS>
	>(FILE_LIST_REFERENCE_WIDTHS);
	const [selected, setSelected] = useState([
		folders
			? "Design resources/Brand/Colors.txt"
			: "Agreement for Services.pdf",
	]);
	const [notice, setNotice] = useState("");
	const [previewId, setPreviewId] = useState("");
	const [previewOpen, setPreviewOpen] = useState(false);
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const crop = CROPS[detail];
	const sceneWidth = crop.width + 48;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const items = useMemo<MacFileListItem[]>(() => {
		const base = folderItems;
		if (!extra) {
			return base;
		}
		return [
			...base.map((item) =>
				item.id === "Archive"
					? { ...item, tags: [{ color: "#ff9f0a", label: "Work" }] }
					: item
			),
			{
				children: [
					{ id: "offline/child", kind: "text", name: "Unavailable child.txt" },
				],
				disabled: true,
				id: "offline",
				kind: "folder",
				name: "Unavailable folder",
			},
			{
				id: "long",
				kind: "text",
				modifiedAt: 1_791_792_000_000,
				name: "A long filename that should truncate when the Name column is narrow.txt",
				size: 16_000,
				tags: [
					{ color: "#ff453a", label: "Urgent" },
					{ color: "#af52de", label: "Personal" },
				],
			},
		];
	}, [extra, folderItems]);
	const previewItems = useMemo<MacQuickLookItem[]>(
		() =>
			visibleFileListRows(flattenFileList(items, sort), expandedIds).map(
				({ file: item }) => ({
					...item,
					preview:
						item.kind === "image" ? { src: "/assets/clouds.webp" } : undefined,
					subtitle: [item.kindLabel, item.sizeLabel]
						.filter(Boolean)
						.join(" · "),
				})
			),
		[items, sort, expandedIds]
	);
	const preview = useCallback((id: string) => {
		setPreviewId(id);
		setSelected([id]);
		setPreviewOpen(true);
	}, []);
	const navigatePreview = useCallback((id: string) => {
		setPreviewId(id);
		setSelected([id]);
	}, []);
	const returnFocus = useCallback(
		() =>
			live.current?.querySelector<HTMLElement>(
				'[data-file-id][aria-selected="true"]'
			) ?? null,
		[]
	);
	const getSourceElement = useCallback((id: string) => {
		const row = [
			...(live.current?.querySelectorAll<HTMLElement>("[data-file-id]") ?? []),
		].find((element) => element.dataset.fileId === id);
		return (
			row?.querySelector<HTMLElement>(".mac-file-list-icon") ?? row ?? null
		);
	}, []);
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
	const scrollStart = useCallback(() => {
		live.current?.scrollTo(0, 0);
		native.current?.scrollTo(0, 0);
		live.current?.querySelector(".mac-file-list")?.scrollTo(0, 0);
	}, []);
	const reset = useCallback(() => {
		setSort(INITIAL_SORT);
		setWidths(FILE_LIST_REFERENCE_WIDTHS);
		setSelected([
			folders
				? "Design resources/Brand/Colors.txt"
				: "Agreement for Services.pdf",
		]);
		setExpandedIds(folders ? FOLDER_LIST_EXPANDED_IDS : []);
		setCapture("expanded");
		setFolderItems(
			folders ? FOLDER_LIST_REFERENCE_ITEMS : FILE_LIST_REFERENCE_ITEMS
		);
		setExtra(false);
		setDark(true);
		setActive(true);
		setNotice("");
		scrollStart();
	}, [scrollStart, folders]);
	const changeCapture = useCallback(
		(state: "expanded" | "collapsed") => {
			setCapture(state);
			setFolderItems(FOLDER_LIST_REFERENCE_ITEMS);
			setSort(INITIAL_SORT);
			setWidths(FILE_LIST_REFERENCE_WIDTHS);
			setDark(true);
			setActive(true);
			setExtra(false);
			setExpandedIds(
				state === "expanded"
					? FOLDER_LIST_EXPANDED_IDS
					: ["Design resources/Brand"]
			);
			setSelected([
				state === "expanded"
					? "Design resources/Brand/Colors.txt"
					: "Design resources",
			]);
			scrollStart();
		},
		[scrollStart]
	);
	const creation = useFinderFolderCreation(
		folderItems,
		setFolderItems,
		setSelected
	);

	const open = useCallback(
		(id: string) => setNotice(`Open callback: ${id}`),
		[]
	);
	return (
		<main
			className="dock-study list-study"
			style={
				{
					"--list-study-offset": `${24 - crop.x}px`,
					"--list-study-width": `${sceneWidth}px`,
					"--list-study-zoom": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="/?view=window-reference">
					<ArrowLeft size={15} /> Back to the window study
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">
					TAHOE · {folders ? "FOLDER HIERARCHY" : "FILE LIST"} STUDY
				</p>
				<h1>
					{folders ? "A folder, within a folder." : "Every row, in its place."}
				</h1>
				<p>
					Live React rows beside Finder running on this Mac, with the same demo
					files and column widths.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset aria-label="Detail" className="dock-study-jump">
					{Object.entries(CROPS).map(([id]) => (
						<button
							aria-pressed={detail === id}
							key={id}
							onClick={() => {
								setDetail(id as keyof typeof CROPS);
								scrollStart();
							}}
							type="button"
						>
							{CROPS[id as keyof typeof CROPS].label}
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
				<a href="/?view=new-folder-reference">Compare New Folder ↗</a>
				<button onClick={() => creation.create()} type="button">
					New Folder
				</button>
				<a href="/?view=file-columns-reference">Compare column view ↗</a>
				<a href="/?view=file-dialog-reference">Compare Open / Save ↗</a>
				<a href="/?view=quick-look-reference">Compare Quick Look ↗</a>
				<a href="/?view=file-rename-reference">Compare inline rename ↗</a>
				<a
					href={
						folders
							? "/?view=file-list-reference"
							: "/?view=folder-list-reference"
					}
				>
					{folders ? "Compare flat lists" : "Compare folder hierarchy"} ↗
				</a>
				{folders ? (
					<>
						<button
							aria-pressed={capture === "expanded"}
							onClick={() => changeCapture("expanded")}
							type="button"
						>
							Expanded baseline
						</button>
						<button
							aria-pressed={capture === "collapsed"}
							onClick={() => changeCapture("collapsed")}
							type="button"
						>
							Collapsed baseline
						</button>
						<button onClick={() => setExpandedIds([])} type="button">
							Collapse all
						</button>
					</>
				) : null}
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
						checked={dark}
						onChange={(event) => setDark(event.target.checked)}
						type="checkbox"
					/>{" "}
					Dark appearance
				</label>
				<label>
					<input
						checked={extra}
						onChange={(event) => setExtra(event.target.checked)}
						type="checkbox"
					/>{" "}
					Extra states (live only)
				</label>
				<button onClick={reset} type="button">
					Reset native match
				</button>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our list</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our file list close-up. Scroll to inspect."
						className="list-study-viewport"
						onScroll={sync}
						ref={live}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the synchronized scroll viewport.
						tabIndex={0}
					>
						<div className="list-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="list-study-live"
								preset="tahoe"
							>
								<MacFileList
									active={active}
									columnWidths={widths}
									expandedIds={expandedIds}
									items={items}
									label="Demo files"
									minRows={16}
									onColumnWidthsChange={setWidths}
									onExpandedChange={setExpandedIds}
									onNewFolder={creation.create}
									onOpen={open}
									onQuickLook={preview}
									onRename={creation.rename}
									onRenamingChange={creation.setRenamingId}
									onSelectionChange={setSelected}
									onSortChange={setSort}
									renamingId={creation.renamingId}
									selectedIds={selected}
									sort={sort}
									validateRename={creation.validate}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>Sort a header · Drag a divider · Arrow keys navigate</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Finder</h2>
						<a href={referenceImage} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native Finder list close-up. Scroll to inspect."
						className="list-study-viewport"
						onScroll={sync}
						ref={native}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the synchronized scroll viewport.
						tabIndex={0}
					>
						<div className="list-study-scene">
							<div className="list-study-native-frame">
								<img
									alt={
										folders
											? `Native Tahoe Finder folder hierarchy, ${capture}, sorted by Name`
											: "Native Tahoe Finder list of nine generated demo files with Agreement for Services selected, sorted by Name"
									}
									className="list-study-native"
									draggable={false}
									height={1380}
									src={referenceImage}
									width={1840}
								/>
							</div>
						</div>
					</section>
					<footer>Tahoe 26.6.2 · Dark · Selected row · Captured at 2×</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				{folders ? (
					<p>
						Click a disclosure arrow to expand without changing selection. Right
						opens the selected folder and stays on it; Left closes it or selects
						its parent. Collapsing clears selected descendants that become
						hidden, while remembering which nested folders were expanded.
						Sorting applies independently within each folder. Return renames a
						visible item. The native presets are actual Finder captures from
						this Mac.
					</p>
				) : null}
				<p>
					Click headers to sort; drag column dividers to resize. Focus a divider
					and use ← / → (10px), Home / End, or double-click it to restore its
					default width. Escape cancels an active resize.
				</p>
				<p>
					Click, ⌘/Ctrl-click, and Shift-click select. ↑ / ↓, Home / End,
					typeahead, ⌘/Ctrl+A, and Escape work from a row. Space opens Quick
					Look. Double-click or ⌘/Ctrl+O reports an open callback. Return opens
					a file when inline rename is not enabled.
				</p>
				<p>
					The native side is a fixed capture of generated files. Sorting,
					resizing, other selections, light/inactive appearance, and extra
					states affect the live side. Reset native match restores the baseline.
					Finder’s per-file previews and installed-app artwork can differ from
					the shared native type icons.
				</p>
			</div>
			<p aria-live="polite" className="dock-study-selection">
				{notice ||
					`${selected.length} selected · ${sort.column}, ${sort.direction}`}
			</p>
			<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
				<MacQuickLook
					getSourceElement={getSourceElement}
					items={previewItems}
					onOpenChange={setPreviewOpen}
					onOpenFile={open}
					onValueChange={navigatePreview}
					open={previewOpen}
					returnFocus={returnFocus}
					value={previewId}
				/>
			</MacOSEnvironment>
		</main>
	);
}

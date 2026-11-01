/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for the calibration workbench. */
import { MacButton } from "@anyway-design/macos/controls";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import {
	MacFileDialog,
	MacFileDialogPanel,
	type MacFileDialogResult,
} from "@anyway-design/macos/file-dialog";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
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
import { createPanelFolder } from "./create-panel-folder";
import { PANEL_DIRECTORIES, PANEL_TYPES } from "./file-dialog-reference-data";
import "./dock-reference.css";
import "./window-reference.css";
import "./file-dialog-reference.css";

const PRESETS = {
	compact: {
		directory: "root",
		height: 172,
		image: "tahoe-save-compact.png",
		label: "Save · compact",
		liveHeight: 172,
		liveTop: 0,
		liveWidth: 370,
		mode: "save",
		top: 32,
		view: "list",
		width: 370,
	},
	open: {
		directory: "root",
		height: 448,
		image: "tahoe-open.png",
		label: "Open",
		liveHeight: 448,
		liveTop: 0,
		liveWidth: 880,
		mode: "open",
		top: 0,
		view: "list",
		width: 880,
	},
	openColumns: {
		directory: "Design resources",
		height: 318,
		image: "tahoe-open-columns.png",
		label: "Open · columns",
		liveHeight: 448,
		liveTop: 64,
		liveWidth: 880,
		mode: "open",
		top: 0,
		view: "columns",
		width: 490,
	},
	save: {
		directory: "root",
		height: 416,
		image: "tahoe-save.png",
		label: "Save · expanded",
		liveHeight: 416,
		liveTop: 0,
		liveWidth: 880,
		mode: "save",
		top: 32,
		view: "list",
		width: 880,
	},
	saveColumns: {
		directory: "Design resources",
		height: 215,
		image: "tahoe-save-columns.png",
		label: "Save · columns",
		liveHeight: 416,
		liveTop: 135,
		liveWidth: 880,
		mode: "save",
		top: 0,
		view: "columns",
		width: 490,
	},
} as const;
const SIDEBAR = [
	{
		id: "favorites",
		items: [
			{
				icon: <WindowSymbol name="document" />,
				id: "root",
				label: "Demo files",
			},
			{
				icon: <WindowSymbol name="favorites" />,
				id: "Design resources",
				label: "Design resources",
			},
			{
				icon: <WindowSymbol name="icon-view" />,
				id: "Photos",
				label: "Photos",
			},
		],
		label: "Favorites",
	},
];
const TEXT_TYPE = [PANEL_TYPES[0]];

export function FileDialogReferenceComparison() {
	const [preset, setPreset] = useState<keyof typeof PRESETS>("openColumns");
	const [detail, setDetail] = useState("all");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [revision, setRevision] = useState(0);
	const [closed, setClosed] = useState(false);
	const [dark, setDark] = useState(true);
	const [sidebar, setSidebar] = useState(true);
	const [multiple, setMultiple] = useState(false);
	const [narrow, setNarrow] = useState(false);
	const [modal, setModal] = useState<"open" | "save">("open");
	const [modalOpen, setModalOpen] = useState(false);
	const [session, setSession] = useState(0);
	const [result, setResult] = useState<MacFileDialogResult>();
	const [directories, setDirectories] = useState(PANEL_DIRECTORIES);
	const createFolder = useCallback(
		(parentId: string, name: string) => {
			const id = crypto.randomUUID();
			setDirectories(createPanelFolder(directories, parentId, name, id));
			return id;
		},
		[directories]
	);
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const reference = PRESETS[preset];
	const crop =
		detail === "actions"
			? {
					height: 80,
					width: 240,
					x: reference.width - 240,
					y: reference.height - 80,
				}
			: {
					height:
						detail === "header"
							? Math.min(172, reference.height)
							: reference.height,
					width: reference.width,
					x: 0,
					y: 0,
				};
	const sceneWidth = crop.width + 48;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const columnCrop = reference.view === "columns";
	const image = `/assets/native-file-dialog/${reference.image}`;
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
	const reset = useCallback(() => {
		setClosed(false);
		setResult(undefined);
		setRevision((value) => value + 1);
		live.current?.scrollTo(0, 0);
		native.current?.scrollTo(0, 0);
	}, []);
	const confirm = useCallback(
		(value: MacFileDialogResult) => setResult(value),
		[]
	);
	const cancel = useCallback(() => setClosed(true), []);
	const launch = (mode: "open" | "save") => {
		setModal(mode);
		setSession((value) => value + 1);
		setModalOpen(true);
	};
	return (
		<main
			className="dock-study panel-study"
			data-column-crop={columnCrop || undefined}
			style={
				{
					"--panel-reference-height": `${reference.height}px`,
					"--panel-reference-image-top": `-${reference.top}px`,
					"--panel-reference-live-height": `${reference.liveHeight}px`,
					"--panel-reference-live-top": `${reference.liveTop}px`,
					"--panel-reference-live-width": `${reference.liveWidth}px`,
					"--panel-reference-width": `${reference.width}px`,
					"--panel-study-height": `${crop.height + 48}px`,
					"--panel-study-left": `${24 - crop.x}px`,
					"--panel-study-top": `${24 - crop.y}px`,
					"--panel-study-width": `${sceneWidth}px`,
					"--panel-study-zoom": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?view=folder-list-reference">
					<ArrowLeft size={15} /> Back to the folder study
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · OPEN / SAVE STUDY</p>
				<h1>A familiar place to open and save.</h1>
				<p>
					Live React panels beside the real NSOpenPanel and NSSavePanel on this
					Mac.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset aria-label="Native panel" className="dock-study-jump">
					{(
						["open", "save", "compact", "openColumns", "saveColumns"] as const
					).map((id) => (
						<button
							aria-pressed={preset === id}
							key={id}
							onClick={() => {
								setPreset(id);
								setDetail("all");
								reset();
							}}
							type="button"
						>
							{PRESETS[id].label}
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
				<a href="?view=file-columns-reference">Compare column view ↗</a>
				<a href="?view=new-folder-reference">Compare New Folder ↗</a>
				<label>
					Detail{" "}
					<select
						aria-label="Detail"
						onChange={(event) => {
							setDetail(event.target.value);
							reset();
						}}
						value={detail}
					>
						<option value="all">
							{columnCrop ? "Column browser" : "Whole panel"}
						</option>
						<option disabled={columnCrop} value="header">
							Header & fields
						</option>
						<option disabled={columnCrop} value="actions">
							Action buttons
						</option>
					</select>
				</label>
				<button onClick={reset} type="button">
					Reset native match
				</button>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our {reference.mode} panel</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our dialog comparison"
						className="panel-study-viewport"
						onScroll={sync}
						ref={live}
					>
						<div className="panel-study-scene">
							<MacOSEnvironment
								appearance="dark"
								className="panel-study-live"
								preset="tahoe"
							>
								{closed ? (
									<button
										className="panel-study-reopen"
										onClick={reset}
										type="button"
									>
										Reopen panel
									</button>
								) : (
									<MacFileDialogPanel
										active={false}
										defaultExpanded={preset !== "compact"}
										defaultView={reference.view}
										directories={PANEL_DIRECTORIES}
										fileTypes={TEXT_TYPE}
										initialDirectoryId={reference.directory}
										initialName="Untitled.txt"
										initialSelectedIds={
											preset === "open" ? ["Meeting notes.txt"] : []
										}
										key={`${preset}:${revision}`}
										mode={reference.mode}
										onCancel={cancel}
										onConfirm={confirm}
									/>
								)}
							</MacOSEnvironment>
						</div>
					</section>
					<footer>
						{columnCrop
							? "Connected folders · Real dialog state · Drag column dividers"
							: "Shared chrome · Real selection, navigation, and filename fields"}
					</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native macOS</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native dialog comparison"
						className="panel-study-viewport"
						onScroll={sync}
						ref={native}
					>
						<div className="panel-study-scene">
							<div className="panel-study-native">
								<img
									alt={`Native Tahoe ${reference.label} panel showing generated demo files`}
									draggable={false}
									height={(reference.height + reference.top) * 2}
									src={image}
									width={reference.width * 2}
								/>
							</div>
						</div>
					</section>
					<footer>
						Tahoe 26.6.2 · Dark · Inactive selection · Captured at 2×
					</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Native captures use the same generated files and names. Columns
					presets compare the demo subtree only, cropping out unrelated parent
					folders and system chrome. The sidebar is hidden in the whole-panel
					baselines. Save’s system title bar is omitted from those paired
					viewports. Original opens the full window for whole-panel presets, and
					the retained browser crop for Columns. Native captures stay fixed
					while the React panel remains interactive.
				</p>
				<p>
					Use the workbench for active controls, a sidebar, file-type filtering,
					multiple selection, and focus handling. File icons can differ with the
					Mac’s installed app associations.
				</p>
			</div>
			<section className="panel-workbench">
				<h2>Try the dialogs</h2>
				<p>
					Open a modal, navigate the demo folders, or save as “Project
					brief.txt” to try the replace prompt.
				</p>
				<div className="window-study-controls">
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
							checked={sidebar}
							onChange={(event) => setSidebar(event.target.checked)}
							type="checkbox"
						/>{" "}
						Sidebar
					</label>
					<label>
						<input
							checked={multiple}
							onChange={(event) => setMultiple(event.target.checked)}
							type="checkbox"
						/>{" "}
						Allow multiple files
					</label>
					<label>
						<input
							checked={narrow}
							onChange={(event) => setNarrow(event.target.checked)}
							type="checkbox"
						/>{" "}
						Narrow dialog
					</label>
				</div>
				<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
					<div className="panel-workbench-launch">
						<MacButton onClick={() => launch("open")}>Open dialog…</MacButton>
						<MacButton onClick={() => launch("save")}>Save dialog…</MacButton>
					</div>
					<MacFileDialog
						defaultExpanded={preset !== "compact"}
						defaultView={reference.view}
						directories={directories}
						fileTypes={PANEL_TYPES}
						initialDirectoryId="root"
						initialName="Untitled.txt"
						key={session}
						mode={modal}
						multiple={multiple}
						onConfirm={confirm}
						onCreateFolder={createFolder}
						onOpenChange={setModalOpen}
						open={modalOpen}
						sidebarGroups={sidebar ? SIDEBAR : undefined}
						style={
							narrow && preset !== "compact"
								? { width: "min(460px, calc(100vw - 32px))" }
								: undefined
						}
					/>
				</MacOSEnvironment>
				<output aria-live="polite" className="panel-workbench-output">
					{result
						? JSON.stringify(result, null, 2)
						: "Open and Save report a callback here."}
				</output>
			</section>
			<div className="dock-study-notes">
				<p>
					Use View options to switch List / Columns without resetting the
					folder, filename, tags, search, file type, or selection. Right / Left
					navigate column folders. Return opens the selected file or folder; ↑ /
					↓ navigate rows, ⌘/Ctrl+↑ goes to the parent, and Escape cancels. Save
					selects the filename stem, adds a missing extension, and asks before
					replacing an existing demo file. Search is local to the current
					folder.
				</p>
				<p>
					These are reusable React components backed by caller-supplied data.
					Connect the callbacks to your app’s storage or native bridge to
					actually open or save files. No local files are changed by this study.
				</p>
			</div>
		</main>
	);
}

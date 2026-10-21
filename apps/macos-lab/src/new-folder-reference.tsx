/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for the native New Folder comparison. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { MacFileColumns } from "@anyway-design/macos/file-columns";
import {
	MacFileDialog,
	type MacFileDialogDirectory,
	type MacFileDialogResult,
} from "@anyway-design/macos/file-dialog";
import {
	MacFileList,
	type MacFileListItem,
} from "@anyway-design/macos/file-list";
import { flattenFileList } from "@anyway-design/macos/file-list-tree";
import { type MacFile, MacFileGrid } from "@anyway-design/macos/files";
import { MacContextMenu } from "@anyway-design/macos/menu";
import { MacNewFolderPanel } from "@anyway-design/macos/new-folder";
import {
	type CSSProperties,
	type MouseEvent,
	type RefObject,
	type UIEvent,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPanelFolder } from "./create-panel-folder";
import { PANEL_TYPES } from "./file-dialog-reference-data";
import { useFinderFolderCreation } from "./use-finder-folder-creation";
import "./dock-reference.css";
import "./window-reference.css";
import "./new-folder-reference.css";

const PARENT_NAME = "Anyway-New-Folder-Reference";
const BASE_FILES: MacFileListItem[] = [
	{ children: [], id: "design", kind: "folder", name: "Design resources" },
	{ id: "brief", kind: "text", name: "Project brief.txt" },
	{ children: [], id: "new", kind: "folder", name: "untitled folder" },
];
const DIRECTORIES: MacFileDialogDirectory[] = [
	{ id: "root", items: BASE_FILES, name: PARENT_NAME },
	{ id: "design", items: [], name: "Design resources", parentId: "root" },
	{ id: "new", items: [], name: "untitled folder", parentId: "root" },
];
const STATES = {
	columns: {
		height: 114,
		image: "tahoe-finder-columns.png",
		label: "Finder · Columns",
		width: 245,
	},
	duplicate: {
		height: 196,
		image: "tahoe-duplicate.png",
		label: "Name collision",
		width: 321,
	},
	list: {
		height: 114,
		image: "tahoe-finder-list.png",
		label: "Finder · List",
		width: 263,
	},
	open: {
		height: 172,
		image: "tahoe-open.png",
		label: "Open · New Folder",
		width: 321,
	},
	save: {
		height: 172,
		image: "tahoe-save.png",
		label: "Save · New Folder",
		width: 321,
	},
} as const;
const NAME_COLUMN = ["name"] as const;

function FinderWorkbench() {
	const [files, setFiles] = useState(BASE_FILES);
	const [selected, setSelected] = useState<string[]>([]);
	const [view, setView] = useState("list");
	const [dark, setDark] = useState(false);
	const creation = useFinderFolderCreation(files, setFiles, setSelected);
	const selectColumn = useCallback(
		(id: string | undefined) => setSelected(id ? [id] : []),
		[]
	);
	const create = useCallback(() => {
		if (view !== "columns") {
			creation.create();
			return;
		}
		const row = flattenFileList(files, {
			column: "name",
			direction: "ascending",
		}).find((entry) => entry.file.id === selected.at(-1));
		creation.create(row?.file.kind === "folder" ? row.file.id : row?.parentId);
	}, [files, selected, view, creation.create]);
	const context = useCallback((event: MouseEvent<HTMLDivElement>) => {
		if (
			event.target instanceof Element &&
			event.target.closest(".mac-file-rename")
		) {
			event.stopPropagation();
		}
	}, []);
	const action = useCallback(() => requestAnimationFrame(create), [create]);
	return (
		<section className="new-folder-workbench">
			<h2>Try it in Finder</h2>
			<p>
				New Folder or ⌘/Ctrl+Shift+N creates immediately. Return commits the
				name; Escape keeps the generated folder. Right-click the browser for New
				Folder.
			</p>
			<div className="window-study-controls">
				<label>
					View{" "}
					<select
						onChange={(event) => {
							setView(event.target.value);
							creation.setRenamingId(null);
						}}
						value={view}
					>
						<option value="list">List</option>
						<option value="icons">Icons</option>
						<option value="columns">Columns</option>
					</select>
				</label>
				<button onClick={create} type="button">
					New Folder
				</button>
				<label>
					<input
						checked={dark}
						onChange={(event) => setDark(event.target.checked)}
						type="checkbox"
					/>{" "}
					Dark Finder
				</label>
				<button
					onClick={() => {
						setFiles(BASE_FILES);
						setSelected([]);
						creation.setRenamingId(null);
					}}
					type="button"
				>
					Reset Finder
				</button>
			</div>
			<MacOSEnvironment
				appearance={dark ? "dark" : "light"}
				className="new-folder-finder-workbench"
				preset="tahoe"
			>
				<MacContextMenu
					items={[{ id: "new-folder", label: "New Folder", shortcut: "⇧⌘N" }]}
					onAction={action}
					trigger={
						<div
							className="new-folder-workbench-browser"
							onContextMenuCapture={context}
							tabIndex={-1}
						>
							{view === "icons" ? (
								<MacFileGrid
									items={files}
									label="Finder files"
									onNewFolder={create}
									onRename={creation.rename}
									onRenamingChange={creation.setRenamingId}
									onSelectionChange={setSelected}
									renamingId={creation.renamingId}
									selectedIds={selected}
									validateRename={creation.validate}
								/>
							) : null}
							{view === "list" ? (
								<MacFileList
									items={files}
									label="Finder files"
									minRows={10}
									onNewFolder={create}
									onRename={creation.rename}
									onRenamingChange={creation.setRenamingId}
									onSelectionChange={setSelected}
									renamingId={creation.renamingId}
									selectedIds={selected}
									validateRename={creation.validate}
								/>
							) : null}
							{view === "columns" ? (
								<MacFileColumns
									items={files}
									label="Finder files"
									onNewFolder={creation.create}
									onRename={creation.rename}
									onRenamingChange={creation.setRenamingId}
									onValueChange={selectColumn}
									renamingId={creation.renamingId}
									validateRename={creation.validate}
									value={selected.at(-1)}
								/>
							) : null}
						</div>
					}
				/>
			</MacOSEnvironment>
		</section>
	);
}

function DialogWorkbench() {
	const [directories, setDirectories] = useState(DIRECTORIES);
	const [mode, setMode] = useState<"open" | "save">("save");
	const [view, setView] = useState<"list" | "columns">("columns");
	const [open, setOpen] = useState(false);
	const [session, setSession] = useState(0);
	const [dark, setDark] = useState(false);
	const [failure, setFailure] = useState(false);
	const [narrow, setNarrow] = useState(false);
	const [result, setResult] = useState<MacFileDialogResult>();
	const create = useCallback(
		async (parentId: string, name: string) => {
			await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
			if (failure) {
				setFailure(false);
				throw new Error(
					"This location is read-only. Choose another folder or try again."
				);
			}
			const id = crypto.randomUUID();
			setDirectories(createPanelFolder(directories, parentId, name, id));
			return id;
		},
		[directories, failure]
	);
	const launch = (next: "open" | "save") => {
		setMode(next);
		setSession((value) => value + 1);
		setOpen(true);
	};
	return (
		<section className="new-folder-workbench">
			<h2>Try it in Open / Save</h2>
			<p>
				Create enters the new folder. Your Save As name and tags stay intact.
				Cancel or Escape dismisses only the naming sheet.
			</p>
			<div className="window-study-controls">
				<label>
					Start view{" "}
					<select
						onChange={(event) =>
							setView(event.target.value === "list" ? "list" : "columns")
						}
						value={view}
					>
						<option value="list">List</option>
						<option value="columns">Columns</option>
					</select>
				</label>
				<label>
					<input
						checked={dark}
						onChange={(event) => setDark(event.target.checked)}
						type="checkbox"
					/>{" "}
					Dark dialogs
				</label>
				<label>
					<input
						checked={narrow}
						onChange={(event) => setNarrow(event.target.checked)}
						type="checkbox"
					/>{" "}
					Narrow dialog
				</label>
				<label>
					<input
						checked={failure}
						onChange={(event) => setFailure(event.target.checked)}
						type="checkbox"
					/>{" "}
					Fail next creation
				</label>
				<button onClick={() => launch("open")} type="button">
					Open dialog…
				</button>
				<button onClick={() => launch("save")} type="button">
					Save dialog…
				</button>
			</div>
			<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
				<MacFileDialog
					defaultView={view}
					directories={directories}
					fileTypes={PANEL_TYPES}
					initialDirectoryId="root"
					initialName="Project notes.txt"
					key={session}
					mode={mode}
					onConfirm={setResult}
					onCreateFolder={create}
					onOpenChange={setOpen}
					open={open}
					style={
						narrow ? { width: "min(460px, calc(100vw - 32px))" } : undefined
					}
				/>
			</MacOSEnvironment>
			<output className="new-folder-output">
				{result
					? JSON.stringify(result, null, 2)
					: "Created folders live in this browser. Open / Save reports a callback here."}
			</output>
		</section>
	);
}

export function NewFolderReferenceComparison() {
	const [preset, setPreset] = useState<keyof typeof STATES>("open");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [revision, setRevision] = useState(0);
	const [files, setFiles] = useState(BASE_FILES);
	const [renamingId, setRenamingId] = useState<string | null>("new");
	const [notice, setNotice] = useState("");
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const reference = STATES[preset];
	const scale = zoom === "fit" ? fit : Number(zoom);
	const image = `/assets/native-new-folder/${reference.image}`;
	useLayoutEffect(() => {
		const element = live.current;
		if (!element) {
			return;
		}
		const resize = () =>
			setFit(Math.min(1, element.clientWidth / (reference.width + 48)));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, [reference.width]);
	const sync = useCallback((event: UIEvent<HTMLElement>) => {
		const from = event.currentTarget;
		const to = from === live.current ? native.current : live.current;
		if (to && Math.abs(to.scrollLeft - from.scrollLeft) > 1) {
			to.scrollLeft = from.scrollLeft;
		}
	}, []);
	const reset = useCallback(() => {
		setFiles(BASE_FILES);
		setRenamingId("new");
		setRevision((value) => value + 1);
		setNotice("");
	}, []);
	const rename = useCallback(
		(id: string, name: string) =>
			setFiles((current) =>
				current.map((file) => (file.id === id ? { ...file, name } : file))
			),
		[]
	);
	const create = useCallback(
		(name: string) =>
			setNotice(
				`Created “${name}”. Reset native match to reopen the naming sheet.`
			),
		[]
	);
	const noAction = useCallback(() => undefined, []);
	const columnOnly: MacFile[] = files.filter((file) => file.id === "new");
	return (
		<main
			className="dock-study new-folder-study"
			data-sheet={["open", "save", "duplicate"].includes(preset) || undefined}
			style={
				{
					"--new-folder-height": `${reference.height}px`,
					"--new-folder-width": `${reference.width}px`,
					"--new-folder-zoom": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="/?view=file-dialog-reference">← Back to Open / Save</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · NEW FOLDER STUDY</p>
				<h1>A place for what comes next.</h1>
				<p>
					Finder’s inline naming and Open / Save’s naming sheet, beside captures
					from this Mac.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset
					aria-label="Native New Folder state"
					className="dock-study-jump"
				>
					{(["list", "columns", "open", "save", "duplicate"] as const).map(
						(id) => (
							<button
								aria-pressed={preset === id}
								key={id}
								onClick={() => {
									setPreset(id as keyof typeof STATES);
									reset();
								}}
								type="button"
							>
								{STATES[id].label}
							</button>
						)
					)}
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
				<button onClick={reset} type="button">
					Reset native match
				</button>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our New Folder</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our New Folder comparison"
						className="new-folder-viewport"
						onScroll={sync}
						ref={live}
					>
						<div className="new-folder-scene">
							<MacOSEnvironment
								accentColor="#0364e1"
								appearance="light"
								className="new-folder-live"
								preset="tahoe"
							>
								{preset === "list" ? (
									<MacFileList
										columns={NAME_COLUMN}
										columnWidths={{ name: 263 }}
										items={files}
										key={revision}
										label="New Folder list comparison"
										minRows={4}
										onRename={rename}
										onRenamingChange={setRenamingId}
										onSelectionChange={noAction}
										renamingId={renamingId}
										resizable={false}
										selectedIds={["new"]}
									/>
								) : null}
								{preset === "columns" ? (
									<MacFileColumns
										items={columnOnly}
										key={revision}
										label="New Folder column comparison"
										onRename={rename}
										onRenamingChange={setRenamingId}
										onValueChange={noAction}
										renamingId={renamingId}
										resizable={false}
										value="new"
									/>
								) : null}
								{preset === "open" ||
								preset === "save" ||
								preset === "duplicate" ? (
									<MacNewFolderPanel
										active={false}
										autoFocus={preset !== "duplicate"}
										initialName={
											preset === "duplicate" ? "Design resources" : undefined
										}
										items={BASE_FILES}
										key={`${preset}:${revision}`}
										onCancel={() =>
											setNotice("Naming cancelled. No folder was created.")
										}
										onCreate={create}
										parentName={PARENT_NAME}
									/>
								) : null}
							</MacOSEnvironment>
						</div>
					</section>
					<footer>{reference.label} · Same names and dimensions</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native New Folder comparison"
						className="new-folder-viewport"
						onScroll={sync}
						ref={native}
					>
						<div className="new-folder-scene">
							<img
								alt={`Native Tahoe ${reference.label}`}
								className="new-folder-native"
								height={reference.height * 2}
								src={image}
								width={reference.width * 2}
							/>
						</div>
					</section>
					<footer>macOS Tahoe 26.6.2 · Captured at 2×</footer>
				</section>
			</div>
			<output aria-live="polite" className="new-folder-output">
				{notice ||
					"The native side is fixed; the React editor and naming sheet are interactive."}
			</output>
			<div className="dock-study-notes">
				<p>
					These are genuine Finder, NSOpenPanel, and NSSavePanel captures using
					generated demo folders. Finder references are cropped to the naming
					column. Naming sheets retain inactive input selection; file artwork
					and font rasterization can differ from native.
				</p>
			</div>
			<FinderWorkbench />
			<DialogWorkbench />
		</main>
	);
}

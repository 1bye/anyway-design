/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls in the rename comparison workbench. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { MacFileIcon } from "@anyway-design/macos/file-icons";
import { MacFileList } from "@anyway-design/macos/file-list";
import { FileRenameField } from "@anyway-design/macos/file-rename-field";
import { type MacFile, MacFileGrid } from "@anyway-design/macos/files";
import { MacContextMenu } from "@anyway-design/macos/menu";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
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
import "./dock-reference.css";
import "./window-reference.css";
import "./file-rename-reference.css";

const ORIGINAL = "Agreement for Services.pdf";
const FIXTURES: MacFile[] = [
	{ id: "agreement", kind: "pdf", name: ORIGINAL },
	{ id: "folder", kind: "folder", name: "Design resources" },
	{
		id: "photo",
		kind: "image",
		name: "Photo 2.webp",
		thumbnail: "/assets/clouds.webp",
	},
	{
		id: "notes",
		kind: "text",
		name: "Meeting notes.txt",
		tags: [{ color: "#30b956", label: "Green" }],
	},
	{
		id: "long",
		kind: "document",
		name: "A longer filename that wraps across several lines.pages",
	},
	{ id: "hidden", kind: "text", name: ".env.local" },
	{
		disabled: true,
		id: "offline",
		kind: "document",
		name: "Unavailable document.pdf",
	},
];

export function FileRenameReferenceComparison() {
	const [list, setList] = useState(false);
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [comparisonName, setComparisonName] = useState(ORIGINAL);
	const [editing, setEditing] = useState(true);
	const [resetKey, setResetKey] = useState(0);
	const [items, setItems] = useState(FIXTURES);
	const [selected, setSelected] = useState(["agreement"]);
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [dark, setDark] = useState(true);
	const [narrow, setNarrow] = useState(false);
	const [extensions, setExtensions] = useState(true);
	const [notice, setNotice] = useState("");
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const [contextTarget, setContextTarget] = useState<string | null>(null);
	const scale = zoom === "fit" ? fit : Number(zoom);
	useLayoutEffect(() => {
		const el = live.current;
		if (!el) {
			return;
		}
		const resize = () => setFit(Math.min(1, el.clientWidth / 460));
		const observer = new ResizeObserver(resize);
		observer.observe(el);
		resize();
		return () => observer.disconnect();
	}, []);
	const sync = useCallback((event: UIEvent<HTMLElement>) => {
		const from = event.currentTarget;
		const to = from === live.current ? native.current : live.current;
		if (to && Math.abs(to.scrollLeft - from.scrollLeft) > 1) {
			to.scrollLeft = from.scrollLeft;
		}
	}, []);
	const reset = useCallback(() => {
		setComparisonName(ORIGINAL);
		setEditing(true);
		setResetKey((value) => value + 1);
	}, []);
	const comparisonCommit = useCallback(
		(_id: string, name: string) => setComparisonName(name),
		[]
	);
	const comparisonEnd = useCallback(() => setEditing(false), []);
	const rename = useCallback((id: string, name: string) => {
		setItems((current) =>
			current.map((file) => (file.id === id ? { ...file, name } : file))
		);
		setNotice(`Renamed to “${name}”.`);
	}, []);
	const validate = useCallback(
		(id: string, name: string) =>
			items.some(
				(file) =>
					file.id !== id &&
					file.name.normalize("NFC").toLocaleLowerCase() ===
						name.normalize("NFC").toLocaleLowerCase()
			)
				? "A file with this name already exists."
				: undefined,
		[items]
	);
	const context = useCallback(
		(event: MouseEvent<HTMLElement>) => {
			if (!(event.target instanceof Element)) {
				return;
			}
			if (event.target.closest(".mac-file-rename")) {
				event.stopPropagation();
				return;
			}
			const target = event.target.closest<HTMLElement>("[data-file-id]");
			const id =
				target?.dataset.fileId ?? (selected.length === 1 ? selected[0] : null);
			const file = items.find((item) => item.id === id);
			const targetId = file && !file.disabled ? file.id : null;
			setContextTarget(targetId);
			if (targetId) {
				setSelected([targetId]);
			}
		},
		[items, selected]
	);
	const menuAction = useCallback(
		(action: string) => {
			const id = contextTarget;
			if (action === "rename" && id) {
				// Wait until the menu has restored its trigger focus before mounting the editor.
				requestAnimationFrame(() => setRenamingId(id));
			}
		},
		[contextTarget]
	);
	const open = useCallback(
		(id: string) =>
			setNotice(
				`Open callback: ${items.find((file) => file.id === id)?.name ?? id}`
			),
		[items]
	);
	return (
		<main
			className="dock-study rename-study"
			style={{ "--rename-study-zoom": scale } as CSSProperties}
		>
			<header className="dock-study-header">
				<a href="/?view=quick-look-reference">← Back to Quick Look</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · INLINE RENAME STUDY</p>
				<h1>A name, in place.</h1>
				<a href="/?view=folder-list-reference">Compare expandable folders ↗</a>
				<p>
					The same filename and dimensions beside a native AppKit editor
					rendered on this Mac.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="dock-study-jump">
					<button
						aria-pressed={!list}
						onClick={() => {
							setList(false);
							reset();
							setRenamingId(null);
						}}
						type="button"
					>
						Icon view
					</button>
					<button
						aria-pressed={list}
						onClick={() => {
							setList(true);
							reset();
							setRenamingId(null);
						}}
						type="button"
					>
						List view
					</button>
					<button onClick={reset} type="button">
						Reset native match
					</button>
				</div>
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
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our rename editor</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="React rename comparison"
						className="rename-study-viewport"
						onScroll={sync}
						ref={live}
					>
						<MacOSEnvironment
							appearance="dark"
							className="rename-study-scene"
							preset="tahoe"
						>
							<div className="rename-study-editor" data-list={list}>
								<MacFileIcon name="pdf" />
								{editing ? (
									<FileRenameField
										file={{
											id: "comparison",
											kind: "pdf",
											name: comparisonName,
										}}
										key={`${list}-${resetKey}`}
										multiline={!list}
										onCommit={comparisonCommit}
										onEnd={comparisonEnd}
									/>
								) : (
									<button onClick={reset} type="button">
										Edit again
									</button>
								)}
							</div>
						</MacOSEnvironment>
					</section>
					<footer>Native HTML editing · 13px system font</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native AppKit on Tahoe</h2>
						<a
							href={`/assets/native-file-rename/tahoe-${list ? "list" : "grid"}-editor.png`}
							rel="noopener"
							target="_blank"
						>
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native AppKit comparison"
						className="rename-study-viewport"
						onScroll={sync}
						ref={native}
					>
						<div className="rename-study-scene">
							<img
								alt={`Native Tahoe ${list ? "single-line" : "wrapping"} AppKit text field, with basename selected and pdf extension unselected`}
								height={440}
								src={`/assets/native-file-rename/tahoe-${list ? "list" : "grid"}-editor.png`}
								width={920}
							/>
						</div>
					</section>
					<footer>Native NSTextField · 2× render · Inactive selection</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					The native side is an AppKit control baseline, not a Finder
					screenshot. Finder’s floating rename editor is omitted by the window
					capture API. Its exact border, padding, and active selection still
					need a direct Finder capture. The native reference shows inactive
					selection; the focused browser editor uses the active accent.
				</p>
				<p>
					Return begins renaming in the workbench. The basename is selected; the
					extension stays visible. Enter commits, Escape cancels, and clicking
					away commits a valid name.{" "}
					<a
						href="https://support.apple.com/guide/mac-help/rename-files-folders-and-disks-on-mac-mchlp1144/26/mac/26"
						rel="noopener"
						target="_blank"
					>
						Apple’s rename guide ↗
					</a>
				</p>
			</div>
			<section
				aria-labelledby="rename-workbench-heading"
				className="rename-workbench"
			>
				<h2 id="rename-workbench-heading">Select a file. Press Return.</h2>
				<p>
					Right-click a file for Rename, or use the button. Try wrapping names,
					hidden extensions, a duplicate name, and an unavailable file.
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
							checked={narrow}
							onChange={(event) => setNarrow(event.target.checked)}
							type="checkbox"
						/>{" "}
						Narrow container
					</label>
					<label>
						<input
							checked={extensions}
							onChange={(event) => setExtensions(event.target.checked)}
							type="checkbox"
						/>{" "}
						Show extensions
					</label>
					<button
						disabled={
							selected.length !== 1 ||
							items.find((file) => file.id === selected[0])?.disabled
						}
						onClick={() => setRenamingId(selected[0] ?? null)}
						type="button"
					>
						Rename selected
					</button>
					<button
						onClick={() => {
							setRenamingId(null);
							setItems(FIXTURES);
							setSelected(["agreement"]);
							setNotice("");
						}}
						type="button"
					>
						Reset files
					</button>
				</div>
				<MacOSEnvironment
					appearance={dark ? "dark" : "light"}
					className="rename-workbench-environment"
					preset="tahoe"
					style={{ maxWidth: narrow ? 300 : 860 }}
				>
					<MacContextMenu
						items={[
							{
								disabled: !contextTarget,
								icon: <WindowSymbol name="rename" />,
								id: "rename",
								label: "Rename",
							},
						]}
						onAction={menuAction}
						trigger={
							<div
								className="rename-workbench-files"
								onContextMenuCapture={context}
								tabIndex={-1}
							>
								{list ? (
									<MacFileList
										items={items}
										onOpen={open}
										onRename={rename}
										onRenamingChange={setRenamingId}
										onSelectionChange={setSelected}
										renamingId={renamingId}
										selectedIds={selected}
										showExtensions={extensions}
										validateRename={validate}
									/>
								) : (
									<MacFileGrid
										items={items}
										onOpen={open}
										onRename={rename}
										onRenamingChange={setRenamingId}
										onSelectionChange={setSelected}
										renamingId={renamingId}
										selectedIds={selected}
										showExtensions={extensions}
										validateRename={validate}
									/>
								)}
							</div>
						}
					/>
				</MacOSEnvironment>
				<p aria-live="polite" className="dock-study-selection">
					{notice ||
						"Demo names stay in this page. No files on your Mac are renamed."}
				</p>
			</section>
		</main>
	);
}

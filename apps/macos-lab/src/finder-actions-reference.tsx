/** biome-ignore-all lint/performance/noJsxPropsBind: Comparison controls own their demonstration data. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import {
	MacFinder,
	type MacFinderFile,
	type MacFinderHandle,
} from "@anyway-design/macos/finder";
import { ArrowLeft } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import "./dock-reference.css";
import "./window-reference.css";
import "./finder-actions-reference.css";

const FILES: MacFinderFile[] = [
	{ id: "root", kind: "folder", name: "File actions" },
	{ id: "archive", kind: "folder", name: "Archive", parentId: "root" },
	{
		id: "resources",
		kind: "folder",
		name: "Design resources",
		parentId: "root",
	},
	{ id: "brand", kind: "folder", name: "Brand", parentId: "resources" },
	{
		id: "colors",
		kind: "text",
		name: "Colors.txt",
		parentId: "brand",
		preview: { text: "Blue\nGreen\n" },
	},
	{
		id: "notes",
		kind: "text",
		name: "Notes.txt",
		parentId: "root",
		preview: {
			text: "Anyway Design\nDemonstration file actions.\n".repeat(18),
		},
	},
	{
		id: "brief",
		kind: "text",
		name: "Project brief.txt",
		parentId: "root",
		preview: { text: "Original project brief for file actions.\n".repeat(15) },
	},
];
const SCENARIOS = {
	duplicate: {
		capture: "duplicate",
		commands: ["duplicate"],
		label: "Duplicate",
		selected: "notes",
	},
	move: {
		capture: "move",
		commands: ["copy", "archive", "move-here"],
		label: "Move Here",
		selected: "brief",
	},
	paste: {
		capture: "paste",
		commands: ["copy", "archive", "paste"],
		label: "Copy / Paste",
		selected: "notes",
	},
	redo: {
		capture: "redo-trash",
		commands: ["trash", "undo", "redo"],
		label: "Redo",
		selected: "notes",
	},
	trash: {
		capture: "trash",
		commands: ["trash"],
		label: "Move to Trash",
		selected: "notes",
	},
	undo: {
		capture: "undo-trash",
		commands: ["trash", "undo"],
		label: "Undo",
		selected: "notes",
	},
} as const;
type Scenario = keyof typeof SCENARIOS;
const SCENARIO_ORDER: Scenario[] = [
	"duplicate",
	"paste",
	"move",
	"trash",
	"undo",
	"redo",
];
const COMMANDS = [
	["copy", "Copy"],
	["paste", "Paste"],
	["move-here", "Move Here"],
	["duplicate", "Duplicate"],
	["trash", "Trash"],
	["undo", "Undo"],
	["redo", "Redo"],
] as const;

function LiveActions({ scenario }: { scenario: Scenario }) {
	const match = SCENARIOS[scenario];
	const [files, setFiles] = useState(FILES);
	const [step, setStep] = useState(0);
	const [readOnly, setReadOnly] = useState(false);
	const [notice, setNotice] = useState("Preparing native match…");
	const finder = useRef<MacFinderHandle>(null);
	// Run real public commands after each controlled update, including under StrictMode.
	useEffect(() => {
		const command = match.commands[step];
		if (!command) {
			return;
		}
		const timer = window.setTimeout(() => {
			if (command === "archive") {
				finder.current?.navigate("archive");
			} else {
				finder.current?.command(command);
			}
			setStep((value) => value + 1);
		}, 60);
		return () => window.clearTimeout(timer);
	}, [step, match]);
	return (
		<>
			<section
				aria-label="Live file actions comparison"
				className="finder-actions-viewport"
			>
				<div className="finder-actions-scene">
					<MacOSEnvironment appearance="dark" preset="tahoe">
						<MacFinder
							active
							defaultTabs={[
								{
									id: "main",
									location: "root",
									selectedIds: [match.selected],
									view: "list",
								},
							]}
							defaultView="list"
							files={files}
							onAction={(id) => {
								if (id === "copy") {
									setNotice("Copied to this Finder’s clipboard.");
								}
							}}
							onFilesChange={
								readOnly
									? undefined
									: (next, change) => {
											setFiles(next);
											setNotice(`${change.action}: ${change.label}`);
										}
							}
							ref={finder}
							rootId="root"
							showExtensions
							showSidebar={false}
							showTabs={false}
							showToolbar={false}
							style={{ height: 200, width: 920 }}
						/>
					</MacOSEnvironment>
				</div>
			</section>
			<footer>
				{scenario === "paste" || scenario === "move"
					? "Archive"
					: "File actions"}{" "}
				· live commands · right-click a file for its menu
			</footer>
			<div className="finder-actions-live-controls">
				<div className="dock-study-jump">
					{COMMANDS.map(([id, label]) => (
						<button
							key={id}
							onClick={() => finder.current?.command(id)}
							type="button"
						>
							{label}
						</button>
					))}
				</div>
				<div className="dock-study-jump">
					<button
						onClick={() => finder.current?.navigate("root")}
						type="button"
					>
						Root folder
					</button>
					<button
						onClick={() => finder.current?.navigate("archive")}
						type="button"
					>
						Archive
					</button>
					<label>
						View{" "}
						<select
							aria-label="Live view"
							defaultValue="list"
							onChange={(event) => finder.current?.command(event.target.value)}
						>
							<option value="icons">Icons</option>
							<option value="list">List</option>
							<option value="columns">Columns</option>
							<option value="gallery">Gallery</option>
						</select>
					</label>
					<label>
						<input
							checked={readOnly}
							onChange={(event) => setReadOnly(event.target.checked)}
							type="checkbox"
						/>{" "}
						Read only
					</label>
				</div>
				<output aria-live="polite">{notice}</output>
				<details>
					<summary>Live file data</summary>
					<pre>
						{JSON.stringify(
							files.map(({ id, parentId, name }) => ({ id, name, parentId })),
							null,
							2
						)}
					</pre>
				</details>
			</div>
		</>
	);
}

export function FinderActionsReferenceComparison() {
	const [scenario, setScenario] = useState<Scenario>("duplicate");
	const [generation, setGeneration] = useState(0);
	const [zoom, setZoom] = useState("1");
	const capture = `/assets/native-finder-actions/tahoe-${SCENARIOS[scenario].capture}.png`;
	return (
		<main
			className="dock-study finder-actions-study"
			style={{ "--actions-study-zoom": Number(zoom) } as CSSProperties}
		>
			<header className="dock-study-header">
				<a href="/?component=finder">
					<ArrowLeft size={14} /> Finder playground
				</a>
				<span>TAHOE / FILE ACTIONS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">FILES, WITH A HISTORY.</p>
				<h1>Make a copy. Take it back.</h1>
				<p>
					Live Finder commands beside the same operations captured in native
					Tahoe.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="dock-study-jump">
					{SCENARIO_ORDER.map((id) => (
						<button
							aria-pressed={scenario === id}
							key={id}
							onClick={() => {
								setScenario(id);
								setGeneration((value) => value + 1);
							}}
							type="button"
						>
							{SCENARIOS[id].label}
						</button>
					))}
					<button
						onClick={() => setGeneration((value) => value + 1)}
						type="button"
					>
						Replay match
					</button>
				</div>
				<label>
					Shared zoom{" "}
					<select
						aria-label="Shared zoom"
						onChange={(event) => setZoom(event.target.value)}
						value={zoom}
					>
						<option value="1">1×</option>
						<option value="1.5">1.5×</option>
						<option value="2">2×</option>
					</select>
				</label>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our Finder</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<LiveActions key={`${scenario}-${generation}`} scenario={scenario} />
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={capture} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<div className="finder-actions-viewport">
						<div className="finder-actions-scene">
							<img
								alt={`Native Tahoe Finder after ${SCENARIOS[scenario].label}`}
								draggable={false}
								height={200}
								src={capture}
								width={510}
							/>
						</div>
					</div>
					<footer>Finder on this Mac · Name column · captured at 2×</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Choose a match above to replay real commands from a fresh fixture.
					Then select files and use the live buttons, context menu, or ⌘C, ⌘V,
					⌥⌘V, ⌘D, ⌘⌫, ⌘Z and ⇧⌘Z. The native panel stays on its captured
					result.
				</p>
				<p>
					Duplicate selects the copy. Paste and Move Here leave it unselected.
					Trash selects the next row; Undo restores and selects the removed
					file. Both panels use the same filenames and logical scale. Native
					text icons come from this Mac’s default editor; our document icons are
					generic. Other views are interactive, without matching captures.
				</p>
				<p>
					These operations update demo records in memory. The clipboard belongs
					to this Finder; no system clipboard files or disk contents are read or
					changed. Copies include nested folders and get fresh IDs. Existing
					names use a “copy” suffix. Trash can be reversed through local Undo
					history.
				</p>
				<a
					href="/assets/native-finder-actions/SOURCES.md"
					rel="noopener"
					target="_blank"
				>
					Capture notes ↗
				</a>
			</div>
		</main>
	);
}

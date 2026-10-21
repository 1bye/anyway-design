/** biome-ignore-all lint/performance/noJsxPropsBind: Comparison controls own their demonstration hierarchy. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import {
	MacFinder,
	type MacFinderFile,
	type MacFinderHandle,
	type MacFinderView,
} from "@anyway-design/macos/finder";
import { ArrowLeft } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { finderImports } from "./finder-import";
import "./dock-reference.css";
import "./window-reference.css";
import "./finder-drag-reference.css";

const FILES: MacFinderFile[] = [
	{ id: "root", kind: "folder", name: "Drag reference" },
	{ id: "archive", kind: "folder", name: "Archive", parentId: "root" },
	{
		id: "clouds",
		kind: "image",
		name: "Clouds.webp",
		parentId: "root",
		thumbnail: "/assets/clouds.webp",
	},
	{
		id: "resources",
		kind: "folder",
		name: "Design resources",
		parentId: "root",
	},
	{
		id: "notes",
		kind: "text",
		name: "Notes.txt",
		parentId: "root",
		thumbnail: "/assets/native-file-gallery/notes-thumbnail.png",
	},
	{ id: "photos", kind: "folder", name: "Photos", parentId: "root" },
	{
		id: "brief",
		kind: "text",
		name: "Project brief.txt",
		parentId: "root",
		thumbnail: "/assets/native-file-gallery/notes-thumbnail.png",
	},
	{ id: "brand", kind: "folder", name: "Brand", parentId: "resources" },
	{ id: "readme", kind: "text", name: "Read me.txt", parentId: "resources" },
	{ id: "colors", kind: "text", name: "Colors.txt", parentId: "brand" },
];
const TABS = [{ id: "main", location: "root", selectedIds: ["clouds"] }];
const VIEWS: MacFinderView[] = ["icons", "list", "columns", "gallery"];
export function FinderDragReferenceComparison() {
	const [files, setFiles] = useState(FILES);
	const [generation, setGeneration] = useState(0);
	const [zoom, setZoom] = useState("1.5");
	const [dark, setDark] = useState(true);
	const [sidebar, setSidebar] = useState(false);
	const [readOnly, setReadOnly] = useState(false);
	const [view, setView] = useState<MacFinderView>("icons");
	const [notice, setNotice] = useState(
		"Drag Clouds.webp over Archive to compare the folder feedback. Hold over Design resources to browse into Brand."
	);
	const finder = useRef<MacFinderHandle>(null);
	const objectUrls = useRef<string[]>([]);
	useEffect(
		() => () => {
			for (const url of objectUrls.current) {
				URL.revokeObjectURL(url);
			}
		},
		[]
	);
	const reset = () => {
		setFiles(FILES);
		setGeneration((value) => value + 1);
		setView("icons");
		setDark(true);
		setSidebar(false);
		setReadOnly(false);
		setNotice(
			"Native match restored. Drag one file, or ⌘-click to select several."
		);
	};
	return (
		<main
			className="dock-study finder-drag-study"
			style={{ "--drag-study-zoom": Number(zoom) } as CSSProperties}
		>
			<header className="dock-study-header">
				<a href="/?component=finder">
					<ArrowLeft size={14} /> Finder playground
				</a>
				<span>TAHOE / DRAG & DROP</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">FILES, IN MOTION.</p>
				<h1>Drag into place.</h1>
				<p>Live folder moves beside a genuine Tahoe Finder capture.</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="dock-study-jump">
					<button onClick={reset} type="button">
						Reset native match
					</button>
					<button
						onClick={() => finder.current?.navigate("root")}
						type="button"
					>
						Back to demo folder
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
			<div className="window-study-controls">
				<label>
					Live view{" "}
					<select
						aria-label="Live view"
						onChange={(event) => {
							const next = VIEWS.find((entry) => entry === event.target.value);
							if (next) {
								setView(next);
								finder.current?.command(next);
							}
						}}
						value={view}
					>
						{VIEWS.map((entry) => (
							<option key={entry} value={entry}>
								{entry}
							</option>
						))}
					</select>
				</label>
				<label>
					<input
						checked={sidebar}
						onChange={(event) => setSidebar(event.target.checked)}
						type="checkbox"
					/>{" "}
					Sidebar targets
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
						checked={readOnly}
						onChange={(event) => setReadOnly(event.target.checked)}
						type="checkbox"
					/>{" "}
					Read only
				</label>
				<a href="/?component=finder">Try the full Finder ↗</a>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our Finder</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Live drag comparison"
						className="finder-drag-viewport"
					>
						<div className="finder-drag-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								preset="tahoe"
							>
								<MacFinder
									active
									defaultTabs={TABS}
									files={files}
									key={generation}
									onImport={
										readOnly
											? undefined
											: (incoming, parentId) => {
													const imported = finderImports(
														incoming,
														parentId,
														files,
														objectUrls.current
													);
													setFiles((previous) => [...previous, ...imported]);
													setNotice(
														`Imported ${imported.length} files into ${files.find((file) => file.id === parentId)?.name}.`
													);
												}
									}
									onMove={
										readOnly
											? undefined
											: (ids, parentId) => {
													setFiles((previous) =>
														previous.map((file) =>
															ids.includes(file.id)
																? { ...file, parentId }
																: file
														)
													);
													setNotice(
														`Moved ${ids.length} ${ids.length === 1 ? "item" : "items"} into ${files.find((file) => file.id === parentId)?.name}.`
													);
												}
									}
									onViewChange={setView}
									ref={finder}
									rootId="root"
									showExtensions
									showSidebar={sidebar}
									showTabs={false}
									showToolbar={false}
									sidebarGroups={[
										{
											id: "places",
											items: FILES.filter((file) => file.kind === "folder").map(
												(file) => ({ id: file.id, label: file.name })
											),
											label: "Folders",
										},
									]}
									style={{ height: 234, width: sidebar ? 513 : 348 }}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>Drag · hold over a folder to open it · Escape cancels</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a
							href="/assets/native-finder-drag/tahoe-folder-target.png"
							rel="noopener"
							target="_blank"
						>
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native folder target reference"
						className="finder-drag-viewport"
					>
						<div className="finder-drag-scene">
							<img
								alt="Native Tahoe Finder during a drag, showing Archive as a folder target and Clouds.webp selected"
								draggable={false}
								height={234}
								src="/assets/native-finder-drag/tahoe-folder-target.png"
								width={348}
							/>
						</div>
					</section>
					<footer>Finder on this Mac · folder feedback · captured at 2×</footer>
				</section>
			</div>
			<output aria-live="polite" className="dock-study-selection">
				{notice}
			</output>
			<div className="dock-study-notes">
				<p>
					The native capture contains only generated demo files. Both sides use
					the same Clouds.webp. Icons, labels, and folder feedback share the
					same logical scale; use Icons + Dark + no sidebar to restore the
					native layout.
				</p>
				<p>
					macOS’s floating drag image is on a separate system surface and is
					omitted by the native window capture. The React preview is an initial
					approximation; its stack, opacity, and the 800ms spring-loading delay
					are not yet calibrated against a screen recording. The native text
					thumbnails differ from our supplied demo thumbnails.
				</p>
				<p>
					Moves update this example’s data in memory. Dropping on a file, a
					smart collection, a locked folder, a descendant, or a conflicting
					filename is rejected. Releasing outside Finder or pressing Escape
					cancels; temporary hover navigation returns to its starting location.
					The other views and sidebar are live examples, without matched native
					captures.
				</p>
			</div>
		</main>
	);
}

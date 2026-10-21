import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { MacWindow } from "@anyway-design/macos/window";
import { WindowSidebar } from "@anyway-design/macos/window-sidebar";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import {
	WindowToolbarButton,
	WindowToolbarGroup,
} from "@anyway-design/macos/window-toolbar";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
	type ChangeEvent,
	type CSSProperties,
	type MouseEvent,
	type UIEvent,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	WINDOW_REFERENCE_CROPS,
	WINDOW_REFERENCE_GROUPS,
	WINDOW_REFERENCE_IMAGE,
	WINDOW_REFERENCE_ORIGINAL,
	WINDOW_REFERENCE_SIZE,
	WINDOW_REFERENCE_SOURCE,
} from "./window-reference-assets";
import "./dock-reference.css";
import "./window-reference.css";
import { FinderToolbar } from "./finder-toolbar";
import {
	FileIconWorkbench,
	FileThumbnailWorkbench,
} from "./window-reference-files";
import { WindowReferenceTabs } from "./window-reference-tabs";

type WindowDetail = keyof typeof WINDOW_REFERENCE_CROPS;
const SCENE_INSET = 24;

export function WindowReferenceComparison() {
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [detail, setDetail] = useState<WindowDetail>("window");
	const [active, setActive] = useState(true);
	const [sidebarVisible, setSidebarVisible] = useState(true);
	const [opaque, setOpaque] = useState(false);
	const [selected, setSelected] = useState("documents");
	const [notice, setNotice] = useState("");
	const [imageFailed, setImageFailed] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [crowdedTabs, setCrowdedTabs] = useState(false);
	const [compactTabs, setCompactTabs] = useState(false);
	const [tabReset, setTabReset] = useState(0);
	const liveViewport = useRef<HTMLElement>(null);
	const referenceViewport = useRef<HTMLElement>(null);
	const crop = WINDOW_REFERENCE_CROPS[detail];
	const sceneWidth = crop.width + SCENE_INSET * 2;
	const sceneHeight =
		(menuOpen
			? Math.max(crop.height, WINDOW_REFERENCE_SIZE.height)
			: crop.height) +
		SCENE_INSET * 2;
	const scale = zoom === "fit" ? fit : Number(zoom);

	useLayoutEffect(() => {
		const viewport = liveViewport.current;
		if (viewport === null) {
			return;
		}
		const resize = () => setFit(Math.min(1, viewport.clientWidth / sceneWidth));
		const observer = new ResizeObserver(resize);
		observer.observe(viewport);
		resize();
		return () => observer.disconnect();
	}, [sceneWidth]);

	const syncScroll = useCallback((event: UIEvent<HTMLElement>) => {
		const from = event.currentTarget;
		const to =
			from === liveViewport.current
				? referenceViewport.current
				: liveViewport.current;
		if (
			to !== null &&
			(Math.abs(to.scrollLeft - from.scrollLeft) > 1 ||
				Math.abs(to.scrollTop - from.scrollTop) > 1)
		) {
			to.scrollTo(from.scrollLeft, from.scrollTop);
		}
	}, []);
	const resetScroll = useCallback(() => {
		liveViewport.current?.scrollTo(0, 0);
		referenceViewport.current?.scrollTo(0, 0);
	}, []);
	const changeZoom = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setZoom(event.target.value);
			resetScroll();
		},
		[resetScroll]
	);
	const changeDetail = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const { detail: next } = event.currentTarget.dataset;
			if (
				next === "window" ||
				next === "toolbar" ||
				next === "sidebar" ||
				next === "files"
			) {
				setDetail(next);
				resetScroll();
			}
		},
		[resetScroll]
	);
	const changeActive = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setActive(event.target.checked),
		[]
	);
	const changeSidebar = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setSidebarVisible(event.target.checked),
		[]
	);
	const changeOpacity = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setOpaque(event.target.checked),
		[]
	);
	const changeCrowdedTabs = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setCrowdedTabs(event.target.checked),
		[]
	);
	const changeCompactTabs = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setCompactTabs(event.target.checked),
		[]
	);
	const selectSidebar = useCallback((id: string) => {
		setSelected(id);
		const item = WINDOW_REFERENCE_GROUPS.flatMap((group) => group.items).find(
			(entry) => entry.id === id
		);
		setNotice(
			`${item?.label ?? "Sidebar item"} selected. The file pane stays fixed for comparison.`
		);
	}, []);
	const toolbarAction = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		setNotice(
			`${event.currentTarget.getAttribute("aria-label")} activated. Toolbar actions are preview callbacks.`
		);
	}, []);
	const menuAction = useCallback(
		(id: string) =>
			setNotice(`${id} activated. File actions are preview callbacks.`),
		[]
	);
	const fileOpen = useCallback(
		(id: string) =>
			setNotice(`Open callback: ${id}. No system files are opened.`),
		[]
	);
	const close = useCallback(
		() =>
			setNotice(
				"Close callback received. The comparison keeps the window open."
			),
		[]
	);
	const minimize = useCallback(
		() =>
			setNotice(
				"Minimize callback received. The comparison keeps the window open."
			),
		[]
	);
	const maximize = useCallback(
		() =>
			setNotice(
				"Zoom callback received. Use Shared zoom to inspect the window."
			),
		[]
	);
	const imageError = useCallback(() => setImageFailed(true), []);
	const reset = useCallback(() => {
		setActive(true);
		setSidebarVisible(true);
		setOpaque(false);
		setSelected("documents");
		setNotice("");
		setCrowdedTabs(false);
		setCompactTabs(false);
		setTabReset((current) => current + 1);
		resetScroll();
	}, [resetScroll]);

	const sidebar = sidebarVisible ? (
		<WindowSidebar
			groups={WINDOW_REFERENCE_GROUPS}
			label="Finder sidebar"
			onSelect={selectSidebar}
			selected={selected}
		/>
	) : undefined;
	const leading = (
		<WindowToolbarGroup label="Navigation">
			<WindowToolbarButton label="Back" onClick={toolbarAction}>
				<WindowSymbol name="chevron-left" />
			</WindowToolbarButton>
			<WindowToolbarButton disabled label="Forward">
				<WindowSymbol name="chevron-right" />
			</WindowToolbarButton>
		</WindowToolbarGroup>
	);
	const toolbar = (
		<FinderToolbar
			filename="Agreement for Services"
			onAction={menuAction}
			onOpenChange={setMenuOpen}
		/>
	);
	const sceneStyle = {
		"--window-study-crop-x": `${crop.x}px`,
		"--window-study-crop-y": `${crop.y}px`,
		"--window-study-height": `${sceneHeight}px`,
		"--window-study-width": `${sceneWidth}px`,
		"--window-study-zoom": scale,
	} as CSSProperties;

	return (
		<main className="dock-study window-study" style={sceneStyle}>
			<header className="dock-study-header">
				<a href="/?component=window">
					<ArrowLeft size={15} /> Back to the lab
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · WINDOW STUDY</p>
				<h1>A closer look at the window.</h1>
				<p>
					Compare the floating sidebar, toolbar, tabs, and live file items
					against Apple’s Finder.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<fieldset aria-label="Detail" className="dock-study-jump">
					<button
						aria-pressed={detail === "window"}
						data-detail="window"
						onClick={changeDetail}
						type="button"
					>
						Full window
					</button>
					<button
						aria-pressed={detail === "toolbar"}
						data-detail="toolbar"
						onClick={changeDetail}
						type="button"
					>
						Toolbar
					</button>
					<button
						aria-pressed={detail === "sidebar"}
						data-detail="sidebar"
						onClick={changeDetail}
						type="button"
					>
						Sidebar
					</button>
					<button
						aria-pressed={detail === "files"}
						data-detail="files"
						onClick={changeDetail}
						type="button"
					>
						Files
					</button>
				</fieldset>
				<label>
					Shared zoom
					<select onChange={changeZoom} value={zoom}>
						<option value="fit">Fit both</option>
						<option value="1">1×</option>
						<option value="1.5">1.5×</option>
						<option value="2">2×</option>
					</select>
				</label>
			</div>
			<div className="window-study-controls">
				<a href="/?view=file-list-reference">Compare file lists ↗</a>
				<a href="/?view=menu-reference">Compare menus ↗</a>
				<label>
					<input checked={active} onChange={changeActive} type="checkbox" />{" "}
					Active window
				</label>
				<label>
					<input
						checked={sidebarVisible}
						onChange={changeSidebar}
						type="checkbox"
					/>{" "}
					Show sidebar
				</label>
				<label>
					<input checked={opaque} onChange={changeOpacity} type="checkbox" />{" "}
					Reduce transparency
				</label>
				<button onClick={reset} type="button">
					Reset comparison
				</button>
			</div>
			<div className="window-study-controls">
				<label>
					<input
						checked={crowdedTabs}
						onChange={changeCrowdedTabs}
						type="checkbox"
					/>
					More tabs
				</label>
				<label>
					<input
						checked={compactTabs}
						onChange={changeCompactTabs}
						type="checkbox"
					/>
					Narrow tab area (260px)
				</label>
				<span>
					Drag to reorder · Arrow keys to switch · Delete to close · ⌥⇧← / → to
					reorder
				</span>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our window</h2>
						<span>
							<i /> Live React chrome
						</span>
					</header>
					<section
						aria-label="Our window close-up. Scroll to inspect."
						className="window-study-viewport"
						onScroll={syncScroll}
						ref={liveViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the scrolling comparison.
						tabIndex={0}
					>
						<div className="window-study-scene">
							<MacOSEnvironment
								className="window-study-live"
								preset="tahoe"
								reduceTransparency={opaque}
							>
								<MacWindow
									active={active}
									onClose={close}
									onMinimize={minimize}
									onZoom={maximize}
									sidebar={sidebar}
									sidebarWidth={121}
									style={WINDOW_REFERENCE_SIZE}
									title="Documents"
									toolbar={toolbar}
									toolbarLeading={leading}
									variant="finder"
								>
									<WindowReferenceTabs
										compact={compactTabs}
										crowded={crowdedTabs}
										key={`${tabReset}-${crowdedTabs}`}
										onFileOpen={fileOpen}
									/>
								</MacWindow>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>Shared MacWindow + MacTabs + MacFileGrid · live React</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Apple’s reference</h2>
						<a
							href={WINDOW_REFERENCE_ORIGINAL}
							rel="noopener noreferrer"
							target="_blank"
						>
							Original <ArrowUpRight size={12} />
						</a>
					</header>
					<section
						aria-label="Apple window close-up. Scroll to inspect."
						className="window-study-viewport"
						onScroll={syncScroll}
						ref={referenceViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the scrolling comparison.
						tabIndex={0}
					>
						<div className="window-study-scene">
							{imageFailed ? (
								<p className="window-study-error" role="status">
									Apple’s image could not load. Open the original above.
								</p>
							) : (
								// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Handles image loading failure, not interaction.
								<img
									alt="Apple’s Tahoe Finder window with floating sidebar and grouped toolbar controls"
									className="window-study-original"
									draggable={false}
									height={694}
									onError={imageError}
									src={WINDOW_REFERENCE_IMAGE}
									width={1144}
								/>
							)}
						</div>
					</section>
					<footer>Apple’s macOS Tahoe 26 user guide · Documents</footer>
				</section>
			</div>
			<FileIconWorkbench />
			<FileThumbnailWorkbench />
			<div className="dock-study-notes">
				<p>
					Shared zoom and synchronized scrolling keep both views aligned. Use
					Toolbar, Sidebar, or Files for a closer inspection. File selection is
					live; Reset comparison restores Apple’s selected document.
				</p>
				<p>
					Reference:{" "}
					<a
						href={WINDOW_REFERENCE_SOURCE}
						rel="noopener noreferrer"
						target="_blank"
					>
						Apple’s “Use the Finder on Mac” guide for Tahoe 26 ↗
					</a>
					. The 1144 × 694 image is displayed at a shared 2:1 normalization
					before zoom.
				</p>
				<p>
					Window chrome, toolbar buttons, sidebar rows, tabs, file labels, tags,
					and selection are live React. Only the comparison’s thumbnail artwork
					is clipped from Apple’s image. The examples below use native folder
					and file-type icons from this Mac. Dark and inactive file states are
					adaptations; glass remains an approximation.
				</p>
			</div>
			<p aria-live="polite" className="dock-study-selection">
				{notice}
			</p>
		</main>
	);
}

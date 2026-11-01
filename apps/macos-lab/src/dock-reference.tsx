import { Dock } from "@anyway-design/macos/dock";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
	type ChangeEvent,
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	REFERENCE_CROP as CROP,
	ICON_SIZE,
	REFERENCE_BACKDROP,
	REFERENCE_IMAGE,
	REFERENCE_ITEMS,
	REFERENCE_SCALE,
	REFERENCE_SOURCE,
} from "./dock-reference-assets";
import "./dock-reference.css";

export function DockReferenceComparison() {
	const [zoom, setZoom] = useState(2);
	const [edge, setEdge] = useState("left");
	const [imageFailed, setImageFailed] = useState(false);
	const [selected, setSelected] = useState("");
	const [glass, setGlass] = useState("refractive");
	const liveViewport = useRef<HTMLElement>(null);
	const referenceViewport = useRef<HTMLElement>(null);

	const alignEdge = useCallback((side: string) => {
		for (const viewport of [liveViewport.current, referenceViewport.current]) {
			if (viewport) {
				viewport.scrollLeft = side === "left" ? 0 : viewport.scrollWidth;
			}
		}
	}, []);
	// biome-ignore lint/correctness/useExhaustiveDependencies: Zoom changes scrollWidth, so realign after React updates the layout.
	useEffect(() => alignEdge(edge), [alignEdge, edge, zoom]);

	const changeZoom = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		setZoom(Number(event.target.value));
	}, []);
	const changeGlass = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		setGlass(event.target.value);
	}, []);
	const showLeft = useCallback(() => {
		setEdge("left");
		alignEdge("left");
	}, [alignEdge]);
	const showRight = useCallback(() => {
		setEdge("right");
		alignEdge("right");
	}, [alignEdge]);
	const imageError = useCallback(() => setImageFailed(true), []);
	const activate = useCallback((id: string) => {
		const item = REFERENCE_ITEMS.find((entry) => entry.id === id);
		setSelected(`${item?.label ?? "App"} selected`);
	}, []);

	return (
		<main
			className="dock-study"
			style={
				{
					"--study-height": `${CROP.height * REFERENCE_SCALE}px`,
					"--study-width": `${CROP.width * REFERENCE_SCALE}px`,
					"--study-zoom": zoom,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?component=dock">
					<ArrowLeft size={15} /> Back to the lab
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · DOCK STUDY</p>
				<h1>The details, side by side.</h1>
				<p>Compare the glass edge, icon proportions, and space between them.</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="dock-study-jump">
					<button onClick={showLeft} type="button">
						Left edge
					</button>
					<button onClick={showRight} type="button">
						Separator &amp; Trash
					</button>
				</div>
				<label>
					Glass
					<select onChange={changeGlass} value={glass}>
						<option value="refractive">Live backdrop</option>
						<option value="texture">Wallpaper texture</option>
						<option value="css">CSS blur</option>
					</select>
				</label>
				<label>
					Shared zoom
					<select onChange={changeZoom} value={zoom}>
						<option value={1}>1×</option>
						<option value={1.5}>1.5×</option>
						<option value={2}>2×</option>
						<option value={3}>3×</option>
					</select>
				</label>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our Dock</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our Dock close-up. Scroll horizontally to inspect."
						className="dock-study-viewport"
						ref={liveViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to focus this horizontally scrolling region.
						tabIndex={0}
					>
						<div className="dock-study-live">
							<MacOSEnvironment
								appearance="light"
								className="dock-study-live-content"
								preset="tahoe"
							>
								<Dock
									adaptive={false}
									glass={glass === "css" ? "blur" : "refractive"}
									glassBackdrop={
										glass === "texture" ? REFERENCE_BACKDROP : undefined
									}
									items={REFERENCE_ITEMS}
									magnification={1}
									onActivate={activate}
									position="bottom"
									size={ICON_SIZE}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>52px icon canvas · Tahoe light · resting state</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Apple’s reference</h2>
						<a
							href={REFERENCE_SOURCE}
							rel="noopener noreferrer"
							target="_blank"
						>
							Original <ArrowUpRight size={12} />
						</a>
					</header>
					<section
						aria-label="Apple Dock close-up. Scroll horizontally to inspect."
						className="dock-study-viewport"
						ref={referenceViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to focus this horizontally scrolling region.
						tabIndex={0}
					>
						{imageFailed ? (
							<p className="dock-study-image-error" role="status">
								Apple’s image could not load. Open the original above.
							</p>
						) : (
							<div
								className="dock-study-reference"
								style={{
									height: CROP.height * REFERENCE_SCALE,
									width: CROP.width * REFERENCE_SCALE,
								}}
							>
								{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError handles asset failure, not user interaction. */}
								<img
									alt="Apple’s Tahoe Dock, cropped from its WWDC25 Apple Music desktop"
									draggable={false}
									height={2560}
									onError={imageError}
									src={REFERENCE_IMAGE}
									style={{
										height: 2560 * REFERENCE_SCALE,
										left: -CROP.x * REFERENCE_SCALE,
										top: -CROP.y * REFERENCE_SCALE,
										width: 3840 * REFERENCE_SCALE,
									}}
									width={3840}
								/>
							</div>
						)}
					</section>
					<footer>WWDC25 original · matched wallpaper and icon lineup</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					<a href="?view=dock-glass">
						Try moving windows and changing wallpapers →
					</a>
				</p>
				<p>Scroll each panel horizontally, or use the edge buttons above.</p>
				<p>
					Same Tahoe wallpaper and prerelease icon artwork. Icons are clipped
					samples from Apple’s image; their internal translucency is frozen. Our
					glass is rendered live. Live backdrop samples the page behind the
					Dock; Wallpaper texture retains the WebGL reference renderer. Other
					browsers fall back to live blur. Magnification is paused.
				</p>
			</div>
			<p aria-live="polite" className="dock-study-selection">
				{selected}
			</p>
		</main>
	);
}

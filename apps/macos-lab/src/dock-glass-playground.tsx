import { Dock, type DockItem } from "@anyway-design/macos/dock";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { MacWindow } from "@anyway-design/macos/window";
import { ArrowLeft } from "lucide-react";
import { type ChangeEvent, useCallback, useState } from "react";
import { DOCK_ITEMS } from "./dock-items";
import "./dock-glass-playground.css";

const STUDIES = [
	{ color: "#f3996b", description: "Warm light, open space.", name: "Apricot" },
	{
		color: "#87b8db",
		description: "A quieter shade of summer.",
		name: "Coastal blue",
	},
	{
		color: "#b5a3d9",
		description: "Soft edges and late afternoons.",
		name: "Wisteria",
	},
	{ color: "#86bfa4", description: "A little room to breathe.", name: "Sage" },
	{
		color: "#e5a2b4",
		description: "Something worth looking closer at.",
		name: "Rose",
	},
];

const LONG_DOCK_ITEMS = Array.from({ length: 4 }, (_, group) =>
	DOCK_ITEMS.map((item) => ({
		...item,
		id: group ? `${item.id}-${group}` : item.id,
		label: group ? `${item.label} ${group + 1}` : item.label,
	}))
).flat();
const ITEM_SETS: Record<string, DockItem[]> = {
	"6": DOCK_ITEMS,
	"12": LONG_DOCK_ITEMS.slice(0, 12),
	"24": LONG_DOCK_ITEMS,
};

export function DockGlassPlayground() {
	const [wallpaper, setWallpaper] = useState("tahoe");
	const [windowPosition, setWindowPosition] = useState(64);
	const [windowVisible, setWindowVisible] = useState(true);
	const [blur, setBlur] = useState(false);
	const [opaque, setOpaque] = useState(false);
	const [magnification, setMagnification] = useState(1.65);
	const [iconCount, setIconCount] = useState("6");
	const [containerWidth, setContainerWidth] = useState(1184);
	const [autoHide, setAutoHide] = useState(false);
	const [position, setPosition] = useState<"bottom" | "left" | "right">(
		"bottom"
	);
	const [selected, setSelected] = useState("");
	const changeWallpaper = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setWallpaper(event.target.value);
		},
		[]
	);
	const moveWindow = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setWindowPosition(Number(event.target.value));
	}, []);
	const changeWindow = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setWindowVisible(event.target.checked);
	}, []);
	const changeBlur = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setBlur(event.target.checked);
	}, []);
	const changeOpacity = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setOpaque(event.target.checked);
	}, []);
	const changeMagnification = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setMagnification(Number(event.target.value));
		},
		[]
	);
	const closeWindow = useCallback(() => setWindowVisible(false), []);
	const changeIconCount = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setIconCount(event.target.value);
		},
		[]
	);
	const changeContainerWidth = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setContainerWidth(Number(event.target.value));
		},
		[]
	);
	const changeAutoHide = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setAutoHide(event.target.checked);
	}, []);
	const changePosition = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const { value } = event.target;
			if (value === "bottom" || value === "left" || value === "right") {
				setPosition(value);
			}
		},
		[]
	);
	const activate = useCallback((id: string) => {
		const app = LONG_DOCK_ITEMS.find((item) => item.id === id);
		setSelected(`${app?.label ?? "App"} selected`);
	}, []);

	return (
		<main className="glass-playground">
			<header>
				<a href="/?view=dock-reference">
					<ArrowLeft size={15} /> Apple comparison
				</a>
				<a href="/?component=dock">Back to the lab</a>
			</header>
			<p className="glass-playground-eyebrow">TAHOE · LIVE BACKDROP</p>
			<h1>Glass that follows the scene.</h1>
			<p className="glass-playground-intro">
				Move across the Dock, scroll the window, or change the wallpaper.
			</p>
			<div className="glass-playground-controls">
				<label>
					Wallpaper
					<select onChange={changeWallpaper} value={wallpaper}>
						<option value="tahoe">Tahoe</option>
						<option value="clouds">Clouds</option>
						<option value="dusk">Dusk</option>
						<option value="grid">Calibration grid</option>
					</select>
				</label>
				<label className="glass-window-position">
					Window position
					<input
						aria-label="Window position"
						max="100"
						min="0"
						onChange={moveWindow}
						type="range"
						value={windowPosition}
					/>
				</label>
				<label>
					<input
						checked={windowVisible}
						onChange={changeWindow}
						type="checkbox"
					/>{" "}
					Show window
				</label>
				<label>
					<input checked={blur} onChange={changeBlur} type="checkbox" /> Blur
					only
				</label>
				<label>
					<input checked={opaque} onChange={changeOpacity} type="checkbox" />{" "}
					Reduce transparency
				</label>
			</div>
			<div className="glass-playground-controls">
				<label>
					Magnification
					<input
						aria-label="Magnification"
						max="2.5"
						min="1"
						onChange={changeMagnification}
						step="0.05"
						type="range"
						value={magnification}
					/>
					<output>{magnification.toFixed(2)}×</output>
				</label>
				<a
					href="https://www.youtube.com/watch?v=G3MZaTjIVYc&t=37s"
					rel="noopener noreferrer"
					target="_blank"
				>
					Native motion reference ↗
				</a>
			</div>
			<div className="glass-playground-controls">
				<label>
					Icons
					<select onChange={changeIconCount} value={iconCount}>
						<option value="6">6 apps</option>
						<option value="12">12 apps</option>
						<option value="24">24 apps</option>
					</select>
				</label>
				<label>
					Container width
					<input
						aria-label="Container width"
						max="1184"
						min="280"
						onChange={changeContainerWidth}
						step="1"
						type="range"
						value={containerWidth}
					/>
					<output>{containerWidth}px</output>
				</label>
				<label>
					Position
					<select onChange={changePosition} value={position}>
						<option value="bottom">Bottom</option>
						<option value="left">Left</option>
						<option value="right">Right</option>
					</select>
				</label>
				<label>
					<input checked={autoHide} onChange={changeAutoHide} type="checkbox" />
					Auto-hide
				</label>
			</div>
			<MacOSEnvironment
				className={`glass-playground-stage glass-wallpaper-${wallpaper}`}
				preset="tahoe"
				reduceTransparency={opaque}
				style={{ maxWidth: "100%", width: containerWidth }}
			>
				<div className="glass-desktop-label">
					A changing scene. The same Dock.
				</div>
				{windowVisible ? (
					<div
						className="glass-content-window"
						style={{
							left: `${windowPosition}%`,
							transform: `translateX(-${windowPosition}%)`,
						}}
					>
						<MacWindow
							onClose={closeWindow}
							onMinimize={closeWindow}
							title="Color studies"
						>
							<section
								aria-label="Scrollable window content"
								className="glass-window-scroll"
								// biome-ignore lint/a11y/noNoninteractiveTabindex: This scroll region needs keyboard access.
								tabIndex={0}
							>
								<h2>A palette for the everyday.</h2>
								<p>Scroll to see new colors and text pass behind the Dock.</p>
								{STUDIES.map((study) => (
									<article key={study.name} style={{ background: study.color }}>
										<span>COLOR STUDY</span>
										<h3>{study.name}</h3>
										<p>{study.description}</p>
									</article>
								))}
							</section>
						</MacWindow>
					</div>
				) : null}
				<Dock
					autoHide={autoHide}
					glass={blur ? "blur" : "refractive"}
					items={ITEM_SETS[iconCount] ?? DOCK_ITEMS}
					magnification={magnification}
					onActivate={activate}
					position={position}
					size={52}
				/>
			</MacOSEnvironment>
			<div className="glass-playground-caption">
				<span className="glass-status-live">Live backdrop refraction</span>
				<span className="glass-status-blur">Live backdrop blur</span>
				<span className="glass-status-opaque">Reduced transparency</span>
				<span>
					Wallpaper, window, and scrolling content are rendered in the page.
				</span>
			</div>
			<p className="glass-playground-note">
				{autoHide
					? `Move to the ${position} edge to reveal the Dock, or Tab to Show Dock.`
					: "Try a longer icon list or a narrower desktop. The Dock keeps room for magnification."}
			</p>
			<p className="glass-playground-note">
				Refraction uses SVG backdrop filtering in Chromium. Other browsers use
				live blur. No wallpaper texture or screen recording is needed.
			</p>
			<p aria-live="polite" className="glass-playground-selection">
				{selected}
			</p>
		</main>
	);
}

/** biome-ignore-all lint/performance/noJsxPropsBind: Local comparison controls. */
import type { MacDesktopFrames } from "@1bye/macos/desktop";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { ArrowLeft } from "lucide-react";
import { type CSSProperties, useCallback, useState } from "react";
import { DESKTOP_DOCUMENTS, DesktopReferenceScene } from "./desktop-demo";
import "./dock-reference.css";
import "./desktop-reference.css";

const PRESETS = {
	chrome: {
		activeId: "notes",
		frames: {
			notes: { height: 310, width: 420, x: 52, y: 190 },
			planning: { height: 280, width: 390, x: 294, y: 58 },
		},
		label: "Both title bars",
	},
	moved: {
		activeId: "notes",
		frames: { notes: { height: 310, width: 420, x: 172, y: 123 } },
		label: "Notes moved",
	},
	notes: { activeId: "notes", frames: {}, label: "Project notes in front" },
} satisfies Record<
	string,
	{ label: string; activeId: string; frames: MacDesktopFrames }
>;

export function DesktopReferenceComparison() {
	const [preset, setPreset] = useState<keyof typeof PRESETS>("chrome");
	const [activeId, setActive] = useState<string | null>("notes");
	const [frames, setFrames] = useState<MacDesktopFrames>(PRESETS.chrome.frames);
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [notice, setNotice] = useState("");
	const [generation, setGeneration] = useState(0);
	const scale = zoom === "fit" ? fit : Number(zoom);
	const fixture = PRESETS[preset];
	const measureHost = useCallback((element: HTMLDivElement | null) => {
		if (!element) {
			return;
		}
		const resize = () => setFit(Math.min(1, element.clientWidth / 760));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, []);
	const select = (value: keyof typeof PRESETS) => {
		setPreset(value);
		setActive(PRESETS[value].activeId);
		setFrames(PRESETS[value].frames);
		setNotice("");
		setGeneration((current) => current + 1);
	};
	return (
		<main
			className="dock-study desktop-study"
			style={{ "--desktop-study-scale": scale } as CSSProperties}
		>
			<header className="dock-study-header">
				<a href="?component=desktop">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / WINDOW MANAGEMENT</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">ROOM FOR MORE THAN ONE THING.</p>
				<h1>A desktop, beside Tahoe.</h1>
				<p>
					Live MacDesktop dragging, resizing, and focus beside native NSWindow
					captures from this Mac.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="desktop-study-controls">
					<label>
						Native state{" "}
						<select
							aria-label="Native state"
							onChange={(event) =>
								select(event.target.value as keyof typeof PRESETS)
							}
							value={preset}
						>
							{Object.entries(PRESETS).map(([id, item]) => (
								<option key={id} value={id}>
									{item.label}
								</option>
							))}
						</select>
					</label>
					<button onClick={() => select(preset)} type="button">
						Reset live layout
					</button>
				</div>
				<label>
					Shared zoom{" "}
					<select
						aria-label="Shared zoom"
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
						<h2>Our desktop</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<div className="desktop-study-viewport" ref={measureHost}>
						<div className="desktop-study-sizer">
							<MacOSEnvironment
								className="desktop-study-scene"
								key={generation}
							>
								<DesktopReferenceScene
									activeId={activeId}
									frames={frames}
									onActiveChange={(id) => {
										setActive(id);
										setNotice(`Active window → ${id ?? "desktop"}`);
									}}
									onEvent={setNotice}
									onFrameChange={(id, frame, reason) => {
										setFrames((current) => ({ ...current, [id]: frame }));
										setNotice(
											`${reason} ${id} → ${Math.round(frame.x)}, ${Math.round(frame.y)} · ${Math.round(frame.width)} × ${Math.round(frame.height)}`
										);
									}}
								/>
							</MacOSEnvironment>
						</div>
					</div>
					<footer>
						MacDesktop · MacWindow · editable, independent document content
					</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a
							href="/assets/native-desktop/notes-active.png"
							rel="noopener"
							target="_blank"
						>
							Original window ↗
						</a>
					</header>
					<div className="desktop-study-viewport">
						<div className="desktop-study-sizer">
							<section
								aria-label="Native Tahoe window composition"
								className="desktop-study-scene desktop-study-native"
							>
								{DESKTOP_DOCUMENTS.map((document) => {
									const frame =
										(fixture.frames as MacDesktopFrames)[document.id] ??
										document.frame;
									const active = fixture.activeId === document.id;
									const state = active ? "active" : "inactive";
									return (
										<img
											alt={`Native ${document.title}, ${active ? "active" : "inactive"}`}
											draggable={false}
											height={frame.height * 2}
											key={document.id}
											src={`/assets/native-desktop/${document.id}-${state}.png`}
											style={{
												height: frame.height,
												left: frame.x,
												top: frame.y,
												width: frame.width,
												zIndex: active ? 2 : 1,
											}}
											width={frame.width * 2}
										/>
									);
								})}
							</section>
						</div>
					</div>
					<footer>
						NSWindow · NSTextView · Tahoe 26.6.2 · native 2× window crops
					</footer>
				</section>
			</div>
			<p aria-live="polite" className="dock-study-selection">
				{notice ||
					"Drag a title bar, resize an edge or corner, or click a background window to bring it forward."}
			</p>
			<div className="dock-study-notes">
				<p>
					The same 760 × 520-point workspace, document text, and window frames.
					Choose a native state to align both sides; free dragging and typing
					affect the React side.
				</p>
				<p>
					The native side composes unmodified AppKit window captures at their
					matching positions. These rectangular crops omit WindowServer corner
					masks and external shadows. Movement and resize timing have not been
					calibrated against a native recording. React windows stay inside their
					embedded container.
				</p>
				<p>
					Keyboard: focus a window frame, then use arrow keys to move or
					Shift+arrow keys to resize. Input controls retain their usual
					arrow-key behavior. Escape cancels an in-progress pointer operation.
				</p>
				<a
					href="https://support.apple.com/en-ie/guide/mac-help/mchlp2469/26/mac/26"
					rel="noopener"
					target="_blank"
				>
					Apple’s Tahoe window arrangement guide ↗
				</a>
			</div>
		</main>
	);
}

/** biome-ignore-all lint/performance/noJsxPropsBind: Local comparison controls. */
import { MacButton } from "@1bye/macos/controls";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacPopover } from "@1bye/macos/popover";
import { ArrowLeft } from "lucide-react";
import {
	type CSSProperties,
	type RefObject,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	POPOVER_FRAMES,
	POPOVER_SIDES,
	PopoverCanvas,
	PopoverOptions,
	type PopoverSide,
} from "./popover-samples";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";
import "./popover-reference.css";

export function PopoverReferenceComparison() {
	const [side, setSide] = useState<PopoverSide>("bottom");
	const [dark, setDark] = useState(false);
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [generation, setGeneration] = useState(0);
	const [reduced, setReduced] = useState(false);
	const [opaque, setOpaque] = useState(false);
	const [result, setResult] = useState("Open a popover to try its controls.");
	const viewport: RefObject<HTMLElement | null> = useRef(null);
	const frame = POPOVER_FRAMES[side];
	const scale = zoom === "fit" ? fit : Number(zoom);
	const image = `/assets/native-overlays/tahoe-popover-${side}-${dark ? "dark" : "light"}.jpg`;
	useLayoutEffect(() => {
		const element = viewport.current;
		if (!element) {
			return;
		}
		const resize = () => setFit(Math.min(1.5, element.clientWidth / 298));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, []);
	const choose = (value: PopoverSide) => {
		setSide(value);
		setGeneration((current) => current + 1);
	};
	return (
		<main
			className="dock-study input-study popover-study"
			style={
				{
					"--popover-native-top": `${16 - frame.top}px`,
					"--popover-study-left": `${16 - frame.x}px`,
					"--popover-study-scale": scale,
					"--popover-study-top": `${48 - frame.top}px`,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?component=controls">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / POPOVERS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">A LITTLE MORE CONTEXT.</p>
				<h1>Popovers, beside macOS.</h1>
				<p>
					Live React popovers beside native Tahoe NSPopover captures, with
					matching content and all four arrow directions.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="window-study-controls">
					<label>
						Side{" "}
						<select
							aria-label="Popover side"
							onChange={(event) => choose(event.target.value as PopoverSide)}
							value={side}
						>
							{POPOVER_SIDES.map((entry) => (
								<option key={entry} value={entry}>
									{entry[0].toUpperCase() + entry.slice(1)}
								</option>
							))}
						</select>
					</label>
					<label>
						<input
							checked={dark}
							onChange={(event) => setDark(event.target.checked)}
							type="checkbox"
						/>{" "}
						Dark
					</label>
					<button
						onClick={() => setGeneration((value) => value + 1)}
						type="button"
					>
						Reset native match
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
						<h2>Our popover</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our popover comparison"
						className="popover-study-viewport"
						ref={viewport}
					>
						<div className="popover-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="popover-study-live"
								key={`${generation}-${dark}`}
							>
								<PopoverCanvas onSideChange={choose} side={side} />
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacPopover · 240 × 164pt content · interactive</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native popover comparison"
						className="popover-study-viewport"
					>
						<div className="popover-study-scene">
							<img
								alt={`Native Tahoe ${side} ${dark ? "dark" : "light"} popover`}
								className="popover-study-native"
								draggable={false}
								height={1104}
								src={image}
								width={side === "bottom" && !dark ? 1362 : 1360}
							/>
						</div>
					</section>
					<footer>NSPopover · Tahoe 26.6.2 · 2× window capture</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Both sides use the same content, anchor, and underlying controls.
					Original captures remain unaltered; this view crops them to the native
					popover window. Reset restores the live checkbox and opens the popover
					again.
				</p>
				<p>
					The surface, curved arrow, 20-point corners, 16-point padding, and
					13-point anchor gap follow the native fixture. Native compositor tint
					and exact animation timing can vary. The left side dismisses on Done,
					Escape, or an outside click.
				</p>
				<a
					href="https://developer.apple.com/documentation/appkit/nspopover"
					rel="noopener"
					target="_blank"
				>
					Apple NSPopover reference ↗
				</a>
			</div>
			<section className="input-workbench popover-workbench">
				<h2>Anchored to the task.</h2>
				<p>
					Open each side, tab through its controls, and dismiss with Done,
					Escape, or an outside click. The second row tests collision handling
					near the container edges.
				</p>
				<div className="window-study-controls">
					<label>
						<input
							checked={reduced}
							onChange={(event) => setReduced(event.target.checked)}
							type="checkbox"
						/>{" "}
						Reduced motion
					</label>
					<label>
						<input
							checked={opaque}
							onChange={(event) => setOpaque(event.target.checked)}
							type="checkbox"
						/>{" "}
						Reduce transparency
					</label>
				</div>
				<MacOSEnvironment
					appearance={dark ? "dark" : "light"}
					className="popover-workbench-surface"
					reduceMotion={reduced}
					reduceTransparency={opaque}
				>
					<div className="popover-workbench-row">
						{POPOVER_SIDES.map((entry) => (
							<MacPopover
								description="Choose how this folder is displayed."
								key={entry}
								positionerProps={{ side: entry }}
								title="View Options"
								trigger={
									<MacButton>
										{entry[0].toUpperCase() + entry.slice(1)} popover
									</MacButton>
								}
							>
								<PopoverOptions
									onDone={() =>
										setResult(`Applied options from the ${entry} popover.`)
									}
								/>
							</MacPopover>
						))}
					</div>
					<div className="popover-workbench-edges">
						{["left", "right"].map((edge) => (
							<MacPopover
								description="The panel shifts or flips to remain visible."
								key={edge}
								positionerProps={{ side: edge as PopoverSide }}
								title="At the edge"
								trigger={
									<MacButton>
										{edge === "left" ? "Left edge" : "Right edge"}
									</MacButton>
								}
							>
								<PopoverOptions
									onDone={() =>
										setResult("Applied options from the edge popover.")
									}
								/>
							</MacPopover>
						))}
					</div>
					<p aria-live="polite" className="popover-workbench-result">
						{result}
					</p>
				</MacOSEnvironment>
			</section>
		</main>
	);
}

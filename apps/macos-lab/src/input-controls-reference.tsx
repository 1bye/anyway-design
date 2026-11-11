/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for this native comparison. */
import { MacOSEnvironment } from "@1bye/macos/environment";
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
import { InputControlsCanvas } from "./input-controls-samples";
import { InputControlsWorkbench } from "./input-controls-workbench";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";

const CROPS = {
	all: { height: 408, label: "All controls", width: 632, x: 0, y: 0 },
	choices: {
		height: 130,
		label: "Checkboxes & radios",
		width: 464,
		x: 144,
		y: 60,
	},
	sliders: { height: 110, label: "Sliders", width: 464, x: 144, y: 194 },
	steppers: { height: 58, label: "Steppers", width: 464, x: 144, y: 304 },
} as const;

export function InputControlsReferenceComparison() {
	const [dark, setDark] = useState(false);
	const [active, setActive] = useState(true);
	const [detail, setDetail] = useState<keyof typeof CROPS>("all");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [generation, setGeneration] = useState(0);
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const crop = CROPS[detail];
	const width = crop.width + 32;
	const height = crop.height + 32;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const image = `/assets/native-input-controls/tahoe-inputs-${active ? "active" : "inactive"}-${dark ? "dark" : "light"}.png`;
	useLayoutEffect(() => {
		const element = live.current;
		if (!element) {
			return;
		}
		const resize = () =>
			setFit(Math.min(1, element.clientWidth / width, 370 / height));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, [width, height]);
	const scroll = useCallback((event: UIEvent<HTMLElement>) => {
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
	const resetScroll = useCallback(() => {
		live.current?.scrollTo(0, 0);
		native.current?.scrollTo(0, 0);
	}, []);
	return (
		<main
			className="dock-study input-study"
			style={
				{
					"--input-native-titlebar": active ? "32px" : "0px",
					"--input-study-height": `${height}px`,
					"--input-study-left": `${16 - crop.x}px`,
					"--input-study-scale": scale,
					"--input-study-top": `${16 - crop.y}px`,
					"--input-study-width": `${width}px`,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?component=controls">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / INPUT CONTROLS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">SMALL CONTROLS. FAMILIAR DETAILS.</p>
				<h1>Choices and values, beside macOS.</h1>
				<p>Live React controls beside actual AppKit controls from this Mac.</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="window-study-controls">
					<label>
						Detail{" "}
						<select
							aria-label="Detail"
							onChange={(event) => {
								setDetail(event.target.value as keyof typeof CROPS);
								resetScroll();
							}}
							value={detail}
						>
							{Object.entries(CROPS).map(([value, entry]) => (
								<option key={value} value={value}>
									{entry.label}
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
					<label>
						<input
							checked={active}
							onChange={(event) => setActive(event.target.checked)}
							type="checkbox"
						/>{" "}
						Active window
					</label>
					<button
						onClick={() => {
							setGeneration((count) => count + 1);
							resetScroll();
						}}
						type="button"
					>
						Reset native match
					</button>
				</div>
				<label>
					Shared zoom{" "}
					<select
						aria-label="Shared zoom"
						onChange={(event) => {
							setZoom(event.target.value);
							resetScroll();
						}}
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
						<h2>Our controls</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our input controls comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={live}
					>
						<div className="input-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="input-study-live"
								preset="tahoe"
							>
								<InputControlsCanvas active={active} key={generation} />
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacCheckbox · MacRadio · MacSlider · MacStepper</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native input controls comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={native}
					>
						<div className="input-study-scene">
							<div className="input-study-native">
								<img
									alt={`Native Tahoe ${active ? "active" : "inactive"} ${dark ? "dark" : "light"} checkboxes, radios, sliders, and steppers`}
									draggable={false}
									height={active ? 880 : 816}
									src={image}
									width={1264}
								/>
							</div>
						</div>
					</section>
					<footer>
						{active ? "Live window capture" : "Offscreen AppKit render"} · Tahoe
						26.6.2 · 2×
					</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Both sides share the same 632 × 408-point fixture. Active references
					are genuine native window screenshots; inactive references are AppKit
					renders. The native images are fixed. Reset restores the live
					controls.
				</p>
				<p>
					Mixed checkboxes, disabled states, tick marks, and bounded steppers
					use the same geometry. Hover, focus rings, and repeat timing are
					interactive first passes without separate native calibration. Custom
					workbench accents affect only our components.
				</p>
				<p>
					<a href="?view=controls-reference">
						Compare buttons and text fields ↗
					</a>
					<a href="?view=selection-controls-reference">
						Compare pop-up buttons and combo boxes ↗
					</a>
				</p>
			</div>
			<InputControlsWorkbench dark={dark} />
		</main>
	);
}

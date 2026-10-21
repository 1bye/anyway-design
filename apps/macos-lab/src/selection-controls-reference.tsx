/** biome-ignore-all lint/performance/noJsxPropsBind: Local native comparison controls. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
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
import {
	SelectionControlsCanvas,
	type SelectionReferenceState,
} from "./selection-controls-samples";
import { SelectionControlsWorkbench } from "./selection-controls-workbench";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";
import "./selection-controls-reference.css";

const CROPS = {
	all: { height: 350, label: "All controls", width: 632, x: 0, y: 0 },
	combos: { height: 128, label: "Combo boxes", width: 420, x: 152, y: 174 },
	popups: { height: 136, label: "Pop-up buttons", width: 420, x: 152, y: 38 },
} as const;
const STATES: { label: string; value: SelectionReferenceState }[] = [
	{ label: "Closed controls", value: "closed" },
	{ label: "Pop-up menu", value: "popup" },
	{ label: "Combo-box list", value: "combo" },
];

export function SelectionControlsReferenceComparison() {
	const [dark, setDark] = useState(false);
	const [state, setState] = useState<SelectionReferenceState>("closed");
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
	const image = `/assets/native-selection-controls/tahoe-selection-${state}-${dark ? "dark" : "light"}.png`;
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
			className="dock-study input-study selection-study"
			style={
				{
					"--selection-study-height": `${height}px`,
					"--selection-study-left": `${16 - crop.x}px`,
					"--selection-study-scale": scale,
					"--selection-study-top": `${16 - crop.y}px`,
					"--selection-study-width": `${width}px`,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="/?component=controls">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / SELECTION CONTROLS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">PICK ONE. OR TYPE YOUR OWN.</p>
				<h1>Selection, beside macOS.</h1>
				<p>
					Live pop-up buttons and combo boxes beside native AppKit captures.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="window-study-controls">
					<label>
						State{" "}
						<select
							aria-label="Reference state"
							onChange={(event) => {
								const next = event.target.value as SelectionReferenceState;
								setState(next);
								setGeneration((value) => value + 1);
								resetScroll();
							}}
							value={state}
						>
							{STATES.map((entry) => (
								<option key={entry.value} value={entry.value}>
									{entry.label}
								</option>
							))}
						</select>
					</label>
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
					<button
						onClick={() => {
							setState("closed");
							setGeneration((value) => value + 1);
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
						aria-label="Our selection controls comparison"
						className="selection-study-viewport"
						onScroll={scroll}
						ref={live}
					>
						<div className="selection-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="selection-study-live"
							>
								<SelectionControlsCanvas
									key={generation}
									onStateChange={setState}
									state={state}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacPopUpButton · MacComboBox · interactive</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native selection controls comparison"
						className="selection-study-viewport"
						onScroll={scroll}
						ref={native}
					>
						<div className="selection-study-scene">
							<div className="selection-study-native">
								<img
									alt={`Native Tahoe ${state} ${dark ? "dark" : "light"} pop-up buttons and combo boxes`}
									draggable={false}
									height={764}
									src={image}
									width={1264}
								/>
							</div>
						</div>
					</section>
					<footer>Native window capture · Tahoe 26.6.2 · 2×</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Both sides share the same 632 × 350-point fixture. Choose an open
					state to compare list placement, selection, and material. Native
					captures are fixed; Reset restores the live values. Captures retain
					the system pointer where visible.
				</p>
				<p>
					Regular and small controls, enabled and disabled. Pop-up options are
					fixed choices; combo boxes also accept custom text. Focus, hover, and
					transition timing still need separate native calibration.
				</p>
				<a href="/?view=input-controls-reference">
					Compare checkboxes, radios, sliders & steppers ↗
				</a>
			</div>
			<SelectionControlsWorkbench dark={dark} />
		</main>
	);
}

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
	ToggleControlsCanvas,
	type ToggleFocus,
} from "./toggle-controls-samples";
import { ToggleControlsWorkbench } from "./toggle-controls-workbench";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";
import "./toggle-controls-reference.css";

const CROPS = {
	all: { height: 500, label: "All controls", width: 632, x: 0, y: 0 },
	segments: {
		height: 190,
		label: "Segmented controls",
		width: 448,
		x: 144,
		y: 254,
	},
	switches: { height: 176, label: "Switches", width: 448, x: 144, y: 56 },
} as const;

export function ToggleControlsReferenceComparison() {
	const [dark, setDark] = useState(false);
	const [focus, setFocus] = useState<ToggleFocus>("normal");
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
	const image = `/assets/native-toggle-controls/tahoe-toggles-${focus}-${dark ? "dark" : "light"}.jpg`;
	useLayoutEffect(() => {
		const element = live.current;
		if (!element) {
			return;
		}
		const resize = () =>
			setFit(Math.min(1.25, element.clientWidth / width, 430 / height));
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
	const resetScroll = () => {
		live.current?.scrollTo(0, 0);
		native.current?.scrollTo(0, 0);
	};
	return (
		<main
			className="dock-study input-study toggle-study"
			style={
				{
					"--input-native-titlebar": "32px",
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
				<span>TAHOE / SWITCHES & SEGMENTS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">SMALL CHANGES. FAMILIAR FEEL.</p>
				<h1>Switches and segments, beside macOS.</h1>
				<p>
					Live React switches and segmented controls beside genuine Tahoe AppKit
					captures.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="window-study-controls">
					<label>
						Detail{" "}
						<select
							aria-label="Toggle detail"
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
						Native state{" "}
						<select
							aria-label="Native focus state"
							onChange={(event) => {
								setFocus(event.target.value as ToggleFocus);
								setGeneration((value) => value + 1);
							}}
							value={focus}
						>
							<option value="normal">Normal</option>
							<option value="switch">Switch focus</option>
							<option value="segment">Segment focus</option>
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
						aria-label="Our toggle controls comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={live}
					>
						<div className="input-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="input-study-live"
							>
								<ToggleControlsCanvas focus={focus} key={generation} />
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacSwitch · MacSegmentedControl · regular & small</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native toggle controls comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={native}
					>
						<div className="input-study-scene">
							<div className="input-study-native">
								<img
									alt={`Native Tahoe ${dark ? "dark" : "light"} controls, ${focus} focus state`}
									draggable={false}
									height={1064}
									src={image}
									width={1264}
								/>
							</div>
						</div>
					</section>
					<footer>AppKit · Tahoe 26.6.2 · unaltered 2× capture</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Matching 54 × 24-point switch frames and 176-point segmented controls.
					Small switches draw a centered 44 × 20-point track; small segments are
					20 points high. Shared zoom retains native point geometry.
				</p>
				<p>
					Focus presets hold the captured ring on the live example for
					comparison; interaction and real keyboard focus remain live. Reset
					restores defaults. The original native window includes its 32-point
					title bar, clipped here with CSS.
				</p>
				<p>
					Switch dragging and exact transition timing need a separate native
					motion recording. This pass matches resting states, click/Space
					toggling, and single-value segment selection.
				</p>
				<a
					href="https://developer.apple.com/documentation/appkit/nssegmentedcontrol"
					rel="noopener"
					target="_blank"
				>
					Apple NSSegmentedControl reference ↗
				</a>
			</div>
			<ToggleControlsWorkbench dark={dark} />
		</main>
	);
}

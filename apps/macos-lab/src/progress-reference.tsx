/** biome-ignore-all lint/performance/noJsxPropsBind: Local comparison controls. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { ArrowLeft } from "lucide-react";
import {
	type CSSProperties,
	type RefObject,
	type UIEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { ProgressCanvas } from "./progress-samples";
import { ProgressWorkbench } from "./progress-workbench";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";
import "./progress-reference.css";

const CROPS = {
	all: { height: 408, label: "All indicators", width: 632, x: 0, y: 0 },
	bars: { height: 212, label: "Progress bars", width: 428, x: 152, y: 62 },
	spinners: { height: 98, label: "Spinners", width: 310, x: 152, y: 270 },
} as const;

export function ProgressReferenceComparison() {
	const [dark, setDark] = useState(false);
	const [motion, setMotion] = useState(false);
	const [detail, setDetail] = useState<keyof typeof CROPS>("all");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [generation, setGeneration] = useState(0);
	const [motionPreference, setMotionPreference] = useState(
		() => window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
	const playing = motion && !motionPreference;
	const live: RefObject<HTMLElement | null> = useRef(null);
	const native: RefObject<HTMLElement | null> = useRef(null);
	const crop = CROPS[detail];
	const width = crop.width + 32;
	const height = crop.height + 32;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const base = `/assets/native-progress/tahoe-progress-${dark ? "dark" : "light"}`;
	useEffect(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const change = () => setMotionPreference(media.matches);
		media.addEventListener("change", change);
		return () => media.removeEventListener("change", change);
	}, []);
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
			className="dock-study input-study progress-study"
			style={
				{
					"--progress-study-height": `${height}px`,
					"--progress-study-left": `${16 - crop.x}px`,
					"--progress-study-scale": scale,
					"--progress-study-top": `${16 - crop.y}px`,
					"--progress-study-width": `${width}px`,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?component=controls">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / PROGRESS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">SOMETHING IS HAPPENING.</p>
				<h1>Progress, beside macOS.</h1>
				<p>
					Live React progress bars and spinners beside native Tahoe
					NSProgressIndicator captures.
				</p>
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
							checked={motion}
							disabled={motionPreference}
							onChange={(event) => {
								setMotion(event.target.checked);
								setGeneration((value) => value + 1);
							}}
							type="checkbox"
						/>{" "}
						Play motion
					</label>
					<button
						onClick={() => {
							setGeneration((value) => value + 1);
							resetScroll();
						}}
						type="button"
					>
						Restart comparison
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
						<h2>Our indicators</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our progress comparison"
						className="progress-study-viewport"
						onScroll={scroll}
						ref={live}
					>
						<div className="progress-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="progress-study-live"
								key={`${generation}-${dark}`}
							>
								<div data-motion={playing}>
									<ProgressCanvas />
								</div>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacProgressBar · MacSpinner · regular &amp; small</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a
							href={`${base}.${playing ? "webm" : "png"}`}
							rel="noopener"
							target="_blank"
						>
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native progress comparison"
						className="progress-study-viewport"
						onScroll={scroll}
						ref={native}
					>
						<div className="progress-study-scene">
							<div className="progress-study-native">
								{playing ? (
									<video
										aria-label={`Native Tahoe ${dark ? "dark" : "light"} progress motion`}
										autoPlay
										disablePictureInPicture
										height={880}
										key={`${base}-${generation}`}
										loop
										muted
										playsInline
										poster={`${base}.png`}
										width={1264}
									>
										<source src={`${base}.webm`} type="video/webm" />
										<track
											default
											kind="captions"
											label="No audio: native progress indicators"
											src="/assets/native-progress/silent.vtt"
											srcLang="en"
										/>
									</video>
								) : (
									<img
										alt={`Native Tahoe ${dark ? "dark" : "light"} progress bars and spinners`}
										draggable={false}
										height={880}
										src={`${base}.png`}
										width={1264}
									/>
								)}
							</div>
						</div>
					</section>
					<footer>
						NSProgressIndicator · Tahoe 26.6.2 ·{" "}
						{playing ? "native motion sample" : "2× window capture"}
					</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					The same 632 × 408-point fixture, with 0%, 50%, completion,
					indeterminate, and stopped states. Choose a detail and zoom to inspect
					the thin track, rounded zero cap, or eight-spoke spinner.
				</p>
				<p>
					Play motion runs our CSS animation beside a native recording assembled
					from timed window captures. Native samples are about 8–12 frames per
					second; phases are independent and the clip loops. Exact easing and
					frame-level timing need a higher-frame-rate recording. Reduced-motion
					preferences stop animation.
				</p>
				<a
					href="https://developer.apple.com/documentation/appkit/nsprogressindicator"
					rel="noopener"
					target="_blank"
				>
					Apple NSProgressIndicator reference ↗
				</a>
			</div>
			<ProgressWorkbench dark={dark} />
		</main>
	);
}

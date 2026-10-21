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
import { type DateFocus, DatePickerCanvas } from "./date-picker-samples";
import { DatePickerWorkbench } from "./date-picker-workbench";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";
import "./date-picker-reference.css";

const CROPS = {
	all: { height: 568, label: "All controls", width: 680, x: 0, y: 0 },
	calendar: { height: 180, label: "Calendar", width: 180, x: 148, y: 264 },
	fields: {
		height: 208,
		label: "Date & time fields",
		width: 460,
		x: 144,
		y: 48,
	},
} as const;

export function DatePickerReferenceComparison() {
	const [dark, setDark] = useState(false);
	const [focus, setFocus] = useState<DateFocus>("normal");
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
	const image = `/assets/native-date-picker/tahoe-date-${focus}-${dark ? "dark" : "light"}.jpg`;
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
			className="dock-study input-study date-study"
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
				<a href="/?component=controls">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / DATE & TIME</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">SMALL CHANGES. FAMILIAR FEEL.</p>
				<h1>Date and time, beside macOS.</h1>
				<p>
					Live React date fields and calendars beside genuine Tahoe AppKit
					captures.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="window-study-controls">
					<label>
						Detail{" "}
						<select
							aria-label="Date picker detail"
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
								setFocus(event.target.value as DateFocus);
								setGeneration((value) => value + 1);
							}}
							value={focus}
						>
							<option value="normal">Normal</option>
							<option value="focus">Date segment selected</option>
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
						aria-label="Our date picker comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={live}
					>
						<div className="input-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="input-study-live"
							>
								<DatePickerCanvas focus={focus} key={generation} />
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacDatePicker · MacCalendar · regular & small</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native date picker comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={native}
					>
						<div className="input-study-scene">
							<div className="input-study-native">
								<img
									alt={`Native Tahoe ${dark ? "dark" : "light"} controls, ${focus} focus state`}
									draggable={false}
									height={1200}
									src={image}
									width={1360}
								/>
							</div>
						</div>
					</section>
					<footer>AppKit · Tahoe 26.6.2 · unaltered 2× capture</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Matching native 26-point regular and 22-point small picker frames,
					separate steppers, and the 138.5-point calendar. Both sides use
					October 20, 2026 at 2:35 PM, with October 21 marked as today in the
					captured calendar.
				</p>
				<p>
					Click a segment and type, or use Up/Down to change it and Left/Right
					to move between segments. Space or Option+Down opens the calendar. The
					selected-segment preset holds the native highlight for comparison.
					Reset restores the captured values.
				</p>
				<p>
					Values are local ISO strings without time-zone conversion. This first
					pass uses Gregorian dates, US month/day/year order, and configurable
					12/24-hour time. The calendar overlay uses browser dismissal and focus
					handling; its native attachment geometry and stepper hold timing are
					not calibrated.
				</p>
				<a
					href="https://developer.apple.com/documentation/appkit/nsdatepicker"
					rel="noopener"
					target="_blank"
				>
					Apple NSDatePicker reference ↗
				</a>
			</div>
			<DatePickerWorkbench dark={dark} />
		</main>
	);
}

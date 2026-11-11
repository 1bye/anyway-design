/** biome-ignore-all lint/performance/noJsxPropsBind: Local native comparison controls. */
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
import { type FieldFocus, TextFieldsCanvas } from "./text-fields-samples";
import { TextFieldsWorkbench } from "./text-fields-workbench";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";
import "./text-fields-reference.css";

const CROPS = {
	all: { height: 500, label: "All fields", width: 632, x: 0, y: 0 },
	search: { height: 168, label: "Search fields", width: 448, x: 144, y: 280 },
	text: { height: 210, label: "Text fields", width: 448, x: 144, y: 60 },
} as const;

export function TextFieldsReferenceComparison() {
	const [dark, setDark] = useState(false);
	const [focus, setFocus] = useState<FieldFocus>("normal");
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
	const image = `/assets/native-text-fields/tahoe-fields-${focus}-${dark ? "dark" : "light"}.jpg`;
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
			className="dock-study input-study text-fields-study"
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
				<span>TAHOE / TEXT & SEARCH FIELDS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">EVERY CHARACTER COUNTS.</p>
				<h1>Text and search, beside macOS.</h1>
				<p>
					Editable React fields beside genuine Tahoe NSTextField,
					NSSecureTextField, and NSSearchField captures.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="window-study-controls">
					<label>
						Detail{" "}
						<select
							aria-label="Field detail"
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
								setFocus(event.target.value as FieldFocus);
								setGeneration((value) => value + 1);
							}}
							value={focus}
						>
							<option value="normal">Normal</option>
							<option value="text">Text focus</option>
							<option value="search">Search focus</option>
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
						<h2>Our fields</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our text fields comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={live}
					>
						<div className="input-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="input-study-live"
							>
								<TextFieldsCanvas focus={focus} key={generation} />
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacTextField · MacSearchField · regular & small</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native text fields comparison"
						className="input-study-viewport"
						onScroll={scroll}
						ref={native}
					>
						<div className="input-study-scene">
							<div className="input-study-native">
								<img
									alt={`Native Tahoe ${dark ? "dark" : "light"} fields, ${focus} focus state`}
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
					Matching 176-point fields, 13/11-point text, 24-point regular
					controls, 22-point small text fields, and 20-point small search
					fields. Detail crops and shared zoom retain native point geometry.
				</p>
				<p>
					Focus presets hold the captured ring on the live example for
					comparison; editing and real keyboard focus remain interactive. Reset
					restores defaults. The original native window includes its 32-point
					title bar, clipped here with CSS.
				</p>
				<a
					href="https://developer.apple.com/documentation/appkit/nssearchfield"
					rel="noopener"
					target="_blank"
				>
					Apple NSSearchField reference ↗
				</a>
			</div>
			<TextFieldsWorkbench dark={dark} />
		</main>
	);
}

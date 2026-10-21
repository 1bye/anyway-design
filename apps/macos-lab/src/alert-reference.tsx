/** biome-ignore-all lint/performance/noJsxPropsBind: Local native comparison controls. */
import { MacAlert, MacAlertPanel } from "@anyway-design/macos/alert";
import { MacButton } from "@anyway-design/macos/controls";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { ArrowLeft } from "lucide-react";
import {
	type CSSProperties,
	type RefObject,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	ALERT_SAMPLES,
	type AlertSampleName,
	alertSample,
} from "./alert-samples";
import "./dock-reference.css";
import "./window-reference.css";
import "./input-controls-reference.css";
import "./alert-reference.css";

export function AlertReferenceComparison() {
	const [name, setName] = useState<AlertSampleName>("save");
	const [dark, setDark] = useState(false);
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [generation, setGeneration] = useState(0);
	const [result, setResult] = useState("No action yet");
	const [open, setOpen] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const viewport: RefObject<HTMLElement | null> = useRef(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const sample = alertSample(name);
	const { label, height, suppressionLabel, ...props } = sample;
	const image = `/assets/native-alerts/tahoe-alert-${name}-${dark ? "dark" : "light"}.png`;
	const scale = zoom === "fit" ? fit : Number(zoom);
	useLayoutEffect(() => {
		const element = viewport.current;
		if (!element) {
			return;
		}
		const resize = () => setFit(Math.min(1, element.clientWidth / 308));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, []);
	return (
		<main
			className="dock-study input-study alert-study"
			style={
				{
					"--alert-study-height": `${height + 48}px`,
					"--alert-study-scale": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="/?component=controls">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / ALERTS</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">A MOMENT TO DECIDE.</p>
				<h1>Alerts, beside macOS.</h1>
				<p>
					Live React alerts and confirmation dialogs beside native NSAlert
					captures from this Mac.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="window-study-controls">
					<label>
						Example{" "}
						<select
							aria-label="Alert example"
							onChange={(event) => {
								setName(event.target.value as AlertSampleName);
								setGeneration((value) => value + 1);
								setResult("No action yet");
							}}
							value={name}
						>
							{Object.entries(ALERT_SAMPLES).map(([value, entry]) => (
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
							setGeneration((value) => value + 1);
							setResult("No action yet");
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
						<h2>Our alert</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our alert comparison"
						className="alert-study-viewport"
						ref={viewport}
					>
						<div className="alert-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="alert-study-live"
							>
								<MacAlertPanel
									{...props}
									key={generation}
									onAction={(id) => setResult(`Comparison: ${id}`)}
									suppression={
										suppressionLabel ? { label: suppressionLabel } : undefined
									}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>
						MacAlertPanel · {label} · {height}pt high
					</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native Tahoe</h2>
						<a href={image} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<section
						aria-label="Native alert comparison"
						className="alert-study-viewport"
					>
						<div className="alert-study-scene">
							<img
								alt={`Native Tahoe ${label}, ${dark ? "dark" : "light"}`}
								className="alert-study-native"
								draggable={false}
								height={height * 2}
								src={image}
								width={520}
							/>
						</div>
					</section>
					<footer>NSAlert · Tahoe 26.6.2 · original 2× capture</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					Matching 260-point panels, native icon artwork, typography, and action
					order. The left panel remains open for inspection; use the document
					below to test dismissal and focus.
				</p>
				<p>
					Informational and warning alerts share native artwork. Critical alerts
					add the caution symbol; document sheets omit the app icon. Native
					captures include the initial keyboard focus ring.
				</p>
				<a
					href="https://developer.apple.com/documentation/appkit/nsalert"
					rel="noopener"
					target="_blank"
				>
					Apple NSAlert reference ↗
				</a>
			</div>
			<section className="alert-workbench">
				<div>
					<p className="dock-study-eyebrow">TRY THE COMPLETE DIALOG</p>
					<h2>Before closing the document.</h2>
					<p>
						Return chooses the configured default. Escape chooses Cancel when
						available. Space presses the focused button. Outside clicks keep the
						alert open.
					</p>
					<label>
						<input
							checked={disabled}
							onChange={(event) => setDisabled(event.target.checked)}
							type="checkbox"
						/>{" "}
						Disable the default action
					</label>
					<p aria-live="polite" className="alert-workbench-result">
						{result}
					</p>
				</div>
				<MacOSEnvironment
					appearance={dark ? "dark" : "light"}
					className="alert-workbench-desktop"
				>
					<div className="alert-workbench-document">
						<div className="alert-workbench-titlebar">
							<span /> <span /> <span />
							<b>Report.pdf</b>
						</div>
						<h3>Report.pdf</h3>
						<p>Quarterly report</p>
						<p>Review the latest changes before closing this document.</p>
						<MacButton onClick={() => setOpen(true)} ref={trigger}>
							Show {label.toLowerCase()}
						</MacButton>
					</div>
					<MacAlert
						{...props}
						actions={props.actions.map((action) => ({
							...action,
							disabled: disabled && action.id === props.defaultAction,
						}))}
						key={`${name}-${generation}`}
						onAction={(id) => setResult(`Dialog: ${id}`)}
						onOpenChange={setOpen}
						open={open}
						returnFocus={trigger}
						suppression={
							suppressionLabel ? { label: suppressionLabel } : undefined
						}
					/>
				</MacOSEnvironment>
			</section>
		</main>
	);
}

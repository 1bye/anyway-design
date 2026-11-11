/** biome-ignore-all lint/performance/noJsxPropsBind: Local comparison controls and callbacks. */
import { MacOSEnvironment } from "@1bye/macos/environment";
import {
	MacNotificationCard,
	MacNotificationCenterPanel,
} from "@1bye/macos/notification-center";
import { ArrowLeft } from "lucide-react";
import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { REMINDER, useNotificationDemo } from "./notification-demo";
import "./dock-reference.css";
import "./notification-center-reference.css";

const GUIDE =
	"https://support.apple.com/en-ie/guide/mac-help/mchl2fb1258f/26/mac/26";

export function NotificationCenterReferenceComparison() {
	const [detail, setDetail] = useState("widgets");
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [dark, setDark] = useState(false);
	const [opaque, setOpaque] = useState(false);
	const [incoming, setIncoming] = useState(false);
	const [notice, setNotice] = useState("");
	const [reminderVisible, setReminderVisible] = useState(true);
	const [generation, setGeneration] = useState(0);
	const viewport = useRef<HTMLDivElement | null>(null);
	const { panel, reset } = useNotificationDemo(setNotice, true, true);
	const widgets = detail === "widgets";
	const height = widgets ? 451 : 275;
	const scale = zoom === "fit" ? fit : Number(zoom);
	const source = `/assets/tahoe-notification-${widgets ? "center" : "banner"}-reference.png`;
	useLayoutEffect(() => {
		const element = viewport.current;
		// biome-ignore lint/suspicious/noUnnecessaryConditions: Refs are nullable during mount and teardown.
		if (!element) {
			return;
		}
		const resize = () => setFit(Math.min(1, element.clientWidth / 397));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, []);
	return (
		<main
			className="dock-study nc-study"
			style={
				{
					"--nc-study-height": `${height}px`,
					"--nc-study-scale": scale,
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?component=notification-center">
					<ArrowLeft size={14} /> Platform lab
				</a>
				<span>TAHOE / NOTIFICATION CENTER</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">A GLANCE AT WHAT’S NEXT.</p>
				<h1>Notification Center, beside Tahoe.</h1>
				<p>
					Live React cards and widget slots beside Apple’s macOS Tahoe 26
					reference.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="nc-study-controls">
					<label>
						Detail{" "}
						<select
							aria-label="Detail"
							onChange={(event) => {
								setDetail(event.target.value);
								setIncoming(false);
								setReminderVisible(true);
							}}
							value={detail}
						>
							<option value="widgets">Widgets</option>
							<option value="reminder">Reminder &amp; actions</option>
						</select>
					</label>
					<label>
						<input
							checked={dark}
							onChange={(event) => setDark(event.target.checked)}
							type="checkbox"
						/>{" "}
						Dark React preview
					</label>
					<label>
						<input
							checked={opaque}
							onChange={(event) => setOpaque(event.target.checked)}
							type="checkbox"
						/>{" "}
						Reduce transparency
					</label>
					{widgets ? (
						<button
							onClick={() => {
								reset();
								setIncoming((current) => !current);
							}}
							type="button"
						>
							{incoming ? "Hide notifications" : "Add notifications"}
						</button>
					) : null}
					<button
						onClick={() => {
							reset();
							setIncoming(false);
							setReminderVisible(true);
							setGeneration((current) => current + 1);
							setNotice("");
						}}
						type="button"
					>
						Reset
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
						<h2>Our Notification Center</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<div className="nc-study-viewport" ref={viewport}>
						<div className="nc-study-sizer">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="nc-study-canvas nc-study-live"
								reduceTransparency={opaque}
								style={
									{
										"--mac-menu-icon-size": "0px",
										"--mac-menu-width": "188px",
									} as CSSProperties
								}
							>
								<span className="nc-study-clock">Tue Apr 1 9:41 AM</span>
								<div className="nc-study-content">
									{widgets ? (
										<MacNotificationCenterPanel
											{...panel}
											key={generation}
											notifications={incoming ? panel.notifications : []}
										/>
									) : null}
									{!widgets && reminderVisible ? (
										<MacNotificationCard
											defaultActionsOpen
											item={REMINDER}
											key={generation}
											onAction={(id) => setNotice(`Reminders: ${id}`)}
											onDismiss={() => {
												setReminderVisible(false);
												setNotice("Reminder dismissed — Reset to restore");
											}}
											onOpen={() => setNotice("Open Brunch in Reminders")}
										/>
									) : null}
								</div>
							</MacOSEnvironment>
						</div>
					</div>
					<footer>
						{widgets
							? "338pt column · 160pt widget cards · 16pt spacing"
							: "Time-sensitive reminder · native app icon · Options menu"}
					</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Apple’s Tahoe reference</h2>
						<a href={source} rel="noopener" target="_blank">
							Original ↗
						</a>
					</header>
					<div className="nc-study-viewport">
						<div className="nc-study-sizer">
							<div
								className="nc-study-canvas nc-study-native"
								data-detail={detail}
							>
								<img
									alt={`Apple’s macOS Tahoe ${widgets ? "calendar, Reading List, and clock widgets" : "Reminders notification and Options menu"}`}
									draggable={false}
									height={widgets ? 1048 : 734}
									src={source}
									width={widgets ? 1116 : 852}
								/>
							</div>
						</div>
					</div>
					<footer>
						Apple’s macOS Tahoe 26 guide · original 2× image · light appearance
					</footer>
				</section>
			</div>
			<p aria-live="polite" className="dock-study-selection">
				{notice ||
					"Click a widget, open Options, or add notifications to try expanding and clearing groups."}
			</p>
			<div className="dock-study-notes">
				<p>
					Both sides use a 397-point desktop crop and shared zoom. Widget
					shells, calendar content, notification text, controls, and actions on
					the left are live React.
				</p>
				<p>
					Apple’s images are published static references, including their
					annotations. Our wallpaper alignment, Reading List photograph, and
					clock typography differ. Added notification groups and dark appearance
					are interactive previews; Apple’s reference stays unchanged. Opening
					and settling motion still need a native recording.
				</p>
				<a href={GUIDE} rel="noopener" target="_blank">
					Apple’s Tahoe Notification Center guide ↗
				</a>
			</div>
		</main>
	);
}

import {
	MacButton,
	MacSearchField,
	MacTextField,
} from "@anyway-design/macos/controls";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { ArrowLeft } from "lucide-react";
import {
	type ChangeEvent,
	type CSSProperties,
	type FormEvent,
	type RefObject,
	type UIEvent,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import "./dock-reference.css";
import "./controls-reference.css";

const STATES = ["Normal", "Pressed / filled", "Disabled"] as const;
const ROWS = [
	{ id: "button", label: "Button", top: 74 },
	{ id: "primary", label: "Primary button", top: 120 },
	{ id: "small", label: "Small button", top: 164 },
	{ id: "text", label: "Text field", top: 226 },
	{ id: "search", label: "Search field", top: 282 },
] as const;
type SampleRow = (typeof ROWS)[number];
type Detail = "all" | "buttons" | "fields";
const CROPS = {
	all: { height: 380, top: 0 },
	buttons: { height: 204, top: 0 },
	fields: { height: 126, top: 204 },
} as const;

function ControlSample({
	row,
	column,
	onAction,
}: {
	row: SampleRow;
	column: number;
	onAction: () => void;
}) {
	const disabled = column === 2;
	const label = `${row.label}: ${STATES[column]}`;
	if (row.id === "text") {
		return (
			<MacTextField
				aria-label={label}
				defaultValue={column === 1 ? "Tahoe" : ""}
				disabled={disabled}
				placeholder="Project name"
			/>
		);
	}
	if (row.id === "search") {
		return (
			<MacSearchField
				aria-label={label}
				defaultValue={column === 1 ? "Tahoe" : ""}
				disabled={disabled}
			/>
		);
	}
	return (
		<MacButton
			aria-label={label}
			disabled={disabled}
			onClick={onAction}
			size={row.id === "small" ? "small" : "regular"}
			variant={row.id === "primary" ? "primary" : "default"}
		>
			{row.id === "primary" ? "Continue" : "Cancel"}
		</MacButton>
	);
}

function ControlCanvas({
	active,
	detail,
	onAction,
}: {
	active: boolean;
	detail: Detail;
	onAction: () => void;
}) {
	return (
		<div className="controls-study-canvas" data-active={active}>
			<div className="controls-study-native-title">TAHOE / NATIVE APPKIT</div>
			{STATES.map((state, column) => (
				<div
					className="controls-study-column"
					key={state}
					style={{ left: 168 + column * 136 }}
				>
					{state}
				</div>
			))}
			{ROWS.filter(
				(row) =>
					detail === "all" ||
					(detail === "fields") === (row.id === "text" || row.id === "search")
			).map((row) => (
				<div key={row.id}>
					<span
						className="controls-study-row-label"
						style={{ top: row.top + 5 }}
					>
						{row.label}
					</span>
					{STATES.map((state, column) => (
						<div
							className="controls-study-sample"
							data-sample-state={column === 1 ? "pressed" : "normal"}
							key={state}
							style={{
								left: 168 + column * 136,
								top: row.top,
								width: row.id === "text" || row.id === "search" ? 120 : 112,
							}}
						>
							<ControlSample column={column} onAction={onAction} row={row} />
						</div>
					))}
				</div>
			))}
		</div>
	);
}

function ControlsWorkbench({ dark }: { dark: boolean }) {
	const [name, setName] = useState("Design system");
	const [query, setQuery] = useState("Tahoe");
	const [disabled, setDisabled] = useState(false);
	const [notice, setNotice] = useState("");
	const changeName = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
		[]
	);
	const changeDisabled = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setDisabled(event.target.checked),
		[]
	);
	const search = useCallback(
		(value: string) => setNotice(`Search submitted: ${value || "(empty)"}`),
		[]
	);
	const save = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			setNotice(`Saved “${name}”.`);
		},
		[name]
	);
	const reset = useCallback(() => {
		setName("Design system");
		setQuery("Tahoe");
		setNotice("");
	}, []);
	return (
		<section className="controls-study-workbench">
			<div>
				<h2>Try the controls.</h2>
				<p>
					Tab to focus, press and hold a button, type a search, or press Escape
					to clear it.
				</p>
			</div>
			<label className="controls-study-disable">
				<input checked={disabled} onChange={changeDisabled} type="checkbox" />{" "}
				Disable controls
			</label>
			<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
				<form className="controls-study-form" onSubmit={save}>
					<label htmlFor="control-project-name">Project name</label>
					<MacTextField
						disabled={disabled}
						id="control-project-name"
						onChange={changeName}
						value={name}
					/>
					<label htmlFor="control-search">Search components</label>
					<MacSearchField
						disabled={disabled}
						id="control-search"
						onSearch={search}
						onValueChange={setQuery}
						value={query}
					/>
					<div className="controls-study-form-actions">
						<MacButton disabled={disabled} onClick={reset}>
							Reset
						</MacButton>
						<MacButton disabled={disabled} type="submit" variant="primary">
							Save
						</MacButton>
					</div>
				</form>
			</MacOSEnvironment>
			<p aria-live="polite" className="controls-study-notice">
				{notice}
			</p>
		</section>
	);
}

export function ControlsReferenceComparison() {
	const [zoom, setZoom] = useState("fit");
	const [fit, setFit] = useState(1);
	const [dark, setDark] = useState(false);
	const [active, setActive] = useState(false);
	const [detail, setDetail] = useState<Detail>("all");
	const [notice, setNotice] = useState("");
	const [resetKey, setResetKey] = useState(0);
	const liveViewport: RefObject<HTMLElement | null> = useRef(null);
	const referenceViewport: RefObject<HTMLElement | null> = useRef(null);
	const crop = CROPS[detail];
	const scale = zoom === "fit" ? fit : Number(zoom);
	useLayoutEffect(() => {
		const element = liveViewport.current;
		if (element === null) {
			return;
		}
		const resize = () => setFit(Math.min(1, element.clientWidth / 632));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, []);
	const resetScroll = useCallback(() => {
		liveViewport.current?.scrollTo(0, 0);
		referenceViewport.current?.scrollTo(0, 0);
	}, []);
	const changeZoom = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setZoom(event.target.value);
			resetScroll();
		},
		[resetScroll]
	);
	const changeDark = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setDark(event.target.checked),
		[]
	);
	const changeActive = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setActive(event.target.checked),
		[]
	);
	const changeDetail = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const next = event.target.value;
			if (next === "all" || next === "buttons" || next === "fields") {
				setDetail(next);
				resetScroll();
			}
		},
		[resetScroll]
	);
	const syncScroll = useCallback((event: UIEvent<HTMLElement>) => {
		const from = event.currentTarget;
		const to =
			from === liveViewport.current
				? referenceViewport.current
				: liveViewport.current;
		if (
			to &&
			(Math.abs(to.scrollLeft - from.scrollLeft) > 1 ||
				Math.abs(to.scrollTop - from.scrollTop) > 1)
		) {
			to.scrollTo(from.scrollLeft, from.scrollTop);
		}
	}, []);
	const activate = useCallback(
		() =>
			setNotice(
				"Button activated. These controls use local preview callbacks."
			),
		[]
	);
	const reset = useCallback(() => {
		setActive(false);
		setResetKey((current) => current + 1);
		setNotice("");
		resetScroll();
	}, [resetScroll]);
	const style = {
		"--controls-study-height": `${crop.height + 48}px`,
		"--controls-study-scale": scale,
		"--controls-study-top": `${24 - crop.top}px`,
	} as CSSProperties;
	return (
		<main className="dock-study controls-study" style={style}>
			<header className="dock-study-header">
				<a href="?component=controls">
					<ArrowLeft size={15} /> Back to the lab
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · CONTROLS STUDY</p>
				<h1>Buttons and fields, up close.</h1>
				<p>
					Live React controls beside native AppKit renders from this Mac, with a
					shared zoom.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="controls-study-options">
					<label>
						Detail{" "}
						<select onChange={changeDetail} value={detail}>
							<option value="all">All controls</option>
							<option value="buttons">Buttons</option>
							<option value="fields">Fields</option>
						</select>
					</label>
					<label>
						<input checked={dark} onChange={changeDark} type="checkbox" /> Dark
					</label>
					<label>
						<input checked={active} onChange={changeActive} type="checkbox" />{" "}
						Active accent (live only)
					</label>
					<button onClick={reset} type="button">
						Reset samples
					</button>
				</div>
				<label>
					Shared zoom{" "}
					<select onChange={changeZoom} value={zoom}>
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
						aria-label="Our controls close-up. Scroll to inspect."
						className="controls-study-viewport"
						onScroll={syncScroll}
						ref={liveViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the scrolling comparison.
						tabIndex={0}
					>
						<div className="controls-study-scene">
							<MacOSEnvironment
								appearance={dark ? "dark" : "light"}
								className="controls-study-live"
								preset="tahoe"
							>
								<ControlCanvas
									active={active}
									detail={detail}
									key={resetKey}
									onAction={activate}
								/>
							</MacOSEnvironment>
						</div>
					</section>
					<footer>MacButton · MacTextField · MacSearchField</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Native AppKit</h2>
						<span>Inactive · Tahoe 26.6.2 · 2×</span>
					</header>
					<section
						aria-label="Native controls close-up. Scroll to inspect."
						className="controls-study-viewport"
						onScroll={syncScroll}
						ref={referenceViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the scrolling comparison.
						tabIndex={0}
					>
						<div className="controls-study-scene">
							<img
								alt="Native AppKit capsule buttons, text fields, and search fields in normal, pressed or filled, and disabled states. Inactive window."
								className="controls-study-original"
								draggable={false}
								height={760}
								src={`/assets/native-controls/tahoe-controls-${dark ? "dark" : "light"}.png`}
								width={1168}
							/>
						</div>
					</section>
					<footer>NSButton · NSTextField · NSSearchField</footer>
				</section>
			</div>
			<div className="dock-study-notes">
				<p>
					<a href="?view=input-controls-reference">
						Compare checkboxes, radios, sliders, and steppers ↗
					</a>
				</p>
				<p>
					The reference is an inactive AppKit window rendered on macOS 26.6.2
					(25G83). Pressed buttons use AppKit’s highlighted state; fields in
					that column contain text. Hover and focus are interactive on the live
					side.
				</p>
				<p>
					Use Active accent to preview blue primary buttons. Active accent and
					focus rings are browser approximations and are not calibrated against
					these inactive captures. No user windows or personal content were
					captured.
				</p>
			</div>
			<p aria-live="polite" className="controls-study-notice">
				{notice}
			</p>
			<ControlsWorkbench dark={dark} />
		</main>
	);
}

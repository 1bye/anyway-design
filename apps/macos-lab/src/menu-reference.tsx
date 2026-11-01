import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { MacContextMenu, MacMenuButton } from "@anyway-design/macos/menu";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import {
	WindowToolbarButton,
	WindowToolbarGroup,
} from "@anyway-design/macos/window-toolbar";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
	type ChangeEvent,
	type CSSProperties,
	type UIEvent,
	useCallback,
	useRef,
	useState,
} from "react";
import { useFinderMenu } from "./finder-actions";
import "./dock-reference.css";
import "./menu-reference.css";

const SOURCE =
	"https://support.apple.com/en-lk/guide/mac-help/mchlbc684e49/26/mac/26";
const ORIGINAL =
	"https://help.apple.com/assets/69DD569682238CF8EC0621E2/69DD569982238CF8EC0621E9/en_US/3d4f4608b2c832321e287273a5a4ad6d.png";

export function MenuReferenceComparison() {
	const [zoom, setZoom] = useState("1");
	const [dark, setDark] = useState(false);
	const [opaque, setOpaque] = useState(false);
	const [extras, setExtras] = useState(false);
	const [open, setOpen] = useState(true);
	const [notice, setNotice] = useState("");
	const liveViewport = useRef<HTMLElement>(null);
	const referenceViewport = useRef<HTMLElement>(null);
	const syncScroll = useCallback((event: UIEvent<HTMLElement>) => {
		const from = event.currentTarget;
		const to =
			from === liveViewport.current
				? referenceViewport.current
				: liveViewport.current;
		if (
			to !== null &&
			(Math.abs(to.scrollLeft - from.scrollLeft) > 1 ||
				Math.abs(to.scrollTop - from.scrollTop) > 1)
		) {
			to.scrollTo(from.scrollLeft, from.scrollTop);
		}
	}, []);
	const onAction = useCallback(
		(id: string) =>
			setNotice(`${id} activated. File actions are preview callbacks.`),
		[]
	);
	const menu = useFinderMenu(onAction, "tree.jpeg", extras);
	const changeZoom = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		setZoom(event.target.value);
		liveViewport.current?.scrollTo(0, 0);
		referenceViewport.current?.scrollTo(0, 0);
	}, []);
	const changeDark = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setDark(event.target.checked),
		[]
	);
	const changeOpaque = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setOpaque(event.target.checked),
		[]
	);
	const changeExtras = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setExtras(event.target.checked),
		[]
	);
	const showMenu = useCallback(() => setOpen(true), []);
	const contextOpen = useCallback(() => setOpen(false), []);
	return (
		<main
			className="dock-study menu-study"
			style={
				{
					"--menu-study-height": extras ? "544px" : "488px",
					"--menu-study-zoom": Number(zoom),
				} as CSSProperties
			}
		>
			<header className="dock-study-header">
				<a href="?view=window-reference">
					<ArrowLeft size={15} /> Back to the window
				</a>
				<span>ANYWAY / PLATFORM LAB</span>
			</header>
			<div className="dock-study-heading">
				<p className="dock-study-eyebrow">TAHOE · MENU STUDY</p>
				<h1>A closer look at menus.</h1>
				<p>
					One menu surface for toolbar actions, right-click menus, and the menu
					bar.
				</p>
			</div>
			<div className="dock-study-toolbar">
				<div className="menu-study-options">
					<button onClick={showMenu} type="button">
						Open More menu
					</button>
					<label>
						<input checked={dark} onChange={changeDark} type="checkbox" /> Dark
					</label>
					<label>
						<input checked={opaque} onChange={changeOpaque} type="checkbox" />{" "}
						Reduce transparency
					</label>
					<label>
						<input checked={extras} onChange={changeExtras} type="checkbox" />{" "}
						Extra states
					</label>
				</div>
				<label>
					Shared zoom
					<select onChange={changeZoom} value={zoom}>
						<option value="1">1×</option>
						<option value="1.5">1.5×</option>
						<option value="2">2×</option>
					</select>
				</label>
			</div>
			<div className="dock-study-grid">
				<section className="dock-study-panel">
					<header>
						<h2>Our menu</h2>
						<span>
							<i /> Live React
						</span>
					</header>
					<section
						aria-label="Our menu close-up"
						className="menu-study-viewport"
						onScroll={syncScroll}
						ref={liveViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the scrolling comparison.
						tabIndex={0}
					>
						<MacOSEnvironment
							appearance={dark ? "dark" : "light"}
							className="menu-study-scene menu-study-live"
							reduceTransparency={opaque}
						>
							<span className="menu-study-filename">tree.jpeg</span>
							<div className="menu-study-trigger">
								<WindowToolbarGroup label="File actions">
									<MacMenuButton
										items={menu.items}
										onAction={menu.action}
										onOpenChange={setOpen}
										open={open}
										positionerProps={{
											align: "end",
											collisionAvoidance: {
												align: "none",
												fallbackAxisSide: "none",
												side: "none",
											},
											sideOffset: 8,
										}}
										trigger={
											<WindowToolbarButton label="More actions">
												<WindowSymbol name="ellipsis" />
											</WindowToolbarButton>
										}
									/>
								</WindowToolbarGroup>
							</div>
						</MacOSEnvironment>
					</section>
					<footer>
						More button · Escape to dismiss · Arrow keys to navigate
					</footer>
				</section>
				<section className="dock-study-panel">
					<header>
						<h2>Apple’s reference</h2>
						<a href={ORIGINAL} rel="noopener noreferrer" target="_blank">
							Original <ArrowUpRight size={12} />
						</a>
					</header>
					<section
						aria-label="Apple menu close-up"
						className="menu-study-viewport"
						onScroll={syncScroll}
						ref={referenceViewport}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard access to the scrolling comparison.
						tabIndex={0}
					>
						<div className="menu-study-scene">
							<div className="menu-study-reference-crop">
								<img
									alt="Apple’s Tahoe Finder shortcut menu for tree.jpeg"
									height={568}
									src="/assets/apple-tahoe-menu-reference.png"
									width={814}
								/>
							</div>
						</div>
					</section>
					<footer>Apple’s Tahoe 26 guide · Finder shortcut menu</footer>
				</section>
			</div>
			<div className="menu-study-context">
				<MacOSEnvironment
					appearance={dark ? "dark" : "light"}
					reduceTransparency={opaque}
				>
					<MacContextMenu
						items={menu.items}
						onAction={menu.action}
						trigger={
							<button
								className="menu-study-context-target"
								onContextMenu={contextOpen}
								type="button"
							>
								<WindowSymbol name="document" /> tree.jpeg{" "}
								<span>Right-click, long-press, or press Shift+F10</span>
							</button>
						}
					/>
				</MacOSEnvironment>
				<p aria-live="polite">
					{notice ||
						"Try Open With, Quick Actions, or a tag color. Extra states adds shortcuts, a checkbox, and a disabled item."}
				</p>
			</div>
			<div className="dock-study-notes">
				<p>
					Reference:{" "}
					<a href={SOURCE} rel="noopener noreferrer" target="_blank">
						Apple’s “Switched from Windows to Mac?” guide for Tahoe 26 ↗
					</a>
					. The original 814 × 568 image is cropped around its menu and
					displayed at the same pixel scale before shared zoom.
				</p>
				<p>
					The reference is a context menu. Our toolbar and context menu share
					the same live component and matching item list. Submenu contents and
					Extra states are interaction examples. Icons are native Tahoe 26.6.2
					exports; the zipper variant differs from this reference. Dark material
					and animation remain approximations.
				</p>
			</div>
		</main>
	);
}

"use client";

import { useRender } from "@base-ui/react/use-render";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
	createContext,
	type ReactElement,
	type ReactNode,
	use,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { createLiquidGeometryTracker } from "./track-liquid-geometry";

export type ShortcutSide = "top" | "bottom" | "left" | "right";

interface Target {
	element: HTMLElement;
	id: string;
	keys: string;
	offset: number;
	side: ShortcutSide;
}
interface Hint extends Target {
	height: number;
	left: number;
	radius: number;
	top: number;
	width: number;
}
interface ShortcutContext {
	active: boolean;
	register: (target: Target) => () => void;
	toggle: () => void;
}
const Context = createContext<ShortcutContext | null>(null);
const MAC_PLATFORM = /Mac|iPhone|iPad/;
const isEditing = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(INPUT_TAGS.has(target.tagName) || target.isContentEditable);
const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const RESERVED = new Set([
	"mod+l",
	"mod+t",
	"mod+n",
	"mod+w",
	"mod+r",
	"mod+f",
	"mod+q",
]);

export function matchesLiquidShortcut(
	keys: string,
	event: Pick<
		KeyboardEvent,
		"key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey"
	>,
	mac: boolean
): boolean {
	const parts = keys.toLowerCase().split("+");
	if (RESERVED.has(keys.toLowerCase())) {
		return false;
	}
	return (
		parts.at(-1) ===
			(event.code.startsWith("Key")
				? event.code.slice(3).toLowerCase()
				: event.key.toLowerCase()) &&
		event.metaKey ===
			(parts.includes("meta") || (mac && parts.includes("mod"))) &&
		event.ctrlKey ===
			(parts.includes("ctrl") || (!mac && parts.includes("mod"))) &&
		event.altKey === parts.includes("alt") &&
		event.shiftKey === parts.includes("shift")
	);
}

function available(target: Target, inViewport = false): boolean {
	const { element } = target;
	const openMenu = document.querySelector('[role="menu"]:not([data-closed])');
	if (openMenu && !element.closest('[role="menu"]:not([data-closed])')) {
		return false;
	}
	if (
		!element.isConnected ||
		element.matches(':disabled, [aria-disabled="true"]') ||
		element.closest("[hidden], [inert], [data-closed]")
	) {
		return false;
	}
	const rect = element.getBoundingClientRect();
	const style = getComputedStyle(element);
	return (
		rect.width > 0 &&
		rect.height > 0 &&
		(!inViewport ||
			(rect.bottom > 0 &&
				rect.right > 0 &&
				rect.top < innerHeight &&
				rect.left < innerWidth)) &&
		style.visibility !== "hidden" &&
		style.display !== "none"
	);
}

export function LiquidShortcutProvider({
	children,
	delay = 300,
}: {
	children: ReactNode;
	delay?: number;
}) {
	const reduced = useReducedMotion();
	const [targets, setTargets] = useState<Target[]>([]);
	const [active, setActive] = useState(false);
	const [hints, setHints] = useState<Hint[]>([]);
	const id = useId();
	const register = useCallback((target: Target) => {
		setTargets((current) => [
			...current.filter((item) => item.id !== target.id),
			target,
		]);
		return () =>
			setTargets((current) => current.filter((item) => item.id !== target.id));
	}, []);
	const toggle = useCallback(() => setActive((current) => !current), []);
	const context = useMemo(
		() => ({ active, register, toggle }),
		[register, toggle, active]
	);
	useEffect(() => {
		if (!targets.length) {
			return;
		}
		const mac = MAC_PLATFORM.test(navigator.platform);
		let timer: ReturnType<typeof setTimeout> | undefined;
		const hide = () => {
			clearTimeout(timer);
			setActive(false);
		};
		const down = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				hide();
				return;
			}
			if (event.defaultPrevented || event.repeat || event.isComposing) {
				return;
			}
			if (isEditing(event.target)) {
				return;
			}
			if (event.key === (mac ? "Meta" : "Control")) {
				clearTimeout(timer);
				timer = setTimeout(() => setActive(true), delay);
				return;
			}
			const target = [...targets]
				.reverse()
				.find(
					(item) =>
						available(item) && matchesLiquidShortcut(item.keys, event, mac)
				);
			if (target) {
				event.preventDefault();
				hide();
				target.element.click();
			}
		};
		const up = (event: KeyboardEvent) => {
			if (event.key === "Meta" || event.key === "Control") {
				hide();
			}
		};
		const visibility = () => {
			if (document.hidden) {
				hide();
			}
		};
		window.addEventListener("keydown", down, true);
		window.addEventListener("keyup", up, true);
		window.addEventListener("blur", hide);
		document.addEventListener("visibilitychange", visibility);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("keydown", down, true);
			window.removeEventListener("keyup", up, true);
			window.removeEventListener("blur", hide);
			document.removeEventListener("visibilitychange", visibility);
		};
	}, [targets, delay]);
	useEffect(() => {
		if (!active) {
			return;
		}
		const tracker = createLiquidGeometryTracker(() => {
			const next = targets
				.filter((target) => available(target, true))
				.map((target) => {
					const { left, top, width, height } =
						target.element.getBoundingClientRect();
					return {
						...target,
						height,
						left,
						radius:
							Number.parseFloat(
								getComputedStyle(target.element).borderRadius
							) || 0,
						top,
						width,
					};
				});
			setHints((current) =>
				current.length === next.length &&
				current.every((hint, index) => {
					const item = next[index];
					return (
						item &&
						hint.id === item.id &&
						hint.left === item.left &&
						hint.top === item.top &&
						hint.width === item.width &&
						hint.height === item.height &&
						hint.radius === item.radius &&
						hint.side === item.side &&
						hint.offset === item.offset
					);
				})
					? current
					: next
			);
		});
		tracker.setElements(targets.map((target) => target.element));
		tracker.setContinuousTracking(true);
		tracker.measureNow();
		return tracker.disconnect;
	}, [active, targets]);
	return (
		<Context value={context}>
			{children}
			{hints.length > 0
				? createPortal(
						<AnimatePresence>
							{active ? (
								<motion.div
									animate={{ opacity: 1 }}
									aria-hidden="true"
									className="liquid-shortcut-overlay"
									exit={{ opacity: 0 }}
									initial={{ opacity: 0 }}
									transition={{ duration: reduced ? 0 : 0.18 }}
								>
									<svg
										className="liquid-shortcut-mask"
										height="100%"
										width="100%"
									>
										<title>Available shortcuts</title>
										<defs>
											<mask
												height="100%"
												id={id}
												maskUnits="userSpaceOnUse"
												width="100%"
												x="0"
												y="0"
											>
												<rect fill="white" height="100%" width="100%" />
												{hints.map((hint) => (
													<rect
														fill="black"
														height={hint.height + 6}
														key={hint.id}
														rx={hint.radius + 3}
														width={hint.width + 6}
														x={hint.left - 3}
														y={hint.top - 3}
													/>
												))}
											</mask>
										</defs>
										<rect
											fill="var(--liquid-dim, #000)"
											height="100%"
											mask={`url(#${id})`}
											opacity="0.32"
											width="100%"
										/>
									</svg>
									{hints.map((hint) => (
										<ShortcutHint hint={hint} key={hint.id} />
									))}
								</motion.div>
							) : null}
						</AnimatePresence>,
						document.body
					)
				: null}
		</Context>
	);
}

export function LiquidShortcut({
	keys,
	side = "top",
	offset = 8,
	children,
}: {
	keys: string;
	side?: ShortcutSide;
	offset?: number;
	children: ReactElement;
}) {
	const context = use(Context);
	if (!context) {
		throw new Error("LiquidShortcut requires LiquidProvider");
	}
	const id = useId();
	const [mac, setMac] = useState(false);
	useEffect(() => setMac(MAC_PLATFORM.test(navigator.platform)), []);
	const [element, setElement] = useState<HTMLElement | null>(null);
	useEffect(
		() =>
			element
				? context.register({ element, id, keys, offset, side })
				: undefined,
		[context.register, id, keys, element, side, offset]
	);
	return useRender<Record<string, never>, HTMLElement>({
		props: {
			"aria-keyshortcuts": keys
				.replace("mod", mac ? "Meta" : "Control")
				.replace("alt", "Alt")
				.replace("shift", "Shift"),
		},
		ref: setElement,
		render: children,
	});
}

export function LiquidShortcutToggle({
	children = "Show shortcuts",
}: {
	children?: ReactNode;
}) {
	const context = use(Context);
	if (!context) {
		throw new Error("LiquidShortcutToggle requires LiquidProvider");
	}
	return (
		<button
			aria-pressed={context.active}
			className="liquid-shortcut-toggle"
			onClick={context.toggle}
			type="button"
		>
			{children}
		</button>
	);
}

function ShortcutHint({ hint }: { hint: Hint }) {
	const ref = useRef<HTMLElement>(null);
	const [size, setSize] = useState({ height: 0, width: 0 });
	useLayoutEffect(() => {
		const element = ref.current;
		if (element === null) {
			return;
		}
		const measure = () => {
			const { width, height } = element.getBoundingClientRect();
			setSize({ height, width });
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	const position = positionShortcutHint(hint, size, {
		height: innerHeight,
		width: innerWidth,
	});
	const mac = MAC_PLATFORM.test(navigator.platform);
	return (
		<kbd
			className="liquid-shortcut-hint"
			ref={ref}
			style={{
				...position,
				visibility: size.width ? "visible" : "hidden",
			}}
		>
			{hint.keys
				.replace("mod", mac ? "⌘" : "Ctrl")
				.replace("alt", mac ? "⌥" : "Alt")
				.replace("shift", "⇧")
				.replaceAll("+", " ")
				.toUpperCase()}
		</kbd>
	);
}

export function positionShortcutHint(
	target: {
		left: number;
		top: number;
		width: number;
		height: number;
		side: ShortcutSide;
		offset: number;
	},
	size: { width: number; height: number },
	viewport: { width: number; height: number }
): { left: number; top: number } {
	const gap = Math.max(0, target.offset);
	const positions = {
		bottom: {
			left: target.left + (target.width - size.width) / 2,
			top: target.top + target.height + gap,
		},
		left: {
			left: target.left - size.width - gap,
			top: target.top + (target.height - size.height) / 2,
		},
		right: {
			left: target.left + target.width + gap,
			top: target.top + (target.height - size.height) / 2,
		},
		top: {
			left: target.left + (target.width - size.width) / 2,
			top: target.top - size.height - gap,
		},
	};
	const opposite = {
		bottom: "top",
		left: "right",
		right: "left",
		top: "bottom",
	} as const;
	const fits = (candidate: { left: number; top: number }) =>
		candidate.left >= 8 &&
		candidate.top >= 8 &&
		candidate.left + size.width <= viewport.width - 8 &&
		candidate.top + size.height <= viewport.height - 8;
	let position = positions[target.side];
	const fallback = positions[opposite[target.side]];
	if (!fits(position) && fits(fallback)) {
		position = fallback;
	}
	return {
		left: Math.max(8, Math.min(position.left, viewport.width - size.width - 8)),
		top: Math.max(8, Math.min(position.top, viewport.height - size.height - 8)),
	};
}

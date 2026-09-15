import { motion, useReducedMotion } from "motion/react";
import {
	type FocusEvent,
	type MouseEvent,
	useCallback,
	useEffect,
	useState,
} from "react";

const items = [
	["connected-menu", "Menus"],
	["shortcuts", "Shortcut preview"],
	["nested-menus", "Nested submenus"],
	["stacked-menus", "Stacked menus"],
	["context-menu", "Context menu"],
] as const;

export function ExampleNav({
	onActiveChange,
}: {
	onActiveChange: (id: string) => void;
}) {
	const [active, setActive] = useState("connected-menu");
	const [hovered, setHovered] = useState<string | null>(null);
	const reduced = useReducedMotion();
	useEffect(() => {
		let selected = "connected-menu";
		let dragging = false;
		const update = () => {
			if (dragging || document.activeElement?.closest(".following-controls")) {
				return;
			}
			let current: string = items[0][0];
			for (const [id] of items) {
				if (
					(document.getElementById(id)?.getBoundingClientRect().top ??
						Number.POSITIVE_INFINITY) <
					innerHeight / 3 +
						(items.findIndex(([itemId]) => itemId === id) <=
						items.findIndex(([itemId]) => itemId === selected)
							? 24
							: -24)
				) {
					current = id;
				}
			}
			selected = current;
			setActive(current);
			onActiveChange(current);
		};
		const start = (event: PointerEvent) => {
			dragging =
				event.target instanceof Element &&
				!!event.target.closest(".following-controls");
		};
		const end = () => {
			dragging = false;
		};
		const blur = () => {
			dragging = false;
		};
		const focusOut = () => requestAnimationFrame(update);
		document.addEventListener("pointerdown", start);
		document.addEventListener("pointerup", end);
		document.addEventListener("pointercancel", end);
		document.addEventListener("focusout", focusOut);
		window.addEventListener("blur", blur);
		update();
		window.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);
		return () => {
			document.removeEventListener("pointerdown", start);
			document.removeEventListener("pointerup", end);
			document.removeEventListener("pointercancel", end);
			document.removeEventListener("focusout", focusOut);
			window.removeEventListener("blur", blur);
			window.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, [onActiveChange]);
	const highlight = useCallback(
		(event: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>) =>
			setHovered(event.currentTarget.hash.slice(1)),
		[]
	);
	const clear = useCallback(() => setHovered(null), []);
	return (
		<nav aria-label="Component examples" className="example-nav">
			{items.map(([id, label]) => (
				<a
					aria-current={active === id ? "location" : undefined}
					href={`#${id}`}
					key={id}
					onBlur={clear}
					onFocus={highlight}
					onMouseEnter={highlight}
					onMouseLeave={clear}
				>
					{(hovered ?? active) === id && (
						<motion.div
							aria-hidden="true"
							className="nav-liquid-highlight"
							layoutId="example-nav-highlight"
							transition={
								reduced
									? { duration: 0 }
									: { damping: 28, stiffness: 360, type: "spring" }
							}
						/>
					)}
					{label}
				</a>
			))}
		</nav>
	);
}

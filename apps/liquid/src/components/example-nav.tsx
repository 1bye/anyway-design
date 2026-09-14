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

export function ExampleNav() {
	const [active, setActive] = useState("connected-menu");
	const [hovered, setHovered] = useState<string | null>(null);
	const reduced = useReducedMotion();
	useEffect(() => {
		const update = () => {
			let current: string = items[0][0];
			for (const [id] of items) {
				if (
					(document.getElementById(id)?.getBoundingClientRect().top ??
						Number.POSITIVE_INFINITY) <
					innerHeight * 0.4
				) {
					current = id;
				}
			}
			setActive(current);
		};
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);
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

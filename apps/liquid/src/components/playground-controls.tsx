import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
	createContext,
	type ReactNode,
	use,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";

const ControlsContext = createContext<{
	active: string;
	host: HTMLDivElement | null;
	reveal: boolean;
}>({ active: "Menu", host: null, reveal: false });

export function PlaygroundControlsProvider({
	active,
	children,
}: {
	active: string;
	children: ReactNode;
}) {
	const [selection, setSelection] = useState({ active, reveal: false });
	if (selection.active !== active) {
		setSelection({
			active,
			reveal:
				selection.active === "Shortcut preview" ||
				active === "Shortcut preview",
		});
	}
	const [host, setHost] = useState<HTMLDivElement | null>(null);
	const [height, setHeight] = useState<number>();
	const [column, setColumn] = useState<HTMLDivElement | null>(null);
	const [bounds, setBounds] = useState({ height: 0, top: 0 });
	const reduced = useReducedMotion();
	useLayoutEffect(() => {
		const frame = Array.from(
			document.querySelectorAll<HTMLElement>("[data-playground]")
		).find((element) => element.dataset.playground === active);
		const collection = frame?.closest(".example-collection");
		if (!(column && frame && collection)) {
			return;
		}
		const measure = () => {
			const rect = frame.getBoundingClientRect();
			const top = rect.top - column.getBoundingClientRect().top;
			setBounds((previous) =>
				previous.top === top && previous.height === rect.height
					? previous
					: { height: rect.height, top }
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(collection);
		observer.observe(frame);
		observer.observe(column);
		window.addEventListener("resize", measure);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, [active, column]);
	useLayoutEffect(() => {
		if (!host) {
			return;
		}
		const observer = new ResizeObserver(() =>
			setHeight(host.getBoundingClientRect().height)
		);
		observer.observe(host);
		return () => observer.disconnect();
	}, [host]);
	const value = useMemo(
		() => ({ active, host, reveal: selection.reveal }),
		[active, host, selection.reveal]
	);
	return (
		<ControlsContext value={value}>
			{children}
			<div className="controls-column" ref={setColumn}>
				<div
					className="controls-range"
					style={{ height: bounds.height, top: bounds.top }}
				>
					<motion.aside
						aria-label={`${active} playground controls`}
						className="following-controls"
						layout="position"
						transition={{ duration: reduced ? 0 : 0.18, ease: "easeOut" }}
					>
						<motion.div
							animate={{ height }}
							initial={false}
							transition={{ duration: reduced ? 0 : 0.16 }}
						>
							<div className="controls-host" ref={setHost} />
						</motion.div>
					</motion.aside>
				</div>
			</div>
		</ControlsContext>
	);
}

export function PlaygroundControls({
	name,
	children,
}: {
	name: string;
	children: ReactNode;
}) {
	const { active, host, reveal } = use(ControlsContext);
	const reduced = useReducedMotion();
	return host
		? createPortal(
				<AnimatePresence initial={false}>
					{active === name && (
						<motion.div
							animate={{
								inset: "auto",
								opacity: 1,
								pointerEvents: "auto",
								position: "relative",
								y: 0,
							}}
							className="controls-reveal"
							exit={{
								inset: 0,
								opacity: 0,
								pointerEvents: "none",
								position: "absolute",
								y: reduced ? 0 : -4,
							}}
							initial={{ opacity: 0, y: reduced ? 0 : 4 }}
							key={name}
							transition={{ duration: reduced || !reveal ? 0 : 0.16 }}
						>
							{children}
						</motion.div>
					)}
				</AnimatePresence>,
				host
			)
		: null;
}

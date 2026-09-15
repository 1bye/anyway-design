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
	const reduced = useReducedMotion();
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
			<aside
				aria-label={`${active} playground controls`}
				className="following-controls"
			>
				<motion.div
					animate={{ height }}
					initial={false}
					transition={{ duration: reduced ? 0 : 0.16 }}
				>
					<div className="controls-host" ref={setHost} />
				</motion.div>
			</aside>
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

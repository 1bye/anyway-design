import {
	type ReactNode,
	type RefObject,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { fileLabelPath } from "./file-label-shape";

export function FileLabel({
	children,
	selected,
}: {
	children: ReactNode;
	selected: boolean;
}) {
	const caption: RefObject<HTMLSpanElement | null> = useRef(null);
	const name: RefObject<HTMLSpanElement | null> = useRef(null);
	const [outline, setOutline] = useState({ path: "", viewBox: "" });
	// biome-ignore lint/correctness/useExhaustiveDependencies: New text or tag content can change line edges without resizing the caption.
	useLayoutEffect(() => {
		const container = caption.current;
		const text = name.current;
		if (!(selected && container && text)) {
			return;
		}
		const update = () => {
			const bounds = container.getBoundingClientRect();
			if (!(bounds.width && bounds.height)) {
				return;
			}
			const scale =
				bounds.width / Number.parseFloat(getComputedStyle(container).width);
			const rects = [...text.getClientRects()]
				.filter(
					(rect) => rect.top < bounds.bottom - 1 && rect.bottom > bounds.top
				)
				.slice(0, 2)
				.map((rect) => ({
					bottom: Math.min(bounds.height, rect.bottom - bounds.top),
					left: Math.max(0, rect.left - bounds.left),
					right: Math.min(bounds.width, rect.right - bounds.left),
					top: Math.max(0, rect.top - bounds.top),
				}));
			const path = fileLabelPath(rects, 4 * scale);
			const viewBox = `0 0 ${bounds.width} ${bounds.height}`;
			setOutline((current) =>
				current.path === path && current.viewBox === viewBox
					? current
					: { path, viewBox }
			);
		};
		const observer = new ResizeObserver(update);
		observer.observe(container);
		const { fonts } = container.ownerDocument;
		fonts.addEventListener("loadingdone", update);
		update();
		return () => {
			observer.disconnect();
			fonts.removeEventListener("loadingdone", update);
		};
	}, [selected, children]);
	return (
		<span aria-hidden="true" className="mac-file-caption" ref={caption}>
			{selected && outline.path ? (
				<svg
					aria-hidden="true"
					className="mac-file-selection"
					preserveAspectRatio="none"
					viewBox={outline.viewBox}
				>
					<path d={outline.path} />
				</svg>
			) : null}
			<span className="mac-file-name" ref={name}>
				{children}
			</span>
		</span>
	);
}

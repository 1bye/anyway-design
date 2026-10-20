import {
	type KeyboardEvent,
	type PointerEvent,
	type RefObject,
	useCallback,
	useRef,
} from "react";
import { FILE_COLUMN_WIDTH, fileBrowserColumnWidth } from "./file-column-model";

interface ResizeSession {
	pointerId: number;
	scale: number;
	startX: number;
	width: number;
}
export function FileColumnResize({
	label,
	width,
	onChange,
}: {
	label: string;
	width: number;
	onChange: (width: number) => void;
}) {
	const session: RefObject<ResizeSession | undefined> = useRef(undefined);
	const start = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			if (event.button !== 0) {
				return;
			}
			event.preventDefault();
			const column = event.currentTarget.parentElement;
			session.current = {
				pointerId: event.pointerId,
				scale: column
					? column.getBoundingClientRect().width / column.offsetWidth
					: 1,
				startX: event.clientX,
				width,
			};
			event.currentTarget.focus({ preventScroll: true });
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		[width]
	);
	const move = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			const { current } = session;
			if (current) {
				onChange(
					fileBrowserColumnWidth(
						current.width + (event.clientX - current.startX) / current.scale
					)
				);
			}
		},
		[onChange]
	);
	const finish = useCallback((event: PointerEvent<HTMLButtonElement>) => {
		session.current = undefined;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}, []);
	const cancel = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			const { current } = session;
			if (current) {
				onChange(current.width);
			}
			finish(event);
		},
		[finish, onChange]
	);
	const lost = useCallback(() => {
		session.current = undefined;
	}, []);
	const reset = useCallback(
		() => onChange(FILE_COLUMN_WIDTH.default),
		[onChange]
	);
	const key = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			const { current } = session;
			if (event.key === "Escape" && current) {
				event.preventDefault();
				event.stopPropagation();
				onChange(current.width);
				session.current = undefined;
				if (event.currentTarget.hasPointerCapture(current.pointerId)) {
					event.currentTarget.releasePointerCapture(current.pointerId);
				}
				return;
			}
			let next: number;
			if (event.key === "Home") {
				next = FILE_COLUMN_WIDTH.min;
			} else if (event.key === "End") {
				next = FILE_COLUMN_WIDTH.max;
			} else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
				next = width + (event.key === "ArrowLeft" ? -10 : 10);
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			onChange(fileBrowserColumnWidth(next));
		},
		[width, onChange]
	);
	return (
		// biome-ignore lint/a11y/useSemanticElements: A focusable interactive separator supports pointer capture and keyboard column resizing.
		<button
			aria-label={`Resize ${label} column`}
			aria-orientation="vertical"
			aria-valuemax={FILE_COLUMN_WIDTH.max}
			aria-valuemin={FILE_COLUMN_WIDTH.min}
			aria-valuenow={Math.round(width)}
			className="mac-file-column-resize"
			onDoubleClick={reset}
			onKeyDown={key}
			onLostPointerCapture={lost}
			onPointerCancel={cancel}
			onPointerDown={start}
			onPointerMove={move}
			onPointerUp={finish}
			role="separator"
			type="button"
		/>
	);
}

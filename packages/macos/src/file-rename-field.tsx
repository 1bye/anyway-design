import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { fileRenameError, fileRenameSelection } from "./file-rename";
import type { MacFile } from "./files";

function resizeEditor(element: HTMLInputElement | HTMLTextAreaElement) {
	element.style.height = "0px";
	element.style.height = `${element.scrollHeight + 2}px`;
}

export function FileRenameField({
	file,
	multiline = false,
	onCommit,
	onEnd,
	validate,
}: {
	file: MacFile;
	multiline?: boolean;
	onCommit: (id: string, name: string) => void;
	onEnd: () => void;
	validate?: (id: string, name: string) => string | undefined;
}) {
	const [draft, setDraft] = useState(file.name);
	const [error, setError] = useState<string>();
	const errorId = useId();
	const field = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
	const finished = useRef<boolean>(false);
	const composing = useRef(false);
	const attach = useCallback(
		(element: HTMLInputElement | HTMLTextAreaElement | null) => {
			field.current = element;
			if (element) {
				element.focus({ preventScroll: true });
				element.setSelectionRange(
					0,
					fileRenameSelection(file.name, file.kind === "folder")
				);
				element.scrollIntoView({ block: "nearest", inline: "nearest" });
			}
		},
		[file.name, file.kind]
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: Draft text changes textarea scrollHeight without changing its current height.
	useLayoutEffect(() => {
		const element = field.current;
		if (multiline && element) {
			resizeEditor(element);
		}
	}, [multiline, draft]);
	useLayoutEffect(() => {
		const element = field.current;
		if (!(multiline && element)) {
			return;
		}
		let width = element.clientWidth;
		const observer = new ResizeObserver(() => {
			if (element.clientWidth !== width) {
				width = element.clientWidth;
				resizeEditor(element);
			}
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [multiline]);
	const end = useCallback(
		(restoreFocus: boolean, commit: boolean) => {
			// biome-ignore lint/suspicious/noUnnecessaryConditions: Enter can focus the row and synchronously trigger blur before this editor unmounts.
			if (finished.current) {
				return;
			}
			const problem = commit
				? (fileRenameError(draft) ?? validate?.(file.id, draft))
				: undefined;
			if (problem) {
				setError(problem);
				return;
			}
			finished.current = true;
			const target =
				field.current
					?.closest(".mac-file-grid-item")
					?.querySelector<HTMLElement>("[data-file-id]") ??
				field.current?.closest<HTMLElement>("tr[data-file-id]");
			if (commit && draft !== file.name) {
				onCommit(file.id, draft);
			}
			onEnd();
			if (restoreFocus) {
				target?.focus({ preventScroll: true });
			}
		},
		[draft, file.id, file.name, onCommit, onEnd, validate]
	);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			event.stopPropagation();
			if (
				event.nativeEvent.isComposing ||
				composing.current ||
				event.keyCode === 229
			) {
				return;
			}
			if (event.key === "Enter" || event.key === "Escape") {
				event.preventDefault();
				end(true, event.key === "Enter");
			}
		},
		[end]
	);
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setDraft(event.target.value);
			setError(undefined);
		},
		[]
	);
	const blur = useCallback(() => end(false, true), [end]);
	const compositionStart = useCallback(() => {
		composing.current = true;
	}, []);
	const compositionEnd = useCallback(() => {
		composing.current = false;
	}, []);
	const props = {
		"aria-describedby": error ? errorId : undefined,
		"aria-invalid": Boolean(error),
		"aria-label": `Rename ${file.name}`,
		autoCapitalize: "off",
		autoComplete: "off",
		className: "mac-file-rename-input",
		onBlur: blur,
		onChange: change,
		onCompositionEnd: compositionEnd,
		onCompositionStart: compositionStart,
		onKeyDown: keyDown,
		ref: attach,
		spellCheck: false,
		value: draft,
	};
	return (
		<div
			className="mac-file-rename"
			data-folder={file.kind === "folder" || undefined}
			data-multiline={multiline}
		>
			{multiline ? (
				<textarea {...props} rows={1} wrap="soft" />
			) : (
				<input {...props} type="text" />
			)}
			{error ? (
				<span className="mac-file-rename-error" id={errorId} role="alert">
					{error}
				</span>
			) : null}
		</div>
	);
}

import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { fileInfoNameError, type MacFileInfoItem } from "./file-info-model";
import type { MacFileRenameProps } from "./file-rename";

export function GetInfoNameField({
	file,
	onRename,
	validateRename,
}: {
	file: MacFileInfoItem;
} & Pick<MacFileRenameProps, "onRename" | "validateRename">) {
	const [draft, setDraft] = useState(file.name);
	const [error, setError] = useState<string>();
	const errorId = useId();
	const field = useRef<HTMLInputElement | null>(null);
	const submitted = useRef<string | null>(null);
	useLayoutEffect(() => {
		setDraft(file.name);
		setError(undefined);
		submitted.current = null;
	}, [file.name]);
	const change = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		submitted.current = null;
		setDraft(event.target.value);
		setError(undefined);
	}, []);
	const commit = useCallback(() => {
		if (
			!onRename ||
			file.locked ||
			draft === file.name ||
			submitted.current === draft
		) {
			return;
		}
		try {
			const problem = fileInfoNameError(file, draft, validateRename);
			if (problem) {
				setError(problem);
				return;
			}
			submitted.current = draft;
			onRename(file.id, draft);
			setError(undefined);
		} catch (reason) {
			submitted.current = null;
			setError(
				reason instanceof Error
					? reason.message
					: "The name could not be changed."
			);
		}
	}, [draft, file, onRename, validateRename]);
	const key = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			if (event.nativeEvent.isComposing || event.keyCode === 229) {
				return;
			}
			if (event.key === "Enter") {
				event.preventDefault();
				event.stopPropagation();
				if (!event.repeat) {
					commit();
					field.current?.select();
				}
			} else if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				setDraft(file.name);
				setError(undefined);
				submitted.current = null;
			}
		},
		[commit, file.name]
	);
	return (
		<div className="mac-get-info-name">
			<input
				aria-describedby={error ? errorId : undefined}
				aria-invalid={Boolean(error)}
				aria-label="Name & Extension"
				autoCapitalize="off"
				autoComplete="off"
				disabled={file.locked}
				onBlur={commit}
				onChange={change}
				onKeyDown={key}
				readOnly={!onRename}
				ref={field}
				spellCheck={false}
				value={draft}
			/>
			{error ? (
				<p id={errorId} role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}

import { Dialog } from "@base-ui/react/dialog";
import {
	type ChangeEvent,
	type FocusEvent,
	type FormEvent,
	type RefObject,
	useCallback,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { MacButton, MacTextField } from "./controls";
import { useMacOSPortal } from "./environment";
import { fileNewFolderError, fileNewFolderName } from "./file-new-folder";

export interface MacNewFolderPanelProps {
	active?: boolean;
	autoFocus?: boolean;
	initialName?: string;
	items: readonly { id?: string; name: string }[];
	onBusyChange?: (busy: boolean) => void;
	onCancel: () => void;
	onCreate: (name: string) => void | Promise<void>;
	parentName: string;
}

export function MacNewFolderPanel({
	active = true,
	autoFocus = true,
	initialName,
	items,
	onBusyChange,
	onCancel,
	onCreate,
	parentName,
}: MacNewFolderPanelProps) {
	const [name, setName] = useState(
		() => initialName ?? fileNewFolderName(items)
	);
	const [failure, setFailure] = useState<string>();
	const [busy, setBusy] = useState(false);
	const pending = useRef<boolean>(false);
	const field = useRef<HTMLInputElement | null>(null);
	const id = useId();
	const errorId = useId();
	const invalid = busy ? undefined : fileNewFolderError(name, items);
	const error = invalid ?? failure;
	const attach = useCallback(
		(element: HTMLInputElement | null) => {
			field.current = element;
			if (autoFocus && element) {
				element.focus({ preventScroll: true });
				element.select();
			}
		},
		[autoFocus]
	);
	useLayoutEffect(() => {
		if (failure && !busy) {
			field.current?.focus({ preventScroll: true });
		}
	}, [failure, busy]);
	const change = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
		setFailure(undefined);
	}, []);
	const select = useCallback(
		(event: FocusEvent<HTMLInputElement>) => event.currentTarget.select(),
		[]
	);
	const submit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			event.stopPropagation();
			// biome-ignore lint/suspicious/noUnnecessaryConditions: Another submit can set this mutable ref while creation is awaiting the adapter.
			if (pending.current || fileNewFolderError(name, items)) {
				return;
			}
			pending.current = true;
			setBusy(true);
			onBusyChange?.(true);
			setFailure(undefined);
			try {
				await onCreate(name);
			} catch (reason) {
				setFailure(
					reason instanceof Error
						? reason.message
						: "The folder could not be created. Try again."
				);
			} finally {
				pending.current = false;
				setBusy(false);
				onBusyChange?.(false);
			}
		},
		[name, items, onCreate, onBusyChange]
	);
	return (
		<form
			aria-busy={busy}
			aria-label="New Folder"
			className="mac-new-folder-panel"
			data-active={active}
			onSubmit={submit}
		>
			<h2>New Folder</h2>
			<label htmlFor={id}>Name of new folder inside “{parentName}”:</label>
			<MacTextField
				aria-describedby={error ? errorId : undefined}
				aria-invalid={Boolean(error)}
				aria-label="Name of new folder"
				autoCapitalize="off"
				autoComplete="off"
				disabled={busy}
				id={id}
				onChange={change}
				onFocus={select}
				ref={attach}
				spellCheck={false}
				value={name}
			/>
			{error ? (
				<p className="mac-new-folder-error" id={errorId} role="alert">
					{error}
				</p>
			) : null}
			<div className="mac-new-folder-actions">
				<MacButton disabled={busy} onClick={onCancel}>
					Cancel
				</MacButton>
				<MacButton
					disabled={busy || Boolean(invalid)}
					type="submit"
					variant="primary"
				>
					{busy ? "Creating…" : "Create"}
				</MacButton>
			</div>
		</form>
	);
}

export interface MacNewFolderDialogProps
	extends Omit<
		MacNewFolderPanelProps,
		"onCancel" | "onBusyChange" | "autoFocus"
	> {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	returnFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
}

export function MacNewFolderDialog({
	open,
	onOpenChange,
	onCreate,
	returnFocus,
	...props
}: MacNewFolderDialogProps) {
	const container = useMacOSPortal();
	const popup = useRef<HTMLDivElement>(null);
	const busy = useRef<boolean>(false);
	const busyChange = useCallback((value: boolean) => {
		busy.current = value;
	}, []);
	const change = useCallback(
		(value: boolean) => {
			// biome-ignore lint/suspicious/noUnnecessaryConditions: The panel's busy callback updates this ref before Escape can dismiss the modal.
			if (!busy.current) {
				onOpenChange(value);
			}
		},
		[onOpenChange]
	);
	const cancel = useCallback(() => change(false), [change]);
	const create = useCallback(
		async (name: string) => {
			await onCreate(name);
			onOpenChange(false);
		},
		[onCreate, onOpenChange]
	);
	const focus = useCallback(
		() => popup.current?.querySelector<HTMLInputElement>("input") ?? null,
		[]
	);
	return (
		<Dialog.Root disablePointerDismissal onOpenChange={change} open={open}>
			<Dialog.Portal container={container}>
				<Dialog.Backdrop className="mac-file-dialog-backdrop mac-new-folder-backdrop" />
				<Dialog.Popup
					aria-describedby={undefined}
					className="mac-new-folder-popup"
					finalFocus={returnFocus}
					initialFocus={focus}
					ref={popup}
				>
					<Dialog.Title className="mac-file-dialog-sr-only">
						New Folder
					</Dialog.Title>
					<MacNewFolderPanel
						{...props}
						autoFocus={false}
						onBusyChange={busyChange}
						onCancel={cancel}
						onCreate={create}
					/>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

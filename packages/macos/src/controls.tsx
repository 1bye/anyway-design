import {
	type ChangeEvent,
	type ComponentPropsWithRef,
	type KeyboardEvent,
	type MouseEvent,
	useCallback,
} from "react";
import { useControlValue } from "./use-control-value";
import { WindowSymbol } from "./window-symbol";
export interface MacButtonProps extends ComponentPropsWithRef<"button"> {
	size?: "small" | "regular";
	variant?: "default" | "primary";
}
export function MacButton({
	className = "",
	variant = "default",
	size = "regular",
	type = "button",
	...props
}: MacButtonProps) {
	return (
		<button
			className={`mac-button ${className}`}
			data-size={size}
			data-variant={variant}
			type={type}
			{...props}
		/>
	);
}

export interface MacTextFieldProps
	extends Omit<ComponentPropsWithRef<"input">, "size"> {
	size?: "small" | "regular";
}

export function MacTextField({
	className = "",
	size = "regular",
	type = "text",
	...props
}: MacTextFieldProps) {
	return (
		<input
			className={`mac-text-field ${className}`}
			data-size={size}
			type={type}
			{...props}
		/>
	);
}

export interface MacSearchFieldProps
	extends Omit<
		MacTextFieldProps,
		"type" | "value" | "defaultValue" | "onChange"
	> {
	clearLabel?: string;
	defaultValue?: string;
	onSearch?: (query: string) => void;
	onValueChange?: (query: string) => void;
	searchLabel?: string;
	value?: string;
}

export function MacSearchField({
	className = "",
	size = "regular",
	placeholder = "Search",
	clearLabel = "Clear search",
	searchLabel = "Search",
	value,
	defaultValue = "",
	onValueChange,
	onSearch,
	onKeyDown,
	disabled,
	readOnly,
	style,
	ref,
	...props
}: MacSearchFieldProps) {
	const control = useControlValue<string, { isCanceled: boolean }>({
		defaultValue,
		form: props.form,
		inputRef: ref,
		onChange: onValueChange,
		value,
	});
	const query = control.value;
	const update = useCallback(
		(next: string) => control.change(next, { isCanceled: false }),
		[control.change]
	);
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => update(event.target.value),
		[update]
	);
	const clear = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			event.preventDefault();
			control.input.current?.focus();
			update("");
		},
		[control.input, update]
	);
	const search = useCallback(() => {
		control.input.current?.focus();
		onSearch?.(query);
	}, [control.input, onSearch, query]);
	const keyDown = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			onKeyDown?.(event);
			if (event.defaultPrevented || event.nativeEvent.isComposing) {
				return;
			}
			if (event.key === "Enter") {
				if (onSearch) {
					event.preventDefault();
				}
				onSearch?.(query);
			} else if (event.key === "Escape" && query && !readOnly) {
				event.preventDefault();
				update("");
			}
		},
		[onKeyDown, onSearch, query, readOnly, update]
	);
	return (
		<span
			className={`mac-search-field ${className}`}
			data-disabled={disabled || undefined}
			data-readonly={readOnly || undefined}
			data-size={size}
			style={style}
		>
			{onSearch ? (
				<button
					aria-label={searchLabel}
					className="mac-search-icon mac-search-submit"
					disabled={disabled}
					onClick={search}
					tabIndex={-1}
					type="button"
				>
					<WindowSymbol name="search" size={size === "small" ? 12 : 14} />
				</button>
			) : (
				<WindowSymbol
					className="mac-search-icon"
					name="search"
					size={size === "small" ? 12 : 14}
				/>
			)}
			<input
				{...props}
				disabled={disabled}
				onChange={change}
				onKeyDown={keyDown}
				placeholder={placeholder}
				readOnly={readOnly}
				ref={control.inputRef}
				type="search"
				value={query}
			/>
			{query && readOnly ? (
				<span aria-hidden="true" className="mac-search-clear">
					<WindowSymbol name="search-clear" size={size === "small" ? 12 : 15} />
				</span>
			) : null}
			{query && !readOnly ? (
				<button
					aria-label={clearLabel}
					className="mac-search-clear"
					disabled={disabled}
					onClick={clear}
					tabIndex={-1}
					type="button"
				>
					<WindowSymbol name="search-clear" size={size === "small" ? 12 : 15} />
				</button>
			) : null}
		</span>
	);
}
export interface MacSwitchProps {
	checked: boolean;
	disabled?: boolean;
	label: string;
	onCheckedChange: (checked: boolean) => void;
}
export function MacSwitch({
	label,
	checked,
	onCheckedChange,
	disabled = false,
}: MacSwitchProps) {
	const handleCheckedChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onCheckedChange(event.target.checked),
		[onCheckedChange]
	);
	return (
		<label className="mac-switch-label">
			<span>{label}</span>
			<input
				aria-checked={checked}
				checked={checked}
				className="mac-switch"
				disabled={disabled}
				onChange={handleCheckedChange}
				role="switch"
				type="checkbox"
			/>
		</label>
	);
}

import {
	type ChangeEvent,
	type ComponentPropsWithRef,
	type KeyboardEvent,
	type MouseEvent,
	useCallback,
	useState,
} from "react";
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
	value?: string;
}

export function MacSearchField({
	className = "",
	size = "regular",
	placeholder = "Search",
	clearLabel = "Clear search",
	value,
	defaultValue = "",
	onValueChange,
	onSearch,
	onKeyDown,
	disabled,
	readOnly,
	style,
	...props
}: MacSearchFieldProps) {
	const [internalValue, setInternalValue] = useState(defaultValue);
	const query = value ?? internalValue;
	const update = useCallback(
		(next: string) => {
			if (value === undefined) {
				setInternalValue(next);
			}
			onValueChange?.(next);
		},
		[onValueChange, value]
	);
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => update(event.target.value),
		[update]
	);
	const clear = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			event.currentTarget.parentElement?.querySelector("input")?.focus();
			update("");
		},
		[update]
	);
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
			data-size={size}
			style={style}
		>
			<WindowSymbol className="mac-search-icon" name="search" size={14} />
			<input
				{...props}
				disabled={disabled}
				onChange={change}
				onKeyDown={keyDown}
				placeholder={placeholder}
				readOnly={readOnly}
				type="search"
				value={query}
			/>
			{query && !readOnly ? (
				<button
					aria-label={clearLabel}
					className="mac-search-clear"
					disabled={disabled}
					onClick={clear}
					type="button"
				>
					<WindowSymbol name="search-clear" size={14} />
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

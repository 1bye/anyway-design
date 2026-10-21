import { Autocomplete } from "@base-ui/react/autocomplete";
import { type CSSProperties, type Ref, useCallback, useEffect } from "react";
import { useMacOSPortal } from "./environment";
import { comboBoxPopupOffset } from "./selection-popup-position";
import { useControlValue } from "./use-control-value";
import { WindowSymbol } from "./window-symbol";

export interface MacComboBoxProps
	extends Omit<
		Autocomplete.Root.Props<string>,
		| "children"
		| "defaultValue"
		| "value"
		| "items"
		| "inline"
		| "itemToStringValue"
		| "inputRef"
	> {
	active?: boolean;
	className?: string;
	defaultValue?: string;
	emptyLabel?: string;
	inputRef?: Ref<HTMLInputElement>;
	items: readonly string[];
	label: string;
	placeholder?: string;
	size?: "regular" | "small";
	style?: CSSProperties;
	triggerLabel?: string;
	value?: string;
}

// AppKit combo boxes accept arbitrary text; Autocomplete preserves that form value.
export function MacComboBox({
	items,
	label,
	value,
	defaultValue = "",
	emptyLabel = "No suggestions",
	onValueChange,
	inputRef,
	active = true,
	size = "regular",
	className = "",
	placeholder,
	triggerLabel = `Show suggestions for ${label}`,
	style,
	mode = "none",
	...props
}: MacComboBoxProps) {
	const container = useMacOSPortal();
	const control = useControlValue<string, Autocomplete.Root.ChangeEventDetails>(
		{
			defaultValue,
			form: props.form,
			inputRef,
			onChange: onValueChange,
			value,
		}
	);
	const focusOnOpen = (props.open ?? props.defaultOpen) && !props.disabled;
	useEffect(() => {
		if (focusOnOpen) {
			control.input.current?.focus();
		}
	}, [control.input, focusOnOpen]);
	const change = useCallback(
		(next: string, details: Autocomplete.Root.ChangeEventDetails) => {
			// Escape dismisses suggestions without deleting the editable value.
			if (details.reason === "escape-key") {
				details.cancel();
				return;
			}
			control.change(next, details);
		},
		[control.change]
	);
	return (
		<Autocomplete.Root
			{...props}
			items={items}
			key={control.resetKey}
			mode={mode}
			onValueChange={change}
			value={control.value}
		>
			<Autocomplete.InputGroup
				className={`mac-combo-box ${className}`}
				data-active={active}
				data-size={size}
				style={style}
			>
				<Autocomplete.Input
					aria-label={label}
					className="mac-combo-input"
					placeholder={placeholder}
					ref={control.inputRef}
				/>
				<Autocomplete.Trigger
					aria-label={triggerLabel}
					className="mac-combo-trigger"
				>
					<WindowSymbol name="chevron-down" size={10} />
				</Autocomplete.Trigger>
			</Autocomplete.InputGroup>
			<Autocomplete.Portal container={container}>
				<Autocomplete.Positioner
					align="start"
					alignOffset={-10}
					className="mac-menu-positioner"
					sideOffset={comboBoxPopupOffset(
						mode === "none" || mode === "inline" ? items : [],
						control.value ?? "",
						size
					)}
				>
					<Autocomplete.Popup className="mac-menu-popup mac-combo-popup">
						<Autocomplete.Empty className="mac-combo-empty">
							{emptyLabel}
						</Autocomplete.Empty>
						<Autocomplete.List className="mac-selection-list">
							{(item: string) => (
								<Autocomplete.Item
									className="mac-menu-item mac-combo-item"
									data-current={item === control.value}
									key={item}
									value={item}
								>
									{item}
								</Autocomplete.Item>
							)}
						</Autocomplete.List>
					</Autocomplete.Popup>
				</Autocomplete.Positioner>
			</Autocomplete.Portal>
		</Autocomplete.Root>
	);
}

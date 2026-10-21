import { Select } from "@base-ui/react/select";
import { type CSSProperties, Fragment } from "react";
import { useMacOSPortal } from "./environment";
import { popUpButtonPopupOffset } from "./selection-popup-position";
import { useControlValue } from "./use-control-value";
import { WindowSymbol } from "./window-symbol";

export interface MacPopUpOption {
	disabled?: boolean;
	label: string;
	separatorBefore?: boolean;
	value: string;
}

export interface MacPopUpButtonProps
	extends Omit<Select.Root.Props<string>, "children" | "items" | "multiple"> {
	active?: boolean;
	className?: string;
	items: readonly MacPopUpOption[];
	label: string;
	placeholder?: string;
	size?: "regular" | "small";
	style?: CSSProperties;
}

export function MacPopUpButton({
	items,
	label,
	value,
	defaultValue,
	onValueChange,
	inputRef,
	active = true,
	size = "regular",
	className = "",
	placeholder = "Choose…",
	style,
	...props
}: MacPopUpButtonProps) {
	const container = useMacOSPortal();
	const control = useControlValue<
		string | null,
		Select.Root.ChangeEventDetails
	>({
		defaultValue: defaultValue ?? null,
		form: props.form,
		inputRef,
		onChange: onValueChange,
		value,
	});
	return (
		<Select.Root
			modal={false}
			{...props}
			inputRef={control.inputRef}
			items={items}
			onValueChange={control.change}
			value={control.value}
		>
			<Select.Trigger
				aria-label={label}
				className={`mac-popup-trigger ${className}`}
				data-active={active}
				data-size={size}
				style={style}
			>
				<Select.Value className="mac-popup-value" placeholder={placeholder} />
				<Select.Icon className="mac-popup-icon">
					<WindowSymbol name="chevron-up-down" size={14} />
				</Select.Icon>
			</Select.Trigger>
			<Select.Portal container={container}>
				<Select.Positioner
					align="start"
					alignItemWithTrigger={false}
					alignOffset={-11.5}
					className="mac-menu-positioner"
					sideOffset={popUpButtonPopupOffset(
						items,
						control.value ?? null,
						size
					)}
				>
					<Select.Popup className="mac-menu-popup mac-selection-popup">
						<Select.ScrollUpArrow className="mac-selection-scroll mac-selection-scroll-up">
							<WindowSymbol name="chevron-down" size={10} />
						</Select.ScrollUpArrow>
						<Select.List className="mac-selection-list">
							{items.map((item) => (
								<Fragment key={item.value}>
									{item.separatorBefore ? (
										<Select.Separator className="mac-menu-separator" />
									) : null}
									<Select.Item
										className="mac-menu-item mac-selection-item"
										disabled={item.disabled}
										value={item.value}
									>
										<span className="mac-selection-check">
											<Select.ItemIndicator>
												<WindowSymbol name="check" size={12} />
											</Select.ItemIndicator>
										</span>
										<Select.ItemText className="mac-popup-option-label">
											{item.label}
										</Select.ItemText>
									</Select.Item>
								</Fragment>
							))}
						</Select.List>
						<Select.ScrollDownArrow className="mac-selection-scroll">
							<WindowSymbol name="chevron-down" size={10} />
						</Select.ScrollDownArrow>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}

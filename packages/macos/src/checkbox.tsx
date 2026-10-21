import { Checkbox } from "@base-ui/react/checkbox";
import type { ReactNode } from "react";
import { useControlValue } from "./use-control-value";
import { WindowSymbol } from "./window-symbol";

export interface MacCheckboxProps
	extends Omit<Checkbox.Root.Props, "children" | "className" | "render"> {
	active?: boolean;
	className?: string;
	label: ReactNode;
}

export function MacCheckbox({
	checked,
	defaultChecked = false,
	onCheckedChange,
	inputRef,
	label,
	active = true,
	className = "",
	...props
}: MacCheckboxProps) {
	const control = useControlValue<boolean, Checkbox.Root.ChangeEventDetails>({
		defaultValue: defaultChecked,
		form: props.form,
		inputRef,
		onChange: onCheckedChange,
		value: checked,
	});
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Base UI renders the associated checkbox input inside this label.
		<label className={`mac-choice ${className}`} data-active={active}>
			<Checkbox.Root
				{...props}
				checked={control.value}
				className="mac-checkbox mac-choice-control"
				inputRef={control.inputRef}
				onCheckedChange={control.change}
			>
				<Checkbox.Indicator className="mac-checkbox-indicator">
					<WindowSymbol name="checkbox-check" size={16} />
					<span className="mac-checkbox-mixed" />
				</Checkbox.Indicator>
			</Checkbox.Root>
			<span>{label}</span>
		</label>
	);
}

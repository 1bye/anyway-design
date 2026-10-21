import { Radio } from "@base-ui/react/radio";
import { RadioGroup, type RadioGroupProps } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";
import { useControlValue } from "./use-control-value";

export interface MacRadioGroupProps
	extends Omit<RadioGroupProps<string>, "className" | "render"> {
	className?: string;
	label: string;
}
export function MacRadioGroup({
	value,
	defaultValue = "",
	onValueChange,
	inputRef,
	label,
	children,
	className = "",
	...props
}: MacRadioGroupProps) {
	const control = useControlValue<string, RadioGroup.ChangeEventDetails>({
		defaultValue,
		form: props.form,
		inputRef,
		onChange: onValueChange,
		value,
	});
	return (
		<RadioGroup
			{...props}
			aria-label={label}
			className={`mac-radio-group ${className}`}
			inputRef={control.inputRef}
			onValueChange={control.change}
			value={control.value}
		>
			{children}
		</RadioGroup>
	);
}

export interface MacRadioProps
	extends Omit<Radio.Root.Props<string>, "children" | "className" | "render"> {
	active?: boolean;
	className?: string;
	label: ReactNode;
}
export function MacRadio({
	label,
	active = true,
	className = "",
	...props
}: MacRadioProps) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Base UI renders the associated radio input inside this label.
		<label className={`mac-choice ${className}`} data-active={active}>
			<Radio.Root {...props} className="mac-radio mac-choice-control">
				<Radio.Indicator className="mac-radio-indicator" />
			</Radio.Root>
			<span>{label}</span>
		</label>
	);
}

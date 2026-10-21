import { NumberField } from "@base-ui/react/number-field";
import { useControlValue } from "./use-control-value";
import { WindowSymbol } from "./window-symbol";

export interface MacStepperProps
	extends Omit<NumberField.Root.Props, "children" | "className" | "render"> {
	active?: boolean;
	className?: string;
	decrementLabel?: string;
	incrementLabel?: string;
	label: string;
}
// shortcut: Repeat timing uses Base UI defaults; tune after a native timing recording.
export function MacStepper({
	active = true,
	value,
	defaultValue,
	onValueChange,
	inputRef,
	label,
	incrementLabel = `Increase ${label}`,
	decrementLabel = `Decrease ${label}`,
	className = "",
	...props
}: MacStepperProps) {
	const control = useControlValue<
		number | null,
		NumberField.Root.ChangeEventDetails
	>({
		defaultValue: defaultValue ?? null,
		form: props.form,
		inputRef,
		onChange: onValueChange,
		value,
	});
	return (
		<NumberField.Root
			{...props}
			className={`mac-stepper ${className}`}
			data-active={active}
			inputRef={control.inputRef}
			key={control.resetKey}
			onValueChange={control.change}
			value={control.value}
		>
			<NumberField.Input
				aria-label={label}
				className="mac-stepper-input mac-text-field"
			/>
			<span className="mac-stepper-buttons">
				<NumberField.Increment
					aria-label={incrementLabel}
					className="mac-stepper-increment"
				>
					<WindowSymbol name="stepper-chevron-down" size={16} />
				</NumberField.Increment>
				<NumberField.Decrement
					aria-label={decrementLabel}
					className="mac-stepper-decrement"
				>
					<WindowSymbol name="stepper-chevron-down" size={16} />
				</NumberField.Decrement>
			</span>
		</NumberField.Root>
	);
}

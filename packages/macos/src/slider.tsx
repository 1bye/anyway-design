import { Slider } from "@base-ui/react/slider";
import type { Ref } from "react";
import { sliderTickCovered, sliderTickPositions } from "./slider-ticks";
import { useControlValue } from "./use-control-value";

export interface MacSliderProps
	extends Omit<
		Slider.Root.Props<number>,
		"children" | "className" | "render" | "orientation" | "thumbAlignment"
	> {
	active?: boolean;
	className?: string;
	inputRef?: Ref<HTMLInputElement>;
	label: string;
	tickMarks?: number;
}
export function MacSlider({
	value,
	defaultValue,
	onValueChange,
	inputRef,
	label,
	active = true,
	tickMarks = 0,
	className = "",
	...props
}: MacSliderProps) {
	const ticks = sliderTickPositions(tickMarks);
	const control = useControlValue<number, Slider.Root.ChangeEventDetails>({
		defaultValue: defaultValue ?? props.min ?? 0,
		form: props.form,
		inputRef,
		onChange: onValueChange,
		value,
	});
	return (
		<Slider.Root
			{...props}
			className={`mac-slider ${className}`}
			data-active={active}
			data-ticked={ticks.length > 0}
			onValueChange={control.change}
			thumbAlignment="edge"
			value={control.value}
		>
			<Slider.Control className="mac-slider-control">
				<Slider.Track className="mac-slider-track">
					<Slider.Indicator className="mac-slider-fill" />
				</Slider.Track>
				{ticks.length > 0 ? (
					<span aria-hidden="true" className="mac-slider-ticks">
						{ticks.map((position) => (
							<i
								data-covered={sliderTickCovered(
									position,
									control.value ?? 0,
									props.min,
									props.max
								)}
								key={position}
								style={{ left: `${position * 100}%` }}
							/>
						))}
					</span>
				) : null}
				<Slider.Thumb
					aria-label={label}
					className="mac-slider-thumb"
					inputRef={control.inputRef}
				/>
			</Slider.Control>
		</Slider.Root>
	);
}

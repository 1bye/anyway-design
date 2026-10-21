import { Radio } from "@base-ui/react/radio";
import type { ReactNode } from "react";
import { MacRadioGroup, type MacRadioGroupProps } from "./radio";

export interface MacSegmentedItem {
	disabled?: boolean;
	icon?: ReactNode;
	label: string;
	value: string;
}

export interface MacSegmentedControlProps
	extends Omit<MacRadioGroupProps, "children"> {
	items: readonly MacSegmentedItem[];
	size?: "regular" | "small";
}

export function MacSegmentedControl({
	items,
	size = "regular",
	className = "",
	...props
}: MacSegmentedControlProps) {
	return (
		<MacRadioGroup
			{...props}
			className={`mac-segmented-control ${className}`}
			data-size={size}
		>
			{items.map((item) => (
				<Radio.Root
					aria-label={item.label}
					className="mac-segmented-item"
					disabled={item.disabled}
					key={item.value}
					value={item.value}
				>
					{item.icon ?? (
						<span className="mac-segmented-label">{item.label}</span>
					)}
				</Radio.Root>
			))}
		</MacRadioGroup>
	);
}

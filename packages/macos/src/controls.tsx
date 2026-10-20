import {
	type ButtonHTMLAttributes,
	type ChangeEvent,
	useCallback,
} from "react";
export interface MacButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement> {
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

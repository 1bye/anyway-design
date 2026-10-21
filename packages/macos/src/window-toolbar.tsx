import type { ComponentPropsWithRef, ReactNode } from "react";

export function WindowToolbarGroup({
	children,
	label,
}: {
	children: ReactNode;
	label: string;
}) {
	return (
		<fieldset aria-label={label} className="mac-toolbar-group">
			{children}
		</fieldset>
	);
}

export interface WindowToolbarButtonProps
	extends ComponentPropsWithRef<"button"> {
	label: string;
}

export function WindowToolbarButton({
	label,
	children,
	className = "",
	type = "button",
	...props
}: WindowToolbarButtonProps) {
	return (
		<button
			{...props}
			aria-label={label}
			className={`mac-toolbar-button ${className}`}
			title={label}
			type={type}
		>
			{children}
		</button>
	);
}

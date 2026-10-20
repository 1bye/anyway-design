import type { CSSProperties, HTMLAttributes } from "react";
import { NATIVE_SYMBOLS } from "./native-symbols";

export type WindowSymbolName = keyof typeof NATIVE_SYMBOLS;

export interface WindowSymbolProps
	extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
	name: WindowSymbolName;
	size?: number;
}

/** Native alpha mask; the containing button or sidebar row supplies its label. */
export function WindowSymbol({
	name,
	size = 16,
	className = "",
	style,
	...props
}: WindowSymbolProps) {
	return (
		<span
			{...props}
			aria-hidden
			className={`mac-window-symbol ${className}`}
			data-symbol={name}
			style={
				{
					"--mac-symbol-size": `${size}px`,
					maskImage: `url("${NATIVE_SYMBOLS[name]}")`,
					WebkitMaskImage: `url("${NATIVE_SYMBOLS[name]}")`,
					...style,
				} as CSSProperties
			}
		/>
	);
}

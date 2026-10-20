import type { SVGProps } from "react";

// Drawn on a common optical canvas from the Finder reference, not SF Symbols assets.
const SYMBOLS = {
	applications: (
		<g strokeWidth="1.7">
			<path d="m6.7 2.1 1.3 2.4M9.1 2.1l-4.9 8.8M2.6 13.8l.35-.65M1.5 11h7.8M12.5 11h2" />
			<path d="M9.7 6.5c.4 2.1 1.7 4.7 3.5 7.4" />
		</g>
	),
	"chevron-down": <path d="m4 6 4 4.1L12 6" strokeWidth="1.65" />,
	"chevron-left": <path d="M10.3 2.7 5 8l5.3 5.3" />,
	"chevron-right": <path d="m5.7 2.7 5.3 5.3-5.3 5.3" />,
	"chevron-up-down": (
		<path d="m4 6.1 4-3.8 4 3.8m-8 3.8 4 3.8 4-3.8" strokeWidth="1.65" />
	),
	cloud: (
		<path d="M4.1 12.8a3.2 3.2 0 0 1-.6-6.3 4.6 4.6 0 0 1 8.9-1.1 3.8 3.8 0 0 1-.3 7.4Z" />
	),
	desktop: (
		<>
			<rect height="11.2" rx="1.6" width="14" x="1" y="2.4" />
			<path d="M1.3 4.8h13.4" />
			<path d="M4 10.8h8" strokeWidth="1.8" />
		</>
	),
	document: (
		<>
			<path d="M8.2 1.2H4.1c-.9 0-1.4.5-1.4 1.4v10.8c0 .9.5 1.4 1.4 1.4h7.8c.9 0 1.4-.5 1.4-1.4V6.2Z" />
			<path d="M8.2 1.5v3.7c0 .7.3 1 1 1H13" />
		</>
	),
	downloads: (
		<>
			<circle cx="8" cy="8" r="6.25" />
			<path d="M8 4.9v6m-2.4-2.25L8 10.9l2.4-2.25" strokeWidth="1.15" />
		</>
	),
	ellipsis: (
		<g fill="currentColor" stroke="none">
			<circle cx="2.8" cy="8" r="1.25" />
			<circle cx="8" cy="8" r="1.25" />
			<circle cx="13.2" cy="8" r="1.25" />
		</g>
	),
	favorites: (
		<path d="m8 1.3 2 4.4 4.8.5-3.6 3.2 1 4.8L8 11.8l-4.2 2.4 1-4.8L1.2 6.2l4.8-.5Z" />
	),
	group: (
		<g strokeWidth="1.1">
			<path d="M1 1h14M1 8.8h14" />
			<rect height="3.2" rx=".7" width="3.2" x="1" y="3.5" />
			<rect height="3.2" rx=".7" width="3.2" x="6.4" y="3.5" />
			<rect height="3.2" rx=".7" width="3.2" x="11.8" y="3.5" />
			<rect height="3.2" rx=".7" width="3.2" x="1" y="11.3" />
			<rect height="3.2" rx=".7" width="3.2" x="6.4" y="11.3" />
			<rect height="3.2" rx=".7" width="3.2" x="11.8" y="11.3" />
		</g>
	),
	"icon-view": (
		<g strokeWidth="1.15">
			<rect height="5.1" rx=".65" width="5.1" x="2" y="2" />
			<rect height="5.1" rx=".65" width="5.1" x="8.9" y="2" />
			<rect height="5.1" rx=".65" width="5.1" x="2" y="8.9" />
			<rect height="5.1" rx=".65" width="5.1" x="8.9" y="8.9" />
		</g>
	),
	"list-view": (
		<>
			<path d="M5.7 3.5h8.6M5.7 8h8.6m-8.6 4.5h8.6" />
			<path d="M1.8 3.5h.1M1.8 8h.1m-.1 4.5h.1" strokeWidth="2" />
		</>
	),
	recents: (
		<>
			<circle cx="8" cy="8" r="6.25" />
			<path d="M8 3.7V8H4.2" />
		</>
	),
	search: (
		<>
			<circle cx="6.7" cy="6.7" r="5" />
			<path d="m10.4 10.4 3.8 3.8" strokeWidth="1.6" />
		</>
	),
	settings: (
		<>
			<path d="M1.3 4.2h2.5m4.1 0h6.8M1.3 11.8h6.8m4.1 0h2.5" />
			<circle cx="5.8" cy="4.2" r="2" />
			<circle cx="10.2" cy="11.8" r="2" />
		</>
	),
	share: (
		<g strokeWidth="1.15">
			<path d="M6 5.1H4.4c-1.3 0-2 .7-2 2v5.4c0 1.3.7 2 2 2h7.2c1.3 0 2-.7 2-2V7.1c0-1.3-.7-2-2-2H10" />
			<path d="M8 9.5V.8M5.4 3.4 8 .8l2.6 2.6" />
		</g>
	),
	shared: (
		<>
			<path d="M9.2 3.7H6.8L5.3 2.5H1.9c-.8 0-1.3.5-1.3 1.3v8.8c0 .8.5 1.3 1.3 1.3h11.2c.8 0 1.3-.5 1.3-1.3V8.7M.9 5.4h8" />
			<path
				d="M16 4.8a3.3 3.3 0 1 1-6.6 0 3.3 3.3 0 0 1 6.6 0Zm-2.3-1a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm.7 2.8c0-1-.8-1.4-1.7-1.4s-1.7.4-1.7 1.4c.9.7 2.5.7 3.4 0Z"
				fill="currentColor"
				fillRule="evenodd"
				stroke="none"
			/>
		</>
	),
	tag: (
		<g strokeWidth="1.15">
			<path d="M8.8 1.2h2.9c.6 0 .9.1 1.3.5l1.3 1.5c.4.4.5.7.5 1.3v2.2c0 .5-.2.9-.6 1.3l-6.5 6.5c-.6.6-1.2.6-1.8 0L1.3 9.9c-.6-.6-.6-1.2 0-1.8l6.4-6.4c.4-.4.7-.5 1.1-.5Z" />
			<ellipse
				cx="11.2"
				cy="5"
				fill="currentColor"
				rx=".65"
				ry=".85"
				stroke="none"
			/>
		</g>
	),
} as const;

export type WindowSymbolName = keyof typeof SYMBOLS;

export interface WindowSymbolProps
	extends Omit<SVGProps<SVGSVGElement>, "children" | "name"> {
	name: WindowSymbolName;
	size?: number;
}

/** Decorative symbol: the containing button or sidebar row supplies its label. */
export function WindowSymbol({
	name,
	size = 16,
	className = "",
	...props
}: WindowSymbolProps) {
	return (
		<svg
			fill="none"
			height={size}
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.3}
			viewBox="0 0 16 16"
			width={size}
			{...props}
			aria-hidden
			className={`mac-window-symbol ${className}`}
			focusable="false"
		>
			{SYMBOLS[name]}
		</svg>
	);
}

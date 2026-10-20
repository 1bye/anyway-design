import {
	type CSSProperties,
	createContext,
	type ReactNode,
	type RefObject,
	useContext,
	useRef,
} from "react";

export type MacOSPreset = "sequoia" | "tahoe";
export type MacOSAppearance = "light" | "dark";

export interface MacOSEnvironmentProps {
	accentColor?: string;
	appearance?: MacOSAppearance;
	children: ReactNode;
	className?: string;
	preset?: MacOSPreset;
	reduceMotion?: boolean;
	reduceTransparency?: boolean;
	style?: CSSProperties;
}

const PortalContext = createContext<RefObject<HTMLDivElement | null> | null>(
	null
);

export function useMacOSPortal() {
	return useContext(PortalContext);
}

export function MacOSEnvironment({
	children,
	preset = "tahoe",
	appearance = "light",
	accentColor = "#007aff",
	reduceTransparency = false,
	reduceMotion = false,
	className = "",
	style,
}: MacOSEnvironmentProps) {
	const root = useRef<HTMLDivElement>(null);
	return (
		<PortalContext value={root}>
			<div
				className={`macos ${className}`}
				data-appearance={appearance}
				data-preset={preset}
				data-reduce-motion={reduceMotion || undefined}
				data-reduce-transparency={reduceTransparency || undefined}
				ref={root}
				style={{ ...style, "--mac-accent": accentColor } as CSSProperties}
			>
				{children}
			</div>
		</PortalContext>
	);
}

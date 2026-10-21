import type { ComponentPropsWithRef, CSSProperties } from "react";
import { progressValue } from "./progress-value";

interface ProgressAppearanceProps {
	active?: boolean;
	hidesWhenStopped?: boolean;
	label: string;
	running?: boolean;
	size?: "regular" | "small";
}

export interface MacProgressBarProps
	extends ProgressAppearanceProps,
		Omit<
			ComponentPropsWithRef<"div">,
			| "children"
			| "role"
			| "aria-label"
			| "aria-valuemin"
			| "aria-valuemax"
			| "aria-valuenow"
		> {
	max?: number;
	/** Omit or pass null for indeterminate progress. */
	value?: number | null;
}

export function MacProgressBar({
	active = true,
	className = "",
	hidesWhenStopped = false,
	label,
	max = 100,
	running = true,
	size = "regular",
	style,
	value,
	...props
}: MacProgressBarProps) {
	const progress = progressValue(value, max);
	const hidden = progress.indeterminate && !running && hidesWhenStopped;
	return (
		<div
			{...props}
			aria-hidden={hidden || props["aria-hidden"]}
			aria-label={label}
			aria-valuemax={progress.max}
			aria-valuemin={0}
			aria-valuenow={progress.indeterminate ? undefined : progress.value}
			aria-valuetext={
				props["aria-valuetext"] ??
				(progress.indeterminate && !running ? "Stopped" : undefined)
			}
			className={`mac-progress-bar ${className}`}
			data-active={active}
			data-hidden={hidden}
			data-indeterminate={progress.indeterminate}
			data-running={running}
			data-size={size}
			role="progressbar"
			style={
				{
					...style,
					"--mac-progress-percent": `${progress.percent}%`,
				} as CSSProperties
			}
		>
			<span aria-hidden="true" className="mac-progress-track">
				<span className="mac-progress-fill" />
			</span>
		</div>
	);
}

export interface MacSpinnerProps
	extends ProgressAppearanceProps,
		Omit<
			ComponentPropsWithRef<"span">,
			| "children"
			| "role"
			| "aria-label"
			| "aria-valuemin"
			| "aria-valuemax"
			| "aria-valuenow"
		> {}

const SPOKES = Array.from({ length: 8 }, (_, index) => ({
	id: `spoke-${index}`,
	style: {
		"--mac-spinner-angle": `${index * 45}deg`,
		"--mac-spinner-delay": `${index === 0 ? 0 : (index - 8) * 0.1}s`,
		"--mac-spinner-opacity": index === 0 ? 1 : 0.1 + (index - 1) * (0.9 / 7),
	} as CSSProperties,
}));

export function MacSpinner({
	active = true,
	className = "",
	hidesWhenStopped = false,
	label,
	running = true,
	size = "regular",
	...props
}: MacSpinnerProps) {
	const hidden = !running && hidesWhenStopped;
	return (
		<span
			{...props}
			aria-hidden={hidden || props["aria-hidden"]}
			aria-label={label}
			aria-valuetext={
				props["aria-valuetext"] ?? (running ? "In progress" : "Stopped")
			}
			className={`mac-spinner ${className}`}
			data-active={active}
			data-hidden={hidden}
			data-running={running}
			data-size={size}
			role="progressbar"
		>
			{SPOKES.map((spoke) => (
				<i aria-hidden="true" key={spoke.id} style={spoke.style} />
			))}
		</span>
	);
}

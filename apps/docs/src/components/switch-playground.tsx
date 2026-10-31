import { MacSwitch } from "@anyway-design/macos/controls";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { Code2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { type ChangeEvent, useCallback, useState } from "react";
import { getSwitchExample } from "../lib/switch-example";
import { CopyButton } from "./copy-button";

export function SwitchPlayground() {
	const [checked, setChecked] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [size, setSize] = useState<"regular" | "small">("regular");
	const [appearance, setAppearance] = useState<"light" | "dark">("light");
	const [showCode, setShowCode] = useState(false);
	const code = getSwitchExample({ appearance, checked, disabled, size });

	const reset = useCallback(() => {
		setChecked(true);
		setDisabled(false);
		setSize("regular");
		setAppearance("light");
	}, []);
	const toggleCode = useCallback(() => setShowCode((value) => !value), []);
	const changeSize = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		setSize(event.target.value === "small" ? "small" : "regular");
	}, []);
	const changeAppearance = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			setAppearance(event.target.value === "dark" ? "dark" : "light");
		},
		[]
	);
	const changeDisabled = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setDisabled(event.target.checked);
	}, []);

	return (
		<section
			aria-label="Interactive switch playground"
			className="docs-playground not-prose my-6 overflow-hidden rounded-xl border bg-fd-card text-fd-card-foreground"
		>
			<div className="flex items-center justify-between border-b px-4 py-2 text-sm">
				<span>Live preview</span>
				<div className="flex items-center gap-2">
					<button
						aria-controls="switch-code"
						aria-expanded={showCode}
						className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-fd-accent aria-expanded:bg-fd-accent"
						onClick={toggleCode}
						type="button"
					>
						<Code2 aria-hidden="true" size={15} /> Code
					</button>
					<button
						aria-label="Reset playground"
						className="rounded-md p-2 hover:bg-fd-accent"
						onClick={reset}
						title="Reset playground"
						type="button"
					>
						<RotateCcw aria-hidden="true" size={14} />
					</button>
				</div>
			</div>
			<div
				className="flex min-h-72 flex-col items-center justify-center gap-6 bg-fd-muted/30 px-4 py-8"
				data-appearance={appearance}
			>
				<span className="text-fd-muted-foreground text-xs">
					A small setting. A clear choice.
				</span>
				<MacOSEnvironment appearance={appearance} className="w-full max-w-sm">
					<div className="overflow-hidden rounded-xl border border-(--mac-line) bg-(--mac-surface) text-(--mac-text) shadow-sm">
						<div className="flex flex-col gap-1 border-(--mac-line) border-b p-5 text-sm">
							<strong>Make room for what matters.</strong>
							<span className="text-(--mac-secondary) text-xs">
								Keep a little more in the loop.
							</span>
						</div>
						<div className="flex items-center justify-between gap-4 p-5">
							<span className="flex flex-col gap-1">
								<strong>Notifications</strong>
								<span className="text-(--mac-secondary) text-xs">
									A gentle nudge when something changes.
								</span>
							</span>
							<MacSwitch
								aria-label="Preview notifications"
								checked={checked}
								disabled={disabled}
								label=""
								onCheckedChange={setChecked}
								size={size}
							/>
						</div>
					</div>
				</MacOSEnvironment>
				<span aria-live="polite" className="text-fd-muted-foreground text-xs">
					Notifications {checked ? "on" : "off"}
					{disabled ? " · Control disabled" : ""}
				</span>
			</div>
			<div className="flex flex-wrap items-center gap-4 border-t p-4 text-fd-muted-foreground text-xs">
				<span className="flex items-center gap-2">
					<SlidersHorizontal aria-hidden="true" size={14} /> Make it yours
				</span>
				<label className="flex items-center gap-2">
					Size
					<select
						aria-label="Size"
						className="rounded-md border bg-fd-background p-1.5 text-fd-foreground"
						onChange={changeSize}
						value={size}
					>
						<option value="regular">Regular</option>
						<option value="small">Small</option>
					</select>
				</label>
				<label className="flex items-center gap-2">
					Appearance
					<select
						aria-label="Appearance"
						className="rounded-md border bg-fd-background p-1.5 text-fd-foreground"
						onChange={changeAppearance}
						value={appearance}
					>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
				</label>
				<label className="flex items-center gap-2">
					<input checked={disabled} onChange={changeDisabled} type="checkbox" />
					Disabled
				</label>
			</div>
			<div
				className="border-t bg-fd-muted/30"
				hidden={!showCode}
				id="switch-code"
			>
				<div className="flex items-center justify-between border-b px-4 py-2 text-fd-muted-foreground text-xs">
					<span>your-component.tsx</span>
					<CopyButton text={code} />
				</div>
				<pre className="overflow-auto p-4 text-xs leading-relaxed">
					<code>{code}</code>
				</pre>
			</div>
		</section>
	);
}

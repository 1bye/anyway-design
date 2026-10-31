import { MacSwitch } from "@anyway-design/macos/controls";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import "@anyway-design/macos/styles.css";
import { Code2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { CopyButton } from "../../components/copy-button";
import { PlaygroundChoice } from "../../components/playground-choice";
import { getSwitchExample } from "./switch-example";

const sizeOptions = [
	{ label: "Regular", value: "regular" },
	{ label: "Small", value: "small" },
] as const;
const appearanceOptions = [
	{ label: "Light", value: "light" },
	{ label: "Dark", value: "dark" },
] as const;
const booleanOptions = [
	{ label: "Off", value: false },
	{ label: "On", value: true },
] as const;

export function SwitchPlayground() {
	const [checked, setChecked] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [size, setSize] = useState<"regular" | "small">("regular");
	const [appearance, setAppearance] = useState<"light" | "dark">("light");
	const [showCode, setShowCode] = useState(false);
	const codeId = useId();
	const code = getSwitchExample({ appearance, checked, disabled, size });

	const reset = useCallback(() => {
		setChecked(true);
		setDisabled(false);
		setSize("regular");
		setAppearance("light");
	}, []);
	const toggleCode = useCallback(() => setShowCode((value) => !value), []);

	return (
		<section
			aria-label="Interactive switch playground"
			className="docs-playground not-prose my-6 overflow-hidden rounded-xl border bg-fd-card text-fd-card-foreground"
		>
			<div className="flex items-center justify-between border-b px-4 py-2 text-sm">
				<span>Live preview</span>
				<div className="flex items-center gap-2">
					<button
						aria-controls={codeId}
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
			<div className="docs-playground-workspace">
				<div
					className="docs-playground-preview flex min-h-72 min-w-0 flex-col items-center justify-center gap-6 bg-fd-muted/30 px-4 py-8"
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
				<section
					aria-label="Switch controls"
					className="docs-playground-controls"
				>
					<div className="mb-4 flex items-center gap-2 text-fd-muted-foreground text-xs">
						<SlidersHorizontal aria-hidden="true" size={14} /> Controls
					</div>
					<div className="grid gap-1.5">
						<PlaygroundChoice
							label="Size"
							onValueChange={setSize}
							options={sizeOptions}
							value={size}
						/>
						<PlaygroundChoice
							label="Appearance"
							onValueChange={setAppearance}
							options={appearanceOptions}
							value={appearance}
						/>
						<PlaygroundChoice
							label="Checked"
							onValueChange={setChecked}
							options={booleanOptions}
							value={checked}
						/>
						<PlaygroundChoice
							label="Disabled"
							onValueChange={setDisabled}
							options={booleanOptions}
							value={disabled}
						/>
					</div>
				</section>
			</div>
			<div className="border-t bg-fd-muted/30" hidden={!showCode} id={codeId}>
				<div className="flex items-center justify-between border-b px-4 py-2 text-fd-muted-foreground text-xs">
					<span>your-component.tsx</span>
					<CopyButton text={code} />
				</div>
				<section
					aria-label="Switch example code"
					className="overflow-auto p-4 text-xs leading-relaxed"
					// biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll overflowing code.
					tabIndex={0}
				>
					<pre>
						<code>{code}</code>
					</pre>
				</section>
			</div>
		</section>
	);
}

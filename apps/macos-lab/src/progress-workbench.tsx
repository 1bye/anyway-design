/** biome-ignore-all lint/performance/noJsxPropsBind: Local workbench controls. */
import { MacButton } from "@1bye/macos/controls";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacProgressBar, MacSpinner } from "@1bye/macos/progress";
import { MacSlider } from "@1bye/macos/slider";
import { useEffect, useState } from "react";

export function ProgressWorkbench({ dark }: { dark: boolean }) {
	const [value, setValue] = useState(35);
	const [running, setRunning] = useState(true);
	const [hidden, setHidden] = useState(false);
	const [small, setSmall] = useState(false);
	const [reduced, setReduced] = useState(false);
	const [simulate, setSimulate] = useState(false);
	const [accent, setAccent] = useState("#007aff");
	const transferring = simulate && value < 100;
	useEffect(() => {
		if (!transferring) {
			return;
		}
		const timer = window.setInterval(
			() => setValue((current) => Math.min(100, current + 5)),
			350
		);
		return () => window.clearInterval(timer);
	}, [transferring]);
	const size = small ? "small" : "regular";
	return (
		<section className="input-workbench progress-workbench">
			<h2>Known work. Unknown duration.</h2>
			<p>
				Change the value or simulate a transfer. Stop and resume the busy
				indicators, try a compact size, or reduce motion.
			</p>
			<div className="window-study-controls">
				<label>
					<input
						checked={running}
						onChange={(event) => setRunning(event.target.checked)}
						type="checkbox"
					/>{" "}
					Running
				</label>
				<label>
					<input
						checked={hidden}
						onChange={(event) => setHidden(event.target.checked)}
						type="checkbox"
					/>{" "}
					Hide when stopped
				</label>
				<label>
					<input
						checked={small}
						onChange={(event) => setSmall(event.target.checked)}
						type="checkbox"
					/>{" "}
					Small
				</label>
				<label>
					<input
						checked={reduced}
						onChange={(event) => setReduced(event.target.checked)}
						type="checkbox"
					/>{" "}
					Reduced motion
				</label>
				<label>
					Accent{" "}
					<select
						aria-label="Workbench accent"
						onChange={(event) => setAccent(event.target.value)}
						value={accent}
					>
						<option value="#007aff">Blue</option>
						<option value="#af52de">Purple</option>
						<option value="#30a46c">Green</option>
					</select>
				</label>
			</div>
			<MacOSEnvironment
				accentColor={accent}
				appearance={dark ? "dark" : "light"}
				className="progress-workbench-surface"
				reduceMotion={reduced}
			>
				<div className="progress-transfer">
					<div>
						<strong>
							{value === 100 ? "Transfer complete" : "Copying sample files…"}
						</strong>
						<span>{value} of 100 MB</span>
					</div>
					<MacProgressBar
						label="File transfer"
						size={size}
						style={{ width: "100%" }}
						value={value}
					/>
					<MacSlider
						label="Transfer progress"
						onValueChange={(next) => {
							setSimulate(false);
							setValue(next);
						}}
						style={{ width: "100%" }}
						value={value}
					/>
					<div className="progress-transfer-actions">
						<MacButton
							onClick={() => {
								setValue(0);
								setSimulate(true);
							}}
						>
							{simulate ? "Restart transfer" : "Simulate transfer"}
						</MacButton>
						<MacButton
							disabled={!transferring}
							onClick={() => setSimulate(false)}
						>
							Pause transfer
						</MacButton>
					</div>
				</div>
				<div className="progress-busy">
					<strong>Checking available space…</strong>
					<MacProgressBar
						hidesWhenStopped={hidden}
						label="Checking available space"
						running={running}
						size={size}
						style={{ width: "100%" }}
					/>
					<div>
						<MacSpinner
							hidesWhenStopped={hidden}
							label="Scanning files"
							running={running}
							size={size}
						/>
						<span>{running ? "Scanning files" : "Scanning stopped"}</span>
					</div>
				</div>
			</MacOSEnvironment>
		</section>
	);
}

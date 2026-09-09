// biome-ignore-all lint/performance/noJsxPropsBind: These un-memoized form controls need the current draft state in their event handlers.
import { Check } from "lucide-react";
import { type Preset, RULES } from "../lib/preset";

export function Rules({
	preset,
	onChange,
}: {
	preset: Preset;
	onChange: (preset: Preset) => void;
}) {
	function toggle(id: string) {
		onChange({
			...preset,
			rules: preset.rules.includes(id)
				? preset.rules.filter((item) => item !== id)
				: [...preset.rules, id],
		});
	}
	return (
		<section aria-label="Coding rules">
			<div className="section-heading">
				<div>
					<h2>Good habits, by default.</h2>
					<p>Choose the way you want your agent to work.</p>
				</div>
				<span className="quiet-label">AGENTS.md</span>
			</div>
			<div className="rule-group">
				<h3>Everyday principles</h3>
				{RULES.map((rule) => (
					<label className="rule-row" key={rule.id}>
						<input
							checked={preset.rules.includes(rule.id)}
							onChange={() => toggle(rule.id)}
							type="checkbox"
						/>
						<span className="rule-checkbox">
							<Check size={13} />
						</span>
						<span>
							<span className="rule-title">{rule.title}</span>
							<span className="rule-description">{rule.description}</span>
						</span>
					</label>
				))}
			</div>
			<fieldset className="rule-group">
				<legend>How should testing work?</legend>
				<div className="choice-grid">
					{(
						[
							[
								"pragmatic",
								"Pragmatic tests",
								"Cover meaningful changes and regressions.",
							],
							["tdd", "Test first", "Fail, implement, verify, then refactor."],
							[
								"project",
								"Follow the project",
								"Use the repository's established approach.",
							],
						] as const
					).map(([value, title, description]) => (
						<label
							className={`choice ${preset.testing === value ? "active" : ""}`}
							key={value}
						>
							<input
								checked={preset.testing === value}
								name="testing"
								onChange={() => onChange({ ...preset, testing: value })}
								type="radio"
								value={value}
							/>
							<span className="choice-title">{title}</span>
							<span>{description}</span>
						</label>
					))}
				</div>
				<label className="field-label" htmlFor="test-command">
					Test command <span>optional</span>
				</label>
				<input
					className="mono text-input"
					id="test-command"
					maxLength={200}
					onChange={(event) =>
						onChange({ ...preset, testCommand: event.target.value })
					}
					placeholder="e.g. bun test"
					value={preset.testCommand}
				/>
			</fieldset>
			<fieldset className="rule-group">
				<legend>How should you collaborate?</legend>
				<div className="choice-grid">
					{(
						[
							[
								"balanced",
								"Use judgment",
								"Proceed with routine work; discuss big changes.",
							],
							[
								"plan-first",
								"Plan together",
								"Agree on the approach before substantial work.",
							],
							[
								"autonomous",
								"Keep moving",
								"Work independently within the agreed scope.",
							],
						] as const
					).map(([value, title, description]) => (
						<label
							className={`choice ${preset.collaboration === value ? "active" : ""}`}
							key={value}
						>
							<input
								checked={preset.collaboration === value}
								name="collaboration"
								onChange={() => onChange({ ...preset, collaboration: value })}
								type="radio"
								value={value}
							/>
							<span className="choice-title">{title}</span>
							<span>{description}</span>
						</label>
					))}
				</div>
			</fieldset>
			<div className="rule-group">
				<label className="field-label" htmlFor="custom-rules">
					Make it yours <span>optional</span>
				</label>
				<p className="field-hint">
					Your own conventions, boundaries, or project notes. These appear
					exactly as written.
				</p>
				<textarea
					className="custom-input text-input"
					id="custom-rules"
					maxLength={100_000}
					onChange={(event) =>
						onChange({ ...preset, custom: event.target.value })
					}
					placeholder="Prefer named exports. Keep explanations concise…"
					rows={5}
					value={preset.custom}
				/>
			</div>
		</section>
	);
}

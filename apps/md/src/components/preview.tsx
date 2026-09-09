// biome-ignore-all lint/performance/noJsxPropsBind: These un-memoized form controls need the current draft state in their event handlers.
import {
	ArrowUpRight,
	Check,
	Copy,
	Download,
	Eye,
	FileText,
	Loader2,
	Minus,
	Terminal,
} from "lucide-react";
import { generateMarkdown, type Preset, SKILLS } from "../lib/preset";

export function SetupPreview({
	preset,
	savedId,
	dirty,
	saving,
	problems,
	onChange,
	onSave,
	onInspect,
	onCopy,
	onDownload,
	origin,
	owned,
}: {
	preset: Preset;
	savedId: string | null;
	dirty: boolean;
	saving: boolean;
	problems: string[];
	onChange: (preset: Preset) => void;
	onSave: () => void;
	onInspect: () => void;
	onCopy: (text: string) => void;
	onDownload: (name: string, content: string) => void;
	origin: string;
	owned: boolean;
}) {
	const markdown = generateMarkdown(preset);
	const selected = SKILLS.filter((skill) => preset.skills.includes(skill.id));
	const command = `npx --yes ${origin}/cli.tgz ${origin}/p/${savedId}`;
	return (
		<aside aria-label="Your setup" className="setup-panel" id="your-setup">
			<div className="setup-header">
				<span className="setup-state">
					{savedId && !dirty ? (
						<>
							<Check size={12} /> Saved
						</>
					) : (
						<>
							<span className="draft-dot" /> Draft
						</>
					)}
				</span>
			</div>
			<div className="setup-section">
				<div className="mini-heading">
					<span>Skills</span>
					<span>{selected.length.toString().padStart(2, "0")}</span>
				</div>
				{selected.length ? (
					<ul className="selected-list">
						{selected.map((skill) => (
							<li key={skill.id}>
								<span className="selected-skill-dot" />
								<span>{skill.title}</span>
								<button
									aria-label={`Remove ${skill.title} from setup`}
									className="remove-skill"
									onClick={() =>
										onChange({
											...preset,
											skills: preset.skills.filter((id) => id !== skill.id),
										})
									}
									type="button"
								>
									<Minus size={14} />
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className="field-hint">
						Pick a skill, or keep this a rules-only setup.
					</p>
				)}
			</div>
			<div className="setup-section preview-section">
				<div className="mini-heading">
					<span>
						<FileText size={14} /> AGENTS.md
					</span>
					<button
						aria-label="Preview full AGENTS.md"
						className="text-button"
						onClick={onInspect}
						type="button"
					>
						<Eye size={14} /> Preview
					</button>
				</div>
				<pre className="markdown-mini">{markdown}</pre>
			</div>
			{problems.map((problem) => (
				<p className="inline-warning" key={problem} role="alert">
					{problem}
				</p>
			))}
			<button
				className="primary-button save-button"
				disabled={saving || !preset.name.trim() || problems.length > 0}
				onClick={onSave}
				type="button"
			>
				{saving ? (
					<>
						<Loader2 className="spin" size={16} /> Saving setup…
					</>
				) : (
					<>
						{owned ? "Update setup" : "Save setup"}
						<ArrowUpRight size={17} />
					</>
				)}
			</button>
			{savedId && !dirty ? (
				<div className="install-box">
					<div>
						<span>
							<Terminal size={14} /> YOUR SECOND COMMAND
						</span>
						<button
							aria-label="Copy install command"
							className="terminal-copy"
							onClick={() => onCopy(command)}
							type="button"
						>
							<Copy size={14} />
						</button>
					</div>
					<code>{command}</code>
					<button
						className="terminal-link"
						onClick={() => onCopy(`${origin}/p/${savedId}`)}
						type="button"
					>
						Copy share link <ArrowUpRight size={12} />
					</button>
				</div>
			) : null}
			<div className="export-row">
				<button onClick={() => onDownload("AGENTS.md", markdown)} type="button">
					<Download size={14} /> AGENTS.md
				</button>
				<button
					onClick={() =>
						onDownload(
							"anyway-preset.json",
							`${JSON.stringify(preset, null, 2)}\n`
						)
					}
					type="button"
				>
					<Download size={14} /> Preset JSON
				</button>
			</div>
		</aside>
	);
}

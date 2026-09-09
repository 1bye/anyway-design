// biome-ignore-all lint/complexity/noVoid: Event and effect tasks handle their own errors; void marks intentional asynchronous dispatch.
// biome-ignore-all lint/performance/noJsxPropsBind: These un-memoized form controls need the current draft state in their event handlers.
import {
	ArrowUpRight,
	Check,
	Code2,
	FileText,
	FlaskConical,
	Layers2,
	Plus,
	Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES, SKILLS } from "../lib/preset";
import { Dialog } from "./dialog";

type Skill = (typeof SKILLS)[number];
const categoryIcons = {
	Documents: FileText,
	Frontend: Code2,
	Testing: FlaskConical,
	Workflow: Layers2,
};

export function Skills({
	selected,
	onToggle,
}: {
	selected: string[];
	onToggle: (id: string) => void;
}) {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("All skills");
	const [visible, setVisible] = useState(6);
	const [inspected, setInspected] = useState<Skill | null>(null);
	const query = search.toLowerCase().trim();
	const results = SKILLS.filter(
		(skill) =>
			(category === "All skills" || skill.category === category) &&
			`${skill.title} ${skill.description} ${skill.repo} ${skill.tag}`
				.toLowerCase()
				.includes(query)
	);
	return (
		<section aria-label="Skill catalog">
			<div className="search-field">
				<Search aria-hidden="true" size={18} />
				<input
					aria-label="Search skills"
					onChange={(event) => {
						setSearch(event.target.value);
						setVisible(6);
					}}
					placeholder="Search skills, tools, or authors…"
					type="search"
					value={search}
				/>
			</div>
			<fieldset aria-label="Filter skills" className="filter-rail">
				{CATEGORIES.map((item) => (
					<button
						aria-pressed={category === item}
						className="filter-chip"
						key={item}
						onClick={() => {
							setCategory(item);
							setVisible(6);
						}}
						type="button"
					>
						{item}
					</button>
				))}
			</fieldset>
			<p aria-live="polite" className="sr-only">
				{results.length} skills found.
			</p>
			<div className="skill-grid">
				{results.slice(0, visible).map((skill) => (
					<SkillCard
						key={skill.id}
						onInspect={() => setInspected(skill)}
						onToggle={() => onToggle(skill.id)}
						selected={selected.includes(skill.id)}
						skill={skill}
					/>
				))}
			</div>
			{results.length === 0 ? (
				<div className="empty-state">
					<Search size={24} />
					<h2>No skills found.</h2>
					<p>Try another search or category.</p>
					<button
						className="secondary-button"
						onClick={() => {
							setSearch("");
							setCategory("All skills");
						}}
						type="button"
					>
						Clear filters
					</button>
				</div>
			) : null}
			{results.length > visible ? (
				<button
					className="show-more secondary-button"
					onClick={() => setVisible((count) => count + 6)}
					type="button"
				>
					Show more skills <Plus size={15} />
				</button>
			) : null}
			{inspected ? (
				<SkillDetails
					onClose={() => setInspected(null)}
					onToggle={() => onToggle(inspected.id)}
					selected={selected.includes(inspected.id)}
					skill={inspected}
				/>
			) : null}
		</section>
	);
}

function SkillCard({
	skill,
	selected,
	onToggle,
	onInspect,
}: {
	skill: Skill;
	selected: boolean;
	onToggle: () => void;
	onInspect: () => void;
}) {
	const Icon =
		categoryIcons[skill.category as keyof typeof categoryIcons] ?? Code2;
	return (
		<article className={`skill-card ${selected ? "selected" : ""}`}>
			<div className="card-top">
				<span className={`skill-symbol symbol-${skill.category.toLowerCase()}`}>
					<Icon size={21} strokeWidth={1.5} />
				</span>
				<button
					aria-label={`${selected ? "Remove" : "Add"} ${skill.title}`}
					aria-pressed={selected}
					className="selection-button"
					onClick={onToggle}
					type="button"
				>
					{selected ? <Check size={16} /> : <Plus size={16} />}
				</button>
			</div>
			<h2>
				<button className="title-button" onClick={onInspect} type="button">
					{skill.title}
				</button>
			</h2>
			<p className="skill-description">{skill.description}</p>
			<div className="card-bottom">
				<a
					aria-label={`${skill.repo} source on GitHub (opens in new tab)`}
					href={`https://github.com/${skill.repo}/tree/${skill.revision}/${skill.path}`}
					rel="noopener noreferrer"
					target="_blank"
				>
					{skill.repo.split("/")[0]}
					<ArrowUpRight size={12} />
				</a>
				<span className="tag">{skill.tag}</span>
			</div>
		</article>
	);
}

function SkillDetails({
	skill,
	selected,
	onToggle,
	onClose,
}: {
	skill: Skill;
	selected: boolean;
	onToggle: () => void;
	onClose: () => void;
}) {
	const [content, setContent] = useState("Loading skill instructions…");
	useEffect(() => {
		const controller = new AbortController();
		async function load() {
			try {
				const response = await fetch(`/api/skills/${skill.id}`, {
					signal: controller.signal,
				});
				const data = (await response.json()) as {
					markdown?: string;
					error?: string;
				};
				setContent(data.markdown ?? data.error ?? "Could not load this skill.");
			} catch {
				if (!controller.signal.aborted) {
					setContent(
						"Could not load the instructions. You can read them on GitHub below."
					);
				}
			}
		}
		void load();
		return () => controller.abort();
	}, [skill.id]);
	return (
		<Dialog onClose={onClose} title={skill.title} wide>
			<p className="dialog-description">{skill.description}</p>
			<div className="detail-meta">
				<span>{skill.repo}</span>
				<span>Revision {skill.revision.slice(0, 7)}</span>
			</div>
			<pre className="skill-document">{content}</pre>
			<div className="dialog-actions">
				<a
					className="secondary-button"
					href={`https://github.com/${skill.repo}/blob/${skill.revision}/${skill.path}/SKILL.md`}
					rel="noopener noreferrer"
					target="_blank"
				>
					Read source <ArrowUpRight size={15} />
				</a>
				<button className="primary-button" onClick={onToggle} type="button">
					{selected ? "Remove from setup" : "Add to setup"}
					{selected ? <Check size={16} /> : <Plus size={16} />}
				</button>
			</div>
		</Dialog>
	);
}

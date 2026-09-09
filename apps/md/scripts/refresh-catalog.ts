import { writeFile } from "node:fs/promises";

const sources = [
	[
		"vercel-labs/agent-skills",
		"skills/react-best-practices",
		"React best practices",
		"Frontend",
		"React",
		"Performance patterns for React and Next.js, from the team at Vercel.",
	],
	[
		"vercel-labs/agent-skills",
		"skills/web-design-guidelines",
		"Web design guidelines",
		"Frontend",
		"UI",
		"Review interfaces for accessibility, usability, and thoughtful interaction.",
	],
	[
		"anthropics/skills",
		"skills/frontend-design",
		"Frontend design",
		"Frontend",
		"Design",
		"Build distinctive, considered interfaces with attention to typography and layout.",
	],
	[
		"anthropics/skills",
		"skills/webapp-testing",
		"Web app testing",
		"Testing",
		"Playwright",
		"Explore and verify local web applications with browser automation.",
	],
	[
		"anthropics/skills",
		"skills/skill-creator",
		"Skill creator",
		"Workflow",
		"Skills",
		"Create, refine, and evaluate reusable skills for your agent.",
	],
	[
		"anthropics/skills",
		"skills/pdf",
		"PDF toolkit",
		"Documents",
		"PDF",
		"Read, extract, combine, and create PDF documents.",
	],
	[
		"anthropics/skills",
		"skills/docx",
		"Word documents",
		"Documents",
		"DOCX",
		"Create and edit structured Word documents with polished formatting.",
	],
	[
		"anthropics/skills",
		"skills/xlsx",
		"Spreadsheets",
		"Documents",
		"XLSX",
		"Work with spreadsheets, formulas, formatting, and tabular data.",
	],
	[
		"obra/superpowers",
		"skills/systematic-debugging",
		"Systematic debugging",
		"Workflow",
		"Debugging",
		"Find the root cause before reaching for a fix. Follow the evidence.",
	],
	[
		"obra/superpowers",
		"skills/test-driven-development",
		"Test-driven development",
		"Testing",
		"TDD",
		"Work through the red, green, refactor cycle one behavior at a time.",
	],
	[
		"obra/superpowers",
		"skills/brainstorming",
		"Brainstorming",
		"Workflow",
		"Planning",
		"Explore requirements and design choices before committing to an approach.",
	],
	[
		"obra/superpowers",
		"skills/writing-plans",
		"Writing plans",
		"Workflow",
		"Planning",
		"Turn an agreed design into concrete, verifiable implementation steps.",
	],
	[
		"obra/superpowers",
		"skills/verification-before-completion",
		"Verify before done",
		"Testing",
		"Quality",
		"Run the relevant checks and support completion claims with evidence.",
	],
	[
		"obra/superpowers",
		"skills/requesting-code-review",
		"Request a code review",
		"Workflow",
		"Review",
		"Prepare work for review and catch issues before they spread.",
	],
] as const;

const revisions = new Map<string, string>();
const catalog: {
	category: string;
	description: string;
	id: string;
	name: string;
	path: string;
	repo: string;
	revision: string;
	tag: string;
	title: string;
}[] = [];
const NAME = /^name:\s*["']?([^\r\n"']+)/m;
for (const [repo, path, title, category, tag, description] of sources) {
	let revision = revisions.get(repo);
	if (!revision) {
		// biome-ignore lint/performance/noAwaitInLoops: Resolve each repository once and avoid bursting GitHub requests.
		const response = await fetch(
			`https://api.github.com/repos/${repo}/commits/HEAD`
		);
		if (!response.ok) {
			throw new Error(`Cannot resolve ${repo}: ${response.status}`);
		}
		const commit = (await response.json()) as { sha: string };
		revision = commit.sha;
		revisions.set(repo, revision);
	}
	const response = await fetch(
		`https://raw.githubusercontent.com/${repo}/${revision}/${path}/SKILL.md`
	);
	if (!response.ok) {
		throw new Error(`Missing skill ${repo}/${path}: ${response.status}`);
	}
	const markdown = await response.text();
	const name = NAME.exec(markdown)?.[1]?.trim();
	if (!name) {
		throw new Error(`Missing name: ${path}`);
	}
	catalog.push({
		category,
		description,
		id: `${repo.split("/")[0]}-${path.split("/").at(-1)}`,
		name,
		path,
		repo,
		revision,
		tag,
		title,
	});
}
await writeFile(
	new URL("../src/lib/catalog.json", import.meta.url),
	`${JSON.stringify(catalog, null, 2)}\n`
);
process.stdout.write(`Verified and pinned ${catalog.length} skills.\n`);

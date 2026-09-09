import { z } from "zod";
import catalog from "./catalog.json";

export const SKILLS = catalog;
export const CATEGORIES = [
	"All skills",
	"Frontend",
	"Workflow",
	"Testing",
	"Documents",
] as const;
export const RULES = [
	{
		description: "Solve the task without unrelated rewrites.",
		id: "small-changes",
		section: "Implementation",
		text: "Keep changes focused on the requested task. Preserve unrelated code and behavior.",
		title: "Keep changes focused",
	},
	{
		description: "Follow the project's existing patterns and components.",
		id: "reuse",
		section: "Implementation",
		text: "Inspect existing patterns, utilities, and components before adding new ones. Reuse them where appropriate.",
		title: "Use what is already there",
	},
	{
		description: "No speculative abstractions or extra dependencies.",
		id: "simple",
		section: "Implementation",
		text: "Prefer straightforward code and standard library features. Add abstractions and dependencies only when the current task needs them.",
		title: "Choose the simple solution",
	},
	{
		description: "Use precise types and validate external input.",
		id: "types",
		section: "Implementation",
		text: "Use precise types; avoid unsafe casts and any. Validate external input at system boundaries.",
		title: "Make types meaningful",
	},
	{
		description: "Preserve user input and make recovery possible.",
		id: "errors",
		section: "Implementation",
		text: "Handle expected failures explicitly. Preserve user input and provide actionable error messages and a recovery path.",
		title: "Handle real failure states",
	},
	{
		description: "Semantic HTML, keyboard support, and visible focus.",
		id: "accessible",
		section: "Interface",
		text: "Use semantic HTML, labeled controls, visible keyboard focus, and accessible contrast. Respect reduced-motion preferences.",
		title: "Make interfaces accessible",
	},
	{
		description: "Include narrow viewports and long content.",
		id: "responsive",
		section: "Interface",
		text: "Verify interfaces at narrow and wide viewports, including long content, empty states, loading, and errors.",
		title: "Check the small screen",
	},
	{
		description: "Run relevant checks and report what actually passed.",
		id: "verify",
		section: "Verification",
		text: "Run checks appropriate to the change. Report what was verified, any failures, and any checks that could not run. Do not claim unperformed checks passed.",
		title: "Verify before calling it done",
	},
	{
		description: "Use environment configuration for credentials.",
		id: "secrets",
		section: "Boundaries",
		text: "Never commit credentials, tokens, or private keys. Use environment configuration and avoid exposing secrets in logs.",
		title: "Keep secrets out of source",
	},
	{
		description: "Leave existing work intact; use descriptive commits.",
		id: "git",
		section: "Boundaries",
		text: "Preserve existing uncommitted work. Do not reset history or force-push without explicit authorization. Use concise, descriptive commit messages.",
		title: "Keep Git history intentional",
	},
] as const;

export const presetSchema = z.object({
	collaboration: z.enum(["balanced", "plan-first", "autonomous"]),
	custom: z.string().max(100_000),
	name: z.string().trim().min(1).max(80),
	rules: z
		.array(z.string())
		.max(30)
		.refine(
			(ids) => ids.every((id) => RULES.some((rule) => rule.id === id)),
			"Unknown rule."
		)
		.transform((ids) => [...new Set(ids)]),
	skills: z
		.array(z.string())
		.max(40)
		.refine(
			(ids) => ids.every((id) => SKILLS.some((skill) => skill.id === id)),
			"Choose skills from the catalog."
		)
		.transform((ids) => [...new Set(ids)]),
	target: z.enum(["codex", "claude", "cursor", "universal"]),
	testCommand: z
		.string()
		.max(200)
		.refine(
			(value) => !(value.includes("\n") || value.includes("\r")),
			"Use a single command line."
		),
	testing: z.enum(["pragmatic", "tdd", "project"]),
	version: z.literal(1),
});

export type Preset = z.infer<typeof presetSchema>;
export interface SavedPreset {
	id: string;
	preset: Preset;
	updatedAt: number;
}

export const DEFAULT_PRESET: Preset = {
	collaboration: "balanced",
	custom: "",
	name: "My everyday setup",
	rules: [
		"small-changes",
		"reuse",
		"simple",
		"accessible",
		"verify",
		"secrets",
	],
	skills: [
		"vercel-labs-react-best-practices",
		"anthropics-frontend-design",
		"obra-systematic-debugging",
	],
	target: "codex",
	testCommand: "",
	testing: "pragmatic",
	version: 1,
};

export const TARGETS = {
	claude: "Claude Code",
	codex: "Codex",
	cursor: "Cursor",
	universal: "Universal",
} as const;
export const SKILL_DIRECTORIES = {
	claude: ".claude/skills",
	codex: ".agents/skills",
	cursor: ".cursor/skills",
	universal: ".agents/skills",
} as const;

export function conflicts(preset: Preset): string[] {
	return preset.skills.includes("obra-test-driven-development") &&
		preset.testing !== "tdd"
		? [
				"The TDD skill expects tests first. Select Test first in Rules, or remove that skill.",
			]
		: [];
}

export function generateMarkdown(preset: Preset): string {
	const sections = [
		"# AGENTS.md",
		"<!-- Created with Anyway MD. Adapt project-specific commands as your project evolves. -->",
	];
	for (const section of [
		"Implementation",
		"Interface",
		"Verification",
		"Boundaries",
	]) {
		const rules = RULES.filter(
			(rule) => rule.section === section && preset.rules.includes(rule.id)
		);
		if (rules.length) {
			sections.push(
				`## ${section}\n\n${rules.map((rule) => `- ${rule.text}`).join("\n")}`
			);
		}
	}
	const testing = {
		pragmatic:
			"Add regression tests for bugs and cover meaningful behavior changes. Prefer focused tests over tests that mirror implementation details.",
		project:
			"Follow the project's established testing conventions. Inspect its test configuration and documentation before choosing commands.",
		tdd: "Write a failing test for the intended behavior before implementation. Confirm it fails for the expected reason, make it pass, then refactor.",
	}[preset.testing];
	sections.push(
		`## Testing\n\n- ${testing}${preset.testCommand ? `\n- Test command: ${preset.testCommand}` : "\n- Discover the actual test commands from this repository; do not assume a package manager or test framework."}`
	);
	sections.push(
		`## Collaboration\n\n- ${
			{
				autonomous:
					"Work independently within the agreed scope. Make reasonable routine decisions and ask only when missing information blocks progress or an action needs explicit authorization.",
				balanced:
					"Proceed with routine work. Discuss significant scope changes and ambiguous requirements before implementing them.",
				"plan-first":
					"Explain the proposed approach and resolve material uncertainties before substantial implementation.",
			}[preset.collaboration]
		}`
	);
	const skills = SKILLS.filter((skill) => preset.skills.includes(skill.id));
	if (skills.length) {
		sections.push(
			`## Available skills\n\nUse the relevant installed skill when the task calls for it. Read its SKILL.md before following its workflow.\n\n${skills.map((skill) => `- ${skill.title}: ${SKILL_DIRECTORIES[preset.target]}/${skill.name}/SKILL.md`).join("\n")}`
		);
	}
	if (preset.custom.trim()) {
		sections.push(`## Additional instructions\n\n${preset.custom.trim()}`);
	}
	return `${sections.join("\n\n")}\n`;
}

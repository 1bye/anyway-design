import { afterEach, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitFiles, validatePayload } from "../../../packages/md-cli/bin.mjs";

const temporary: string[] = [];
function folder() {
	const path = mkdtempSync(join(tmpdir(), "md-test-"));
	temporary.push(path);
	return path;
}
afterEach(() => {
	for (const path of temporary.splice(0)) {
		rmSync(path, { force: true, recursive: true });
	}
});

test("installer refuses all writes on a collision, then backs up changes only with --force", () => {
	const root = folder();
	const staged = folder();
	writeFileSync(join(root, "AGENTS.md"), "User's existing instructions");
	writeFileSync(join(staged, "AGENTS.md"), "New instructions");
	writeFileSync(join(staged, ".anyway-md.json"), "{}");
	const paths = [".anyway-md.json", "AGENTS.md"];
	expect(() => commitFiles(root, staged, paths)).toThrow("Nothing changed");
	expect(existsSync(join(root, ".anyway-md.json"))).toBe(false);
	expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe(
		"User's existing instructions"
	);
	const result = commitFiles(root, staged, paths, true);
	expect(readFileSync(join(root, result.backup, "AGENTS.md"), "utf8")).toBe(
		"User's existing instructions"
	);
	expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe(
		"New instructions"
	);
});

test("reapplying identical files is a no-op", () => {
	const root = folder();
	const staged = folder();
	for (const base of [root, staged]) {
		mkdirSync(join(base, "skill"));
		writeFileSync(join(base, "skill", "SKILL.md"), "same");
	}
	expect(commitFiles(root, staged, ["skill"]).changed).toEqual([]);
});

test("installer refuses symbolic-link destinations even with --force", () => {
	const root = folder();
	const staged = folder();
	const external = folder();
	symlinkSync(external, join(root, ".agents"));
	expect(() =>
		commitFiles(root, staged, [".agents/skills/example"], true)
	).toThrow("symbolic link");
	expect(existsSync(join(external, "skills"))).toBe(false);
});

test("failed writes restore the previous files", () => {
	const root = folder();
	const staged = folder();
	writeFileSync(join(root, "AGENTS.md"), "existing");
	writeFileSync(join(staged, "AGENTS.md"), "replacement");
	expect(() =>
		commitFiles(root, staged, ["AGENTS.md", "missing"], true)
	).toThrow();
	expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe("existing");
});

test("untrusted manifests cannot escape skill directories or use moving revisions", () => {
	const skill = {
		name: "example",
		path: "skills/example",
		repo: "owner/repo",
		revision: "a".repeat(40),
	};
	const payload = {
		markdown: "# AGENTS.md",
		preset: { target: "codex", version: 1 },
		skillDirectory: ".agents/skills",
		skills: [skill],
	};
	expect(validatePayload(payload)).toBe(payload);
	for (const change of [
		{ name: "../escape" },
		{ repo: "--config/foo" },
		{ path: "../../escape" },
		{ revision: "main" },
	]) {
		expect(() =>
			validatePayload({ ...payload, skills: [{ ...skill, ...change }] })
		).toThrow();
	}
	expect(() =>
		validatePayload({ ...payload, skillDirectory: "../../outside" })
	).toThrow();
	expect(() =>
		validatePayload({ ...payload, skills: [skill, skill] })
	).toThrow();
});

#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noUnnecessaryConditions: Payload guards and filesystem results are runtime checks, not constants inferred from default arguments.
import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	lstatSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	realpathSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SETUP_PATH = /^\/p\/([a-f0-9]{32})\/?$/;
const SHA = /^[a-f0-9]{40}$/;
const SEGMENT = /^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/;
const DIRECTORIES = [".agents/skills", ".claude/skills", ".cursor/skills"];

export function validatePayload(data) {
	if (
		!data ||
		typeof data !== "object" ||
		typeof data.markdown !== "string" ||
		Buffer.byteLength(data.markdown) > 1_048_576 ||
		!DIRECTORIES.includes(data.skillDirectory) ||
		!Array.isArray(data.skills) ||
		data.skills.length > 40 ||
		!data.preset ||
		data.preset.version !== 1 ||
		!["codex", "claude", "cursor", "universal"].includes(data.preset.target)
	) {
		throw new Error("The server returned an invalid setup.");
	}
	const names = new Set();
	for (const skill of data.skills) {
		if (
			!skill ||
			typeof skill.name !== "string" ||
			!SEGMENT.test(skill.name) ||
			names.has(skill.name) ||
			typeof skill.repo !== "string" ||
			skill.repo.split("/").length !== 2 ||
			!skill.repo.split("/").every((part) => SEGMENT.test(part)) ||
			typeof skill.path !== "string" ||
			!skill.path.split("/").every((part) => SEGMENT.test(part)) ||
			!SHA.test(skill.revision)
		) {
			throw new Error(
				"A skill has an invalid source, name, or pinned revision."
			);
		}
		names.add(skill.name);
	}
	return data;
}

function git(args) {
	const result = spawnSync("git", ["-c", "core.hooksPath=/dev/null", ...args], {
		encoding: "utf8",
		env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
		maxBuffer: 4 * 1024 * 1024,
		timeout: 60_000,
	});
	if (result.error || result.status !== 0) {
		throw new Error(
			`Git could not download the pinned skill. ${result.error?.message ?? result.stderr.trim()}`
		);
	}
}

function assertNoSymlinks(root, relative) {
	let current = root;
	for (const segment of relative.split("/")) {
		current = join(current, segment);
		try {
			if (lstatSync(current).isSymbolicLink()) {
				throw new Error(
					`Refusing to write through a symbolic link: ${current}`
				);
			}
		} catch (error) {
			if (error.code !== "ENOENT") {
				throw error;
			}
		}
	}
}

function validateTree(path, budget = { bytes: 0, files: 0 }) {
	const stat = lstatSync(path);
	if (stat.isSymbolicLink() || !(stat.isFile() || stat.isDirectory())) {
		throw new Error(
			"Skill folders must contain only ordinary files and directories."
		);
	}
	if (stat.isDirectory()) {
		for (const name of readdirSync(path)) {
			validateTree(join(path, name), budget);
		}
	} else {
		budget.bytes += stat.size;
		budget.files += 1;
	}
	if (budget.bytes > 25 * 1024 * 1024 || budget.files > 2000) {
		throw new Error(
			"This skill exceeds the installer limit (25 MB or 2,000 files)."
		);
	}
}

function equalPaths(left, right) {
	const a = lstatSync(left);
	const b = lstatSync(right);
	if (a.isSymbolicLink() || b.isSymbolicLink()) {
		return false;
	}
	if (a.isFile() && b.isFile()) {
		return (
			readFileSync(left).equals(readFileSync(right)) &&
			// biome-ignore lint/suspicious/noBitwiseOperators: POSIX executable permissions are bit flags.
			(a.mode & 0o111) === (b.mode & 0o111)
		);
	}
	if (!(a.isDirectory() && b.isDirectory())) {
		return false;
	}
	const names = readdirSync(left).sort();
	const other = readdirSync(right).sort();
	return (
		names.length === other.length &&
		names.every(
			(name, index) =>
				name === other[index] && equalPaths(join(left, name), join(right, name))
		)
	);
}

function copySkill(source, destination, repository) {
	if (!existsSync(join(source, "SKILL.md"))) {
		throw new Error(`Missing SKILL.md in ${source}.`);
	}
	validateTree(source);
	cpSync(source, destination, { dereference: false, recursive: true });
	for (const name of [
		"LICENSE",
		"LICENSE.md",
		"LICENSE.txt",
		"NOTICE",
		"NOTICE.md",
		"NOTICE.txt",
	]) {
		const license = join(repository, name);
		const target = join(destination, `UPSTREAM-${name}`);
		if (
			existsSync(license) &&
			lstatSync(license).isFile() &&
			!existsSync(target)
		) {
			validateTree(license);
			cpSync(license, target);
		}
	}
}

/** @returns {{ changed: string[], backup: string | null }} */
export function commitFiles(root, staged, paths, force = false) {
	const changed = paths.filter((path) => {
		assertNoSymlinks(root, path);
		return !(
			existsSync(join(root, path)) &&
			equalPaths(join(staged, path), join(root, path))
		);
	});
	const collisions = changed.filter((path) => existsSync(join(root, path)));
	if (collisions.length && !force) {
		throw new Error(
			`Existing files differ: ${collisions.join(", ")}. Nothing changed. Use --force to back them up before replacement.`
		);
	}
	const backup = `.anyway-md/backups/${new Date().toISOString().replaceAll(":", "-")}-${crypto.randomUUID().slice(0, 8)}`;
	assertNoSymlinks(root, backup);
	const copied = [];
	const backedUp = [];
	try {
		for (const path of changed) {
			const destination = join(root, path);
			if (existsSync(destination)) {
				const backupPath = join(root, backup, path);
				mkdirSync(dirname(backupPath), { recursive: true });
				renameSync(destination, backupPath);
				backedUp.push(path);
			}
			mkdirSync(dirname(destination), { recursive: true });
			renameSync(join(staged, path), destination);
			copied.push(path);
		}
	} catch (error) {
		for (const path of copied.reverse()) {
			rmSync(join(root, path), { force: true, recursive: true });
		}
		for (const path of backedUp.reverse()) {
			renameSync(join(root, backup, path), join(root, path));
		}
		throw error;
	}
	return { backup: backedUp.length ? backup : null, changed };
}

export async function install(
	setupUrl,
	{ root = process.cwd(), force = false, dryRun = false } = {}
) {
	const url = new URL(setupUrl);
	if (
		url.username ||
		url.password ||
		(url.protocol !== "https:" &&
			!(
				url.protocol === "http:" &&
				["localhost", "127.0.0.1"].includes(url.hostname)
			))
	) {
		throw new Error("Use an HTTPS setup link (HTTP is allowed on localhost).");
	}
	const match = SETUP_PATH.exec(url.pathname);
	if (!match) {
		throw new Error(
			"Expected a setup link such as https://md.anyway.design/p/<id>."
		);
	}
	const response = await fetch(
		new URL(`/api/presets/${match[1]}`, url.origin),
		{ redirect: "error", signal: AbortSignal.timeout(15_000) }
	);
	if (!response.ok) {
		throw new Error(`The setup could not be loaded (${response.status}).`);
	}
	const body = await response.text();
	if (Buffer.byteLength(body) > 2 * 1024 * 1024) {
		throw new Error("The setup response is too large.");
	}
	const data = validatePayload(JSON.parse(body));
	const files = [
		"AGENTS.md",
		...data.skills.map((skill) => `${data.skillDirectory}/${skill.name}`),
		".anyway-md.json",
	];
	if (data.preset.target === "claude") {
		files.push("CLAUDE.md");
	}
	if (dryRun) {
		return { backup: null, changed: files, dryRun: true };
	}
	const temporary = mkdtempSync(join(tmpdir(), "anyway-md-"));
	const staged = join(temporary, "staged");
	mkdirSync(staged);
	try {
		writeFileSync(join(staged, "AGENTS.md"), data.markdown);
		if (data.preset.target === "claude") {
			writeFileSync(join(staged, "CLAUDE.md"), "@AGENTS.md\n");
		}
		const repos = new Map();
		for (const skill of data.skills) {
			const key = `${skill.repo}@${skill.revision}`;
			let folder = repos.get(key);
			if (!folder) {
				folder = join(temporary, `source-${repos.size}`);
				git([
					"clone",
					"--filter=blob:none",
					"--no-checkout",
					"--depth=1",
					`https://github.com/${skill.repo}.git`,
					folder,
				]);
				git(["-C", folder, "sparse-checkout", "init", "--cone"]);
				const paths = data.skills
					.filter(
						(item) =>
							item.repo === skill.repo && item.revision === skill.revision
					)
					.map((item) => item.path);
				git(["-C", folder, "sparse-checkout", "set", "--", ...paths]);
				git(["-C", folder, "fetch", "--depth=1", "origin", skill.revision]);
				git(["-C", folder, "checkout", "--detach", skill.revision]);
				repos.set(key, folder);
			}
			const source = join(folder, skill.path);
			assertNoSymlinks(folder, skill.path);
			copySkill(source, join(staged, data.skillDirectory, skill.name), folder);
		}
		writeFileSync(
			join(staged, ".anyway-md.json"),
			`${JSON.stringify({ preset: data.preset, skills: data.skills.map(({ name, repo, path, revision }) => ({ name, path, repo, revision })), source: url.href, version: 1 }, null, 2)}\n`
		);
		return {
			...commitFiles(resolve(root), staged, files, force),
			dryRun: false,
		};
	} finally {
		rmSync(temporary, { force: true, recursive: true });
	}
}

async function main() {
	const args = process.argv.slice(2);
	if (args.includes("--help") || !args.length) {
		process.stdout.write(
			"Anyway MD\n\nUsage: anyway-md <setup-url> [--dry-run] [--force]\n\nRequires Node.js 22+ and Git. --force backs up differing files before replacing them.\n"
		);
		return;
	}
	const invalid = args.find(
		(arg) => arg.startsWith("--") && !["--force", "--dry-run"].includes(arg)
	);
	if (invalid) {
		throw new Error(`Unknown option: ${invalid}`);
	}
	const urls = args.filter((arg) => !arg.startsWith("--"));
	if (urls.length !== 1) {
		throw new Error("Provide exactly one setup URL.");
	}
	const result = await install(urls[0], {
		dryRun: args.includes("--dry-run"),
		force: args.includes("--force"),
	});
	process.stdout.write(
		`${result.dryRun ? "Would install" : "Installed"} ${result.changed.length} paths:\n${result.changed.map((path) => `  ${path}`).join("\n")}\n`
	);
	if (result.backup) {
		process.stdout.write(`Previous files saved in ${result.backup}\n`);
	}
	if (!result.dryRun) {
		process.stdout.write(
			"Your agent is ready. Skills keep their upstream licenses and tool requirements.\n"
		);
	}
}

if (
	process.argv[1] &&
	realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	try {
		await main();
	} catch (error) {
		process.stderr.write(`Anyway MD: ${error.message}\n`);
		process.exitCode = 1;
	}
}

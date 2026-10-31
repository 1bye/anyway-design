import assert from "node:assert/strict";
import path from "node:path";
import ts from "typescript";
import {
	PLAYGROUND_ENTRIES,
	PLAYGROUND_ENVIRONMENT,
	playgroundDefaults,
	playgroundEntry,
} from "../src/playground-catalog";
import { playgroundExample } from "../src/playground-examples";

const lab = path.resolve(import.meta.dirname, "..");
const configFile = ts.readConfigFile(
	path.join(lab, "tsconfig.json"),
	ts.sys.readFile
);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, lab);
const options = {
	...config.options,
	noUnusedLocals: true,
	noUnusedParameters: true,
};
const examples = new Map<string, string>();

assert.equal(
	new Set(PLAYGROUND_ENTRIES.map((entry) => entry.id)).size,
	PLAYGROUND_ENTRIES.length
);
assert.equal(playgroundEntry("controls").id, "button");
assert.equal(playgroundEntry("unknown"), PLAYGROUND_ENTRIES[0]);

for (const entry of PLAYGROUND_ENTRIES) {
	const defaults = playgroundDefaults(entry);
	const variants = [defaults];
	for (const property of entry.properties) {
		const values =
			property.options ??
			(typeof property.initial === "boolean"
				? [!property.initial]
				: [property.max ?? 'A "quoted" <label> & text']);
		for (const value of values) {
			variants.push({ ...defaults, [property.key]: value });
		}
	}
	for (const [index, values] of variants.entries()) {
		const filename = path.join(
			lab,
			"src",
			`__example_${entry.id}_${index}.tsx`
		);
		examples.set(
			filename,
			playgroundExample(entry, values, PLAYGROUND_ENVIRONMENT)
		);
	}
}

const host = ts.createCompilerHost(options);
const readFile = host.readFile.bind(host);
const fileExists = host.fileExists.bind(host);
host.readFile = (filename) => examples.get(filename) ?? readFile(filename);
host.fileExists = (filename) => examples.has(filename) || fileExists(filename);
const program = ts.createProgram([...examples.keys()], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
	process.stderr.write(
		ts.formatDiagnosticsWithColorAndContext(diagnostics.slice(0, 20), {
			getCanonicalFileName: (filename) => filename,
			getCurrentDirectory: () => lab,
			getNewLine: () => "\n",
		})
	);
	process.exitCode = 1;
} else {
	process.stdout.write(
		`Checked ${examples.size} copyable examples across ${PLAYGROUND_ENTRIES.length} playground entries.\n`
	);
}

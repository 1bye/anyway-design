import { expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";
import { getMacosLabUrl, readLabSelection } from "../src/lib/macos-lab";
import {
	labDevelopmentHtml,
	labFramePath,
	labPublic,
	labPublicFile,
	labRoot,
} from "../tooling/macos-lab";

it("opens every catalog component and its native comparison within the hosted lab", () => {
	expect(new Set(PLAYGROUND_ENTRIES.map((entry) => entry.id)).size).toBe(
		PLAYGROUND_ENTRIES.length
	);
	for (const entry of PLAYGROUND_ENTRIES) {
		const component = new URL(
			getMacosLabUrl({ component: entry.id }),
			"http://localhost"
		);
		expect(component.pathname).toBe(labFramePath);
		expect(component.searchParams.get("component")).toBe(entry.id);
		if (entry.reference) {
			const reference = new URL(
				getMacosLabUrl({ view: entry.reference }),
				"http://localhost"
			);
			expect(reference.searchParams.get("view")).toBe(entry.reference);
		}
	}
});

it("rejects unknown and malformed selections and keeps legacy study views available", () => {
	expect(
		readLabSelection({ component: ["finder"], view: "../../secret" })
	).toEqual({ component: undefined, view: undefined });
	expect(getMacosLabUrl({ component: "unknown", view: "unknown" })).toBe(
		`${labFramePath}?component=finder`
	);
	expect(getMacosLabUrl({ view: "desktop-lab" })).toBe(
		`${labFramePath}?view=desktop-lab`
	);
	expect(getMacosLabUrl({ view: "dock-glass" })).toBe(
		`${labFramePath}?view=dock-glass`
	);
});

it("serves only public lab assets and rejects encoded path escapes", () => {
	expect(labPublicFile("/assets/clouds.webp")).toBe(
		resolve(labPublic, "assets/clouds.webp")
	);
	expect(labPublicFile("/fonts/geist.woff2")).toBe(
		resolve(labPublic, "fonts/geist.woff2")
	);
	expect(labPublicFile("/assets/%2e%2e/%2e%2e/package.json")).toBeUndefined();
	expect(labPublicFile("/src/main.tsx")).toBeUndefined();
	expect(labPublicFile("/assets/%ZZ")).toBeUndefined();
});

it("loads the existing lab entry through the Platform dev server", async () => {
	const source = await readFile(resolve(labRoot, "index.html"), "utf8");
	const html = labDevelopmentHtml(source);
	expect(html).toContain("/@fs/");
	expect(html).toContain("/macos-lab/src/main.tsx");
	expect(html).not.toContain('src="/src/main.tsx"');
	expect(() => labDevelopmentHtml("<html />")).toThrow("HTML entry changed");
});

it("keeps component and reference links on the nested lab document", () => {
	const current = new URL(
		"http://localhost/macos-lab/index.html?component=switch"
	);
	expect(new URL("?view=toggle-controls-reference", current).pathname).toBe(
		labFramePath
	);
	expect(new URL("?component=finder", current).pathname).toBe(labFramePath);
	expect(new URL("?", current).pathname).toBe(labFramePath);
});

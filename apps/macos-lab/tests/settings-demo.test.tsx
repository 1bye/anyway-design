import { expect, test } from "bun:test";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { renderToStaticMarkup } from "react-dom/server";
import { SettingsExample } from "../src/settings-demo";

const ignoreEvent = () => undefined;
const PAGE =
	/<section[^>]*class="mac-settings-page"[^>]*>([\s\S]*?)(?=<section[^>]*class="mac-settings-page"|<\/main>)/g;
const DISABLED_UPDATE =
	/<button[^>]*disabled=""[^>]*>Check for Updates<\/button>/;
const render = (readOnly = false) =>
	renderToStaticMarkup(
		<MacOSEnvironment appearance="light" preset="tahoe">
			<SettingsExample onEvent={ignoreEvent} readOnly={readOnly} />
		</MacOSEnvironment>
	);

test("every Settings demo destination has real rows and no screenshot content", () => {
	const html = render();
	const pages = [...html.matchAll(PAGE)];
	expect(pages.length).toBeGreaterThan(30);
	for (const [page, content] of pages) {
		expect(content, page.slice(0, 160)).toContain('class="mac-settings-row"');
	}
	expect(html).not.toContain("<img");
	expect(html).toContain('aria-label="Brightness"');
	expect(html).toContain('aria-label="Date"');
	expect(html).toContain("Check for Updates");
});

test("read-only Settings disables actions and preserves accessible field labels", () => {
	const html = render(true);
	expect(html).toMatch(DISABLED_UPDATE);
	expect(html).toContain('aria-label="Computer name"');
	expect(html).toContain('readOnly=""');
});

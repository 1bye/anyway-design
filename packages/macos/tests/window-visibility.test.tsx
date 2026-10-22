import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MacDesktop } from "../src/desktop";
import { MacFinder } from "../src/finder";
import { MacSettings } from "../src/settings";
import { MacWindow } from "../src/window";

const CLOSED_WINDOW = /class="mac-window"[^>]*hidden=""[^>]*inert=""/;
const CLOSED_DESKTOP =
	/data-active="false" data-window-id="closed" hidden="" inert=""/;
const OPEN_DESKTOP = /data-active="true" data-window-id="visible"/;
const defaultFrame = { height: 300, width: 400, x: 20, y: 20 };

test("closed standalone windows retain caller content but are hidden and inert", () => {
	const content = (
		<textarea aria-label="Document" defaultValue="Keep my edits" />
	);
	const html = renderToStaticMarkup(
		<MacWindow open={false} title="Document">
			{content}
		</MacWindow>
	);
	expect(html).toMatch(CLOSED_WINDOW);
	expect(html).toContain('aria-hidden="true"');
	expect(html).toContain("Keep my edits");
	const open = renderToStaticMarkup(
		<MacWindow title="Document">{content}</MacWindow>
	);
	expect(open).not.toContain('hidden=""');
	expect(open).not.toContain('inert=""');
});

test("a closed topmost desktop window retains its content without taking initial focus", () => {
	const windows = [
		{
			defaultFrame,
			id: "visible",
			render: () => <p>Visible content</p>,
			title: "Visible",
		},
		{
			defaultFrame,
			id: "closed",
			open: false,
			render: () => <input aria-label="Saved input" defaultValue="Preserved" />,
			title: "Closed",
		},
	];
	const html = renderToStaticMarkup(<MacDesktop windows={windows} />);
	expect(html).toMatch(CLOSED_DESKTOP);
	expect(html).toMatch(OPEN_DESKTOP);
	expect(html).toContain('value="Preserved"');
	const allClosed = renderToStaticMarkup(
		<MacDesktop
			windows={windows.map((window) => ({ ...window, open: false }))}
		/>
	);
	expect(allClosed).not.toContain('data-active="true"');
});

test("Finder and Settings forward visibility and disable their entire named regions", () => {
	const html = renderToStaticMarkup(
		<MacFinder
			files={[{ id: "root", kind: "folder", name: "Projects" }]}
			open={false}
			rootId="root"
		/>
	);
	expect(html).toMatch(CLOSED_WINDOW);
	expect(html).toContain(
		'class="mac-finder-window" data-open="false" inert=""'
	);
	expect(html).toContain('aria-hidden="true"');
	const settings = renderToStaticMarkup(
		<MacSettings open={false} sections={[]} />
	);
	expect(settings).toMatch(CLOSED_WINDOW);
	expect(settings).toContain(
		'<section aria-hidden="true" aria-label="Settings"'
	);
});

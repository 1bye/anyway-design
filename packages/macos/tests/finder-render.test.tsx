import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MacFinder, type MacFinderFile } from "../src/finder";

const files: MacFinderFile[] = [
	{ id: "root-42", kind: "folder", name: "Studio" },
	{ id: "folder-9", kind: "folder", name: "Sketches", parentId: "root-42" },
	{
		id: "file-7",
		kind: "text",
		name: "Brief.txt",
		parentId: "folder-9",
		preview: { text: "Consumer preview" },
	},
];

test("the public Finder renders arbitrary caller data and derives a sidebar without lab imports", () => {
	const html = renderToStaticMarkup(
		<MacFinder
			defaultLocation="folder-9"
			files={files}
			rootId="root-42"
			showTabs={false}
		/>
	);
	expect(html).toContain("Sketches");
	expect(html).toContain("Brief");
	expect(html).toContain("Finder path");
	expect(html).toContain("Studio");
	expect(html).toContain("mac-finder-window");
	expect(html).not.toContain("pg-finder");
	expect(html).not.toContain(">Documents<");
	expect(html).not.toContain("finder-empty");
});

test("a restricted Gallery-only Finder preserves supplied preview content and can omit chrome", () => {
	const html = renderToStaticMarkup(
		<MacFinder
			defaultLocation="folder-9"
			defaultTabs={[
				{ id: "first", location: "folder-9", selectedIds: ["file-7"] },
			]}
			files={files}
			rootId="root-42"
			showSidebar={false}
			showTabs={false}
			showToolbar={false}
			views={["gallery"]}
		/>
	);
	expect(html).toContain("mac-file-gallery");
	expect(html).toContain("Consumer preview");
	expect(html).not.toContain("Finder sidebar");
	expect(html).not.toContain("Change view");
	expect(html).not.toContain("Finder tabs");
	expect(html).not.toContain("sample document");
});

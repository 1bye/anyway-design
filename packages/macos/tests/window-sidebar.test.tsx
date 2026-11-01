import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { WindowSidebar } from "../src/window-sidebar";

test("tag rows keep their label and selection accessible while rendering a decorative color dot", () => {
	const html = renderToStaticMarkup(
		<WindowSidebar
			groups={[
				{
					id: "tags",
					items: [
						{ id: "urgent", label: "Urgent", tagColor: "#ff0000" },
						{ id: "work", label: "Work", tagColor: "#ff8000" },
					],
					label: "Tags",
				},
			]}
			selected="urgent"
		/>
	);

	expect(html).toContain('aria-current="page"');
	expect(html).toContain('data-id="urgent" data-tag="true"');
	expect(html).toContain('style="--mac-sidebar-tag-color:#ff0000"');
	expect(html).toContain('style="--mac-sidebar-tag-color:#ff8000"');
	expect(html).toContain(
		'<span aria-hidden="true" class="mac-sidebar-icon"><span class="mac-sidebar-tag"></span></span>'
	);
	expect(html).toContain("<span>Urgent</span>");
	expect(html.match(/aria-current=/g)).toHaveLength(1);
});

test("ordinary sidebar items preserve caller-provided icons without tag styling", () => {
	const html = renderToStaticMarkup(
		<WindowSidebar
			groups={[
				{
					id: "favorites",
					items: [
						{
							icon: <span>Custom icon</span>,
							id: "documents",
							label: "Documents",
						},
					],
				},
			]}
			selected="documents"
		/>
	);

	expect(html).toContain("Custom icon");
	expect(html).toContain('aria-current="page"');
	expect(html).not.toContain("data-tag=");
	expect(html).not.toContain("mac-sidebar-tag");
});

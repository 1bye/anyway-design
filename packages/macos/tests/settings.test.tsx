import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MacSettings } from "../src/settings";
import {
	type MacSettingsSection,
	searchSettings,
	settingsItemKey,
	stepSettingsHistory,
} from "../src/settings-model";

const HIDDEN_PAGE = /class="mac-settings-page"[^>]*hidden=""/;
const CURRENT_NOTIFICATIONS =
	/aria-current="page"[^>]*><span>Notifications<\/span>/;

const sections: readonly MacSettingsSection[] = [
	{
		groups: [
			{
				description: "Document behavior",
				id: "files",
				items: [
					{
						control: (
							<input
								aria-label="Save automatically"
								defaultChecked
								type="checkbox"
							/>
						),
						id: "save",
						keywords: ["autosave"],
						label: "Save automatically",
					},
					{
						control: (
							<input aria-label="Workspace name" defaultValue="My project" />
						),
						description: "Name shown in projects",
						id: "name",
						label: "Workspace name",
					},
				],
				title: "Files",
			},
		],
		id: "general",
		keywords: ["workspace"],
		title: "Général",
	},
	{
		groups: [
			{
				id: "alerts",
				items: [
					{
						control: (
							<input
								aria-label="Badge app icon"
								defaultChecked
								type="checkbox"
							/>
						),
						description: "Show an unread count in the Dock",
						id: "badge",
						keywords: ["unread"],
						label: "Badge app icon",
					},
				],
				title: "Alerts",
			},
		],
		id: "notifications",
		title: "Notifications",
	},
];
test("settings search matches all words across labels, descriptions, keywords, and section context", () => {
	expect(
		searchSettings(sections, "  GENERAL   autoSAVE ").map((m) => m.item.id)
	).toEqual(["save"]);
	expect(
		searchSettings(sections, "notifications DOCK").map((m) => m.item.id)
	).toEqual(["badge"]);
	expect(
		searchSettings(sections, "general files").map((m) => m.item.id)
	).toEqual(["save", "name"]);
	expect(
		searchSettings(sections, "document projects").map((m) => m.item.id)
	).toEqual(["name"]);
	expect(searchSettings(sections, "unread")[0]?.sectionId).toBe(
		"notifications"
	);
	expect(searchSettings(sections, "unknown")).toEqual([]);
	expect(searchSettings(sections, "  \n\t")).toEqual([]);
	expect(searchSettings([], "save")).toEqual([]);
});
test("search retains caller order and distinguishes identical row IDs in different groups or sections", () => {
	const before = sections.map((section) =>
		section.groups.flatMap((group) => group.items.map((item) => item.id))
	);
	searchSettings(sections, "workspace");
	expect(
		sections.map((section) =>
			section.groups.flatMap((group) => group.items.map((item) => item.id))
		)
	).toEqual(before);
	expect(settingsItemKey("a:b", "c", "d")).not.toBe(
		settingsItemKey("a", "b:c", "d")
	);
	expect(settingsItemKey("a", "b", "c")).not.toBe(
		settingsItemKey("a", "b", "d")
	);
});
test("settings preserve one mounted instance of each page and arbitrary caller controls", () => {
	const html = renderToStaticMarkup(
		<MacSettings defaultSection="notifications" sections={sections} />
	);
	expect(html).toContain('aria-label="Settings sections"');
	expect(html).toContain('aria-current="page"');
	expect(html).toContain('value="My project"');
	expect(html.match(/aria-label="Workspace name"/g)).toHaveLength(2);
	expect(html).toMatch(HIDDEN_PAGE);
	expect(html).not.toContain("macos-lab");
	const empty = renderToStaticMarkup(<MacSettings sections={[]} />);
	expect(empty).toContain("No settings");
});
test("search results expose real section destinations without duplicating their controls", () => {
	const html = renderToStaticMarkup(
		<MacSettings defaultSearchQuery="unread" sections={sections} />
	);
	expect(html).toContain('aria-label="Settings search results"');
	expect(html).toContain("Notifications › Alerts");
	expect(html).toContain("1 setting");
	expect(html.match(/type="checkbox"/g)).toHaveLength(2);
	const missing = renderToStaticMarkup(
		<MacSettings defaultSearchQuery="does-not-exist" sections={sections} />
	);
	expect(missing).toContain("No settings found");
	const hiddenSearch = renderToStaticMarkup(
		<MacSettings
			defaultSearchQuery="unread"
			searchable={false}
			sections={sections}
		/>
	);
	expect(hiddenSearch).not.toContain('type="search"');
	expect(hiddenSearch).not.toContain('aria-label="Settings search results"');
});

test("controlled section and query props override their initial defaults", () => {
	const section = renderToStaticMarkup(
		<MacSettings
			defaultSection="general"
			sections={sections}
			selectedSection="notifications"
			sidebarWidth={Number.NaN}
		/>
	);
	expect(section).toContain("min(224px, 40%)");
	expect(section).toMatch(CURRENT_NOTIFICATIONS);
	expect(section).not.toContain("NaN");
	const query = renderToStaticMarkup(
		<MacSettings
			defaultSearchQuery="missing"
			searchQuery="unread"
			sections={sections}
		/>
	);
	expect(query).toContain('value="unread"');
	expect(query).toContain("Notifications › Alerts");
	expect(query).not.toContain("No settings found");
});

test("Settings history traverses valid sections and preserves its input", () => {
	const history = {
		back: ["general", "deleted", "notifications"],
		forward: [],
	};
	const step = stepSettingsHistory(
		history,
		"back",
		["general", "notifications"],
		"notifications"
	);
	expect(step).toEqual({
		history: { back: [], forward: ["notifications"] },
		id: "general",
	});
	expect(history.back).toEqual(["general", "deleted", "notifications"]);
	expect(
		stepSettingsHistory(
			step?.history ?? { back: [], forward: [] },
			"forward",
			["general", "notifications"],
			"general"
		)
	).toEqual({
		history: { back: ["general"], forward: [] },
		id: "notifications",
	});
	expect(
		stepSettingsHistory(history, "forward", ["general"], "general")
	).toBeUndefined();
	expect(stepSettingsHistory(history, "back", [], "general")).toBeUndefined();
});

test("overview rows navigate to real sections and disable missing destinations", () => {
	const html = renderToStaticMarkup(
		<MacSettings
			sections={[
				{
					groups: [
						{
							id: "overview",
							items: [
								{
									id: "notifications",
									label: "Notification settings",
									sectionId: "notifications",
								},
								{
									id: "missing",
									label: "Removed section",
									sectionId: "removed",
								},
							],
						},
					],
					id: "general",
					title: "General",
				},
				...sections.slice(1),
			]}
		/>
	);
	expect(html).toContain(
		'aria-label="Notification settings" class="mac-settings-row" data-navigation="true"'
	);
	expect(html).toContain(
		'aria-label="Removed section" class="mac-settings-row" data-navigation="true" disabled=""'
	);
	expect(html).toContain('aria-label="Settings history"');
	expect(html).toContain('aria-label="Back" disabled=""');
});

import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MenuBar } from "../src/menu-bar";
import { MacBatteryIcon, MacMenuBarStatus } from "../src/menu-bar-status";
import {
	DEFAULT_SYSTEM_STATUS,
	type MacSpotlightItem,
	normalizeSystemStatus,
	spotlightMatches,
	statusPercent,
} from "../src/menu-bar-status-model";

test("system percentages stay finite and Wi-Fi off clears its connection without mutating caller state", () => {
	const original = {
		...DEFAULT_SYSTEM_STATUS,
		batteryLevel: Number.NaN,
		brightness: 150,
		networkId: "studio",
		volume: -10,
		wifi: false,
	};
	expect(normalizeSystemStatus(original)).toMatchObject({
		batteryLevel: 0,
		brightness: 100,
		networkId: null,
		volume: 0,
	});
	expect(original.networkId).toBe("studio");
	expect(original.brightness).toBe(150);
	expect(statusPercent(Number.POSITIVE_INFINITY)).toBe(0);
	expect(statusPercent(49.7)).toBe(50);
});
test("Spotlight filters supplied categories and normalized labels without changing result order", () => {
	const items: MacSpotlightItem[] = [
		{
			category: "applications",
			id: "app",
			label: "Finder",
			subtitle: "Application",
		},
		{
			category: "files",
			id: "file",
			label: "Café notes",
			subtitle: "Documents",
		},
		{ category: "actions", id: "action", label: "New Folder" },
	];
	expect(
		spotlightMatches(items, " CAFÉ ", "all").map((item) => item.id)
	).toEqual(["file"]);
	expect(
		spotlightMatches(items, "Cafe\u0301", "files").map((item) => item.id)
	).toEqual(["file"]);
	expect(spotlightMatches(items, "Documents", "applications")).toEqual([]);
	expect(spotlightMatches(items, "", "actions").map((item) => item.id)).toEqual(
		["action"]
	);
	expect(spotlightMatches(items, "", "all")).toEqual(items);
});
test("public menu status keeps custom application menus and uses native labeled status controls", () => {
	const html = renderToStaticMarkup(
		<MenuBar
			menus={[{ id: "project", items: [], label: "My App" }]}
			status={
				<MacMenuBarStatus
					clock="10:42"
					defaultValue={{ batteryLevel: 64 }}
					showBatteryPercentage
				/>
			}
		/>
	);
	expect(html).toContain("My App");
	expect(html).toContain("10:42");
	expect(html).toContain('aria-label="Battery: 64%"');
	expect(html).toContain('aria-label="Spotlight"');
	expect(html).toContain('aria-label="Control Center"');
	expect(html).toContain('data-symbol="wifi"');
	expect(html).toContain('data-symbol="control-center"');
	expect(html).not.toContain("lucide");
	expect(html).not.toContain("Studio");
});
test("battery charge and charging artwork use clamped values and native masks", () => {
	const empty = renderToStaticMarkup(<MacBatteryIcon level={-5} />);
	expect(empty).toContain('data-symbol="battery-empty"');
	expect(empty).toContain('data-symbol="battery-fill"');
	expect(empty).toContain("--battery-charge:0");
	const full = renderToStaticMarkup(<MacBatteryIcon level={150} />);
	expect(full).toContain("--battery-charge:1");
	expect(full).not.toContain('data-low="true"');
	const invalid = renderToStaticMarkup(<MacBatteryIcon level={Number.NaN} />);
	expect(invalid).toContain("--battery-charge:0");
	expect(invalid).toContain('data-low="true"');
	const charging = renderToStaticMarkup(<MacBatteryIcon charging level={75} />);
	expect(charging).toContain('data-symbol="battery-charging"');
	expect(charging).not.toContain('mac-battery-charge"');
});

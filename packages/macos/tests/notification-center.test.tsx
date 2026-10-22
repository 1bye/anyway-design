import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
	MacNotificationCard,
	MacNotificationCenterPanel,
} from "../src/notification-center";
import {
	groupNotifications,
	type MacNotification,
} from "../src/notification-model";

const dismiss = () => undefined;

const notifications: readonly MacNotification[] = Object.freeze([
	Object.freeze({
		appId: "chat",
		appName: "Messages",
		body: "Newest message",
		id: "new",
	}),
	Object.freeze({
		appId: "mail",
		appName: "Mail",
		body: "A letter",
		id: "letter",
	}),
	Object.freeze({
		appId: "chat",
		appName: "Renamed app",
		body: "Older message",
		id: "old",
	}),
]);

test("notification grouping preserves caller order, groups by stable app ID, and never mutates input", () => {
	const groups = groupNotifications(notifications);
	expect(groups.map((group) => group.appId)).toEqual(["chat", "mail"]);
	expect(groups[0].appName).toBe("Messages");
	expect(groups[0].items.map((item) => item.id)).toEqual(["new", "old"]);
	groups[0].items.pop();
	expect(notifications.map((item) => item.id)).toEqual([
		"new",
		"letter",
		"old",
	]);
	expect(groupNotifications(notifications)[0].items).toHaveLength(2);
	expect(groupNotifications([])).toEqual([]);
});

test("collapsed notification groups expose one top card and an accessible expansion target", () => {
	const html = renderToStaticMarkup(
		<MacNotificationCenterPanel notifications={notifications} />
	);
	expect(html).toContain("Newest message");
	expect(html).not.toContain("Older message");
	expect(html).toContain("A letter");
	expect(html).toContain('aria-label="Expand Messages, 2 notifications"');
	expect(html).toContain('aria-expanded="false"');
	expect(html).toContain("1 more notification");
});

test("expanded groups render all their items and expose collapse and individual dismissal", () => {
	const html = renderToStaticMarkup(
		<MacNotificationCenterPanel
			defaultExpandedGroups={["chat"]}
			notifications={notifications}
			onDismiss={dismiss}
		/>
	);
	expect(html).toContain("Older message");
	expect(html).toContain("Show fewer Messages notifications");
	expect(html).toContain("Clear All");
	expect(html).not.toContain("notification group");
});

test("empty centers allow arbitrary widget content without a misleading no-notifications message", () => {
	const empty = renderToStaticMarkup(
		<MacNotificationCenterPanel notifications={[]} />
	);
	expect(empty).toContain("No Notifications");
	const widgets = renderToStaticMarkup(
		<MacNotificationCenterPanel
			notifications={[]}
			widgets={[
				{
					content: <button type="button">My calendar</button>,
					id: "custom",
					size: "medium",
				},
			]}
		/>
	);
	expect(widgets).toContain("My calendar");
	expect(widgets).toContain('data-size="medium"');
	expect(widgets).not.toContain("No Notifications");
});

test("cards retain supplied text and artwork, with no interactive open target when no callback exists", () => {
	const html = renderToStaticMarkup(
		<MacNotificationCard
			item={{
				...notifications[0],
				actions: [{ id: "reply", label: "Reply" }],
				icon: <span>Custom icon</span>,
				timeSensitive: true,
				title: "Review",
			}}
		/>
	);
	expect(html).toContain("Custom icon");
	expect(html).toContain("Time Sensitive");
	expect(html).toContain('class="mac-notification-body"');
	expect(html).not.toContain('aria-label="Open');
	expect(html).toContain('aria-label="Options for Review"');
	expect(html).toContain("disabled");
	expect(html).not.toContain("macos-lab");
	expect(html).not.toContain("notification-icons");
});

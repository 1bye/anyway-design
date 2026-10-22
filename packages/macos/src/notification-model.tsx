import type { ReactNode } from "react";

export interface MacNotificationAction {
	disabled?: boolean;
	id: string;
	label: string;
}

export interface MacNotification {
	actions?: readonly MacNotificationAction[];
	appId: string;
	appName: string;
	body: string;
	icon?: ReactNode;
	id: string;
	time?: string;
	timeSensitive?: boolean;
	title?: string;
}

export interface MacNotificationGroup {
	appId: string;
	appName: string;
	items: MacNotification[];
}

/** Caller order is newest first; grouping never invents or parses timestamps. */
export function groupNotifications(
	items: readonly MacNotification[]
): MacNotificationGroup[] {
	const groups = new Map<string, MacNotificationGroup>();
	for (const item of items) {
		let group = groups.get(item.appId);
		if (!group) {
			group = { appId: item.appId, appName: item.appName, items: [] };
			groups.set(item.appId, group);
		}
		group.items.push(item);
	}
	return [...groups.values()];
}

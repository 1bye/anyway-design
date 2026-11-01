import type { ReactNode } from "react";
import type { WindowSidebarGroup } from "./window-sidebar";

interface SettingsItemContent {
	description?: string;
	icon?: ReactNode;
	id: string;
	keywords?: readonly string[];
	label: string;
}
export type MacSettingsItem = SettingsItemContent &
	(
		| { control: ReactNode; sectionId?: never }
		| { control?: never; sectionId: string }
	);
export interface MacSettingsGroup {
	description?: string;
	id: string;
	items: readonly MacSettingsItem[];
	title?: string;
}
export interface MacSettingsSection {
	description?: string;
	groups: readonly MacSettingsGroup[];
	header?: "summary" | "toolbar";
	icon?: ReactNode;
	id: string;
	keywords?: readonly string[];
	/** Sidebar section to keep highlighted while a detail page is open. */
	parentId?: string;
	/** Hide a detail page from navigation while keeping it searchable. */
	sidebar?: boolean;
	/** Sections sharing a group are displayed together without a heading. */
	sidebarGroup?: string;
	title: string;
}
export function settingsSidebarGroups(
	sections: readonly MacSettingsSection[]
): WindowSidebarGroup[] {
	const groups = new Map<string, WindowSidebarGroup>();
	for (const section of sections) {
		if (section.sidebar === false) {
			continue;
		}
		const id = section.sidebarGroup ?? "sections";
		let group = groups.get(id);
		if (!group) {
			group = { id, items: [] };
			groups.set(id, group);
		}
		group.items.push({
			icon: section.icon,
			id: section.id,
			label: section.title,
		});
	}
	return [...groups.values()];
}
export interface MacSettingsMatch {
	groupId: string;
	groupTitle?: string;
	item: MacSettingsItem;
	sectionId: string;
	sectionTitle: string;
}
const DIACRITICS = /\p{M}/gu;
const SPACES = /\s+/;
export const normalizeSettingsQuery = (text: string) =>
	text.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();

/** All words must match the setting or its section/group context. Caller order is retained. */
export function searchSettings(
	sections: readonly MacSettingsSection[],
	query: string
): MacSettingsMatch[] {
	const normalized = normalizeSettingsQuery(query);
	if (!normalized) {
		return [];
	}
	const terms = normalized.split(SPACES);
	const results: MacSettingsMatch[] = [];
	for (const section of sections) {
		const context = [
			section.title,
			section.description,
			...(section.keywords ?? []),
		];
		for (const group of section.groups) {
			for (const item of group.items) {
				const text = normalizeSettingsQuery(
					[
						...context,
						group.title,
						group.description,
						item.label,
						item.description,
						...(item.keywords ?? []),
					]
						.filter(Boolean)
						.join(" ")
				);
				if (terms.every((term) => text.includes(term))) {
					results.push({
						groupId: group.id,
						groupTitle: group.title,
						item,
						sectionId: section.id,
						sectionTitle: section.title,
					});
				}
			}
		}
	}
	return results;
}
export const settingsItemKey = (
	sectionId: string,
	groupId: string,
	itemId: string
) => JSON.stringify([sectionId, groupId, itemId]);

export interface SettingsHistory {
	back: string[];
	forward: string[];
}
export function stepSettingsHistory(
	history: SettingsHistory,
	direction: "back" | "forward",
	sectionIds: readonly string[],
	currentId: string
): { id: string; history: SettingsHistory } | undefined {
	const source = [...history[direction]];
	let id = source.pop();
	while (id !== undefined && (id === currentId || !sectionIds.includes(id))) {
		id = source.pop();
	}
	if (id === undefined) {
		return;
	}
	const opposite = direction === "back" ? "forward" : "back";
	return {
		history: {
			...history,
			[direction]: source,
			[opposite]: [...history[opposite], currentId],
		},
		id,
	};
}

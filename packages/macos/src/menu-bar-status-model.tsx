import type { ReactNode } from "react";

export interface MacSystemStatus {
	airDrop: boolean;
	batteryCharging: boolean;
	batteryLevel: number;
	bluetooth: boolean;
	brightness: number;
	focus: boolean;
	lowPowerMode: boolean;
	networkId: string | null;
	playing: boolean;
	stageManager?: boolean;
	volume: number;
	wifi: boolean;
}
export interface MacWiFiNetwork {
	id: string;
	known?: boolean;
	name: string;
	secured?: boolean;
}
export type MacSpotlightCategory =
	| "applications"
	| "files"
	| "actions"
	| "clipboard";
export interface MacSpotlightItem {
	category: MacSpotlightCategory;
	icon?: ReactNode;
	id: string;
	label: string;
	subtitle?: string;
}
export const DEFAULT_SYSTEM_STATUS: MacSystemStatus = {
	airDrop: false,
	batteryCharging: false,
	batteryLevel: 100,
	bluetooth: true,
	brightness: 70,
	focus: false,
	lowPowerMode: false,
	networkId: null,
	playing: false,
	stageManager: false,
	volume: 50,
	wifi: true,
};
export function statusPercent(value: number): number {
	return Number.isFinite(value)
		? Math.min(100, Math.max(0, Math.round(value)))
		: 0;
}
export function normalizeSystemStatus(value: MacSystemStatus): MacSystemStatus {
	return {
		...value,
		batteryLevel: statusPercent(value.batteryLevel),
		brightness: statusPercent(value.brightness),
		networkId: value.wifi ? value.networkId : null,
		volume: statusPercent(value.volume),
	};
}
export function spotlightMatches(
	items: readonly MacSpotlightItem[],
	query: string,
	category: MacSpotlightCategory | "all"
): MacSpotlightItem[] {
	const search = query.trim().normalize("NFKC").toLocaleLowerCase();
	return items.filter(
		(item) =>
			(category === "all" || item.category === category) &&
			`${item.label} ${item.subtitle ?? ""}`
				.normalize("NFKC")
				.toLocaleLowerCase()
				.includes(search)
	);
}

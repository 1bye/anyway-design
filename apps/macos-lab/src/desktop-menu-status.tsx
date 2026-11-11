/** biome-ignore-all lint/performance/noJsxPropsBind: The desktop owns its simulated system state. */
import {
	MacMenuBarStatus,
	type MacSpotlightItem,
	type MacSystemStatus,
} from "@1bye/macos/menu-bar-status";
import { DEFAULT_SYSTEM_STATUS } from "@1bye/macos/menu-bar-status-model";
import { useState } from "react";
import { useNotificationDemo } from "./notification-demo";

const NETWORKS = [
	{ id: "studio", name: "Studio", secured: true },
	{ id: "guest", name: "Studio Guest", secured: false },
	{ id: "workshop", name: "Workshop", secured: true },
	{ id: "lounge", known: false, name: "Lounge", secured: true },
];
const SEARCH_ITEMS: MacSpotlightItem[] = [
	{
		category: "files",
		id: "notes",
		label: "Meeting notes.txt",
		subtitle: "Documents",
	},
	{
		category: "files",
		id: "clouds",
		label: "Clouds.webp",
		subtitle: "Documents",
	},
	{
		category: "applications",
		id: "finder",
		label: "Finder",
		subtitle: "Application",
	},
	{
		category: "applications",
		id: "settings",
		label: "System Settings",
		subtitle: "Application",
	},
	{ category: "files", id: "documents", label: "Documents", subtitle: "Home" },
	{
		category: "files",
		id: "brief",
		label: "Project brief.pdf",
		subtitle: "Documents",
	},
	{
		category: "actions",
		id: "new-folder",
		label: "New Folder",
		subtitle: "Finder",
	},
];
export function DesktopMenuStatus({
	batteryLevel,
	charging,
	showPercentage = false,
	onAction,
	onEvent,
	onStatusChange,
}: {
	batteryLevel?: number;
	charging?: boolean;
	onAction: (id: string) => void;
	onEvent?: (message: string) => void;
	onStatusChange?: (value: MacSystemStatus) => void;
	showPercentage?: boolean;
}) {
	const { panel } = useNotificationDemo(onEvent ?? onAction);
	const [state, setState] = useState<MacSystemStatus>({
		...DEFAULT_SYSTEM_STATUS,
		batteryLevel: 85,
		networkId: "studio",
		playing: true,
	});
	return (
		<MacMenuBarStatus
			clock="Thu Oct 22  9:41 AM"
			mediaArtist="Anyway"
			mediaArtwork="/assets/clouds.webp"
			mediaTitle="Ambient"
			networks={NETWORKS}
			notificationCenter={panel}
			onAction={onAction}
			onSearchSelect={(item) =>
				onAction(
					item.id === "finder" || item.category === "files"
						? "new-window"
						: item.id
				)
			}
			onValueChange={(next) => {
				setState(next);
				onStatusChange?.(next);
			}}
			searchItems={SEARCH_ITEMS}
			showBatteryPercentage={showPercentage}
			value={{
				...state,
				batteryCharging: charging ?? state.batteryCharging,
				batteryLevel: batteryLevel ?? state.batteryLevel,
			}}
		/>
	);
}

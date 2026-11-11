import { MacFinderToolbar } from "@1bye/macos/finder-toolbar";
import type { ComponentProps } from "react";
import { useFinderMenu } from "./finder-actions";

export function FinderToolbar({
	filename = "Project brief.pdf",
	onAction,
	...props
}: Omit<ComponentProps<typeof MacFinderToolbar>, "actions"> & {
	filename?: string;
}) {
	const menu = useFinderMenu(onAction, filename);
	return (
		<MacFinderToolbar {...props} actions={menu.items} onAction={menu.action} />
	);
}

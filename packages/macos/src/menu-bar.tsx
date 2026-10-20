import { Menu } from "@base-ui/react/menu";
import { Menubar } from "@base-ui/react/menubar";
import { type MouseEvent, type ReactNode, useCallback } from "react";
import { useMacOSPortal } from "./environment";
export interface MacMenuItem {
	disabled?: boolean;
	id: string;
	label: string;
	separatorBefore?: boolean;
	shortcut?: string;
}
export interface MacMenu {
	accessibleLabel?: string;
	id: string;
	items: MacMenuItem[];
	label: ReactNode;
}
export interface MenuBarProps {
	menus: MacMenu[];
	onAction?: (id: string) => void;
	status?: ReactNode;
}
export function AppleMark() {
	return (
		<svg aria-hidden viewBox="0 0 24 24">
			<path
				d="M17.05 12.54c.03 3.05 2.68 4.07 2.71 4.08-.02.07-.42 1.45-1.39 2.87-.84 1.23-1.71 2.46-3.08 2.48-1.34.03-1.78-.8-3.31-.8-1.53 0-2.01.77-3.28.83-1.32.05-2.32-1.33-3.17-2.55-1.73-2.5-3.06-7.07-1.28-10.15a4.93 4.93 0 0 1 4.17-2.53c1.3-.02 2.53.88 3.32.88.79 0 2.27-1.09 3.83-.93.65.03 2.49.26 3.67 1.98-.1.06-2.19 1.28-2.19 3.84ZM14.53 5.06c.7-.85 1.17-2.03 1.04-3.21-1.01.04-2.24.67-2.97 1.52-.65.75-1.22 1.94-1.06 3.1 1.13.09 2.29-.57 2.99-1.41Z"
				fill="currentColor"
			/>
		</svg>
	);
}
export function MenuBar({ menus, status, onAction }: MenuBarProps) {
	const container = useMacOSPortal();
	const handleAction = useCallback(
		(event: MouseEvent<HTMLElement>) => {
			const { id } = event.currentTarget.dataset;
			if (id) {
				onAction?.(id);
			}
		},
		[onAction]
	);
	return (
		<div className="mac-menubar">
			<Menubar
				aria-label="Application menus"
				className="mac-menubar-menus"
				modal={false}
			>
				{menus.map((menu) => (
					<Menu.Root key={menu.id}>
						<Menu.Trigger
							aria-label={menu.accessibleLabel}
							className="mac-menu-trigger"
						>
							{menu.label}
						</Menu.Trigger>
						<Menu.Portal container={container}>
							<Menu.Positioner
								align="start"
								className="mac-menu-positioner"
								sideOffset={3}
							>
								<Menu.Popup className="mac-menu-popup">
									{menu.items.map((item) => (
										<div key={item.id}>
											{item.separatorBefore ? (
												<Menu.Separator className="mac-menu-separator" />
											) : null}
											<Menu.Item
												className="mac-menu-item"
												data-id={item.id}
												disabled={item.disabled}
												onClick={handleAction}
											>
												<span>{item.label}</span>
												{item.shortcut ? (
													<span className="mac-menu-shortcut">
														{item.shortcut}
													</span>
												) : null}
											</Menu.Item>
										</div>
									))}
								</Menu.Popup>
							</Menu.Positioner>
						</Menu.Portal>
					</Menu.Root>
				))}
			</Menubar>
			<div className="mac-menu-status">{status}</div>
		</div>
	);
}

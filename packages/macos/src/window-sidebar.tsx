import { type MouseEvent, type ReactNode, useCallback } from "react";

export interface WindowSidebarItem {
	icon?: ReactNode;
	id: string;
	label: string;
}

export interface WindowSidebarGroup {
	id: string;
	items: WindowSidebarItem[];
	label?: string;
}

export interface WindowSidebarProps {
	groups: WindowSidebarGroup[];
	label?: string;
	onSelect?: (id: string) => void;
	selected?: string;
}

export function WindowSidebar({
	groups,
	label = "Sidebar",
	onSelect,
	selected,
}: WindowSidebarProps) {
	const select = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const { id } = event.currentTarget.dataset;
			if (id) {
				onSelect?.(id);
			}
		},
		[onSelect]
	);
	return (
		<nav aria-label={label} className="mac-sidebar">
			{groups.map((group) => (
				<div className="mac-sidebar-group" key={group.id}>
					{group.label ? <h3>{group.label}</h3> : null}
					{group.items.map((item) => (
						<button
							aria-current={selected === item.id ? "page" : undefined}
							className="mac-sidebar-item"
							data-finder-location-id={item.id}
							data-id={item.id}
							key={item.id}
							onClick={select}
							type="button"
						>
							{item.icon ? (
								<span aria-hidden className="mac-sidebar-icon">
									{item.icon}
								</span>
							) : null}
							<span>{item.label}</span>
						</button>
					))}
				</div>
			))}
		</nav>
	);
}

import { ContextMenu } from "@base-ui/react/context-menu";
import { Menu } from "@base-ui/react/menu";
import {
	Fragment,
	type KeyboardEvent,
	type ReactElement,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useCallback,
	useId,
} from "react";
import { useMacOSPortal } from "./environment";
import { WindowSymbol } from "./window-symbol";

export interface MacMenuItem {
	checked?: boolean;
	closeOnClick?: boolean;
	disabled?: boolean;
	icon?: ReactNode;
	id: string;
	items?: MacMenuEntry[];
	label: string;
	separatorBefore?: boolean;
	shortcut?: string;
	type?: "item";
}

export interface MacMenuPalette {
	colors: { checked?: boolean; color: string; id: string; label: string }[];
	id: string;
	label: string;
	separatorBefore?: boolean;
	type: "palette";
}

export type MacMenuEntry = MacMenuItem | MacMenuPalette;

interface MenuContentProps {
	items: MacMenuEntry[];
	onAction?: (id: string) => void;
}

export interface MacMenuPopupProps extends MenuContentProps {
	positionerProps?: Pick<
		Menu.Positioner.Props,
		"align" | "side" | "sideOffset" | "collisionAvoidance" | "collisionBoundary"
	>;
	variant?: "default" | "menubar";
}

function MenuItemLabel({ item }: { item: MacMenuItem }) {
	return (
		<>
			<span aria-hidden className="mac-menu-icon">
				{item.checked ? <WindowSymbol name="check" /> : item.icon}
			</span>
			<span className="mac-menu-label">{item.label}</span>
			{item.items ? (
				<WindowSymbol className="mac-menu-submenu-arrow" name="chevron-right" />
			) : (
				<span aria-hidden className="mac-menu-shortcut">
					{item.shortcut}
				</span>
			)}
		</>
	);
}

function MenuEntry({
	item,
	onAction,
	handleAction,
	variant,
}: {
	handleAction: (event: ReactMouseEvent<HTMLElement>) => void;
	item: MacMenuEntry;
	onAction?: (id: string) => void;
	variant: MacMenuPopupProps["variant"];
}) {
	if (item.type === "palette") {
		return (
			<Menu.Group aria-label={item.label} className="mac-menu-palette">
				{item.colors.map((color) => (
					<Menu.CheckboxItem
						aria-label={color.label}
						checked={color.checked ?? false}
						className="mac-menu-color"
						closeOnClick
						data-id={color.id}
						key={color.id}
						label={color.label}
						onClick={handleAction}
						style={{ color: color.color }}
					>
						<span className="mac-menu-color-dot">
							<Menu.CheckboxItemIndicator>
								<WindowSymbol name="check" />
							</Menu.CheckboxItemIndicator>
						</span>
					</Menu.CheckboxItem>
				))}
			</Menu.Group>
		);
	}
	if (item.items) {
		return (
			<Menu.SubmenuRoot>
				<Menu.SubmenuTrigger
					className="mac-menu-item"
					disabled={item.disabled}
					label={item.label}
					openOnHover
				>
					<MenuItemLabel item={item} />
				</Menu.SubmenuTrigger>
				<MacMenuPopup
					items={item.items}
					onAction={onAction}
					positionerProps={{ align: "start", side: "right", sideOffset: 3 }}
					variant={variant}
				/>
			</Menu.SubmenuRoot>
		);
	}
	if (item.checked !== undefined) {
		return (
			<Menu.CheckboxItem
				checked={item.checked}
				className="mac-menu-item"
				closeOnClick={item.closeOnClick ?? false}
				data-id={item.id}
				disabled={item.disabled}
				label={item.label}
				onClick={handleAction}
			>
				<MenuItemLabel item={item} />
			</Menu.CheckboxItem>
		);
	}
	return (
		<Menu.Item
			className="mac-menu-item"
			closeOnClick={item.closeOnClick ?? true}
			data-id={item.id}
			disabled={item.disabled}
			label={item.label}
			onClick={handleAction}
		>
			<MenuItemLabel item={item} />
		</Menu.Item>
	);
}

export function MacMenuPopup({
	items,
	onAction,
	positionerProps,
	variant = "default",
}: MacMenuPopupProps) {
	const container = useMacOSPortal();
	const handleAction = useCallback(
		(event: ReactMouseEvent<HTMLElement>) => {
			const { id } = event.currentTarget.dataset;
			if (id) {
				onAction?.(id);
			}
		},
		[onAction]
	);
	return (
		<Menu.Portal container={container}>
			<Menu.Positioner
				align="end"
				className="mac-menu-positioner"
				sideOffset={6}
				{...positionerProps}
			>
				<Menu.Popup className="mac-menu-popup" data-variant={variant}>
					{items.map((item) => (
						<Fragment key={item.id}>
							{item.separatorBefore ? (
								<Menu.Separator className="mac-menu-separator" />
							) : null}
							<MenuEntry
								handleAction={handleAction}
								item={item}
								onAction={onAction}
								variant={variant}
							/>
						</Fragment>
					))}
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	);
}

export interface MacMenuButtonProps extends MacMenuPopupProps {
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
	trigger: ReactElement;
}

export function MacMenuButton({
	trigger,
	defaultOpen,
	open,
	onOpenChange,
	...popup
}: MacMenuButtonProps) {
	const id = useId();
	return (
		<Menu.Root
			defaultOpen={defaultOpen}
			defaultTriggerId={id}
			modal={false}
			onOpenChange={onOpenChange}
			open={open}
			triggerId={open === undefined ? undefined : id}
		>
			<Menu.Trigger id={id} render={trigger} />
			<MacMenuPopup {...popup} />
		</Menu.Root>
	);
}

// Base UI opens at pointer coordinates; keyboard invocation anchors to the target.
function openContextMenuFromKeyboard(event: KeyboardEvent<HTMLElement>) {
	if (
		event.defaultPrevented ||
		(event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10"))
	) {
		return;
	}
	const target =
		event.target instanceof HTMLElement ? event.target : event.currentTarget;
	if (target.closest("input, textarea, select, [contenteditable='true']")) {
		return;
	}
	event.preventDefault();
	const rect = target.getBoundingClientRect();
	target.dispatchEvent(
		new MouseEvent("contextmenu", {
			bubbles: true,
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
		})
	);
}

export interface MacContextMenuProps extends MacMenuPopupProps {
	trigger: ReactElement;
}

export function MacContextMenu({ trigger, ...popup }: MacContextMenuProps) {
	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger
				onKeyDown={openContextMenuFromKeyboard}
				render={trigger}
			/>
			<MacMenuPopup
				{...popup}
				positionerProps={{ align: "start", ...popup.positionerProps }}
			/>
		</ContextMenu.Root>
	);
}

/** biome-ignore-all lint/performance/noJsxPropsBind: Notification callbacks bind caller-owned IDs. */
import { Popover } from "@base-ui/react/popover";
import {
	type CSSProperties,
	type ReactElement,
	type ReactNode,
	type Ref,
	type RefObject,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useMacOSPortal } from "./environment";
import { MacMenuButton } from "./menu";
import { groupNotifications, type MacNotification } from "./notification-model";
import { WindowSymbol } from "./window-symbol";

export type {
	MacNotification,
	MacNotificationAction,
} from "./notification-model";

export interface MacNotificationCardProps {
	actionReturnFocus?: RefObject<HTMLElement | null>;
	className?: string;
	defaultActionsOpen?: boolean;
	item: MacNotification;
	onAction?: (actionId: string, item: MacNotification) => void;
	onDismiss?: () => void;
	onOpen?: () => void;
	openLabel?: string;
	stackCount?: number;
}

function NotificationContent({
	item,
	stackCount,
}: {
	item: MacNotification;
	stackCount: number;
}) {
	return (
		<>
			<span aria-hidden className="mac-notification-icon">
				{item.icon ?? <WindowSymbol name="info" size={28} />}
			</span>
			<span className="mac-notification-copy">
				<span className="mac-notification-heading">
					<strong data-time-sensitive={item.timeSensitive || undefined}>
						{item.timeSensitive ? "Time Sensitive" : item.appName}
					</strong>
					{item.time ? <span>{item.time}</span> : null}
				</span>
				{item.title ? (
					<strong className="mac-notification-title">{item.title}</strong>
				) : null}
				<span className="mac-notification-message">{item.body}</span>
				{stackCount > 1 ? (
					<span className="mac-notification-count">
						{stackCount - 1} more notification{stackCount === 2 ? "" : "s"}
					</span>
				) : null}
			</span>
		</>
	);
}

export function MacNotificationCard({
	actionReturnFocus,
	item,
	onAction,
	onDismiss,
	onOpen,
	openLabel,
	stackCount = 1,
	className = "",
	defaultActionsOpen = false,
}: MacNotificationCardProps) {
	const content = <NotificationContent item={item} stackCount={stackCount} />;
	return (
		<article
			aria-label={`${item.appName} notification`}
			className={`mac-notification-card ${className}`}
			data-has-actions={
				(stackCount === 1 && Boolean(item.actions?.length)) || undefined
			}
			data-stacked={stackCount > 1 || undefined}
		>
			{onDismiss ? (
				<button
					aria-label={`Clear ${item.title ?? item.appName} notification${stackCount > 1 ? " group" : ""}`}
					className="mac-notification-dismiss"
					onClick={onDismiss}
					type="button"
				>
					<WindowSymbol name="close" size={16} />
				</button>
			) : null}
			{onOpen ? (
				<button
					aria-expanded={stackCount > 1 ? false : undefined}
					aria-label={openLabel}
					className="mac-notification-body"
					onClick={onOpen}
					type="button"
				>
					{content}
				</button>
			) : (
				<div className="mac-notification-body">{content}</div>
			)}
			{stackCount === 1 && item.actions?.length ? (
				<div className="mac-notification-actions">
					<MacMenuButton
						className="mac-notification-action-menu"
						defaultOpen={defaultActionsOpen}
						finalFocus={actionReturnFocus}
						items={item.actions.map((action) => ({
							...action,
							disabled: action.disabled || !onAction,
						}))}
						onAction={(id) => onAction?.(id, item)}
						positionerProps={{ align: "end", sideOffset: 4 }}
						trigger={
							<button
								aria-label={`Options for ${item.title ?? item.appName}`}
								className="mac-notification-options"
								disabled={!onAction}
								type="button"
							>
								Options <WindowSymbol name="chevron-down" size={12} />
							</button>
						}
					/>
				</div>
			) : null}
		</article>
	);
}

export interface MacNotificationWidget {
	content: ReactNode;
	id: string;
	size?: "small" | "medium" | "large";
}

export interface MacNotificationCenterPanelProps {
	className?: string;
	defaultExpandedGroups?: readonly string[];
	emptyMessage?: string;
	notifications: readonly MacNotification[];
	onAction?: MacNotificationCardProps["onAction"];
	onDismiss?: (ids: readonly string[]) => void;
	onEditWidgets?: () => void;
	onOpenNotification?: (item: MacNotification) => void;
	ref?: Ref<HTMLElement>;
	style?: CSSProperties;
	widgets?: readonly MacNotificationWidget[];
}

const EMPTY_WIDGETS: readonly MacNotificationWidget[] = [];
const EMPTY_GROUPS: readonly string[] = [];

export function MacNotificationCenterPanel({
	notifications,
	widgets = EMPTY_WIDGETS,
	defaultExpandedGroups = EMPTY_GROUPS,
	onAction,
	onDismiss,
	onEditWidgets,
	onOpenNotification,
	emptyMessage = "No Notifications",
	className = "",
	ref,
	style,
}: MacNotificationCenterPanelProps) {
	const [expanded, setExpanded] = useState<Set<string>>(
		() => new Set(defaultExpandedGroups)
	);
	const root = useRef<HTMLElement | null>(null);
	const groups = groupNotifications(notifications);
	const toggleGroup = (id: string) => {
		root.current?.focus({ preventScroll: true });
		setExpanded((current) => {
			const next = new Set(current);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};
	const dismiss = (ids: readonly string[]) => {
		root.current?.focus({ preventScroll: true });
		onDismiss?.(ids);
	};
	return (
		<section
			aria-label="Notifications and widgets"
			className={`mac-notification-center-panel ${className}`}
			ref={(element) => {
				root.current = element;
				if (typeof ref === "function") {
					return ref(element);
				}
				if (ref) {
					ref.current = element;
				}
			}}
			style={style}
			tabIndex={-1}
		>
			{notifications.length > 1 && onDismiss ? (
				<div className="mac-notification-tools">
					<button
						onClick={() => dismiss(notifications.map((item) => item.id))}
						type="button"
					>
						Clear All
					</button>
				</div>
			) : null}
			{groups.map((group) => {
				const isExpanded =
					expanded.has(group.appId) || group.items.length === 1;
				const visible = isExpanded ? group.items : group.items.slice(0, 1);
				return (
					<section
						aria-label={`${group.appName} notifications`}
						className="mac-notification-group"
						key={group.appId}
					>
						{isExpanded && group.items.length > 1 ? (
							<div className="mac-notification-group-heading">
								<strong>{group.appName}</strong>
								<button
									aria-expanded
									aria-label={`Show fewer ${group.appName} notifications`}
									onClick={() => toggleGroup(group.appId)}
									type="button"
								>
									Show less
								</button>
							</div>
						) : null}
						{visible.map((item) => (
							<MacNotificationCard
								actionReturnFocus={root}
								item={item}
								key={item.id}
								onAction={onAction}
								onDismiss={
									onDismiss
										? () =>
												dismiss(
													isExpanded
														? [item.id]
														: group.items.map((entry) => entry.id)
												)
										: undefined
								}
								onOpen={
									isExpanded
										? onOpenNotification && (() => onOpenNotification(item))
										: () => toggleGroup(group.appId)
								}
								openLabel={
									isExpanded
										? `Open ${item.title ?? item.appName} notification`
										: `Expand ${group.appName}, ${group.items.length} notifications`
								}
								stackCount={isExpanded ? 1 : group.items.length}
							/>
						))}
					</section>
				);
			})}
			{notifications.length || widgets.length ? null : (
				<p className="mac-notification-empty">{emptyMessage}</p>
			)}
			{widgets.length ? (
				<section aria-label="Widgets" className="mac-notification-widgets">
					{widgets.map((widget) => (
						<div
							className="mac-notification-widget"
							data-size={widget.size ?? "small"}
							key={widget.id}
						>
							{widget.content}
						</div>
					))}
				</section>
			) : null}
			{onEditWidgets ? (
				<button
					className="mac-notification-edit"
					onClick={onEditWidgets}
					type="button"
				>
					Edit Widgets
				</button>
			) : null}
		</section>
	);
}

export interface MacNotificationCenterProps
	extends Omit<MacNotificationCenterPanelProps, "ref"> {
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	open?: boolean;
	trigger: ReactElement;
}

export function MacNotificationCenter({
	trigger,
	open,
	defaultOpen,
	onOpenChange,
	...panel
}: MacNotificationCenterProps) {
	const container = useMacOSPortal();
	const initialFocus = useRef<HTMLElement>(null);
	const [portalReady, setPortalReady] = useState(false);
	// Wait for the environment ref before mounting an initially open portal.
	useLayoutEffect(() => setPortalReady(true), []);
	return (
		<Popover.Root
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			open={open}
		>
			<Popover.Trigger render={trigger} />
			{portalReady ? (
				<Popover.Portal container={container}>
					<Popover.Positioner
						align="end"
						className="mac-notification-positioner"
						collisionAvoidance={{
							align: "shift",
							fallbackAxisSide: "none",
							side: "none",
						}}
						collisionBoundary={container?.current ?? undefined}
						collisionPadding={0}
						side="bottom"
						sideOffset={2}
					>
						<Popover.Popup
							aria-label="Notification Center"
							className="mac-notification-center"
							initialFocus={() => initialFocus.current}
						>
							<MacNotificationCenterPanel {...panel} ref={initialFocus} />
						</Popover.Popup>
					</Popover.Positioner>
				</Popover.Portal>
			) : null}
		</Popover.Root>
	);
}

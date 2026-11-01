/** biome-ignore-all lint/performance/noJsxPropsBind: Demo callbacks update caller-owned notification data. */
import { MacCheckbox } from "@anyway-design/macos/checkbox";
import {
	type MacNotification,
	MacNotificationCenter,
	type MacNotificationCenterPanelProps,
	type MacNotificationWidget,
} from "@anyway-design/macos/notification-center";
import { type CSSProperties, useState } from "react";
import type { PlaygroundDemoProps } from "./playground-catalog";
import "./notification-demo.css";

export const REMINDER: MacNotification = {
	actions: [
		{ id: "complete", label: "Mark as Completed" },
		{ id: "hour", label: "Remind Me in an Hour" },
		{ id: "afternoon", label: "Remind Me This Afternoon" },
		{ id: "tomorrow", label: "Remind Me Tomorrow" },
	],
	appId: "reminders",
	appName: "Reminders",
	body: "Today, 9:45 AM",
	icon: (
		<img
			alt=""
			height={32}
			src="/assets/notification-icons/reminders.png"
			width={32}
		/>
	),
	id: "brunch",
	timeSensitive: true,
	title: "Brunch",
};
export const DEMO_NOTIFICATIONS: readonly MacNotification[] = [
	REMINDER,
	{
		actions: [{ id: "reply", label: "Reply" }],
		appId: "messages",
		appName: "Messages",
		body: "The new icons are ready to review. I’ve updated the toolbar, sidebar, and file previews to match Tahoe more closely. Please check the spacing and selected states before we publish the next version.",
		icon: (
			<img
				alt=""
				height={32}
				src="/assets/notification-icons/messages.png"
				width={32}
			/>
		),
		id: "design",
		time: "now",
		title: "Design team",
	},
	{
		appId: "messages",
		appName: "Messages",
		body: "Let’s meet at 10.",
		icon: (
			<img
				alt=""
				height={32}
				src="/assets/notification-icons/messages.png"
				width={32}
			/>
		),
		id: "meeting",
		time: "5m ago",
		title: "Morgan",
	},
	{
		actions: [{ id: "read", label: "Mark as Read" }],
		appId: "mail",
		appName: "Mail",
		body: "Your weekly reading list is here.",
		icon: <img alt="" height={32} src="/assets/mail.webp" width={32} />,
		id: "reading",
		time: "12m ago",
		title: "This week’s highlights",
	},
];

const EVENTS = [
	{
		color: "#d7b100",
		id: "student",
		time: "1–1:30PM",
		title: "Student Government meeting",
	},
	{
		color: "#de5252",
		id: "writing",
		time: "3–3:30PM",
		title: "Writing session with Anthony",
	},
	{
		color: "#d7b100",
		id: "soccer",
		time: "4–4:30PM",
		title: "⚽ Soccer practice",
	},
	{
		color: "#299952",
		id: "groceries",
		time: "5:30–7PM",
		title: "Drop off Grandma’s groceries",
	},
	{
		color: "#d7b100",
		id: "homework",
		time: "7–8:30PM",
		title: "Homework help",
	},
];
function AgendaEvent({ event }: { event: (typeof EVENTS)[number] }) {
	return (
		<span
			className="nc-demo-event"
			style={{ "--event-color": event.color } as CSSProperties}
		>
			<strong>{event.title}</strong>
			<span>{event.time}</span>
		</span>
	);
}
function AgendaWidget({
	onOpen,
	reference,
}: {
	onOpen: () => void;
	reference: boolean;
}) {
	return (
		<button
			aria-label="Open Calendar widget"
			className="nc-demo-agenda"
			onClick={onOpen}
			type="button"
		>
			<span className="nc-demo-agenda-column">
				<span className="nc-demo-date">
					<strong>{reference ? "Tuesday" : "Thursday"}</strong>
					<span>{reference ? "1" : "22"}</span>
				</span>
				{EVENTS.slice(0, 2).map((event) => (
					<AgendaEvent event={event} key={event.id} />
				))}
			</span>
			<span className="nc-demo-agenda-column">
				{EVENTS.slice(2).map((event) => (
					<AgendaEvent event={event} key={event.id} />
				))}
			</span>
		</button>
	);
}
function ClockWidget({ onOpen }: { onOpen: () => void }) {
	return (
		<button
			aria-label="Open Clock widget"
			className="nc-demo-clock"
			onClick={onOpen}
			type="button"
		>
			<span>9:41</span>
		</button>
	);
}
function ReadingWidget({ onOpen }: { onOpen: () => void }) {
	return (
		<button
			aria-label="Open Reading List widget"
			className="nc-demo-reading"
			onClick={onOpen}
			type="button"
		>
			<span>
				<img
					alt=""
					height={16}
					src="/assets/notification-icons/safari-symbol.png"
					width={16}
				/>
				Reading List
			</span>
			<strong>India Trip · Group Travel | Atlas Obscura Adventures</strong>
			<small>atlasobscura.com</small>
		</button>
	);
}

export function notificationWidgets(
	onEvent: (message: string) => void,
	reference = false
): MacNotificationWidget[] {
	return [
		{
			content: (
				<AgendaWidget
					onOpen={() => onEvent("Open Calendar widget")}
					reference={reference}
				/>
			),
			id: "calendar",
			size: "medium",
		},
		{
			content: (
				<ReadingWidget onOpen={() => onEvent("Open Reading List widget")} />
			),
			id: "reading",
		},
		{
			content: <ClockWidget onOpen={() => onEvent("Open Clock widget")} />,
			id: "clock",
		},
	];
}

export function useNotificationDemo(
	onEvent: (message: string) => void,
	showWidgets = true,
	reference = false
) {
	const [notifications, setNotifications] =
		useState<readonly MacNotification[]>(DEMO_NOTIFICATIONS);
	const [editing, setEditing] = useState(false);
	const [hidden, setHidden] = useState<readonly string[]>([]);
	const dismiss = (ids: readonly string[]) => {
		setNotifications((current) =>
			current.filter((item) => !ids.includes(item.id))
		);
		onEvent(
			`Dismissed ${ids.length} notification${ids.length === 1 ? "" : "s"}`
		);
	};
	const widgets = showWidgets
		? notificationWidgets(onEvent, reference).filter(
				(widget) => !hidden.includes(widget.id)
			)
		: [];
	if (editing) {
		widgets.push({
			content: (
				<div className="nc-demo-editor">
					<strong>Demo widgets</strong>
					{["calendar", "reading", "clock"].map((id) => (
						<MacCheckbox
							checked={!hidden.includes(id)}
							key={id}
							label={
								id === "reading"
									? "Reading List"
									: id[0].toUpperCase() + id.slice(1)
							}
							onCheckedChange={(checked) =>
								setHidden((current) =>
									checked
										? current.filter((item) => item !== id)
										: [...current, id]
								)
							}
						/>
					))}
					<button onClick={() => setEditing(false)} type="button">
						Done
					</button>
				</div>
			),
			id: "editor",
			size: "medium",
		});
	}
	const panel: MacNotificationCenterPanelProps = {
		notifications,
		onAction: (id, item) => {
			dismiss([item.id]);
			onEvent(`${item.appName}: ${id}`);
		},
		onDismiss: dismiss,
		onEditWidgets: () => setEditing((current) => !current),
		onOpenNotification: (item) => onEvent(`Open ${item.title ?? item.appName}`),
		widgets,
	};
	return {
		panel,
		reset: () => {
			setNotifications(DEMO_NOTIFICATIONS);
			setHidden([]);
			setEditing(false);
		},
	};
}

export function NotificationCenterDemo({
	onEvent,
	values,
}: PlaygroundDemoProps) {
	const { panel } = useNotificationDemo(onEvent, Boolean(values.widgets));
	return (
		<MacNotificationCenter
			{...panel}
			defaultOpen={Boolean(values.defaultOpen)}
			notifications={values.notifications ? panel.notifications : []}
			trigger={
				<button className="nc-demo-trigger" type="button">
					Thu Oct 22 9:41 AM
				</button>
			}
		/>
	);
}

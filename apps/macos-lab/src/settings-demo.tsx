/** biome-ignore-all lint/performance/noJsxPropsBind: The playground reports caller-owned setting changes. */
import { MacSwitch, MacTextField } from "@anyway-design/macos/controls";
import { MacPopUpButton } from "@anyway-design/macos/pop-up-button";
import { MacSegmentedControl } from "@anyway-design/macos/segmented-control";
import {
	MacSettings,
	type MacSettingsProps,
	type MacSettingsSection,
} from "@anyway-design/macos/settings";
import { MacSlider } from "@anyway-design/macos/slider";
import { MacStepper } from "@anyway-design/macos/stepper";
import {
	WindowSymbol,
	type WindowSymbolName,
} from "@anyway-design/macos/window-symbol";
import type { CSSProperties } from "react";
import type { PlaygroundDemoProps } from "./playground-catalog";
import "./settings-demo.css";

function SettingsIcon({
	name,
	color = "#8c8e92",
}: {
	name: WindowSymbolName;
	color?: string;
}) {
	return (
		<span className="settings-demo-icon" style={{ background: color }}>
			<WindowSymbol name={name} size={16} />
		</span>
	);
}
interface SettingsExampleProps
	extends Pick<
		MacSettingsProps,
		| "active"
		| "defaultSection"
		| "defaultSearchQuery"
		| "onClose"
		| "onMinimize"
		| "onZoom"
		| "searchable"
		| "sidebarWidth"
	> {
	disabled?: boolean;
	onEvent: (message: string) => void;
	readOnly?: boolean;
	style?: CSSProperties;
}
export function SettingsExample({
	onEvent,
	disabled = false,
	readOnly = false,
	...props
}: SettingsExampleProps) {
	const common = { disabled, readOnly };
	const event = (label: string, value: unknown) =>
		onEvent(`${label} → ${value}`);
	const toggle = (label: string, value: boolean) => (
		<MacSwitch
			{...common}
			aria-label={label}
			defaultChecked={value}
			label=""
			onCheckedChange={(next) => event(label, next)}
		/>
	);
	const popup = (label: string, value: string, items: string[]) => (
		<MacPopUpButton
			{...common}
			defaultValue={value}
			items={items.map((item) => ({ label: item, value: item }))}
			label={label}
			onValueChange={(next) => event(label, next)}
		/>
	);
	const sections: MacSettingsSection[] = [
		{
			description:
				"Manage your workspace’s overall setup and preferences, such as appearance, notifications, privacy, and more.",
			groups: [
				{
					id: "overview",
					items: [
						{
							icon: <SettingsIcon name="appearance" />,
							id: "appearance",
							label: "Appearance",
							sectionId: "appearance",
						},
						{
							icon: <SettingsIcon name="speaker" />,
							id: "notifications",
							label: "Notifications",
							sectionId: "notifications",
						},
						{
							icon: <SettingsIcon name="lock" />,
							id: "privacy",
							label: "Privacy & Security",
							sectionId: "privacy",
						},
					],
				},
				{
					id: "advanced-link",
					items: [
						{
							icon: <SettingsIcon name="gear" />,
							id: "advanced",
							label: "Advanced",
							sectionId: "advanced",
						},
					],
				},
				{
					id: "workspace",
					items: [
						{
							control: (
								<MacTextField
									{...common}
									aria-label="Workspace name"
									defaultValue="Anyway workspace"
									onChange={(e) =>
										event("Workspace name", e.currentTarget.value)
									}
								/>
							),
							description: "Shown in your windows and shared projects.",
							id: "name",
							keywords: ["profile", "rename"],
							label: "Workspace name",
						},
						{
							control: toggle("Open at login", true),
							description: "Keep your workspace ready when you start your Mac.",
							id: "launch",
							keywords: ["startup", "launch", "automatically"],
							label: "Open at login",
						},
					],
					title: "Workspace",
				},
				{
					description:
						"Your preferences apply to new documents in this workspace.",
					id: "files",
					items: [
						{
							control: toggle("Save changes automatically", true),
							id: "autosave",
							keywords: ["autosave", "documents"],
							label: "Save changes automatically",
						},
						{
							control: popup("Default save location", "Documents", [
								"Documents",
								"Desktop",
								"iCloud Drive",
							]),
							id: "location",
							label: "Default save location",
						},
						{
							control: (
								<MacStepper
									{...common}
									defaultValue={10}
									label="Recent items"
									max={30}
									min={0}
									onValueChange={(next) => event("Recent items", next)}
								/>
							),
							description: "Choose how many documents appear in the File menu.",
							id: "recent",
							keywords: ["history"],
							label: "Recent items",
						},
					],
					title: "Files",
				},
			],
			icon: <SettingsIcon name="gear" />,
			id: "general",
			title: "General",
		},
		{
			groups: [
				{
					id: "style",
					items: [
						{
							control: (
								<MacSegmentedControl
									{...common}
									className="settings-demo-image-choices"
									defaultValue="Auto"
									items={["Auto", "Light", "Dark"].map((value) => ({
										icon: (
											<>
												<img
													alt=""
													height={44}
													src={`/assets/tahoe-settings/Appearance${value}.png`}
													width={67}
												/>
												<span>{value}</span>
											</>
										),
										label: value,
										value,
									}))}
									label="Appearance"
									onValueChange={(next) => event("Appearance", next)}
								/>
							),

							id: "theme",
							keywords: ["dark", "light", "system"],
							label: "Appearance",
						},
						{
							control: (
								<MacSegmentedControl
									{...common}
									className="settings-demo-image-choices"
									defaultValue="Tinted"
									items={["Clear", "Tinted"].map((value) => ({
										icon: (
											<>
												<img
													alt=""
													height={44}
													src={`/assets/tahoe-settings/Glass${value}.png`}
													width={67}
												/>
												<span>{value}</span>
											</>
										),
										label: value,
										value,
									}))}
									label="Liquid Glass"
									onValueChange={(next) => event("Liquid Glass", next)}
								/>
							),
							description: "Choose your preferred look for Liquid Glass.",
							id: "glass",
							label: "Liquid Glass",
						},
					],
				},
				{
					id: "theme",
					items: [
						{
							control: popup("Accent color", "Blue", [
								"Blue",
								"Purple",
								"Green",
								"Orange",
							]),
							id: "accent",
							label: "Accent color",
						},
						{
							control: toggle("Compact spacing", false),
							description: "Fit more content into lists and sidebars.",
							id: "compact",
							keywords: ["density"],
							label: "Compact spacing",
						},
					],
					title: "Theme",
				},
				{
					id: "motion",
					items: [
						{
							control: toggle("Reduce motion", false),
							description: "Use simpler transitions in your workspace.",
							id: "motion",
							keywords: ["animations"],
							label: "Reduce motion",
						},
						{
							control: toggle("Increase contrast", false),
							id: "contrast",
							keywords: ["legibility"],
							label: "Increase contrast",
						},
					],
					title: "Accessibility",
				},
			],
			header: "toolbar",
			icon: <SettingsIcon name="appearance" />,
			id: "appearance",
			keywords: ["theme", "display", "look"],
			title: "Appearance",
		},
		{
			description: "Stay informed, on your terms.",
			groups: [
				{
					id: "alerts",
					items: [
						{
							control: toggle("Allow notifications", true),
							id: "allow",
							label: "Allow notifications",
						},
						{
							control: toggle("Play notification sounds", false),
							description: "Play a sound when a new notification arrives.",
							id: "sounds",
							keywords: ["audio"],
							label: "Play notification sounds",
						},
						{
							control: (
								<MacSlider
									{...common}
									defaultValue={60}
									label="Alert volume"
									max={100}
									min={0}
									onValueChange={(next) => event("Alert volume", next)}
								/>
							),
							id: "volume",
							keywords: ["sound", "audio"],
							label: "Alert volume",
						},
						{
							control: toggle("Badge app icon", true),
							description: "Show an unread count in the Dock.",
							id: "badge",
							keywords: ["unread", "count", "dock"],
							label: "Badge app icon",
						},
					],
					title: "Alerts",
				},
			],
			header: "toolbar",
			icon: <SettingsIcon name="speaker" />,
			id: "notifications",
			keywords: ["alerts"],
			title: "Notifications",
		},
		{
			description: "Control what you share and how you stay protected.",
			groups: [
				{
					id: "privacy",
					items: [
						{
							control: toggle("Share anonymous analytics", false),
							description: "Help improve the app by sharing usage statistics.",
							id: "analytics",
							keywords: ["telemetry", "diagnostics", "tracking"],
							label: "Share anonymous analytics",
						},
						{
							control: toggle("Show document previews", true),
							description: "Display document contents in recent items.",
							id: "previews",
							keywords: ["sensitive"],
							label: "Show document previews",
						},
					],
					title: "Privacy",
				},
				{
					id: "security",
					items: [
						{
							control: popup("Lock after inactivity", "5 minutes", [
								"1 minute",
								"5 minutes",
								"15 minutes",
								"Never",
							]),
							id: "lock",
							label: "Lock after inactivity",
						},
						{
							control: toggle("Require authentication", true),
							description:
								"Ask for authentication when reopening your workspace.",
							id: "unlock",
							keywords: ["password", "unlock"],
							label: "Require authentication",
						},
					],
					title: "Security",
				},
			],
			header: "toolbar",
			icon: <SettingsIcon name="lock" />,
			id: "privacy",
			title: "Privacy & Security",
		},
		{
			description: "Fine-tune how your workspace works.",
			groups: [
				{
					id: "sync",
					items: [
						{
							control: toggle("Sync in the background", true),
							description: "Keep files up to date while the app is idle.",
							id: "sync",
							keywords: ["cloud"],
							label: "Sync in the background",
						},
						{
							control: (
								<MacStepper
									{...common}
									defaultValue={3}
									label="Concurrent transfers"
									max={10}
									min={1}
									onValueChange={(next) => event("Concurrent transfers", next)}
								/>
							),
							id: "transfers",
							keywords: ["downloads", "uploads"],
							label: "Concurrent transfers",
						},
					],
					title: "Performance",
				},
				{
					id: "developer",
					items: [
						{
							control: toggle("Show developer tools", false),
							id: "debug",
							keywords: ["debug", "inspector"],
							label: "Show developer tools",
						},
						{
							control: popup("Log level", "Warnings", [
								"Errors",
								"Warnings",
								"Info",
								"Debug",
							]),
							id: "log",
							label: "Log level",
						},
					],
					title: "Developer",
				},
			],
			header: "toolbar",
			icon: <SettingsIcon name="control-center" />,
			id: "advanced",
			title: "Advanced",
		},
	];
	return (
		<MacSettings
			{...props}
			onSearchQueryChange={(query) => event("Search", query)}
			onSectionChange={(id) => event("Section", id)}
			sections={sections}
			sidebarHeader={
				<div className="settings-demo-brand">
					<WindowSymbol name="person" size={40} />
					<div>
						<strong>Anyway</strong>
						<small>Local account</small>
					</div>
				</div>
			}
			title="Anyway Settings"
		/>
	);
}
export function SettingsDemo({ values, onEvent }: PlaygroundDemoProps) {
	return (
		<SettingsExample
			active={Boolean(values.active)}
			defaultSection={String(values.section)}
			disabled={Boolean(values.disabled)}
			onClose={() => onEvent("Close requested")}
			onEvent={onEvent}
			onMinimize={() => onEvent("Minimize requested")}
			onZoom={() => onEvent("Zoom requested")}
			readOnly={Boolean(values.readOnly)}
			searchable={Boolean(values.searchable)}
			sidebarWidth={Number(values.sidebarWidth)}
			style={{ height: 640, width: 724 }}
		/>
	);
}

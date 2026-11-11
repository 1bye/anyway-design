/** biome-ignore-all lint/performance/noJsxPropsBind: Demo controls report caller-owned setting changes. */
import { MacButton, MacSwitch, MacTextField } from "@1bye/macos/controls";
import { MacDatePicker } from "@1bye/macos/date-picker";
import { MacPopUpButton } from "@1bye/macos/pop-up-button";
import { MacProgressBar } from "@1bye/macos/progress";
import { MacSegmentedControl } from "@1bye/macos/segmented-control";
import {
	MacSettings,
	type MacSettingsProps,
	type MacSettingsSection,
} from "@1bye/macos/settings";
import { MacSlider } from "@1bye/macos/slider";
import { WindowSymbol } from "@1bye/macos/window-symbol";
import { type CSSProperties, useState } from "react";
import type { PlaygroundDemoProps } from "./playground-catalog";
import {
	SETTINGS_DEMO_PAGES,
	type SettingsDemoField,
} from "./settings-demo-pages";
import "./settings-demo.css";

function SettingsIcon({ name }: { name: string }) {
	if (name !== "passwords" && name !== "advanced") {
		return (
			<span
				aria-hidden
				className="settings-demo-icon settings-demo-native-icon"
				style={
					{
						"--settings-icon": `url("/assets/tahoe-settings/icons/${name}.png")`,
						"--settings-icon-color": `url("/assets/tahoe-settings/icons/color/${name}.png")`,
						"--settings-icon-color-large": `url("/assets/tahoe-settings/icons/color/${name}-large.png")`,
						"--settings-icon-large": `url("/assets/tahoe-settings/icons/${name}-large.png")`,
					} as CSSProperties
				}
			/>
		);
	}
	return (
		<span aria-hidden className="settings-demo-icon settings-demo-symbol">
			<span
				className="settings-demo-glyph"
				style={{
					maskImage: `url("/assets/tahoe-settings/symbols/${name}.png")`,
					WebkitMaskImage: `url("/assets/tahoe-settings/symbols/${name}.png")`,
				}}
			/>
		</span>
	);
}

const SYSTEM_SIDEBAR = [
	["wifi", "Wi-Fi", "wifi", "connectivity"],
	["bluetooth", "Bluetooth", "bluetooth", "connectivity"],
	["network", "Network", "network", "connectivity"],
	["vpn", "VPN", "vpn", "connectivity"],
	["battery", "Battery", "battery", "connectivity"],
	["general", "General", "gear", "system"],
	["accessibility", "Accessibility", "accessibility", "system"],
	["appearance", "Appearance", "appearance", "system"],
	["intelligence", "Apple Intelligence & Siri", "intelligence", "system"],
	["desktop", "Desktop & Dock", "desktop", "system"],
	["displays", "Displays", "display", "system"],
	["menu-bar", "Menu Bar", "control-center", "system"],
	["spotlight", "Spotlight", "search", "system"],
	["wallpaper", "Wallpaper", "wallpaper", "system"],
	["notifications", "Notifications", "notifications", "attention"],
	["sound", "Sound", "speaker", "attention"],
	["focus", "Focus", "focus", "attention"],
	["screen-time", "Screen Time", "screen-time", "attention"],
	["lock-screen", "Lock Screen", "lock", "security"],
	["privacy", "Privacy & Security", "privacy", "security"],
] as const;

const GENERAL_CARDS = [
	[
		["about", "About", "about"],
		["software-update", "Software Update", "software-update"],
		["storage", "Storage", "storage"],
	],
	[["care", "AppleCare & Warranty", "care"]],
	[["airdrop", "AirDrop & Continuity", "airdrop"]],
	[
		["passwords", "AutoFill & Passwords", "passwords"],
		["date", "Date & Time", "date"],
		["language", "Language & Region", "language"],
		["login", "Login Items & Extensions", "login"],
		["sharing", "Sharing", "sharing"],
		["startup", "Startup Disk", "startup"],
		["time-machine", "Time Machine", "time-machine"],
	],
	[["management", "Device Management", "management"]],
] as const;

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
	iconAppearance?: "color" | "monochrome";
	onEvent: (message: string) => void;
	onIconAppearanceChange?: (value: "color" | "monochrome") => void;
	readOnly?: boolean;
	style?: CSSProperties;
}
function AppearanceSample({ value, glass }: { value: string; glass: boolean }) {
	return (
		<span
			aria-hidden
			className="settings-demo-sample"
			data-glass={glass || undefined}
			data-look={value}
		>
			<span className="settings-demo-sample-selection" />
			<span className="settings-demo-sample-window">
				<i />
				<i />
				<i />
			</span>
		</span>
	);
}
function SettingsField({
	field,
	disabled,
	readOnly,
	onEvent,
	iconAppearance,
	onIconAppearanceChange,
}: {
	field: SettingsDemoField;
	disabled: boolean;
	readOnly: boolean;
	onEvent: (message: string) => void;
	iconAppearance: "color" | "monochrome";
	onIconAppearanceChange: (value: "color" | "monochrome") => void;
}) {
	const [result, setResult] = useState("");
	const common = { disabled, readOnly };
	const report = (value: unknown) => onEvent(`${field.label} → ${value}`);
	const isIconStyle = field.label === "Icon & widget style";
	const iconStyle = iconAppearance === "color" ? "Default" : "Clear";
	switch (field.kind) {
		case "switch":
			return (
				<MacSwitch
					{...common}
					aria-label={field.label}
					defaultChecked={field.value}
					label=""
					onCheckedChange={report}
				/>
			);
		case "select":
			return (
				<MacPopUpButton
					{...common}
					defaultValue={field.value}
					items={field.options.map((value) => ({ label: value, value }))}
					label={field.label}
					onValueChange={(value) => {
						if (isIconStyle) {
							onIconAppearanceChange(
								value === "Clear" ? "monochrome" : "color"
							);
						}
						report(value);
					}}
					value={isIconStyle ? iconStyle : undefined}
				/>
			);
		case "slider":
			return (
				<MacSlider
					{...common}
					defaultValue={field.value}
					label={field.label}
					max={100}
					min={0}
					onValueChange={report}
				/>
			);
		case "text":
			return (
				<MacTextField
					{...common}
					aria-label={field.label}
					defaultValue={field.value}
					onChange={(event) => report(event.currentTarget.value)}
				/>
			);
		case "info":
			return <span className="settings-demo-value">{field.value}</span>;
		case "progress":
			return <MacProgressBar label={field.label} value={field.value} />;
		case "date":
			return (
				<MacDatePicker
					{...common}
					defaultValue={field.value}
					label={field.label}
					mode={field.mode}
					onValueChange={report}
				/>
			);
		case "action":
			return (
				<div className="settings-demo-action">
					<MacButton
						disabled={disabled || readOnly}
						onClick={() => {
							setResult(field.result);
							report(field.result);
						}}
					>
						{field.button}
					</MacButton>
					<output aria-live="polite">{result}</output>
				</div>
			);
		case "appearance":
			return (
				<MacSegmentedControl
					{...common}
					className="settings-demo-image-choices"
					defaultValue={field.value}
					items={field.options.map((value) => ({
						icon: (
							<>
								<AppearanceSample
									glass={field.label === "Liquid Glass"}
									value={value}
								/>
								<span>{value}</span>
							</>
						),
						label: value,
						value,
					}))}
					label={field.label}
					onValueChange={report}
				/>
			);
		default:
			return null;
	}
}
export function SettingsExample({
	onEvent,
	disabled = false,
	readOnly = false,
	iconAppearance,
	onIconAppearanceChange,
	...props
}: SettingsExampleProps) {
	const [localIconAppearance, setLocalIconAppearance] = useState<
		"color" | "monochrome"
	>("color");
	const currentIconAppearance = iconAppearance ?? localIconAppearance;
	const changeIconAppearance = (value: "color" | "monochrome") => {
		setLocalIconAppearance(value);
		onIconAppearanceChange?.(value);
	};
	const groups = (id: string) =>
		(SETTINGS_DEMO_PAGES[id] ?? []).map((group, index) => ({
			id: group.title ?? `${id}-${index}`,
			items: group.fields.map((field) => ({
				control: (
					<SettingsField
						disabled={disabled}
						field={field}
						iconAppearance={currentIconAppearance}
						onEvent={onEvent}
						onIconAppearanceChange={changeIconAppearance}
						readOnly={readOnly}
					/>
				),
				description: field.kind === "switch" ? field.description : undefined,
				id: field.label,
				label: field.label,
			})),
			title: group.title,
		}));
	const sections: MacSettingsSection[] = SYSTEM_SIDEBAR.map(
		([id, title, icon, sidebarGroup]) => ({
			description:
				id === "general"
					? "Manage your overall setup and preferences for Mac, such as software updates, device language, AirDrop and more."
					: undefined,
			groups:
				id === "general"
					? GENERAL_CARDS.map((items) => ({
							id: items[0][0],
							items: items.map(([destination, label, name]) => ({
								icon: <SettingsIcon name={name} />,
								id: destination,
								label,
								sectionId: destination,
							})),
						}))
					: groups(id),
			header: id === "general" ? "summary" : "toolbar",
			icon: <SettingsIcon name={icon} />,
			id,
			sidebarGroup,
			title,
		})
	);
	for (const items of GENERAL_CARDS) {
		for (const [id, title, icon] of items) {
			sections.push({
				groups: groups(id),
				header: "toolbar",
				icon: <SettingsIcon name={icon} />,
				id,
				parentId: "general",
				sidebar: false,
				title,
			});
		}
	}
	sections.push({
		groups: groups("advanced"),
		header: "toolbar",
		id: "advanced",
		parentId: "general",
		sidebar: false,
		title: "Advanced",
	});
	return (
		<MacSettings
			{...props}
			className={
				currentIconAppearance === "monochrome"
					? "settings-demo-monochrome"
					: undefined
			}
			onSearchQueryChange={(query) => onEvent(`Search → ${query}`)}
			onSectionChange={(id) => onEvent(`Section → ${id}`)}
			sections={sections}
			sidebarHeader={
				<div className="settings-demo-brand">
					<WindowSymbol name="person" size={38} />
					<div>
						<strong>Alex Morgan</strong>
						<small>Apple Account</small>
					</div>
				</div>
			}
			title="System Settings"
		/>
	);
}
export function SettingsDemo({
	values,
	onEvent,
	onPropertyChange,
}: PlaygroundDemoProps) {
	return (
		<SettingsExample
			active={Boolean(values.active)}
			defaultSection={String(values.section)}
			disabled={Boolean(values.disabled)}
			iconAppearance={
				values.iconAppearance === "monochrome" ? "monochrome" : "color"
			}
			onClose={() => onEvent("Close requested")}
			onEvent={onEvent}
			onIconAppearanceChange={(value) =>
				onPropertyChange("iconAppearance", value)
			}
			onMinimize={() => onEvent("Minimize requested")}
			onZoom={() => onEvent("Zoom requested")}
			readOnly={Boolean(values.readOnly)}
			searchable={Boolean(values.searchable)}
			sidebarWidth={Number(values.sidebarWidth)}
			style={{ height: 830, width: 724 }}
		/>
	);
}

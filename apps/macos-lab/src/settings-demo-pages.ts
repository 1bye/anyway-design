export type SettingsDemoField =
	| { kind: "switch"; label: string; value: boolean; description?: string }
	| { kind: "select"; label: string; value: string; options: string[] }
	| { kind: "progress"; label: string; value: number }
	| { kind: "slider"; label: string; value: number }
	| { kind: "text"; label: string; value: string }
	| { kind: "info"; label: string; value: string }
	| { kind: "action"; label: string; button: string; result: string }
	| { kind: "appearance"; label: string; value: string; options: string[] }
	| { kind: "date"; label: string; value: string; mode: "date" | "time" };
export interface SettingsDemoGroup {
	fields: SettingsDemoField[];
	title?: string;
}
const toggle = (
	label: string,
	value = false,
	description?: string
): SettingsDemoField => ({ description, kind: "switch", label, value });
const select = (
	label: string,
	value: string,
	...options: string[]
): SettingsDemoField => ({ kind: "select", label, options, value });
const info = (label: string, value: string): SettingsDemoField => ({
	kind: "info",
	label,
	value,
});
const text = (label: string, value: string): SettingsDemoField => ({
	kind: "text",
	label,
	value,
});
const slider = (label: string, value: number): SettingsDemoField => ({
	kind: "slider",
	label,
	value,
});
const action = (
	label: string,
	button: string,
	result: string
): SettingsDemoField => ({ button, kind: "action", label, result });
const group = (
	fields: SettingsDemoField[],
	title?: string
): SettingsDemoGroup => ({ fields, title });

// Sample preferences are local to the preview; no operating-system settings are changed.
export const SETTINGS_DEMO_PAGES: Record<string, SettingsDemoGroup[]> = {
	about: [
		group([
			text("Name", "My Mac"),
			info("Chip", "Apple M4"),
			info("Memory", "16 GB"),
			info("macOS", "Tahoe 26.0"),
		]),
		group([
			info("Display", "Built-in Liquid Retina Display"),
			info("Storage", "256 GB of 512 GB available"),
		]),
	],
	accessibility: [
		group([toggle("VoiceOver"), toggle("Zoom")], "Vision"),
		group(
			[
				toggle("Reduce motion"),
				toggle("Increase contrast"),
				toggle("Reduce transparency"),
			],
			"Display"
		),
		group([toggle("Sticky Keys"), toggle("Slow Keys")], "Motor"),
	],
	advanced: [
		group(
			[
				text("Workspace name", "Anyway workspace"),
				toggle("Save changes automatically", true),
				select(
					"Default save location",
					"Documents",
					"Documents",
					"Desktop",
					"iCloud Drive"
				),
			],
			"Workspace"
		),
		group(
			[
				toggle("Sync in the background", true),
				select("Log level", "Warnings", "Errors", "Warnings", "Info", "Debug"),
			],
			"Developer"
		),
	],
	airdrop: [
		group(
			[
				select(
					"Allow me to be discovered by",
					"Contacts Only",
					"No One",
					"Contacts Only",
					"Everyone"
				),
			],
			"AirDrop"
		),
		group(
			[
				toggle("Allow Handoff between this Mac and your iCloud devices", true),
				toggle("AirPlay Receiver", true),
				select(
					"Allow AirPlay for",
					"Current User",
					"Current User",
					"Anyone on the Same Network",
					"Everyone"
				),
			],
			"Continuity"
		),
	],
	appearance: [
		group([
			{
				kind: "appearance",
				label: "Appearance",
				options: ["Auto", "Light", "Dark"],
				value: "Auto",
			},
			{
				kind: "appearance",
				label: "Liquid Glass",
				options: ["Clear", "Tinted"],
				value: "Tinted",
			},
		]),
		group(
			[
				select(
					"Colour",
					"Multicolour",
					"Multicolour",
					"Blue",
					"Purple",
					"Pink",
					"Red",
					"Orange",
					"Yellow",
					"Green",
					"Graphite"
				),
				select(
					"Text highlight colour",
					"Automatic",
					"Automatic",
					"Blue",
					"Purple",
					"Pink",
					"Red",
					"Orange",
					"Yellow",
					"Green"
				),
				select(
					"Icon & widget style",
					"Default",
					"Default",
					"Dark",
					"Clear",
					"Tinted"
				),
				select(
					"Folder colour",
					"Automatic",
					"Automatic",
					"Blue",
					"Purple",
					"Pink",
					"Orange",
					"Green"
				),
			],
			"Theme"
		),
		group(
			[
				select("Sidebar icon size", "Medium", "Small", "Medium", "Large"),
				toggle("Tint window background with wallpaper colour", true),
				select(
					"Show scroll bars",
					"Automatically",
					"Automatically",
					"When scrolling",
					"Always"
				),
				select(
					"Click in the scroll bar to",
					"Jump to the next page",
					"Jump to the next page",
					"Jump to the spot that’s clicked"
				),
			],
			"Windows"
		),
	],
	battery: [
		group([
			info("Battery level", "84%"),
			info("Power source", "Power adapter"),
			info("Battery health", "Normal"),
		]),
		group([
			select(
				"Low Power Mode",
				"Never",
				"Never",
				"Always",
				"Only on Battery",
				"Only on Power Adapter"
			),
			toggle("Optimised Battery Charging", true),
		]),
	],
	bluetooth: [
		group([toggle("Bluetooth", true, "Your Mac is discoverable as My Mac.")]),
		group(
			[
				select("Magic Keyboard", "Connected", "Connected", "Not connected"),
				select("Magic Trackpad", "Connected", "Connected", "Not connected"),
			],
			"My Devices"
		),
	],
	care: [
		group([
			info("My Mac", "Limited Warranty"),
			info("Coverage", "Hardware repairs and technical support"),
			info("Support", "90 days of complimentary technical support"),
		]),
	],
	date: [
		group([
			toggle("Set time and date automatically", true),
			{ kind: "date", label: "Date", mode: "date", value: "2026-11-01" },
			{ kind: "date", label: "Time", mode: "time", value: "10:30" },
		]),
		group([
			select("Time zone", "Lisbon", "Lisbon", "London", "New York", "Tokyo"),
			toggle("Set time zone automatically using your current location", true),
			toggle("24-hour time", true),
		]),
	],
	desktop: [
		group(
			[
				slider("Dock size", 45),
				slider("Magnification", 65),
				select("Position on screen", "Bottom", "Left", "Bottom", "Right"),
				select(
					"Minimise windows using",
					"Genie effect",
					"Genie effect",
					"Scale effect"
				),
				toggle("Automatically hide and show the Dock"),
				toggle("Show indicators for open applications", true),
			],
			"Dock"
		),
		group(
			[
				toggle("Show items on Desktop", true),
				toggle("Show widgets on Desktop", true),
				select(
					"Click wallpaper to reveal desktop",
					"Always",
					"Always",
					"Only in Stage Manager"
				),
				toggle("Stage Manager"),
			],
			"Desktop & Stage Manager"
		),
	],
	displays: [
		group([
			select("Use as", "Main display", "Main display", "Extended display"),
			select("Resolution", "Default", "Default", "Larger Text", "More Space"),
			slider("Brightness", 75),
			toggle("Automatically adjust brightness", true),
			toggle("True Tone", true),
		]),
		group([
			select("Refresh rate", "ProMotion", "ProMotion", "60 Hertz"),
			select(
				"Colour profile",
				"Colour LCD",
				"Colour LCD",
				"Display P3",
				"sRGB IEC61966-2.1"
			),
		]),
	],
	focus: [
		group([toggle("Do Not Disturb"), toggle("Share across devices", true)]),
		group(
			[
				select(
					"Turn on automatically",
					"Off",
					"Off",
					"For 1 hour",
					"Until this evening"
				),
				toggle("Allow repeated calls", true),
				toggle("Share Focus status", true),
			],
			"Do Not Disturb"
		),
	],
	intelligence: [
		group([toggle("Apple Intelligence", true)]),
		group([
			toggle("Siri", true),
			select(
				"Talk to Siri",
				"Siri or Hey Siri",
				"Siri or Hey Siri",
				"Hey Siri",
				"Off"
			),
			select(
				"Language",
				"English (United States)",
				"English (United States)",
				"English (United Kingdom)"
			),
			toggle("Type to Siri", true),
		]),
	],
	language: [
		group([
			select(
				"Preferred language",
				"English",
				"English",
				"Português",
				"Українська",
				"Deutsch",
				"Français"
			),
			select(
				"Region",
				"Portugal",
				"Portugal",
				"United Kingdom",
				"United States",
				"Ukraine"
			),
			select("Calendar", "Gregorian", "Gregorian", "Buddhist", "Japanese"),
			select("Temperature", "Celsius", "Celsius", "Fahrenheit"),
			select("Measurement system", "Metric", "Metric", "US", "UK"),
		]),
	],
	"lock-screen": [
		group([
			select(
				"Start Screen Saver when inactive",
				"For 5 minutes",
				"Never",
				"For 1 minute",
				"For 5 minutes",
				"For 10 minutes"
			),
			select(
				"Turn display off on battery when inactive",
				"For 2 minutes",
				"Never",
				"For 2 minutes",
				"For 5 minutes",
				"For 10 minutes"
			),
			select(
				"Turn display off on power adapter when inactive",
				"For 10 minutes",
				"Never",
				"For 5 minutes",
				"For 10 minutes",
				"For 30 minutes"
			),
			select(
				"Require password after screen saver begins or display is turned off",
				"Immediately",
				"Immediately",
				"After 5 seconds",
				"After 1 minute"
			),
		]),
		group([
			toggle("Show message when locked"),
			text("Lock message", "Welcome back"),
		]),
	],
	login: [
		group(
			[toggle("Calendar at login"), toggle("Messages at login")],
			"Open at Login"
		),
		group(
			[toggle("Cloud sync", true), toggle("Software updates", true)],
			"Allow in the Background"
		),
		group([toggle("Finder extensions", true)], "Extensions"),
	],
	management: [
		group([
			info("Profiles", "No profiles installed"),
			info("Device enrolment", "This Mac is not managed by an organisation."),
		]),
	],
	"menu-bar": [
		group([
			select(
				"Automatically hide and show the menu bar",
				"In Full Screen Only",
				"Always",
				"On Desktop Only",
				"In Full Screen Only",
				"Never"
			),
		]),
		group(
			[
				toggle("Wi-Fi in menu bar", true),
				toggle("Bluetooth in menu bar"),
				toggle("Battery in menu bar", true),
				toggle("Show battery percentage"),
				toggle("Spotlight in menu bar", true),
			],
			"Menu Bar Controls"
		),
		group(
			[
				select(
					"Show date",
					"When Space Allows",
					"Always",
					"When Space Allows",
					"Never"
				),
				toggle("Show seconds"),
			],
			"Clock"
		),
	],
	network: [
		group([
			select("Wi-Fi", "Connected", "Connected", "Not connected"),
			select(
				"Thunderbolt Bridge",
				"Not connected",
				"Not connected",
				"Connected"
			),
		]),
		group(
			[
				select("Configure IPv4", "Using DHCP", "Using DHCP", "Manually"),
				text("DNS server", "192.168.1.1"),
			],
			"Details"
		),
	],
	notifications: [
		group([
			select(
				"Show previews",
				"When Unlocked",
				"Always",
				"When Unlocked",
				"Never"
			),
			toggle("Allow notifications when the display is sleeping"),
			toggle("Allow notifications when the screen is locked", true),
			toggle("Allow notifications when mirroring or sharing the display"),
		]),
		group(
			[
				toggle("Calendar notifications", true),
				toggle("Mail notifications", true),
				toggle("Messages notifications", true),
			],
			"Application Notifications"
		),
	],
	passwords: [
		group([
			toggle("AutoFill Passwords and Passkeys", true),
			toggle("Delete verification codes after use", true),
		]),
		group(
			[toggle("Passwords", true), toggle("iCloud Keychain", true)],
			"AutoFill From"
		),
	],
	privacy: [
		group(
			[
				toggle("Location Services", true),
				toggle("Camera access", true),
				toggle("Microphone access", true),
			],
			"Privacy"
		),
		group(
			[toggle("Share Mac Analytics"), toggle("Share with app developers")],
			"Analytics & Improvements"
		),
		group(
			[
				info("FileVault", "On"),
				select(
					"Allow applications from",
					"App Store & Known Developers",
					"App Store",
					"App Store & Known Developers"
				),
			],
			"Security"
		),
	],
	"screen-time": [
		group([
			toggle("App & Website Activity", true),
			info("Today", "2 hours, 18 minutes"),
		]),
		group([
			toggle("Downtime"),
			select(
				"Daily app limit",
				"No Limit",
				"No Limit",
				"30 minutes",
				"1 hour",
				"2 hours"
			),
			toggle("Share across devices", true),
		]),
	],
	sharing: [
		group([
			text("Computer name", "My Mac"),
			info("Local hostname", "My-Mac.local"),
		]),
		group(
			[
				toggle("Screen Sharing"),
				toggle("File Sharing"),
				toggle("Printer Sharing"),
				toggle("Media Sharing"),
				toggle("Remote Login"),
			],
			"Content & Media"
		),
	],
	"software-update": [
		group([
			action("macOS Tahoe", "Check for Updates", "Your Mac is up to date"),
		]),
		group([
			toggle("Automatic Updates", true),
			select("Beta Updates", "Off", "Off", "macOS Public Beta"),
		]),
	],
	sound: [
		group(
			[
				select(
					"Alert sound",
					"Boop",
					"Boop",
					"Breeze",
					"Bubble",
					"Crystal",
					"Funky"
				),
				slider("Alert volume", 60),
				toggle("Play sound on startup", true),
				toggle("Play user interface sound effects", true),
			],
			"Sound Effects"
		),
		group(
			[
				select(
					"Output device",
					"MacBook Pro Speakers",
					"MacBook Pro Speakers",
					"Studio Display"
				),
				slider("Output volume", 70),
				toggle("Mute"),
			],
			"Output"
		),
		group(
			[
				select(
					"Input device",
					"MacBook Pro Microphone",
					"MacBook Pro Microphone",
					"Studio Display Microphone"
				),
				slider("Input volume", 60),
			],
			"Input"
		),
	],
	spotlight: [
		group([toggle("Show related content", true)]),
		group(
			[
				toggle("Applications", true),
				toggle("Documents", true),
				toggle("Folders", true),
				toggle("Images", true),
				toggle("Mail & Messages", true),
				toggle("System Settings", true),
			],
			"Search Results"
		),
	],
	startup: [
		group([
			select("Startup disk", "Macintosh HD", "Macintosh HD", "External macOS"),
			info("System", "macOS Tahoe 26.0"),
		]),
	],
	storage: [
		group([
			info("Macintosh HD", "256 GB of 512 GB used"),
			{ kind: "progress", label: "Storage used", value: 50 },
		]),
		group(
			[
				info("Applications", "84 GB"),
				info("Documents", "48 GB"),
				info("Photos", "32 GB"),
				info("macOS", "28 GB"),
				info("System Data", "64 GB"),
			],
			"Storage Categories"
		),
		group(
			[toggle("Optimise Storage", true), toggle("Empty Bin automatically")],
			"Recommendations"
		),
	],
	"time-machine": [
		group([
			select(
				"Backup disk",
				"No Disk Selected",
				"No Disk Selected",
				"Studio Backup"
			),
			select(
				"Backup frequency",
				"Automatically Every Hour",
				"Automatically Every Hour",
				"Automatically Every Day",
				"Manually"
			),
			toggle("Back up on battery power"),
		]),
	],
	vpn: [
		group([
			toggle(
				"Studio VPN",
				false,
				"Connect to your organisation’s private network."
			),
		]),
		group(
			[text("Server address", "vpn.example.com"), toggle("Connect on demand")],
			"Configuration"
		),
	],
	wallpaper: [
		group([
			select("Wallpaper", "Tahoe", "Tahoe", "Sequoia", "Sonoma", "Solid Blue"),
			select("Style", "Automatic", "Automatic", "Light", "Dark"),
			toggle("Show as screen saver", true),
			toggle("Show on all Spaces", true),
		]),
	],
	wifi: [
		group([
			toggle("Wi-Fi", true, "Connect your Mac to the internet wirelessly."),
		]),
		group(
			[
				select("Network", "Studio", "Studio", "Guest", "Not connected"),
				toggle("Automatically join this network", true),
			],
			"Known Networks"
		),
		group([
			select("Ask to join networks", "Notify", "Off", "Notify", "Ask"),
			select(
				"Ask to join hotspots",
				"Ask To Join",
				"Never",
				"Ask To Join",
				"Automatic"
			),
		]),
	],
};

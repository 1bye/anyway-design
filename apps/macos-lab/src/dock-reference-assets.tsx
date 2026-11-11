import type { DockItem } from "@1bye/macos/dock";

export const REFERENCE_IMAGE = "/assets/apple-tahoe-reference.jpg";
export const REFERENCE_SOURCE =
	"https://www.apple.com/newsroom/images/2025/06/macos-tahoe-26-makes-the-mac-more-capable-productive-and-intelligent-than-ever/article/Apple-WWDC25-macOS-Tahoe-26-Apple-Music-250609_big.jpg.large_2x.jpg";
export const ICON_SIZE = 52;
export const REFERENCE_SCALE = ICON_SIZE / 110;
export const REFERENCE_CROP = { height: 234, width: 3000, x: 420, y: 2190 };
export const REFERENCE_BACKDROP = {
	height: 1619.56,
	src: "/assets/tahoe-light.jpg",
	width: 1619.56,
	x: -119.62,
	y: -1257.81,
};

// Sample only the icon silhouettes, never the surrounding Dock surface.
// Translucency inside these prerelease icons is baked into Apple's photograph.
const APP_ICON_SHAPE =
	"M37 11H73C92 11 99 18 99 37V73C99 92 92 99 73 99H37C18 99 11 92 11 73V37C11 18 18 11 37 11Z";
const FOLDER_SHAPE = "M5 17Q5 13 9 13H36L42 21H99Q105 21 105 27V98H5Z";
const TRASH_SHAPE =
	"M15 16Q15 9 55 9Q95 9 95 16L86 88Q85 100 76 100H34Q25 100 24 88Z";

const APP_LABELS = [
	"Finder",
	"Apps",
	"Safari",
	"Messages",
	"Mail",
	"Maps",
	"Photos",
	"FaceTime",
	"Calendar",
	"Contacts",
	"Reminders",
	"Notes",
	"Freeform",
	"TV",
	"Music",
	"News",
	"Keynote",
	"Numbers",
	"Pages",
	"App Store",
	"iPhone Mirroring",
	"System Settings",
] as const;

function ReferenceIcon({
	id,
	x,
	y = 2282,
	shape = APP_ICON_SHAPE,
}: {
	id: string;
	x: number;
	y?: number;
	shape?: string;
}) {
	return (
		<svg
			aria-hidden="true"
			className="dock-study-icon"
			focusable="false"
			height="110"
			viewBox="0 0 110 110"
			width="110"
		>
			<defs>
				<clipPath id={`reference-icon-${id}`}>
					<path d={shape} />
				</clipPath>
			</defs>
			<image
				clipPath={`url(#reference-icon-${id})`}
				height="2560"
				href={REFERENCE_IMAGE}
				width="3840"
				x={-x}
				y={-y}
			/>
		</svg>
	);
}

export const REFERENCE_ITEMS: DockItem[] = [
	...APP_LABELS.map((label, index) => ({
		icon: (
			<ReferenceIcon
				id={String(index)}
				x={482 + Math.round(index * (825 / 7))}
			/>
		),
		id: `reference-${index}`,
		label,
		running: label === "Finder" || label === "Music",
	})),
	{
		icon: <ReferenceIcon id="downloads" shape={FOLDER_SHAPE} x={3130} />,
		id: "reference-downloads",
		label: "Downloads",
		separatorBefore: true,
	},
	{
		icon: <ReferenceIcon id="trash" shape={TRASH_SHAPE} x={3249} />,
		id: "reference-trash",
		label: "Trash",
	},
];

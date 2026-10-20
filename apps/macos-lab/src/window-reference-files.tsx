/** biome-ignore-all lint/performance/noJsxPropsBind: Local handlers for the small file appearance workbench. */
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { type MacFile, MacFileGrid } from "@anyway-design/macos/files";
import {
	type ChangeEvent,
	type CSSProperties,
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { WINDOW_REFERENCE_IMAGE } from "./window-reference-assets";

// Artwork only: labels, tags, selection, grid placement, and interactions are live.
function ReferenceThumbnail({ column, row }: { column: number; row: number }) {
	const centers = [333, 508, 683, 858, 1033];
	return (
		<svg
			aria-hidden="true"
			overflow="hidden"
			viewBox={`${(centers[column] ?? 333) - 48} ${162 + row * 175} 96 96`}
		>
			<image height={694} href={WINDOW_REFERENCE_IMAGE} width={1144} />
		</svg>
	);
}

const SAMPLES = [
	["Agreement for Services", true],
	["All_Bodies_All_Abilities", true],
	["Azolla Journal Submission", true],
	["Biofacture", false],
	["Block Party", true],
	["Fruit", false],
	["Fun memories", false],
	["Hello Friend", false],
	["Inspiration 1", false],
	["Inspiration 2", false],
	["Mexican Textile Catalog", true],
	["Order form", false],
	["Picnic Photoshoot", false],
	["Remodel Planning", true],
	["Round one Deliverables", false],
] as const;
const REFERENCE_FILES: MacFile[] = SAMPLES.map(([name, green], index) => ({
	icon: <ReferenceThumbnail column={index % 5} row={Math.floor(index / 5)} />,
	id: name,
	name,
	tags: [
		{ color: green ? "#7bcf83" : "#a5a5a7", label: green ? "Green" : "Gray" },
	],
}));

export function WindowReferenceFiles({
	onOpen,
}: {
	onOpen: (id: string) => void;
}) {
	const [selected, setSelected] = useState([REFERENCE_FILES[0]?.id ?? ""]);
	return (
		<MacFileGrid
			className="window-study-files"
			items={REFERENCE_FILES}
			label="Documents files"
			onOpen={onOpen}
			onSelectionChange={setSelected}
			selectedIds={selected}
		/>
	);
}

const WORKBENCH_FILES: MacFile[] = [
	{
		id: "projects",
		kind: "folder",
		name: "Projects",
		tags: [{ color: "#ff9f0a", label: "Work" }],
	},
	{ id: "resources", kind: "folder", name: "Design resources" },
	{
		id: "brief",
		kind: "pdf",
		name: "Project brief.pdf",
		tags: [{ color: "#30b956", label: "Approved" }],
	},
	{ id: "notes", kind: "text", name: "Meeting notes.txt" },
	{ id: "wallpaper", kind: "image", name: "Tahoe wallpaper.jpg" },
	{ id: "archive", kind: "archive", name: "Round one deliverables.zip" },
	{ id: "photo", name: "Clouds.jpg", thumbnail: "/assets/clouds.webp" },
	{
		id: "long",
		kind: "document",
		name: "A long document name that wraps across more than two lines.pages",
		tags: [
			{ color: "#ff453a", label: "Urgent" },
			{ color: "#af52de", label: "Personal" },
		],
	},
	{ disabled: true, id: "offline", kind: "document", name: "Offline document" },
];

export function FileIconWorkbench() {
	const [selected, setSelected] = useState(["projects"]);
	const [active, setActive] = useState(true);
	const [dark, setDark] = useState(false);
	const [extensions, setExtensions] = useState(true);
	const [size, setSize] = useState(64);
	const [width, setWidth] = useState(560);
	const [notice, setNotice] = useState("");
	const open = useCallback(
		(id: string) =>
			setNotice(
				`Open callback: ${WORKBENCH_FILES.find((file) => file.id === id)?.name ?? id}`
			),
		[]
	);
	return (
		<section
			aria-labelledby="file-workbench-heading"
			className="file-workbench"
		>
			<h2 className="file-workbench-heading" id="file-workbench-heading">
				Native file icons, live items.
			</h2>
			<p>
				Extracted from this Mac. Click to select, ⌘/Ctrl-click to toggle, Shift
				to extend. Arrow keys navigate, type to find, Enter or double-click to
				open.
			</p>
			<div className="window-study-controls">
				<label>
					<input
						checked={active}
						onChange={(event) => setActive(event.target.checked)}
						type="checkbox"
					/>{" "}
					Active selection
				</label>
				<label>
					<input
						checked={dark}
						onChange={(event) => setDark(event.target.checked)}
						type="checkbox"
					/>{" "}
					Dark appearance
				</label>
				<label>
					<input
						checked={extensions}
						onChange={(event) => setExtensions(event.target.checked)}
						type="checkbox"
					/>{" "}
					Show extensions
				</label>
				<label>
					Icon size{" "}
					<input
						max={96}
						min={32}
						onChange={(event) => setSize(Number(event.target.value))}
						step={8}
						type="range"
						value={size}
					/>{" "}
					{size}px
				</label>
				<label>
					Container width{" "}
					<input
						max={740}
						min={200}
						onChange={(event) => setWidth(Number(event.target.value))}
						step={20}
						type="range"
						value={width}
					/>{" "}
					{width}px
				</label>
			</div>
			<div className="file-workbench-container" style={{ width }}>
				<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
					<MacFileGrid
						active={active}
						items={WORKBENCH_FILES}
						label="Native file examples"
						onOpen={open}
						onSelectionChange={setSelected}
						selectedIds={selected}
						showExtensions={extensions}
						style={
							{
								"--mac-file-icon-size": `${size}px`,
								"--mac-file-row-height": `${size + 48}px`,
							} as CSSProperties
						}
					/>
				</MacOSEnvironment>
			</div>
			<p aria-live="polite">{notice || `${selected.length} selected`}</p>
		</section>
	);
}

export function FileThumbnailWorkbench() {
	const [upload, setUpload] = useState<{ name: string; src: string } | null>(
		null
	);
	const [selected, setSelected] = useState(["pdf"]);
	const [error, setError] = useState("");
	const fileInput: RefObject<HTMLInputElement | null> = useRef(null);
	useEffect(
		() => () => {
			if (upload) {
				URL.revokeObjectURL(upload.src);
			}
		},
		[upload]
	);
	const loadImage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		if (!file.type.startsWith("image/")) {
			setError("Choose an image file.");
			return;
		}
		setError("");
		setUpload({ name: file.name, src: URL.createObjectURL(file) });
	}, []);
	const reset = useCallback(() => {
		setUpload(null);
		setError("");
		if (fileInput.current) {
			fileInput.current.value = "";
		}
	}, []);
	const src = upload?.src ?? "/assets/clouds.webp";
	const files: MacFile[] = [
		{ id: "image", name: "Image preview.jpg", thumbnail: src },
		{ id: "pdf", kind: "pdf", name: "Document preview.pdf", thumbnail: src },
		{
			id: "cover",
			kind: "pdf",
			name: "Full-page preview.pdf",
			thumbnail: src,
			thumbnailFit: "cover",
		},
	];
	return (
		<section
			aria-labelledby="file-thumbnail-heading"
			className="file-workbench file-thumbnail-workbench"
		>
			<h2 className="file-workbench-heading" id="file-thumbnail-heading">
				One image, three presentations.
			</h2>
			<p>
				Provide an image. PDF and document items add the paper shape, folded
				corner, clipping, and shadow automatically. Contain preserves the whole
				image; Cover fills the page from the top.
			</p>
			<div className="file-thumbnail-actions">
				<label>
					Choose image{" "}
					<input
						accept="image/*"
						onChange={loadImage}
						ref={fileInput}
						type="file"
					/>
				</label>
				<button onClick={reset} type="button">
					Reset image
				</button>
			</div>
			<p aria-live="polite">
				{error ||
					`${upload?.name ?? "Example: Clouds"} · Your image stays in this browser.`}
			</p>
			<MacOSEnvironment preset="tahoe">
				<MacFileGrid
					className="file-thumbnail-grid"
					items={files}
					label="Thumbnail presentations"
					onSelectionChange={setSelected}
					selectedIds={selected}
				/>
			</MacOSEnvironment>
		</section>
	);
}

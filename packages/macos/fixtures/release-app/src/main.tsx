import { MacAlert } from "@1bye/macos/alert";
import { MacButton, MacSwitch } from "@1bye/macos/controls";
import { Dock } from "@1bye/macos/dock";
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacFileIcon } from "@1bye/macos/file-icons";
import { MacMenuButton } from "@1bye/macos/menu";
import { MacWindow } from "@1bye/macos/window";
import { WindowSymbol } from "@1bye/macos/window-symbol";
import { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import "@1bye/macos/styles.css";
import "./styles.css";

const actions = [
	{ icon: <WindowSymbol name="copy" />, id: "copy", label: "Copy" },
	{ icon: <WindowSymbol name="share" />, id: "share", label: "Share" },
];
const dockItems = [
	{
		icon: <MacFileIcon name="folder" />,
		id: "folder",
		label: "Documents",
		running: true,
	},
	{ icon: <MacFileIcon name="pdf" />, id: "pdf", label: "Preview" },
	{ icon: <MacFileIcon name="text" />, id: "text", label: "Notes" },
];
const alertActions = [
	{ id: "cancel", label: "Cancel" },
	{ id: "save", label: "Save" },
];

function App() {
	const [enabled, setEnabled] = useState(true);
	const [appearance, setAppearance] = useState<"light" | "dark">("light");
	const [alertOpen, setAlertOpen] = useState(false);
	const [event, setEvent] = useState("Installed from the packed npm tarball.");
	const toggleAppearance = useCallback(
		() => setAppearance((value) => (value === "light" ? "dark" : "light")),
		[]
	);
	const openAlert = useCallback(() => setAlertOpen(true), []);
	const onAction = useCallback((id: string) => setEvent(`Action: ${id}`), []);
	const onAlertAction = useCallback((id: string) => {
		setEvent(`Alert: ${id}`);
		setAlertOpen(false);
	}, []);
	return (
		<>
			<header className="page-header">
				<div>
					<p>ANYWAY / macOS</p>
					<h1>A fresh React app.</h1>
					<span>
						JavaScript, types, styles, and artwork from one local package.
					</span>
				</div>
				<button onClick={toggleAppearance} type="button">
					{appearance === "light" ? "Dark" : "Light"} appearance
				</button>
			</header>
			<MacOSEnvironment
				appearance={appearance}
				preset="tahoe"
				style={{
					minHeight: 700,
					padding: "24px 24px 130px",
					position: "relative",
				}}
			>
				<MacWindow
					style={{
						margin: "24px auto",
						minHeight: 400,
						width: "min(100%, 720px)",
					}}
					title="Release preview"
					toolbar={
						<MacMenuButton
							items={actions}
							onAction={onAction}
							trigger={<MacButton>Actions</MacButton>}
						/>
					}
				>
					<div className="window-content">
						<div>
							<h2>Make yourself at home.</h2>
							<p>Components installed outside the monorepo.</p>
						</div>
						<MacSwitch
							checked={enabled}
							label="Notifications"
							onCheckedChange={setEnabled}
						/>
						<p role="status">Notifications {enabled ? "on" : "off"}</p>
						<div className="files">
							<figure>
								<MacFileIcon name="folder" />
								<figcaption>Documents</figcaption>
							</figure>
							<figure>
								<MacFileIcon name="pdf" />
								<figcaption>Project brief.pdf</figcaption>
							</figure>
							<figure>
								<MacFileIcon name="image" />
								<figcaption>Photo.jpg</figcaption>
							</figure>
						</div>
						<MacButton onClick={openAlert}>Open alert</MacButton>
						<output aria-live="polite">{event}</output>
					</div>
				</MacWindow>
				<Dock items={dockItems} onActivate={onAction} size={48} />
				<MacAlert
					actions={alertActions}
					cancelAction="cancel"
					defaultAction="save"
					description="This tests the installed package’s artwork and portal styles."
					onAction={onAlertAction}
					onOpenChange={setAlertOpen}
					open={alertOpen}
					title="Save your changes?"
				/>
			</MacOSEnvironment>
		</>
	);
}

const root = document.getElementById("root");
if (!root) {
	throw new Error("Missing React root");
}
createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>
);

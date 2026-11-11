/** biome-ignore-all lint/performance/noJsxPropsBind: Local controls for the Get Info workbench. */
import { MacOSEnvironment } from "@1bye/macos/environment";
import { MacFileColumns } from "@1bye/macos/file-columns";
import { MacFileGallery } from "@1bye/macos/file-gallery";
import { type MacFileInfoChanges, MacGetInfo } from "@1bye/macos/file-info";
import { fileInfoDisplayName } from "@1bye/macos/file-info-model";
import { MacFileList } from "@1bye/macos/file-list";
import { fileNewFolderError } from "@1bye/macos/file-new-folder";
import { MacFileGrid } from "@1bye/macos/files";
import { useCallback, useMemo, useRef, useState } from "react";
import { INFO_FILES } from "./file-info-reference-data";

export function FileInfoWorkbench() {
	const [items, setItems] = useState(INFO_FILES);
	const [selected, setSelected] = useState<string[]>(["clouds"]);
	const [id, setId] = useState("clouds");
	const [open, setOpen] = useState(false);
	const [dark, setDark] = useState(false);
	const [narrow, setNarrow] = useState(false);
	const [view, setView] = useState("gallery");
	const [fail, setFail] = useState(false);
	const [notice, setNotice] = useState("");
	const [renames, setRenames] = useState(0);
	const root = useRef<HTMLDivElement | null>(null);
	const current = items.find((file) => file.id === id) ?? items[0];
	const displayItems = useMemo(
		() => items.map((file) => ({ ...file, name: fileInfoDisplayName(file) })),
		[items]
	);
	const inspect = useCallback((next: string) => {
		setId(next);
		setOpen(true);
	}, []);
	const change = useCallback(
		(target: string, changes: MacFileInfoChanges) =>
			setItems((before) =>
				before.map((file) =>
					file.id === target ? { ...file, ...changes } : file
				)
			),
		[]
	);
	const validate = useCallback(
		(target: string, name: string) => fileNewFolderError(name, items, target),
		[items]
	);
	const rename = useCallback(
		(target: string, name: string) => {
			if (fail) {
				setFail(false);
				throw new Error("The name could not be changed. Try again.");
			}
			setItems((before) =>
				before.map((file) => (file.id === target ? { ...file, name } : file))
			);
			setRenames((count) => count + 1);
			setNotice(`Renamed to ${name}`);
		},
		[fail]
	);
	const returnFocus = useCallback(
		() =>
			[
				...(root.current?.querySelectorAll<HTMLElement>("[data-file-id]") ??
					[]),
			].find((element) => element.dataset.fileId === id) ?? null,
		[id]
	);
	const props = {
		items: displayItems,
		label: "Inspector demo files",
		onGetInfo: inspect,
		onSelectionChange: setSelected,
		selectedIds: selected,
	};
	return (
		<section className="info-workbench">
			<h2>Try the inspector.</h2>
			<p>
				Select a file and use Get Info or ⌘/Ctrl+I. The inspector stays open
				while you work in the file browser.
			</p>
			<div className="window-study-controls">
				<button
					disabled={selected.length !== 1}
					onClick={() => inspect(selected[0])}
					type="button"
				>
					Get Info
				</button>
				<label>
					File view{" "}
					<select
						aria-label="File view"
						onChange={(event) => setView(event.target.value)}
						value={view}
					>
						<option value="icons">Icons</option>
						<option value="list">List</option>
						<option value="columns">Columns</option>
						<option value="gallery">Gallery</option>
					</select>
				</label>
				<label>
					<input
						checked={dark}
						onChange={(event) => setDark(event.target.checked)}
						type="checkbox"
					/>{" "}
					Dark workbench
				</label>
				<label>
					<input
						checked={narrow}
						onChange={(event) => setNarrow(event.target.checked)}
						type="checkbox"
					/>{" "}
					Narrow browser
				</label>
				<label>
					<input
						checked={fail}
						onChange={(event) => setFail(event.target.checked)}
						type="checkbox"
					/>{" "}
					Fail next rename
				</label>
				<button
					onClick={() => {
						setItems(INFO_FILES);
						setSelected(["clouds"]);
						setId("clouds");
						setOpen(false);
						setFail(false);
						setNotice("");
						setRenames(0);
					}}
					type="button"
				>
					Reset workbench
				</button>
			</div>
			<div
				className="info-workbench-files"
				ref={root}
				style={narrow ? { width: 300 } : undefined}
			>
				<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
					{view === "icons" ? <MacFileGrid {...props} /> : null}
					{view === "list" ? <MacFileList {...props} /> : null}
					{view === "columns" ? (
						<MacFileColumns
							items={displayItems}
							label={props.label}
							onGetInfo={inspect}
							onValueChange={(next) => setSelected(next ? [next] : [])}
							value={selected[0]}
						/>
					) : null}
					{view === "gallery" ? <MacFileGallery {...props} /> : null}
				</MacOSEnvironment>
			</div>
			<output aria-live="polite">
				{notice || "Changes stay in this preview."} · Rename callbacks:{" "}
				{renames}
			</output>
			<MacOSEnvironment appearance={dark ? "dark" : "light"} preset="tahoe">
				<MacGetInfo
					file={current}
					onChangeAll={() => setNotice("Change All callback")}
					onEditTags={() => setNotice("Edit Tags callback")}
					onInfoChange={change}
					onMinimize={() => setNotice("Minimize callback")}
					onOpenChange={setOpen}
					onRename={rename}
					onZoom={() => setNotice("Zoom callback")}
					open={open}
					returnFocus={returnFocus}
					validateRename={validate}
				/>
			</MacOSEnvironment>
		</section>
	);
}

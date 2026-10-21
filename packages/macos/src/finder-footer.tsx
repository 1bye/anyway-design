/** biome-ignore-all lint/performance/noJsxPropsBind: Path segments navigate to their own folder. */
import { MacFileIcon } from "./file-icons";
import type { MacFinderFile } from "./finder-model";
import { WindowSymbol } from "./window-symbol";

export function FinderFooter({
	path,
	location,
	label,
	navigate,
	count,
	query,
	selectedCount,
}: {
	path: MacFinderFile[];
	location: string;
	label: (id: string) => string;
	navigate: (id: string) => void;
	count: number;
	query: string;
	selectedCount: number;
}) {
	return (
		<div className="mac-finder-footer">
			<nav aria-label="Finder path" className="mac-finder-path-bar">
				{path.length ? (
					path.map((file, index) => (
						<span className="mac-finder-path-part" key={file.id}>
							{index > 0 ? (
								<WindowSymbol name="chevron-right" size={8} />
							) : null}
							{file.kind === "folder" ? (
								<button
									aria-current={file.id === location ? "location" : undefined}
									data-finder-location-id={file.id}
									onClick={() => navigate(file.id)}
									type="button"
								>
									<MacFileIcon
										height={13}
										name="folder"
										style={{ height: 13, width: 13 }}
										width={13}
									/>
									{label(file.id)}
								</button>
							) : (
								<span>{file.name}</span>
							)}
						</span>
					))
				) : (
					<span>{label(location)}</span>
				)}
			</nav>
			<span aria-live="polite">
				{count} {count === 1 ? "item" : "items"}
				{query.trim() ? ` matching “${query.trim()}”` : ""}
				{selectedCount ? ` · ${selectedCount} selected` : ""}
			</span>
		</div>
	);
}

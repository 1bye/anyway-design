import type { CSSProperties, Ref } from "react";
import { createPortal } from "react-dom";
import { MacFileItem } from "./files";
import type { MacFinderFile } from "./finder-model";

export interface FinderDragImage {
	accent: string;
	appearance: string;
	files: readonly MacFinderFile[];
	size: number;
}

/** Shared artwork stays live; pointer movement updates only this element's transform. */
export function FinderDragPreview({
	image,
	position,
}: {
	image: FinderDragImage | null;
	position: Ref<HTMLDivElement>;
}) {
	if (!image) {
		return null;
	}
	return createPortal(
		<div
			aria-hidden="true"
			className="macos mac-finder-drag-preview"
			data-appearance={image.appearance}
			data-preset="tahoe"
			ref={position}
			style={
				{
					"--mac-accent": image.accent,
					"--mac-file-icon-size": `${image.size}px`,
				} as CSSProperties
			}
		>
			{image.files
				.slice(0, 3)
				.reverse()
				.map((file, index, stack) => (
					<MacFileItem
						className="mac-finder-drag-item"
						file={file}
						key={file.id}
						selected
						style={
							{ "--drag-layer": stack.length - index - 1 } as CSSProperties
						}
						tabIndex={-1}
					/>
				))}
			{image.files.length > 1 ? (
				<span className="mac-finder-drag-count">{image.files.length}</span>
			) : null}
		</div>,
		document.body
	);
}

import { useCallback, useState } from "react";
import type { MacFileColumnItem } from "./file-column-model";
import { MacFileIcon } from "./file-icons";
import { FILE_KIND_LABELS } from "./file-list-tree";

function FileColumnArt({ file }: { file: MacFileColumnItem }) {
	const [failed, setFailed] = useState(false);
	const fail = useCallback(() => setFailed(true), []);
	if (file.preview?.src && !failed) {
		return (
			// biome-ignore lint/a11y/noNoninteractiveElementInteractions lint/correctness/useImageSize: The fixed preview area reserves space; its source aspect ratio is supplied at runtime.
			<img
				alt={file.preview.alt ?? file.name}
				draggable={false}
				onError={fail}
				src={file.preview.src}
			/>
		);
	}
	if (file.preview?.text !== undefined) {
		return <pre>{file.preview.text}</pre>;
	}
	return (
		<div className="mac-file-column-fallback">
			{file.icon ?? <MacFileIcon name={file.kind ?? "document"} />}
			{failed ? <span role="status">Preview unavailable</span> : null}
		</div>
	);
}

/** A supplied image or text preview; document parsing stays with the caller. */
export function MacFileColumnPreview({ file }: { file: MacFileColumnItem }) {
	const details =
		file.preview?.details ??
		(file.modifiedLabel
			? [{ label: "Modified", value: file.modifiedLabel }]
			: []);
	return (
		<section
			aria-label={`Preview of ${file.name}`}
			className="mac-file-column-preview"
		>
			<div className="mac-file-column-art">
				<FileColumnArt
					file={file}
					key={`${file.id}:${file.preview?.src ?? ""}`}
				/>
			</div>
			<div className="mac-file-column-information">
				<h3>{file.name}</h3>
				<p>
					{[
						file.kindLabel ?? FILE_KIND_LABELS[file.kind ?? "document"],
						file.sizeLabel,
					]
						.filter(Boolean)
						.join(" - ")}
				</p>
				{details.length ? (
					<>
						<h4>Information</h4>
						<dl>
							{details.map((detail) => (
								<div key={detail.label}>
									<dt>{detail.label}</dt>
									<dd>{detail.value}</dd>
								</div>
							))}
						</dl>
					</>
				) : null}
				{file.tags?.length ? (
					<>
						<h4>Tags</h4>
						<div className="mac-file-column-tags">
							{file.tags.map((tag) => (
								<span key={tag.label}>
									<i style={{ background: tag.color }} />
									{tag.label}
								</span>
							))}
						</div>
					</>
				) : null}
			</div>
		</section>
	);
}

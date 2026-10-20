import { useId } from "react";

export interface MacFileThumbnailProps {
	alt?: string;
	className?: string;
	fit?: "contain" | "cover";
	presentation?: "image" | "document";
	src: string;
}

const PAGE_OUTLINE =
	"M4 0.5H35.5L47.5 12.5V59.5Q47.5 63.5 43.5 63.5H4.5Q0.5 63.5 0.5 59.5V4.5Q0.5 0.5 4 0.5Z";

export function MacFileThumbnail({
	src,
	presentation = "image",
	fit = "contain",
	alt = "",
	className = "",
}: MacFileThumbnailProps) {
	const clipId = `file-page-${useId()}`;
	if (presentation === "image") {
		return (
			<img
				alt={alt}
				className={`mac-file-thumbnail ${className}`}
				draggable={false}
				height={64}
				src={src}
				width={64}
			/>
		);
	}
	return (
		<svg
			aria-hidden={alt ? undefined : true}
			aria-label={alt || undefined}
			className={`mac-file-document-thumbnail ${className}`}
			role={alt ? "img" : undefined}
			viewBox="0 0 48 64"
		>
			<defs>
				<clipPath id={clipId}>
					<path d={PAGE_OUTLINE} />
				</clipPath>
			</defs>
			<path className="mac-file-paper" d={PAGE_OUTLINE} />
			<image
				clipPath={`url(#${clipId})`}
				height={58}
				href={src}
				preserveAspectRatio={
					fit === "cover" ? "xMidYMin slice" : "xMidYMid meet"
				}
				width={42}
				x={3}
				y={3}
			/>
			<path
				className="mac-file-paper-fold"
				d="M35.5 0.5V8.5Q35.5 12.5 39.5 12.5H47.5Z"
			/>
			<path className="mac-file-paper-edge" d={PAGE_OUTLINE} />
		</svg>
	);
}

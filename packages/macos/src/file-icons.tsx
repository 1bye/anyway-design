import type { ComponentPropsWithRef } from "react";
import nativeArchive from "./assets/native-file-icons/archive.png";
import nativeDocument from "./assets/native-file-icons/document.png";
import nativeFolderPreview from "./assets/native-file-icons/folder-preview.png";
import nativeImage from "./assets/native-file-icons/image.png";
import nativePdf from "./assets/native-file-icons/pdf.png";
import nativeText from "./assets/native-file-icons/text.png";

const FILE_ICONS = {
	archive: nativeArchive,
	document: nativeDocument,
	folder: nativeFolderPreview,
	image: nativeImage,
	pdf: nativePdf,
	text: nativeText,
} as const;
export type MacFileIconName = keyof typeof FILE_ICONS;

const FOLDER_PREVIEW = nativeFolderPreview;

export function MacFolderPreviewIcon({
	className = "",
	...props
}: Omit<ComponentPropsWithRef<"img">, "src">) {
	return (
		<img
			alt=""
			className={`mac-file-icon ${className}`}
			draggable={false}
			height={64}
			src={FOLDER_PREVIEW}
			width={64}
			{...props}
		/>
	);
}

export interface MacFileIconProps
	extends Omit<ComponentPropsWithRef<"img">, "src"> {
	name: MacFileIconName;
}

export function MacFileIcon({
	name,
	alt = "",
	className = "",
	...props
}: MacFileIconProps) {
	return (
		<img
			alt={alt}
			className={`mac-file-icon ${className}`}
			draggable={false}
			height={64}
			src={FILE_ICONS[name]}
			width={64}
			{...props}
		/>
	);
}

import type { ComponentPropsWithRef } from "react";

const FILE_ICONS = {
	archive: new URL("./assets/native-file-icons/archive.png", import.meta.url)
		.href,
	document: new URL("./assets/native-file-icons/document.png", import.meta.url)
		.href,
	folder: new URL("./assets/native-file-icons/folder.png", import.meta.url)
		.href,
	image: new URL("./assets/native-file-icons/image.png", import.meta.url).href,
	pdf: new URL("./assets/native-file-icons/pdf.png", import.meta.url).href,
	text: new URL("./assets/native-file-icons/text.png", import.meta.url).href,
} as const;
export type MacFileIconName = keyof typeof FILE_ICONS;

const FOLDER_PREVIEW = new URL(
	"./assets/native-file-icons/folder-preview.png",
	import.meta.url
).href;

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

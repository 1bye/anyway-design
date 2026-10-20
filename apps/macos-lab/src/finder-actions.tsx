import {
	MacMenuButton,
	type MacMenuButtonProps,
	type MacMenuEntry,
} from "@anyway-design/macos/menu";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import { WindowToolbarButton } from "@anyway-design/macos/window-toolbar";
import { useCallback, useState } from "react";

const TAG_COLORS = [
	{ color: "#ff605e", id: "tag-red", label: "Red tag" },
	{ color: "#ffa34c", id: "tag-orange", label: "Orange tag" },
	{ color: "#ffd846", id: "tag-yellow", label: "Yellow tag" },
	{ color: "#5bd16e", id: "tag-green", label: "Green tag" },
	{ color: "#4c9fff", id: "tag-blue", label: "Blue tag" },
	{ color: "#d95aeb", id: "tag-purple", label: "Purple tag" },
	{ color: "#a2a2a7", id: "tag-gray", label: "Gray tag" },
];

export function useFinderMenu(
	onAction?: (id: string) => void,
	filename = "tree.jpeg",
	extraStates = false
) {
	const [tags, setTags] = useState<string[]>([]);
	const [preview, setPreview] = useState(true);
	const action = useCallback(
		(id: string) => {
			if (id.startsWith("tag-")) {
				setTags((current) =>
					current.includes(id)
						? current.filter((tag) => tag !== id)
						: [...current, id]
				);
			} else if (id === "show-preview") {
				setPreview((current) => !current);
			}
			onAction?.(id);
		},
		[onAction]
	);
	const items: MacMenuEntry[] = [
		{ icon: <WindowSymbol name="open" />, id: "open", label: "Open" },
		{
			id: "open-with",
			items: [
				{ id: "open-preview", label: "Preview (default)" },
				{ id: "open-safari", label: "Safari" },
				{ id: "open-other", label: "Other…", separatorBefore: true },
			],
			label: "Open With",
		},
		{
			icon: <WindowSymbol name="trash" />,
			id: "trash",
			label: "Move to Trash",
			separatorBefore: true,
		},
		{
			icon: <WindowSymbol name="info" />,
			id: "info",
			label: "Get Info",
			separatorBefore: true,
			shortcut: extraStates ? "⌘I" : undefined,
		},
		{ icon: <WindowSymbol name="rename" />, id: "rename", label: "Rename" },
		{
			icon: <WindowSymbol name="archive" />,
			id: "compress",
			label: `Compress “${filename}”`,
		},
		{
			icon: <WindowSymbol name="duplicate" />,
			id: "duplicate",
			label: "Duplicate",
			shortcut: extraStates ? "⌘D" : undefined,
		},
		{ icon: <WindowSymbol name="alias" />, id: "alias", label: "Make Alias" },
		{
			icon: <WindowSymbol name="eye" />,
			id: "quick-look",
			label: "Quick Look",
		},
		{
			icon: <WindowSymbol name="copy" />,
			id: "copy",
			label: "Copy",
			separatorBefore: true,
			shortcut: extraStates ? "⌘C" : undefined,
		},
		{ icon: <WindowSymbol name="share" />, id: "share", label: "Share…" },
		{
			colors: TAG_COLORS.map((color) => ({
				...color,
				checked: tags.includes(color.id),
			})),
			id: "tag-colors",
			label: "Tags",
			separatorBefore: true,
			type: "palette",
		},
		{ icon: <WindowSymbol name="tag" />, id: "tags", label: "Tags…" },
		{
			id: "quick-actions",
			items: [
				{ id: "rotate-left", label: "Rotate Left" },
				{ id: "create-pdf", label: "Create PDF" },
				{ disabled: true, id: "markup", label: "Markup" },
			],
			label: "Quick Actions",
			separatorBefore: true,
		},
		{
			id: "desktop-picture",
			label: "Set Desktop Picture",
			separatorBefore: true,
		},
	];
	if (extraStates) {
		items.push(
			{
				checked: preview,
				id: "show-preview",
				label: "Show preview",
				separatorBefore: true,
			},
			{ disabled: true, id: "paste", label: "Paste", shortcut: "⌘V" }
		);
	}
	return { action, items };
}

export function FinderActions({
	onAction,
	filename,
	...props
}: {
	filename?: string;
	onAction?: (id: string) => void;
} & Omit<MacMenuButtonProps, "items" | "trigger" | "onAction">) {
	const menu = useFinderMenu(onAction, filename);
	return (
		<MacMenuButton
			{...props}
			items={menu.items}
			onAction={menu.action}
			trigger={
				<WindowToolbarButton label="More actions">
					<WindowSymbol name="ellipsis" />
				</WindowToolbarButton>
			}
		/>
	);
}

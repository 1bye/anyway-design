import { usePathname } from "fumadocs-core/framework";
import type { Item, Separator } from "fumadocs-core/page-tree";
import { TOCItem, useActiveAnchor } from "fumadocs-core/toc";
import {
	SidebarItem,
	SidebarSeparator,
	useSidebar,
} from "fumadocs-ui/components/sidebar/base";
import { useTOCItems } from "fumadocs-ui/components/toc";
import {
	Sidebar,
	type SidebarProps,
	SidebarProvider,
	SidebarTrigger,
} from "fumadocs-ui/layouts/docs/slots/sidebar";
import { useCallback, useEffect, useRef } from "react";

function DocsSidebar(props: SidebarProps) {
	const { mode, open, setOpen } = useSidebar();
	const dialog = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		if (open && mode === "drawer") {
			dialog.current?.showModal();
		} else {
			dialog.current?.close();
		}
	}, [mode, open]);
	const close = useCallback(() => setOpen(false), [setOpen]);

	if (mode !== "drawer") {
		return <Sidebar {...props} />;
	}
	return (
		<dialog
			aria-label="Documentation navigation"
			className="docs-sidebar-dialog"
			onCancel={close}
			onClose={close}
			ref={dialog}
		>
			<Sidebar {...props} />
		</dialog>
	);
}

export const docsSidebarSlots = {
	provider: SidebarProvider,
	root: DocsSidebar,
	trigger: SidebarTrigger,
	useSidebar,
};

export function DocsSidebarItem({ item }: { item: Item }) {
	const pathname = usePathname();
	const toc = useTOCItems();
	const activeAnchor = useActiveAnchor();
	const { setOpen } = useSidebar();
	const active = pathname === item.url;
	const closeSidebar = useCallback(() => setOpen(false), [setOpen]);

	return (
		<div>
			<SidebarItem
				active={active}
				className="docs-sidebar-page"
				external={item.external}
				href={item.url}
				icon={item.icon}
			>
				{item.name}
			</SidebarItem>
			{active && toc.length > 0 ? (
				<ul aria-label="On this page" className="docs-sidebar-toc">
					{toc.map((heading) => (
						<li key={heading.url}>
							<TOCItem
								aria-current={
									activeAnchor === heading.url.slice(1) ? "location" : undefined
								}
								autoScroll={false}
								href={heading.url}
								onClick={closeSidebar}
							>
								{heading.title}
							</TOCItem>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

export function DocsSidebarSeparator({ item }: { item: Separator }) {
	return (
		<SidebarSeparator className="docs-sidebar-label">
			{item.name}
		</SidebarSeparator>
	);
}

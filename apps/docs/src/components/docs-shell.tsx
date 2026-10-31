import { useLocation } from "@tanstack/react-router";
import type { TableOfContents } from "fumadocs-core/toc";
import { TOCProvider } from "fumadocs-ui/components/toc";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ComponentProps, ReactNode } from "react";
import { DocsHeader, DocsSectionTabs, DocsWelcomeBanner } from "./docs-header";
import { DocsSidebarItem, DocsSidebarSeparator } from "./docs-sidebar";

type DocsTree = ComponentProps<typeof DocsLayout>["tree"];

export function DocsShell({
	tree,
	toc,
	children,
}: {
	tree: DocsTree;
	toc: TableOfContents;
	children: ReactNode;
}) {
	const showWelcome = useLocation({
		select: (location) => location.pathname === "/docs/getting-started",
	});

	return (
		<TOCProvider single toc={toc}>
			<div className="anyway-docs-shell">
				<DocsHeader />
				{showWelcome ? <DocsWelcomeBanner /> : null}
				<DocsLayout
					containerProps={{ className: "anyway-docs-body" }}
					nav={{ title: "Documentation", url: "/" }}
					searchToggle={{ enabled: false }}
					sidebar={{
						banner: <DocsSectionTabs />,
						className: "border-e-0 bg-fd-background",
						collapsible: false,
						components: {
							Item: DocsSidebarItem,
							Separator: DocsSidebarSeparator,
						},
					}}
					tree={tree}
				>
					{children}
				</DocsLayout>
			</div>
		</TOCProvider>
	);
}

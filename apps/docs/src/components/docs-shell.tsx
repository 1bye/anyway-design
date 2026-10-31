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
	return (
		<TOCProvider single toc={toc}>
			<div className="anyway-docs-shell">
				<DocsHeader />
				<DocsWelcomeBanner />
				<DocsLayout
					containerProps={{ className: "anyway-docs-body" }}
					nav={{ title: "Documentation", url: "/" }}
					searchToggle={{ enabled: false }}
					sidebar={{
						banner: <DocsSectionTabs />,
						className: "border-e-0 bg-transparent",
						collapsible: false,
						components: {
							Item: DocsSidebarItem,
							Separator: DocsSidebarSeparator,
						},
					}}
					themeSwitch={{ enabled: false }}
					tree={tree}
				>
					{children}
				</DocsLayout>
			</div>
		</TOCProvider>
	);
}

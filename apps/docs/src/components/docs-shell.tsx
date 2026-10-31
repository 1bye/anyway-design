import { useLocation } from "@tanstack/react-router";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ComponentProps, ReactNode } from "react";
import { DocsHeader, DocsWelcomeBanner } from "./docs-header";

type DocsTree = ComponentProps<typeof DocsLayout>["tree"];

export function DocsShell({
	tree,
	children,
}: {
	tree: DocsTree;
	children: ReactNode;
}) {
	const showWelcome = useLocation({
		select: (location) => location.pathname === "/docs/getting-started",
	});

	return (
		<div className="anyway-docs-shell">
			<DocsHeader />
			{showWelcome ? <DocsWelcomeBanner /> : null}
			<DocsLayout
				containerProps={{ className: "anyway-docs-body" }}
				nav={{ title: "Documentation", url: "/" }}
				tree={tree}
			>
				{children}
			</DocsLayout>
		</div>
	);
}

import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ComponentProps, ReactNode } from "react";

type DocsTree = ComponentProps<typeof DocsLayout>["tree"];

export function DocsShell({
	tree,
	children,
}: {
	tree: DocsTree;
	children: ReactNode;
}) {
	return (
		<DocsLayout
			nav={{
				title: (
					<img
						alt="Anyway"
						className="h-10 w-20 object-contain dark:invert"
						height={887}
						src="/brand/anyway-wordmark.png"
						width={1774}
					/>
				),
				url: "/",
			}}
			tree={tree}
		>
			{children}
		</DocsLayout>
	);
}

import { DocsProvider } from "@anyway-design/docs/config";
import { DocsNotFound } from "@anyway-design/docs/states";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { lazy, type ReactNode } from "react";
import { docsConfig } from "../docs.config";
import appCss from "../styles.css?url";

const DocsSearchDialog = lazy(() => import("@anyway-design/docs/search"));

export const Route = createRootRoute({
	component: Outlet,
	shellComponent: RootDocument,
	head: () => ({
		links: [{ href: appCss, rel: "stylesheet" }],
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{
				name: "description",
				content: docsConfig.description,
			},
			{ title: `${docsConfig.name} — Documentation` },
		],
	}),
	notFoundComponent: DocsNotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col font-sans">
				<DocsProvider config={docsConfig}>
					<RootProvider search={{ SearchDialog: DocsSearchDialog }}>
						{children}
					</RootProvider>
				</DocsProvider>
				<Scripts />
			</body>
		</html>
	);
}

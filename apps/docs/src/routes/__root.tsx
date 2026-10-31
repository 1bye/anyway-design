import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { lazy, type ReactNode } from "react";
import { DocsNotFound } from "../components/docs-state";
import appCss from "../styles.css?url";

const DocsSearchDialog = lazy(() => import("../components/docs-search-dialog"));

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
				content: "Guides and considered components for building with Anyway.",
			},
			{ title: "Anyway — Documentation" },
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
				<RootProvider search={{ SearchDialog: DocsSearchDialog }}>
					{children}
				</RootProvider>
				<Scripts />
			</body>
		</html>
	);
}

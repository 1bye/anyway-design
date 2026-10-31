import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { lazy } from "react";
import appCss from "../styles.css?url";

const DocsSearchDialog = lazy(() => import("../components/docs-search-dialog"));

export const Route = createRootRoute({
	component: RootDocument,
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
	notFoundComponent: NotFound,
});

function NotFound() {
	return (
		<main className="mx-auto max-w-xl px-6 py-24">
			<p className="text-fd-muted-foreground text-sm">A small detour</p>
			<h1 className="my-4 font-semibold text-3xl">This page isn’t here.</h1>
			<p>Let’s get you back to familiar ground.</p>
			<Link
				className="mt-6 inline-block underline"
				params={{ _splat: "getting-started" }}
				to="/docs/$"
			>
				Back to the guide →
			</Link>
		</main>
	);
}

function RootDocument() {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col font-sans">
				<RootProvider search={{ SearchDialog: DocsSearchDialog }}>
					<Outlet />
				</RootProvider>
				<Scripts />
			</body>
		</html>
	);
}

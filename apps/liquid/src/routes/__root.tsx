import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Anyway Liquid — interfaces that flow · by Yurii Hulyk" },
			{
				name: "description",
				content:
					"Connected menus, pickers, and surfaces for shadcn/ui. A small interface toolkit by Yurii Hulyk.",
			},
			{ name: "theme-color", content: "#f2f2f2" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/brand/mark.svg", type: "image/svg+xml" },
			{
				rel: "preload",
				href: "/fonts/geist-variable.woff2",
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
		],
	}),
	component: Document,
	notFoundComponent: NotFound,
});

function Document() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<main className="grid min-h-svh place-content-center gap-4 px-6 text-center">
			<h1 className="text-2xl">This page wandered off.</h1>
			<Link className="underline underline-offset-4" to="/">
				Back to Liquid
			</Link>
		</main>
	);
}

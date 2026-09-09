import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Anyway Plan — a little space to think · by Yurii Hulyk" },
			{
				name: "description",
				content:
					"Drop in a block. Connect an idea. A simple software planning canvas by Yurii Hulyk.",
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
	notFoundComponent: () => (
		<main className="grid min-h-svh place-content-center gap-4 text-center">
			<h1>This page wandered off.</h1>
			<a className="underline" href="/">
				Back to Plan
			</a>
		</main>
	),
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

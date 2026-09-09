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
			{ title: "Anyway MD — your agent, your way · by Yurii Hulyk" },
			{
				name: "description",
				content:
					"Choose your agent skills and coding rules once. Save a setup, bring it to every project. An independent tool by Yurii Hulyk.",
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
		<main className="not-found">
			<h1>This page wandered off.</h1>
			<a href="/">Back to the builder</a>
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

import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import appCss from "../index.css?url";

export type RouterAppContext = Record<string, never>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootDocument,
	head: () => ({
		links: [
			{
				href: appCss,
				rel: "stylesheet",
			},
		],
		meta: [
			{
				charSet: "utf-8",
			},
			{
				content: "width=device-width, initial-scale=1",
				name: "viewport",
			},
			{
				content:
					"A personal design-engineering lab for the small states between loading and done.",
				name: "description",
			},
			{
				content: "#f5f2ec",
				name: "theme-color",
			},
			{
				title: "Anyway — small interfaces, overthought",
			},
		],
	}),
});

function RootDocument() {
	return (
		<html className="[color-scheme:light]" lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="min-w-80 font-sans">
				<Outlet />
				{import.meta.env.DEV ? (
					<TanStackRouterDevtools position="bottom-left" />
				) : null}
				<Scripts />
			</body>
		</html>
	);
}

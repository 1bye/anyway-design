import { DocsError, DocsLoading } from "@anyway-design/docs/states";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () =>
	createRouter({
		defaultErrorComponent: DocsError,
		defaultPendingComponent: DocsLoading,
		defaultPendingMinMs: 250,
		defaultPendingMs: 400,
		defaultPreload: "intent",
		routeTree,
		scrollRestoration: true,
	});

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}

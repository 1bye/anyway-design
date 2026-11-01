import { createFileRoute, redirect } from "@tanstack/react-router";
import { docsConfig } from "../docs.config";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({ to: "/docs/$", params: { _splat: docsConfig.homePage } });
	},
});

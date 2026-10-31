import { loader } from "fumadocs-core/source";
import { Component } from "lucide-react";
import { createElement } from "react";
import { docs } from "../../.source/server";
import { GettingStartedIcon, SwitchIcon } from "../components/page-icons";
import { docsConfig } from "../docs.config";

export const source = loader({
	baseUrl: "/docs",
	icon: (name) => {
		if (name === "Examples") {
			return createElement(Component);
		}
		if (name === "GettingStarted") {
			return createElement(GettingStartedIcon);
		}
		if (name === "Switch") {
			return createElement(SwitchIcon);
		}
	},
	pageTree: {
		transformers: [{ root: (node) => ({ ...node, name: docsConfig.name }) }],
	},
	source: docs.toFumadocsSource(),
});

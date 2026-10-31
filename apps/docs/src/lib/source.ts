import { loader } from "fumadocs-core/source";
import { createElement } from "react";
import { docs } from "../../.source/server";
import { GettingStartedIcon, SwitchIcon } from "../components/page-icons";

export const source = loader({
	baseUrl: "/docs",
	icon: (name) => {
		if (name === "GettingStarted") {
			return createElement(GettingStartedIcon);
		}
		if (name === "Switch") {
			return createElement(SwitchIcon);
		}
	},
	source: docs.toFumadocsSource(),
});

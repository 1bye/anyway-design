import { GettingStartedIcon } from "@anyway-design/docs/page-icons";
import { loader } from "fumadocs-core/source";
import { FlaskConical, Monitor } from "lucide-react";
import { createElement } from "react";
import { docs } from "../../.source/server";
import { docsConfig } from "../docs.config";
import { macosComponentSource } from "./macos-components";

export const source = loader({
	baseUrl: docsConfig.baseUrl ?? "/docs",
	icon: (name) => {
		if (name === "MacOS") {
			return createElement(Monitor);
		}
		if (name === "GettingStarted") {
			return createElement(GettingStartedIcon);
		}
		if (name === "Lab") {
			return createElement(FlaskConical);
		}
	},
	pageTree: {
		transformers: [{ root: (node) => ({ ...node, name: docsConfig.name }) }],
	},
	source: {
		...docs.toFumadocsSource(),
		files: [...docs.toFumadocsSource().files, ...macosComponentSource.files],
	},
});

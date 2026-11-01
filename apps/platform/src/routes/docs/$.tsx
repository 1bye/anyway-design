import { DocsShell } from "@anyway-design/docs/shell";
import { DocsLoading } from "@anyway-design/docs/states";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";
import { type ComponentProps, lazy, Suspense } from "react";
import collections from "../../../.source/browser";
import { mdxComponents } from "../../components/mdx";
import { docsConfig } from "../../docs.config";
import { readLabSelection } from "../../lib/macos-lab";
import { source } from "../../lib/source";

const MacosComponentPage = lazy(
	() => import("../../components/macos-component-page")
);

const serverLoader = createServerFn({ method: "GET" })
	.validator((slugs: string[]) => slugs)
	.handler(async ({ data }) => {
		const page = source.getPage(data);
		if (!page) {
			throw notFound();
		}
		return {
			componentId:
				data.length === 3 && data[0] === "macos" && data[1] === "components"
					? data[2]
					: null,
			path: page.path,
			title: page.data.title,
			pageTree: await source.serializePageTree(source.getPageTree()),
		};
	});

const clientLoader = collections.docs.createClientLoader<{
	tree: ComponentProps<typeof DocsShell>["tree"];
}>({
	component: (
		{ default: MDX, toc, frontmatter: { title, description } },
		{ tree }
	) => (
		<DocsShell toc={toc} tree={tree}>
			<DocsPage
				tabIndex={-1}
				tableOfContent={{ enabled: false }}
				tableOfContentPopover={{ enabled: false }}
			>
				<DocsTitle>{title}</DocsTitle>
				<DocsDescription>{description}</DocsDescription>
				<DocsBody>
					<MDX components={mdxComponents} />
				</DocsBody>
			</DocsPage>
		</DocsShell>
	),
});

export const Route = createFileRoute("/docs/$")({
	component: DocRoute,
	validateSearch: readLabSelection,
	loader: async ({ params }) => {
		const data = await serverLoader({
			data: params._splat?.split("/").filter(Boolean) ?? [],
		});
		if (!data.componentId) {
			await clientLoader.preload(data.path);
		}
		return data;
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `${loaderData?.title ?? "Documentation"} — ${docsConfig.name}` },
		],
	}),
});

function DocRoute() {
	const data = Route.useLoaderData();
	const { path, pageTree } = useFumadocsLoader(data);
	const entry = PLAYGROUND_ENTRIES.find((item) => item.id === data.componentId);
	if (entry) {
		return (
			<DocsShell toc={[]} tree={pageTree}>
				<DocsPage
					tabIndex={-1}
					tableOfContent={{ enabled: false }}
					tableOfContentPopover={{ enabled: false }}
				>
					<DocsTitle>{entry.title}</DocsTitle>
					<DocsDescription>{entry.description}</DocsDescription>
					<DocsBody>
						<Suspense fallback={<DocsLoading />}>
							<MacosComponentPage entry={entry} key={entry.id} />
						</Suspense>
					</DocsBody>
				</DocsPage>
			</DocsShell>
		);
	}
	return (
		<Suspense fallback={<DocsLoading />}>
			<MdxContent path={path} tree={pageTree} />
		</Suspense>
	);
}

function MdxContent({
	path,
	tree,
}: {
	path: string;
	tree: ComponentProps<typeof DocsShell>["tree"];
}) {
	return clientLoader.useContent(path, { tree });
}

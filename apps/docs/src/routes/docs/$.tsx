import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { Suspense } from "react";
import collections from "../../../.source/browser";
import { DocsShell } from "../../components/docs-shell";
import { mdxComponents } from "../../components/mdx";
import { source } from "../../lib/source";

const serverLoader = createServerFn({ method: "GET" })
	.validator((slugs: string[]) => slugs)
	.handler(async ({ data }) => {
		const page = source.getPage(data);
		if (!page) {
			throw notFound();
		}
		return {
			path: page.path,
			title: page.data.title,
			pageTree: await source.serializePageTree(source.getPageTree()),
		};
	});

const clientLoader = collections.docs.createClientLoader({
	component: ({ default: MDX, toc, frontmatter: { title, description } }) => (
		<DocsPage tabIndex={-1} toc={toc}>
			<DocsTitle>{title}</DocsTitle>
			<DocsDescription>{description}</DocsDescription>
			<DocsBody>
				<MDX components={mdxComponents} />
			</DocsBody>
		</DocsPage>
	),
});

export const Route = createFileRoute("/docs/$")({
	component: DocRoute,
	loader: async ({ params }) => {
		const data = await serverLoader({
			data: params._splat?.split("/").filter(Boolean) ?? [],
		});
		await clientLoader.preload(data.path);
		return data;
	},
	head: ({ loaderData }) => ({
		meta: [{ title: `${loaderData?.title ?? "Documentation"} — Anyway` }],
	}),
});

function DocRoute() {
	const { path, pageTree } = useFumadocsLoader(Route.useLoaderData());
	return (
		<DocsShell tree={pageTree}>
			<Suspense
				fallback={
					<p className="p-6 text-fd-muted-foreground">Getting things ready…</p>
				}
			>
				{clientLoader.useContent(path)}
			</Suspense>
		</DocsShell>
	);
}

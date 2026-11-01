import { useSearch } from "@tanstack/react-router";
import { getMacosLabUrl } from "../lib/macos-lab";

export function MacosWorkbench() {
	const search = useSearch({ from: "/docs/$" });
	const url = getMacosLabUrl(search);
	return (
		<section
			aria-label="macOS component workbench"
			className="not-prose my-6 min-w-0"
		>
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
				<span className="text-fd-muted-foreground">
					Live previews · editable props · native studies
				</span>
				<a
					className="inline-flex min-h-11 items-center rounded-full bg-fd-muted px-4 text-sm hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-ring"
					href={url}
					rel="noopener noreferrer"
					target="_blank"
				>
					Open macOS Lab ↗
				</a>
			</div>
			<iframe
				allow="clipboard-write"
				className="h-[880px] w-full rounded-xl border-0 bg-fd-background"
				loading="lazy"
				src={url}
				title="macOS Lab — live components and native comparisons"
			/>
		</section>
	);
}

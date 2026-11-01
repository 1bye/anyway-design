import Link from "fumadocs-core/link";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";
import { type ChangeEvent, useCallback, useId, useState } from "react";
import { componentGroups, macosComponentUrl } from "../lib/macos-components";
import { MacosLivePreview } from "./macos-live-preview";

export function MacosCatalog() {
	const id = useId();
	const [query, setQuery] = useState("");
	const changeQuery = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
		[]
	);
	const filter = query.trim().toLowerCase();
	const entries = PLAYGROUND_ENTRIES.filter((entry) =>
		`${entry.title} ${entry.group} ${entry.description}`
			.toLowerCase()
			.includes(filter)
	);
	return (
		<div className="not-prose my-6">
			<label className="mb-2 block text-sm" htmlFor={id}>
				Find a macOS component
			</label>
			<input
				className="w-full rounded-full bg-fd-muted px-4 py-3 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-fd-ring"
				id={id}
				onChange={changeQuery}
				placeholder="Search windows, controls, Finder…"
				type="search"
				value={query}
			/>
			<p className="my-4 text-fd-muted-foreground text-xs" role="status">
				{entries.length} of {PLAYGROUND_ENTRIES.length} components
			</p>
			{componentGroups.map((group) => {
				const items = entries.filter((entry) => entry.group === group);
				if (items.length === 0) {
					return null;
				}
				return (
					<section aria-label={group} className="mb-8" key={group}>
						<h3 className="mb-3 font-medium text-base">{group}</h3>
						<div className="grid gap-4 sm:grid-cols-2">
							{items.map((entry) => (
								<div
									className="relative overflow-hidden rounded-2xl bg-fd-muted/45 hover:bg-fd-accent/50"
									key={entry.id}
								>
									<MacosLivePreview compact entry={entry} />
									<Link
										className="block rounded-2xl p-4 after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-fd-ring"
										href={macosComponentUrl(entry.id)}
									>
										<div>
											<h4 className="font-medium text-sm">{entry.title}</h4>
											<p className="mt-2 text-fd-muted-foreground text-sm leading-relaxed">
												{entry.description}
											</p>
											<span className="mt-3 inline-block text-fd-muted-foreground text-xs">
												Preview & usage ↗
											</span>
										</div>
									</Link>
								</div>
							))}
						</div>
					</section>
				);
			})}
			{entries.length === 0 ? (
				<p className="py-6 text-fd-muted-foreground text-sm">
					No components match. Try another name or clear the search.
				</p>
			) : null}
		</div>
	);
}

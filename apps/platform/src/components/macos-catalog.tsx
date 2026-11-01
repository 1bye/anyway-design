import Link from "fumadocs-core/link";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";
import { type ChangeEvent, useCallback, useId, useState } from "react";

const groups = [...new Set(PLAYGROUND_ENTRIES.map((entry) => entry.group))];

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
			{groups.map((group) => {
				const items = entries.filter((entry) => entry.group === group);
				if (items.length === 0) {
					return null;
				}
				return (
					<section aria-label={group} className="mb-8" key={group}>
						<h3 className="mb-3 font-medium text-base">{group}</h3>
						<div className="grid gap-2 sm:grid-cols-2">
							{items.map((entry) => (
								<div className="rounded-xl bg-fd-muted/45 p-4" key={entry.id}>
									<Link
										className="inline-flex min-h-11 items-center font-medium text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-fd-ring"
										href={`/docs/macos/playground?component=${entry.id}`}
									>
										{entry.title}
									</Link>
									<p className="mt-1 text-fd-muted-foreground text-sm leading-relaxed">
										{entry.description}
									</p>
									{entry.reference ? (
										<Link
											className="mt-2 inline-flex min-h-11 items-center text-fd-muted-foreground text-xs underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-fd-ring"
											href={`/docs/macos/playground?view=${entry.reference}`}
										>
											Native comparison ↗
										</Link>
									) : null}
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

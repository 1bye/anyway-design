import { expect, it } from "bun:test";
import { createSearchAPI } from "fumadocs-core/search/server";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";
import { macosSearchIndexes } from "../src/lib/macos-search";

it("includes the whole lab catalog and links search results directly to the component", async () => {
	expect(macosSearchIndexes).toHaveLength(PLAYGROUND_ENTRIES.length);
	const search = createSearchAPI("advanced", { indexes: macosSearchIndexes });
	const results = await search.search("Switch");
	expect(
		results.some((result) => result.url === "/docs/macos/components/switch")
	).toBe(true);
	const apiResults = await search.search("MacSwitch");
	expect(
		apiResults.some((result) => result.url === "/docs/macos/components/switch")
	).toBe(true);
});

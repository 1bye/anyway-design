import { expect, it } from "bun:test";
import { loader } from "fumadocs-core/source";
import { PLAYGROUND_ENTRIES } from "macos-lab/catalog";
import {
	macosComponentSource,
	macosComponentUrl,
} from "../src/lib/macos-components";

it("gives every catalog entry its own resolvable docs page and sidebar link", () => {
	const source = loader({ baseUrl: "/docs", source: macosComponentSource });
	const tree = JSON.stringify(source.getPageTree());
	for (const entry of PLAYGROUND_ENTRIES) {
		const page = source.getPage(["macos", "components", entry.id]);
		expect(page?.url).toBe(macosComponentUrl(entry.id));
		expect(page?.data.title).toBe(entry.title);
		expect(tree).toContain(macosComponentUrl(entry.id));
	}
	expect(source.getPage(["macos", "components", "unknown"])).toBeUndefined();
});

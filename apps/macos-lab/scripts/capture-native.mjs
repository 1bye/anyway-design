import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// Called from cua_repl with its documented Tab handle; no separate browser driver.
export async function captureNativeComparison(tab, path, selector) {
	await tab.playwright.waitForLoadState({ state: "networkidle" });
	const manifest = await tab.playwright.evaluate((query) => {
		const scenes = [...document.querySelectorAll(query)].map((element) => {
			const rect = element.getBoundingClientRect().toJSON();
			let x = Math.max(0, rect.x);
			let y = Math.max(0, rect.y);
			let right = Math.min(innerWidth, rect.right);
			let bottom = Math.min(innerHeight, rect.bottom);
			for (
				let parent = element.parentElement;
				parent;
				parent = parent.parentElement
			) {
				const style = getComputedStyle(parent);
				const bounds = parent.getBoundingClientRect();
				if (style.overflowX !== "visible") {
					x = Math.max(x, bounds.x + parent.clientLeft);
					right = Math.min(
						right,
						bounds.x + parent.clientLeft + parent.clientWidth
					);
				}
				if (style.overflowY !== "visible") {
					y = Math.max(y, bounds.y + parent.clientTop);
					bottom = Math.min(
						bottom,
						bounds.y + parent.clientTop + parent.clientHeight
					);
				}
			}
			return {
				class: element.className,
				images: [...element.querySelectorAll("img")].map((image) => ({
					complete: image.complete,
					height: image.naturalHeight,
					src: image.getAttribute("src"),
					width: image.naturalWidth,
				})),
				rect,
				scale: rect.width / element.offsetWidth,
				visibleRect: {
					height: Math.max(0, bottom - y),
					width: Math.max(0, right - x),
					x,
					y,
				},
			};
		});
		return {
			dpr: devicePixelRatio,
			scenes,
			url: location.href,
			viewport: { height: innerHeight, width: innerWidth },
		};
	}, selector);
	if (manifest.scenes.length !== 2) {
		throw new Error(
			"Select exactly two visible comparison regions: live, then native"
		);
	}
	const cdp = await tab.capabilities.get("cdp");
	const screenshot = await cdp.send("Page.captureScreenshot", {
		format: "png",
	});
	await mkdir(dirname(path), { recursive: true });
	await writeFile(`${path}.png`, Buffer.from(screenshot.data, "base64"));
	await writeFile(`${path}.json`, `${JSON.stringify(manifest, null, 2)}\n`);
	return manifest;
}

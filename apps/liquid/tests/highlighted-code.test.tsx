import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import HighlightedCode from "../src/components/highlighted-code";

const TAG_PATTERN = /<[^>]*>/g;

test("Shiki colors TSX while preserving whitespace and escaping markup", () => {
	const code = '\nconst size = 42;\n\nconst label = "Liquid";\n';
	const markup = renderToStaticMarkup(<HighlightedCode code={code} />);
	expect(markup).toContain('style="color:');
	expect(markup.replace(TAG_PATTERN, "").replaceAll("&quot;", '"')).toBe(code);
	const jsx = renderToStaticMarkup(
		<HighlightedCode code={'<script>alert("x")</script>'} />
	);
	expect(jsx).not.toContain("<script>");
	expect(jsx).toContain("&lt;");
});

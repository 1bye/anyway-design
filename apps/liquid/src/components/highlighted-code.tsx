import { type ReactNode, useMemo } from "react";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import tsx from "shiki/langs/tsx.mjs";
import vitesseLight from "shiki/themes/vitesse-light.mjs";

const highlighter = createHighlighterCoreSync({
	engine: createJavaScriptRegexEngine(),
	langs: [tsx],
	themes: [vitesseLight],
});

export default function HighlightedCode({ code }: { code: string }) {
	const content = useMemo(() => {
		const { tokens } = highlighter.codeToTokens(code, {
			lang: "tsx",
			theme: "vitesse-light",
		});
		const nodes: ReactNode[] = [];
		let offset = 0;
		for (const line of tokens) {
			for (const token of line) {
				nodes.push(
					<span key={offset} style={{ color: token.color }}>
						{token.content}
					</span>
				);
				offset += token.content.length + 1;
			}
			nodes.push("\n");
		}
		nodes.pop();
		return nodes;
	}, [code]);
	return <code>{content}</code>;
}

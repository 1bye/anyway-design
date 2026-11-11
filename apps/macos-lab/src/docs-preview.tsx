import type { ComponentProps } from "react";
import { PlaygroundPreview } from "./playground-preview";
import "@1bye/macos/styles.css";
import "./playground.css";

// Reuse the live examples without the standalone lab's navigation or global reset.
export function ComponentPreview(
	props: ComponentProps<typeof PlaygroundPreview>
) {
	return <PlaygroundPreview {...props} />;
}

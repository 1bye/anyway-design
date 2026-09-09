import { createFileRoute } from "@tanstack/react-router";
import { Builder } from "../components/builder";

export const Route = createFileRoute("/p/$presetId")({
	component: SharedSetup,
	head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
});

function SharedSetup() {
	const { presetId } = Route.useParams();
	return <Builder key={presetId} sharedId={presetId} />;
}

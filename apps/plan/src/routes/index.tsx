import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { PlanEditor } from "../components/editor";

export const Route = createFileRoute("/")({ component: PlanPage });

function PlanPage() {
	return (
		<ClientOnly
			fallback={
				<main
					className="grid min-h-svh place-content-center text-muted"
					role="status"
				>
					Opening your canvas…
				</main>
			}
		>
			<PlanEditor />
		</ClientOnly>
	);
}

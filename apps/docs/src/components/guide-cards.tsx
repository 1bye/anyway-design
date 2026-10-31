import { Card, Cards } from "fumadocs-ui/components/card";
import { Component, Feather, Layers2 } from "lucide-react";

export function GuideCards() {
	return (
		<Cards>
			<Card icon={<Feather />} title="Less, but considered.">
				Keep what helps. Give everything else a little room.
			</Card>
			<Card icon={<Layers2 />} title="Familiar by feeling.">
				Useful conventions, with a character of their own.
			</Card>
		</Cards>
	);
}

export function ComponentLink() {
	return (
		<Card
			href="/docs/components/switch"
			icon={<Component />}
			title="Meet the switch"
		>
			Try a real component. Make it feel like yours.
		</Card>
	);
}

import { type MacTab, MacTabs } from "@anyway-design/macos/tabs";
import { useCallback, useRef, useState } from "react";
import { WindowReferenceFiles } from "./window-reference-files";

function tabContent(label: string) {
	return (
		<div className="window-study-tab-content">
			<strong>{label}</strong>
			<p>This tab is ready for your content.</p>
		</div>
	);
}

const REFERENCE_TABS: MacTab[] = [
	{ content: tabContent("Home_"), id: "home", label: "Home_" },
	{ content: tabContent("Home_"), id: "home-2", label: "Home_" },
	{ content: tabContent("Home"), id: "home-3", label: "Home" },
	{ content: null, id: "documents", label: "Documents" },
];
const EXTRA_TABS: MacTab[] = [
	"Projects",
	"Design",
	"Downloads",
	"Screenshots",
	"Archive",
	"Shared",
].map((label) => ({
	content: tabContent(label),
	id: label.toLowerCase(),
	label,
}));
EXTRA_TABS.push({
	content: null,
	disabled: true,
	id: "offline",
	label: "Offline",
});

export function WindowReferenceTabs({
	crowded,
	compact,
	onFileOpen,
}: {
	crowded: boolean;
	compact: boolean;
	onFileOpen: (id: string) => void;
}) {
	const [tabs, setTabs] = useState(() => {
		const initial = crowded
			? [...REFERENCE_TABS, ...EXTRA_TABS]
			: REFERENCE_TABS;
		return initial.map((tab) =>
			tab.id === "documents"
				? { ...tab, content: <WindowReferenceFiles onOpen={onFileOpen} /> }
				: tab
		);
	});
	const [value, setValue] = useState("documents");
	const sequence = useRef(0);
	const add = useCallback(() => {
		sequence.current += 1;
		const id = `new-${sequence.current}`;
		const label = `New tab ${sequence.current}`;
		setTabs((current) => [
			...current,
			{ content: tabContent(label), id, label },
		]);
		setValue(id);
	}, []);
	const close = useCallback(
		(id: string) =>
			setTabs((current) => current.filter((tab) => tab.id !== id)),
		[]
	);
	const reorder = useCallback((ids: string[]) => {
		setTabs((current) =>
			ids.flatMap((id) => {
				const tab = current.find((entry) => entry.id === id);
				return tab ? [tab] : [];
			})
		);
	}, []);
	return (
		<div className="window-study-tabs" data-compact={compact || undefined}>
			<MacTabs
				label="Finder tabs"
				onAdd={add}
				onClose={close}
				onReorder={reorder}
				onValueChange={setValue}
				tabs={tabs}
				value={value}
			/>
		</div>
	);
}

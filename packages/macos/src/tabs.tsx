import { Tabs } from "@base-ui/react/tabs";
import { type ReactNode, useCallback } from "react";
export interface MacTab {
	content: ReactNode;
	disabled?: boolean;
	id: string;
	label: string;
}
export interface MacTabsProps {
	label?: string;
	onValueChange: (value: string) => void;
	tabs: MacTab[];
	value: string;
	variant?: "document" | "segmented";
}
export function MacTabs({
	tabs,
	value,
	onValueChange,
	variant = "document",
	label = "Views",
}: MacTabsProps) {
	const handleValueChange = useCallback(
		(next: unknown) => {
			if (typeof next === "string") {
				onValueChange(next);
			}
		},
		[onValueChange]
	);
	return (
		<Tabs.Root
			className="mac-tabs"
			data-variant={variant}
			onValueChange={handleValueChange}
			value={value}
		>
			<Tabs.List activateOnFocus aria-label={label} className="mac-tab-list">
				{tabs.map((tab) => (
					<Tabs.Tab
						className="mac-tab"
						disabled={tab.disabled}
						key={tab.id}
						value={tab.id}
					>
						{tab.label}
					</Tabs.Tab>
				))}
			</Tabs.List>
			{tabs.map((tab) => (
				<Tabs.Panel className="mac-tab-panel" key={tab.id} value={tab.id}>
					{tab.content}
				</Tabs.Panel>
			))}
		</Tabs.Root>
	);
}

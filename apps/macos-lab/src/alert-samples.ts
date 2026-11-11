import type { MacAlertPanelProps } from "@1bye/macos/alert";

type AlertSample = Omit<MacAlertPanelProps, "onAction" | "suppression"> & {
	label: string;
	height: number;
	suppressionLabel?: string;
};
export const ALERT_SAMPLES = {
	critical: {
		actions: [
			{ id: "retry", label: "Try Again" },
			{ id: "cancel", label: "Cancel" },
		],
		cancelAction: "cancel",
		defaultAction: "retry",
		description: "The disk is full. Free up some space, then try again.",
		height: 218,
		label: "Critical",
		severity: "critical",
		title: "The document couldn’t be saved.",
	},
	information: {
		actions: [{ id: "ok", label: "OK" }],
		defaultAction: "ok",
		description: "Your files were exported successfully.",
		height: 218,
		label: "Information",
		title: "Export complete",
	},
	save: {
		actions: [
			{ id: "save", label: "Save" },
			{ id: "cancel", label: "Cancel" },
			{ destructive: true, id: "discard", label: "Don’t Save" },
		],
		cancelAction: "cancel",
		defaultAction: "save",
		description: "Your changes will be lost if you don’t save them.",
		height: 302,
		label: "Save / discard / cancel",
		title: "Do you want to save the changes made to “Report.pdf”?",
	},
	sheet: {
		actions: [
			{ id: "save", label: "Save" },
			{ id: "cancel", label: "Cancel" },
			{ destructive: true, id: "discard", label: "Don’t Save" },
		],
		cancelAction: "cancel",
		defaultAction: "save",
		description: "Your changes will be lost if you don’t save them.",
		height: 222,
		label: "Document sheet",
		presentation: "sheet",
		title: "Do you want to save the changes made to “Report.pdf”?",
	},
	warning: {
		actions: [
			{ id: "cancel", label: "Cancel" },
			{ destructive: true, id: "replace", label: "Replace" },
		],
		cancelAction: "cancel",
		defaultAction: "cancel",
		description:
			"A file with this name already exists. Replacing it will overwrite its contents.",
		height: 266,
		label: "Replace confirmation",
		severity: "warning",
		suppressionLabel: "Don’t ask again",
		title: "Replace “Report.pdf”?",
	},
} satisfies Record<string, AlertSample>;
export type AlertSampleName = keyof typeof ALERT_SAMPLES;
export function alertSample(name: AlertSampleName): AlertSample {
	return ALERT_SAMPLES[name];
}

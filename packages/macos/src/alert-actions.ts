export interface MacAlertAction {
	destructive?: boolean;
	disabled?: boolean;
	id: string;
	label: string;
}

export function enabledAlertAction(
	actions: readonly MacAlertAction[],
	id?: string
) {
	return actions.find((action) => action.id === id && !action.disabled);
}

export function orderedAlertActions(
	actions: readonly MacAlertAction[],
	defaultAction?: string,
	cancelAction?: string
) {
	const priority = (action: MacAlertAction) => {
		if (action.id === cancelAction) {
			return actions.length === 2 ? -1 : 2;
		}
		return action.id === defaultAction && actions.length !== 2 ? 0 : 1;
	};
	return [...actions].sort((a, b) => priority(a) - priority(b));
}

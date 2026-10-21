const COMBO_ROW_HEIGHT = 18;
const COMBO_TOP_PADDING = 5;
const POPUP_ROW_HEIGHT = 24;
const POPUP_TOP_PADDING = 4.5;
const POPUP_SEPARATOR_HEIGHT = 10.5;

// Native lists overlap their controls; generic anchors also support scaled previews.
export function comboBoxPopupOffset(
	items: readonly string[],
	value: string,
	size: "regular" | "small"
): number {
	const controlHeight = size === "small" ? 22 : 26;
	const currentIndex = Math.max(0, items.indexOf(value));
	return -(
		controlHeight / 2 +
		COMBO_TOP_PADDING +
		COMBO_ROW_HEIGHT / 2 +
		currentIndex * COMBO_ROW_HEIGHT
	);
}

export function popUpButtonPopupOffset(
	items: readonly { separatorBefore?: boolean; value: string }[],
	value: string | null,
	size: "regular" | "small"
): number {
	const controlHeight = size === "small" ? 20 : 24;
	const currentIndex = Math.max(
		0,
		items.findIndex((item) => item.value === value)
	);
	let precedingHeight = currentIndex * POPUP_ROW_HEIGHT;
	for (const [index, item] of items.entries()) {
		if (index > currentIndex) {
			break;
		}
		if (item.separatorBefore) {
			precedingHeight += POPUP_SEPARATOR_HEIGHT;
		}
	}
	return -(
		controlHeight / 2 +
		POPUP_TOP_PADDING +
		POPUP_ROW_HEIGHT / 2 +
		precedingHeight
	);
}

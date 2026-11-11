export interface SwitchExampleOptions {
	appearance: "light" | "dark";
	checked: boolean;
	disabled: boolean;
	size: "regular" | "small";
}

export function getSwitchExample({
	appearance,
	checked,
	disabled,
	size,
}: SwitchExampleOptions): string {
	return `import { MacSwitch } from "@1bye/macos/controls";
import { MacOSEnvironment } from "@1bye/macos/environment";
import "@1bye/macos/styles.css";

<MacOSEnvironment${appearance === "dark" ? ' appearance="dark"' : ""}>
  <MacSwitch
    label="Notifications"
    defaultChecked={${checked}}${size === "small" ? '\n    size="small"' : ""}${disabled ? "\n    disabled" : ""}
  />
</MacOSEnvironment>`;
}

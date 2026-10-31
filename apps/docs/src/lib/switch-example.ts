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
	return `import { MacSwitch } from "@anyway-design/macos/controls";
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import "@anyway-design/macos/styles.css";

<MacOSEnvironment${appearance === "dark" ? ' appearance="dark"' : ""}>
  <MacSwitch
    label="Notifications"
    defaultChecked={${checked}}${size === "small" ? '\n    size="small"' : ""}${disabled ? "\n    disabled" : ""}
  />
</MacOSEnvironment>`;
}

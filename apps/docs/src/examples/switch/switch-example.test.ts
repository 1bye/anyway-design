import { describe, expect, it } from "bun:test";
import { getSwitchExample } from "./switch-example";

describe("copyable switch example", () => {
	it("includes the setup required to use the component", () => {
		const code = getSwitchExample({
			appearance: "light",
			checked: true,
			disabled: false,
			size: "regular",
		});
		expect(code).toContain("@1bye/macos/styles.css");
		expect(code).toContain("<MacOSEnvironment>");
		expect(code).toContain("defaultChecked={true}");
		expect(code).not.toContain("\n    disabled");
	});

	it("exports the selected state instead of the initial state", () => {
		const code = getSwitchExample({
			appearance: "dark",
			checked: false,
			disabled: true,
			size: "small",
		});
		expect(code).toContain('appearance="dark"');
		expect(code).toContain("defaultChecked={false}");
		expect(code).toContain('size="small"');
		expect(code).toContain("\n    disabled");
	});
});

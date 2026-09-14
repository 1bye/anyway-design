import type { LiquidMenuProps } from "./liquid/liquid-menu";

type CodeSettings = Pick<LiquidMenuProps, "geometry" | "motion">;

const examples = {
	action: {
		body: `        <LiquidMenu modal={false}>
          <LiquidMenuTrigger>Actions</LiquidMenuTrigger>
          <LiquidMenuContent style={{ width: 176 }}>
            <LiquidMenuItem onClick={() => setCopies((count) => count + 1)}>
              {copies > 0 ? \`Duplicate (\${copies})\` : "Duplicate"}
            </LiquidMenuItem>
            <LiquidMenuItem onClick={() => setSaved((value) => !value)}>
              {saved ? "Saved" : "Save for later"}
            </LiquidMenuItem>
          </LiquidMenuContent>
        </LiquidMenu>`,
		imports: "",
		name: "ActionMenuExample",
		state: `  const [saved, setSaved] = useState(false);
  const [copies, setCopies] = useState(0);`,
	},
	connected: {
		body: `        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div>Untitled idea</div>
            <small>{folder}{copies > 0 ? \` · \${copies} copies\` : ""}</small>
          </div>
          <LiquidMenu modal={false}>
            <LiquidMenuTrigger aria-label="Open idea menu">•••</LiquidMenuTrigger>
            <LiquidMenuContent align="end" style={{ width: 176 }}>
              <LiquidMenuItem onClick={() => setCopies((count) => count + 1)}>
                Duplicate
              </LiquidMenuItem>
              <LiquidMenuSub>
                <LiquidMenuSubTrigger>Move to</LiquidMenuSubTrigger>
                <LiquidMenuSubContent style={{ width: 148 }}>
                  {["Personal", "Team"].map((option) => (
                    <LiquidMenuItem key={option} onClick={() => setFolder(option)}>
                      {option}{folder === option ? " ✓" : ""}
                    </LiquidMenuItem>
                  ))}
                </LiquidMenuSubContent>
              </LiquidMenuSub>
              <LiquidMenuSeparator />
              <LiquidMenuItem onClick={() => setFolder("Archived")}>
                Archive
              </LiquidMenuItem>
            </LiquidMenuContent>
          </LiquidMenu>
        </div>`,
		imports:
			"LiquidMenuSeparator, LiquidMenuSub, LiquidMenuSubContent, LiquidMenuSubTrigger,",
		name: "ConnectedMenuExample",
		state: `  const [folder, setFolder] = useState("Personal");
  const [copies, setCopies] = useState(0);`,
	},
	status: {
		body: `        <LiquidMenu modal={false}>
          <LiquidMenuTrigger aria-label={\`Change status: \${status}\`}>
            {status}
          </LiquidMenuTrigger>
          <LiquidMenuContent style={{ width: 176 }}>
            {["To do", "In progress", "Done"].map((option) => (
              <LiquidMenuItem key={option} onClick={() => setStatus(option)}>
                {option}{status === option ? " ✓" : ""}
              </LiquidMenuItem>
            ))}
          </LiquidMenuContent>
        </LiquidMenu>`,
		imports: "",
		name: "StatusMenuExample",
		state: `  const [status, setStatus] = useState("In progress");`,
	},
} as const;

export function createExampleCode(
	example: keyof typeof examples,
	settings: CodeSettings
) {
	const { name, imports, state, body } = examples[example];
	return `"use client";

import { useState } from "react";
import {
  LiquidMenu, LiquidMenuContent, LiquidMenuItem, LiquidMenuTrigger,
${imports ? `  ${imports}\n` : ""}} from "./components/liquid/liquid-menu";
import { LiquidProvider } from "./components/liquid/liquid-provider";

export default function ${name}() {
${state}

  return (
    <LiquidProvider softness={${settings.geometry?.blendRadius ?? 40}} radius={${settings.geometry?.menuRadius ?? 16}} duration={${settings.motion?.openDurationMs ?? 240}} dim={${settings.motion?.backdropOpacity ?? 0.2}}>
${body}
    </LiquidProvider>
  );
}
`;
}

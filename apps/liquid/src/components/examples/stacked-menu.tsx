"use client";

import { useCallback, useState } from "react";
import {
	LiquidMenu,
	LiquidMenuContent,
	LiquidMenuItem,
	LiquidMenuTrigger,
	LiquidMenuTriggerItem,
} from "../liquid/liquid-menu";
import { LiquidProvider } from "../liquid/liquid-provider";

export default function StackedMenuExample() {
	const [access, setAccess] = useState("Private");
	const share = useCallback(() => setAccess("Team"), []);
	const privatize = useCallback(() => setAccess("Private"), []);
	return (
		<LiquidProvider>
			<LiquidMenu>
				<LiquidMenuTrigger>Project · {access}</LiquidMenuTrigger>
				<LiquidMenuContent>
					<LiquidMenu>
						<LiquidMenuTriggerItem>Project settings</LiquidMenuTriggerItem>
						<LiquidMenuContent side="right">
							<LiquidMenuItem onClick={privatize}>Make private</LiquidMenuItem>
						</LiquidMenuContent>
					</LiquidMenu>
					<LiquidMenu>
						<LiquidMenuTriggerItem>Manage access</LiquidMenuTriggerItem>
						<LiquidMenuContent side="right">
							<LiquidMenuItem onClick={share}>Share with team</LiquidMenuItem>
						</LiquidMenuContent>
					</LiquidMenu>
				</LiquidMenuContent>
			</LiquidMenu>
		</LiquidProvider>
	);
}

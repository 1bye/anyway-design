"use client";

import { useCallback, useState } from "react";
import {
	LiquidMenu,
	LiquidMenuContent,
	LiquidMenuItem,
	LiquidMenuSub,
	LiquidMenuSubContent,
	LiquidMenuSubTrigger,
	LiquidMenuTrigger,
} from "../liquid/liquid-menu";
import { LiquidProvider } from "../liquid/liquid-provider";

export default function NestedMenuExample() {
	const [destination, setDestination] = useState("Inbox");
	const select = useCallback(() => setDestination("Components"), []);
	return (
		<LiquidProvider>
			<LiquidMenu modal={false} motion={{ backdropOpacity: 0 }}>
				<LiquidMenuTrigger>Move to · {destination}</LiquidMenuTrigger>
				<LiquidMenuContent style={{ width: 170 }}>
					<LiquidMenuSub>
						<LiquidMenuSubTrigger>
							Design <span aria-hidden="true">›</span>
						</LiquidMenuSubTrigger>
						<LiquidMenuSubContent style={{ width: 170 }}>
							<LiquidMenuSub>
								<LiquidMenuSubTrigger>
									Liquid <span aria-hidden="true">›</span>
								</LiquidMenuSubTrigger>
								<LiquidMenuSubContent style={{ width: 170 }}>
									<LiquidMenuItem onClick={select}>Components</LiquidMenuItem>
								</LiquidMenuSubContent>
							</LiquidMenuSub>
						</LiquidMenuSubContent>
					</LiquidMenuSub>
				</LiquidMenuContent>
			</LiquidMenu>
		</LiquidProvider>
	);
}

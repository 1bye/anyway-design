import { Popover } from "@base-ui/react/popover";
import {
	type CSSProperties,
	type ReactElement,
	type ReactNode,
	useId,
} from "react";
import { MacButton, type MacButtonProps } from "./controls";
import { useMacOSPortal } from "./environment";

export interface MacPopoverPanelProps {
	children: ReactNode;
	className?: string;
	description?: string;
	descriptionId?: string;
	style?: CSSProperties;
	title: string;
	titleId?: string;
}

export function MacPopoverPanel({
	children,
	className = "",
	description,
	descriptionId,
	style,
	title,
	titleId,
}: MacPopoverPanelProps) {
	const id = useId();
	return (
		<section
			aria-labelledby={titleId ?? id}
			className={`mac-popover-panel ${className}`}
			style={style}
		>
			<h2 id={titleId ?? id}>{title}</h2>
			{description ? <p id={descriptionId}>{description}</p> : null}
			{children}
		</section>
	);
}

export interface MacPopoverProps
	extends Omit<MacPopoverPanelProps, "titleId" | "descriptionId"> {
	defaultOpen?: boolean;
	initialFocus?: Popover.Popup.Props["initialFocus"];
	onOpenChange?: Popover.Root.Props["onOpenChange"];
	open?: boolean;
	positionerProps?: Pick<
		Popover.Positioner.Props,
		| "side"
		| "align"
		| "sideOffset"
		| "alignOffset"
		| "collisionAvoidance"
		| "collisionBoundary"
		| "collisionPadding"
	>;
	returnFocus?: Popover.Popup.Props["finalFocus"];
	trigger: ReactElement;
}

export function MacPopover({
	children,
	className,
	defaultOpen,
	description,
	initialFocus,
	onOpenChange,
	open,
	positionerProps,
	returnFocus,
	style,
	title,
	trigger,
}: MacPopoverProps) {
	const container = useMacOSPortal();
	const titleId = useId();
	const descriptionId = useId();
	return (
		<Popover.Root
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			open={open}
		>
			<Popover.Trigger render={trigger} />
			<Popover.Portal container={container}>
				<Popover.Positioner
					align="center"
					arrowPadding={20}
					className="mac-popover-positioner"
					side="bottom"
					sideOffset={13}
					{...positionerProps}
				>
					<Popover.Popup
						aria-describedby={description ? descriptionId : undefined}
						aria-labelledby={titleId}
						className="mac-popover-popup"
						finalFocus={returnFocus}
						initialFocus={initialFocus}
					>
						<Popover.Arrow className="mac-popover-arrow">
							<svg
								aria-hidden="true"
								height={12}
								viewBox="0 0 36 12"
								width={36}
							>
								<path d="M0 12C7 12 10 8 15 2Q18-1 21 2C26 8 29 12 36 12Z" />
							</svg>
						</Popover.Arrow>
						<MacPopoverPanel
							className={className}
							description={description}
							descriptionId={descriptionId}
							style={style}
							title={title}
							titleId={titleId}
						>
							{children}
						</MacPopoverPanel>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}

export function MacPopoverClose(props: MacButtonProps) {
	return <Popover.Close render={<MacButton {...props} />} />;
}

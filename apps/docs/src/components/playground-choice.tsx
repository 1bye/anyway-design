import { type ChangeEvent, useCallback, useId } from "react";

interface PlaygroundChoiceProps<Value extends string | boolean> {
	label: string;
	onValueChange: (value: Value) => void;
	options: readonly { label: string; value: Value }[];
	value: Value;
}

export function PlaygroundChoice<Value extends string | boolean>({
	label,
	onValueChange,
	options,
	value,
}: PlaygroundChoiceProps<Value>) {
	const id = useId();
	const changeValue = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const next = options.find(
				(option) => String(option.value) === event.currentTarget.value
			);
			if (next) {
				onValueChange(next.value);
			}
		},
		[onValueChange, options]
	);

	return (
		<div className="docs-playground-control">
			<span id={id}>{label}</span>
			<div
				aria-labelledby={id}
				className="docs-playground-segments"
				role="radiogroup"
			>
				{options.map((option) => (
					<label key={String(option.value)}>
						<input
							checked={value === option.value}
							className="peer sr-only"
							name={id}
							onChange={changeValue}
							type="radio"
							value={String(option.value)}
						/>
						<span>{option.label}</span>
					</label>
				))}
			</div>
		</div>
	);
}

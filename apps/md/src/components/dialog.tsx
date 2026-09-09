import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

export function Dialog({
	title,
	children,
	onClose,
	wide = false,
	sheet = false,
	message,
}: {
	title: string;
	children: ReactNode;
	onClose: () => void;
	wide?: boolean;
	sheet?: boolean;
	message?: { text: string; error: boolean } | null;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const dialog = ref.current;
		dialog?.showModal();
		return () => dialog?.close();
	}, []);
	return (
		<dialog
			aria-label={title}
			className={`dialog ${wide ? "dialog-wide" : ""} ${sheet ? "dialog-sheet" : ""}`}
			onCancel={onClose}
			ref={ref}
		>
			<div className="dialog-heading">
				<h2>{title}</h2>
				<button
					aria-label="Close dialog"
					className="icon-button"
					onClick={onClose}
					type="button"
				>
					<X size={18} />
				</button>
			</div>
			{message ? (
				<p
					className={message.error ? "inline-warning" : "field-hint"}
					role={message.error ? "alert" : "status"}
				>
					{message.text}
				</p>
			) : null}
			{children}
		</dialog>
	);
}

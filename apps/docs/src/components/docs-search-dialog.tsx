import { useDocsSearch } from "fumadocs-core/search/client";
import { fetchClient } from "fumadocs-core/search/client/fetch";
import {
	SearchDialog,
	SearchDialogClose,
	SearchDialogContent,
	SearchDialogHeader,
	SearchDialogIcon,
	SearchDialogInput,
	SearchDialogList,
	SearchDialogOverlay,
	type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useCallback, useRef } from "react";
import { Kbd } from "./kbd";

export default function DocsSearchDialog(props: SharedProps) {
	const search = useDocsSearch({ client: fetchClient({ api: "/api/search" }) });
	const previousFocus = useRef<HTMLElement | null>(null);
	const rememberFocus = useCallback(() => {
		previousFocus.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
	}, []);
	const restoreFocus = useCallback((event: Event) => {
		event.preventDefault();
		const previous = previousFocus.current;
		const trigger = Array.from(
			document.querySelectorAll<HTMLElement>(
				".anyway-docs-header [data-search], .anyway-docs-header [data-search-full]"
			)
		).find((element) => element.getClientRects().length > 0);
		const target =
			previous?.isConnected && previous !== document.body ? previous : trigger;
		target?.focus({ preventScroll: true });
	}, []);

	return (
		<SearchDialog {...search} {...props}>
			<SearchDialogOverlay />
			<SearchDialogContent
				className="docs-search-dialog"
				onCloseAutoFocus={restoreFocus}
				onOpenAutoFocus={rememberFocus}
			>
				<SearchDialogHeader>
					<SearchDialogIcon />
					<SearchDialogInput />
					<SearchDialogClose className="docs-search-close">
						<Kbd>Esc</Kbd>
					</SearchDialogClose>
				</SearchDialogHeader>
				<SearchDialogList />
			</SearchDialogContent>
		</SearchDialog>
	);
}

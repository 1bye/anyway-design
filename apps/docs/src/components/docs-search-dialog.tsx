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
import { Kbd } from "./kbd";

export default function DocsSearchDialog(props: SharedProps) {
	const search = useDocsSearch({ client: fetchClient({ api: "/api/search" }) });

	return (
		<SearchDialog {...search} {...props}>
			<SearchDialogOverlay />
			<SearchDialogContent className="docs-search-dialog">
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

import { ExamplePreview } from "./example-preview";
import ContextMenuExample from "./examples/context-menu";
import contextSource from "./examples/context-menu?raw";
import NestedMenuExample from "./examples/nested-menu";
import nestedSource from "./examples/nested-menu?raw";
import ShortcutPreviewExample from "./examples/shortcut-preview";
import shortcutSource from "./examples/shortcut-preview?raw";
import StackedMenuExample from "./examples/stacked-menu";
import stackedSource from "./examples/stacked-menu?raw";

const examples = [
	{
		component: ShortcutPreviewExample,
		description:
			"Hold Command on Mac or Control on Windows to reveal available actions.",
		id: "shortcuts",
		source: shortcutSource,
		title: "Shortcut preview",
	},
	{
		component: NestedMenuExample,
		description:
			"Follow Design → Liquid → Components. Use arrow keys to explore each level.",
		id: "nested-menus",
		source: nestedSource,
		title: "Nested submenus",
	},
	{
		component: StackedMenuExample,
		description:
			"Open Project, then Manage access. Escape returns to the surface underneath.",
		id: "stacked-menus",
		source: stackedSource,
		title: "Stacked menus",
	},
	{
		component: ContextMenuExample,
		description:
			"Right-click the idea, or focus it and press Shift + F10. Long-press works on touchscreens.",
		id: "context-menu",
		source: contextSource,
		title: "Context menu",
	},
];

export function MorePlaygrounds() {
	return examples.map(
		({ id, title, description, component: Component, source }) => (
			<section
				aria-labelledby={`${id}-title`}
				className="component-example"
				id={id}
				key={id}
			>
				<ExamplePreview
					code={source.replaceAll('"../liquid/', '"./components/liquid/')}
					controls={null}
					heading={
						<header className="example-heading">
							<h2 id={`${id}-title`}>{title}</h2>
							<p>{description}</p>
						</header>
					}
					name={title}
					variants={null}
				>
					<div className="preview-stage simple-preview">
						<Component />
					</div>
				</ExamplePreview>
			</section>
		)
	);
}

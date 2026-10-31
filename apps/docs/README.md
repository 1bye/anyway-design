# Anyway documentation prototype

A local documentation app built with Fumadocs, TanStack Start, Vite, and React.
It uses Fumadocs' default neutral theme, documentation layout, and content
components, with Anyway's wordmark and Instrument Sans typography from the main
web app. It includes an interactive preview of Anyway's shared macOS switch.

From the repository root:

```sh
bun install
bun run dev:docs
```

Open [localhost:3007](http://localhost:3007).

- Guide: `/docs/getting-started`
- Live component: `/docs/components/switch`
- Search: the search button or Command/Control-K

The switch preview imports `MacSwitch` from `@anyway-design/macos`; size,
appearance, disabled state, and current value are reflected in its copyable
example. Reset restores the initial preview. Interactions stay in memory.

## Authoring

Add `.mdx` pages in `content/docs` and order them in `meta.json`. Fumadocs builds
the page tree, table of contents, highlighted code, and local search index.
Register interactive React examples in `src/components/mdx.tsx`.

`src/components/docs-shell.tsx` uses the standard Fumadocs `DocsLayout` with the
Anyway wordmark in its navigation title, inverted in dark mode.
`src/styles.css` imports the default neutral theme and the product component
styles, and sets the sans-serif font to Instrument Sans. Light/dark mode,
navigation, spacing, and search use Fumadocs defaults. Shared
product components remain in their workspace packages.

## Verification

```sh
bun run build:docs
bun run --cwd apps/docs check-types
bun run --cwd apps/docs test
bun x ultracite check apps/docs
```

Vite generates `src/routeTree.gen.ts` and Fumadocs generates `.source/`; both are
ignored. Start the dev server or run the build before a fresh type check.

This prototype is local only. Deployment and a reusable theme package are deferred
until the layout is agreed. The production build currently emits upstream CSS
optimizer warnings for Fumadocs' `::highlight()` search styles and a bundle-size
warning; these do not prevent a successful build.

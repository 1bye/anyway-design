# Anyway documentation prototype

A local documentation app built with Fumadocs, TanStack Start, Vite, and React.
It uses Fumadocs' neutral theme, documentation layout, and content components,
with Anyway's wordmark, Instrument Sans typography, an Instrument Serif italic
welcome headline, a continuous sketchbook paper texture across the page,
pill controls, and an integrated sidebar. It includes an
interactive preview of Anyway's shared macOS
switch. The [documentation design system](../../design.md#documentation) defines
the shared visual rules for every page and future Anyway documentation project.

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
The responsive controls inspector uses `PlaygroundChoice` radio segments for
size, appearance, checked, and disabled state. It sits beside wide previews and
below narrow ones, with native arrow-key navigation and visible focus states.

## Authoring

Add `.mdx` pages in `content/docs` and order them in `meta.json`. Fumadocs builds
the page tree, table of contents, highlighted code, and local search index.
Register interactive React examples in `src/components/mdx.tsx`.
Page icons are inline SVGs in `src/components/page-icons.tsx`. Set `icon` to
`GettingStarted` or `Switch` in MDX frontmatter; `src/lib/source.ts` resolves
that name for the shared sidebar.

`src/components/docs-shell.tsx` uses the standard Fumadocs `DocsLayout` below a
Holocron-inspired masthead: the Anyway wordmark, centered search, repository
link, and compact theme switch. Section navigation sits at the top of the sidebar. The welcome banner
appears across Documentation and Components. `src/components/docs-header.tsx` owns the header,
section navigation, and banner. The sticky header uses
Fumadocs' banner offset so the sidebar and anchor links stay clear of it.
`src/components/banner-ink.tsx` paints the welcome headline and actions into the
same canvas as the mouse-responsive ink droplets. Nearby drops collect into
pools at fixed centers, then fade when idle. A separate pointer-driven ink layer
smears lettering, arrows, and drop pigment locally, leaving button surfaces
intact and stored drop centers fixed. Nearby drops fuse through a WebGL2 SDF smooth union in `src/lib/ink-field.ts`,
sharing one contour and the same smear. The original Canvas drops remain the
fallback when WebGL is unavailable. The bounded trail clears within 900ms, restoring the clean print. The
HTML remains the accessible layout and interaction source, with its entire
visual layer hidden while canvas is active. Canvas also draws keyboard focus
rings. Touch and reduced
motion use the HTML appearance. `src/lib/banner-scene.ts` caches the printed
scene from the actual layout and fonts.
`src/styles.css` imports the neutral theme and product component styles, and
defines the documentation text scale, surfaces, radii, and sidebar treatment.
`src/components/docs-sidebar.tsx` nests the current page's headings under its
navigation link, using Fumadocs' active-heading tracking. The standard sidebar
drawer provides mobile navigation. Light/dark mode and search use Fumadocs'
built-in behavior. `src/components/docs-search-dialog.tsx` composes the search
palette from Fumadocs primitives, with rounded result rows and a shared `Kbd`
Escape keycap. The root provider lazy-loads it. Shared product components remain
in their workspace packages.

## System states

`src/components/docs-state.tsx` shares the header, paper background, compact
typography, and borderless pill actions across missing, loading, and failed pages.
The 404 offers a guide link and search; errors offer a full-page reload and guide
link, without exposing exception details. Loading uses a static skeleton and an
accessible status announcement. Router pending views wait 400ms before appearing
and stay visible for at least 250ms; MDX Suspense uses the same loading component.

The root document is a TanStack `shellComponent`, so its HTML, scripts, and
Fumadocs theme/search providers remain mounted around route boundaries. The
router supplies the shared error and pending components. Recovery views render
without requiring the page loader or sidebar tree to succeed.

## Verification

```sh
bun run build:docs
bun run --cwd apps/docs check-types
bun run --cwd apps/docs test
bun x ultracite check apps/docs
```

For system states, check an unknown `/docs/…` URL and an unmatched root URL
(both return HTTP 404), pause a page-loader request to inspect loading, and fail
one to inspect error recovery. Restore the request and use Reload page to return
to the document. Verify search from the 404 and narrow layouts in both themes.

Vite generates `src/routeTree.gen.ts` and Fumadocs generates `.source/`; both are
ignored. Start the dev server or run the build before a fresh type check.

This prototype is local only. Deployment and a reusable theme package are deferred
until the layout is agreed. The production build currently emits upstream CSS
optimizer warnings for Fumadocs' `::highlight()` search styles and a bundle-size
warning; these do not prevent a successful build.

# Anyway documentation boilerplate

A local documentation app built with Fumadocs, TanStack Start, Vite, and React.
It uses Fumadocs' neutral theme, documentation layout, and content components,
with Anyway's wordmark, Instrument Sans typography, an Instrument Serif italic
welcome headline, a continuous sketchbook paper texture across the page,
pill controls, and an integrated sidebar. A dependency-free React counter shows
the live-example pattern; a removable macOS Switch demo shows a richer playground. The [documentation design system](../../design.md#documentation) defines
the shared visual rules for every page and future Anyway documentation project.

From the repository root:

```sh
bun install
bun run dev:docs
```

Open [localhost:3007](http://localhost:3007).

- Guide: `/docs/getting-started`
- Live examples: `/docs/components`
- Optional Switch demo: `/docs/components/switch`
- Search: the search button or Command/Control-K

The switch preview imports `MacSwitch` from `@anyway-design/macos`; size,
appearance, disabled state, and current value are reflected in its copyable
example. Reset restores the initial preview. Interactions stay in memory.
The responsive controls inspector uses `PlaygroundChoice` radio segments for
size, appearance, checked, and disabled state. It sits beside wide previews and
below narrow ones, with native arrow-key navigation and visible focus states.

## Authoring

### Project configuration

Edit `src/docs.config.ts` to adapt the shared shell to another Anyway project:

- `name` and `description` drive site metadata, accessible brand labels, and the
  root search breadcrumb. Page titles append the project name automatically.
- `logo` supplies a monochrome asset under `public/`, its viewBox width/height,
  and the baseline height used to align it with the `docs` label. For a logo
  without descenders, set `baseline` to `height`.
- `repositoryUrl` sets the header’s GitHub destination.
- `homePage` is the docs slug used by the root redirect and error recovery link.
- `navigation` defines section labels, destination slugs, and Lucide icons.
- `hero.lines` supplies the intentional headline lines. `hero.actions` supplies
  labels, slugs, optional heading hashes (without `#`), and primary/ghost styles.

The shared `pages` constants keep repeated destinations together. Slugs are
relative to `/docs/`, such as `getting-started` or `components`. Keep
headline lines short enough for the display layout. Configured destinations and
the logo asset are checked by the docs tests.

### Pages and examples

Add `.mdx` pages in `content/docs` and order them in `meta.json`. Fumadocs builds
the page tree, table of contents, highlighted code, and local search index.
Page ordering, group labels, and page-specific prose stay with these content
files. The site config supplies the page-tree root name.
Import page-specific React examples directly into MDX from `src/examples/`.
Reserve `src/components/mdx.tsx` for components used throughout the docs.
Page icons are inline SVGs in `src/components/page-icons.tsx`. Set `icon` to
`GettingStarted`, `Examples`, or `Switch` in MDX frontmatter; `src/lib/source.ts` resolves
that name for the shared sidebar.

`src/components/docs-shell.tsx` uses the standard Fumadocs `DocsLayout` below a
Holocron-inspired masthead: the Anyway wordmark, centered search, repository
link, and compact theme switch. Section navigation sits at the top of the sidebar. The welcome banner
appears across Documentation and Examples. `src/components/docs-header.tsx` owns the header,
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
`src/styles.css` imports the neutral theme and
defines the documentation text scale, surfaces, radii, and sidebar treatment.
`src/components/docs-sidebar.tsx` nests the current page's headings under its
navigation link, using Fumadocs' active-heading tracking. The standard sidebar
drawer is hosted in a native modal dialog on mobile, with Escape dismissal,
background isolation, scroll locking, and focus restoration. Light/dark mode and search use Fumadocs'
built-in behavior. `src/components/docs-search-dialog.tsx` composes the search
palette from Fumadocs primitives, with rounded result rows and a shared `Kbd`
Escape keycap. The root provider lazy-loads it. Shared product components remain
in their workspace packages.

## Optional Switch demo

The starter’s navigation and banner point to the general Examples overview,
which works without a product component package. The Switch demo imports its
playground directly from MDX. Its component styles, code generator, and tests
live together in `src/examples/switch/`; the shared MDX registry and global CSS
have no macOS imports.

To remove the demo from a copy of this app:

1. Delete `content/docs/components/switch.mdx`.
2. Delete `src/examples/switch/`.
3. Remove `@anyway-design/macos` from the app’s `package.json` dependencies.
4. Run `bun install` at the workspace root to update the lockfile, then build,
   type-check, and test the copy.

The default starter keeps the demo enabled. Its dependency is a private workspace
package, so remove it before installing in a repository without `packages/macos`.
The `...components` entry in the root content metadata flattens the Examples
folder, and its `...` entry discovers remaining pages; no navigation edits are
needed when removing Switch. `bun test` discovers shared tests and any tests
colocated with optional examples.

## System states

`src/components/docs-state.tsx` shares the header, paper background, compact
typography, and borderless pill actions across missing, loading, and failed pages.
The 404 uses a large Instrument Serif numeral (`176–416px`) with the welcome
banner’s SDF ink and pointer smear. The main area contains only the
numeral; navigation and search remain in the shared header. Touch, reduced motion,
and initialization failures retain the HTML numeral. Errors offer a full-page reload and guide
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
to the document. Verify header search from the 404 and narrow layouts in both themes.

### Mobile and keyboard checks

Check Getting Started and Switch at 320px, 390px, 768px, and 1280px in both
light and dark themes. Keep horizontal scrolling inside code/table regions.
The desktop inspector sits beside the preview; narrow layouts stack it below.

- Tab to Skip to content, then press Enter: focus moves below the sticky header.
- Open the mobile sidebar: focus stays in the native modal, Escape closes it,
  and focus returns to its trigger. A section link closes it and clears the header.
- Open search with the keyboard, type a query, select with arrows and Enter,
  and dismiss with Escape. Dismissal restores prior focus or the header trigger.
- Use arrow keys on playground radio choices; Tab into overflowing code and
  table regions and scroll with arrow keys. Check visible focus on copy tools.
- Emulate a coarse pointer: chrome targets are at least 44px high; icon-only
  controls are also at least 44px wide. Product previews retain their own sizing.
- Emulate reduced motion: the banner and 404 retain readable HTML with canvas
  disabled. Shell/search animations and theme view transitions are disabled.

The shared light theme uses darker muted text and a 75% white paper tint to keep
contrast across the texture. Dark mode retains its neutral muted text and 86%
black tint. The design contract records the paper contrast bounds. These browser
checks do not replace physical-device or screen-reader testing.

Vite generates `src/routeTree.gen.ts` and Fumadocs generates `.source/`; both are
ignored. Start the dev server or run the build before a fresh type check.

Deployment and a reusable theme package are not configured. The Getting Started
guide covers copying this app inside a compatible Bun workspace, branding, MDX
authoring, and build checks. For another repository, supply the root Bun catalog
or replace `catalog:` dependency references with concrete versions. The production build currently emits upstream CSS
optimizer warnings for Fumadocs' `::highlight()` search styles and a bundle-size
warning; these do not prevent a successful build.

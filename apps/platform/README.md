# Anyway / platform

Platform is the product documentation app built on `@anyway-design/docs`.
Its first library is macOS, with 43 catalog entries. It includes the complete existing macOS Lab:
component previews, inspectors, generated examples, the desktop lab, and native
comparison studies.

From the repository root:

```sh
bun install
bun run dev:platform
```

Open [localhost:3008](http://127.0.0.1:3008).

- `/docs/getting-started`: macOS package and provider setup.
- `/docs/macos`: visual, searchable component gallery, read directly from macOS Lab.
- `/docs/macos/components/switch`: component docs with a live React preview, controls, usage code, and example props.
- `/docs/macos/playground?component=switch`: live workbench at a component.
- `/docs/macos/playground?view=toggle-controls-reference`: native comparison.
- `/macos-lab/index.html`: full-window macOS Lab, including legacy study views.

The docs app at port 3007 remains the reusable starter/reference consumer.
The standalone macOS Lab at port 3006 also remains available.

## Shared and local code

`src/docs.config.ts` sets the Anyway wordmark, `platform` header label, site
metadata, navigation, and welcome actions. The shared docs package supplies
layout, typography, texture, ink, search UI, recovery states, and controls.
Platform owns its MDX pages, routes, search index/API, component catalog, and
workbench host. Global search combines MDX pages with component titles,
descriptions, and import names, linking results directly to their component pages.

Every catalog entry gets a virtual Fumadocs page and grouped sidebar link from
`src/lib/macos-components.ts`. Pages render the lab's actual preview components
directly in React, with local prop and environment controls and generated usage
code. Gallery thumbnails mount only near the viewport and are inert; interaction
belongs to the component page. Preview code and styles load on demand. The
`data-component-preview` boundary preserves native control borders inside the
docs design. No duplicate per-component MDX files or demo implementations are needed.

The optional full macOS Lab runs in a same-origin frame so its global CSS, native portals,
keyboard shortcuts, and sample app state remain independent from the docs shell.
It uses the actual lab source and build; there is no copied second workbench.
The catalog is exported by the `macos-lab` workspace package. Nested query links
keep component/reference navigation on the lab document under `/macos-lab/`.
Use Open macOS Lab for more room on desktop compositions.

Development uses a Vite middleware to transform the lab's existing HTML entry
and serve its public assets. No second dev server is required. Production builds
use Turbo's dependency graph to build macOS Lab first, then build Platform and
include the lab HTML, bundles, fonts, and reference assets in `dist/client`.

## Build and verify

From the repository root:

```sh
bun run build:platform
bun run --cwd apps/platform check-types
bun run test:platform
bun run --cwd apps/macos-lab check-playground
bun x ultracite check apps/platform
```

Use the root build command so Turbo builds the macOS Lab dependency first.
When invoking app builds manually, build `apps/macos-lab` before `apps/platform`.
Fumadocs and TanStack generate `.source/` and `src/routeTree.gen.ts`; build before
a fresh type check.

Test catalog filtering, component changes, inspector controls, generated code,
native comparison/back navigation, outer docs search, mobile navigation, and
an unknown docs route. Check both docs themes and narrow widths. Native fidelity
limitations remain documented by the original lab and package.

Deployment is not configured. A host must serve `dist/client` static files,
including `/macos-lab/index.html` and `/assets/`, alongside the TanStack Start
server for document routes and search. Assets stay on the same origin.

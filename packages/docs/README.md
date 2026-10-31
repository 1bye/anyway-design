# @anyway-design/docs

The shared Anyway documentation design for React 19, Fumadocs 16.17.9, and
Tailwind CSS 4. The package owns the header, sidebar, welcome banner, search UI,
recovery states, playground controls, typography, paper texture, and ink effects.

The consumer owns its MDX content, project configuration, logo, examples,
framework routes, search index/API, metadata, and deployment adapter.
`apps/docs` is the working TanStack Start + Vite reference consumer.

## Install in Platform

The package starts at `0.1.0` and has not been published to a registry. In this
monorepo, use `"@anyway-design/docs": "workspace:*"`. For a separate repository,
create a local release from this repository's root:

```sh
cd packages/docs
bun pm pack --destination /tmp
```

Then, from Platform's docs app directory:

```sh
bun add /tmp/anyway-design-docs-0.1.0.tgz
```

Install the peer dependencies listed in `package.json` in the consuming app.
Fumadocs core/UI are pinned together because they share React contexts and layout
slots. Keep React and Fumadocs deduplicated. After a registry is configured and the
package is published, consumers can install an explicit registry version instead
of a tarball. Packing does not publish anything.

This is a source package: it ships TypeScript/TSX and CSS for the consumer's
bundler to compile. The tested integration is Vite + TanStack Start. In Vite,
include the package in SSR transformation so installed tarballs work as well as
workspace links:

```ts
// Merge this into the consumer's existing Vite config.
ssr: { noExternal: ["@anyway-design/docs"] }
```

## Styles and assets

In the docs app's stylesheet:

```css
@import "tailwindcss";
@import "@anyway-design/docs/styles.css";
```

Load that stylesheet through your framework's normal root CSS entry. The package
registers its own Tailwind source directory and includes the Fumadocs neutral
preset. Vite bundles the serif font and paper texture from package-relative URLs;
there are no public asset-copy steps for them. Instrument Sans is a package
dependency. Font license and texture provenance files ship with the assets.
Your project logo stays in your app's public directory.

These are global styles for a documentation app, including `body`, Fumadocs
layout tokens, and the paper canvas. Use a dedicated docs app/root stylesheet;
this is not an isolated widget stylesheet to load across an unrelated product UI.

## Project configuration

Create a local configuration using the public type:

```tsx
import type { DocsConfig } from "@anyway-design/docs/config";
import { BookOpen } from "lucide-react";

export const docsConfig: DocsConfig = {
  name: "Platform",
  headerLabel: "platform",
  description: "Guides for building with Platform.",
  repositoryUrl: "https://github.com/your-org/platform", // Replace this.
  logo: { src: "/brand/anyway-wordmark.svg", width: 934, height: 202, baseline: 138 },
  homePage: "getting-started",
  navigation: [
    { label: "Documentation", slug: "getting-started", icon: BookOpen },
  ],
  hero: {
    lines: ["Build with", "Platform."],
    actions: [
      { label: "Read the guide", slug: "getting-started", variant: "primary" },
    ],
  },
};
```

`logo` stays the Anyway wordmark (copy it from the starter’s `public/brand/`
directory). `headerLabel: "platform"` renders the `Anyway / platform` lockup.
Omitting `headerLabel` keeps `Anyway / docs`. `name` supplies the project’s
metadata and accessible labels independently of the wordmark.

`baseUrl` defaults to `/docs`; `searchApi` defaults to `/api/search`. Slugs are
relative to `baseUrl`, without a leading slash. When changing either URL, also
change the consumer's actual routes and source loader; config does not create
routes. `getDocsHref(config, slug)` builds links using the configured base.
The brand link and recovery link open `homePage` within the docs, not the host
product's root. Hero actions can include a heading `hash`, without `#`.

Wrap your framework's Fumadocs provider with `DocsProvider`. For TanStack Start,
use this composition inside your existing root document's body:

```tsx
import { DocsProvider } from "@anyway-design/docs/config";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { lazy } from "react";
import { docsConfig } from "./docs.config";

const DocsSearchDialog = lazy(() => import("@anyway-design/docs/search"));

// Inside the root shell:
<DocsProvider config={docsConfig}>
  <RootProvider search={{ SearchDialog: DocsSearchDialog }}>
    {children}
  </RootProvider>
</DocsProvider>;
```

Keep these providers in the document shell, surrounding route error and loading
boundaries. `DocsProvider` supplies only project configuration. The consumer's
Fumadocs provider supplies framework links, routing, theme, and search context.
Shared components use Fumadocs' framework adapter and have no TanStack route-tree
imports. Other framework integrations must supply their corresponding Fumadocs
provider and bundler configuration; they are not verified by this starter.

## Public entries

| Import | Exports |
| --- | --- |
| `@anyway-design/docs/config` | `DocsConfig`, `DocsProvider`, `useDocsConfig`, `getDocsHref` |
| `@anyway-design/docs/shell` | `DocsShell` with `tree`, `toc`, and `children` |
| `@anyway-design/docs/header` | `DocsHeader`, `DocsSectionTabs`, `DocsWelcomeBanner` |
| `@anyway-design/docs/states` | `DocsNotFound`, `DocsLoading`, `DocsError` |
| `@anyway-design/docs/search` | Default `DocsSearchDialog` for the Fumadocs root provider |
| `@anyway-design/docs/copy-button` | `CopyButton` |
| `@anyway-design/docs/playground-choice` | `PlaygroundChoice` |
| `@anyway-design/docs/kbd` | `Kbd` |
| `@anyway-design/docs/page-icons` | `GettingStartedIcon`, `SwitchIcon` |
| `@anyway-design/docs/styles.css` | Shared global documentation stylesheet |

The docs route wraps Fumadocs `DocsPage`/`DocsBody` in `DocsShell`. Keep MDX
collection generation and `createFromSource` search indexing in the consumer.
Use the state components for router error, pending, and not-found views, with
`400ms` pending delay and `250ms` minimum duration as in `apps/docs/src/router.tsx`.
The package contains no project content or macOS component dependency.

## Update and release

1. Change shared code here and verify the reference app.
2. Run package/app tests, type checks, the docs production build, and Ultracite.
3. Bump this package's version in `package.json` and update the workspace lockfile.
4. Pack the release. Install that tarball in Platform and commit its dependency
   and lockfile changes, or publish to your chosen registry and pin that version.
5. Rebuild Platform and check its navigation, search, examples, and system states.

Platform's content, logo, configuration, and routes remain local during updates.
New package APIs or peer-version requirements may need a consumer migration;
review release changes before updating. Framework routes and deployment adapters
are maintained by each consumer and are not updated by a package version bump.

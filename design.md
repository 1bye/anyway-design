# Anyway — design system

Use the documentation system below for `apps/docs` and documentation for other Anyway projects. The website brief later in this file applies to `apps/web`.

## Documentation

Status: shared design contract, based on the current documentation prototype.

The documentation should feel quiet, compact, and built into the page. Anyway supplies the identity and Instrument Sans typography. Fluid Functionalism informs the restraint; Holocron informs the compact text scale and sidebar rhythm. Fumadocs supplies the layout, content primitives, search, and navigation behavior.

Apply this system to guides, component pages, navigation, search, and system states. Product demonstrations keep their own product styling inside the preview.

### Design principles

- Use one shared shell and text scale across documentation projects.
- Organize with spacing, alignment, and changes in tone before adding borders.
- Make controls pill-shaped and borderless. Keep large content surfaces softly rounded.
- Let the sidebar share the page canvas; it should not look like a separate panel.
- Keep the interface monochrome. Reserve semantic color for meaning and product color for demonstrations.
- Reuse Fumadocs behavior and shared components rather than styling each page independently.

### Typography

Use the locally bundled `Instrument Sans Variable` font from `@fontsource-variable/instrument-sans`, with `Arial, sans-serif` as the fallback. Keep code in the existing monospace stack. The Anyway wordmark is an image asset, not typeset text.

The welcome headline and oversized 404 numeral are the display exceptions: `Instrument Serif`, italic, weight `400`, matching the hero on [git.1bye.dev](https://git.1bye.dev/). Use the self-hosted `packages/docs/assets/fonts/instrument-serif-italic.woff2` through `--font-display`, with `ui-serif, Georgia, serif` as fallbacks. Its SIL Open Font License is kept beside the font in `instrument-serif-OFL.txt`. Navigation, actions, and article headings remain Instrument Sans.

Values below are CSS pixels at the default `16px` root size. Use rem units so text responds to browser preferences; do not shrink the root font size to achieve the compact scale.

| Role | Size / line height | Weight | Treatment |
| --- | --- | --- | --- |
| Welcome display, below `640px` | `40 / 40` | `400` | Instrument Serif italic, centered, normal tracking |
| Welcome display, `640–767px` | `56 / 56` | `400` | Same treatment |
| Welcome display, `768px` and above | `68 / 68` | `400` | Same treatment |
| Document title and section headings | `16 / 22.4` | `560` | Normal tracking |
| Body and page introduction | `14 / 22.4` | `475` | Normal tracking |
| Sidebar page and section links | `14 / 21` | `400` | Muted at rest, foreground when active |
| Header navigation and actions | `14 / 20` | `400–500` | Sentence case |
| Welcome banner actions | `14 / 20` | `500` | Pill actions |
| Card titles | `14 / 20` | `500` | Compact emphasis |
| Sidebar group labels | `12 / 16` | `400` | Uppercase, `0.04em` tracking |
| Captions and utility labels | `12 / 16` | `400` | Muted; never use for primary prose |
| Code, inline and block | `12 / 19.2` | `500` | Monospace |
| Tables | `14 / 20` | `475` body, `600` header | Align text to the start |

All document heading levels share the compact `16px` size. Preserve a semantic H1 → H2 → H3 hierarchy and use spacing and weight to express structure. Do not use heading tags merely to enlarge text. Card titles, interface labels, and product examples are separate roles.

Keep the logo lockup as a brand exception: Anyway wordmark, a thin slanted divider, and lowercase `docs` at `20px` with a light weight. Reuse `DocsHeader` for the lockup instead of rebuilding it on individual pages. Keep the Anyway wordmark for project docs; set `headerLabel` to the lowercase project label, such as `platform`, to show `Anyway / platform`. The default remains `Anyway / docs`. At `400px` and below, configured project lockups use a `48px` wordmark and `16px` label to leave room for centered search and header controls.

### Color and themes

Use Fumadocs' neutral light/dark palette and semantic `fd-*` tokens. Support light, dark, and system appearance through the existing provider. Do not force every documentation project into dark mode or import the website's light-only palette.

These are the current token values from the neutral theme, with a shared paper canvas override. They document the palette; application code should reference the tokens rather than duplicate the values.

| Role / token | Light | Dark |
| --- | --- | --- |
| Paper canvas, `--color-fd-background` | `#fafafa` | `#222222` |
| Text, `--color-fd-foreground` | `hsl(0 0% 3.9%)` | `hsl(0 0% 92%)` |
| Muted surface, `--color-fd-muted` | `hsl(0 0% 96.1%)` | `hsl(0 0% 12.9%)` |
| Secondary surface, `--color-fd-secondary` | `hsl(0 0% 93.1%)` | `hsl(0 0% 12.9%)` |
| Secondary text, `--color-fd-muted-foreground` | `#5c5c5c` | `rgb(179 179 179 / 80%)` |
| Card, `--color-fd-card` | `hsl(0 0% 94.7%)` | `hsl(0 0% 9.8%)` |
| Popover, `--color-fd-popover` | `hsl(0 0% 98%)` | `hsl(0 0% 11.6%)` |
| Primary action, `--color-fd-primary` | `hsl(0 0% 9%)` | `hsl(0 0% 98%)` |
| Primary action text, `--color-fd-primary-foreground` | `hsl(0 0% 98%)` | `hsl(0 0% 9%)` |
| Hover / selected fill, `--color-fd-accent` | `hsl(0 0% 82% / 0.5)` | `hsl(0 0% 40.9% / 0.3)` |
| Focus ring, `--color-fd-ring` | `#737373` | `#8c8c8c` |

The neutral theme also adjusts the dark desktop sidebar's muted text to `hsl(0 0% 72%)`, muted surface to `hsl(0 0% 16%)`, and secondary surface to `hsl(0 0% 18%)`. Preserve these theme-local adjustments while keeping the sidebar canvas equal to the page canvas.

Use matching foreground tokens on secondary, card, and popover surfaces. Use `fd-info`, `fd-warning`, `fd-error`, and `fd-success` for semantic feedback, with text or an icon identifying the meaning. Keep documentation chrome neutral. The white paper canvas is shared across the page; content, navigation, and controls keep the neutral foreground and interaction tokens.

### Paper canvas and welcome banner

Use the local `sketchbook-paper.png` as the continuous page background, including the header, sidebar, welcome banner, and reading area. It represents plain off-white sketchbook stock with fine fibers and gentle tonal variation, based on the supplied notebook photographs. Avoid printed ruling, colored margin lines, artificial dot grids, or aged parchment.

Attach the paper texture to the document with `scroll`, so the grain moves with the content. Align it at the top center, size it to the page width with a `104.5rem` minimum (the asset's native width at the default root size), and repeat it down long pages rather than stretching it to the full document height. The tint layer fills each surface without repeating. Blend the texture with `luminosity` against the neutral canvas to remove its beige tint. Light mode adds a white overlay at `75%` opacity for bright white paper with subtle grain; dark mode adds a black overlay at `86%`. Sticky header surfaces keep their own paper background while the document scrolls beneath them; the desktop sidebar remains transparent. Text and controls retain their neutral theme colors. The asset's generation prompt and provenance live beside it in `sketchbook-paper.prompt.md`.

Preserve the Instrument Serif welcome headline and existing pill actions. Keep the hero free of handwritten notes, arrows, and decorative underlines. Content cards, code blocks, dialogs, and component previews retain their own quiet surfaces for readability.

On fine mouse pointers without reduced motion, the welcome banner paints its headline, pill backgrounds, action labels, and arrows into the same canvas as the ink. The semantic HTML remains the layout and content source with working links. Hide the entire HTML content layer with `opacity: 0` while the canvas is active, so every visible banner pixel comes from canvas. Render keyboard focus rings in the canvas as well. Underlying text can still be selected and copied, but the native selection highlight is hidden in this experimental mode. Keep HTML visible until fonts and the canvas scene are ready; use the HTML version on touch, reduced motion, or setup failure. Cache the printed scene and refresh it after resize, font loading, theme changes, and control hover/focus changes. Cache lettering and action arrows separately from pill surfaces and focus rings. Combine printed lettering, arrows, and the current ink drops in a temporary pigment layer. Pointer movement lifts and redraws that pigment through a feathered `48px` mask into a short directional smear; button surfaces and focus rings stay crisp. Limit the pull to `14px`, keep at most `8` samples at `24ms` intervals, and fade back to the clean print within `900ms`. Skip the extra text-frame composition when no smears remain. Ink drops retain their original shape, gradients, growth, and lifetime; keep existing stain centers fixed when nearby drops accumulate. The smear pulls the visible pigment locally without changing stored drop centers, volumes, or lifetimes. Restore the original drop appearance as the smear settles. Render the drops as one WebGL2 signed-distance field. Use a polynomial smooth minimum with a `32px` blend band, so nearby silhouettes fuse into one continuous contour; do not draw connector paths. Preserve seeded irregular edges, translucent pigment, diffuse halos, fixed centers, and the existing lifetimes. Reduce the union blend as pigment fades. Composite the field into the shared pigment layer before pointer smearing. Cap the field at `48` drops and `1.25×` pixel density, scissor to the ink bounds, and bound edge antialiasing to avoid artifacts at the field cutoff. Text keeps its separate crisp canvas density. Fall back to the original Canvas drops when WebGL is unavailable or its context is lost, and release GPU resources on cleanup. Mouse movement deposits distinct charcoal droplets. Nearby droplets merge into larger, darker pools, with a maximum volume of `16` drops per pool. Fresh ink holds for `1.8s`, then bleeds outward and fades completely after `5.2s` without new deposits; dark mode uses pale ink. Allow a new deposit at most every `50ms`. Keep it confined to the banner, ignore touch input, and disable it for reduced motion or coarse pointers. Cap the active blooms at `48`, limit canvas pixel density to `2` for crisp text, and stop the animation loop when the ink has faded or the tab is hidden. The canvas must not intercept clicks or appear in the accessibility tree.

### Surfaces, borders, and shape

| Element | Shape and treatment |
| --- | --- |
| Buttons, selects, navigation pills, search | `999px` radius |
| Keyboard shortcut keycaps | `5px` radius, `22px` minimum width, `20px` height, `4px` horizontal padding and gap |
| Command palette / palette result rows | `16px` / `8px` radius; keycaps retain `5px` corners |
| Playground control rows / segments | `8px` / `6px` radius; compact inspector-style choices |
| Cards, callouts, code blocks, playground frame | `24px` radius |
| Larger grouped surfaces using `rounded-2xl` | `28px` radius |
| Page and sidebar canvas | Continuous background, no right sidebar border |
| Default content surface | `45% fd-muted` mixed with `fd-background` in OKLab |
| General hairline, when needed | Foreground at `6%` opacity |
| Sidebar section guide | `1px`, foreground at `14%` opacity |
| Header search outline | `1px`, foreground at `18%` opacity |
| Active section marker | `1px`, foreground color, on top of the guide |

The current radius tokens are `sm = 999px`, `md = 999px`, `lg = 24px`, `xl = 24px`, and `2xl = 28px`. Choose a radius by the role above; the token names do not imply a numerical progression.

Buttons have no visible border. Cards, callouts, code frames, and playground toolbars use tone and whitespace instead of visible outlines and internal dividers. Callouts omit the colored side rail; retain their semantic icon, title, and body, with `12px` start padding. The search outline and nested section guide are intentional exceptions. Keep table rules faint enough to support scanning without creating a heavy grid.

Use no decorative shadow on static documentation surfaces. Retain Fumadocs' restrained overlay treatment for dialogs and menus. A demonstrated product may use its own borders and elevation.

### Layout and spacing

Use the Fumadocs `DocsLayout` grid. The current shell inherits its `97rem` maximum layout width, a `268px` desktop sidebar, and a `900px` maximum article width. Avoid page-specific column widths or competing layout wrappers.

Use a `4px` spacing base, with `4`, `8`, `12`, `16`, `20`, `24`, `32`, `48`, `64`, and `80px` as the main working values. Small `2px` adjustments are reserved for compact navigation and icon alignment.

- Page gutters: `16px` on mobile; the shared header uses `32px` from `768px` upward. Article padding follows Fumadocs: `16px`, then `24px` at `768px`, then `32px` at `1280px`.
- Shared header: one `64px` row with the logo on the left, search centered, and the GitHub mark, label, and compact theme switch on the right without an external-link arrow. Use equal-width outer columns so search stays at the header's actual center regardless of the logo and GitHub widths. Keep this reservation synchronized with `--fd-banner-height`.
- Desktop search is up to `320px` wide, increasing to `384px` from `1280px`. Below `768px`, use a centered `44px` search icon button that opens the same search dialog. Keep the full field and shortcut hint on desktop.
- Section navigation lives at the top of the sidebar, using stacked pills with `8px 12px` padding and a `4px` gap.
- Welcome banner: `24px` side padding, `64px` vertical padding, increasing to `80px` from `768px`. Keep the two-line display headline and actions as the main content, with `32px` between them and `16px` between actions. Omit handwritten annotations, underlines, an eyebrow, and a supporting paragraph.
- Welcome actions: minimum `40px` height, `10px 20px` padding, `14px` labels, `16px` icons, and an `8px` label/icon gap. Keep both actions equally sized in height and allow them to wrap on narrow screens.
- Keep the welcome banner in the shared shell across Documentation and Examples. Switching section tabs preserves the banner above the document title and introduction.
- Use the Fumadocs row variables for sticky elements and anchor offsets. Heading scroll margin is `var(--fd-docs-row-3) + 24px`, which also accounts for the mobile subnavigation.
- Content scrolls normally. Keep the header and desktop sidebar sticky; keep search and navigation reachable on small screens.

### Sidebar navigation

The sidebar should read as part of the document, with compact labels and a visible page outline.

1. Place the Documentation and Examples section pills first, followed by content groups. Search and GitHub live in the top bar; do not duplicate them in the sidebar or mobile subnavigation.
2. Use muted uppercase group labels with `24px` above and `8px` below.
3. Show page links without a permanently filled active pill. The current page uses foreground text; hover uses the shared accent fill. Page icons use the shared SVG set: open book for Getting started and toggle for Switch. Draw on a `20px` viewBox at `16px`, with `1.5px` rounded strokes and `currentColor`; keep them decorative and leave the visible label intact. Choose icons through the MDX `icon` field and the source loader mapping.
4. Expand only the current page's headings beneath its page link. Generate them from the MDX table of contents, including real heading labels and anchor URLs.
5. Indent the heading list `18px` and draw the thin guide. Section links use `2px 12px` padding, `14px` type, and pill-shaped hover feedback.
6. Mark the active section with foreground text and a slim segment on the guide. Expose `aria-current="location"`; use Fumadocs' heading tracking rather than a second scroll observer.
7. Keep the desktop sidebar collapse icon hidden. Use the standard sidebar drawer on mobile; selecting a page or heading closes it.

Header search has a quiet transparent surface, a pill outline, and a minimum visual height of `34px`. Preserve the working Command/Control-K shortcut and Fumadocs search behavior. Compose the command palette with its shared dialog, input, results, and close primitives. Use the shared `Kbd` component inside the Escape close button, with the same keycap styling as the header shortcut. Scope the palette radius tokens on its portalled dialog: `sm = 5px`, `md = lg = 8px`, `xl = 16px`. Keep `6px` result-list padding and `2px` row gaps; selected and hovered rows remain rounded rectangles. Keep the theme switch beside GitHub in the shared header on desktop and mobile; omit it from the sidebar and navigation drawer. Use the sidebar outline instead of a second right-side table of contents or a duplicate desktop outline toolbar.

### Controls and interaction

- Use Fumadocs `buttonVariants` for documentation actions. Primary actions use `fd-primary`; secondary actions use a neutral fill; tertiary actions are ghost buttons.
- Use `14px` labels for primary navigation and page actions. Keep `12px` utility labels for compact playground controls and supporting metadata.
- Define hover, keyboard focus, active/selected, and disabled states. Focus remains visible even when borders are removed: a `2px` `fd-ring` indicator with a `2px` offset is the sidebar baseline.
- Keep links semantic anchors and actions semantic buttons. Icon-only controls need accessible labels; decorative icons are hidden from assistive technology.
- Use the existing Lucide line icons, usually `14–16px`, with `12–14px` supporting arrows. Icons should explain a destination or action, not decorate every text label.
- Reuse library motion and keep new color/surface transitions around `100–150ms`. Respect reduced motion and avoid entrance animations, scroll effects, or animated decoration on reading pages.
- Preserve normal keyboard behavior and touch targets. Compact visual controls need sufficient surrounding hit area on mobile; target `44px` without forcing the visible pill to grow unnecessarily.

### Content and component pages

Write guides in MDX. Import page-specific React examples directly into their pages; reserve the shared MDX component map for components used across the documentation. Use the same shell, typography, callouts, cards, code presentation, and navigation for every project.

Guide pages start with one document title, a short introduction, and logically ordered sections. Keep wording concise, concrete, and useful. Cards and callouts should help the reader make a decision or understand a constraint; they should not become decorative containers around every paragraph.

Component pages include a short description, a working preview, usage guidance, a copyable setup example, relevant props, and accessibility notes. Playground chrome follows this documentation system. The component inside the preview uses its real workspace implementation, appearance, semantics, and product tokens. For example, the macOS switch remains a macOS control; it does not inherit pill-button rules intended for docs chrome.

Copyable examples must reflect the current preview controls and include the setup needed to run them. Show useful feedback for copy, reset, disabled, and error states. Wide code blocks and tables may scroll inside their own containers; the whole page must not overflow horizontally.

Use compact labeled rows for playground controls, inspired by Component Lab. For short option sets and booleans, show all choices as native radio segments instead of hiding them in dropdowns. Keep selected values visible, with `12px` labels, `6px` row gaps, `36px` segment hit areas (`44px` on coarse pointers), and a keyboard focus outline. Put the inspector beside the preview when the playground is at least `704px` wide; stack it below at smaller widths. Checked state, disabled state, preview interaction, reset, and generated code share the same values. Use `PlaygroundChoice` for these rows and keep product styling inside the preview.

### Accessibility and consistency checks

- Preserve one document H1 and a logical heading hierarchy even though heading sizes are equal.
- Check body, muted text, controls, and focus indicators in both light and dark themes. Meet WCAG AA contrast; token reuse alone does not establish contrast on a new surface.
- Do not rely on color alone for state. Use accessible names, current/expanded/disabled state, and visible supporting feedback.
- Verify keyboard navigation, search, section anchors, copy controls, and the mobile drawer. Anchors must land below the sticky header.
- Check a guide and a live component page at desktop and narrow widths after shared design changes.
- Give loading, empty, error, and not-found views the same type scale, palette, shape, and tone as the documentation.

This contract describes the shared baseline and the standard for new work. Guide, component, and standalone system views implement that baseline. Coarse-pointer header, sidebar, hero, code tools, and playground chrome use at least `44px` hit areas. A focus-visible skip link opens the document below sticky chrome, including system-state pages. Keep heading copy buttons visible on touch and keyboard focus. The mobile sidebar uses a native modal dialog for background isolation, Escape dismissal, and focus restoration. Search restores its previous focus or the visible header trigger when dismissed. Code and table overflow regions must be keyboard-scrollable with a visible focus indicator. Reduced motion disables canvas, shell/search animations, and theme view transitions.

The current paper asset and tint give conservative grayscale contrast bounds of `4.65:1` for light muted text, `5.4:1` for dark muted text, and `3.29:1` for light focus outlines on the paper itself. Recheck these values when changing the texture, tint, or tokens; product previews and syntax colors need their own checks. Browser emulation covers guide and Switch pages at `320`, `390`, `768`, and `1280px`; physical-device and screen-reader testing remain separate checks.

### System states

Pending and route errors use the compact `DocsState` composition: the normal `DocsHeader`, continuous paper background, a neutral icon, `12px` status label, `16px / 22.4px` heading at `560`, and `14px` muted body copy. Center the content in the remaining viewport with `24px` side gutters. Recovery actions use borderless pills with `44px` minimum height and wrap on small screens.

The 404 uses the same header and paper with a large Instrument Serif italic `404` as its focal point. Size it with `clamp(11rem, 34vw, 26rem)`, `0.85` line height, and `-0.06em` tracking. Keep the main area limited to the numeral, centered in the remaining viewport. Reuse `BannerInk` on the main surface so the numeral receives the same SDF drops and wet-ink smear. Mark the numeral as canvas content; navigation and search remain available through the shared header. Retain the HTML numeral until fonts/canvas are ready and for touch, reduced motion, or setup failure. The heading’s accessible name is “404 — Page not found”.

The 404 preserves HTTP 404 for missing documentation and unmatched routes; use header navigation or search to recover. Errors use calm generic copy, Reload page, and a guide link. Reload the whole document to recover loader, render, and stale module failures; keep raw exceptions out of the view. Loading uses a static three-line skeleton, an `aria-busy` main region, and a live status announcement outside the busy region. Router loading appears after `400ms` with a `250ms` minimum display time; MDX Suspense uses the same view.

Keep the HTML document and Fumadocs theme/search providers in TanStack's root `shellComponent`, surrounding route boundaries. System views use the shared header independently of page data, so recovery remains available when the page loader fails.

### Implementation and maintenance

Project identity lives in `apps/docs/src/docs.config.ts`: name, description,
monochrome logo asset and baseline geometry, repository URL, default docs slug,
section navigation, and welcome headline/actions. Header, metadata, redirects,
error recovery, and the page-tree root read this config. Keep authored page
copy, page ordering, and group headings in MDX and Fumadocs `meta.json` files.
Changing project configuration preserves the shared typography, spacing,
paper treatment, ink behavior, and state designs.

| Responsibility | Shared source |
| --- | --- |
| Typography, surface recipes, radii, borders, sidebar styling | [Docs CSS](packages/docs/src/styles.css) |
| Page grid, providers, theme access, sidebar configuration | [Docs shell](packages/docs/src/components/docs-shell.tsx) |
| Logo lockup, header navigation, welcome banner | [Docs header](packages/docs/src/components/docs-header.tsx) |
| Page outline and active section behavior | [Docs sidebar](packages/docs/src/components/docs-sidebar.tsx) |
| Document title, introduction, body composition | [Docs route](apps/docs/src/routes/docs/$.tsx) |
| Shared MDX components | [MDX component map](apps/docs/src/components/mdx.tsx) |
| Reference live example | [Optional Switch playground](apps/docs/src/examples/switch/switch-playground.tsx) |
| Guides and navigation ordering | `apps/docs/content/docs/*.mdx` and `meta.json` files |

Change a shared role or token once, then verify it on both page types. Avoid local font sizes, hardcoded colors, or border overrides in individual MDX pages. Keep new rules scoped to documentation so product components and the separate website retain their own design contracts.

For another Anyway project's documentation, reuse this shell and component map, then supply its content and project identity through `src/docs.config.ts`. Keep the documentation font, palette, control shapes, and navigation behavior consistent. A project may demonstrate its own design inside examples without introducing a new documentation theme. Getting Started explains adopting the boilerplate, configuring a project, writing MDX, adding examples, and checking a build. The default Examples overview uses a plain React counter. The macOS Switch is a removable sample with page-local imports, styles, and tests under `src/examples/switch/`; product dependencies must stay out of the shared shell and MDX registry. Shared navigation must point to the overview so it survives individual demo removal. The reusable `@anyway-design/docs` package lives in `packages/docs`. It owns shared design, chrome, controls, canvas behavior, recovery states, and bundled font/paper assets. Consumers supply their own configuration through `DocsProvider`, plus local content, routing, search indexing, and examples. The package uses Fumadocs framework links; its source distribution is verified with TanStack Start and Vite SSR transformation. Release and integration instructions live in `packages/docs/README.md`.

Update this file alongside deliberate shared design changes. Resolve disagreements between this contract and the UI in the shared implementation rather than adding exceptions page by page. Run the documentation build, type checks, and Ultracite checks when changing code; prose-only edits need a link and diff review.

## Website brief (`apps/web`)

Status: implementation brief for the v1 homepage and shared shell

Reference: [Curated Supply](https://www.curated.supply/), inspected August 30, 2026

### 1. Intent

Anyway is an independent design-engineering lab for people who ship software. It publishes interactive UI experiments, practical notes, and production-ready patterns, beginning with the edge cases that usually get left until the end.

The interface should feel quiet, exact, and editorial. The custom wordmark supplies the human character; the product UI stays neutral, rounded, and systematic.

Primary line:

> Small interfaces, overthought.

Supporting line:

> Interactive UI experiments, practical notes, and production-ready patterns for people who ship.

Voice: concise, observant, practical, and lightly playful. Do not sound like an agency, a content farm, or a design-inspiration database.

#### Public identity

The domain previously belonged to an unrelated design studio and still has historical associations with Anyway.Design and Anyway.FM. Authorship must therefore be explicit rather than left only to the About page.

Before implementation is merged, provide values for these identity fields:

- owner name: `OWNER_NAME`;
- X profile: `OWNER_X_URL`;
- GitHub profile, if shown: `OWNER_GITHUB_URL`;
- public email, if shown: `OWNER_EMAIL`.

Required identity placements:

- page title: `Anyway.design — design-engineering lab by OWNER_NAME`;
- meta description: `Interactive UI experiments and production-ready patterns by OWNER_NAME.`;
- hero badge: `By OWNER_NAME · independent lab`;
- X link label: `Follow OWNER_NAME on X`;
- footer: `Anyway is an independent project by OWNER_NAME and is not affiliated with the former Anyway.Design or Anyway.FM.`

Do not imply continuity with the former owner, and do not use `Anyway Studio` or `Anyway Agency` as the product descriptor.

### 2. What to take from the reference

Use Curated Supply as a reference for its visual system and browsing rhythm, not as a template to clone.

Keep:

- a soft gray canvas with white content surfaces;
- a compact three-part header: identity, centered navigation, utility action;
- a narrow centered hero with one clear statement;
- restrained typography with regular weights and tight display tracking;
- rounded filter chips followed immediately by a dense card grid;
- generous product imagery, quiet metadata, and almost no shadow;
- one-column mobile browsing with a horizontally scrollable filter rail;
- a repeated email call to action and directory-style footer.

Translate:

| Curated Supply | Anyway.design |
| --- | --- |
| Product catalog | UI experiments and notes |
| Product photography | Authored interactive previews, stills, or short loops |
| Brand · category | Topic · format or stack |
| Price | Monospace sequence number |
| Staff Pick | Featured |
| Weekly product email | Occasional UI drops |
| Product categories | Loading, Empty, Errors, Undo, Access, Motion, Responsive |

Do not copy Curated Supply's logo, wording, product imagery, catalog data, footer taxonomy, or exact component animation. The result must remain recognizably Anyway through its wordmark, subject matter, previews, and writing.

### 3. Homepage composition

#### Header

- Height: `68px` on desktop and tablet.
- Horizontal padding: `16px` desktop, `16px` mobile.
- Left: the custom black Anyway wordmark, visually about `96 × 28px`.
- Center navigation on widths `>= 810px`: `Lab`, `Notes`, `About`.
- Active item: white pill, `36px` high, `12px` horizontal padding.
- Inactive items: transparent, muted on hover, no permanent border.
- Right: a `36 × 36px` white circular link to the owner's X profile.
- Add search only after there is enough content to search. Never ship a dead search control.
- Below `810px`, use a fixed `72px` header, hide the centered navigation, and show a `40 × 40px` white circular menu button beside a `40 × 40px` X link with a `10px` gap. Offset page content by the header height.

The wordmark is the latest custom monoline direction: a tall hand-drawn `A`, rounded terminals, compressed lowercase rhythm, and deliberate path tension. Redraw it as an SVG before production; do not ship the generated bitmap as the final logo.

#### Hero

Desktop hero region:

- `404px` tall below the header;
- `72px 16px 80px` padding;
- content width `540px`;
- centered alignment;
- `20px` vertical gap between the badge, copy group, and form;
- `8px` gap between headline and supporting copy.

Content:

1. Status pill: green dot + `By OWNER_NAME · independent lab`.
2. H1: `Small interfaces, overthought.`
3. Body: `Interactive UI experiments, practical notes, and production-ready patterns for people who ship.`
4. Email field with placeholder `name@email.com` and action `Get drops`.

The status pill is `28px` high with `4px 10px` padding, a `1px` hairline, a fully rounded edge, and an `8px` dot.

The form is a single white `40px`-high capsule, up to `428px` wide. The input is visually borderless, but the whole control receives a visible focus ring when any child is focused. Wire it to a real provider endpoint before showing it; if no provider is configured, use a simple X link instead. Never fake a successful submission. Do not show subscriber counts or a publishing cadence until they are true.

At `810–1199px`, reduce the headline to `36/39.6` while retaining the desktop composition. On mobile, use `56px 16px 40px` hero padding, a `358px` maximum content width at a `390px` viewport, and a natural-height hero. Keep the content centered. The headline wraps to roughly three lines; the form stays on one line.

#### Filter rail

- Page gutter: `16px`.
- Height: `36px`.
- Chip gap: `8px`.
- Active chip: white fill, no shadow.
- Inactive chip: transparent fill, `1px` border.
- Each chip contains a restrained `16px` line icon and a `14px` label.
- Initial filters: `All`, `Loading`, `Empty`, `Errors`, `Undo`, `Access`, `Motion`, `Responsive`.
- Desktop sort control sits at the far right: `Sort by: Featured` with `Newest` as the second option.
- Mobile rail is sticky below the fixed header at `top: 72px`, is `56px` high with `8px 16px 12px` padding, and scrolls horizontally without a visible scrollbar. Keep `All` first, omit sorting on mobile in v1, and default to `Featured`.

Filters must be real buttons with an active state, not decorative pills.

#### Experiment grid

- Outer gutter: `16px`.
- Grid gap: `16px`.
- `>= 1200px`: three equal columns.
- `810–1199px`: two equal columns.
- `< 810px`: one column.
- Maximum page width: `1400px`.

The simplest implementation is `repeat(auto-fill, minmax(min(100%, 340px), 1fr))`; the breakpoint outcomes above are the visual acceptance criteria.

The grid begins `16px` below the filter rail. Do not insert a redundant section heading between the rail and the cards.

Use 6–9 strong entries for launch. A short, authored selection is preferable to placeholder volume.

Keep the authored order consistent across breakpoints. Responsive layout may reflow the same entries, but must not silently replace or reorder the collection.

#### Experiment card

Card shell:

- white surface;
- `16px` corner radius;
- hidden overflow;
- no default shadow or border;
- the whole card is one semantic link;
- no nested interactive controls inside that link.

Preview:

- inset `16px` from the sides, `24px` from the top, and `8px` from the metadata;
- approximately `6 / 5` aspect ratio;
- `8px` corner radius;
- warm white or context-appropriate demo background;
- use a real UI state or transition, never generic decorative gradients.

Place a `36 × 36px` soft-gray circular arrow at the preview's top-right inset. It is a visual affordance inside the card link, not a second interactive element.

Metadata footer:

- `16px` side and bottom padding;
- left stack gap: `4px`;
- first line: muted `Topic · Format`;
- second line: experiment title in foreground color;
- right: two-digit monospace index such as `01`;
- optional `Featured` pill over the preview, used sparingly.

Example launch cards:

| Metadata | Title | Index |
| --- | --- | --- |
| Undo · React | Undo destructive actions | `01` |
| Errors · Pattern | Offline and reconnecting | `02` |
| Access · React | Permissions before dead ends | `03` |
| Loading · Motion | Skeletons that preserve context | `04` |
| Empty · Pattern | Empty states that guide the next step | `05` |
| Responsive · CSS | Long content without breakage | `06` |
| Motion · CSS | Reduced motion by default | `07` |

After the initial set, use one centered `Show more` pill. Do not add infinite scroll in v1.

#### Footer

The footer uses the same `1400px` shell and `16px` gutters as the page, with `48px` between major groups. It has two parts:

1. A quiet email block repeating `Get occasional UI drops`, the short supporting line, and the same form.
2. A directory with `Explore`, `Topics`, and `Elsewhere` columns, followed by copyright and `Independent project by OWNER_NAME`.

Suggested links:

- Explore: `Lab`, `Notes`, `About`.
- Topics: `Loading`, `Empty`, `Errors`, `Motion`.
- Elsewhere: `X`, `GitHub`, `Email`.

Do not add empty product, store, legal, or archive sections merely to fill the footer.

#### V1 link and control contract

Every visible control must have a real destination or state change:

- wordmark: `/`;
- `Lab`: `/#lab`, where the filter rail and experiment grid live;
- `Notes`: `/notes`, shown only when that static route exists;
- `About`: `/about`, shown only when that static route exists;
- experiment card: `/experiments/:slug`, backed by a real static entry and route;
- X, GitHub, and email: the exact owner URLs defined in Public identity;
- footer navigation: only destinations that are already live.

The email form has `idle`, `submitting`, `success`, and `error` states. On success, replace the field copy with a short confirmation. On error, preserve the entered email and show an inline message. If no provider is configured, replace both forms with a link to the owner's X profile.

Filtering and sorting run against one finite local data array; neither requires a CMS. Derive filter chips from topics that have at least one published entry, with `All` always first. `Featured` places featured entries first and then uses authored index order. `Newest` orders by `publishedAt` descending. After every change, announce the result count through a polite live region and move no keyboard focus.

If a future combination produces no entries, show a compact empty state: `Nothing here yet. Try another topic.` with a `Clear filters` button. If the collection has nine or fewer entries, omit `Show more`; otherwise each activation reveals the next six local entries and the button disappears when all are visible.

### 4. Visual system

#### Color

The v1 site is intentionally light-only.

| Role | Value | Existing token |
| --- | --- | --- |
| Canvas | `#f2f2f2` | `--background` |
| Ink | `#141414` | `--foreground` |
| Surface | `#ffffff` | `--card`, `--popover` |
| Muted text | `#737373` | `--muted-foreground` |
| Hairline | `#e2e2e2` | `--border`, `--input` |
| Soft utility | `#f5f5f5` | `--muted` |
| Subtle hover | `#ebebeb` | `--accent` |
| Status green | `#16d981` | dedicated `--status` |
| Featured text | `#b99651` | dedicated `--featured` |

Green is a signal, not a brand wash. Use it only for live, new, or available status. Avoid gradients and large saturated areas.

#### Typography

- UI, body, and display: self-hosted variable `Geist`, with a metric-compatible system sans-serif fallback.
- Indices and technical metadata: self-hosted variable `Geist Mono`.
- Wordmark: custom SVG, never typeset in Geist in production.
- Use only weights `400` and `500` in the interface.

Commit the licensed WOFF2 files as `apps/web/public/fonts/geist-variable.woff2` and `apps/web/public/fonts/geist-mono-variable.woff2`; do not depend on runtime Google Fonts CSS or add a font package. Declare their weight ranges with `@font-face`, use `font-display: swap`, and preload only the primary Geist file. Tune the fallback with font metric overrides if visual QA shows a shift. Font loading must not cause a measurable layout jump.

| Style | Desktop | Tablet / mobile | Tracking |
| --- | --- | --- | --- |
| Hero | `40/44`, 400 | `36/39.6`, 400 | `-0.02em` |
| Body lead | `16/24`, 400 | `16/24`, 400 | `0.01em` |
| UI / card | `14/20`, 400 | same | `0–0.01em` |
| Emphasized UI | `14/20`, 500 | same | `0` |
| Small meta | `12/16`, 400 | same | `0.01em` |

Avoid bold display type. Hierarchy should come from scale, spacing, and color.

#### Shape and spacing

| Element | Radius |
| --- | --- |
| Card | `16px` |
| Preview | `8px` |
| Pills, form, circular actions | `999px` |
| Footer feature panel, if used | `24px` |

Use a `4px` spacing base. The primary working values are `4`, `8`, `12`, `16`, `20`, `24`, `36`, `48`, `72`, and `80px`. Prefer whitespace over separators. Use no elevation by default; when a floating menu needs separation, use a subtle `0 8px 32px rgb(0 0 0 / 0.08)` shadow.

#### Icons

Use the existing Lucide dependency at `1.5px` stroke. Keep icons at `16px` in chips and `18px` in circular utilities. The logo is custom and must not use Lucide.

### 5. Interaction and motion

- Text and navigation color transition: `400ms cubic-bezier(0.44, 0, 0.56, 1)`.
- Form focus and surface transition: `300ms cubic-bezier(0.44, 0, 0.56, 1)`.
- Card hover: preview lifts `3px`; arrow moves `2px` up and right. Do not scale the card or add a shadow.
- Card focus: visible `2px` foreground ring with a `2px` canvas offset.
- Chip hover: subtle surface fill. Active state changes instantly enough to feel responsive.
- Menu and filter changes must not shift the page unexpectedly.
- Preview loops pause when offscreen and respect `prefers-reduced-motion`.
- Under reduced motion, remove transforms and use opacity/color changes only.

Do not add a custom cursor, scroll hijacking, parallax, or entrance animation to every card.

### 6. Accessibility and content rules

- Use semantic `header`, `nav`, `main`, `section`, `article`, and `footer` landmarks.
- Preserve one H1 and a logical heading order.
- Give the email input a persistent accessible label, even if it is visually hidden.
- Minimum touch target: `44px` on mobile; a `36px` visual control may use a larger hit area.
- Filters expose `aria-pressed`; sort uses a native select or an accessible menu.
- Every preview needs useful alt text or an empty alt when the adjacent title fully describes it.
- Never encode status with color alone.
- Maintain at least WCAG AA contrast and visible keyboard focus.
- Reserve media aspect ratio to prevent layout shift.
- External links identify themselves to assistive technology and use `rel="noopener"` when opening a new tab.

### 7. Repository mapping

Implement this direction with the existing stack; add no UI or animation dependency.

- `packages/ui/src/styles/globals.css`: replace the current generic tokens, set Geist, add `--status` and `--featured`, and keep the light palette as the v1 default.
- `apps/web/src/routes/__root.tsx`: remove the forced `dark` class, replace placeholder metadata, and use normal `min-h-svh` document flow instead of constraining the long page to the current `h-svh` grid. Render router devtools only when `import.meta.env.DEV` is true.
- `apps/web/src/components/header.tsx`: build the shared responsive shell.
- `apps/web/src/routes/index.tsx`: replace the starter content with the homepage.
- `apps/web/public/brand/anyway.svg`: final production wordmark once redrawn.
- Reuse existing primitives only where they reduce code. Keep one-off homepage blocks in the app rather than inventing a generic component system.

Use CSS Grid, native horizontal overflow, and CSS transitions. Use native controls when they meet the interaction. Do not build search, a CMS, authentication, checkout, or custom newsletter infrastructure as part of the visual pass; connect an external provider or use the documented X-link fallback.

### 8. Acceptance criteria

- At `1280 × 720`, the header, complete hero, filter rail, and top of a three-card row are visible.
- At `390 × 844`, the compact header, complete hero, horizontal filters, and most of the first card are visible.
- The only horizontal scrolling area on mobile is the filter rail.
- The homepage reads as an authored design-engineering lab, not a product-shopping clone.
- `OWNER_NAME` and every visible owner URL are resolved before the implementation is merged; metadata, hero, header labels, and footer identify the owner, and no identity token is rendered literally.
- The independent-project disclaimer is present, and no copy implies affiliation with the former Anyway.Design or Anyway.FM.
- All visible links resolve, form states work, and interactive elements work with keyboard and touch; there are no `#` placeholders or dead controls.
- Every visible topic filter has at least one published entry. Filtering announces the count, the empty state can be cleared, and `Featured` and `Newest` produce their defined orders.
- Focus, hover, loading, empty, and reduced-motion states are defined.
- Geist and Geist Mono load from local WOFF2 assets without a runtime font request or visible layout jump.
- No Curated Supply copy, imagery, identity assets, or catalog content appears in the build.
- Router devtools are absent from the production UI and the page scrolls naturally beyond one viewport.
- The production build and Ultracite checks pass without new dependencies.

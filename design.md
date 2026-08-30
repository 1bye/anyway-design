# Anyway.design — design direction

Status: implementation brief for the v1 homepage and shared shell

Reference: [Curated Supply](https://www.curated.supply/), inspected August 30, 2026

## 1. Intent

Anyway is an independent design-engineering lab for people who ship software. It publishes interactive UI experiments, practical notes, and production-ready patterns, beginning with the edge cases that usually get left until the end.

The interface should feel quiet, exact, and editorial. The custom wordmark supplies the human character; the product UI stays neutral, rounded, and systematic.

Primary line:

> Small interfaces, overthought.

Supporting line:

> Interactive UI experiments, practical notes, and production-ready patterns for people who ship.

Voice: concise, observant, practical, and lightly playful. Do not sound like an agency, a content farm, or a design-inspiration database.

### Public identity

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

## 2. What to take from the reference

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

## 3. Homepage composition

### Header

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

### Hero

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

### Filter rail

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

### Experiment grid

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

### Experiment card

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

### Footer

The footer uses the same `1400px` shell and `16px` gutters as the page, with `48px` between major groups. It has two parts:

1. A quiet email block repeating `Get occasional UI drops`, the short supporting line, and the same form.
2. A directory with `Explore`, `Topics`, and `Elsewhere` columns, followed by copyright and `Independent project by OWNER_NAME`.

Suggested links:

- Explore: `Lab`, `Notes`, `About`.
- Topics: `Loading`, `Empty`, `Errors`, `Motion`.
- Elsewhere: `X`, `GitHub`, `Email`.

Do not add empty product, store, legal, or archive sections merely to fill the footer.

### V1 link and control contract

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

## 4. Visual system

### Color

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

### Typography

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

### Shape and spacing

| Element | Radius |
| --- | --- |
| Card | `16px` |
| Preview | `8px` |
| Pills, form, circular actions | `999px` |
| Footer feature panel, if used | `24px` |

Use a `4px` spacing base. The primary working values are `4`, `8`, `12`, `16`, `20`, `24`, `36`, `48`, `72`, and `80px`. Prefer whitespace over separators. Use no elevation by default; when a floating menu needs separation, use a subtle `0 8px 32px rgb(0 0 0 / 0.08)` shadow.

### Icons

Use the existing Lucide dependency at `1.5px` stroke. Keep icons at `16px` in chips and `18px` in circular utilities. The logo is custom and must not use Lucide.

## 5. Interaction and motion

- Text and navigation color transition: `400ms cubic-bezier(0.44, 0, 0.56, 1)`.
- Form focus and surface transition: `300ms cubic-bezier(0.44, 0, 0.56, 1)`.
- Card hover: preview lifts `3px`; arrow moves `2px` up and right. Do not scale the card or add a shadow.
- Card focus: visible `2px` foreground ring with a `2px` canvas offset.
- Chip hover: subtle surface fill. Active state changes instantly enough to feel responsive.
- Menu and filter changes must not shift the page unexpectedly.
- Preview loops pause when offscreen and respect `prefers-reduced-motion`.
- Under reduced motion, remove transforms and use opacity/color changes only.

Do not add a custom cursor, scroll hijacking, parallax, or entrance animation to every card.

## 6. Accessibility and content rules

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

## 7. Repository mapping

Implement this direction with the existing stack; add no UI or animation dependency.

- `packages/ui/src/styles/globals.css`: replace the current generic tokens, set Geist, add `--status` and `--featured`, and keep the light palette as the v1 default.
- `apps/web/src/routes/__root.tsx`: remove the forced `dark` class, replace placeholder metadata, and use normal `min-h-svh` document flow instead of constraining the long page to the current `h-svh` grid. Render router devtools only when `import.meta.env.DEV` is true.
- `apps/web/src/components/header.tsx`: build the shared responsive shell.
- `apps/web/src/routes/index.tsx`: replace the starter content with the homepage.
- `apps/web/public/brand/anyway.svg`: final production wordmark once redrawn.
- Reuse existing primitives only where they reduce code. Keep one-off homepage blocks in the app rather than inventing a generic component system.

Use CSS Grid, native horizontal overflow, and CSS transitions. Use native controls when they meet the interaction. Do not build search, a CMS, authentication, checkout, or custom newsletter infrastructure as part of the visual pass; connect an external provider or use the documented X-link fallback.

## 8. Acceptance criteria

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

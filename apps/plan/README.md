# Anyway Plan

A small planning canvas for developers. TanStack Start, React, Tailwind CSS, and React Flow, following `design.md` with a gray canvas, white surfaces, quiet type, and local Geist fonts.

```sh
bun install
bun run dev:plan
```

Open <http://127.0.0.1:3004>. Move to the bottom edge to reveal the block dock. Drag a premade block onto the canvas to place it, or click to add it. The dock also opens when its bottom handle receives keyboard focus, and stays visible on touch devices. Drag the center of a block to arrange it. Move near an edge to reveal its connection outline, then drag to another block (or click both edges). Select blocks or connections to edit them; Delete removes selections. React Flow provides keyboard selection, movement, pan, zoom, and fit controls.

The dock has compact 44px buttons, service/provider search, and filters for AWS, GCP, Azure, Cloudflare, AI, and databases. It includes 6,541 catalog icons plus basic blocks and R2. Results fill three rows, with page size adapting to the dock width. Scroll to move through pages continuously, or use the header arrows. Click or drag any result onto the canvas. The search icon reveals an input over the provider tabs with Anime.js; its back arrow or Escape restores the tabs and clears the query. Escape otherwise closes the library. The info button opens a modal with the total icon count and source credits. Animations respect reduced-motion preferences. Keyboard focus and pointer entry open it; touch devices show it by default.

Each block has three appearances: **A · Bare**, **B · White**, and **C · Tinted**. Change the style in the selection panel; names, details, positions, and connections stay intact. Existing plans open with the bare style. Styles, icon references, and connection sides are included in local saves and JSON exports.

Catalog metadata is served locally and warmed shortly after mount; opening the dock loads it immediately. Icons on the current page are loaded eagerly. SVGs load on demand from a pinned theSVG revision through jsDelivr, keeping the full icon collection out of the JavaScript bundle. New catalog artwork needs network access; failed images fall back to the block's generic icon without changing the saved reference. The original six service icons remain local. Credits and the catalog update command are in `public/icons/SOURCES.md`.

The generated catalog and unchanged third-party SVGs in `public/icons` are excluded from Biome. The catalog generator and tests validate the full metadata instead.

Open **Plans** from the folder or save button. Enter a name and choose **Save** to create or update the current saved plan. The adjacent copy and export icons save a separate copy or download a portable JSON file. Click a saved plan to reopen it; each row also has export and delete actions. **New** starts a blank canvas and **Import** opens a file. Escape or clicking outside closes the dialog. Named saves are snapshots: editing the canvas updates the working draft, and saving again updates the named version. Replacing a canvas with unsaved changes asks for confirmation.

The working draft and its saved-plan identity survive reloads; older single-draft storage is read automatically. Saved plans are stored locally in this browser, without an account or cloud sync. Browser storage can be cleared; export files to keep a backup or move to another browser. Multiple tabs share the library but have independent editors; use one tab for the working draft.

## AI tools

WebMCP tools register automatically in supported browsers. The header badge shows **WebMCP is supported** or **WebMCP is not supported**. The app registers:

- `plan_read`: returns the current graph, block kinds, node appearances, and service icons.
- `plan_add`: adds blocks and connections in one validated call, preserving existing content. Read the canvas first and choose unused IDs.
- `plan_search_icons`: searches the same catalog by query and provider, returning up to 24 icon references for `data.icon`.

Example instruction for your browser agent: “Read this plan. Add a worker below the API and connect the API to it with a jobs connection.”

AI-added nodes appear with a brief service-colored outline, followed by a gradient and tile reveal from bottom to top. The Anime.js animation works with all three appearances and skips motion when reduced motion is preferred. Manual additions and reopened plans appear immediately; animation state is not saved or exposed through WebMCP.

The tools let the browser agent read and extend the current canvas. Registration alone does not run a model or send the canvas anywhere. AI processing depends on your agent and may happen in the cloud. There is no embedded model or chat. Opening another plan keeps tools available for the new canvas; leaving the page unregisters them. Manual editing works without WebMCP.

Registration follows the [document.modelContext API](https://developer.chrome.com/docs/ai/webmcp/imperative-api). Verified in Codex's in-app browser on September 9, 2026: native tool discovery, reading the canvas, adding and connecting a storage block, and rejecting a missing endpoint without changing the graph. Unit tests additionally cover invalid batches, file validation, and registration cleanup. Other browsers and agents have not been tested.

## Checks

```sh
bun run test:plan
bun run build:plan
bun run --cwd apps/plan check-types
bun x ultracite check apps/plan
```

The route tree is generated by Vite on the first dev/build run. A Cloudflare Worker configuration is included, matching MD's deployment target, with no database or account required. This scaffold has not been deployed.

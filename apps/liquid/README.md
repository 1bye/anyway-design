# Anyway Liquid

The base app for Liquid, a small toolkit of connected surfaces distributed through a shadcn registry. It follows MD and Plan: TanStack Start, React 19, Tailwind CSS 4, Vite, and a Cloudflare Worker configuration, with a gray canvas, white surfaces, and a local Geist font.

## Run locally

From the repository root:

```sh
bun install
bun run dev:liquid
```

Open <http://127.0.0.1:3005>. No environment variables, database, or Cloudflare credentials are required for local development.

## Connected menu

The home page opens with a compact hero and decorative component previews. Below it, a sidebar links to three live examples: a connected submenu, an action menu, and a status menu. Shared controls stay beside the examples on desktop and become a compact toolbar on mobile.

Softness changes the union between surfaces, corner radius changes the popup shape, and duration scales opening and closing motion across every example. Reset restores the defaults. The example actions update local preview state only.

The sidebar uses standalone [DialKit sliders](https://www.dialkit.dev/) with locally styled tracks, fills, and labels. Drag to adjust, use arrow keys or Home/End, or press Enter on a focused slider to type a value. DialKit and Motion are playground dependencies; the reusable Liquid menu does not import them.

`src/components/liquid/` is self-contained: React, React DOM, and `@base-ui/react` are its only runtime dependencies. It contains the geometry, measurement tracking, motion, surface layers, provider, and menu components; there are no desktop or workspace UI imports. Importing `liquid-menu` includes the standalone CSS.

```tsx
import {
  LiquidMenu,
  LiquidMenuContent,
  LiquidMenuItem,
  LiquidMenuSub,
  LiquidMenuSubContent,
  LiquidMenuSubTrigger,
  LiquidMenuTrigger,
} from "./components/liquid/liquid-menu";
import { LiquidProvider } from "./components/liquid/liquid-provider";

<LiquidProvider>
  <LiquidMenu
    geometry={{ blendRadius: 40, menuRadius: 16 }}
    motion={{ openDurationMs: 240, closeDurationMs: 180 }}
  >
    <LiquidMenuTrigger>Actions</LiquidMenuTrigger>
    <LiquidMenuContent>
      <LiquidMenuItem onClick={duplicate}>Duplicate</LiquidMenuItem>
      <LiquidMenuSub>
        <LiquidMenuSubTrigger>Move to</LiquidMenuSubTrigger>
        <LiquidMenuSubContent>
          <LiquidMenuItem onClick={moveToTeam}>Team</LiquidMenuItem>
        </LiquidMenuSubContent>
      </LiquidMenuSub>
    </LiquidMenuContent>
  </LiquidMenu>
</LiquidProvider>
```

Use one provider around your menus. Base UI manages focus, keyboard navigation, collision positioning, and dismissal. Root and submenu support `open`, `defaultOpen`, and cancelable `onOpenChange`. Content accepts popup props plus `side`, `align`, offsets, `anchor`, and `collisionPadding`. Use `onPresenceChange` for the end of Liquid's surface exit animation; Base UI's `onOpenChangeComplete` tracks its popup lifecycle.

The current geometry supports one connected submenu level. Custom triggers can supply `anchorGeometry` (radius and insets) to match their shape; the default is a 10px button radius. `anchor` and `anchorClip` can measure a different element or clip it to a scroll region. Geometry tracks scrolling, resizing, and content changes. Motion respects live `prefers-reduced-motion` changes.

The CSS reads shadcn's `--popover`, `--popover-foreground`, `--border`, `--accent`, and `--ring` variables, with light fallbacks. Override `--liquid-surface`, `--liquid-outline`, or `--liquid-dim` on the document theme for Liquid-specific colors. Popups and SVG layers render in `document.body`, so theme variables must also reach that portal. Customize widths and item styling with `className` or `style`.

The distance-field geometry retains its original attribution to [Arlan's Liquid UI study](https://www.arlan.me/vault/liquid-ui). Registry publishing is the next phase; there is no public install command yet.

## Checks

```sh
bun run build:liquid
bun run --cwd apps/liquid check-types
bun run test:liquid
bun x ultracite check apps/liquid
```

Vite generates `src/routeTree.gen.ts` during the first dev or build run; run one before checking types in a fresh checkout. Build output lives in `dist/`.

The scaffold has not been deployed or added to the shared Alchemy deployment stack. Local development and builds do not create production resources.

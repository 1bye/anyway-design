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

The home page opens with a compact hero and decorative component previews. Below it, a sidebar links to menu variants, global shortcut hints, nested submenus, stacked menus, and context menus. Preview/Code and variant controls live inside each playground header. Shared controls stay beside the examples on desktop and become a compact toolbar on mobile.

Softness changes the union between surfaces, corner radius changes the popup shape, and duration scales opening and closing motion across the menu variants. Reset restores the defaults. The example actions update local preview state only.

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

<LiquidProvider softness={40} radius={16} duration={240} dim={0.2}>
  <LiquidMenu>
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

Connected submenu branches share one union and exterior outline at every level. Closing branches remain in the union until their animation ends. Custom triggers can supply `anchorGeometry` (radius and insets) to match their shape; the default is a 10px button radius. `anchor` and `anchorClip` can measure a different element or clip it to a scroll region. Geometry tracks scrolling, resizing, and content changes. Motion respects live `prefers-reduced-motion` changes.

The CSS reads shadcn's `--popover`, `--popover-foreground`, `--border`, `--accent`, and `--ring` variables, with light fallbacks. Override `--liquid-surface`, `--liquid-outline`, or `--liquid-dim` on the document theme for Liquid-specific colors. Popups and SVG layers render in `document.body`, and copy supported theme variables from their anchor into the portal. Customize widths and item styling with `className` or `style`.

The distance-field geometry retains its original attribution to [Arlan's Liquid UI study](https://www.arlan.me/vault/liquid-ui). Registry publishing is the next phase; there is no public install command yet.


## Shortcut lens

```tsx
import { LiquidShortcut } from "./components/liquid/liquid-shortcut";

<LiquidProvider shortcuts={{ delay: 300 }}>
  <LiquidShortcut keys="mod+alt+n">
    <button onClick={createIdea}>New idea</button>
  </LiquidShortcut>
</LiquidProvider>
```

Hold Command on macOS or Control elsewhere to dim the page and reveal masked targets with key hints. Actions use global capture listeners and the child's existing click handler. Release the modifier, press Escape, or leave the window to dismiss. `LiquidShortcutToggle` provides an optional clickable alternative. Hidden, disabled, inert, and inactive menu targets are excluded. Only on-screen targets receive hints; off-screen registered actions can still execute. Typing and IME composition are excluded. Common reserved browser shortcuts such as mod+n and mod+f are deliberately not intercepted; choose unreserved combinations. Custom child components must forward their ref and DOM props.

## Stacked menus

Use another `LiquidMenu` inside a menu with `LiquidMenuTriggerItem`. It matches item sizing, participates in arrow-key navigation, and opens an independent surface layer. Escape closes that layer and restores focus to its item trigger. Use `LiquidMenuSub` for a connected branch instead.

```tsx
<LiquidMenu>
  <LiquidMenuTriggerItem>Manage access</LiquidMenuTriggerItem>
  <LiquidMenuContent>
    <LiquidMenuItem onClick={share}>Share with team</LiquidMenuItem>
  </LiquidMenuContent>
</LiquidMenu>
```

## Context menus

```tsx
import {
  LiquidContextMenu,
  LiquidContextMenuTrigger,
  LiquidContextMenuContent,
} from "./components/liquid/liquid-context-menu";

<LiquidContextMenu>
  <LiquidContextMenuTrigger>
    <button className="liquid-card">Untitled idea</button>
  </LiquidContextMenuTrigger>
  <LiquidContextMenuContent>
    <LiquidMenuItem onClick={duplicate}>Duplicate</LiquidMenuItem>
  </LiquidContextMenuContent>
</LiquidContextMenu>
```

The target becomes the menu's origin and mask cutout. Right-click, long-press, Shift+F10, the context-menu key, Enter, and Space are supported. Use a focusable child for keyboard access. Liquid temporarily hides its original border and restores it after exit; focus returns to the target. The default anchor radius is read from the target.

Trigger content and context targets resize automatically. Popup contents animate their height. Intrinsic size changes drive CSS width/height transitions, while geometry tracking reads the actual animated bounds. Reduced-motion preferences disable size transitions. `LiquidAutoSize` is also available for other changing content. Menu widths can still be explicitly set using content styles.

## Checks

```sh
bun run build:liquid
bun run --cwd apps/liquid check-types
bun run test:liquid
bun x ultracite check apps/liquid
```

Vite generates `src/routeTree.gen.ts` during the first dev or build run; run one before checking types in a fresh checkout. Build output lives in `dist/`.

The scaffold has not been deployed or added to the shared Alchemy deployment stack. Local development and builds do not create production resources.

### Shortcut hint placement

`LiquidShortcut` accepts `side="top" | "bottom" | "left" | "right"` and
`offset={8}` (pixels). Hints measure their own size, center on the target,
and stay inside the viewport. Hints flip to the opposite side when there is not enough room near an edge.
The spotlight fades in and out and respects reduced motion.

```tsx
<LiquidShortcut keys="mod+alt+n" side="bottom" offset={12}>
  <button onClick={createIdea}>New idea</button>
</LiquidShortcut>
```

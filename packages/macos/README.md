# @anyway-design/macos

React components for browser previews of macOS interfaces. Import each
component directly and include the stylesheet once:

```tsx
import { MacOSEnvironment } from "@anyway-design/macos/environment";
import { Dock } from "@anyway-design/macos/dock";
import "@anyway-design/macos/styles.css";

<MacOSEnvironment preset="tahoe" appearance="light">
  <Dock
    items={apps}
    size={52}
    magnification={1.65}
    position="bottom"
    onActivate={openApp}
  />
</MacOSEnvironment>
```

The environment needs a sized, positioned parent for desktop compositions.
It owns preset, appearance, accent, reduced transparency, reduced motion,
and the portal container so menus retain their styles in embedded previews.

| Import | Components / props |
| --- | --- |
| `environment` | `MacOSEnvironment`: `preset`, `appearance`, `accentColor`, `reduceMotion`, `reduceTransparency`, `className`, `style` |
| `dock` | `Dock`: `items`, `size`, `magnification`, `position`, `adaptive`, `autoHide`, `revealDelay`, `hideDelay`, `onActivate`, `glass`, `glassBackdrop` |
| `menu-bar` | `MenuBar`: `menus`, `status`, `onAction`; `AppleMark` |
| `window` | `MacWindow`: `title`, `sidebar`, `sidebarWidth`, `toolbarLeading`, `toolbar`, `footer`, `active`, window action callbacks; `TrafficLights` |
| `window-toolbar` | `WindowToolbarGroup`: `label`, `children`; `WindowToolbarButton`: `label`, native button props |
| `window-sidebar` | `WindowSidebar`: `groups`, `selected`, `onSelect`, `label` |
| `window-symbol` | `WindowSymbol`: `name`, `size`, SVG props; `WindowSymbolName` |
| `tabs` | `MacTabs`: `tabs`, `value`, `onValueChange`, `variant`, `label` |
| `controls` | `MacButton`, `MacSwitch` |

Menus and tabs use Base UI for focus and keyboard behavior. Dock pointer
updates use one animation frame and DOM transforms, without React renders
on pointer movement. Actions are callbacks; the package never controls
the operating system.

Tahoe windows use an inset sidebar that extends behind the traffic lights,
with navigation before the title and action groups after it. Sequoia keeps
the full-width title bar and divided sidebar. The same slots work in both:

```tsx
import { MacWindow } from "@anyway-design/macos/window";
import { WindowSidebar } from "@anyway-design/macos/window-sidebar";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import { WindowToolbarButton, WindowToolbarGroup } from "@anyway-design/macos/window-toolbar";

<MacWindow
  title={selected}
  sidebarWidth={165}
  sidebar={
    <WindowSidebar
      label="Files"
      groups={[{
        id: "favorites",
        label: "Favorites",
        items: [
          { id: "Documents", label: "Documents", icon: <WindowSymbol name="document" /> },
          { id: "Downloads", label: "Downloads", icon: <WindowSymbol name="downloads" /> },
        ],
      }]}
      selected={selected}
      onSelect={setSelected}
    />
  }
  toolbarLeading={
    <WindowToolbarGroup label="Navigation">
      <WindowToolbarButton label="Back" onClick={goBack}>
        <WindowSymbol name="chevron-left" />
      </WindowToolbarButton>
    </WindowToolbarGroup>
  }
  toolbar={
    <WindowToolbarGroup label="File actions">
      <WindowToolbarButton label="Share" onClick={share}>
        <WindowSymbol name="share" />
      </WindowToolbarButton>
    </WindowToolbarGroup>
  }
>
  <YourContent />
</MacWindow>
```

Sidebar groups accept optional headings and React icons; selection is
controlled and announced with `aria-current`. Toolbar groups are named
fieldsets, and buttons retain native disabled, keyboard, and click behavior.
Omit `sidebar` to use the full content width. `active={false}` mutes the chrome
and traffic lights. Reduced transparency removes the sidebar backdrop blur.

`WindowSymbol` supplies the Finder toolbar and sidebar glyphs on a shared
16-unit optical canvas, with individual stroke weights and filled details.
These are custom SVG approximations drawn against the reference, not exported
SF Symbols. They inherit `currentColor`, including selection and disabled
states, and are decorative; their containing controls provide accessible labels.
Custom React icons remain supported in every slot.

The default window is 670 × 420 CSS pixels with a 165px sidebar and a 52px
title bar. `style` can set dimensions and the CSS variables
`--mac-window-titlebar-height`, `--mac-window-radius`,
`--mac-window-sidebar-inset`, and `--mac-window-sidebar-material`.
`--mac-traffic-close`, `--mac-traffic-minimize`, and `--mac-traffic-zoom`
allow color calibration. The library contains no reference screenshots.
The lab's [Tahoe window comparison](../../apps/macos-lab/README.md) normalizes
Apple's published image separately; its smaller dimensions and colors are
image-specific calibration values, not claims about OS defaults.

Each Dock item's `icon` accepts an image URL or a React element, such as an
inline SVG. Custom artwork should fill the supplied square canvas and include
its intended transparent margins. `size` measures this canvas, not the opaque
icon face. The lab's reference-only icon clips are not part of this package.

`adaptive` defaults to `true`. `size` is the maximum requested canvas size:
the Dock scales down uniformly to fit its positioned container, reserving
space for the full magnification wave and an 8px end gutter. This fit stays
fixed during hover, so the Dock doesn't shrink under the pointer. A
`ResizeObserver` updates it when the container, items, or geometry changes.
Bottom placement fits the available width; left/right fit the available height.
Extremely dense lists produce small icons; there is no minimum-size overflow
or scrolling mode. Tooltips retain their text size. Use `adaptive={false}` for
fixed-scale reference compositions.

Enable `autoHide` to slide the Dock out of its container. A 6px strip at the
chosen edge reveals it after `revealDelay` (120ms by default). Leaving starts
`hideDelay` (500ms); returning cancels the hide. The edge is also a **Show Dock**
button for touch and keyboard access. Keyboard focus keeps the Dock visible,
and hidden items are inert. Reduced motion disables the slide transition.
The 180ms slide is provisional rather than native timing calibration.

```tsx
<Dock
  items={apps}
  size={52}
  autoHide
  revealDelay={120}
  hideDelay={500}
/>
```

Magnification uses a broad cosine wave with a four-canvas influence radius,
estimated from the [native Tahoe hover sequence around 0:38–0:43](https://www.youtube.com/watch?v=G3MZaTjIVYc&t=37s).
The pointer is resolved through the expanded layout, so the strongest growth
tracks the displayed icons even near the ends and group separator. Neighbors
shift by their accumulated extra width, preserving gaps and the Dock's center.
Icons grow from the screen edge; running dots follow their centers and the
separator stays between the expanded canvases.

`magnification` remains the configurable maximum (1 disables it); the default
is still 1.65. The filmed reference is a spatial approximation, not a measured
animation specification. The existing 100ms ease-out transition remains
provisional until a direct recording can establish settling timing.

Tahoe now refracts the live page backdrop by default:

```tsx
<MacOSEnvironment preset="tahoe">
  <YourWallpaperAndWindows />
  <Dock items={apps} />
</MacOSEnvironment>
```

No wallpaper URL, position mapping, DOM clone, screen capture, or capture
permission is required. A CSS `backdrop-filter` applies an SVG displacement
map to the actual composited content beneath the surface. Images, gradients,
text, and scrolling or moving windows therefore stay live. A small offscreen
canvas generates only the glass geometry, never a snapshot of page content.
Each Dock gets its own filter ID. Maps update on geometry changes, including
magnification and vertical placement; content changes need no JavaScript work.

`glass="blur"` explicitly selects ordinary live blur. Refraction is enabled
for Chromium with SVG backdrop-filter support; Safari, Firefox, unsupported
engines, and map failures use live CSS blur. `CSS.supports` alone cannot detect
whether SVG backdrop filters actually render, so the enhancement is gated to
the tested engine family. See the [browser compatibility discussion](https://github.com/mdn/browser-compat-data/issues/24110).
The displacement-map image uses a local `data:` URL; a restrictive CSP must
allow it under `img-src`. Maps exceeding 4096px on either axis or one million
pixels fall back to blur.

Content must be behind the Dock in the same page's compositing backdrop.
Ancestor filters, opacity, masks, or another backdrop filter can establish
a [Backdrop Root](https://drafts.csswg.org/filter-effects-2/#BackdropRoot) and
limit what is sampled. This does not capture native windows outside the
browser. Reduced transparency replaces both live effects with an opaque
surface. Sequoia keeps its existing material.

For a controlled image comparison, the optional WebGL renderer remains:

```tsx
<Dock
  items={apps}
  glassBackdrop={{
    src: "/wallpaper.jpg",
    width: 1600,
    height: 1000,
    x: -400,
    y: -900,
  }}
/>
```

Dimensions describe the displayed background image, and `x` / `y` place its
top-left relative to the resting Dock, before any ancestor zoom. Use the same
mapping as the actual wallpaper. The renderer accounts for magnification
expansion and CSS zoom, and repaints on invalidation instead of running an
idle animation loop. It supplies blurred texture sampling, edge refraction,
and a directional rim; it does not implement Apple's compositor or capture
arbitrary DOM content. Sources must be same-origin or CORS-enabled.

`glassBackdrop` selects the texture renderer when `glass="refractive"` (the
default). `glass="blur"` takes precedence. Texture/GPU failure and context
loss fall back to ordinary CSS blur. Reduced transparency hides the canvas.
Texture resolution is capped at 2048px and output density at 4× to bound GPU
memory.

The presets are initial reproductions, pending native screenshot calibration.
See the [lab fidelity notes](../../apps/macos-lab/README.md) for known limits.

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
| `menu` | `MacMenuButton`, `MacContextMenu`: `trigger`, `items`, `onAction`, `positionerProps`; `MacMenuButton` also accepts `open`, `defaultOpen`, `onOpenChange` |
| `window` | `MacWindow`: `title`, `sidebar`, `sidebarWidth`, `toolbarLeading`, `toolbar`, `footer`, `active`, window action callbacks; `TrafficLights` |
| `window-toolbar` | `WindowToolbarGroup`: `label`, `children`; `WindowToolbarButton`: `label`, native button props |
| `window-sidebar` | `WindowSidebar`: `groups`, `selected`, `onSelect`, `label` |
| `window-symbol` | `WindowSymbol`: `name`, `size`, span props; `WindowSymbolName` |
| `tabs` | `MacTabs`: `tabs`, `value`, `onValueChange`, `variant`, `label`, `onAdd`, `onClose`, `onReorder` |
| `controls` | `MacButton`, `MacTextField`, `MacSearchField`, `MacSwitch` |
| `files` | `MacFileItem`, `MacFileGrid`: `items`, `selectedIds`, `onSelectionChange`, `onOpen`, `active`, `showExtensions` |
| `file-icons` | `MacFileIcon`: `name` (`folder`, `document`, `pdf`, `image`, `archive`, `text`), native image props |
| `file-thumbnail` | `MacFileThumbnail`: `src`, `presentation` (`image`, `document`), `fit` (`contain`, `cover`), `alt` |

Menus and tabs use Base UI for focus and keyboard behavior. Dock pointer
updates use one animation frame and DOM transforms, without React renders
on pointer movement. Actions are callbacks; the package never controls
the operating system.

Toolbar, context, and menu-bar menus share the same popup, rows, material,
and Base UI navigation. Items accept `icon`, `shortcut`, `disabled`,
`separatorBefore`, nested `items`, and controlled `checked` state.
`onAction(id)` handles commands and updates checked state in the caller.
Checkbox items stay open by default; `closeOnClick` can override that.
Shortcut text is a visual hint, not a registered application keyboard binding.
Palette entries (`type: "palette"`) accept labeled, checked color choices.

```tsx
import { MacMenuButton, MacContextMenu } from "@anyway-design/macos/menu";
import { WindowSymbol } from "@anyway-design/macos/window-symbol";
import { WindowToolbarButton } from "@anyway-design/macos/window-toolbar";

const items = [
  { id: "copy", label: "Copy", icon: <WindowSymbol name="copy" />, shortcut: "⌘C" },
  { id: "open-with", label: "Open With", items: [
    { id: "preview", label: "Preview" },
    { id: "other", label: "Other…", separatorBefore: true },
  ] },
  { id: "preview-pane", label: "Show preview", checked: previewVisible },
  { id: "paste", label: "Paste", disabled: true, separatorBefore: true },
];

<MacMenuButton
  items={items}
  onAction={handleAction}
  trigger={<WindowToolbarButton label="More actions"><WindowSymbol name="ellipsis" /></WindowToolbarButton>}
/>;

<MacContextMenu
  items={items}
  onAction={handleAction}
  trigger={<button type="button">My document</button>}
/>;
```

Use a focusable element for a context trigger. Right-click, long-press, the
Context Menu key, and Shift+F10 open its menu. Arrow keys, typeahead, submenu
navigation, Escape, outside dismissal, and focus restoration come from Base UI.
Submenus use the same environment portal and flip near clipping boundaries.
Menus scroll when there is insufficient vertical space. Reduced transparency
uses an opaque surface, and reduced motion removes entry/exit transitions.
The Tahoe material uses live backdrop blur and tint; native lensing and timing
are not yet calibrated.

Size overrides include `--mac-menu-width`, `--mac-menu-font-size`,
`--mac-menu-row-height`, `--mac-menu-icon-size`, and `--mac-menu-separator-gap`.
The comparison uses a 192px width and 21px rows to match Apple's published image;
the shared default is 230px wide with 25px Tahoe rows.

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

`WindowSymbol` supplies 33 native Tahoe glyphs for controls, tabs, the toolbar, sidebar, and
menus. AppKit renders them at 4× into transparent 64 × 64 PNGs on a 16px canvas;
CSS masks inherit `currentColor`, including selection, disabled, and highlighted
states. The component renders a decorative `span` (previously an SVG); its
containing control supplies the accessible label. Custom React icons remain
supported in every slot.

The checked-in assets were extracted on macOS 26.6.2 (25G83). Thirty-one use
the public system-symbol API; Applications and Make Alias use the installed
`CoreGlyphsPrivate.bundle` through AppKit's bundle image loader. No native or
private API runs in the browser. Bundlers resolve the static asset URLs.
These are native raster exports, not traced vectors; very large zooms can
soften them. Symbol choice, weight, and optical size are calibrated against the
published references, not a claim that every Finder rendition is identical.
Both presets currently share this Tahoe glyph set.

Regenerate on a Mac with Xcode command-line tools:

```sh
xcrun swift packages/macos/scripts/export-symbols.swift
bun x ultracite fix packages/macos/src/native-symbols.tsx
```

The exporter checks every raster for visible content, transparent corners,
dimensions, and PNG decoding. It fails if a native asset is missing. The
private catalog path and contents can change with macOS releases.
`src/assets/native-symbols/manifest.json` records the OS build, native names,
weights, sources, and optical extents. See that directory's `SOURCES.md`.

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

Document `MacTabs` use a rounded Tahoe track and selected pill, or rectangular
Sequoia tabs. `onAdd` shows the + button; `onClose(id)` enables hover close
buttons and Delete/Backspace. Set a tab's `closable` to `false` to keep it open.
Closing the selected tab requests the next enabled neighbor, then the previous
one, or `""` when none remain. The parent owns the tab array and selected value.
`onReorder(ids)` enables dragging and Alt+Shift+Left/Right; update the array to
match those IDs. Arrow keys, Home, and End select enabled tabs.

Narrow strips scroll horizontally and show an All tabs menu. Selection scrolls
the active tab into view without scrolling the surrounding page. Set
`--mac-tab-height` (30px track), `--mac-tab-padding` (4px above and below), and
`--mac-tab-min-width` (90px) on the document root to calibrate density.
The dragged pill follows the pointer while neighboring tabs slide into their
preview positions. Release settles the pill in 180ms; Escape or releasing
outside the strip cancels. Reduced motion removes the settling animations.
The window's active state and environment appearance
apply to tabs too. Action callbacks apply only to `variant="document"`;
segmented tabs retain their compact layout. Tabs do not detach into OS windows.

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

`MacButton` accepts native button props plus `variant="default" | "primary"`
and `size="regular" | "small"`. Tahoe regular/small buttons use 32/24px minimum
heights and capsule borders. Sequoia retains its original compact geometry.
Hover, pressed, keyboard focus, and disabled states use environment colors;
primary buttons become neutral inside an inactive `MacWindow`.

`MacTextField` accepts native input props and the same size options, including
`ref`, `disabled`, `readOnly`, validation attributes, `value`/`onChange`, and
`defaultValue`. Associate a visible label or supply `aria-label`.

`MacSearchField` accepts native input props except `type`, `size`, and
`onChange`; use `value`/`onValueChange` or `defaultValue`. `onSearch(query)`
handles Enter without submitting a surrounding form; without it, normal form
submission applies. Escape clears a nonempty editable field, and the native
clear icon returns focus to the input. Disabled and read-only fields cannot
be cleared. `clearLabel` customizes the clear button's accessible name.
`className` and `style` apply to the wrapper; `id`, `name`, `ref`, and other
input attributes apply to the input. Composition keystrokes are left to the IME.

The lab's controls study records the native comparison's limits: only inactive
AppKit geometry and neutral states are calibrated. Active accent, hover, and
focus-ring appearance still require a corresponding native capture.

## File items

```tsx
import { MacFileGrid } from "@anyway-design/macos/files";

<MacFileGrid
  label="Project files"
  items={[
    { id: "projects", name: "Projects", kind: "folder" },
    { id: "brief", name: "Project brief.pdf", kind: "pdf",
      thumbnail: "/page-preview.jpg",
      tags: [{ label: "Approved", color: "#30b956" }] },
    { id: "photo", name: "Photo.jpg", thumbnail: "/photo-thumbnail.jpg" },
  ]}
  selectedIds={selection}
  onSelectionChange={setSelection}
  onOpen={openFile}
/>
```

`MacFileItem` is a native button with `file`, `selected`, `showExtensions`, and
native button props. `MacFileGrid` composes those items with controlled selection
and one Tab stop. Item IDs must be unique. `kind` defaults to `document`; `icon`
accepts custom React artwork, and `thumbnail` takes precedence when supplied.
Tags have accessible names, independent of their colors. Labels wrap to two
lines; the full original filename stays in the accessible name and tooltip.
`showExtensions={false}` hides the last suffix while preserving dotfiles.
Selected lines share one SVG outline, including rounded inward corners. It
measures only selected labels and updates on wrapping, text, and font changes.
The keyboard focus ring stays around the caption rather than the entire tile.

Supply any ordinary image as `thumbnail`. Explicit `kind="pdf"`, `"document"`,
or `"text"` gives it a white paper silhouette with a folded corner, clipping,
edge, and shadow. Other kinds (or an omitted kind) retain the image's aspect ratio.
`thumbnailStyle="image" | "document"` overrides that choice. For document previews,
`thumbnailFit="contain"` preserves the whole image within the page; `"cover"`
fills the inset page area and crops from the top. Styling scales with icon size.
Pre-rendered thumbnails can use `thumbnailStyle="image"` to retain their artwork.

`MacFileThumbnail` is also available directly from `file-thumbnail`. Its `src`,
`presentation`, and `fit` props use the same renderer; place it in a sized
`.mac-file-artwork` container and supply `alt` when it conveys independent content.
This decorates a supplied image; it does not render PDF bytes or generate page
content. No canvas, screenshot, image pre-processing, or AppKit call is needed.

Click selects, Command/Ctrl-click toggles, and Shift-click selects a contiguous
range in item order. Arrow keys select and follow the rendered grid on resize;
Shift extends the range. Home/End, Command/Ctrl+A, Escape, typeahead, and Space
selection are supported. Enter and double-click call `onOpen(id)`. Disabled items
are skipped. This is preview interaction, not Finder's complete shortcut set.
Actions do not access the filesystem. Renaming, drag selection, and file dragging
are not implemented. Empty background clicks clear selection.

`active={false}` or an inactive ancestor `MacWindow` mutes selection. The
environment supplies accent, appearance, and typography. Hover keeps tiles
neutral and shows the browser's filename tooltip; keyboard navigation has a
focus outline. Dark/inactive visuals are adaptations of the published
light reference. Both presets currently share the file-item geometry and Tahoe
artwork; a separate Sequoia file baseline has not been calibrated.

Use `style` or `className` to configure `--mac-file-icon-size` (64px),
`--mac-file-column-width` (104px minimum), `--mac-file-row-height` (112px),
`--mac-file-column-gap` (8px), `--mac-file-row-gap` (12px),
`--mac-file-grid-padding` (20px), `--mac-file-label-gap` (5px),
`--mac-file-font-size` (13px), `--mac-file-line-height` (16px), and
`--mac-file-tag-size` (9px). Grid columns grow to fill the container. Adjust row
height with icon size to leave room for two label lines.

The six native file-type icons are 256px transparent AppKit exports. Regenerate
with `xcrun swift packages/macos/scripts/export-file-icons.swift`. The exporter
checks visible/transparent content and PNG decoding, without opening user files.
See `src/assets/native-file-icons/SOURCES.md` for provenance. Custom thumbnails
must be supplied by the caller; the browser does not generate Quick Look previews.

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
| `checkbox` | `MacCheckbox`: `label`, `checked` / `defaultChecked`, `onCheckedChange`, `indeterminate`, `disabled`, `readOnly`, `active` |
| `radio` | `MacRadioGroup`: `label`, `value` / `defaultValue`, `onValueChange`, `name`; `MacRadio`: `label`, `value`, `disabled`, `active` |
| `slider` | `MacSlider`: `label`, `value` / `defaultValue`, `onValueChange`, `onValueCommitted`, `min`, `max`, `step`, `largeStep`, `tickMarks`, `disabled`, `active` |
| `stepper` | `MacStepper`: `label`, `value` / `defaultValue`, `onValueChange`, `onValueCommitted`, `min`, `max`, `step`, `disabled`, `readOnly`, `required` |
| `pop-up-button` | `MacPopUpButton`: `label`, `items`, `value` / `defaultValue`, `onValueChange`, `placeholder`, `size`, `disabled`, `readOnly`, `open` / `defaultOpen`, `onOpenChange` |
| `combo-box` | `MacComboBox`: `label`, `items`, `value` / `defaultValue`, `onValueChange`, `mode`, `size`, `placeholder`, `disabled`, `readOnly`, `open` / `defaultOpen`, `onOpenChange` |
| `alert` | `MacAlert`, `MacAlertPanel`: `title`, `description`, `severity`, `actions`, `defaultAction`, `cancelAction`, `onAction`, `suppression`, `icon`, `presentation`; `MacAlert` adds `open`, `onOpenChange`, `returnFocus` |
| `files` | `MacFileItem`, `MacFileGrid`: `items`, `selectedIds`, `onSelectionChange`, `onOpen`, `active`, `showExtensions` |
| `file-gallery` | `MacFileGallery`: `items`, `selectedIds`, `onSelectionChange`, `onOpen`, `onQuickLook`, `showInfo`, `actions`, `onAction`, `onEditTags` |
| `file-list` | `MacFileList`: recursive `items`, `expandedIds`, `defaultExpandedIds`, `onExpandedChange`, `selectedIds`, `onSelectionChange`, `onOpen`, `sort`, `defaultSort`, `onSortChange`, `columns`, `columnWidths`, `onColumnWidthsChange`, `resizable`, `active`, `showExtensions`, `minRows` |
| `quick-look` | `MacQuickLook`: `items`, `value`, `onValueChange`, `open`, `onOpenChange`, `onOpenFile`, `onShare`, `onMarkup`, `returnFocus`, `style`; `MacQuickLookPanel` for embedded previews |
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

`WindowSymbol` supplies 41 native Tahoe glyphs for controls, tabs, the toolbar, sidebar, and
menus. AppKit renders them at 4× into transparent 64 × 64 PNGs on a 16px canvas;
CSS masks inherit `currentColor`, including selection, disabled, and highlighted
states. The component renders a decorative `span` (previously an SVG); its
containing control supplies the accessible label. Custom React icons remain
supported in every slot.

The checked-in assets were extracted on macOS 26.6.2 (25G83). Thirty-five use
the public system-symbol API; Applications and Make Alias use the installed
`CoreGlyphsPrivate.bundle` through AppKit's bundle image loader. No native or
private API runs in the browser. Bundlers resolve the static asset URLs.
Quick Look's close and fullscreen controls are the actual 12pt artwork loaded
from `QuickLookUI.framework`, rather than similar system symbols.
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

## Checkbox, radio, slider, and stepper

Import the new controls directly from `checkbox`, `radio`, `slider`, and
`stepper`. Render them inside `MacOSEnvironment`, including the shared CSS.
They use the existing Base UI dependency for keyboard, pointer, and form
behavior, with a shared native-form-reset adapter. No dependency was added.

```tsx
<MacCheckbox label="Include metadata" name="metadata" defaultChecked />
<MacCheckbox label="All formats" checked={all} indeterminate={some && !all}
  onCheckedChange={selectAll} />
<MacRadioGroup label="Quality" name="quality" value={quality}
  onValueChange={setQuality}>
  <MacRadio label="Compact" value="compact" />
  <MacRadio label="Original" value="original" />
</MacRadioGroup>
<MacSlider label="Compression" name="compression" min={0} max={100}
  value={compression} onValueChange={setCompression} />
<MacSlider label="Scale" defaultValue={25} step={25} tickMarks={5} />
<MacStepper label="Copies" name="copies" min={0} max={9}
  value={copies} onValueChange={setCopies} />
```

Checkboxes accept controlled `checked` or uncontrolled `defaultChecked`.
`indeterminate` is a separate caller-controlled mixed state: clear it in the
change handler when the underlying selection becomes all or none. Mixed is
not a third submitted value. Radios belong in `MacRadioGroup`; its values are
strings and `label` names the group. Space toggles a checkbox; arrows select
enabled radios and skip disabled ones. Visible choice labels are React nodes.
Readonly choices stay focusable and report no value changes. `active={false}`
gives choices, sliders, and stepper arrows the inactive neutral tint independently of focus.

Sliders are horizontal, single-thumb controls. `label` supplies the accessible
name; `id` identifies the root rather than its hidden input. Arrows step,
Home/End reach the bounds, and Page Up/Down or Shift-arrows use `largeStep`
(default 10). Pointer track presses and dragging update `onValueChange`;
`onValueCommitted` reports completed gestures. `tickMarks` adds evenly spaced
decorative marks (2–101), hiding the mark aligned with the thumb; it does not
change snapping. Set `step` explicitly,
such as 25 for five values across 0–100. Supply finite min < max and a positive
step. CSS width defaults to 160px and can be overridden. Range and vertical
sliders are not part of this API.

Steppers bind a right-aligned editable field to two repeating arrow buttons.
`onValueChange` receives `number | null`; null represents an empty field. Bounds
disable the relevant arrow. Arrow Up/Down step, Home/End reach supplied bounds,
and held pointer presses repeat until release or a bound. Decimal/negative
values, `smallStep`, `largeStep`, `locale`, `format`, and `allowOutOfRange` follow
Base UI Number Field props. `id` identifies the editable input. Increment and
decrement labels default to `Increase ${label}` / `Decrease ${label}` and can
be overridden. The default is bounded stepping, without wraparound or scrubbing.

`name`, `form`, `required`, `disabled`, and `inputRef` support form integration.
Disabled controls do not submit. For steppers, `inputRef` points to the numeric
form/validation input; the visible field is identified by `id`. Values with
`defaultChecked` / `defaultValue` reset through a normal form reset without
calling change callbacks. Controlled values remain caller-owned: restore them
in the form's `onReset`. Reset also clears partial numeric drafts. Cancellation
of a reset or a Base UI change event is respected. If needed, change callbacks
receive Base UI event details and can call `details.cancel()`.

The lab's `/?view=input-controls-reference` compares actual local Tahoe active
window captures and inactive AppKit renders in both light and dark. Regular
size is calibrated; small/mini sizes and Sequoia are not. Focus/hover/pressed
appearance and repeat timing are first passes without separate native capture.
Existing compact Get Info and dialog checkbox styles are unchanged.

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

## File lists

```tsx
import { MacFileList, type MacFileListItem } from "@anyway-design/macos/file-list";

const items: MacFileListItem[] = [
  { id: "projects", name: "Projects", kind: "folder" },
  { id: "brief", name: "Project brief.pdf", kind: "pdf",
    size: 246_000, modifiedAt: Date.UTC(2026, 9, 12, 9, 41),
    tags: [{ label: "Approved", color: "#30b956" }] },
];

<MacFileList
  items={items}
  selectedIds={selection}
  onSelectionChange={setSelection}
  onOpen={openFile}
  defaultSort={{ column: "name", direction: "ascending" }}
/>
```

`MacFileListItem` extends `MacFile`, so flat items and controlled selection
can feed a grid or list. A grid renders only the supplied level, while a list
can reveal nested children. Keep IDs unique and stable. `modifiedAt` is an epoch
timestamp in milliseconds and `size` is bytes. Optional `modifiedLabel`,
`sizeLabel`, and `kindLabel` override displayed metadata. Dates and sizes sort
by raw values, with missing values last in either direction; names use natural
ordering (`Photo 2` before `Photo 10`). Equal values retain input order.

Click a header to sort, or control `sort` with `onSortChange`. `columns` selects
and orders `name`, `modified`, `size`, and `kind`. Column widths are CSS pixels;
the defaults are 300, 180, 90, and 150 respectively. `columnWidths` and
`onColumnWidthsChange` optionally control resizing. Drag a divider, use
Left/Right for 10px steps, or Home/End for its bounds. Double-click restores
the library default width. `resizable={false}` removes the dividers.
Widths are bounded; narrow containers scroll horizontally rather than
compressing the columns. The parent supplies the list's available height.

Click, Command/Ctrl-click, and Shift-click select rows. Up/Down, Home/End,
typeahead, Shift extension, Command/Ctrl+A, Space, and Escape work from a row.
Ranges follow visible rows in the current sort order. Return calls `onOpen(id)`
unless inline rename is enabled; double-click and Command/Ctrl-O open files.
Disabled rows cannot be selected or opened. Sorting retains selection by ID.
`active={false}` or an inactive parent window mutes selection.

The default row/header heights are 20/28px. CSS overrides include
`--mac-list-font-size`, `--mac-list-row-height`, `--mac-list-header-height`,
`--mac-list-stripe`, `--mac-list-selection`, and `--mac-list-indent` (15px). `minRows` adds inert empty
stripes for fixed-height previews. The lab's dark native Finder comparison
calibrates density and column alignment; light and inactive states are
adaptations. Generic type icons can differ from Finder's per-file previews
or the icons supplied by installed applications.

### Expandable folders

Folders accept recursive `children`. IDs must be unique across the entire
acyclic tree, including descendants; filenames alone are not sufficient when
different folders contain files with the same name.

```tsx
const [expanded, setExpanded] = useState(["projects"]);

<MacFileList
  items={[
    { id: "projects", name: "Projects", kind: "folder", children: [
      { id: "projects/brand", name: "Brand", kind: "folder", children: [
        { id: "projects/brand/palette", name: "Palette.txt", kind: "text" },
      ] },
    ] },
  ]}
  expandedIds={expanded}
  onExpandedChange={setExpanded}
  selectedIds={selection}
  onSelectionChange={setSelection}
/>
```

Omit `expandedIds` to use internal expansion state, optionally initialized by
`defaultExpandedIds`. A disclosure click toggles only that folder, preserving
unrelated selection. Right expands a focused folder in place (including when
already open), matching the observed Tahoe Finder behavior. Left collapses an
open folder or selects its parent. Up/Down and range selection follow visible
rows. Empty folders can expand; disabled folders cannot expose their children.

Collapsing a parent keeps descendant expansion IDs, so reopening restores its
nested layout. Selection of newly hidden, removed, or disabled rows is cleared
through `onSelectionChange`, preserving other visible selections. If a focused
child disappears, its nearest visible ancestor becomes the roving tab stop;
focus is recovered when it was lost with the removed row, without taking it
from another control. Hidden inline rename sessions end. Clicking a disclosure
while editing first follows the rename field's normal blur/validation behavior.

Sorting applies separately to siblings at every level. `MacFileList` exposes
`treegrid`, row levels, sibling positions, and expanded state. Indentation is
15px per depth, measured from the native capture; rows remain 20px tall and
selection spans all columns. Flat items remain supported as root-level rows.

For a preview sequence that matches the visible sorted list, import
`flattenFileList(items, sort)` and `visibleFileListRows(rows, expandedIds)` from
`@anyway-design/macos/file-list-tree` and map each result's `file` into Quick
Look items. The lab demonstrates this with nested previews and inline renaming.

The caller supplies children through props; no native filesystem access,
built-in asynchronous loader, or recursive Option-click/Option-arrow expansion
is included. `onOpen` still belongs to the caller and is separate from expansion.

## Quick Look

```tsx
import { MacQuickLook, type MacQuickLookItem } from "@anyway-design/macos/quick-look";

const items: MacQuickLookItem[] = [
  { id: "photo", name: "Clouds.webp", kind: "image",
    thumbnail: "/clouds-small.webp", preview: { src: "/clouds.webp" } },
  { id: "brief", name: "Project brief.pdf", kind: "pdf",
    preview: { src: "/brief-page.png", presentation: "document" } },
];

function previewFile(id: string) {
  setPreviewId(id);
  setPreviewOpen(true);
}

<MacFileGrid
  items={items}
  selectedIds={selection}
  onSelectionChange={setSelection}
  onQuickLook={previewFile}
/>
<MacQuickLook
  items={items}
  value={previewId}
  onValueChange={(id) => { setPreviewId(id); setSelection([id]); }}
  open={previewOpen}
  onOpenChange={setPreviewOpen}
  onOpenFile={openFile}
  onShare={shareFile}
/>
```

Render both inside `MacOSEnvironment`. `MacFileGrid` and `MacFileList` accept
optional `onQuickLook(id)`: unmodified Space requests a preview of the focused
file, without triggering its open action. Without the callback, their existing
Space behavior is preserved. Held-key repeats do not reopen the preview.

`MacQuickLook` is a controlled, labeled Base UI dialog with focus containment
and restoration. Left/Right move through enabled items in the supplied order,
clamping at each endpoint. Pass the list's current sorted order when integrating
with a sortable view; `sortFileList` is available from `file-list-sort` for this.
Removing the active item resolves to the first enabled item; no enabled items
means no visible dialog. Space from the preview surface, Escape, Close, and
outside clicks dismiss it. Space on toolbar buttons retains normal activation.
`returnFocus` optionally supplies a ref or callback returning the element to
focus after closing, useful when navigation has changed the selected file.

`preview.src` is a supplied image URL, separate from the small file thumbnail.
Image previews fit proportionally; `presentation: "document"` fits the page
width and scrolls vertically. Optional `preview.alt` names its content.
This does not parse PDFs or generate Quick Look thumbnails. Files without a
preview show their icon, filename, and optional `subtitle`; failed images show
an unavailable state. Disabled items are skipped. Previews reset their loading
and failure states when the item or source changes.

Open, Share, and document Markup controls appear when the matching callbacks
are supplied and report the file ID. `openLabel` customizes "Open with Preview".
The full-size control expands within the browser; it does not enter OS full
screen. The native baseline has a 38px toolbar and 5px content insets. Default
dialog size is 723 × 468px, bounded by the browser viewport; `style` supports
`--mac-quick-look-width` and `--mac-quick-look-height`. Reduced motion removes
all zoom and toolbar transitions.

`getSourceElement(id)` optionally returns the file's icon or thumbnail element.
The dialog reads its viewport rectangle on opening/closing and when navigating
to another file. It grows from that rectangle and closes back toward it, with
the toolbar appearing after the content begins moving. Missing, disconnected,
or offscreen elements use a simple fade. The lab wires this to both grid and
list artwork; the comparison's Try button uses its on-screen preview.
Opening uses 260ms and closing 180ms ease-out curves as a first spatial pass;
these timings are not measurements of a native recording. The source-rectangle
zoom and no-source fade follow Apple's documented
[Quick Look transition model](https://developer.apple.com/documentation/quicklookui/qlpreviewpaneldelegate/previewpanel(_:sourceframeonscreenfor:)).

`MacQuickLookPanel` exposes the same chrome without dialog, portal, focus,
or keyboard management, for fixed desktop compositions and comparisons. Its
parent supplies dimensions, `item`, `onClose`, optional action/navigation
callbacks, and expanded/disabled states. Use the dialog outside transformed or
zoomed preview canvases; use the panel within them. The native image comparison
calibrates Tahoe's charcoal frame, controls, and geometry. Font rendering,
source-image color handling, native vibrancy, and transition timing remain
approximations; the Sequoia variant is not separately calibrated.

## Inline file renaming

`MacFileGrid` and `MacFileList` opt into inline renaming with `onRename`:

```tsx
const [items, setItems] = useState(initialFiles);
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<MacFileGrid
  items={items}
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  onRename={(id, name) => {
    setItems((current) =>
      current.map((file) => (file.id === id ? { ...file, name } : file))
    );
  }}
/>
```

With `onRename`, unmodified Return starts editing a single selected or focused
file. Without it, Return preserves the existing `onOpen` behavior. Double-click
and Command/Control-O open the file. Multi-selection does not start a batch
rename. Disabled files cannot be edited.

The editor initially selects the basename, leaving the last extension visible
and unselected. Dotfiles, names without extensions, and folders (including dotted
folder names) are selected in full. Hidden extensions are revealed while editing.
Icon-view text wraps and grows without moving the grid; list-view text edits in
one line within the Name column.

Enter commits, Escape cancels, and blur commits a valid name. Tab follows normal
browser focus navigation. Composing text is left to the IME; text arrows, Space,
and Command/Control-A stay inside the editor. Enter and Escape return focus to
the same file, including after a name sort moves its list row.

`onRename(id, name)` reports a changed, valid draft once. The caller owns `items`
and must update the filename; no filesystem operations are performed. The
component rejects empty/whitespace-only names, `.`/`..`, colons, slashes, and
control characters, without silently trimming other names. Use
`validateRename(id, name)` to return an error string for application rules, such
as duplicate names or prohibited extension changes. Invalid drafts remain
editable and show an accessible error; Escape discards them. The callback is
synchronous; server persistence and server error feedback belong to the caller.

For a Rename button or context-menu command, control the session with
`renamingId: string | null` and `onRenamingChange(id | null)`. Set the selection
and `renamingId` to the target file; set it to `null` to cancel externally.
The lab demonstrates composition with `MacContextMenu`, including keyboard
invocation. The package does not impose a file context menu on consumers.

The native side of `?view=file-rename-reference` uses actual Tahoe AppKit control
renders, not Finder screenshots. Native inactive selection, Finder-specific
editor styling, slow-click initiation, extension-change confirmation, batch
rename, and rename undo history are not reproduced by this first pass.

## Open / Save dialogs

Import `MacFileDialog` or the embedded `MacFileDialogPanel` from
`@anyway-design/macos/file-dialog` and render inside `MacOSEnvironment`:

```tsx
<MacFileDialog
  mode="save"
  open={open}
  onOpenChange={setOpen}
  directories={directories}
  initialDirectoryId="documents"
  initialName="Untitled.txt"
  defaultView="columns"
  fileTypes={[{ id: "text", label: "Plain Text", extensions: ["txt"] }]}
  onConfirm={(result) => handleFileResult(result)}
/>
```

`directories` is a flat collection of `{ id, name, parentId?, items }`. Items
use `MacFileListItem`; each navigable folder's item ID must match a directory ID.
IDs are stable and unique. A directory's items are its direct children; do not
also populate `items[].children`. The list handles sorting, column resizing,
keyboard selection, disabled files, and native file-type artwork. Optional
`sidebarGroups` use `WindowSidebarGroup`, with location IDs pointing to directories.
`initialSelectedIds` supports a matched Open state; `multiple` enables multiple
files (Open only). Search filters names within the current folder.

`defaultView="list"` is the default; use `"columns"` for connected folders.
The View options menu switches between List and Columns and toggles the sidebar.
Switching preserves folder/history, filename, tags, query, file type, selection,
sort, and each view's column widths. Columns use the highest supplied ancestor
as their root; no host filesystem or unrelated parent folders are exposed.
Single-click a folder to reveal its children and use it as the current location.
Right enters a child and Left returns to its folder. Open's `multiple` selection
works within one sibling column, with Command/Control-click and Shift ranges;
multiple selected items omit the single-file preview. Search remains local to
the current directory; disabled/type-incompatible files cannot be selected.

Open reports `{ mode: "open", directoryId, fileIds }`, in visual sort order.
Folders navigate rather than being returned. Save reports
`{ mode: "save", directoryId, name, tags, replaceId? }`. Tags are an optional raw
text value, not native tag tokens. A filename without an extension gets the first
extension for the selected type; an incompatible explicit extension is rejected.
Empty names, path separators, colons, and control characters are rejected.
Existing filenames use case-insensitive, NFC-normalized matching. A collision
requires a separate Replace confirmation; folders and disabled files cannot be
replaced. Storage adapters must revalidate collisions when persisting.

The dialog traps focus, restores it on close (`returnFocus` can override), and
ignores outside clicks. Escape cancels; Escape from a nonempty search clears it
first. Initial Save focus selects the basename. `defaultExpanded={false}` starts
Save in its compact form; the disclosure switches to the shared file browser.
`showTags={false}` omits the Tags field. `style.width` can constrain the dialog;
the sidebar and toolbar adapt, and the file list scrolls horizontally. Initial
props seed each mounted session; remount with a new key to reset a session.

`MacFileDialogPanel` provides the same form without the outer modal. It takes
`onCancel` instead of `open/onOpenChange` and uses `active={false}` for native
inactive comparisons. Replacement still uses a modal in the environment portal.
Keep modal dialogs outside zoomed/transformed preview canvases. Reduced motion
disables the browser popup transition.

These Tahoe-calibrated components operate on supplied data and callbacks. They
do not invoke the system file picker, parse documents, or read/write local files.
The dialogs support List and Columns with plain tag text; native filesystem
access, Icon view, and Sequoia calibration are separate work. Folder creation
is available through the optional callback below.
`MacFileList` also accepts `multiple={false}` for single-selection consumers and
`columnLabels` to label supplied date values (the panel baseline uses Date Added).

## Finder column view

`MacFileColumns` from `@anyway-design/macos/file-columns` renders connected
columns from a nested array of `MacFileColumnItem` (the same file-list fields,
with optional `children` and preview content):

```tsx
const [value, setValue] = useState<string | undefined>("Photos/Clouds.webp");

<MacFileColumns
  items={files}
  value={value}
  onValueChange={setValue}
  onOpen={(id) => openFile(id)}
  onQuickLook={(id) => showPreview(id)}
/>
```

Supply stable, unique IDs and an acyclic tree. A folder has `kind: "folder"`;
its `children` may be empty. The selected ID determines the path: ancestors
stay highlighted, each selected folder reveals its children, and a selected
file reveals a preview. Missing or disabled selections clear to `undefined`;
disabled folders cannot expose descendants. Switching branches prunes the old
columns. `sort` applies independently to each sibling group.

Click selects and reveals folders. Right enters the first enabled, sorted
child; Left returns to the parent. Up/Down, Home/End, and typeahead use the shared
file-list navigation. Single selection is the default. To control multiple
siblings, pass `multiple` and `selectedIds`; `onValueChange(id, selectedIds)`
reports the path cursor and selection together. Multi-selection hides the
individual preview and does not reveal a child column for selected folders.
Keep the cursor within the selected sibling group. Optional `onRename`,
`renamingId`, `onRenamingChange`, and `validateRename` reuse inline renaming:
Return renames when enabled, otherwise it reports `onOpen`. Double-click and
Command/Control-O report `onOpen`; Space reports `onQuickLook` when supplied.
The caller owns filename changes, previews, opening, and persistence.

Columns default to 245px with 22px rows. `columnWidth` changes the default;
`columnWidths` and `onColumnWidthsChange` control widths by depth and retain
widths when a branch is hidden. Dividers support pointer capture with zoom
correction, Left/Right in 10px steps, Home/End (160–600px), double-click to reset
to 245px, and Escape/pointer cancellation to restore the original width.
`resizable={false}` omits handles. Each list scrolls vertically; the browser
scrolls horizontally, keeping the current column's start visible as its
container changes size. Set a height on the containing layout.

`showPreview={false}` omits the final preview; `previewWidth` defaults to 240px.
Each item can provide `preview: { src, alt?, details? }` for an image, or
`preview: { text, details? }` for plain text. Details are `{ label, value }` pairs
with unique labels. The built-in preview shows artwork, filename, kind/size,
and supplied metadata. Text is escaped and scrolls in a fixed artwork area;
images fit proportionally, with a native-icon fallback after load failure.
It does not decode PDFs or other documents. `renderPreview(file)` can render a
custom preview instead. `MacFileColumnPreview` is also directly importable from
`@anyway-design/macos/file-column-preview`.

`active`, `showExtensions`, `label`, `className`, and `style` configure presentation.
Tahoe dark geometry is compared against real Finder captures in the lab;
font rasterization, small-size icon artwork, and capture color profiles can differ.
Native Quick Actions, tag-token editing, and Sequoia-specific calibration are
not included. Open/Save reuse this browser through their View options menu.

## New Folder creation

Finder views (`MacFileGrid`, `MacFileList`, `MacFileColumns`) accept optional
`onNewFolder`. Command/Control-Shift-N invokes it once per press, including from
an empty browser. Nothing is intercepted when the callback is absent. The grid
and list report the action in the caller's current directory. Columns pass the
selected folder ID, or a file's containing folder ID; `undefined` means the
supplied root. Multiple selections use the containing folder.

The caller inserts the new folder immediately, selects its stable ID, and sets
controlled `renamingId` to that ID. Reuse `onRename`, `onRenamingChange`, and
`validateRename` for the existing inline editor. Return commits; Escape keeps
the already-created folder with its generated name. This matches Finder's
creation model. In Icon and List views creation is a sibling action; Columns
follow the current folder path. The lab's `use-finder-folder-creation.ts` is a
small sample data adapter, not a filesystem implementation.

`fileNewFolderName(items)` and `fileNewFolderError(name, items, excludeId?)` from
`@anyway-design/macos/file-new-folder` supply Tahoe's `untitled folder`,
`untitled folder 2`, … naming, separator/control-character validation, and
case-insensitive NFC-normalized collision checks against files and folders.
The optional excluded ID supports inline renaming. Names are not trimmed or
rewritten; valid dotfiles and dots inside folder names are preserved.

`MacFileDialog` and `MacFileDialogPanel` accept:

```tsx
onCreateFolder={async (directoryId, name) => {
  const folder = await storage.createFolder(directoryId, name);
  // Update the controlled directories: add the parent's folder item and
  // a new directory record with matching IDs before resolving.
  updateDirectories(folder);
  return folder.id;
}}
```

The callback enables New Folder in expanded Open/Save and Command/Control-
Shift-N (which also expands compact Save). It can be synchronous or async and
must return a new unique directory ID. The dialog waits for that directory to
appear in supplied data before navigating into it. Save's name, tags, file type,
and view survive creation; browsing selection and the local query reset for
the new folder. Cancelling the naming sheet changes nothing and restores focus
to New Folder. The outer Open/Save stays open. A pending request disables repeat
submission and dismissal; a rejected callback keeps the input and displays its
error, refocusing the field for retry. Adapters must recheck names and write
permissions at persistence time. Without the callback, creation UI is omitted.

`MacNewFolderDialog` and embedded `MacNewFolderPanel` from
`@anyway-design/macos/new-folder` are also reusable independently. Supply
`items`, `parentName`, and `onCreate(name)`. The dialog uses `open` and
`onOpenChange`; the embedded panel uses `onCancel`. `initialName` seeds each
mount, and `active={false}` reproduces inactive input selection in a reference.
The modal traps focus and supports `returnFocus`. These components do not
read or write the host filesystem.

## Finder Gallery view

`MacFileGallery` from `@anyway-design/macos/file-gallery` displays a flat list
of `MacFileGalleryItem` in the supplied order, with a fitted preview, horizontal
filmstrip, and optional information pane:

```tsx
<MacFileGallery
  items={files}
  selectedIds={selection}
  onSelectionChange={setSelection}
  onOpen={openFile}
  onQuickLook={previewFile}
/>
```

Supply stable, unique IDs. Items share file-list fields and the column preview's `preview.src`, `alt`,
`text`, and `details`. `preview.moreDetails` enables Show More; the optional
`defaultExpandedInfo` seeds its state for each selection. Metadata values are
caller supplied. Additional detail labels must be unique. `thumbnail` supplies
the filmstrip and header artwork; a preview image takes precedence in the main
area, then supplied text, then a thumbnail, then the native icon. A failed
preview falls back to the icon and announces that it is unavailable. Source
changes reset failure state. `presentation: "document"` gives a supplied page
image square corners and a paper shadow. This does not decode PDFs or generate
thumbnails. `renderPreview(file)` can replace the main artwork.

Click selects, Command/Control-click toggles, and Shift extends a range. The
existing file grid supplies Left/Right, Home/End, typeahead, Select All, and
Escape clearing. Disabled files are excluded. Double-click, Return, and
Command/Control-O report `onOpen`; unmodified Space reports `onQuickLook` when
supplied. No inline rename session is started in this first Gallery pass.
Only one filmstrip item is a tab stop. Overflow scrolls horizontally, and the
focused/selected cell is revealed after selection or container resizing.
Removed and disabled selections are cleared through `onSelectionChange`.
Multi-selection displays up to three stacked previews, shared metadata, and common tags;
its stacking geometry is an approximation rather than a calibrated preset.

`showInfo={false}` omits the pane; containers at or below 500px also hide it
and reduce preview padding. Tags are read-only. `onEditTags(ids)` enables an
Add Tags command for an untagged selection; the caller owns its editor and
updated tags. Optional `actions` contain `{ id, label, icon, disabled? }`;
`onAction(actionId, ids)` handles their commands in visual selection order.
Actions appear only with a nonempty enabled selection and a callback. They
never invoke macOS services. Custom icons are supported; Gallery's default
folder artwork is a separate high-resolution native export.

Render in a sized `MacOSEnvironment`. `active`, `label`, `className`, and
`style` configure presentation. CSS variables `--mac-gallery-info-width`
(default 240px) and `--mac-gallery-preview-padding` (32px) adjust geometry.
The lab compares genuine Tahoe light captures at 1050 × 658 points; dark,
multiple-selection stacks, responsive behavior, and Sequoia have no separate
native calibration. Native vibrancy, font rasterization, and image color
management can still affect the comparison.

## Finder Get Info

`MacGetInfo` and embedded `MacGetInfoPanel` from `@anyway-design/macos/file-info`
share the native 349-point inspector. Supply a `MacFileInfoItem` (the existing
file-list item plus optional inspector metadata):

```tsx
<MacGetInfo
  file={inspectedFile}
  open={infoOpen}
  onOpenChange={setInfoOpen}
  onRename={renameFile}
  validateRename={checkName}
  onInfoChange={updateFileInfo}
  returnFocus={getSelectedFileElement}
/>
```

The floating dialog is modeless: outside clicks and Escape keep it open.
Close and Command/Control-W dismiss and restore focus. Its body scrolls within
the viewport. There is no drag/resize or multiple-file aggregate inspector in
this first pass. `MacGetInfoPanel` requires `onClose` and can be embedded
directly. `active`, `onMinimize`, `onZoom`, `className`, and `style` are supported.

`general` and `moreInfo` are arrays of `{ label, value }` with unique labels.
Without `general`, Kind and any supplied size/date are displayed; no location,
byte count, or date is invented. An empty array deliberately omits those rows.
The summary uses `name`, `sizeLabel`, `modifiedLabel`, and optional `icon`.
`preview.src` supplies an aspect-fitted image; missing/failed previews fall back
to native file/folder artwork. The component does not decode documents.

General, More Info, and Name & Extension start expanded. Use controlled
`expandedSections` / `onExpandedSectionsChange`, or seed
`defaultExpandedSections` with `general`, `more`, `name`, `comments`,
`open-with`, `preview`, `permissions`. Sections are keyboard-operable and retain
their content when collapsed. Optional sections appear only with supplied data.

The permanent name field includes the extension. Return or blur validates and
calls the synchronous `onRename(id, name)` once; update the controlled file name
to acknowledge it. Empty names, separators, and control characters are rejected;
`validateRename` adds caller checks such as sibling collisions. Synchronous
callback errors display inline and preserve the draft. Escape discards the
draft and keeps the inspector open. Closing by pointer also discards unfinished
name edits. Without `onRename` the field is read-only; `locked` disables it.
Async persistence and extension-change confirmation belong to the caller.

`onInfoChange(id, patch)` reports `extensionHidden`, `locked`, `shared`,
`stationeryPad`, `comments`, or `applicationId`. These remain caller-controlled;
without a handler the flags/select are disabled and Comments is read-only.
`fileInfoDisplayName(file)` from `file-info-model` hides the final extension for
display without changing the canonical name. Folders, dotfiles, extensionless
names, and trailing dots have no hideable extension.

`applications: [{ id, label }]`, `applicationId`, and `defaultApplicationId`
configure Open with. `onChangeAll(id)` handles its optional association command.
`onEditTags(id)` delegates tag editing. `permissions: { summary, entries }`
supplies a read-only Name/Privilege table; each entry has `id`, `name`, and
`privilege`. These callbacks do not invoke macOS services or modify host files.

Icon, List, Columns, and Gallery accept optional `onGetInfo(id)` for
Command/Control-I on a focused enabled file. Repeats are consumed without
reopening. The caller chooses which file to inspect and owns `open`; the
inspector does not follow unrelated selection changes automatically.

The lab's light image/folder/preview presets use genuine local Tahoe captures.
Dark appearance and the expanded Comments, Open with, and permissions contents
are not separately calibrated. Font rasterization and small icon artwork may
still differ from native rendering.

## Pop-up buttons and editable combo boxes

```tsx
import { MacPopUpButton } from "@anyway-design/macos/pop-up-button";
import { MacComboBox } from "@anyway-design/macos/combo-box";

<MacPopUpButton label="Quality" name="quality" defaultValue="automatic"
  items={[
    { value: "automatic", label: "Automatic" },
    { value: "high", label: "High Quality" },
    { value: "unavailable", label: "Unavailable", disabled: true },
  ]} />
<MacComboBox label="Destination" name="destination" defaultValue="Documents"
  items={["Documents", "Downloads", "Desktop"]} />
```

Render inside `MacOSEnvironment`. `MacPopUpButton` uses unique string-valued
`items: { value, label, disabled?, separatorBefore? }[]`. `value` / `defaultValue`
are strings or null; null displays `placeholder` (default Choose…). A change
reports `(value, details)` through `onValueChange`. It uses the installed
[Base UI Select](https://base-ui.com/react/components/select) for selection,
keyboard typeahead, disabled skipping, focus, and form validation.

`MacComboBox` accepts unique string suggestions and a string `value` /
`defaultValue`. Choosing a suggestion or typing calls `onValueChange`; arbitrary
text remains valid and submits unchanged. `mode="none"` (default) keeps all
suggestions, matching the fixture's NSComboBox with completion disabled.
`mode="list"` filters; Base UI's `both` and `inline` modes are also forwarded.
`emptyLabel` configures the empty message and `triggerLabel` labels the arrow.
It uses [Base UI Autocomplete](https://base-ui.com/react/components/autocomplete)
to preserve free-form text rather than restricting input to known values.
Escape dismisses suggestions without clearing the input. Input `Home` / `End`
move the caret; arrows navigate suggestions and Enter chooses.

Both support `size="regular" | "small"`, `label`, `className`, `style`,
`disabled`, `readOnly`, `required`, `name`, `form`, `id`, `inputRef`, and
`open` / `defaultOpen` / `onOpenChange`. `label` is the accessible name;
render visible labels in the caller if needed. `inputRef` points to the
pop-up's hidden form input or the combo's editable input. Native form reset
restores uncontrolled defaults; reset controlled values in the form's
`onReset`. Disabled values do not submit. Change/reset cancellation is respected.
Width defaults to 176px and is configurable through `style`.

Pop-up and combo lists overlap their controls using geometry from the native
fixture; generic anchor positioning keeps them usable in scaled previews.
Available viewport space limits list size, with collision avoidance and scrolling
for long lists. `active={false}` provides a neutral inactive foreground.
Native focus details, exact keyboard conventions, hover, and transition timing
are not separately calibrated. The light/dark comparison and source provenance
live in the lab at `/?view=selection-controls-reference`. Reference screenshots
are never used as artwork by the reusable components.

### Alerts and confirmations

```tsx
import { MacAlert } from "@anyway-design/macos/alert";

<MacAlert
  open={confirming}
  onOpenChange={setConfirming}
  title="Replace “Report.pdf”?"
  description="A file with this name already exists."
  severity="warning"
  actions={[
    { id: "cancel", label: "Cancel" },
    { id: "replace", label: "Replace", destructive: true },
  ]}
  defaultAction="cancel"
  cancelAction="cancel"
  onAction={handleDecision}
/>
```

Render inside `MacOSEnvironment`. Each action has a unique `id`, `label`,
optional `disabled`, and optional `destructive`. Supply at least one enabled
way to finish. `defaultAction` explicitly assigns Return; `cancelAction`
assigns Escape. Missing or disabled shortcuts do nothing, with no fallback
that could choose a destructive action. Return chooses the default even while
Cancel has focus; Space activates the focused button. Cancel receives initial
focus when enabled, otherwise the default or first enabled action does.
Additional application shortcuts, such as Command-D, remain caller-owned.

`MacAlert` uses the installed Base UI AlertDialog for modal semantics, focus
trapping, scroll locking, and outside-click protection. Successful action
callbacks request `onOpenChange(false)`; the caller owns the decision's actual
work and any asynchronous progress/error UI. `returnFocus` can be an element
ref or a function; otherwise focus returns to the previously focused element.
Actions never perform operating-system operations themselves.

`presentation="sheet"` omits the app icon and positions the panel near the
parent's top. Use a sized, transformed environment (for example
`style={{ height: 420, transform: "translateZ(0)" }}`) to contain a preview's
fixed backdrop and popup. Both presentations use browser modal semantics;
sheets do not implement separate ownership among multiple desktop windows.
`MacAlertPanel` renders just the accessible panel for embedded compositions,
without trapping focus, moving focus, or closing itself.

`severity="informational" | "warning" | "critical"` selects native artwork.
Informational and warning currently share the default app icon. `icon` replaces
its full 64-point artwork, including the critical badge if needed. Optional
`suppression={{ label, checked, defaultChecked, onCheckedChange, disabled }}`
adds a `MacCheckbox`; callers persist the value and decide whether to show the
alert again. Two actions are horizontal with Cancel on the left; three or more
stack with the default first and Cancel last. `className` and `style` customize
the panel. Environment reduced-motion settings disable transitions.

The lab at `/?view=alert-reference` compares five examples in light/dark with
ten native captures and a modal workbench. Its surfaces match the captured
Tahoe material. Exact animation timing, arbitrary desktop-dependent native
material, and Sequoia are not calibrated in this pass.

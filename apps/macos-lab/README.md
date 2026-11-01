# macOS Platform Lab

Run `bun run dev:macos` from the repository root, then open
[localhost:3006](http://127.0.0.1:3006).

The full lab is also included in [Anyway / platform](../platform/README.md) at
port 3008. Component/reference links preserve the current document path so both
standalone and nested hosting work. The `macos-lab/catalog` workspace export
shares the component list with Platform.

The lab consumes `@anyway-design/macos`, a standalone React workspace package.
It includes separate Sequoia and Tahoe presets for the desktop composition,
menu bar, Dock, window chrome, tabs, buttons, and switches.

The default page is the **component playground**, with 43 searchable entries
covering windows and navigation, menus and overlays, form controls, feedback,
Finder workflows, and native artwork. Each entry has a working preview,
editable props, a copyable React usage example, and a native-comparison link.
Use `/?component=date-picker`, for example, to link directly to a component.
The older desktop lab remains at `/?view=desktop-lab`; all native-reference
routes remain available.

Desktop, Window, and Finder consume the public `MacFinder` component: back/forward controls, view
and grouping menus, Share/Tags/More, search, document tabs, and the floating
sidebar. The shared toolbar layout is also used by the Apple comparison.
Toolbar shows a window-header crop; Sidebar centers the sidebar itself in a
window-corner crop. Offscreen controls in these crops are inert, so keyboard
focus stays on the component being demonstrated. The complete Window example
supports view switching, tab creation/closing/reordering, selection, and inline
renaming. Search expands in the toolbar, filters the current folder and its
descendants by name or tag, and clears with Cancel or Escape. Each tab retains
its own navigation history, query, view, sort, group, and selection. Back/Forward
handles folder, sidebar, and path-bar navigation, including column selections.
Navigating after Back discards the forward branch. The path bar follows the
selected file and its actual parent folders; every folder segment is clickable.

The grouping menu offers Kind, Date Modified, Size, Tags, and None. Its Sort By
submenu sets Name, Kind, Date Modified, Size, and ascending/descending order.
The same state drives Icons, List, Columns, and Gallery. List column headers
update the toolbar sort state. These controls use sample files in memory;
Share and Tags remain preview callbacks. Sample interactions never change user
files on disk; explicit external drops read metadata and local image previews.
Keyboard commands: ⌘/Ctrl-F for search, ⌘/Ctrl-[ and ] or Option-Left/Right
for history, ⌘/Ctrl-1 through 4 for views, and ⇧⌘/Ctrl-N for New Folder.
`bun run --cwd packages/macos test` checks the shared browser state model.

`/?component=finder` exposes the reusable API: restrict available views, choose
an initial view, hide the sidebar/toolbar/tabs, and omit mutation callbacks with
Read only. The lab owns its fixture array and updates it in `onRename` and
`onCreateFolder`; Desktop menus and Dock navigation use `MacFinderHandle`.
The library has no dependency on playground data, styles, or reference assets.

Finder also connects Quick Look (Space), Get Info (⌘/Ctrl-I), and right-click
menus across Icons, List, Columns, and Gallery. Shift-F10 opens a file's context
menu from the keyboard. The toolbar's More menu uses the same actions. The
Custom file actions switch adds a caller-owned “Mark as Reviewed” operation;
Read only disables data mutations. Get Info edits update the same fixture array,
and Quick Look uses supplied image or text previews without accessing user files.

Finder drag and drop uses `onMove` to update `parentId` in the same fixture array.
Selected groups have a translucent preview stack and count. File folders,
physical sidebar locations, the path bar, and empty folder/column backgrounds
accept valid moves. Hold over a folder for 800ms to open it; ancestor columns
remain available. Escape, focus loss, or an invalid release cancels and restores
temporary hover navigation. Read only omits both move and import callbacks.
External file drops add metadata and local image object URLs in memory, without
uploading; folders are rejected. The package validates internal cycles, locked
items, stale IDs, and duplicate names before calling `onMove`.

Open `/?view=finder-drag-reference` for the paired folder-feedback comparison.
Both panels share logical scale and zoom. The right side is a crop captured
from genuine native Tahoe Finder while the user held a drag in the isolated
`Anyway-Drag-Reference` fixture. The window capture omits macOS's separate
floating drag image; the native stack and spring-loading timing are therefore
not calibrated. Other views, sidebar targets, and light appearance remain live
examples without matched native captures. See
`public/assets/native-finder-drag/SOURCES.md` for provenance and limitations.

The shared inspector changes preset, appearance, accent color, and accessibility
preferences across previews. Canvas width, background, and Fit / Actual size
help inspect smaller containers. Initial-value changes restart the example; other props update live.
Reset restores its props and in-memory interactions. File previews support
selection, renaming, folder creation, Quick Look, and Get Info using sample data.
The thumbnail example also accepts a local image without uploading it.
Usage examples include imports and the stylesheet; replace sample data and
`/assets/…` paths with your own assets. They are integration starters rather than
the complete demo composition. Run `bun run --cwd apps/macos-lab check-playground`
to type-check generated examples for every entry and inspector option. Tahoe
remains the calibrated reference; other preset states need separate calibration.

## Desktop lab and native studies

Use the property inspector to change appearance, wallpaper, accent, window
activation, Dock size/magnification/position, reduced motion, and reduced
transparency. Compare displays both presets with the same settings. Code
provides editable usage examples. The native-reference overlay accepts a
local screenshot; the image remains in the browser and is never uploaded.

Choose **Dock → Try live glass**, or open the
[live backdrop playground](http://127.0.0.1:3006/?view=dock-glass), to change
wallpapers, move a real DOM window, and scroll its content through the Dock.
The default Tahoe Dock uses SVG backdrop displacement in Chromium, with
ordinary live blur in other browsers. No background image input is needed.
The demo uses transparent Taada icons rather than the frozen reference clips.
**Blur only** compares the fallback, and **Reduce transparency** checks the
opaque accessibility mode.
The **Magnification** slider covers 1×–2.5×. Move along the Dock or hover its
ends to inspect the growth wave and neighboring shifts; **Native motion
reference** opens the filmed Tahoe demonstration used for the first pass.
**Icons**, **Container width**, and **Position** exercise adaptive sizing with
6, 12, or 24 icons in desktops down to 280px wide. Space for magnification is
reserved before hover. **Auto-hide** adds edge reveal with a short delay;
Tab to **Show Dock** to reveal it from the keyboard. Focus keeps it open.
The main inspector and generated code also expose auto-hide. The Apple
comparison opts out of adaptive fitting to preserve its reference scale.

For a close-up comparison, choose **Dock → Compare with Apple**, or open
[the Dock study](http://127.0.0.1:3006/?view=dock-reference). It shows the shared
React Dock beside a cropped Apple reference with shared 1×–3× zoom,
horizontal scrolling, and buttons to inspect either end. This view fixes the
live Dock at Tahoe light, 52px, bottom placement, with magnification paused.
The locally stored 3840 × 2560 original is normalized using an estimated
110px source icon canvas. The comparison uses the matching clean Tahoe
wallpaper and all 24 icons in the same order. The **Original** link opens
Apple's source.

The icon samples are SVG-clipped silhouettes from the reference; translucency
inside them is frozen. They are calibration artwork, not reusable transparent
system assets. The Dock surface, separator, and running indicators are live.
**Glass → Live backdrop** uses the live page behind the Dock.
**Wallpaper texture** retains the WebGL renderer with a supplied wallpaper
image, and **CSS blur** selects the basic material. The WebGL renderer falls
back to CSS if the GPU or texture is unavailable.
The clean wallpaper is aligned independently to Apple's photograph
(source scale 3426 / 6016, offset approximately 207, −402). Apple's window
shadow, photographic processing, and native lensing remain possible sources
of difference. This view is not proof of a pixel-identical native compositor.

## Fidelity status

Open [the Quick Look study](http://127.0.0.1:3006/?view=quick-look-reference)
from **Compare Quick Look** in the Window or file-list study. The reference
is a real Tahoe Quick Look window displaying the lab's cloud photograph,
captured at 2× on this Mac. Both panels use 723 × 468 logical pixels. The live
side uses shared `MacQuickLookPanel`; only the right side contains captured
chrome. Shared zoom, synchronized scrolling, and Full preview / Title &
controls / Actions crops inspect matching regions.

The workbench opens the shared `MacQuickLook` dialog from grid or list with
Space, or **Quick Look selected**. Left/Right navigate enabled files in display
order, including after list sorting; Space or Escape dismisses and returns
focus to the selected file. Tab stays inside the dialog. Open, Share, and
document Markup display callback IDs, and full size expands in the browser.
Narrow/dark file areas, reduced motion, disabled files, an archive fallback,
and an intentionally invalid preview exercise additional states. The file-list
study also opens Quick Look with Space; its two cloud files have supplied
previews and other types use the generic fallback.

Close/fullscreen use the framework's actual 12pt artwork and 20px control slots.
Opening grows from the selected file's artwork; closing returns toward the
current file. The toolbar fades in after the image begins moving, and missing
or offscreen sources fade in place. Try interactive Quick Look uses the visible
comparison as its origin. Reduced motion removes both transitions. The
260ms opening and 180ms closing curves are estimates, pending a native recording.

Image content fits proportionally; the supplied document page scrolls at full
width. The document example is an SVG page image, not PDF parsing or a native
PDF capture. Native annotation, sharing sheets, app launching, detachment,
and transition timing are not implemented. Native and browser color handling
and font rasterization can differ. The solid charcoal surface matches this
capture; vibrancy over other backgrounds is not calibrated. See
`public/assets/native-quick-look/SOURCES.md` for capture provenance.

Open [the file-list study](http://127.0.0.1:3006/?view=file-list-reference) from
**Compare file lists** in the window preview. It compares shared `MacFileList`
rows with an actual Finder window captured on this Mac's Tahoe 26.6.2 system.
The reference contains nine generated demo files/folders, with no personal
documents or sidebar locations. The 2× capture calibrates dark active selection,
20px rows, a 28px header, column widths, and text alignment.

Shared zoom, All columns/Details/Name crops, and synchronized scrolling align
both panels. Click headers to sort; drag dividers to resize, use Left/Right or
Home/End from a focused divider, or double-click to restore its library default.
**Reset native match** restores the captured column widths, Name ascending,
and the selected agreement. Raw bytes and timestamps drive sorting while
display labels match Finder. Selection supports Command/Ctrl and Shift,
Up/Down, Home/End, typeahead, select all, Escape, and open callbacks.

**Extra states (live only)** adds tags, a long filename, and a disabled row.
Light and inactive controls change the live side only; the native image stays
fixed. Generic native type icons differ from Finder's Quick Look thumbnails
and installed-app artwork. Folder disclosure is decorative; hierarchy,
renaming, and file dragging remain future work. The main lab's list toggle
uses the same component and shares selection with icon view. Capture details
and fixture metadata are in `public/assets/native-file-list/SOURCES.md`.

Open [the controls study](http://127.0.0.1:3006/?view=controls-reference) from
**Controls → Compare with native AppKit**. It compares `MacButton`,
`MacTextField`, and `MacSearchField` against 2× AppKit renders from the user's
Tahoe 26.6.2 system. Shared zoom, synchronized scrolling, Buttons/Fields crops,
and light/dark modes use the same geometry on both sides.

The native baseline is an inactive offscreen window. It calibrates 32px regular
capsule buttons, 24px small buttons and fields, filled search fields, highlights,
and disabled states. **Active accent (live only)** previews blue primary actions;
active accent, hover, and focus rings remain browser approximations. The lower
workbench exercises typing, native labels, Enter search submission, Escape and
clear-button behavior, focus restoration, Save/Reset callbacks, and disabled
controls. It uses local state and does not save preferences or send searches.
The reference exporter and provenance are in
`packages/macos/scripts/export-controls.swift` and
`public/assets/native-controls/SOURCES.md`.

Open [the menu study](http://127.0.0.1:3006/?view=menu-reference) from **Compare
menus** in the Window or Menu bar preview. Its source is the Finder context menu
in Apple's Tahoe 26 Windows-switching guide. The toolbar More button, right-click
example, and menu bar use the same shared `MacMenuPopup`. The window comparison
and main window preview now have a working More menu.

The study matches the visible item list, tag palette, 192px menu width, 21px rows,
and separator spacing. Shared zoom and synchronized scrolling align both panels.
Try Open With and Quick Actions, select a tag color, and enable **Extra states**
for a controlled checkbox, disabled item, and shortcut hints. These extra states
and submenu contents are interaction fixtures, not claims about the reference.
Actions report callback IDs; they do not modify files or the system clipboard.

Browser checks cover arrow-key opening, submenu entry/return, Escape and focus
restoration, checkbox persistence, disabled activation, tag selection,
right-click, Shift+F10, and dark/reduced-transparency material. Native animation
timing, optical lensing, and touch long-press behavior still need calibration.

Choose **Window → Compare with Apple**, or open
[the window study](http://127.0.0.1:3006/?view=window-reference), for the Tahoe
Finder comparison. The source is [Apple's Tahoe 26 Finder guide](https://support.apple.com/en-euro/guide/mac-help/mchlp2605/26/mac/26).
The original transparent 1144 × 694 PNG is displayed at 572 × 347 before
shared zoom. This 2:1 normalization is a comparison convention, not a
verified native display scale. **Fit both**, **1×–2×**, **Toolbar**, and
**Sidebar**, and **Files** provide matching views; scrolling either panel follows in the other.

The shared React window, floating sidebar, traffic lights, and toolbar groups
are live. Sidebar selection, toolbar activation callbacks, active/inactive
state, sidebar visibility, and reduced transparency can be exercised.
**Reset comparison** restores the matching state. Document tabs are live
`MacTabs`: select, add, close, and drag to reorder them. Arrow keys switch tabs,
Delete closes the focused tab, and Alt+Shift+Left/Right reorders it.
**More tabs** adds a long list with a disabled tab; **Narrow tab area (260px)**
exercises horizontal scrolling and the All tabs menu. These stress controls
affect the live side only. The Documents pane now uses shared `MacFileGrid` and
`MacFileItem` components. Thumbnail artwork is sampled individually from Apple's
image; filenames, wrapping, colored tags, row spacing, and selection are live.
The reference uses 48px artwork canvases, 87.5px column/row pitches, and 9.5px
labels at the study's normalization. Its fixed five columns preserve alignment;
the reusable grid fills and wraps within its container. Other tabs use sample content.

Use **Files** and shared zoom to compare the selected document's two-line label
and the surrounding thumbnails. Click, Command/Ctrl-click, and Shift-click select;
arrow keys follow the grid, Shift extends, Command/Ctrl+A selects all, and Escape
clears. Typeahead finds filenames; Enter or double-click reports an open callback.
**Reset comparison** restores the original selection.
The selected filename's two lines now form one continuous rounded outline,
including the inward corners at the join. It follows rendered line widths at
each size and zoom; keyboard focus stays around the caption.

The workbench below the comparison uses six generic file/folder icons exported
from this Mac via `NSWorkspace.icon(for: UTType)`. Try icon size, container width,
extension visibility, dark appearance, and inactive selection. One disabled item,
multiple tags, and a long filename exercise edge cases. These native icons also
replace the main lab's hand-drawn folders. Provenance and regeneration live in
`packages/macos/src/assets/native-file-icons/SOURCES.md`; no user files are read.
The browser receives supplied thumbnails and does not generate Quick Look previews.
Renaming, drag selection, and file dragging remain future work. Native light
selection is visually calibrated here; dark/inactive file states are adaptations.

**One image, three presentations** below the icon workbench lets you choose a
local image and compare the original aspect ratio with contained and cropped
document previews. `kind: "pdf"` plus `thumbnail` adds the paper mask, folded
corner, edge, and shadow automatically. `thumbnailStyle` overrides the shape;
`thumbnailFit: "cover"` fills the page from the top, while the default `"contain"`
preserves the whole image. The image stays in browser memory as an object URL;
resetting, replacing it, or leaving the view releases it. These are styled image
previews, not PDF parsing or page-content generation.

The study calibrates a 121px sidebar column, 41px title bar, 7px sidebar inset,
22px outer radius, 22px tab track with a 6px content inset below it, 25px sidebar rows, and 11px traffic lights at its normalized
scale. Its grayscale and control colors are sampled from the reference.
Tab movement follows the native recording supplied on 20 October 2026: the
selected pill follows the pointer continuously, neighbors slide into preview
positions, and release settles into a slot. Neighbor movement uses 160ms and
settling uses 180ms ease-out as a first calibration; exact timings remain
provisional. Escape restores the original order. The recording also shows
native window detachment, which the tab component does not implement.
The main lab uses the shared components at their general-purpose dimensions.
The toolbar, sidebar, and menus use shared `WindowSymbol` masks exported through
AppKit on the user's macOS 26.6.2 system. These replace the hand-drawn SVGs with
native glyphs, including the Applications and Make Alias symbols from Tahoe's
additional catalog. The 4× PNG masks retain selection and highlight colors.
Symbol weights and sizes are calibrated in the Toolbar, Sidebar, and Menu
close-ups. The current system's zipper glyph differs from the published menu
reference; optical size, font rasterization, backdrop blur, and rim light are
still subject to calibration. Dark and inactive states are adaptations without
a matching reference image. Extraction details and provenance are documented
in `packages/macos/src/assets/native-symbols/SOURCES.md`.

These are interactive reproductions, **not yet verified 1:1 replicas**.
Preset geometry and materials need native reference calibration. Tahoe's
optical refraction and AppKit vibrancy remain approximations. The live
renderer bends the page backdrop through an SVG filter; WebGL is retained
for controlled texture comparisons. The fallback uses live blur, tint,
highlights, and saturation. Native OS windows outside the page are not
captured. The Dock's magnification uses a broader cosine wave estimated from
the [Fix369 Tahoe recording at 0:38–0:43](https://www.youtube.com/watch?v=G3MZaTjIVYc&t=37s).
The first neighbors grow substantially, the next pair less, and the third
pair tapers toward rest. Its four-icon-canvas influence radius is an estimate.
Pointer coordinates are mapped through the expanded layout instead of
evaluating distance to unshifted icon centers. The accumulated shifts preserve
canvas gaps, centered surface expansion, edge alignment, and separator spacing.
The configurable peak is not inferred as a system default from the video.
The existing 100ms ease-out transition is still provisional; camera perspective,
editing, and unknown capture cadence prevent exact timing calibration.

The Tahoe Dock's resting geometry is refined using Apple's
[WWDC25 Apple Music desktop reference](https://www.apple.com/newsroom/images/2025/06/macos-tahoe-26-makes-the-mac-more-capable-productive-and-intelligent-than-ever/article/Apple-WWDC25-macOS-Tahoe-26-Apple-Music-250609_big.jpg.large_2x.jpg).
That marketing image is a prerelease reference, not a native pixel baseline.
At the default 52px icon canvas, Tahoe uses about 3.7px between icon canvases,
10.1px top / 11.1px bottom padding, 9.8px end padding, and a 25.5px extra
group gap. The corner radius is 25.5px, reduced from 31.2px after inspecting
the higher-resolution source. The CSS glass uses a neutral translucent tint,
16px backdrop blur, restrained saturation, and a thin highlighted rim.
The reference view can switch between live backdrop, WebGL, and basic blur,
and restores subtle contact shadows outside the clipped icons.
The transparent margins in the supplied icon images contribute to the visible
spacing; `size` describes the full image canvas, not the colored icon face.
The corner radius and spacing scale with `size`. The softer rim, background
blur, and translucent tint approximate the reference glass. Vertical placement
and dark appearance are adaptations of the horizontal light reference.
Magnification now has the first spatial pass above; exact settling still
awaits a direct native recording.

The initial fixture is a Finder-like composition, not a complete Finder clone.
The standard playground presets share the example icons from Taada; the
separate reference study uses Apple's sampled icon artwork. Browser font
rasterization, display scale, and OS version affect pixel comparisons.

For calibration, capture a known 1000 × 640 logical-pixel desktop region
(or a matching 2× image) with the same wallpaper, icons, appearance, and state.
Load it in Native reference and adjust overlay opacity. Check rest, hover,
focus, selected, disabled, and inactive states. Test motion separately.
The user's current machine runs Tahoe; no Sequoia runtime was available
for native validation during initial implementation.

## Validation

```sh
bun run --cwd apps/macos-lab check-types
bun run --cwd packages/macos check-types
bun test packages/macos/tests
bun run --cwd apps/macos-lab build
bun x ultracite check apps/macos-lab packages/macos
```

Assets under `public/assets` come from the user's local Taada project and the
documented reference sources. See `public/assets/SOURCES.md`.

### Inline rename study

Open `/?view=file-rename-reference` for grid/list editor comparisons, shared zoom,
and an interactive workbench. Return starts renaming; Enter commits, Escape
cancels, and valid drafts commit on blur. Right-click or Shift-F10 offers Rename.
The workbench covers duplicate validation, disabled files, dotfiles, wrapping
names, hidden extensions, light/dark appearance, and narrow containers. Names
exist only in React state; no native filesystem entries are renamed.

The reference assets are native AppKit `NSTextField` renders from this Tahoe
system, **not Finder captures**. The Finder window capture API omitted its
floating rename editor. The reference's selection is inactive; exact Finder
field padding, border, and active selection still require a direct capture.
See `public/assets/native-file-rename/SOURCES.md` and the reproducible native
renderer at `scripts/render-rename-reference.swift`.


### Expandable folder study

Open `/?view=folder-list-reference` for nested live rows beside actual Tahoe
Finder captures. Expanded and Collapsed baseline buttons restore matched
states. Shared zoom and Name/Details crops use the existing list comparison.
The captures show 15px indentation, 20px rows, full-width selection, and native
disclosure arrows. Dark/light, active/inactive, sorting, resizing, and disabled
extra states remain interactive on the live side.

Click a disclosure or use Right/Left from a row. Right opens in place; Left
closes an open folder or selects its parent. Collapsed descendants retain their
expansion state while hidden selections are removed. Return renames nested
items, and Space opens Quick Look in visible sibling-sort order. Data is demo
React state; these actions do not operate on native files.

`public/assets/native-folder-list/SOURCES.md` records the generated native
fixture and capture provenance. Finder's installed-app file artwork can differ
from the package's generic file-type icons.

### Open / Save dialog study

Open `/?view=file-dialog-reference` for Open, expanded Save, and compact Save
beside actual Tahoe NSOpenPanel/NSSavePanel captures. Open · columns and
Save · columns compare the demo browser subtree, omitting unrelated ancestors. Fit / 1× / 1.5× / 2× zoom
and Header / Actions crops are shared between panels. Reset native match restores
the initial directory, filename, selection, and column widths.

The workbench launches focus-trapped dialogs and offers dark/light, sidebar,
multiple-file selection, and a narrow layout. Navigate folders, use history or
the Where control, search the current folder, change file types, and resize/sort
columns. The View options menu switches List / Columns without resetting folder,
filename, tags, query, type, sort, or selection, and also toggles the sidebar.
Open supports multiple sibling selections in either view. Return opens, Escape cancels, and search consumes Escape to clear a
nonempty query first. Save chooses the filename stem, adds missing extensions,
validates input, and asks before reporting replacement. Try Project brief.txt.
The callback output is demo state; it performs no filesystem operation.

Captures and provenance are in `public/assets/native-file-dialog/`. Save's
separate system title bar is omitted in the paired viewport; Original shows the
full capture for whole-panel presets. The baseline is dark/inactive. Column
originals are browser-only crops. Icon view, native storage access, and native
tag-token editing are not implemented. The workbench enables New Folder with
a data callback; the original whole-panel baselines keep creation disabled
to match their captures.

### Finder column study

Open `/?view=file-columns-reference` for connected file columns beside genuine
Tahoe Finder browser captures. Folder path and Image preview restore matched
presets. Shared zoom and Rows / Preview crops inspect the same geometry on both
sides: 245px columns, 22px rows, retained gray ancestors, and the active selection.
The preview uses the same Clouds.webp bytes as native Finder.

Single-click folders to reveal children. Right enters the first enabled child;
Left selects the parent. The existing file list supplies sibling arrows, Home /
End, typeahead, rename, and Quick Look callbacks. Resize a divider with pointer
or keyboard, double-click to reset, and Escape to cancel a pointer resize.
The narrow-container control keeps the selected column visible while revealing
as much right-hand context as fits. Extra states include a disabled folder, a
long filename, and 32 generated files for vertical scrolling.

The native images are fixed crops documented in
`public/assets/native-file-columns/SOURCES.md`. Other selections, resizing,
appearance, sorting, and extra files affect the React side. Native Quick Actions,
Show More, and tag editing are outside this preview comparison. The reusable
column component defaults to single selection and also supports controlled
multiple sibling selections. Open/Save reuse it alongside List view.

### New Folder study

Open `/?view=new-folder-reference` for genuine native Tahoe Finder List and
Columns naming crops, the New Folder sheets from NSOpenPanel/NSSavePanel,
and the live duplicate-name state. Fit / 1× / 1.5× / 2× zoom is shared. Reset
native match restores the captured names and selected editor text. The left
side uses the same package components as the workbenches; native images are
reference-only. Provenance and crop coordinates are in
`public/assets/native-new-folder/SOURCES.md`.

Try Finder's New Folder button, right-click menu, and Command/Control-Shift-N
in Icon, List, and Columns views. Return commits the inline name; Escape keeps
the generated folder. Columns create inside the current folder. Names are
validated against siblings, including existing files. The existing folder/list,
column, and window icon workbenches also support creation.

The Open/Save workbench supports List/Columns, light/dark, a narrow dialog, and
Fail next creation. A failure is reported inline without dropping the draft;
retry then succeeds. Create enters the new directory, while Save As and Tags
stay intact. New Folder is available again from the empty browser. Escape
cancels the naming sheet first. Data changes stay in React state; callbacks do
not open or save actual files. The temporary native fixture contains only
generated folders and demo text.

### Finder Gallery study

Open `/?view=file-gallery-reference` for Gallery beside actual native Tahoe
Finder captures of the same image, text file, and folder. More information
matches the expanded native metadata state. Fit / 1× / 1.5× / 2× zoom,
Whole Gallery / Preview / Information / Filmstrip crops, and synchronized
scrolling inspect both sides at the same scale. Presets restore the native
light/inactive state. Provenance and measurements are recorded in
`public/assets/native-file-gallery/SOURCES.md`.

The live side uses the reusable `MacFileGallery`, existing file-grid selection,
and the existing Quick Look dialog. Try arrows, Home/End, typeahead, range
selection, Command/Control-click, and Select All. A long filmstrip includes a
disabled item and 30 extra images. Narrow and dark controls exercise layout;
the pane hides at 500px. Failed preview shows the icon fallback. Empty clears
selection and shows an empty state. Quick actions and Add Tags report callbacks.
Space opens Quick Look; closing restores focus to its selected filmstrip file.

Preview images, text, thumbnails, metadata, and file operations remain caller
supplied. Gallery's large folder fallback is exported from native Icon Services;
the comparison does not use screenshot art inside React. Text thumbnail art is
from Quick Look on the generated Notes.txt. The native side is fixed; only the
four light single-selection presets are calibrated. Native tag editing,
Quick Action execution, and document decoding are not included.

### Finder Get Info study

Open `/?view=file-info-reference` for live `MacGetInfoPanel` beside unaltered
native Tahoe Get Info captures. Image, Folder, and With preview presets restore
the native state. Fit / 1× / 1.5× / 2× zoom, title/general/name detail crops,
and synchronized scrolling keep both sides aligned. Source dimensions and
provenance are recorded in `public/assets/native-file-info/SOURCES.md`.

The workbench opens a modeless `MacGetInfo` from Icon, List, Columns, or Gallery
with Get Info or Command/Control-I. Edit the full name with Return/blur, undo
the draft with Escape, or close with the red control or Command/Control-W.
Validation includes sibling collisions; Fail next rename exercises recovery
from a synchronous callback error. Rename callbacks are counted to reveal
duplicate submission. Closing unfinished name edits discards them.

General flags, Hide extension, Comments, and Open with update local React state.
Tags and Change All report callbacks; Sharing & Permissions is read-only.
Narrow/dark controls exercise the browser and inspector. The native light
compact and expanded-preview states are calibrated; dark appearance and other
expanded section interiors remain first passes. There is no filesystem access,
OS permission/association mutation, window dragging, or multi-file inspector.

### Tahoe input controls study

Open `/?view=input-controls-reference` for reusable `MacCheckbox`,
`MacRadioGroup` / `MacRadio`, `MacSlider`, and `MacStepper` beside actual native
AppKit controls. Active light/dark references are genuine window captures;
inactive light/dark references are offscreen AppKit renders. The comparison
clips the active window's 32-point title bar in CSS, retaining the unaltered
original PNGs. Provenance and measured geometry are in
`public/assets/native-input-controls/SOURCES.md`.

Shared Fit / 1× / 1.5× / 2× zoom and family detail crops compare regular-size
unchecked, selected, mixed, disabled, ticked, and bounded states. Reset native
match restores the live fixture. Native references stay fixed while the live
controls are interactive. Dark and Active window affect both sides.

The workbench exercises a mixed parent checkbox, independent named values,
radio arrow navigation skipping a disabled option, slider pointer and keyboard
input/commit callbacks, stepper bounds, decimal stepping, read-only/disabled
states, custom accents, and FormData submission. Controlled reset restores
values and incomplete numeric drafts; the separate uncontrolled form checks
native reset without wiring individual state. Disabled fields are omitted
from submission. Values stay in local React state.

Browser smoke checks cover mixed→all→none, radio navigation, Home/End/Page Up,
slider dragging to 100, held stepper presses reaching the bound, required empty
fields, decimal values, form submission and both reset modes. Focus rings,
hover/pressed treatment, and repeat timing have no separate native calibration.
Range/vertical sliders, small/mini controls, wrapping steppers, and Sequoia
calibration are outside this pass.

### Tahoe pop-up buttons and combo boxes

Open `/?view=selection-controls-reference` for reusable `MacPopUpButton` and
`MacComboBox` beside six genuine local Tahoe AppKit captures. The comparison
has Closed, Pop-up menu, and Combo-box list states in light/dark, regular/small
controls, disabled examples, synchronized scrolling, family crops, and shared
Fit / 1× / 1.5× / 2× zoom. The native PNGs remain unaltered; the 32-point title
bar is clipped in CSS. Pointer artwork in the native references is retained.

The pop-up uses fixed choices, a checkmark, disabled rows, typeahead, and
selected-row placement over the trigger. The combo accepts custom strings
and shows a denser native-style list over the editable field. Optional
`mode="list"` filters suggestions and displays a configurable empty message.
The workbench covers controlled selection/text, a 64-option uncontrolled
pop-up with disabled choices, and an uncontrolled filtered combo. FormData,
native form reset, read-only, disabled, and required values are supported.

Browser smoke checks cover keyboard option selection, long-list scrolling
and End navigation, custom text submission, Escape retaining text, empty
suggestions, controlled/uncontrolled form reset, read-only keypresses, and
disabled fields being omitted from submission. The native fixture validates
its controls with `selection-controls-reference.swift --validate`.

Native focus/hover details, transition timing, and exact keyboard conventions
still need dedicated calibration. Mini controls, Sequoia, grouped/multiple
selection, and virtualized lists are outside this pass. No dependency was added.

### Tahoe alerts and confirmation dialogs

Open `/?view=alert-reference` for `MacAlertPanel` beside ten original local
Tahoe `NSAlert` captures: Information, Replace with suppression, Critical,
Save/Don’t Save/Cancel, and an attached document sheet, each in light/dark.
Shared Fit / 1× / 1.5× / 2× zoom preserves point geometry. The live comparison
stays open after decisions; Reset restores its suppression checkbox. Native
captures retain their initial keyboard focus ring.

The document workbench uses the reusable modal `MacAlert`, including initial
Cancel focus, Return default, Escape cancellation, Space activation, trapped
Tab navigation, outside-click protection, and focus return to the trigger.
The default action can be disabled to check that shortcuts never fall through
to another action. The warning example exposes a suppression checkbox. All
results stay in local React state; no documents are changed.

`packages/macos/scripts/alert-reference.swift --validate` self-checks the native
configurations and exports transparent native artwork. The source provenance,
measured geometry, and ten unaltered captures are under
`public/assets/native-alerts`. Actual sheet geometry comes from attached live
captures. Pure action tests cover order and disabled/missing shortcuts.
Exact transition timing, desktop-dependent material, independent multi-window
sheet ownership, and Sequoia calibration remain outside this pass.

### Tahoe progress bars and spinners

Open `/?view=progress-reference` for reusable `MacProgressBar` and `MacSpinner`
beside local Tahoe `NSProgressIndicator` captures. The 632 × 408-point fixture
contains regular/small columns and seven rows: empty, 50%, complete,
indeterminate, stopped bar, spinner, and stopped spinner. Light/dark stills
and native motion recordings are available with shared zoom, family crops,
and synchronized scrolling. The original 32-point title bar is clipped in CSS.

Play motion runs the CSS animation beside a looping native clip assembled
from 48 timed window captures. Sampling averages roughly 8–12fps; native and
browser phases are independent. The still mode freezes the live comparison
for visual inspection. System reduced-motion preferences disable playback
and CSS motion. Provenance, native geometry, and timestamps are under
`public/assets/native-progress`.

The workbench exercises controlled progress, a simulated transfer with pause
and restart, a full-width unknown-duration bar, and a spinner. Busy indicators
support stop/resume, hidden stopped states, both sizes, custom bar accents,
and reduced motion. Work is simulated in local state; no files are transferred.
Numeric normalization tests cover clamping, custom maximums, and nonfinite
inputs. Native fixture validation checks 14 public AppKit indicator views.
Exact easing, high-frame-rate timing, inactive tints, and Sequoia calibration
remain outside this pass. No dependency was added.


### Tahoe popovers

Open `/?view=popover-reference` for live `MacPopover` beside eight genuine
Tahoe `NSPopover` window captures: bottom, top, right, and left in light/dark.
Both sides use identical 240 × 164-point content, a 120 × 32-point anchor,
and shared Fit / 1× / 1.5× / 2× zoom. CSS crops the original full-window JPEGs
to their measured popover frames; the original captures remain unaltered.
Reset native match reopens the live panel and resets its local checkbox.

The workbench checks four directions, first-control focus, checkbox editing,
Tab navigation, Done/Escape/outside dismissal, focus return, and flipping at
both container edges. Reduced motion and reduced transparency can be toggled.
The reusable panel provides accessible title/description, live backdrop blur,
scrollable content, and environment-scoped portals. No dependency was added.

`packages/macos/scripts/popover-reference.swift --validate` self-checks the
native content. Provenance, native geometry, and original JPEGs live under
`public/assets/native-overlays`. Native material, keyboard focus-ring details,
exact animation timing, and Sequoia need further calibration. Tooltips were
explicitly deferred; no tooltip component or reference is included.


### Tahoe text fields and search fields

Open `/?view=text-fields-reference` for `MacTextField` and `MacSearchField`
beside six local Tahoe AppKit captures. Normal, Text focus, and Search focus
are available in light/dark. The 632 × 500-point fixture has regular/small
columns and nine rows: empty, filled, password, read-only, disabled, empty
search, filled search, disabled search, and read-only search. Original JPEGs
retain their 32-point title bar; CSS clips it in the comparison. Shared zoom,
text/search detail crops, synchronized scrolling, and reset are supported.
Focus presets hold the captured focus ring without stealing browser focus.

The workbench covers controlled and uncontrolled values, Return/icon search,
Escape and Clear, next-control Tab navigation, input refs, required-field
validation, read-only editing, disabled submission, and native form reset.
Canceling React's delegated `onReset` now also cancels the shared control-state
reset. Regression tests cover late cancellation and observer teardown; browser
checks verify actual values and focus after actions. All values stay local.

`packages/macos/scripts/text-fields-reference.swift --validate` self-checks
18 public native controls. Original images, measured frames, and source
provenance are in `public/assets/native-text-fields`. Native caret/selection,
font rasterization, non-Mac font fallbacks, and Sequoia need separate
calibration. No dependency was added.


### Tahoe switches and segmented controls

Open `/?view=toggle-controls-reference` for refined `MacSwitch` and reusable
`MacSegmentedControl` beside six local Tahoe AppKit captures. Normal, Switch
focus, and Segment focus are available in light/dark. The 632 × 500pt fixture
has regular/small columns and eight rows: switch off/on, disabled off/on,
text segments, a disabled segment, a disabled group, and icon segments.
Original 1264 × 1064 JPEGs retain their title bar and capture profile; CSS
clips the 32pt title bar. Shared zoom, family detail crops, synchronized
scrolling, and reset retain native point geometry. Focus presets hold the
captured ring without stealing browser focus.

The switch matches the native pill thumb, track sizing, disabled treatment,
and dark on-state tint. Both switch frames are 54 × 24pt; small artwork is
44 × 20pt centered in that frame. The rounded segmented style uses accent
selection, 24/20pt height, equal-width items, native symbols, and disabled
text/tints. `MacTabs variant="segmented"` reuses the style with tab semantics.

The workbench verifies Space toggling, input refs, arrow selection, disabled
item skipping, canceled selection, read-only values, disabled submission,
controlled reset, uncontrolled reset, canceled reset, icon choices, custom
accents, reduced motion, and tab panel navigation. Everything stays local.
`packages/macos/scripts/toggle-controls-reference.swift --validate` self-checks
eight switches and eight segmented controls; metrics and source provenance
are under `public/assets/native-toggle-controls`. Existing package tests and
browser smoke checks cover the change without adding dependencies.

Native drag gestures, exact transition timing, non-blue accent matching,
Sequoia calibration, multi-select, and momentary segments are outside this pass.

Open [the date and time study](http://127.0.0.1:3006/?view=date-picker-reference)
from **Controls → Date & time pickers**. `MacDatePicker` and `MacCalendar` sit
beside genuine `NSDatePicker` captures from the local Tahoe 26.6.2 system.
Shared zoom, synchronized scrolling, Fields/Calendar crops, light/dark
appearance, and the selected-month preset preserve native point geometry.
The four original 2× JPEGs retain their color profiles; only CSS crops them.

The native fixture contains regular/small date, time, combined date/time, and
disabled fields plus a Gregorian calendar. It fixes October 20, 2026 at
2:35 PM and marks October 21 as today. The workbench exercises controlled
and uncontrolled local ISO values, 12/24-hour time, segment typing and stepping,
calendar keyboard navigation, min/max dates, disabled/read-only controls,
cancelable changes, and normal/canceled form reset. Submission reports local
form data and does not save to the system.

Pure date tests cover leap years and centuries, month-end edits, year limits,
time rollover, strict parsing, bounds, six-week cells, and calendar keyboard
navigation. Browser checks cover opening and dismissing the calendar, day/month
navigation, selection and focus return, typing, meridiem changes, bounds,
24-hour display, form omission, canceled changes, and reset. Native self-checks
assert nine picker frames, fixed dates, and disabled states. Source/provenance
and control metrics are in `public/assets/native-date-picker/SOURCES.md`.

This first pass uses nonempty Gregorian dates in US order. Native overlay
attachment, stepper mouse hold-repeat timing, and other calendar/locale layouts
are not calibrated. Tooltips remain deferred.

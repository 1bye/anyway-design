# macOS Platform Lab

Run `bun run dev:macos` from the repository root, then open
[localhost:3006](http://127.0.0.1:3006).

The lab consumes `@anyway-design/macos`, a standalone React workspace package.
It includes separate Sequoia and Tahoe presets for the desktop composition,
menu bar, Dock, window chrome, tabs, buttons, and switches.

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

Choose **Window → Compare with Apple**, or open
[the window study](http://127.0.0.1:3006/?view=window-reference), for the Tahoe
Finder comparison. The source is [Apple's Tahoe 26 Finder guide](https://support.apple.com/en-euro/guide/mac-help/mchlp2605/26/mac/26).
The original transparent 1144 × 694 PNG is displayed at 572 × 347 before
shared zoom. This 2:1 normalization is a comparison convention, not a
verified native display scale. **Fit both**, **1×–2×**, **Toolbar**, and
**Sidebar** provide matching views; scrolling either panel follows in the other.

The shared React window, floating sidebar, traffic lights, and toolbar groups
are live. Sidebar selection, toolbar activation callbacks, active/inactive
state, sidebar visibility, and reduced transparency can be exercised.
**Reset comparison** restores the matching state. The document tabs and file
pane are a static crop from Apple's image, clearly identified in the page.
This keeps the study focused on chrome rather than reproducing Finder content.

The study calibrates a 121px sidebar column, 41px title bar, 7px sidebar inset,
22px outer radius, 25px sidebar rows, and 11px traffic lights at its normalized
scale. Its grayscale and control colors are sampled from the reference.
The main lab uses the shared components at their general-purpose dimensions.
The toolbar and sidebar use shared `WindowSymbol` SVGs, with reference-matched
silhouettes, optical sizing, and stroke weights instead of generic Lucide icons.
These are custom approximations, not exported SF Symbols. Font rasterization,
backdrop blur, and rim light still differ from Apple's renderer. Dark and inactive
states are adaptations without a matching reference image.

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

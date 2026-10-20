# Native Tahoe Quick Look reference

`tahoe-image.jpg` is a live Quick Look window captured on 20 October 2026,
running macOS Tahoe 26.6.2 (25G83), through the computer-use screenshot API.
It is an unmodified 1446 × 936 JPEG at 2× density, displayed at 723 × 468
logical pixels. CSS clips its exterior corners at the native radius to avoid
the screenshot API's white corner background. No captured chrome is used on
the React side.

The source file was `/private/tmp/Anyway-List-Reference/Photo 2.webp`, a byte-for-byte
copy of the lab's `clouds.webp`. The source photograph comes from the user's
existing Taada demonstration assets; see `../SOURCES.md`. A separate temporary
Finder window was opened for the capture and closed afterward. No personal
document, desktop, or sidebar location appears in this image.

The panel has its native charcoal surface, title, close/fullscreen controls,
Share, and Open with Preview. It was resized through the native window edge
before capture. Normalized geometry is a 38px toolbar, 5px content side/bottom
insets, and an approximately 20px outer radius. The image is proportionally
contained with vertical letterboxing. `manifest.json` records the geometry.
The native screenshot and browser image exhibit color/rasterization differences;
the comparison keeps the original source and capture rather than recoloring them.
Native vibrancy over varying backgrounds and motion are not calibrated here.

`document-preview.svg` is original code-authored demonstration artwork. It is
a supplied page image for the interactive document example, not a PDF file,
a native document capture, or an asset extracted from another application.
Other workbench states, navigation controls, fallbacks, callbacks, and expanded
browser size are interaction examples beyond the single-file native capture.

The Quick Look controls use the shared native glyph masks exported through
AppKit; see `packages/macos/src/assets/native-symbols/SOURCES.md`. Apple's native
interface artwork retains its original ownership and terms. The reference
capture is a local study fixture outside the component package.

The close/fullscreen shapes are now loaded directly from QuickLookUI.framework's
`close` and `fullscreen` asset renditions at their native 12pt extent, replacing
the initial SF Symbol approximations. Opening/closing uses the source-rectangle
zoom described by Apple's [preview-panel delegate API](https://developer.apple.com/documentation/quicklookui/qlpreviewpaneldelegate/previewpanel(_:sourceframeonscreenfor:)).
The 260/180ms browser curves and delayed toolbar fade are provisional, not
motion measured from the still capture.

Apple's [Quick Look guide](https://support.apple.com/en-mo/guide/mac-help/mh14119/mac)
documents Space to preview/close and arrow navigation among multiple items.
The actual local Tahoe capture above is the visual baseline.

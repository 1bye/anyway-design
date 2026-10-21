# Native Tahoe symbols

Exported locally on macOS 26.6.2 (build 25G83) with
`packages/macos/scripts/export-symbols.swift`. All 41 icons are native raster
exports. No screenshot tracing or hand-drawn paths are used.

- 37 symbols: AppKit `NSImage(systemSymbolName:accessibilityDescription:)`.
- `applications` (`appstore`) and `alias` (`square.dashed.and.alias`):
  AppKit `NSImage(symbolName:bundle:variableValue:)`, loading
  `/System/Library/PrivateFrameworks/SFSymbols.framework/Versions/A/Resources/CoreGlyphsPrivate.bundle`.

System symbols are configured at 16pt with the weight recorded in `manifest.json`,
rendered in monochrome, cropped to its alpha bounds, and fitted proportionally
to its recorded optical extent on a 16px canvas at 4× density. Transparent
64 × 64 PNGs supply alpha masks; React supplies color. The original vector
silhouettes are not edited. Rendering and downsampling can differ from AppKit
at another point size or display scale.

`checkbox-check` uses the heavy `checkmark` at a 10-point optical extent;
`stepper-chevron-down` uses the bold `chevron.down` at 11 points. These are
separate control masks calibrated against the local AppKit fixture, preserving
the existing menu checkmark and toolbar chevrons.

`search-clear` requests the monochrome variant, retaining the transparent X
inside the filled circle. The exporter checks that the X remains a cutout;
a single-color palette would incorrectly turn that symbol into a solid disc.

Quick Look's `quick-look-close` and `quick-look-fullscreen` use the actual
`close` and `fullscreen` artwork in `QuickLookUI.framework/Resources/Assets.car`,
loaded through `Bundle.image(forResource:)`. Their 12pt native geometry is
preserved on the shared 16px canvas, including transparent cutouts. These replace
the earlier look-alike system symbols. `markup` (`pencil.tip.crop.circle`)
still uses the public system-symbol loader. The catalog metadata identifies
both controls as 12 × 12 vectors with 1×/2× renditions.

The live window and menu comparison views use Apple's reference images listed
in `apps/macos-lab/public/assets/SOURCES.md`. The current `zipper.page` symbol
is a different rendition from the published menu's zipper. Other weights and
optical extents are visual calibrations, not recovered Finder configuration.

The generated files are packaged for this local prototype; the Apple artwork
retains its original ownership and terms. These files are not an independently
licensed icon set. The export uses the local catalog only; the React runtime
does not load macOS frameworks. A future OS may rename or remove private glyphs,
in which case the exporter fails rather than substituting a different drawing.


The Open/Save Columns view button uses `column-view.png`, exported from
`NSImage(systemSymbolName: "rectangle.split.3x1")` by the same script on Tahoe
26.6.2 (25G83), at 4× in the standard 16-point mask canvas. Its visible extent
is 14 points; the adjacent chevron remains the existing native mask.

# Native Tahoe symbols

Exported locally on macOS 26.6.2 (build 25G83) with
`packages/macos/scripts/export-symbols.swift`. All 30 icons are native raster
exports. No screenshot tracing or hand-drawn paths are used.

- 28 symbols: AppKit `NSImage(systemSymbolName:accessibilityDescription:)`.
- `applications` (`appstore`) and `alias` (`square.dashed.and.alias`):
  AppKit `NSImage(symbolName:bundle:variableValue:)`, loading
  `/System/Library/PrivateFrameworks/SFSymbols.framework/Versions/A/Resources/CoreGlyphsPrivate.bundle`.

Each symbol is configured at 16pt with the weight recorded in `manifest.json`,
rendered in monochrome, cropped to its alpha bounds, and fitted proportionally
to its recorded optical extent on a 16px canvas at 4× density. Transparent
64 × 64 PNGs supply alpha masks; React supplies color. The original vector
silhouettes are not edited. Rendering and downsampling can differ from AppKit
at another point size or display scale.

The live window and menu comparison views use Apple's reference images listed
in `apps/macos-lab/public/assets/SOURCES.md`. The current `zipper.page` symbol
is a different rendition from the published menu's zipper. Other weights and
optical extents are visual calibrations, not recovered Finder configuration.

The generated files are packaged for this local prototype; the Apple artwork
retains its original ownership and terms. These files are not an independently
licensed icon set. The export uses the local catalog only; the React runtime
does not load macOS frameworks. A future OS may rename or remove private glyphs,
in which case the exporter fails rather than substituting a different drawing.

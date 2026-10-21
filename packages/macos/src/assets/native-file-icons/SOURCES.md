# Native file icons

Six generic type icons exported from the user's macOS Tahoe 26.6.2 (25G83)
through AppKit's public `NSWorkspace.icon(for: UTType)` API. Types and OS build
are recorded in `manifest.json`. No user documents or their thumbnails are read.

The transparent 256 × 256 PNGs retain the system icon's canvas and margins and
are intended for a 64px canvas at 4× density. The browser uses static assets;
it does not call AppKit. Type artwork can depend on macOS and installed apps.
Both presets currently use this Tahoe icon set. Apple's ownership remains
unchanged; these assets do not imply a redistribution license.

Regenerate from the repository root on a Mac:

```sh
xcrun swift packages/macos/scripts/export-file-icons.swift
```

The script verifies visible/transparent pixels, dimensions, and PNG decoding.
Reference thumbnails sampled from Apple's Finder guide remain in the lab only.

## Gallery folder fallback

`folder-preview.png` is a separate 1024 × 1024 export on a 512-point canvas,
using `NSWorkspace.icon(forFile:)` for an empty generated temporary folder.
It was exported on Tahoe 26.6.2 (25G83) for Gallery's larger preview and
filmstrip. Its actual-folder artwork differs from the existing generic type
fallback. Custom `file.icon` still takes precedence. No user files are read.

```sh
xcrun swift packages/macos/scripts/export-gallery-folder.swift
```

The exporter removes its own temporary folder and validates PNG decoding,
canvas dimensions, center visibility, and corner transparency. Icon Services
must be available; a restricted environment can return empty fallback artwork,
which fails validation. Existing file-type exports are unchanged.

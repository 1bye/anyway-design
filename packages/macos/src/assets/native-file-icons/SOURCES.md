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

# Native Tahoe AppKit rename control baseline

`tahoe-grid-editor.png` and `tahoe-list-editor.png` were rendered on macOS
Tahoe 26.6.2 (25G83) using AppKit's real `NSTextField` and field editor on
20 October 2026. Each is 920 × 440 pixels, displayed as 460 × 220 logical
pixels. They contain only the generated demo name `Agreement for Services.pdf`
and the package's native generic PDF icon. No user files are shown or renamed.

These are **native AppKit control renders, not Finder screenshots**. Finder's
floating inline rename field was absent from both the Finder accessibility
snapshot and its per-window screenshot during this session. Do not use these
assets to claim exact Finder padding, field border, or active selection parity.
The field editor is inactive in the offscreen render and uses gray selection;
the browser workbench uses its active accent while focused.

Reproduce from the repository root:

```sh
swift -module-cache-path /private/tmp/anyway-rename-module-cache \
  apps/macos-lab/scripts/render-rename-reference.swift \
  apps/macos-lab/public/assets/native-file-rename
```

The script renders native AppKit controls without synthesizing input or
accessing personal documents. PDF icon provenance is recorded in
`packages/macos/src/assets/native-file-icons/SOURCES.md`.

[Apple's Tahoe rename guide](https://support.apple.com/guide/mac-help/rename-files-folders-and-disks-on-mac-mchlp1144/26/mac/26)
provides the Return-to-rename interaction baseline. The multiline layout,
click-away handling, and error feedback remain browser implementations.

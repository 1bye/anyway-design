# Native Tahoe controls

Generated on macOS 26.6.2 (25G83), using the public AppKit framework and
`packages/macos/scripts/export-controls.swift`. These are 2× NSView renders of
an **inactive offscreen window**, not screenshots of personal applications.
The source canvas is 584 × 380 logical pixels. `manifest.json` records the OS
build, density, row positions, and rendering method.

Buttons use `NSButton`, the push bezel, and Tahoe's capsule border shape;
the second column sets `NSCell.isHighlighted`. Fields use `NSTextField` with
a rounded bezel and `NSSearchField`; the second column contains “Tahoe”.
The third column sets `isEnabled = false`. Fonts are the system font at 13pt,
or 11pt for small buttons and labels. The primary row has a Return equivalent
and system-blue bezel color, which AppKit suppresses in this inactive capture.

These renders calibrate neutral colors, shapes, sizing, and highlighted or
disabled states. They **do not calibrate active default-button color, hover,
focus-ring rendering, vibrancy, or motion**. The live comparison and workbench
exercise those browser states separately. Offscreen font rasterization may
differ from a composited window on the display.

Regenerate on Tahoe with Xcode command-line tools, from the repository root:

```sh
xcrun swift packages/macos/scripts/export-controls.swift
```

The exporter checks dimensions, PNG decoding, and nontrivial image content.
Artwork remains Apple's; this local reference is not an independently licensed
component or icon asset library. Reference PNGs stay in the lab and are not
included in the React package.

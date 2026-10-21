# Native Tahoe popovers

Captured locally on macOS Tahoe 26.6.2 (25G83), 21 October 2026, using
`packages/macos/scripts/popover-reference.swift`. The fixture uses public
AppKit `NSPopover`, `NSTextField`, and `NSButton` APIs. It reads no personal
documents or system preferences. Reference → Light/Dark affects only the
fixture appearance. The popover uses transient dismissal behavior.

The eight `tahoe-popover-{bottom,top,right,left}-{light,dark}.jpg` files are
unmodified full-window computer-use captures, 1360 × 1104 pixels, except the
bottom-light capture at 1362 × 1104. The extra capture-boundary pixels are
retained; rendering uses 2 pixels per point. The host content is 680 × 520
points below a 32-point title bar. System screen-sharing
and pointer artwork are retained in the original files. The comparison uses
CSS cropping and scaling; no reference image supplies component artwork.

The Options anchor is at (280, 244), 120 × 32pt, in the host content. Native
popover content is 240 × 164pt, with 16pt padding, approximately 20pt corners,
and a curved arrow roughly 36pt wide and 12pt deep. The visible panel body is
13pt from the anchor. The title, description, checkbox, and Done button begin
at y=16, 42, 84, and 120. Done is 80 × 28pt. All text uses 13pt system fonts.

`metrics.json` records the actual native popover windows. Their 266 × 190pt
frames include 13pt surrounding the content. Origins below are measured from
the full captured host window's top-left, including its title bar:

| Side | X | Y |
| --- | --- | --- |
| Bottom | 207 | 308 |
| Top | 207 | 86 |
| Right | 400 | 197 |
| Left | 14 | 197 |

To validate the native content:

```sh
xcrun swiftc -module-cache-path /private/tmp/anyway-swift-module-cache \
  packages/macos/scripts/popover-reference.swift -o /private/tmp/anyway-popover-validation
/private/tmp/anyway-popover-validation --validate
```

For live captures, bundle the executable in a temporary `.app` with
`CFBundleExecutable=PopoverReference`, identifier `dev.anyway.popover-reference`,
and `NSHighResolutionCapable=true`. Activate the fixture, select appearance,
and use the four direction buttons to present each popover. Its own geometry
recorder writes to `/private/tmp/anyway-popover-metrics`. Validation checks the
four native controls, initial checkbox state, and content bounds.

[Apple NSPopover](https://developer.apple.com/documentation/appkit/nspopover)
documents anchor placement and presentation. Exact native animation timing,
focus-ring details, desktop-dependent material, and Sequoia are not separately
calibrated. Tooltips are excluded from this pass. Apple retains ownership of
native reference artwork.

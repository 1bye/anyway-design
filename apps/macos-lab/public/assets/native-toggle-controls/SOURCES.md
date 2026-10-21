# Native Tahoe switches and segmented controls

Captured locally on macOS Tahoe 26.6.2 (25G83), 21 October 2026, using
`packages/macos/scripts/toggle-controls-reference.swift`. The fixture uses
public AppKit `NSSwitch` and `NSSegmentedControl` APIs. It reads no personal
files or preferences. Reference → Light/Dark changes only this fixture.

The six `tahoe-toggles-{normal,switch,segment}-{light,dark}.jpg` files are
unmodified 1264 × 1064-pixel full-window computer-use captures. Content is
632 × 500pt below a 32pt title bar, clipped only in the lab's CSS. The original
capture color profiles, screen-sharing badge, and pointer artwork are retained.
Color measurements must account for the embedded display profile. Reference
images never supply component artwork; icon segments use the package's existing
native symbol exports.

Columns start at x=176 and 392. Switch rows start at y=72, 112, 152, and 192:
off, on, disabled off, disabled on. Segmented rows start at y=272, 316, 360,
and 404: text, disabled Month item, disabled group, icons. Each segmented
control is 176pt wide with equal-width segments, rounded style, and `selectOne`
tracking. Week/List is initially selected. All heights come from `sizeToFit()`
before the segmented width is assigned. Text uses 13pt / 11pt system fonts.

| Control | Regular | Small |
| --- | --- | --- |
| Switch view frame | 54 × 24pt | 54 × 24pt |
| Visible switch track | 54 × 24pt | 44 × 20pt, centered |
| Visible pill thumb | Approximately 32 × 20pt | Approximately 26 × 16pt |
| Thumb travel | Approximately 18pt | Approximately 14pt |
| Rounded segmented frame | 176 × 24pt | 176 × 20pt |

Normal clears first responder. Switch focus targets the enabled on regular
switch. Segment focus targets the regular text control, with the focus ring
surrounding its selected Week segment. Full Keyboard Access settings are not
changed. `metrics.json` records view frames, enabled flags, switch states,
selected segment indexes, and disabled segment indexes for all six captures.

To validate the fixture:

```sh
xcrun swiftc -module-cache-path /private/tmp/anyway-swift-module-cache \
  packages/macos/scripts/toggle-controls-reference.swift -o /private/tmp/anyway-toggle-reference
/private/tmp/anyway-toggle-reference --validate
```

For live captures, bundle the executable in a temporary `.app` with
`CFBundleExecutable=ToggleReference`, identifier `dev.anyway.toggle-reference`,
and `NSHighResolutionCapable=true`. Activate it, select appearance/focus through
Reference, then capture its window. Its own geometry recorder writes to
`/private/tmp/anyway-toggle-controls-metrics`. Validation checks eight switches,
eight three-segment controls, four on states, four disabled switches, two
disabled groups, initial selections, and positive dimensions.

[Apple NSSwitch](https://developer.apple.com/documentation/appkit/nsswitch)
documents binary choices and native drag interaction.
[Apple selectOne](https://developer.apple.com/documentation/appkit/nssegmentedcontrol/switchtracking/selectone)
documents single-selection radio behavior. Browser switches use native checkbox
semantics as described by the
[W3C switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).
Native dragging, exact motion timing, non-blue accent matching, and Sequoia
are not calibrated in this pass. Multi-select/momentary modes are not included.
Apple retains ownership of native reference artwork.

# Native Tahoe progress indicators

Captured locally on macOS Tahoe 26.6.2 (25G83), 21 October 2026, with
`packages/macos/scripts/progress-reference.swift`. The fixture uses public
AppKit `NSProgressIndicator` views; no personal documents or settings are read.
Reference → Light/Dark changes only the fixture's appearance.

`tahoe-progress-{light,dark}.png` are unmodified full-window computer-use
captures, 1264 × 880 pixels. The content is 632 × 408 points with a 32-point
title bar. The comparison clips the title bar in CSS. System capture/pointer
artwork, where present in the original title bar, is retained in the originals.

Both columns contain 0%, 50%, complete, indeterminate, stopped bar, spinning,
and stopped spinner states. `isDisplayedWhenStopped` is true. Column x origins
are 176 and 384, and the row containers start at y=72, 108, 144, 190, 232, 280,
and 326 with a 32-point height. `sizeToFit()` supplies the native control frames:

| Control | Regular frame | Small frame | Visible artwork |
| --- | --- | --- | --- |
| Bar | 176 × 20pt | 176 × 12pt | Centered 8pt / 6pt capsule tracks |
| Spinner | 32 × 32pt | 16 × 16pt | Eight rounded fading spokes |

The bar retains a half-track-height rounded cap at zero. Stopping an
indeterminate bar resets it to this cap. A displayed stopped spinner retains
its faded spoke pattern. The fixture explicitly starts the two running rows
and stops all others. `metrics.json` records native frames and capture timing.

`tahoe-progress-{light,dark}.webm` encode 48 timed computer-use captures each,
covering approximately 6.1s / 4.1s at average sampling rates of 7.7 / 11.4 fps.
Frame timestamps determine variable frame durations. Original capture profiles
were converted to sRGB for video encoding, then encoded as VP9, YUV420 with
BT.709 matrix and limited video range. The original
PNG reference files retain their capture profiles. Videos contain no audio;
`silent.vtt` is an empty caption track. Videos preserve full-window framing.

Observed motion guides the browser's first pass: an approximately 2-second
stretching, fading bar that alternates direction, and a roughly 0.8-second
spinner cycle. Video sampling is too coarse to establish exact easing or
frame-level timing. The comparison's native clip loops independently of the
live CSS animation, and static preview phases are chosen for visual inspection.
No native screenshot or video is used as component artwork.

To validate the fixture:

```sh
xcrun swiftc -module-cache-path /private/tmp/anyway-swift-module-cache \
  packages/macos/scripts/progress-reference.swift -o /private/tmp/anyway-progress-reference
/private/tmp/anyway-progress-reference --validate
```

For live captures, bundle this executable in a temporary `.app` with
`CFBundleExecutable=ProgressReference`, identifier `dev.anyway.progress-reference`,
and `NSHighResolutionCapable=true`. Set Light/Dark through the fixture's own
Reference menu, then capture the window. Validation self-checks 14 indicators,
styles, ranges, and positive dimensions. Native metrics are written to
`/private/tmp/anyway-progress-metrics`.

[Apple NSProgressIndicator](https://developer.apple.com/documentation/appkit/nsprogressindicator)
documents determinate/indeterminate modes and start/stop behavior.
[isDisplayedWhenStopped](https://developer.apple.com/documentation/appkit/nsprogressindicator/isdisplayedwhenstopped)
documents stopped visibility. Exact native inactive tinting, frame-level motion,
and Sequoia styling are not separately calibrated. Apple retains ownership of
native reference artwork.

# Native Tahoe alerts

Captured locally on macOS Tahoe 26.6.2 (25G83), 21 October 2026, from
`packages/macos/scripts/alert-reference.swift`. All ten PNGs are unmodified
computer-use captures of public AppKit `NSAlert` windows or sheets. The fixture
contains sample text only and never reads, saves, replaces, or deletes files.
Its Reference → Light/Dark menu changes only the fixture's appearance.

Each `tahoe-alert-{example}-{appearance}.png` has a matching live React panel:

| Example | Size in points | Configuration |
| --- | --- | --- |
| information | 260 × 218 | Informational, OK |
| warning | 260 × 266 | Warning, default Cancel, destructive Replace, suppression checkbox |
| critical | 260 × 218 | Critical, default Try Again, Cancel |
| save | 260 × 302 | Informational, default Save, destructive Don’t Save, Cancel |
| sheet | 260 × 222 | Save confirmation attached to a document using `beginSheetModal` |

PNGs are 2× the point dimensions. `metrics.json` records the native frames.
Native NSTextField boxes are inset 20 points, with their normal 2-point text
padding. Text is 13 points with 16-point lines; message text is bold. The app
image view is 64 × 64 points at (20,20). Two actions use 110 × 28-point frames
with an 8-point gap; three stack with 6-point gaps and a 228-point width.
Buttons have 16-point outer margins. The document sheet has no visible app
icon and sits 83 points below its 640 × 420-point parent's content top.

Captures retain the native initial focus ring. The native alert's rounded
capture has white outer corner pixels; the comparison clips those corners in
CSS. Original links open the unaltered images. The live preview shows a static
initial ring to match the reference; the actual modal uses real keyboard focus.

The default application icon and critical composite artwork were exported
separately at 4× from the alert's NSImageView using AppKit `cacheDisplay`.
Those transparent assets live in `packages/macos/src/assets/native-alerts`.
Reference screenshots are never used as component surfaces or buttons.
Callers can replace the complete artwork with the component's `icon` prop.
Apple's ownership of native artwork is unchanged.

To validate configurations and export icon artwork:

```sh
xcrun swiftc -module-cache-path /private/tmp/anyway-swift-module-cache \
  packages/macos/scripts/alert-reference.swift -o /private/tmp/anyway-alert-reference
/private/tmp/anyway-alert-reference --validate
```

Validation writes `/private/tmp/anyway-alert-validation`. Live capture metrics
go to `/private/tmp/anyway-alert-metrics`; only attached live sheets establish
their final sheet geometry. For captures, bundle the executable in a temporary
`.app` with `CFBundleExecutable`, `CFBundleIdentifier=dev.anyway.alert-reference`,
`CFBundleName=Anyway Alert Reference`, and `NSHighResolutionCapable=true`.
Open Information, Warning, Critical, Save, and Sheet in each appearance.

References: [NSAlert](https://developer.apple.com/documentation/appkit/nsalert),
[alert styles](https://developer.apple.com/documentation/appkit/nsalert/style),
[buttons](https://developer.apple.com/documentation/appkit/nsalert/buttons).
Informational and warning styles currently share artwork. Native material can
vary with the desktop behind it; this pass matches the captured surfaces.
Exact transition timing and Sequoia have not been calibrated.

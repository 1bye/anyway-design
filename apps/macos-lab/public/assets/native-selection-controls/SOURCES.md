# Native Tahoe selection controls

Captured locally on macOS Tahoe 26.6.2 (25G83), 21 October 2026, using
`packages/macos/scripts/selection-controls-reference.swift`. The reference app
uses public AppKit `NSPopUpButton` and editable `NSComboBox` controls with
sample values. No personal windows, files, or preferences are used.

All six PNGs are unmodified full-window captures through the computer-use API.
They preserve the native image profile and system pointer where visible.
The content is 632 × 350 points; the 32-point title bar makes each 2× PNG
1264 × 764 pixels. The page clips the title bar with CSS. Capture-pointer
halos and cursor artwork are not part of the controls' material.

| Asset | Appearance / state |
| --- | --- |
| `tahoe-selection-closed-light.png` | Light, closed controls |
| `tahoe-selection-closed-dark.png` | Dark, closed controls |
| `tahoe-selection-popup-light.png` | Light, regular pop-up menu open |
| `tahoe-selection-popup-dark.png` | Dark, regular pop-up menu open |
| `tahoe-selection-combo-light.png` | Light, regular combo-box list open |
| `tahoe-selection-combo-dark.png` | Dark, regular combo-box list open |

Enabled/disabled columns start at x=176 and x=384. Row frames start at
y=72, 126, 190, and 244. Controls are 176 points wide. Regular/small pop-up
frames are 26/22 points high, with visible bezels inset by one point at the
top and bottom (24/20 points high). Combo-box bezels occupy their 26/22-point
frames. Regular text is the 13-point system font; small text is 11 points.

Pop-up values are Automatic, High Quality (selected), Compact, and Unavailable
(disabled). `menu.autoenablesItems` is false. Native menu text aligns with
the trigger's text; rows are 24 points high. The current row overlaps the
trigger. Combo-box values are Documents, Downloads, Desktop, and Applications;
Documents is the initial editable value and `completes` is false. The native
combo list also overlaps its field, using 18-point rows, capsule selection,
and a denser gray surface distinct from the pop-up menu material.

To validate the native fixture without opening a window:

```sh
xcrun swiftc -module-cache-path /private/tmp/anyway-swift-module-cache \
  packages/macos/scripts/selection-controls-reference.swift \
  -o /private/tmp/anyway-selection-reference
/private/tmp/anyway-selection-reference --validate
```

For live captures, compile the same source into a temporary `.app` bundle with
bundle identifier `dev.anyway.selection-reference`. Reference → Light/Dark
resets the controls in that window's appearance, without changing system
settings. Capture closed controls, the first pop-up menu, and the first combo
list in each appearance. The source self-checks counts, initial values,
editability, and enabled/disabled states. All captures were decoded and checked
for the expected 1264 × 764 dimensions.

Reference PNGs are confined to the lab. Reusable React components use live
CSS, existing native glyph masks, and Base UI interactions. Browser font/color
rendering and compositor shadows can differ. Focus rings, hover details,
transition timing, exact native keyboard conventions, mini controls, and
Sequoia styling have no separate calibration in this pass. Apple's ownership
of the native artwork is unchanged.

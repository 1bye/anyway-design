# Native Tahoe input controls

Generated on macOS Tahoe 26.6.2 (25G83), 21 October 2026, with the public
AppKit classes NSButton, NSSlider, NSTextField, and NSStepper. The fixture
source is `packages/macos/scripts/input-controls-reference.swift`. No personal
windows, documents, or settings are used. Reference PNGs stay in the lab;
the React components render CSS and native glyph masks, not screenshot art.

The content canvas is 632 × 408 points. Columns start at x=168, 316, 464;
row frames start at y=76, 112, 158, 208, 258, 316. Controls use regular size.
Choice labels use the 13-point system font, fixture captions use 11 points.

| Asset | Source | Physical size |
| --- | --- | --- |
| `tahoe-inputs-active-light.png` | Native window capture through the computer-use API | 1264 × 880 |
| `tahoe-inputs-active-dark.png` | Native window capture through the computer-use API | 1264 × 880 |
| `tahoe-inputs-inactive-light.png` | Offscreen NSView.cacheDisplay | 1264 × 816 |
| `tahoe-inputs-inactive-dark.png` | Offscreen NSView.cacheDisplay | 1264 × 816 |

Active PNGs are unaltered full-window captures, retaining the native ICC
profile. The page clips the 32-point title bar with CSS to compare identical
content regions. The purple capture indicator in the original title bar is
outside the compared content. The actual captured selected choices and slider
tracks are blue. Inactive assets use AppKit's neutral control tint in an
offscreen inactive window; they are labeled as renders rather than screenshots.

Measured controls: 16 × 16 checkbox/radio glyphs in 20-point rows, 6-point
label gaps, 6-point slider tracks, 20 × 16 capsule thumbs, a 10-point inset
thumb center at each slider endpoint, and five optional tick marks. Slider
frames are 132 × 24, or 132 × 30 with tick marks. Each stepper fixture pairs a
56 × 24 right-aligned field with a 19 × 28 NSStepper, separated by 8 points.

Columns show unchecked/minimum, checked/middle, and disabled/selected states.
The mixed row sets `allowsMixedState` and `state = .mixed`. Ticked sliders
have five ticks and `allowsTickMarkValuesOnly`. Steppers use min=0, max=9,
increment=1, no wrapping, and autorepeat. The second stepper is at its maximum.
Fields and NSSteppers are separate native controls in this visual fixture;
the reusable React stepper binds its field and arrows to one value.

Build and export inactive references from the repository root:

```sh
xcrun swiftc packages/macos/scripts/input-controls-reference.swift -o /private/tmp/anyway-input-reference
/private/tmp/anyway-input-reference --export apps/macos-lab/public/assets/native-input-controls
```

For live captures, build that executable into a temporary .app bundle with
bundle identifier `dev.anyway.control-reference` and launch it. Reference →
Light/Dark resets the fixture in the requested appearance without changing
system preferences. Capture the active window at 2×. Its content area must
remain 632 × 408 points. The exporter validates image dimensions, PNG decoding,
and nontrivial content before writing the inactive images.

The comparison calibrates static regular-size geometry and light/dark,
active/inactive, checked/mixed, and disabled appearance. Pressed, hovered,
focus-ring, custom-accent, and autorepeat timing states have no separate
native calibration. Browser font rasterization and color management can
still differ. Sequoia, small/mini controls, vertical/range sliders, and wrapping
steppers are outside this first pass. Apple's ownership of native artwork is
unchanged.

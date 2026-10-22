# Example assets

The [native Quick Look study](native-quick-look/SOURCES.md) includes a local
Tahoe capture of the cloud demo and an original SVG document-page fixture.

- `clouds.webp`: copied from `taada/website/public/images/clouds-1920.webp`,
  the photograph already used in the user's Taada desktop preview.
- `finder.webp`, `safari.webp`, `mail.webp`, `downloads.webp`, `trash.webp`:
  copied unchanged from `taada/website/public/images/dock/`.
- `tada-icon.webp`: copied from `taada/website/public/images/tada-icon.webp`.

These are local demonstration assets, not assets exported by the component
package. Their original ownership and usage terms remain unchanged.
The standard Sequoia and Tahoe playgrounds share this icon set.

## Tahoe reference study

- `apple-tahoe-reference.jpg`: unmodified 3840 × 2560 image from
  [Apple's WWDC25 media download](https://www.apple.com/newsroom/images/2025/06/macos-tahoe-26-makes-the-mac-more-capable-productive-and-intelligent-than-ever/article/Apple-WWDC25-macOS-Tahoe-26-Apple-Music-250609.zip).
  Apple's accompanying notice is retained as `apple-media-notice.rtf`.
- `tahoe-light.jpg`: unmodified 6016 × 6016 Apple wallpaper, obtained from
  [iClarified's developer-beta wallpaper extraction](https://www.iclarified.com/97556/download-the-official-macos-tahoe-26-wallpaper-here).
  [Original image](https://www.iclarified.com/images/news/97556/465557/465557.jpg).

The comparison uses SVG viewports and silhouette clips to display the 24 icon
samples from Apple's photograph. These are static reference artwork, not
standalone transparent system icons: translucency within each icon is baked
into the source. The glass, spacing, separator, running indicators, focus, and
activation behavior are rendered by the React Dock. No photographed Dock
surface is used behind the live icons. These assets remain local study
fixtures and are not exported by the component package.

Geist in `../fonts/` is copied from the existing planning app; its license
is included alongside it.

## Tahoe window reference study

- `apple-tahoe-finder-reference.png`: unmodified 1144 × 694 RGBA image linked
  from [Apple's macOS Tahoe 26 “Use the Finder on Mac” guide](https://support.apple.com/en-euro/guide/mac-help/mchlp2605/26/mac/26).
  [Original PNG](https://help.apple.com/assets/69DD569682238CF8EC0621E2/69DD569982238CF8EC0621E9/en_US/4c09ae5b39875fee3cde6fbc1fbf89d3.png).

The study uses a common 2:1 normalization, then applies shared zoom. The right
panel displays the original. The left now uses live React window chrome, tabs,
file labels, tag dots, selection, and file-grid placement. Only the individual
thumbnail artwork is clipped from the image using SVG viewports: 96 × 96 source
squares centered at x=333, 508, 683, 858, and 1033, starting at y=162, 337, and
512. Those crops contain Apple's baked thumbnail shadows/background; they are
not transparent reusable file icons. No photographed labels or window chrome
appear behind the live items. The sampled artwork is disclosed in the study.
This is a local reference
fixture, not a component-package asset; Apple's ownership remains unchanged.

## Tahoe menu reference

- `apple-tahoe-menu-reference.png`: unmodified 814 × 568 PNG from
  [Apple's Tahoe 26 “Switched from Windows to Mac?” guide](https://support.apple.com/en-lk/guide/mac-help/mchlbc684e49/26/mac/26).
  [Original PNG](https://help.apple.com/assets/69DD569682238CF8EC0621E2/69DD569982238CF8EC0621E9/en_US/3d4f4608b2c832321e287273a5a4ad6d.png).

The menu study clips the rectangle at x=198, y=88, width=212, height=406
using CSS, including the menu's shadow. It applies the same shared zoom to
the live React menu. This is Apple's Finder **context menu**, used to calibrate
the shared surface for toolbar and right-click menus; it is not labeled as a
screenshot of Finder's More menu. The left panel contains no reference imagery.
The image remains a local comparison fixture outside the component package.

## Native Tahoe file-list reference

`native-file-list/tahoe-finder-dark.jpg` is a capture of Finder on the user's
Mac, displaying generated demo files only. See
[capture provenance and geometry](native-file-list/SOURCES.md) and its
`manifest.json`. This image is a lab fixture, not a component-package asset.

- `native-file-rename/`: Native Tahoe AppKit text-field baseline rendered locally
  at 2×. These are control renders, not Finder screenshots; selection is inactive.
  See the directory's `SOURCES.md` for limitations and reproduction instructions.

- `native-folder-list/`: Live Tahoe Finder captures of generated nested folders,
  in expanded and collapsed states. See the directory's `SOURCES.md` for the
  temporary fixture, dimensions, measured indentation, and capture details.

- `native-file-dialog/`: Genuine Tahoe NSOpenPanel and NSSavePanel captures,
  using generated files. Includes expanded and compact Save, plus browser-only
  Columns crops for Open and Save. See the directory's
  `SOURCES.md` for capture geometry, title-bar cropping, and the reference app.

- `native-file-columns/`: Browser-only crops from genuine Tahoe Finder windows,
  showing a folder path and an image preview. See the directory's `SOURCES.md`
  for fixture provenance, crop coordinates, and measured geometry.

- `native-new-folder/`: Genuine Tahoe Finder inline naming and AppKit Open/Save
  New Folder sheets, including the duplicate-name state. See the directory's
  `SOURCES.md` for fixture provenance, crop coordinates, and reproduction.

- `native-file-gallery/`: Genuine Tahoe Finder Gallery captures for image, text,
  folder, and expanded information states. Includes a native Quick Look
  thumbnail of generated demo text. See the directory's `SOURCES.md` for
  provenance, crop geometry, and calibrated states.

- `native-file-info/`: Unaltered native Finder Get Info windows for an image,
  folder, and expanded preview, plus the generated image's Icon Services art.
  See the directory's `SOURCES.md` for provenance, dimensions, and limitations.

- `native-input-controls/`: Native Tahoe checkbox, radio, slider, and stepper
  fixtures in light/dark and active/inactive states. Active references are
  actual window captures; inactive references are AppKit renders. See the
  directory's `SOURCES.md` for provenance and geometry.

- `native-selection-controls/`: Six unaltered Tahoe window captures of
  NSPopUpButton and NSComboBox in light/dark appearances, closed and open.
  Includes regular/small and disabled controls. See the directory's
  `SOURCES.md` for native fixture geometry and reproduction.

## Tahoe Notification Center study

- `tahoe-notification-center-reference.png`: unmodified 1116 × 1048 PNG from
  [Apple’s macOS Tahoe 26 Notification Center guide](https://support.apple.com/en-ie/guide/mac-help/mchl2fb1258f/26/mac/26).
  [Original image](https://help.apple.com/assets/69DD569682238CF8EC0621E2/69DD569982238CF8EC0621E9/en_US/c205466e29e900bca4f4d21cb1c49040.png).
- `tahoe-notification-banner-reference.png`: unmodified 852 × 734 PNG from
  [Apple’s macOS Tahoe 26 notifications guide](https://support.apple.com/en-ie/guide/mac-help/view-app-notifications-mh40609/26/mac/26).
  [Original image](https://help.apple.com/assets/69DD569682238CF8EC0621E2/69DD569982238CF8EC0621E9/en_US/dde97adb7f94b12c6996052a9ae96538.png).

Both images are displayed at half their pixel size before applying shared zoom.
The widget desktop crop starts at (0, 146), 794 × 902 source pixels; the reminder
crop starts at (0, 54), 794 × 550 pixels. Apple’s annotations remain in the originals.
The live panel uses React shells, text, and controls, with the clean Tahoe wallpaper
and a different Reading List photo (`clouds.webp`). Wallpaper alignment and clock
typography are approximate. Expanded notification groups and motion have not been
calibrated against a local recording.

- `notification-icons/reminders.png` and `messages.png`: exported at 128px from
  the installed apps’ `Contents/Resources/AppIcon.icns` on macOS Tahoe 26.6.2
  (25G83), using `scripts/export-notification-icons.swift` and ImageIO.
  These are local demo assets, not exports of the component package.
- `notification-icons/safari-symbol.png`: native AppKit `safari` symbol in
  monochrome white, exported by the same script for the Reading List heading.


## Native desktop windows (Tahoe)

`native-desktop/*.png` were captured locally using the computer-use native
window capture from **Anyway Native Desktop**, an AppKit fixture built from
`packages/macos/scripts/desktop-reference.swift` on macOS Tahoe 26.6.2.
Two independent NSWindows use system title bars, traffic lights, and editable
NSTextView documents. Images are unmodified 2× window-content captures:
Project notes is 420 × 310pt and active; Planning is 390 × 280pt and inactive.
Native capture crops omit WindowServer corner masks and shadows;
captures obscured by system screen-capture indicators were excluded.

The reference page composes these captures at matching top-left
frames on a 760 × 520pt blue workspace. It is not a screenshot of the whole
desktop. The moved preset repositions the same native window capture. Free
React gestures do not drive native windows. No recording-based motion calibration is claimed.

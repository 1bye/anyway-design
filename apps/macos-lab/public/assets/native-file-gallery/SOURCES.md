# Native Tahoe Finder Gallery

Actual Finder screenshots from macOS Tahoe 26.6.2 (25G83), captured on
21 October 2026 through the native computer-use API, at 2× density.
These are comparison assets only; no screenshot is rendered inside the
reusable Gallery component. Apple's ownership of native artwork is unchanged.

A separate Finder window displayed only this generated fixture:

```
/private/tmp/Anyway-Gallery-Reference/
  Clouds.webp
  Design resources/
  Notes.txt
```

Clouds.webp is a byte-for-byte copy of the existing lab asset. Notes.txt is
117 bytes of original demo text, recorded in `src/file-gallery-reference-data.tsx`.
The folder is empty. Fixture timestamps were set to 12 October 2026 at 09:41.
No user documents were opened or modified. The temporary Finder window was
closed after the captures. Its toolbar, sidebar, tab bar, and path bar were
hidden to isolate the Gallery browser and native preview pane.

Every source window was 2100 × 1380 physical pixels (1050 × 690 points).
Every checked-in screenshot uses the same crop: x=0, y=64, width=2100,
height=1316, omitting the 32-point title bar. The retained view is 1050 × 658
points. PNG crops preserve the original ICC profile and are otherwise unmodified.
A small pointer highlight at the upper edge remains part of the native capture.

| Asset | Native state |
| --- | --- |
| `tahoe-image.png` | Clouds.webp selected; Information collapsed |
| `tahoe-text.png` | Notes.txt selected; live native text preview |
| `tahoe-folder.png` | Design resources selected; native large folder icon |
| `tahoe-information.png` | Clouds.webp selected; Show More expanded |

Measured geometry: a 240-point information pane, 32-point preview insets,
a 62-point bottom filmstrip, 54-point thumbnail cells with 5-point gaps,
and a 48-point thumbnail canvas. Images retain their aspect ratio. The
information pane uses an approximately 24-point top inset, 15-point filename,
13-point kind and headings, 11-point metadata, and 23-point information rows.
The captured chrome is neutral/inactive. Browser font rasterization, image
color management, native vibrancy, and small-size artwork can differ.

`notes-thumbnail.png` is a native Quick Look thumbnail of the same generated
Notes.txt, exported at 512 × 512 with:

```sh
qlmanage -t -s 512 -o /private/tmp/anyway-gallery-thumbnails /private/tmp/Anyway-Gallery-Reference/Notes.txt
```

It is sample artwork, not a captured UI or document-decoding implementation.
The live text preview renders the original supplied text. Gallery's native
folder fallback is exported independently in the component package; see
`packages/macos/src/assets/native-file-icons/SOURCES.md`.

Native arrow navigation and multi-selection were inspected. The first pass
calibrates the four single-selection light presets. The multiple-selection
stack, dark appearance, and responsive hiding of the information pane are
not separately calibrated native captures. Tag editing and Quick Actions are
callbacks, not system services; the page never reads or writes user files.

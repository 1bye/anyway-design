# Native Tahoe Finder column view

These are browser-only crops of actual Finder screenshots from macOS Tahoe
26.6.2 (25G83), captured on 20 October 2026 through the native computer-use API.
No AppKit reconstruction, reference imagery, or captured text is used inside
the React component. Apple's ownership of native interface artwork is unchanged.

The same generated fixture as the folder-list study was opened in a separate
Finder window at `/private/tmp/Anyway-Folder-Reference`:

```
Archive/
Design resources/
  Brand/
    Colors.txt
    Type.txt
  Icons/
    Notes.txt
  Read me.txt
Photos/
  Clouds.webp
Project brief.txt
```

Text files contain repeated original demonstration text, about 1 KB each.
Clouds.webp is the lab's existing asset, copied byte for byte. Fixture timestamps
are 12 October 2026 at 09:41. No user documents were opened or modified.
The temporary Finder window was closed after capturing and checking navigation.

Finder was switched to Columns with its sidebar hidden. The original windows
were captured at 1840 × 1380 physical pixels (920 × 690 logical points).
Only the demo browser columns were retained; ancestors outside the fixture,
window chrome, and the path bar were excluded before adding these assets:

| Asset | Source crop in physical pixels | Result |
| --- | --- | --- |
| `tahoe-folders.png` | x=370, y=176, width=1470, height=1148 | 735 × 574 points |
| `tahoe-image.png` | x=380, y=176, width=1460, height=1148 | 730 × 574 points |

PNG crops preserve the capture's color profile and are otherwise unmodified.
The folder capture is inactive, selecting Design resources → Brand, with Brand's
children visible. The image capture selects Photos → Clouds.webp: the ancestor
stays gray and the current file is blue. Both contain only demo files. Original
links in the study open these full browser crops; the paired viewport shows
the upper 470 points to focus on navigation and preview information.

Measured folder columns are 245 points wide, including a 1-point dark divider.
Rows are 22 points with a 6-point initial gap and 10-point horizontal insets.
Selection corners are about 8 points. The image preview occupies the remaining
240 points, with approximately 10-point content insets and a 290-point artwork
area. Native Left returned to the parent row; Right selected the first child.
The live study's active selection uses #0058cc, calibrated after converting
the capture profile to sRGB; the reusable component retains the environment's
configurable accent color.

The React view uses the package's generic native file-type icons, which differ
from Finder's installed-app .txt association and small-size hinted artwork.
Fonts, capture color handling, and browser rasterization also affect pixels.
The first pass does not implement Finder's tag editor, Show More, system Quick
Actions, multi-selection, or document decoding. Images, text, and metadata are
caller supplied; a custom preview renderer can replace the built-in preview.

# Native Tahoe New Folder

Captured on 21 October 2026 on macOS Tahoe 26.6.2 (25G83), in light appearance
at 2× scale. These are genuine Finder, NSOpenPanel, and NSSavePanel screenshots,
not reconstructed artwork. Full-window images remain outside the repository;
only the crops listed here are shipped.

The fixture `/private/tmp/Anyway-New-Folder-Reference` started with:

```
Design resources/
Project brief.txt   (generated demo text)
```

Finder's Command-Shift-N created `untitled folder` in the root and then another
inside Design resources in Columns view. Escape left both folders in place.
The native Save panel also created a demo Review folder to verify navigation
while retaining Untitled.txt. No user documents were opened or saved.

- `tahoe-finder-list.png`: 526 × 228 pixels (263 × 114 logical points).
  Crop `(494, 176, 526, 228)` from a 1840 × 928 Finder window capture.
  Name header, Design resources, Project brief.txt, and the selected inline
  `untitled folder` editor. The original pointer indicator is retained.
- `tahoe-finder-columns.png`: 490 × 228 pixels (245 × 114 logical points).
  Crop `(860, 176, 490, 228)` from a 1840 × 928 Finder window capture.
  The selected folder's naming column, inside Design resources. Ancestors,
  sidebar locations, toolbar, and breadcrumbs are outside the crop.
- `tahoe-open.png`: 642 × 344 pixels (321 × 172 logical points). Full native
  naming sheet for Open, with `untitled folder 2` selected. The root's existing
  untitled folder causes the suffix. Parent name wraps across two lines.
- `tahoe-save.png`: 642 × 344 pixels, the same native naming sheet from Save.
- `tahoe-duplicate.png`: 642 × 392 pixels (321 × 196 logical points). Native
  validation after entering `Design resources`: “This name is already taken.”
  appears and Create is disabled. Pointer indicator is retained.

Coordinates are `(x, y, width, height)`, in physical pixels. ICC profiles are
preserved; contents are not repainted or edited. The live comparison uses the
same dimensions, names, and package components. Its accent is a representative
sRGB sample (#0364e1) of the captured Finder blue; native selection has small
pixel variations. The naming sheets show inactive gray text selection and
neutral Create buttons. The page rounds the native sheet image corners to
exclude unrelated parent-window pixels; Original retains the unmodified image.
Native .txt icons reflect installed app associations, while React uses the
package's extracted generic type icon. Font rasterization can differ.

The AppKit reference host is `scripts/native-file-dialog-reference.swift`.
Compile with `swiftc -D NEW_FOLDER_REFERENCE` into an .app bundle to enable
`canCreateDirectories` and point at this generated fixture. Without the flag,
the older Open/Save study's creation-disabled configuration is unchanged.
Open the genuine panels, expand Save if needed, and click New Folder. Enter an
existing sibling name for the collision state. Cancel after capture. Finder's
List and Columns captures use the standard Command-Shift-N action.

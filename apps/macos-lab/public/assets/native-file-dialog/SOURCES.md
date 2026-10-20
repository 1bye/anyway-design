# Native Tahoe Open / Save panels

These are actual window captures of NSOpenPanel and NSSavePanel on this Mac
(macOS Tahoe 26.6.2), captured on 20 October 2026 at 2× display scale.
They are not reconstructions or images from Apple's website.

- `tahoe-open.png`: 1760 × 896 pixels, 880 × 448 logical points. List view,
  sidebar hidden, no grouping, Meeting notes.txt selected, inactive appearance.
- `tahoe-save.png`: 1760 × 896 pixels, expanded Save, same list and directory.
- `tahoe-save-compact.png`: 740 × 408 pixels, compact Save, Untitled.txt with
  the basename selected. The filename selection is inactive.

The native panels were opened using the small AppKit app preserved in
`apps/macos-lab/scripts/native-file-dialog-reference.swift`. The fixture at
`/private/tmp/Anyway-Panel-Files` contained only generated demo files:

```
Design resources/Read me.txt
Photos/Clouds.webp
Meeting notes.txt   (525 bytes)
Project brief.txt   (about 1 KB)
```

Clouds.webp came from the lab's existing public asset. Text files contained
demo text. No user documents were opened or saved. The app's completion handlers
only release the panel; they do not read selected files or write a save result.
The panels restrict file types to plain text and disable directory creation.
Personal sidebar locations were hidden before capture.

The list was set to List / Group by None. Its column widths are 460, 97, 115,
and 188 points, plus 10-point outer insets. Rows are 20 points; the list header
is 28 points and the footer is about 65 points. Date Added shows the fixture's
creation time (Today at 22:29), retained as a fixed label in the live baseline.
The list's .txt artwork reflects the Mac's installed application association;
the React component uses the package's generic native file-type artwork.

The comparison clips the upper 32 logical points of both Save captures to omit
the separate system window title bar. The live browser panel has no system
window title bar. It uses a 20-point frame radius around both comparisons.
Original links retain the full, unmodified captures, including any pointer or
macOS capture indicator. No captured content is used inside the React component.

To reproduce, prepare the demo directory above, compile the Swift source into
a small .app bundle with bundle identifier `design.anyway.panel-reference`,
and launch it on Tahoe. Its two buttons open the genuine system panels.
Choose the view/sidebar state described above and cancel after capture.
Relative dates, installed-app icons, display rasterization, and OS updates may
change the resulting pixels. The supplied script was compiled with swiftc and
both panels were opened and captured during this implementation.


## Columns added 20 October 2026

Two additional genuine NSOpenPanel/NSSavePanel captures use the same fixture
and AppKit reference app in Columns mode, with Design resources selected and
its Read me.txt child visible. They preserve inactive dark appearance.
Only the demo root and child columns are retained; unrelated filesystem
ancestors, the Save sidebar, and system chrome are outside these crops.

- `tahoe-open-columns.png`: 980 × 636 pixels (490 × 318 logical points),
  crop `(302, 128, 980, 636)` from a 1762 × 898 window capture.
- `tahoe-save-columns.png`: 980 × 430 pixels (490 × 215 logical points),
  crop `(780, 334, 980, 430)` from a 1760 × 896 window capture.

Crop coordinates are `(x, y, width, height)`, in physical pixels. ICC profiles
are preserved; no contents were repainted or reconstructed. The columns are
245 points wide, rows 22 points, with a 6-point initial top gap and 10-point
outer row insets. Open's files remain enabled; Save's nonselected filenames
are muted. The live panel is clipped to the same browser region. Original
links for these presets show the retained browser crops, not full windows.
The temporary full-window captures are not shipped in the repository.
No file was opened or saved while preparing these references.

# Native Tahoe Finder Get Info

Genuine Finder Get Info windows captured on macOS Tahoe 26.6.2 (25G83),
21 October 2026, using the native computer-use screenshot API at 2× density.
The three checked-in window PNGs are unaltered, including their ICC profiles.
No screenshot artwork is rendered inside the reusable inspector.

The source was a separate Finder window containing only this generated fixture:

```
/private/tmp/Anyway-Info-Reference/
  Clouds.webp
  Design resources/
  Notes.txt
```

Clouds.webp is a byte-for-byte copy of the existing lab image (46,482 bytes).
The empty folder can contain Finder's hidden metadata, hence its native
"for 1 item" size text. Notes.txt contains `Anyway Design\n\nGet Info demonstration.\n`.
Fixture timestamps were set to 12 October 2026 at 09:41. No user documents
were opened or modified. All fixture Finder and Get Info windows were closed
after capture. Existing Finder preferences were not changed.

| File | Physical pixels | CSS points | State |
| --- | --- | --- | --- |
| `tahoe-info-image.png` | 698 × 986 | 349 × 493 | Clouds.webp; General, More Info, Name & Extension expanded |
| `tahoe-info-folder.png` | 698 × 946 | 349 × 473 | Design resources; same sections; no Open with |
| `tahoe-info-preview.png` | 698 × 1370 | 349 × 685 | Clouds.webp; Preview also expanded |

The folder capture retains a small pointer highlight near the bottom section.
The comparison clips both window outlines to a 12-point radius and adds a
surrounding CSS shadow; the image bytes remain unchanged. Measurements include
a 32-point title bar, 48-point summary, 33-point tag box, 20-point disclosure
headers, 14-point metadata lines, and a 26-point filename field. General starts
at y=120, More Info at y=285, Name & Extension at y=332. The preview image has
16-point side insets and retains its source aspect ratio.

Native filename editing was checked on the generated image: Return commits
the full filename and selects its text. Escape does not close the inspector.
The fixture was restored to Clouds.webp before capture. The host accepts an
extension change without an additional confirmation under its current settings.
The React component exposes the caller's rename validation rather than changing
host file associations or preferences.

`clouds-icon.png` is a transparent 256 × 256 export on a 64-point canvas using
`NSWorkspace.icon(forFile:)` for that generated WebP fixture. It supplies the
small title/summary artwork via the public `file.icon` prop. Reproduce with:

```sh
xcrun swift packages/macos/scripts/export-info-icon.swift
```

The exporter requires the fixture and working Icon Services, and verifies
center visibility and corner transparency. The default folder art comes from
the package's existing native actual-folder export. Apple's ownership of native
artwork is unchanged.

Only these light single-file states are calibrated. Expanded Comments,
Open with, Sharing & Permissions, dark appearance, narrow layout, and other
file kinds are working first passes. Permission rows are read-only. Association,
tag, minimize, and zoom actions require caller callbacks. Browser font
rasterization, native vibrancy, small icon representations, and image color
management can still differ from native rendering.

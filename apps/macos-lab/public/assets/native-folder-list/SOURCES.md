# Native Tahoe folder hierarchy reference

`tahoe-expanded.jpg` and `tahoe-collapsed.jpg` are actual Finder window captures
from macOS Tahoe 26.6.2 (25G83), recorded on 20 October 2026 through the native
computer-use screenshot API. Each original is 1840 × 1380 pixels at 2× density
(920 × 690 logical pixels). The study displays source rectangle x=0, y=176,
width=1840, height=696. The sidebar is hidden; only generated demo files and
locations are present. Apple's ownership of native interface artwork is unchanged.

The temporary fixture was `/private/tmp/Anyway-Folder-Reference`:

```text
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

Text files contain repeated original demonstration text, approximately 1 KB each.
`Clouds.webp` is a byte-identical copy of the lab's existing `clouds.webp`.
Timestamps were set to 12 October 2026 at 09:41 local time. No user documents
were opened, renamed, or included. The temporary Finder window was closed
when capture and behavior checks were finished.

Finder is sorted by Name ascending. The expanded capture opens Design resources
and Brand, with Colors.txt selected. The collapsed capture selects Design
resources and hides its descendants. Brand's expansion state remains remembered
inside the closed parent, matching the observed reopen behavior.

Measurements: 15 logical pixels of indentation per depth, 20px rows, 28px
headers, a 5px gap before the first row, and 10px side insets. Name / Date Modified /
Size / Kind widths are 500.5 / 181.5 / 96.5 / 121.5 logical pixels, as in the
existing list comparison. Row colors and striping share its native dark baseline.
The source capture is retained unmodified; the comparison crops it through CSS.

Native keyboard checks: Right expands in place and does not select the first
child when pressed again; Left on a file selects its parent. Clicking a parent's
disclosure to collapse a selected descendant clears that hidden selection.
Recursive Option expansion and native expansion animation timing were not
calibrated. Installed-app text-file icons in Finder differ from the React side's
shared generic native type icons; no captured rows or text are used in React.

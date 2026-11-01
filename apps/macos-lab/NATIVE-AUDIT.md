# Tahoe visual audit — 1 November 2026

All 43 catalog entries were opened and inspected in light and dark appearances.
The existing comparison pages were checked against their AppKit captures or
Apple images, including selected focus states and open selection menus. This
is a visual regression audit, not certification that every state is pixel-identical.
Native fixture captures identify macOS Tahoe 26.6.2 (25G83).

## Fixed

- **Alert artwork:** the dark application-icon export was a faint placeholder.
  Both appearances now use the actual application artwork visible in the native
  window captures. Critical alerts retain their separate native composite.
- **Sidebar sizing:** Tahoe defaults overrode compact reference row and icon
  sizes. Defaults now allow local density overrides; icon slots respect their
  flex basis. The reference's Applications and Documents labels fit again.
- **New Folder:** inactive keyboard focus removed the field's only outline.
  Preserve its neutral outline while suppressing the active focus ring.
- **Folder artwork:** grid/list/columns/dialogs used the generic UTType folder,
  while Gallery used the actual-folder icon. They now share the existing native
  actual-folder export, matching the captured Finder folder shape.
- **Image artwork:** `NSWorkspace.icon(for: .image)` returned an almost transparent
  dashed placeholder. Use concrete JPEG artwork from AppKit for the generic image
  fallback. Export validation now requires opaque pixels, not merely nonzero alpha.
- **Segmented controls:** intrinsic equal-width flex segments truncated longer
  labels. Grid tracks now size intrinsic controls to the longest label and retain
  equal segment widths when the caller supplies a width. Explicit 176-point native
  fixtures and the intrinsic playground example were checked after this change.
- **Notification actions:** the Options menu ended at its trigger's right edge;
  Apple's captured menu extends about 20 points farther right. Match that offset
  while retaining the positioner's collision handling.

## Coverage

Every row includes a light/dark playground inspection. Reference names resolve as
`/macos-lab/index.html?view=<name>-reference` on the Platform development server.
Their source is in `src/<name>-reference.tsx`; native asset directories include
`SOURCES.md` with capture methods and limitations.

| Entry | Reference | Checked / remaining qualification |
| --- | --- | --- |
| Desktop | desktop | Window frames, active/inactive stacking; native PNGs flatten corners/shadows. Drag timing is not calibrated. |
| Settings | User-provided native Settings screenshots; system exports | General layout, sidebar and color/monochrome assets. Fresh automated native capture returned a Stage Manager thumbnail and was rejected. |
| Dock | dock | Resting icons, spacing, glass, tooltip styles; magnification settling still needs a direct recording. |
| Window | window | Full chrome, toolbar, sidebar, tabs and file content; fixed sidebar density regression. |
| Finder | finder-actions, finder-drag, window | Shared chrome and file actions; drag motion remains an approximation. |
| Traffic lights | window; user-provided Settings screenshot | Sizes, spacing, native colors and masks. |
| Toolbar | window | Native symbol masks, groups and spacing. |
| Sidebar | window | Row heights, icon slots, selected row and label clipping. |
| Tabs | window | Selected/resting shape and crowded example; exact drag settling not measured here. |
| Menu bar | menu; native symbol exports | Default and dark preview; status panels lack a complete matched native capture set. |
| Notification Center | notification-center | Card/widget shell and reminder variant. Demo widget content, clock font and wallpaper alignment differ from Apple's image. Dark state lacks a matching native capture. |
| Pop-up menu | menu | Menu geometry, symbols, separators and shortcuts. |
| Context menu | menu | Shared popup surface and item geometry. |
| Popover | popover | All four arrow sides; light/dark resting surfaces. Native focus can differ from the unfocused React example. |
| Alert | alert | Save, information, warning, critical and sheet variants; repaired dark artwork. |
| Button | controls | Regular/small, pressed and disabled in the inactive native fixture. Active hover is not calibrated by that fixture. |
| Text field | text-fields | Regular/small, filled, password, read-only, disabled and captured focus preset. |
| Search field | text-fields | Regular/small, filled, clear button, read-only, disabled and focus preset. |
| Checkbox | input-controls | Unchecked, checked, mixed and disabled; keyboard Space checked in browser. |
| Radio group | input-controls | Selected, unselected and disabled. |
| Switch | toggle-controls | Regular/small, on/off, disabled and captured focus preset. |
| Slider | input-controls | Plain/ticked tracks, thumb positions and covered-tick behavior. Native drag timing is not calibrated. |
| Stepper | input-controls | Enabled, maximum and disabled; hold repeat uses Base UI timing. |
| Segmented control | toggle-controls | Text/icon, regular/small, disabled and focus; verified equal widths and intrinsic label fit. |
| Pop-up button | selection-controls | Closed and open selected-menu fixture; regular/small and disabled. |
| Combo box | selection-controls | Closed and open list fixture; regular/small and disabled. |
| Date picker | date-picker | Date, time, datetime, regular/small, disabled and selected-segment preset. Native overlay attachment/repeat timing remain uncalibrated. |
| Calendar | date-picker | October 2026 grid, selected day, today and adjacent months. |
| Progress bar | progress | Empty, half, full, indeterminate sample and stopped. Animated phase is excluded from pixel conclusions. |
| Spinner | progress | Regular/small and stopped; no new timing fit. |
| File grid | window | Apple icon lineup, wrapped selection labels and spacing. |
| File list | file-list | Rows, columns, selected striping and headers in dark native fixture; wide canvas also inspected via the playground. |
| Expandable folders | folder-list | Nested rows and disclosure indentation in the expanded fixture. |
| Column view | file-columns | Selected ancestor columns, separators and child rows. |
| Gallery view | file-gallery | Preview, filmstrip and information layout. |
| Inline renaming | file-rename | Grid editor and extension selection; native inactive versus browser active selection explains highlight-color differences. |
| New Folder | new-folder | Captured inactive Open-dialog sheet; repaired field outline. |
| Open/Save dialogs | file-dialog | Default column fixture and full playground dialog; not every sheet/view permutation re-captured. |
| Quick Look | quick-look | Image preview, title controls and frame. Exact opening/closing motion not re-measured. |
| Get Info | file-info | General section, editable name field and disclosure rows. |
| File icons | System exports; window/file views | Corrected folder fallback and transparent image placeholder; type icons can depend on installed file associations. |
| File thumbnail | window | Live image/document rendering; document masks are a reusable approximation, not a Quick Look renderer. |
| Symbols | Native SF Symbol exports; window/menu | Native glyph masks load; actual Finder can use different optical sizes/weights by context. |

## Pixel comparison tool

`scripts/capture-native.mjs` records a full Retina browser capture and the two
selected DOM regions through the existing `cua_repl` tab handle. It waits for
network idle and records DPR, scale, source URLs and ancestor clipping bounds.
It does not alter the page. Use Shared zoom **1×**, matching content/state,
and a viewport large enough to contain both regions. Read the CUA CDP capability
documentation before first use. For a 2× native reference, use a 2× browser DPR.

Inside `cua_repl`, after obtaining the tab and selecting its comparison state:

```js
const { captureNativeComparison } = await import(
  'file:///Users/yuriihulyk/Documents/GitHub/anyway-design/apps/macos-lab/scripts/capture-native.mjs'
);
await captureNativeComparison(tab, '/private/tmp/tahoe-check/inputs', '.input-study-scene');
```

Then, from the repository root (requires Python and Pillow):

```sh
python3 apps/macos-lab/scripts/compare-native.py /private/tmp/tahoe-check/inputs.json --output /private/tmp/tahoe-check/inputs-diff
PYTHONDONTWRITEBYTECODE=1 python3 -W error -m unittest discover -s apps/macos-lab/scripts -p 'test_*.py'
```

Outputs: unscaled live/native crops, a 50% overlay, amplified difference image,
side-by-side image and diagnostic JSON metrics. Unequal sizes, incorrect DPR,
scaled regions, missing images and clipped scroll regions are rejected.
For wide references, choose a detail crop or deliberately compare matching visible
viewport regions; do not label those as a full-canvas comparison.

Metrics are not a fidelity percentage: background area can dominate the result,
JPEG noise and native font rasterization cause differences, and a screenshot
cannot establish interaction or animation fidelity. Don't auto-register, resize,
or erase mismatching pixels to obtain a better score. Reference screenshots stay
in the lab; production components remain live React/CSS/native icon artwork.

Audit captures and overlays for this run are in `/private/tmp/tahoe-audit`.

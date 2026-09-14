# Liquid browser regression review

Reviewed in the running app on 2026-09-10. These are browser walkthrough
results, not an automated Playwright suite.

## Passed

- Visually inspected the hero and all five playgrounds, including open surfaces.
- Followed the home, explore, and all five section navigation links.
- Switched all Preview/Code tabs and used all five Copy buttons; each reported
  successful copying. Checked syntax colors and contained code scrolling.
- Connected menu: duplicate, move to Team, move to Personal, archive.
- Action menu: duplicate and save for later.
- Status menu: In progress → To do → Done → In progress.
- Controls: keyboard extremes, reset, and direct numeric radius entry.
- Shortcuts: New idea, Search, reveal toggle, and global Command+Option+N with
  focus outside the playground. The shortcut did not fire in the search input.
- Nested menus: keyboard traversal through Design → Liquid → Components,
  selection, reopening, and Escape dismissal.
- Stacked menus: Manage access → Share with team and Project settings → Make private.
- Context menu: right-click and Shift+F10, duplicate, and updated target label.
- Selected nested destination survives switching to Code and back.
- Responsive screenshots at 320, 390, 768, and 1440 pixels; viewport restored
  afterward. No page overflow at 390 or 768 pixels after the grid fix.
- No browser errors or warnings in the final console inspection.

## Fixed during review

- Prevented animated label content from flex-shrinking and clipping.
- Constrained the page grid so its contents cannot widen the mobile viewport.
- Kept preview panels mounted so changing tabs preserves demo state.
- Styled the search input and keyboard focus indicators consistently.
- Made Project settings open a working privacy action.
- Shortened the selected nested destination to its leaf name so it fits small screens.

## Still requires device coverage

Native modifier-hold timing, pointer-hover opening, touch long-press, actual
clipboard contents, Windows shortcuts, and other browser engines were not
independently verified in this pass.

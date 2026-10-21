# Native alert artwork

Transparent 256 × 256 PNGs exported from this Mac's AppKit NSAlert image views
at 4×, macOS Tahoe 26.6.2 (25G83), 21 October 2026.

`application-{light,dark}.png` is the default application artwork of the local
reference app. `critical-{light,dark}.png` is the native critical composite with
the application badge. Informational and warning alerts use the same app icon.

Reproduce with `packages/macos/scripts/alert-reference.swift --validate` after
compilation; outputs are in `/private/tmp/anyway-alert-validation`.
Copy the `information-icon-0-*` and `critical-icon-0-*` images unchanged.
The component accepts replacement artwork through `icon`.
These are system assets, not generated artwork; Apple's ownership is unchanged.

# Native Tahoe date and time pickers

These four original window captures come from the local AppKit fixture in
`packages/macos/scripts/date-picker-reference.swift`, running on macOS
26.6.2 (25G83). They are genuine `NSDatePicker` controls, not illustrations
or browser-rendered references.

- `tahoe-date-normal-{light,dark}.jpg`: no first responder.
- `tahoe-date-focus-{light,dark}.jpg`: the regular date picker's month segment selected.

Each JPEG is the unaltered 1360 × 1200 screenshot returned by the native
window-capture tool, including its ICC profile. The source window has a
680 × 568-point content area and a 32-point title bar. The comparison clips
the title bar and selects detail crops with CSS; it does not rewrite the images.

The fixture uses public AppKit APIs: `.textFieldAndStepper`,
`.clockAndCalendar`, `.yearMonthDay`, `.hourMinute`, `.single`,
`.regular`, `.small`, `locale`, `calendar`, `timeZone`, and
`presentsCalendarOverlay`. The Gregorian calendar is Sunday-first, locale
is `en_US`, and the fixed date is `2026-10-20T14:35:00Z`. The native calendar
marks the capture date, October 21, 2026, as today. The live reference canvas
holds this same today marker; reusable controls use the local current date.

`metrics.json` records the control frames and values for every captured state:

| Picker | Regular frame | Small frame |
| --- | --- | --- |
| Date | 96.5 × 26 pt | 84 × 22 pt |
| Time | 81.5 × 26 pt | 71 × 22 pt |
| Date and time | 160 × 26 pt | 139 × 22 pt |
| Calendar | 138.5 × 148 pt | — |

Control origins are x = 168 / 410 points and y = 80 / 124 / 168 / 212 points.
The calendar starts at (168, 280). The native view frame includes optical
margins; it is not a claim that every painted field fills that entire frame.

Regenerate by compiling the fixture into a local `.app`, launching it,
selecting Light/Dark and Normal/Date focus in its Reference menu, and
capturing the window. `--validate` constructs all nine controls and asserts
their initial dates, disabled counts, and nonzero dimensions. The running
fixture writes its own metrics to `/private/tmp/anyway-date-picker-metrics`.

The comparison calibrates resting fields, selected month text, disabled
fields, and the inline calendar. Calendar overlay attachment geometry,
stepper hold-repeat timing, and non-Gregorian/other-locale layouts are not
calibrated in this pass. The native app only changes its own fixture state.

References: [Apple NSDatePicker](https://developer.apple.com/documentation/appkit/nsdatepicker),
[WAI-ARIA calendar keyboard pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).

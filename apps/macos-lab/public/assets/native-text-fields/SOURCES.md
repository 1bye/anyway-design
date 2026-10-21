# Native Tahoe text and search fields

Captured locally on macOS Tahoe 26.6.2 (25G83), 21 October 2026, with
`packages/macos/scripts/text-fields-reference.swift`. The fixture uses public
AppKit `NSTextField`, `NSSecureTextField`, and `NSSearchField` views. It reads
no personal files or settings. All contents, including masked text, are fixed
demo strings. Reference → Light/Dark changes only the fixture appearance.

The six `tahoe-fields-{normal,text,search}-{light,dark}.jpg` files are unmodified
1264 × 1064-pixel full-window computer-use captures. The host content is
632 × 500pt with a 32pt title bar, clipped only in the lab's CSS. Original
screen-sharing and pointer artwork is retained. Component artwork never uses
the screenshots; search/cancel symbols come from the existing native exports.

Columns start at x=176 and 392. Every control is 176pt wide. Rows start at
y=72, 112, 152, 192, 232, 296, 336, 376, and 416: empty, filled, password,
read-only, disabled, empty search, filled search, disabled search, read-only
search. `sizeToFit()` supplies the native heights before width is assigned.
Text uses the native regular system font at 13pt / 11pt.

| Control | Regular height | Small height | Native cell drawing inset |
| --- | --- | --- | --- |
| Text / secure field | 24pt | 22pt | (4, 4), 16pt / 14pt text height |
| Search field | 24pt | 20pt | (22, 4) / (15.5, 3), before text-cell padding |

All fields use the rounded bezel. Their visible native bezel extends slightly
outside the view frame. Disabled values retain their background with a muted
foreground. Read-only fields remain selectable; filled read-only searches
retain cancel artwork without exposing an actionable button. Search history
is disabled, and `sendsWholeSearchString` is true. Normal clears first responder;
Text/Search focus targets the empty regular-size field. Caret phase is not
normalized. The light and dark focus materials differ.

`metrics.json` records each native view's actual frame, font size, enabled and
editable flags, and public cell drawing/search/cancel/text rectangles for
every capture. Cell rectangles describe layout, not exact visible glyph ink.

To validate the fixture:

```sh
xcrun swiftc -module-cache-path /private/tmp/anyway-swift-module-cache \
  packages/macos/scripts/text-fields-reference.swift -o /private/tmp/anyway-text-fields-reference
/private/tmp/anyway-text-fields-reference --validate
```

For live captures, bundle the executable in a temporary `.app` with
`CFBundleExecutable=TextFieldsReference`, identifier
`dev.anyway.text-fields-reference`, and `NSHighResolutionCapable=true`.
Activate it, select appearance and focus through Reference, then capture the
window. Its own metrics recorder writes to `/private/tmp/anyway-text-fields-metrics`.
Validation checks 18 controls, including eight search fields, four disabled
and four read-only fields, and positive native heights.

[Apple NSTextField](https://developer.apple.com/documentation/appkit/nstextfield)
documents editable/selectable fields and rounded bezels.
[Apple NSSearchField](https://developer.apple.com/documentation/appkit/nssearchfield)
documents the search control, and
[sendsSearchStringImmediately](https://developer.apple.com/documentation/appkit/nssearchfield/sendssearchstringimmediately)
describes dispatch options. The browser API leaves debouncing to the caller.
Native caret/selection rendering, font rasterization, non-Mac font fallbacks,
and Sequoia are not separately calibrated. Apple retains ownership of native
reference artwork.

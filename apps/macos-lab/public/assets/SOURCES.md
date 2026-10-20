# Example assets

- `clouds.webp`: copied from `taada/website/public/images/clouds-1920.webp`,
  the photograph already used in the user's Taada desktop preview.
- `finder.webp`, `safari.webp`, `mail.webp`, `downloads.webp`, `trash.webp`:
  copied unchanged from `taada/website/public/images/dock/`.
- `tada-icon.webp`: copied from `taada/website/public/images/tada-icon.webp`.

These are local demonstration assets, not assets exported by the component
package. Their original ownership and usage terms remain unchanged.
The standard Sequoia and Tahoe playgrounds share this icon set.

## Tahoe reference study

- `apple-tahoe-reference.jpg`: unmodified 3840 × 2560 image from
  [Apple's WWDC25 media download](https://www.apple.com/newsroom/images/2025/06/macos-tahoe-26-makes-the-mac-more-capable-productive-and-intelligent-than-ever/article/Apple-WWDC25-macOS-Tahoe-26-Apple-Music-250609.zip).
  Apple's accompanying notice is retained as `apple-media-notice.rtf`.
- `tahoe-light.jpg`: unmodified 6016 × 6016 Apple wallpaper, obtained from
  [iClarified's developer-beta wallpaper extraction](https://www.iclarified.com/97556/download-the-official-macos-tahoe-26-wallpaper-here).
  [Original image](https://www.iclarified.com/images/news/97556/465557/465557.jpg).

The comparison uses SVG viewports and silhouette clips to display the 24 icon
samples from Apple's photograph. These are static reference artwork, not
standalone transparent system icons: translucency within each icon is baked
into the source. The glass, spacing, separator, running indicators, focus, and
activation behavior are rendered by the React Dock. No photographed Dock
surface is used behind the live icons. These assets remain local study
fixtures and are not exported by the component package.

Geist in `../fonts/` is copied from the existing planning app; its license
is included alongside it.

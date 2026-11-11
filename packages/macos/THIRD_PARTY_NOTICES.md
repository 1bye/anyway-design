# Third-party artwork

The MIT license applies to original Anyway code and documentation. Apple
artwork retains its original ownership and terms and is not relicensed under MIT.

The component build embeds PNGs exported from macOS Tahoe 26.6.2 (25G83):

- `native-symbols`: AppKit system-symbol masks, selected private symbol catalog
  artwork, and Quick Look controls exported from QuickLookUI.framework.
- `native-file-icons`: generic file-type icons and a folder image exported
  through NSWorkspace/Icon Services.
- `native-alerts`: application and critical-alert artwork exported from NSAlert.

The original export records, manifests, and source notes are included in
`dist/asset-notices/`. The exports were made for the local prototype. Their source
notes do not establish permission to redistribute this artwork in a public npm
package. Attribution alone does not resolve that release prerequisite.

Before public publication, confirm redistribution rights or replace the affected
artwork. This local release candidate is not an independently licensed icon set
and does not imply Apple endorsement.

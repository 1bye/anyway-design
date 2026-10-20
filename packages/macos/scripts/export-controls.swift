import AppKit

// Native baseline: an inactive offscreen window; active accent/focus need separate capture.
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
  .deletingLastPathComponent().deletingLastPathComponent()
let output = root.appendingPathComponent("apps/macos-lab/public/assets/native-controls")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

final class ReferencePane: NSView {
  override var isFlipped: Bool { true }
  override func draw(_ dirtyRect: NSRect) {
    NSColor.windowBackgroundColor.setFill()
    bounds.fill()
  }
}

let width: CGFloat = 584
let height: CGFloat = 380
let density: CGFloat = 2
let rowTops: [CGFloat] = [74, 120, 164, 226, 282]
let states = ["Normal", "Pressed / filled", "Disabled"]
let rows = ["Button", "Primary button", "Small button", "Text field", "Search field"]

func label(
  _ text: String, x: CGFloat, y: CGFloat, width: CGFloat, in pane: NSView, bold: Bool = false
) {
  let view = NSTextField(labelWithString: text)
  view.font = .systemFont(ofSize: 11, weight: bold ? .semibold : .regular)
  view.textColor = .secondaryLabelColor
  view.frame = NSRect(x: x, y: y, width: width, height: 16)
  pane.addSubview(view)
}

for (name, appearanceName) in [("light", NSAppearance.Name.aqua), ("dark", .darkAqua)] {
  guard let appearance = NSAppearance(named: appearanceName) else {
    throw CocoaError(.coderInvalidValue)
  }
  let window = NSWindow(
    contentRect: NSRect(x: 0, y: 0, width: width, height: height), styleMask: [.titled],
    backing: .buffered, defer: false)
  window.isReleasedWhenClosed = false
  window.appearance = appearance
  let pane = ReferencePane(frame: NSRect(x: 0, y: 0, width: width, height: height))
  pane.appearance = appearance
  window.contentView = pane
  appearance.performAsCurrentDrawingAppearance {
    label("TAHOE / NATIVE APPKIT", x: 24, y: 20, width: 230, in: pane, bold: true)
    for (column, state) in states.enumerated() {
      label(state, x: 168 + CGFloat(column) * 136, y: 48, width: 128, in: pane)
    }
    for (row, title) in rows.enumerated() {
      label(title, x: 24, y: rowTops[row] + 5, width: 134, in: pane)
      for column in 0..<3 {
        let x = 168 + CGFloat(column) * 136
        let y = rowTops[row]
        if row < 3 {
          let button = NSButton(title: row == 1 ? "Continue" : "Cancel", target: nil, action: nil)
          button.bezelStyle = .rounded
          button.borderShape = .capsule
          button.controlSize = row == 2 ? .small : .regular
          button.font = .systemFont(ofSize: row == 2 ? 11 : 13)
          button.keyEquivalent = row == 1 ? "\r" : ""
          if row == 1 { button.bezelColor = .systemBlue }
          button.isEnabled = column != 2
          button.cell?.isHighlighted = column == 1
          button.frame = NSRect(x: x, y: y, width: 112, height: row == 2 ? 24 : 32)
          pane.addSubview(button)
        } else {
          let field: NSTextField = row == 4 ? NSSearchField() : NSTextField()
          field.font = .systemFont(ofSize: 13)
          field.isBezeled = true
          field.bezelStyle = .roundedBezel
          field.isEditable = true
          field.isEnabled = column != 2
          field.placeholderString = row == 4 ? "Search" : "Project name"
          field.stringValue = (column == 1) ? "Tahoe" : ""
          field.frame = NSRect(x: x, y: y, width: 120, height: 24)
          pane.addSubview(field)
        }
      }
    }
    pane.layoutSubtreeIfNeeded()
  }
  guard
    let bitmap = NSBitmapImageRep(
      bitmapDataPlanes: nil, pixelsWide: Int(width * density), pixelsHigh: Int(height * density),
      bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
      colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)
  else { throw CocoaError(.fileWriteUnknown) }
  bitmap.size = NSSize(width: width, height: height)
  appearance.performAsCurrentDrawingAppearance { pane.cacheDisplay(in: pane.bounds, to: bitmap) }
  guard bitmap.pixelsWide == 1168, bitmap.pixelsHigh == 760,
    let png = bitmap.representation(using: .png, properties: [:]), png.count > 10000,
    NSBitmapImageRep(data: png) != nil
  else { throw CocoaError(.fileWriteUnknown) }
  try png.write(to: output.appendingPathComponent("tahoe-controls-\(name).png"), options: .atomic)
  window.close()
}
let metadata: [String: Any] = [
  "system": ProcessInfo.processInfo.operatingSystemVersionString, "logicalWidth": width,
  "logicalHeight": height, "density": density, "states": states, "rowTops": rowTops,
  "rendering":
    "NSView.cacheDisplay; explicit NSCell highlighted state; inactive offscreen NSWindow; capsule borderShape",
]
try JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted, .sortedKeys]).write(
  to: output.appendingPathComponent("manifest.json"), options: .atomic)
print(
  "Exported light/dark native control references at 2× from \(ProcessInfo.processInfo.operatingSystemVersionString)."
)

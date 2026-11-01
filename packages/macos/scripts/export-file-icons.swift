import AppKit
import UniformTypeIdentifiers

// Export generic type artwork only; no user files are read.
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let package = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
  .deletingLastPathComponent()
let output =
  CommandLine.arguments.dropFirst().first.map { URL(fileURLWithPath: $0) }
  ?? package.appendingPathComponent("src/assets/native-file-icons")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let types: [(String, UTType)] = [
  ("folder", .folder), ("document", .data), ("pdf", .pdf),
  // The abstract .image type returns a dashed placeholder, not file artwork.
  ("image", .jpeg), ("archive", .zip), ("text", .plainText),
]
let pixels = 256
var entries: [[String: String]] = []
for (name, type) in types {
  let image = NSWorkspace.shared.icon(for: type)
  guard
    let bitmap = NSBitmapImageRep(
      bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels,
      bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
      colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
    ), let context = NSGraphicsContext(bitmapImageRep: bitmap)
  else {
    throw CocoaError(.fileWriteUnknown)
  }
  bitmap.size = NSSize(width: 64, height: 64)
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = context
  context.cgContext.scaleBy(x: 4, y: 4)
  context.imageInterpolation = .high
  image.draw(
    in: NSRect(x: 0, y: 0, width: 64, height: 64), from: .zero,
    operation: .sourceOver, fraction: 1)
  NSGraphicsContext.restoreGraphicsState()
  guard let data = bitmap.bitmapData else { throw CocoaError(.fileReadCorruptFile) }
  var opaque = 0
  var transparent = 0
  for y in 0..<pixels {
    for x in 0..<pixels {
      let alpha = data[y * bitmap.bytesPerRow + x * 4 + 3]
      if alpha > 200 { opaque += 1 }
      if alpha == 0 { transparent += 1 }
    }
  }
  guard opaque > 15000, transparent > 100,
    let png = bitmap.representation(using: .png, properties: [:]),
    let decoded = NSBitmapImageRep(data: png), decoded.pixelsWide == pixels,
    decoded.pixelsHigh == pixels
  else { throw CocoaError(.fileReadCorruptFile) }
  try png.write(to: output.appendingPathComponent("\(name).png"), options: .atomic)
  entries.append(["id": name, "type": type.identifier, "source": "NSWorkspace.icon(for:)"])
}
let metadata: [String: Any] = [
  "system": ProcessInfo.processInfo.operatingSystemVersionString,
  "pixels": pixels, "logicalSize": 64, "icons": entries,
]
try JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted, .sortedKeys])
  .write(to: output.appendingPathComponent("manifest.json"), options: .atomic)
print("Exported \(entries.count) native file icons with alpha and decode checks.")

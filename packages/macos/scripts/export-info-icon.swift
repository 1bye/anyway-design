import AppKit

// Extract the icon for our generated fixture; no user documents are read.
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let source = "/private/tmp/Anyway-Info-Reference/Clouds.webp"
guard FileManager.default.fileExists(atPath: source) else { throw CocoaError(.fileNoSuchFile) }
let image = NSWorkspace.shared.icon(forFile: source)
guard let bitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil, pixelsWide: 256, pixelsHigh: 256,
  bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
  colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
  throw CocoaError(.fileWriteUnknown)
}
bitmap.size = NSSize(width: 64, height: 64)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.cgContext.scaleBy(x: 4, y: 4)
context.imageInterpolation = .high
image.draw(in: NSRect(x: 0, y: 0, width: 64, height: 64))
NSGraphicsContext.restoreGraphicsState()
guard let png = bitmap.representation(using: .png, properties: [:]),
  let data = bitmap.bitmapData,
  data[128 * bitmap.bytesPerRow + 128 * 4 + 3] > 0, data[3] == 0
else { throw CocoaError(.fileReadCorruptFile) }
let output = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
  .deletingLastPathComponent().deletingLastPathComponent()
  .appendingPathComponent("apps/macos-lab/public/assets/native-file-info/clouds-icon.png")
try png.write(to: output, options: .atomic)
print("Exported a 256px fixture icon on \(ProcessInfo.processInfo.operatingSystemVersionString).")

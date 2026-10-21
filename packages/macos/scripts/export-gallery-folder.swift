import AppKit

// A large actual-folder icon, exported separately from the existing 64pt type icons.
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let folder = FileManager.default.temporaryDirectory.appendingPathComponent("Anyway-Gallery-Icon-\(UUID().uuidString)")
try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: false)
defer { try? FileManager.default.removeItem(at: folder) }
let image = NSWorkspace.shared.icon(forFile: folder.path)
guard let bitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil, pixelsWide: 1024, pixelsHigh: 1024,
  bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
  colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
  throw CocoaError(.fileWriteUnknown)
}
bitmap.size = NSSize(width: 512, height: 512)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.cgContext.scaleBy(x: 2, y: 2)
context.imageInterpolation = .high
image.draw(in: NSRect(x: 0, y: 0, width: 512, height: 512))
NSGraphicsContext.restoreGraphicsState()
guard let png = bitmap.representation(using: .png, properties: [:]),
  let decoded = NSBitmapImageRep(data: png), decoded.pixelsWide == 1024, decoded.pixelsHigh == 1024,
  let data = bitmap.bitmapData,
  data[512 * bitmap.bytesPerRow + 512 * 4 + 3] > 0, data[3] == 0
else { throw CocoaError(.fileReadCorruptFile) }
let output = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
  .deletingLastPathComponent().appendingPathComponent("src/assets/native-file-icons/folder-preview.png")
try png.write(to: output, options: .atomic)
print("Exported and validated a 1024px native Gallery folder icon on \(ProcessInfo.processInfo.operatingSystemVersionString).")

import AppKit

// Export the native thumbnail artwork used by Tahoe's Appearance settings.
let source = "/System/Library/ExtensionKit/Extensions/Appearance.appex"
guard let bundle = Bundle(path: source) else { fatalError("Appearance settings is unavailable") }
let app = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let output = app.appendingPathComponent("public/assets/tahoe-settings")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let names = ["AppearanceAuto", "AppearanceLight", "AppearanceDark", "GlassClear", "GlassTinted"]
for name in names {
    guard let image = bundle.image(forResource: name),
          let bitmap = NSBitmapImageRep(
              bitmapDataPlanes: nil, pixelsWide: 134, pixelsHigh: 88, bitsPerSample: 8,
              samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
              colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
          ) else {
        fatalError("Unable to load native asset: \(name)")
    }
    bitmap.size = NSSize(width: 67, height: 44)
    guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
        fatalError("Unable to render native asset: \(name)")
    }
    NSAppearance(named: .aqua)?.performAsCurrentDrawingAppearance {
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = context
        image.draw(in: NSRect(x: 0, y: 0, width: 67, height: 44))
        NSGraphicsContext.restoreGraphicsState()
    }
    guard let png = bitmap.representation(using: .png, properties: [:]),
          bitmap.colorAt(x: 67, y: 44)?.alphaComponent ?? 0 > 0,
          NSBitmapImageRep(data: png)?.pixelsWide == 134 else {
        fatalError("Invalid native asset: \(name)")
    }
    try png.write(to: output.appendingPathComponent("\(name).png"), options: .atomic)
}
print("Exported and validated \(names.count) native Appearance assets from \(ProcessInfo.processInfo.operatingSystemVersionString).")

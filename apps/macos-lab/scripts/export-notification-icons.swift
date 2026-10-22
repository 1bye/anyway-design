import AppKit
import ImageIO
import UniformTypeIdentifiers

let output = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
    .deletingLastPathComponent().appendingPathComponent("public/assets/notification-icons")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
for name in ["Reminders", "Messages"] {
    let sourceURL = URL(fileURLWithPath: "/System/Applications/\(name).app/Contents/Resources/AppIcon.icns")
    guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
          let image = CGImageSourceCreateThumbnailAtIndex(source, 0, [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceThumbnailMaxPixelSize: 128
          ] as CFDictionary),
          let destination = CGImageDestinationCreateWithURL(
            output.appendingPathComponent("\(name.lowercased()).png") as CFURL,
            UTType.png.identifier as CFString, 1, nil
          ) else { throw CocoaError(.fileReadCorruptFile) }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { throw CocoaError(.fileWriteUnknown) }
}
guard let symbol = NSImage(systemSymbolName: "safari", accessibilityDescription: nil)?
    .withSymbolConfiguration(.init(pointSize: 48, weight: .regular)
        .applying(.init(paletteColors: [.white]))),
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 64, pixelsHigh: 64,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0),
    let context = NSGraphicsContext(bitmapImageRep: bitmap) else { throw CocoaError(.fileWriteUnknown) }
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
symbol.draw(in: NSRect(x: 0, y: 0, width: 64, height: 64), from: .zero, operation: .sourceOver, fraction: 1)
NSGraphicsContext.restoreGraphicsState()
guard let png = bitmap.representation(using: .png, properties: [:]) else { throw CocoaError(.fileWriteUnknown) }
try png.write(to: output.appendingPathComponent("safari-symbol.png"), options: .atomic)
print("Exported 2 AppIcon.icns assets and Safari symbol on \(ProcessInfo.processInfo.operatingSystemVersionString).")

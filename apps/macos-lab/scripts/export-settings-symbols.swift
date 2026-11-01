import AppKit

// Native SF Symbols used by the System Settings example; retain the system's glyph proportions.
let symbols: [String: String] = [
    "wifi": "wifi", "bluetooth": "bluetooth", "network": "network", "vpn": "globe.desk",
    "battery": "battery.100percent", "gear": "gear", "accessibility": "accessibility",
    "appearance": "circle.lefthalf.filled", "intelligence": "apple.intelligence", "desktop": "macwindow",
    "display": "sun.max", "control-center": "switch.2", "search": "magnifyingglass", "wallpaper": "photo.on.rectangle",
    "notifications": "bell.badge.fill", "speaker": "speaker.wave.2.fill", "focus": "moon.fill",
    "screen-time": "hourglass", "lock": "lock.fill", "privacy": "hand.raised.fill", "advanced": "slider.horizontal.3",
    "about": "laptopcomputer", "storage": "internaldrive.fill", "care": "apple.logo", "airdrop": "airdrop",
    "passwords": "key.horizontal", "date": "calendar.badge.clock", "language": "globe", "login": "list.bullet",
    "sharing": "figure.walk.diamond.fill", "startup": "externaldrive.fill", "time-machine": "clock.arrow.circlepath",
    "management": "checkmark.seal.fill"
]
let app = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let output = app.appendingPathComponent("public/assets/tahoe-settings/symbols")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
guard let privateGlyphs = Bundle(path: "/System/Library/PrivateFrameworks/SFSymbols.framework/Versions/A/Resources/CoreGlyphsPrivate.bundle") else { fatalError("Native Settings glyph resources are unavailable") }
for (id, name) in symbols.sorted(by: { $0.key < $1.key }) {
    guard let source = NSImage(systemSymbolName: name, accessibilityDescription: nil) ?? NSImage(symbolName: name, bundle: privateGlyphs, variableValue: 0),
          let image = source.withSymbolConfiguration(NSImage.SymbolConfiguration(pointSize: 18, weight: .regular).applying(.preferringMonochrome())),
          let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 80, pixelsHigh: 80, bitsPerSample: 8,
              samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else {
        fatalError("Unable to load Settings symbol: \(name)")
    }
    bitmap.size = NSSize(width: 20, height: 20)
    guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else { fatalError("Unable to render: \(name)") }
    let size = image.size
    let scale = 18 / max(size.width, size.height)
    let rect = NSRect(x: (20 - size.width * scale) / 2, y: (20 - size.height * scale) / 2,
                      width: size.width * scale, height: size.height * scale)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    image.draw(in: rect)
    NSColor.white.setFill()
    NSRect(x: 0, y: 0, width: 20, height: 20).fill(using: .sourceIn)
    NSGraphicsContext.restoreGraphicsState()
    guard let data = bitmap.bitmapData else { fatalError("Empty symbol: \(name)") }
    var minX = 80, minY = 80, maxX = -1, maxY = -1
    for y in 0..<80 {
        for x in 0..<80 where data[y * bitmap.bytesPerRow + x * 4 + 3] > 0 {
            minX = min(minX, x); minY = min(minY, y)
            maxX = max(maxX, x); maxY = max(maxY, y)
        }
    }
    guard maxX >= minX, maxY >= minY,
          let cropped = bitmap.cgImage?.cropping(to: CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)),
          let target = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 160, pixelsHigh: 160, bitsPerSample: 8,
              samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else {
        fatalError("Unable to fit native symbol: \(name)")
    }
    target.size = NSSize(width: 20, height: 20)
    guard let targetContext = NSGraphicsContext(bitmapImageRep: target) else { fatalError("Unable to render: \(name)") }
    let fit = 16 / CGFloat(max(cropped.width, cropped.height))
    let width = CGFloat(cropped.width) * fit, height = CGFloat(cropped.height) * fit
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = targetContext
    targetContext.imageInterpolation = .high
    NSImage(cgImage: cropped, size: NSSize(width: cropped.width, height: cropped.height))
        .draw(in: NSRect(x: (20 - width) / 2, y: (20 - height) / 2, width: width, height: height))
    NSGraphicsContext.restoreGraphicsState()
    guard let png = target.representation(using: .png, properties: [:]),
          NSBitmapImageRep(data: png)?.pixelsWide == 160 else { fatalError("Invalid symbol: \(name)") }
    try png.write(to: output.appendingPathComponent("\(id).png"), options: .atomic)
}
print("Exported \(symbols.count) native Settings glyphs from \(ProcessInfo.processInfo.operatingSystemVersionString).")

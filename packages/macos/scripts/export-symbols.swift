import AppKit

// Run from any directory: xcrun swift packages/macos/scripts/export-symbols.swift
struct Symbol {
    let id: String
    let name: String
    var extent: CGFloat = 14
    var weight: NSFont.Weight = .regular
    var privateGlyph = false
    var resourceBundle: String? = nil
}

let quickLookBundle = "/System/Library/Frameworks/QuickLookUI.framework"

let symbols: [Symbol] = [
    .init(id: "alias", name: "square.dashed.and.alias", extent: 12.5, privateGlyph: true),
    .init(id: "applications", name: "appstore", extent: 13.5, weight: .medium, privateGlyph: true),
    .init(id: "archive", name: "zipper.page", extent: 12.5),
    .init(id: "check", name: "checkmark", extent: 12),
    .init(id: "chevron-down", name: "chevron.down", extent: 12, weight: .bold),
    .init(id: "chevron-left", name: "chevron.left", extent: 12, weight: .medium),
    .init(id: "chevron-right", name: "chevron.right", extent: 12, weight: .medium),
    .init(id: "chevron-up-down", name: "chevron.up.chevron.down", extent: 12, weight: .semibold),
    .init(id: "close", name: "xmark", extent: 10),
    .init(id: "cloud", name: "icloud"),
    .init(id: "copy", name: "doc.on.doc"),
    .init(id: "desktop", name: "menubar.dock.rectangle", extent: 14.5, weight: .medium),
    .init(id: "document", name: "doc", weight: .medium),
    .init(id: "downloads", name: "arrow.down.circle", extent: 13, weight: .medium),
    .init(id: "duplicate", name: "plus.square.on.square", extent: 12.5),
    .init(id: "ellipsis", name: "ellipsis", extent: 12),
    .init(id: "eye", name: "eye", extent: 16),
    .init(id: "favorites", name: "star"),
    .init(id: "group", name: "square.grid.3x1.below.line.grid.1x2"),
    .init(id: "icon-view", name: "square.grid.2x2", extent: 13),
    .init(id: "info", name: "info.circle", extent: 12.5),
    .init(id: "list-view", name: "list.bullet"),
    .init(id: "markup", name: "pencil.tip.crop.circle", extent: 13),
    .init(id: "open", name: "arrow.up.forward.app", extent: 11.5),
    .init(id: "plus", name: "plus", extent: 12),
    .init(id: "quick-look-close", name: "close", extent: 12, resourceBundle: quickLookBundle),
    .init(id: "quick-look-fullscreen", name: "fullscreen", extent: 12, resourceBundle: quickLookBundle),
    .init(id: "recents", name: "clock", extent: 13, weight: .medium),
    .init(id: "rename", name: "pencil", extent: 10.5),
    .init(id: "search", name: "magnifyingglass"),
    .init(id: "search-clear", name: "xmark.circle.fill", extent: 14),
    .init(id: "settings", name: "slider.horizontal.3"),
    .init(id: "share", name: "square.and.arrow.up", extent: 15),
    .init(id: "shared", name: "folder.badge.person.crop", extent: 16, weight: .medium),
    .init(id: "tag", name: "tag", extent: 15),
    .init(id: "trash", name: "trash"),
]

let canvas: CGFloat = 16
let density: CGFloat = 4
let package = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let output = package.appendingPathComponent("src/assets/native-symbols")
let privateGlyphs = "/System/Library/PrivateFrameworks/SFSymbols.framework/Versions/A/Resources/CoreGlyphsPrivate.bundle"

func bitmap(points: CGFloat) throws -> NSBitmapImageRep {
    guard let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: Int(points * density), pixelsHigh: Int(points * density),
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
    ) else { throw CocoaError(.fileWriteUnknown) }
    bitmap.size = NSSize(width: points, height: points)
    return bitmap
}

func draw(_ image: NSImage, in rect: NSRect, on bitmap: NSBitmapImageRep) throws {
    guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
        throw CocoaError(.fileWriteUnknown)
    }
    NSGraphicsContext.saveGraphicsState()
    defer { NSGraphicsContext.restoreGraphicsState() }
    NSGraphicsContext.current = context
    context.imageInterpolation = .high
    image.draw(in: rect, from: .zero, operation: .sourceOver, fraction: 1)
}

// Alpha bounds avoid stretching wide symbols or retaining AppKit's layout padding.
func alphaBounds(_ bitmap: NSBitmapImageRep) throws -> CGRect {
    guard let data = bitmap.bitmapData else { throw CocoaError(.fileReadCorruptFile) }
    var minX = bitmap.pixelsWide, minY = bitmap.pixelsHigh, maxX = -1, maxY = -1
    for y in 0..<bitmap.pixelsHigh {
        for x in 0..<bitmap.pixelsWide where data[y * bitmap.bytesPerRow + x * 4 + 3] > 0 {
            minX = min(minX, x); minY = min(minY, y)
            maxX = max(maxX, x); maxY = max(maxY, y)
        }
    }
    guard maxX >= minX, maxY >= minY else { throw CocoaError(.fileReadCorruptFile) }
    return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
}

func export(_ symbol: Symbol) throws -> [String: Any] {
    let source: String
    let raw: NSImage?
    if let path = symbol.resourceBundle {
        source = "\(path)/\(symbol.name)"
        guard let bundle = Bundle(path: path) else { throw CocoaError(.fileNoSuchFile) }
        raw = bundle.image(forResource: symbol.name)
    } else if symbol.privateGlyph {
        source = "\(privateGlyphs)/\(symbol.name)"
        guard let bundle = Bundle(path: privateGlyphs) else {
            throw CocoaError(.fileNoSuchFile)
        }
        raw = NSImage(symbolName: symbol.name, bundle: bundle, variableValue: 0)
    } else {
        source = "NSImage(systemSymbolName: \(symbol.name))"
        raw = NSImage(systemSymbolName: symbol.name, accessibilityDescription: nil)
    }
    let configuration = NSImage.SymbolConfiguration(pointSize: 16, weight: symbol.weight)
        .applying(symbol.id == "search-clear" ? .preferringMonochrome() : .init(paletteColors: [.black]))
    guard let image = symbol.resourceBundle == nil ? raw?.withSymbolConfiguration(configuration) : raw else {
        throw NSError(domain: "NativeSymbols", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "Unavailable native asset: \(source)"
        ])
    }
    let scratch = try bitmap(points: 64)
    try draw(image, in: NSRect(
        x: (64 - image.size.width) / 2, y: (64 - image.size.height) / 2,
        width: image.size.width, height: image.size.height
    ), on: scratch)
    let bounds = try alphaBounds(scratch)
    guard let cropped = scratch.cgImage?.cropping(to: bounds) else {
        throw CocoaError(.fileReadCorruptFile)
    }
    let fit = symbol.extent / max(bounds.width, bounds.height)
    let width = bounds.width * fit, height = bounds.height * fit
    let target = try bitmap(points: canvas)
    try draw(NSImage(cgImage: cropped, size: bounds.size), in: NSRect(
        x: (canvas - width) / 2, y: (canvas - height) / 2, width: width, height: height
    ), on: target)
    // Self-check every export: visible pixels, transparent corners, and expected dimensions.
    let actualBounds = try alphaBounds(target)
    // The clear symbol must retain the transparent X when used as an alpha mask.
    if ["search-clear", "quick-look-close"].contains(symbol.id) {
        guard target.colorAt(x: 32, y: 32)?.alphaComponent == 0,
              (target.colorAt(x: 32, y: 12)?.alphaComponent ?? 0) > 0 else { throw CocoaError(.fileWriteUnknown) }
    }
    guard target.pixelsWide == 64, target.pixelsHigh == 64,
          actualBounds.width > 4, actualBounds.height > 4,
          target.colorAt(x: 0, y: 0)?.alphaComponent == 0,
          let png = target.representation(using: .png, properties: [:]),
          NSBitmapImageRep(data: png) != nil else { throw CocoaError(.fileWriteUnknown) }
    try png.write(to: output.appendingPathComponent("\(symbol.id).png"), options: .atomic)
    return [
        "id": symbol.id, "source": source, "nativeName": symbol.name,
        "extent": symbol.extent, "pixelWidth": 64, "pixelHeight": 64,
        "pointSize": symbol.resourceBundle == nil ? 16 : 12,
        "weight": symbol.weight.rawValue, "rendering": symbol.resourceBundle == nil ? "monochrome" : "bundle artwork",
    ]
}

try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let records = try symbols.map(export)
let metadata: [String: Any] = [
    "system": ProcessInfo.processInfo.operatingSystemVersionString,
    "canvas": canvas, "density": density, "symbols": records,
]
try JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted, .sortedKeys])
    .write(to: output.appendingPathComponent("manifest.json"), options: .atomic)
let entries = symbols.map {
    "\t\"\($0.id)\": new URL(\"./assets/native-symbols/\($0.id).png\", import.meta.url).href,"
}.joined(separator: "\n")
let module = """
// Generated by scripts/export-symbols.swift from this Mac's native assets.
export const NATIVE_SYMBOLS = {
\(entries)
} as const;

"""
try module.write(to: package.appendingPathComponent("src/native-symbols.tsx"), atomically: true, encoding: .utf8)
print("Exported and validated \(symbols.count) native symbols at 4× from \(ProcessInfo.processInfo.operatingSystemVersionString).")

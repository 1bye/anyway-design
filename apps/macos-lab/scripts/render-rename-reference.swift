import AppKit

// Native control baseline, not a captured Finder rename window.
let output = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let _ = NSApplication.shared
let filename = "Agreement for Services.pdf"
let dimensions = NSSize(width: 460, height: 220)
let appearance = NSAppearance(named: .darkAqua)!

for multiline in [true, false] {
    let window = NSWindow(contentRect: NSRect(origin: .zero, size: dimensions), styleMask: .borderless, backing: .buffered, defer: false)
    window.appearance = appearance
    let root = NSView(frame: NSRect(origin: .zero, size: dimensions))
    root.wantsLayer = true
    root.layer?.backgroundColor = NSColor(calibratedRed: 36/255, green: 37/255, blue: 41/255, alpha: 1).cgColor
    window.contentView = root
    let icon = NSImageView(frame: multiline ? NSRect(x: 198, y: 87, width: 64, height: 64) : NSRect(x: 26, y: 102, width: 16, height: 16))
    icon.image = NSImage(contentsOfFile: "packages/macos/src/assets/native-file-icons/pdf.png")!
    icon.imageScaling = .scaleProportionallyUpOrDown
    root.addSubview(icon)
    let editor = NSTextField(frame: multiline ? NSRect(x: 174, y: 44, width: 112, height: 38) : NSRect(x: 46, y: 100, width: 365, height: 20))
    editor.stringValue = filename
    editor.font = NSFont.systemFont(ofSize: 13)
    editor.textColor = .labelColor
    editor.backgroundColor = .textBackgroundColor
    editor.isBezeled = true
    editor.bezelStyle = .squareBezel
    editor.focusRingType = .none
    editor.isEditable = true
    editor.isSelectable = true
    editor.alignment = multiline ? .center : .left
    editor.cell?.wraps = multiline
    editor.cell?.isScrollable = !multiline
    editor.cell?.usesSingleLineMode = !multiline
    root.addSubview(editor)
    window.makeFirstResponder(editor)
    editor.selectText(nil)
    let text = window.fieldEditor(true, for: editor) as! NSTextView
    text.setSelectedRange(NSRange(location: 0, length: (filename as NSString).deletingPathExtension.count))
    text.selectedTextAttributes = [.backgroundColor: NSColor.selectedTextBackgroundColor, .foregroundColor: NSColor.selectedTextColor]
    root.layoutSubtreeIfNeeded()
    root.displayIfNeeded()
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 920, pixelsHigh: 440, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    bitmap.size = dimensions
    root.cacheDisplay(in: root.bounds, to: bitmap)
    guard let png = bitmap.representation(using: .png, properties: [:]) else { fatalError("Native reference did not render") }
    try png.write(to: output.appendingPathComponent(multiline ? "tahoe-grid-editor.png" : "tahoe-list-editor.png"))
    precondition(bitmap.pixelsWide == 920 && bitmap.pixelsHigh == 440)
}
print("Rendered two native AppKit rename controls at 2×.")

import AppKit
import UniformTypeIdentifiers

// Ask IconServices for the complete icon declared by each native Settings extension.
// Rendering needs access to the icon service; empty exports fail validation below.
let extensions = "/System/Library/ExtensionKit/Extensions"
let sources: [String: String] = [
    "wifi": "Wi-Fi", "bluetooth": "Bluetooth", "network": "Network", "vpn": "VPN",
    "battery": "PowerPreferences", "accessibility": "AccessibilitySettingsExtension",
    "appearance": "Appearance", "intelligence": "SiriPreferenceExtension", "desktop": "DesktopSettings",
    "display": "DisplaysExt", "control-center": "ControlCenterSettings", "search": "SpotlightPreferenceExtension",
    "wallpaper": "Wallpaper", "notifications": "NotificationsSettings", "speaker": "Sound",
    "focus": "FocusSettingsExtension", "screen-time": "ScreenTimePreferencesExtension", "lock": "LockScreen",
    "privacy": "SecurityPrivacyExtension", "about": "AboutExtension", "storage": "Storage",
    "care": "CoverageSettings", "airdrop": "AirDropHandoffExtension", "date": "DateAndTime Extension",
    "language": "Localization", "login": "LoginItems", "sharing": "Sharing", "startup": "StartupDisk",
    "time-machine": "TimeMachineSettings", "management": "ProfilesSettingsExt",
    "software-update": "SoftwareUpdateSettingsExtension"
]
let app = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let output = app.appendingPathComponent("public/assets/tahoe-settings/icons")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
var paths = sources.mapValues { "\(extensions)/\($0).appex" }
paths["gear"] = "/System/Applications/System Settings.app/Contents/PlugIns/GeneralSettings.appex"
let personalities = [
    "intelligence": "com.apple.graphic-icon.intelligence",
    "battery": "com.apple.graphic-icon.battery",
    "vpn": "com.apple.graphic-icon.vpn"
]
for (name, path) in paths.sorted(by: { $0.key < $1.key }) {
    guard let bundle = Bundle(path: path) else { fatalError("Missing Settings extension: \(path)") }
    let image: NSImage
    if let identifier = personalities[name] {
        // These extensions declare sidebar personalities separately from their file icons.
        guard let type = UTType(identifier) else {
            fatalError("Native Settings icon type is unavailable: \(identifier)")
        }
        image = NSWorkspace.shared.icon(for: type)
    } else {
        image = NSWorkspace.shared.icon(forFile: path)
    }
    for (suffix, points) in [("", 24), ("-large", 64)] {
        let pixels = points * 2
        guard let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels,
                bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else {
            fatalError("Unable to create native icon bitmap: \(name)")
        }
        bitmap.size = NSSize(width: points, height: points)
        guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
            fatalError("Unable to render native icon: \(name)")
        }
        NSAppearance(named: .aqua)?.performAsCurrentDrawingAppearance {
            NSGraphicsContext.saveGraphicsState()
            NSGraphicsContext.current = context
            image.draw(in: NSRect(x: 0, y: 0, width: points, height: points))
            NSGraphicsContext.restoreGraphicsState()
        }
        guard let data = bitmap.bitmapData else { fatalError("Empty icon: \(name)") }
        var opaquePixels = 0
        for y in 0..<pixels {
            for x in 0..<pixels where data[y * bitmap.bytesPerRow + x * 4 + 3] > 0 {
                opaquePixels += 1
            }
        }
        guard opaquePixels > pixels * pixels / 4,
              let png = bitmap.representation(using: .png, properties: [:]),
              NSBitmapImageRep(data: png)?.pixelsWide == pixels else {
            fatalError("Invalid or empty native icon: \(name). Run with access to macOS IconServices.")
        }
        try png.write(to: output.appendingPathComponent("\(name)\(suffix).png"), options: .atomic)
    }
    print("\(name): \(bundle.bundleIdentifier ?? path)")
}
print("Exported \(paths.count) native Settings icons at sidebar and header sizes from \(ProcessInfo.processInfo.operatingSystemVersionString).")

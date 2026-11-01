import AppKit
import UniformTypeIdentifiers

// Ask IconServices for the complete icon declared by each native Settings extension.
// Rendering needs access to the icon service; empty exports fail validation below.
let extensions = "/System/Library/ExtensionKit/Extensions"
let sources: [String: String] = [
  "wifi": "Wi-Fi", "bluetooth": "Bluetooth", "network": "Network", "vpn": "VPN",
  "battery": "PowerPreferences", "accessibility": "AccessibilitySettingsExtension",
  "appearance": "Appearance", "intelligence": "SiriPreferenceExtension",
  "desktop": "DesktopSettings",
  "display": "DisplaysExt", "control-center": "ControlCenterSettings",
  "search": "SpotlightPreferenceExtension",
  "wallpaper": "Wallpaper", "notifications": "NotificationsSettings", "speaker": "Sound",
  "focus": "FocusSettingsExtension", "screen-time": "ScreenTimePreferencesExtension",
  "lock": "LockScreen",
  "privacy": "SecurityPrivacyExtension", "about": "AboutExtension", "storage": "Storage",
  "care": "CoverageSettings", "airdrop": "AirDropHandoffExtension", "date": "DateAndTime Extension",
  "language": "Localization", "login": "LoginItems", "sharing": "Sharing", "startup": "StartupDisk",
  "time-machine": "TimeMachineSettings", "management": "ProfilesSettingsExt",
  "software-update": "SoftwareUpdateSettingsExtension",
]
let app = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let output = app.appendingPathComponent("public/assets/tahoe-settings/icons")
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
var paths = sources.mapValues { "\(extensions)/\($0).appex" }
paths["gear"] = "/System/Applications/System Settings.app/Contents/PlugIns/GeneralSettings.appex"
let personalities = [
  "intelligence": "com.apple.graphic-icon.intelligence",
  "battery": "com.apple.graphic-icon.battery",
  "vpn": "com.apple.graphic-icon.vpn",
]
func exportImage(_ image: NSImage, points: Int, name: String, file: URL) throws {
  let pixels = points * 2
  guard
    let bitmap = NSBitmapImageRep(
      bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels,
      bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
      colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)
  else {
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
    NSBitmapImageRep(data: png)?.pixelsWide == pixels
  else {
    fatalError("Invalid or empty native icon: \(name). Run with access to macOS IconServices.")
  }
  try png.write(to: file, options: .atomic)
}

// Keep the checked-in monochrome snapshots independent of the exporter machine's theme.
// Use this flag only when deliberately capturing a replacement native theme.
if CommandLine.arguments.contains("--capture-current-style") {
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
      try exportImage(
        image, points: points, name: name,
        file: output.appendingPathComponent("\(name)\(suffix).png"))
    }
    print("\(name): \(bundle.bundleIdentifier ?? path)")
  }
  print("Captured \(paths.count) native icons in the current macOS theme.")

}

// Resolve the original enclosure and glyph colors from Apple's type declarations.
let coreTypes = Bundle(path: "/System/Library/CoreServices/CoreTypes.bundle")!
var declarations: [String: [String: Any]] = [:]
for key in ["UTExportedTypeDeclarations", "UTImportedTypeDeclarations"] {
  for entry in coreTypes.object(forInfoDictionaryKey: key) as? [[String: Any]] ?? [] {
    if let id = entry["UTTypeIdentifier"] as? String { declarations[id] = entry }
  }
}
func typeConfiguration(_ identifier: String) -> [String: Any]? {
  let icons = declarations[identifier]?["UTTypeIcons"] as? [String: Any]
  return icons?["ISGraphicIconConfiguration"] as? [String: Any]
}
let colorOutput = output.appendingPathComponent("color")
try FileManager.default.createDirectory(at: colorOutput, withIntermediateDirectories: true)
var jobs: [[String: Any]] = []
for (name, path) in paths.sorted(by: { $0.key < $1.key }) {
  let bundle = Bundle(path: path)!
  let asset: (Bundle, String)?
  switch name {
  case "intelligence": asset = (coreTypes, "AppleIntelligenceAppIcon")
  case "search": asset = (bundle, "AppIcon")
  case "time-machine": asset = (bundle, "TimeMachineSettingsIcon")
  default: asset = nil
  }
  var job: [String: Any] = ["name": name, "output": colorOutput.path]
  if let (owner, resource) = asset {
    guard let image = owner.image(forResource: resource) else {
      fatalError("Missing native color asset: \(name)")
    }
    for (suffix, points) in [("", 24), ("-large", 64)] {
      try exportImage(
        image, points: points, name: name,
        file: colorOutput.appendingPathComponent("\(name)\(suffix).png"))
    }
    continue
  }
  var configuration =
    (bundle.object(forInfoDictionaryKey: "CFBundleIcons") as? [String: Any])?[
      "ISGraphicIconConfiguration"] as? [String: Any]
  if let identifier = personalities[name] { configuration = typeConfiguration(identifier) }
  if let identifier = configuration?["ISTypeIdentifier"] as? String {
    configuration = typeConfiguration(identifier)
  }
  guard let configuration else { fatalError("Missing native color configuration: \(name)") }
  if configuration["ISSymbolName"] as? String == "ISCurrentDevice" {
    // The dynamic current-device icon is neutral gray in both appearances.
    for suffix in ["", "-large"] {
      let data = try Data(contentsOf: output.appendingPathComponent("\(name)\(suffix).png"))
      try data.write(
        to: colorOutput.appendingPathComponent("\(name)\(suffix).png"), options: .atomic)
    }
    continue
  }
  job["configuration"] = configuration
  jobs.append(job)
}
let temporary = FileManager.default.temporaryDirectory.appendingPathComponent(
  "settings-color-icons-\(UUID().uuidString)")
try FileManager.default.createDirectory(at: temporary, withIntermediateDirectories: true)
defer { try? FileManager.default.removeItem(at: temporary) }
let manifest = temporary.appendingPathComponent("jobs.json")
try JSONSerialization.data(withJSONObject: jobs, options: [.sortedKeys]).write(to: manifest)
func run(_ executable: String, _ arguments: [String]) throws {
  let process = Process()
  process.executableURL = URL(fileURLWithPath: executable)
  process.arguments = arguments
  try process.run()
  process.waitUntilExit()
  guard process.terminationStatus == 0 else {
    fatalError("Native color icon export failed: \(executable)")
  }
}
let renderer = temporary.appendingPathComponent("render-settings-icons")
try run(
  "/usr/bin/xcrun",
  [
    "clang", "-fobjc-arc", "-framework", "AppKit",
    app.appendingPathComponent("scripts/render-settings-color-icons.m").path, "-o", renderer.path,
  ])
try run(renderer.path, [manifest.path])
print(
  "Exported native color icons; retained the checked-in monochrome artwork without changing system appearance."
)

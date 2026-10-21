import AppKit

let canvasSize = NSSize(width: 632, height: 408)
let columns: [CGFloat] = [176, 384]
let rowTops: [CGFloat] = [72, 108, 144, 190, 232, 280, 326]
let rowLabels = ["Empty", "50% complete", "Complete", "Indeterminate", "Stopped bar", "Spinner", "Stopped spinner"]

final class ProgressPane: NSView {
  override var isFlipped: Bool { true }
  override func draw(_ dirtyRect: NSRect) {
    NSColor.windowBackgroundColor.setFill()
    bounds.fill()
  }
}

func caption(_ text: String, x: CGFloat, y: CGFloat, width: CGFloat, in pane: NSView, bold: Bool = false) {
  let label = NSTextField(labelWithString: text)
  label.font = .systemFont(ofSize: 11, weight: bold ? .semibold : .regular)
  label.textColor = .secondaryLabelColor
  label.frame = NSRect(x: x, y: y, width: width, height: 16)
  pane.addSubview(label)
}

func makePane() -> NSView {
  let pane = ProgressPane(frame: NSRect(origin: .zero, size: canvasSize))
  caption("TAHOE / NATIVE APPKIT", x: 24, y: 20, width: 280, in: pane, bold: true)
  for (column, title) in ["Regular", "Small"].enumerated() {
    caption(title, x: columns[column], y: 46, width: 176, in: pane)
  }
  for (row, title) in rowLabels.enumerated() {
    caption(title, x: 24, y: rowTops[row] + 8, width: 140, in: pane)
    for column in 0..<2 {
      let indicator = NSProgressIndicator(frame: NSRect(x: columns[column], y: rowTops[row], width: 176, height: 32))
      indicator.style = row < 5 ? .bar : .spinning
      indicator.controlSize = column == 0 ? .regular : .small
      indicator.isIndeterminate = row >= 3
      indicator.minValue = 0
      indicator.maxValue = 100
      indicator.doubleValue = row == 0 ? 0 : (row == 1 ? 50 : 100)
      indicator.isDisplayedWhenStopped = true
      indicator.sizeToFit()
      var frame = indicator.frame
      frame.origin.y = rowTops[row] + (32 - frame.height) / 2
      indicator.frame = frame
      indicator.setAccessibilityLabel("\(title): \(column == 0 ? "Regular" : "Small")")
      indicator.identifier = NSUserInterfaceItemIdentifier("row-\(row)-column-\(column)")
      pane.addSubview(indicator)
      if row == 3 || row == 5 { indicator.startAnimation(nil) }
      else { indicator.stopAnimation(nil) }
    }
  }
  caption("NSProgressIndicator · bar & spinning · regular & small", x: 24, y: 376, width: 580, in: pane)
  let indicators = pane.subviews.compactMap { $0 as? NSProgressIndicator }
  precondition(indicators.count == 14)
  precondition(indicators.filter { $0.style == .bar }.count == 10)
  precondition(indicators.filter { $0.isIndeterminate }.count == 8)
  precondition(indicators.allSatisfy { $0.frame.width > 0 && $0.frame.height > 0 && $0.minValue == 0 && $0.maxValue == 100 })
  return pane
}

func record(_ pane: NSView, dark: Bool) throws {
  let metadata: [String: Any] = [
    "system": ProcessInfo.processInfo.operatingSystemVersionString,
    "width": canvasSize.width, "height": canvasSize.height, "titlebar": 32,
    "indicators": pane.subviews.compactMap { $0 as? NSProgressIndicator }.map { item in
      return ["id": item.identifier?.rawValue ?? "", "x": item.frame.minX, "y": item.frame.minY,
        "width": item.frame.width, "height": item.frame.height, "indeterminate": item.isIndeterminate,
        "value": item.doubleValue, "style": item.style == .bar ? "bar" : "spinning",
        "size": item.controlSize == .regular ? "regular" : "small"] as [String: Any]
    }
  ]
  let directory = URL(fileURLWithPath: "/private/tmp/anyway-progress-metrics")
  try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
  try JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted, .sortedKeys])
    .write(to: directory.appendingPathComponent("\(dark ? "dark" : "light").json"))
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  var dark = false
  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Progress Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    application.submenu = appMenu
    menu.addItem(application)
    let reference = NSMenuItem(title: "Reference", action: nil, keyEquivalent: "")
    let choices = NSMenu(title: "Reference")
    for (title, action) in [("Light", #selector(light)), ("Dark", #selector(darkMode)), ("Restart", #selector(reset))] {
      let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
      item.target = self
      choices.addItem(item)
    }
    reference.submenu = choices
    menu.addItem(reference)
    NSApp.mainMenu = menu
    window = NSWindow(contentRect: NSRect(x: 120, y: 180, width: 632, height: 408),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Anyway Native Progress Indicators"
    window.appearance = NSAppearance(named: .aqua)
    reset()
    window.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
  }
  @objc func light() { dark = false; window.appearance = NSAppearance(named: .aqua); reset() }
  @objc func darkMode() { dark = true; window.appearance = NSAppearance(named: .darkAqua); reset() }
  @objc func reset() {
    let pane = makePane()
    window.contentView = pane
    do { try record(pane, dark: dark) }
    catch { NSLog("Unable to record progress metrics: %@", error.localizedDescription) }
  }
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
if CommandLine.arguments.contains("--validate") {
  app.setActivationPolicy(.prohibited)
  let pane = makePane()
  try record(pane, dark: false)
  print("Validated 14 native progress indicators on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate()
  app.delegate = delegate
  app.run()
}

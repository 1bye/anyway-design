import AppKit

let canvasSize = NSSize(width: 632, height: 500)
let columns: [CGFloat] = [176, 392]
let switchRows: [CGFloat] = [72, 112, 152, 192]
let segmentRows: [CGFloat] = [272, 316, 360, 404]

final class TogglePane: NSView {
  override var isFlipped: Bool { true }
  override func draw(_ dirtyRect: NSRect) { NSColor.windowBackgroundColor.setFill(); bounds.fill() }
}

func caption(_ text: String, x: CGFloat, y: CGFloat, width: CGFloat, in pane: NSView, bold: Bool = false) {
  let label = NSTextField(labelWithString: text)
  label.font = .systemFont(ofSize: 11, weight: bold ? .semibold : .regular)
  label.textColor = .secondaryLabelColor
  label.frame = NSRect(x: x, y: y, width: width, height: 16)
  pane.addSubview(label)
}

func makePane() -> NSView {
  let pane = TogglePane(frame: NSRect(origin: .zero, size: canvasSize))
  caption("TAHOE / NATIVE APPKIT", x: 24, y: 20, width: 300, in: pane, bold: true)
  for (column, title) in ["Regular", "Small"].enumerated() {
    caption(title, x: columns[column], y: 46, width: 176, in: pane)
  }
  for (row, title) in ["Switch off", "Switch on", "Disabled off", "Disabled on"].enumerated() {
    caption(title, x: 24, y: switchRows[row] + 3, width: 140, in: pane)
    for column in 0..<2 {
      let control = NSSwitch()
      control.controlSize = column == 0 ? .regular : .small
      control.state = row % 2 == 0 ? .off : .on
      control.isEnabled = row < 2
      control.identifier = NSUserInterfaceItemIdentifier("switch-\(row)-\(column)")
      control.setAccessibilityLabel("\(title): \(column == 0 ? "Regular" : "Small")")
      control.sizeToFit()
      control.setFrameOrigin(NSPoint(x: columns[column], y: switchRows[row]))
      pane.addSubview(control)
    }
  }
  for (row, title) in ["Segments", "Disabled item", "Disabled group", "Icon segments"].enumerated() {
    caption(title, x: 24, y: segmentRows[row] + 5, width: 140, in: pane)
    for column in 0..<2 {
      let control: NSSegmentedControl
      if row == 3 {
        let symbols = [("square.grid.2x2", "Icons"), ("list.bullet", "List"), ("rectangle.split.3x1", "Columns")]
        let images = symbols.map { name, label -> NSImage in
          guard let image = NSImage(systemSymbolName: name, accessibilityDescription: label) else { preconditionFailure("Missing public system symbol") }
          return image
        }
        control = NSSegmentedControl(images: images, trackingMode: .selectOne, target: nil, action: nil)
      } else {
        control = NSSegmentedControl(labels: ["Day", "Week", "Month"], trackingMode: .selectOne, target: nil, action: nil)
      }
      control.controlSize = column == 0 ? .regular : .small
      control.font = .systemFont(ofSize: column == 0 ? 13 : 11)
      control.segmentStyle = .rounded
      control.segmentDistribution = .fillEqually
      control.selectedSegment = 1
      control.isEnabled = row != 2
      if row == 1 { control.setEnabled(false, forSegment: 2) }
      control.identifier = NSUserInterfaceItemIdentifier("segments-\(row)-\(column)")
      control.setAccessibilityLabel("\(title): \(column == 0 ? "Regular" : "Small")")
      control.sizeToFit()
      control.frame = NSRect(x: columns[column], y: segmentRows[row], width: 176, height: control.frame.height)
      pane.addSubview(control)
    }
  }
  caption("NSSwitch · NSSegmentedControl · select one", x: 24, y: 466, width: 580, in: pane)
  let switches = pane.subviews.compactMap { $0 as? NSSwitch }
  let segments = pane.subviews.compactMap { $0 as? NSSegmentedControl }
  precondition(switches.count == 8 && segments.count == 8)
  precondition(switches.filter { $0.state == .on }.count == 4 && switches.filter { !$0.isEnabled }.count == 4)
  precondition(segments.allSatisfy { $0.segmentCount == 3 && $0.selectedSegment == 1 && $0.frame.height > 0 })
  precondition(segments.filter { !$0.isEnabled }.count == 2)
  return pane
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  var dark = false
  var focus = "normal"
  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Toggle Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    application.submenu = appMenu; menu.addItem(application)
    let reference = NSMenuItem(title: "Reference", action: nil, keyEquivalent: "")
    let choices = NSMenu(title: "Reference")
    for (title, action) in [("Light", #selector(light)), ("Dark", #selector(darkMode)),
      ("Normal", #selector(normal)), ("Switch focus", #selector(switchFocus)), ("Segment focus", #selector(segmentFocus))] {
      let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
      item.target = self; choices.addItem(item)
    }
    reference.submenu = choices; menu.addItem(reference); NSApp.mainMenu = menu
    window = NSWindow(contentRect: NSRect(x: 120, y: 120, width: 632, height: 500),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Anyway Native Toggles"
    reset(); window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
  }
  @objc func light() { dark = false; reset() }
  @objc func darkMode() { dark = true; reset() }
  @objc func normal() { focus = "normal"; reset() }
  @objc func switchFocus() { focus = "switch"; reset() }
  @objc func segmentFocus() { focus = "segment"; reset() }
  func reset() {
    window.appearance = NSAppearance(named: dark ? .darkAqua : .aqua)
    window.contentView = makePane(); window.makeFirstResponder(nil)
    let id = focus == "switch" ? "switch-1-0" : "segments-0-0"
    if focus != "normal", let control = window.contentView?.subviews.first(where: { $0.identifier?.rawValue == id }) {
      window.makeFirstResponder(control)
    }
    record()
  }
  func record() {
    guard let pane = window?.contentView else { return }
    let controls: [[String: Any]] = pane.subviews.compactMap { view in
      guard let control = view as? NSControl, let id = control.identifier?.rawValue else { return nil }
      var item: [String: Any] = ["id": id, "x": control.frame.minX, "y": control.frame.minY,
        "width": control.frame.width, "height": control.frame.height, "enabled": control.isEnabled]
      if let toggle = control as? NSSwitch { item["checked"] = toggle.state == .on }
      if let segment = control as? NSSegmentedControl {
        item["selected"] = segment.selectedSegment
        item["disabledSegments"] = (0..<segment.segmentCount).filter { !segment.isEnabled(forSegment: $0) }
      }
      return item
    }
    do {
      let url = URL(fileURLWithPath: "/private/tmp/anyway-toggle-controls-metrics")
      try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
      let payload: [String: Any] = ["system": ProcessInfo.processInfo.operatingSystemVersionString,
        "appearance": dark ? "dark" : "light", "focus": focus, "controls": controls]
      try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
        .write(to: url.appendingPathComponent("\(focus)-\(dark ? "dark" : "light").json"))
    } catch { NSLog("Unable to write toggle metrics: %@", error.localizedDescription) }
  }
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
if CommandLine.arguments.contains("--validate") {
  app.setActivationPolicy(.prohibited); _ = makePane()
  print("Validated eight switches and eight segmented controls on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate(); app.delegate = delegate; app.run()
}

import AppKit

let canvasSize = NSSize(width: 680, height: 568)
let rows: [CGFloat] = [80, 124, 168, 212]
let columns: [CGFloat] = [168, 410]
let referenceDate = ISO8601DateFormatter().date(from: "2026-10-20T14:35:00Z")!

final class DatePane: NSView {
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

func makePicker(style: NSDatePicker.Style, elements: NSDatePicker.ElementFlags, small: Bool = false) -> NSDatePicker {
  let picker = NSDatePicker()
  picker.datePickerStyle = style
  picker.datePickerElements = elements
  picker.datePickerMode = .single
  picker.controlSize = small ? .small : .regular
  picker.font = .systemFont(ofSize: small ? 11 : 13)
  picker.locale = Locale(identifier: "en_US")
  var calendar = Calendar(identifier: .gregorian)
  calendar.timeZone = TimeZone(secondsFromGMT: 0)!
  calendar.firstWeekday = 1
  picker.calendar = calendar
  picker.timeZone = calendar.timeZone
  picker.dateValue = referenceDate
  picker.presentsCalendarOverlay = true
  picker.sizeToFit()
  return picker
}

func makePane() -> NSView {
  let pane = DatePane(frame: NSRect(origin: .zero, size: canvasSize))
  caption("TAHOE / NATIVE APPKIT", x: 24, y: 20, width: 300, in: pane, bold: true)
  for (column, title) in ["Regular", "Small"].enumerated() {
    caption(title, x: columns[column], y: 48, width: 176, in: pane)
  }
  for (row, title) in ["Date", "Time", "Date & time", "Disabled date"].enumerated() {
    caption(title, x: 24, y: rows[row] + 4, width: 130, in: pane)
    for column in 0..<2 {
      var elements: NSDatePicker.ElementFlags = .yearMonthDay
      if row == 1 { elements = .hourMinute }
      if row == 2 { elements = [.yearMonthDay, .hourMinute] }
      let control = makePicker(style: .textFieldAndStepper, elements: elements, small: column == 1)
      control.identifier = NSUserInterfaceItemIdentifier("picker-\(row)-\(column)")
      control.setAccessibilityLabel("\(title): \(column == 0 ? "Regular" : "Small")")
      control.isEnabled = row != 3
      control.setFrameOrigin(NSPoint(x: columns[column], y: rows[row]))
      pane.addSubview(control)
    }
  }
  caption("Calendar", x: 24, y: 286, width: 130, in: pane)
  let calendar = makePicker(style: .clockAndCalendar, elements: .yearMonthDay)
  calendar.identifier = NSUserInterfaceItemIdentifier("calendar")
  calendar.setAccessibilityLabel("Calendar")
  calendar.setFrameOrigin(NSPoint(x: 168, y: 280))
  pane.addSubview(calendar)
  caption("NSDatePicker · Gregorian · en_US · UTC", x: 24, y: 534, width: 620, in: pane)
  let pickers = pane.subviews.compactMap { $0 as? NSDatePicker }
  precondition(pickers.count == 9 && pickers.filter { !$0.isEnabled }.count == 2)
  precondition(pickers.allSatisfy { $0.dateValue == referenceDate && $0.frame.width > 0 && $0.frame.height > 0 })
  return pane
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  var dark = false
  var focused = false
  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Date Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    application.submenu = appMenu; menu.addItem(application)
    let reference = NSMenuItem(title: "Reference", action: nil, keyEquivalent: "")
    let choices = NSMenu(title: "Reference")
    for (title, action) in [("Light", #selector(light)), ("Dark", #selector(darkMode)),
      ("Normal", #selector(normal)), ("Date focus", #selector(dateFocus))] {
      let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
      item.target = self; choices.addItem(item)
    }
    reference.submenu = choices; menu.addItem(reference); NSApp.mainMenu = menu
    window = NSWindow(contentRect: NSRect(x: 120, y: 120, width: canvasSize.width, height: canvasSize.height),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Anyway Native Date Pickers"
    reset(); window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
  }
  @objc func light() { dark = false; reset() }
  @objc func darkMode() { dark = true; reset() }
  @objc func normal() { focused = false; reset() }
  @objc func dateFocus() { focused = true; reset() }
  func reset() {
    window.appearance = NSAppearance(named: dark ? .darkAqua : .aqua)
    window.contentView = makePane(); window.makeFirstResponder(nil)
    if focused, let control = window.contentView?.subviews.first(where: { $0.identifier?.rawValue == "picker-0-0" }) {
      window.makeFirstResponder(control)
    }
    record()
  }
  func record() {
    guard let pane = window?.contentView else { return }
    let controls: [[String: Any]] = pane.subviews.compactMap { view in
      guard let control = view as? NSDatePicker, let id = control.identifier?.rawValue else { return nil }
      return ["id": id, "x": control.frame.minX, "y": control.frame.minY,
        "width": control.frame.width, "height": control.frame.height, "enabled": control.isEnabled,
        "date": ISO8601DateFormatter().string(from: control.dateValue)]
    }
    do {
      let url = URL(fileURLWithPath: "/private/tmp/anyway-date-picker-metrics")
      try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
      let payload: [String: Any] = ["system": ProcessInfo.processInfo.operatingSystemVersionString,
        "appearance": dark ? "dark" : "light", "focused": focused, "controls": controls]
      try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
        .write(to: url.appendingPathComponent("\(focused ? "focus" : "normal")-\(dark ? "dark" : "light").json"))
    } catch { NSLog("Unable to write date picker metrics: %@", error.localizedDescription) }
  }
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
if CommandLine.arguments.contains("--validate") {
  app.setActivationPolicy(.prohibited); _ = makePane()
  print("Validated nine date pickers on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate(); app.delegate = delegate; app.run()
}

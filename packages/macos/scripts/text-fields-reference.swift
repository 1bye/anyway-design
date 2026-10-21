import AppKit

let canvasSize = NSSize(width: 632, height: 500)
let columns: [CGFloat] = [176, 392]
let rows: [(String, CGFloat)] = [("Empty", 72), ("Filled", 112), ("Password", 152),
  ("Read-only", 192), ("Disabled", 232), ("Search empty", 296),
  ("Search filled", 336), ("Search disabled", 376), ("Search read-only", 416)]

final class FieldPane: NSView {
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
  let pane = FieldPane(frame: NSRect(origin: .zero, size: canvasSize))
  caption("TAHOE / NATIVE APPKIT", x: 24, y: 20, width: 300, in: pane, bold: true)
  for (column, title) in ["Regular", "Small"].enumerated() {
    caption(title, x: columns[column], y: 46, width: 176, in: pane)
  }
  for (row, entry) in rows.enumerated() {
    caption(entry.0, x: 24, y: entry.1 + 4, width: 144, in: pane)
    for column in 0..<2 {
      let field: NSTextField
      if row >= 5 { field = NSSearchField() }
      else if row == 2 { field = NSSecureTextField() }
      else { field = NSTextField() }
      field.identifier = NSUserInterfaceItemIdentifier("field-\(row)-\(column)")
      field.controlSize = column == 0 ? .regular : .small
      field.font = .systemFont(ofSize: column == 0 ? 13 : 11)
      field.isBezeled = true
      field.bezelStyle = .roundedBezel
      field.placeholderString = row >= 5 ? "Search" : "Project name"
      field.stringValue = [1, 2, 3, 4, 6, 7, 8].contains(row) ? (row >= 5 ? "Tahoe" : "Design system") : ""
      field.isEnabled = row != 4 && row != 7
      field.isEditable = row != 3 && row != 8
      field.isSelectable = true
      if let search = field as? NSSearchField {
        search.sendsWholeSearchString = true
        search.maximumRecents = 0
      }
      field.sizeToFit()
      field.frame = NSRect(x: columns[column], y: entry.1, width: 176, height: field.frame.height)
      field.setAccessibilityLabel("\(entry.0): \(column == 0 ? "Regular" : "Small")")
      pane.addSubview(field)
    }
  }
  caption("NSTextField · NSSecureTextField · NSSearchField", x: 24, y: 466, width: 580, in: pane)
  let fields = pane.subviews.compactMap { $0 as? NSTextField }.filter { $0.identifier != nil }
  precondition(fields.count == 18 && fields.filter { $0 is NSSearchField }.count == 8)
  precondition(fields.filter { !$0.isEnabled }.count == 4 && fields.filter { !$0.isEditable }.count == 4)
  precondition(fields.allSatisfy { $0.frame.width == 176 && $0.frame.height > 0 })
  return pane
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  var focus = "normal"
  var dark = false
  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Text Fields Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    application.submenu = appMenu; menu.addItem(application)
    let reference = NSMenuItem(title: "Reference", action: nil, keyEquivalent: "")
    let choices = NSMenu(title: "Reference")
    for (title, action) in [("Light", #selector(light)), ("Dark", #selector(darkMode)),
      ("Normal", #selector(normal)), ("Text focus", #selector(textFocus)), ("Search focus", #selector(searchFocus))] {
      let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
      item.target = self; choices.addItem(item)
    }
    reference.submenu = choices; menu.addItem(reference); NSApp.mainMenu = menu
    window = NSWindow(contentRect: NSRect(x: 120, y: 120, width: 632, height: 500),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Anyway Native Text Fields"
    reset()
    window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
    record()
  }
  @objc func light() { dark = false; reset() }
  @objc func darkMode() { dark = true; reset() }
  @objc func normal() { focus = "normal"; reset() }
  @objc func textFocus() { focus = "text"; reset() }
  @objc func searchFocus() { focus = "search"; reset() }
  func reset() {
    window.appearance = NSAppearance(named: dark ? .darkAqua : .aqua)
    window.contentView = makePane()
    window.makeFirstResponder(nil)
    let id = focus == "text" ? "field-0-0" : "field-5-0"
    if focus != "normal", let field = window.contentView?.subviews.first(where: { $0.identifier?.rawValue == id }) as? NSTextField {
      window.makeFirstResponder(field)
      field.currentEditor()?.selectedRange = NSRange(location: 0, length: 0)
    }
    record()
  }
  func record() {
    guard let pane = window?.contentView else { return }
    let fields: [[String: Any]] = pane.subviews.compactMap { view in
      guard let field = view as? NSTextField, let id = field.identifier?.rawValue else { return nil }
      var item: [String: Any] = ["id": id, "x": field.frame.minX, "y": field.frame.minY,
        "width": field.frame.width, "height": field.frame.height,
        "fontSize": field.font?.pointSize ?? 0, "enabled": field.isEnabled, "editable": field.isEditable]
      if let cell = field.cell {
        item["drawingRect"] = NSStringFromRect(cell.drawingRect(forBounds: field.bounds))
      }
      if let cell = field.cell as? NSSearchFieldCell {
        item["searchRect"] = NSStringFromRect(cell.searchButtonRect(forBounds: field.bounds))
        item["cancelRect"] = NSStringFromRect(cell.cancelButtonRect(forBounds: field.bounds))
        item["textRect"] = NSStringFromRect(cell.searchTextRect(forBounds: field.bounds))
      }
      return item
    }
    do {
      let url = URL(fileURLWithPath: "/private/tmp/anyway-text-fields-metrics")
      try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
      let payload: [String: Any] = ["system": ProcessInfo.processInfo.operatingSystemVersionString,
        "appearance": dark ? "dark" : "light", "focus": focus, "fields": fields]
      try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
        .write(to: url.appendingPathComponent("\(focus)-\(dark ? "dark" : "light").json"))
    } catch { NSLog("Unable to write text field metrics: %@", error.localizedDescription) }
  }
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
if CommandLine.arguments.contains("--validate") {
  app.setActivationPolicy(.prohibited)
  _ = makePane()
  print("Validated 18 native text/search fields on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate(); app.delegate = delegate; app.run()
}

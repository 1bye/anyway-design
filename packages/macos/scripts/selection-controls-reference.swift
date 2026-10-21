import AppKit

let canvasSize = NSSize(width: 632, height: 350)
let columns: [CGFloat] = [176, 384]
let rowTops: [CGFloat] = [72, 126, 190, 244]

final class SelectionPane: NSView {
  override var isFlipped: Bool { true }
  override func draw(_ dirtyRect: NSRect) {
    NSColor.windowBackgroundColor.setFill()
    bounds.fill()
  }
}

func caption(_ text: String, x: CGFloat, y: CGFloat, width: CGFloat, in pane: NSView, bold: Bool = false) {
  let field = NSTextField(labelWithString: text)
  field.font = .systemFont(ofSize: 11, weight: bold ? .semibold : .regular)
  field.textColor = .secondaryLabelColor
  field.frame = NSRect(x: x, y: y, width: width, height: 16)
  pane.addSubview(field)
}

func makePane() -> NSView {
  let pane = SelectionPane(frame: NSRect(origin: .zero, size: canvasSize))
  caption("TAHOE / NATIVE APPKIT", x: 24, y: 20, width: 260, in: pane, bold: true)
  for (index, title) in ["Enabled", "Disabled"].enumerated() {
    caption(title, x: columns[index], y: 46, width: 176, in: pane)
  }
  for (row, title) in ["Pop-up button", "Small pop-up", "Combo box", "Small combo box"].enumerated() {
    let small = row % 2 == 1
    caption(title, x: 24, y: rowTops[row] + 5, width: 140, in: pane)
    for column in 0..<2 {
      let frame = NSRect(x: columns[column], y: rowTops[row], width: 176, height: small ? 22 : 26)
      if row < 2 {
        let button = NSPopUpButton(frame: frame, pullsDown: false)
        button.controlSize = small ? .small : .regular
        button.font = .systemFont(ofSize: small ? 11 : 13)
        button.bezelStyle = .rounded
        button.addItems(withTitles: ["Automatic", "High Quality", "Compact", "Unavailable"])
        button.menu?.autoenablesItems = false
        button.item(at: 3)?.isEnabled = false
        button.selectItem(at: 1)
        button.isEnabled = column == 0
        button.setAccessibilityLabel("\(title): \(column == 0 ? "Enabled" : "Disabled")")
        pane.addSubview(button)
      } else {
        let combo = NSComboBox(frame: frame)
        combo.controlSize = small ? .small : .regular
        combo.font = .systemFont(ofSize: small ? 11 : 13)
        combo.addItems(withObjectValues: ["Documents", "Downloads", "Desktop", "Applications"])
        combo.stringValue = "Documents"
        combo.isEditable = true
        combo.completes = false
        combo.isEnabled = column == 0
        combo.setAccessibilityLabel("\(title): \(column == 0 ? "Enabled" : "Disabled")")
        pane.addSubview(combo)
      }
    }
  }
  caption("NSPopUpButton · NSComboBox · regular & small", x: 24, y: 316, width: 560, in: pane)
  let popups = pane.subviews.compactMap { $0 as? NSPopUpButton }
  let combos = pane.subviews.compactMap { $0 as? NSComboBox }
  precondition(popups.count == 4 && combos.count == 4, "Fixture must contain both sizes and disabled states")
  precondition(popups.allSatisfy { $0.title == "High Quality" && $0.item(at: 3)?.isEnabled == false })
  precondition(combos.allSatisfy { $0.stringValue == "Documents" && $0.numberOfItems == 4 && $0.isEditable })
  precondition(popups.filter { $0.isEnabled }.count == 2 && combos.filter { $0.isEnabled }.count == 2)
  return pane
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Selection Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    application.submenu = appMenu
    menu.addItem(application)
    let appearance = NSMenuItem(title: "Reference", action: nil, keyEquivalent: "")
    let appearanceMenu = NSMenu(title: "Reference")
    for (title, action) in [("Light", #selector(light)), ("Dark", #selector(dark)), ("Reset", #selector(reset))] {
      let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
      item.target = self
      appearanceMenu.addItem(item)
    }
    appearance.submenu = appearanceMenu
    menu.addItem(appearance)
    NSApp.mainMenu = menu
    window = NSWindow(contentRect: NSRect(origin: NSPoint(x: 120, y: 180), size: canvasSize),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Anyway Native Selection Controls"
    window.appearance = NSAppearance(named: .aqua)
    reset()
    window.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
  }
  @objc func light() { window.appearance = NSAppearance(named: .aqua); reset() }
  @objc func dark() { window.appearance = NSAppearance(named: .darkAqua); reset() }
  @objc func reset() { window.contentView = makePane(); window.makeFirstResponder(nil) }
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
if CommandLine.arguments.contains("--validate") {
  app.setActivationPolicy(.prohibited)
  _ = makePane()
  print("Validated NSPopUpButton / NSComboBox fixture on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate()
  app.delegate = delegate
  app.run()
}

import AppKit

let canvasSize = NSSize(width: 680, height: 520)
let popoverSize = NSSize(width: 240, height: 164)

final class FlippedView: NSView { override var isFlipped: Bool { true } }

func label(_ text: String, _ frame: NSRect, bold: Bool = false) -> NSTextField {
  let field = NSTextField(wrappingLabelWithString: text)
  field.font = .systemFont(ofSize: 13, weight: bold ? .bold : .regular)
  field.frame = frame
  return field
}

func makeContent(target: AnyObject?, action: Selector?) -> NSView {
  let view = FlippedView(frame: NSRect(origin: .zero, size: popoverSize))
  view.addSubview(label("View Options", NSRect(x: 16, y: 16, width: 208, height: 16), bold: true))
  view.addSubview(label("Choose how this folder is displayed.", NSRect(x: 16, y: 42, width: 208, height: 32)))
  let checkbox = NSButton(checkboxWithTitle: "Show hidden items", target: nil, action: nil)
  checkbox.font = .systemFont(ofSize: 13)
  checkbox.frame = NSRect(x: 16, y: 84, width: 208, height: 20)
  view.addSubview(checkbox)
  let done = NSButton(title: "Done", target: target, action: action)
  done.font = .systemFont(ofSize: 13)
  done.bezelStyle = .rounded
  done.borderShape = .capsule
  done.frame = NSRect(x: 144, y: 120, width: 80, height: 28)
  view.addSubview(done)
  precondition(view.subviews.count == 4 && checkbox.state == .off)
  return view
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  var anchor: NSButton!
  var popover: NSPopover?
  var dark = false
  var side = "bottom"
  var timer: Timer?

  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Popover Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
    application.submenu = appMenu
    menu.addItem(application)
    let reference = NSMenuItem(title: "Reference", action: nil, keyEquivalent: "")
    let choices = NSMenu(title: "Reference")
    for (title, action) in [("Light", #selector(light)), ("Dark", #selector(darkMode))] {
      let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
      item.target = self
      choices.addItem(item)
    }
    reference.submenu = choices
    menu.addItem(reference)
    NSApp.mainMenu = menu
    window = NSWindow(contentRect: NSRect(x: 140, y: 120, width: 680, height: 520),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Anyway Native Popovers"
    window.appearance = NSAppearance(named: .aqua)
    let pane = FlippedView(frame: NSRect(origin: .zero, size: canvasSize))
    pane.addSubview(label("TAHOE / NATIVE APPKIT", NSRect(x: 24, y: 20, width: 600, height: 20), bold: true))
    pane.addSubview(label("NSPopover · bottom, top, right, and left anchors", NSRect(x: 24, y: 52, width: 632, height: 40)))
    anchor = NSButton(title: "Options", target: self, action: #selector(showAnchor))
    anchor.bezelStyle = .rounded
    anchor.borderShape = .capsule
    anchor.font = .systemFont(ofSize: 13)
    anchor.frame = NSRect(x: 280, y: 244, width: 120, height: 32)
    pane.addSubview(anchor)
    for (index, name) in ["bottom", "top", "right", "left"].enumerated() {
      let button = NSButton(title: name.capitalized, target: self, action: #selector(showSide(_:)))
      button.identifier = NSUserInterfaceItemIdentifier(name)
      button.bezelStyle = .rounded
      button.borderShape = .capsule
      button.frame = NSRect(x: 24 + CGFloat(index) * 144, y: 440, width: 128, height: 32)
      pane.addSubview(button)
    }
    window.contentView = pane
    window.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
    timer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in self?.record() }
  }
  @objc func light() { close(); dark = false; window.appearance = NSAppearance(named: .aqua) }
  @objc func darkMode() { close(); dark = true; window.appearance = NSAppearance(named: .darkAqua) }
  @objc func close() { popover?.performClose(nil) }
  @objc func showAnchor() { show(side) }
  @objc func showSide(_ sender: NSButton) { show(sender.identifier?.rawValue ?? "bottom") }
  func show(_ next: String) {
    close()
    side = next
    let nextPopover = NSPopover()
    nextPopover.behavior = .transient
    nextPopover.appearance = NSAppearance(named: dark ? .darkAqua : .aqua)
    let controller = NSViewController()
    controller.view = makeContent(target: self, action: #selector(close))
    nextPopover.contentViewController = controller
    nextPopover.contentSize = popoverSize
    let edges: [String: NSRectEdge] = ["bottom": .maxY, "top": .minY, "right": .maxX, "left": .minX]
    nextPopover.show(relativeTo: anchor.bounds, of: anchor, preferredEdge: edges[next] ?? .maxY)
    popover = nextPopover
  }
  func record() {
    guard let host = window else { return }
    let visible = NSApp.windows.filter {
      $0.isVisible && $0 !== host && !NSStringFromClass(type(of: $0)).contains("Sharing")
    }
    guard !visible.isEmpty else { return }
    let windows: [[String: Any]] = visible.map { candidate in
      let frame = candidate.frame
      return ["class": NSStringFromClass(type(of: candidate)), "width": frame.width, "height": frame.height,
        "x": frame.minX - host.frame.minX, "top": host.frame.maxY - frame.maxY,
        "contentWidth": candidate.contentView?.bounds.width ?? 0,
        "contentHeight": candidate.contentView?.bounds.height ?? 0]
    }
    let payload: [String: Any] = ["system": ProcessInfo.processInfo.operatingSystemVersionString,
      "side": side, "dark": dark, "contentWidth": 240, "contentHeight": 164, "windows": windows]
    do {
      let directory = URL(fileURLWithPath: "/private/tmp/anyway-popover-metrics")
      try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
      try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
        .write(to: directory.appendingPathComponent("\(side)-\(dark ? "dark" : "light").json"))
    } catch { NSLog("Unable to record popover metrics: %@", error.localizedDescription) }
  }
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
if CommandLine.arguments.contains("--validate") {
  app.setActivationPolicy(.prohibited)
  let content = makeContent(target: nil, action: nil)
  precondition(content.bounds.size == popoverSize)
  print("Validated native popover content on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate()
  app.delegate = delegate
  app.run()
}

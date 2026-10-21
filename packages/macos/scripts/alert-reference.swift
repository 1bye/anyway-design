import AppKit

enum AlertPreset: String, CaseIterable {
  case information, warning, critical, save, sheet

  var title: String {
    switch self {
    case .information: return "Export complete"
    case .warning: return "Replace “Report.pdf”?"
    case .critical: return "The document couldn’t be saved."
    case .save, .sheet: return "Do you want to save the changes made to “Report.pdf”?"
    }
  }
  var detail: String {
    switch self {
    case .information: return "Your files were exported successfully."
    case .warning: return "A file with this name already exists. Replacing it will overwrite its contents."
    case .critical: return "The disk is full. Free up some space, then try again."
    case .save, .sheet: return "Your changes will be lost if you don’t save them."
    }
  }
}

func makeAlert(_ preset: AlertPreset, dark: Bool) -> NSAlert {
  let alert = NSAlert()
  alert.alertStyle = preset == .critical ? .critical : (preset == .warning ? .warning : .informational)
  alert.messageText = preset.title
  alert.informativeText = preset.detail
  alert.window.appearance = NSAppearance(named: dark ? .darkAqua : .aqua)
  alert.window.title = "Native Alert — \(preset.rawValue)"
  switch preset {
  case .information:
    alert.addButton(withTitle: "OK")
  case .warning:
    alert.addButton(withTitle: "Cancel")
    let replace = alert.addButton(withTitle: "Replace")
    replace.hasDestructiveAction = true
    replace.keyEquivalent = ""
    alert.showsSuppressionButton = true
    alert.suppressionButton?.title = "Don’t ask again"
  case .critical:
    alert.addButton(withTitle: "Try Again")
    alert.addButton(withTitle: "Cancel").keyEquivalent = "\u{1b}"
  case .save, .sheet:
    alert.addButton(withTitle: "Save")
    alert.addButton(withTitle: "Cancel").keyEquivalent = "\u{1b}"
    let discard = alert.addButton(withTitle: "Don’t Save")
    discard.hasDestructiveAction = true
    discard.keyEquivalent = "d"
    discard.keyEquivalentModifierMask = [.command]
  }
  alert.layout()
  precondition(!alert.messageText.isEmpty && alert.buttons.count >= 1)
  precondition(alert.buttons.allSatisfy { !$0.title.isEmpty && $0.frame.width > 0 })
  if preset == .warning {
    precondition(alert.buttons[0].title == "Cancel" && alert.buttons[1].hasDestructiveAction)
    precondition(alert.suppressionButton != nil)
  }
  return alert
}

func imageViews(in view: NSView) -> [NSImageView] {
  var result: [NSImageView] = []
  if let image = view as? NSImageView { result.append(image) }
  for child in view.subviews { result.append(contentsOf: imageViews(in: child)) }
  return result
}

func textFields(in view: NSView) -> [NSTextField] {
  var result: [NSTextField] = []
  if let text = view as? NSTextField { result.append(text) }
  for child in view.subviews { result.append(contentsOf: textFields(in: child)) }
  return result
}

func record(_ alert: NSAlert, preset: AlertPreset, parent: NSWindow?, directory: URL) throws {
  guard let content = alert.window.contentView else { throw CocoaError(.coderInvalidValue) }
  let images = imageViews(in: content)
  let frame = alert.window.frame
  var metadata: [String: Any] = [
    "system": ProcessInfo.processInfo.operatingSystemVersionString,
    "width": frame.width, "height": frame.height,
    "contentWidth": content.bounds.width, "contentHeight": content.bounds.height,
    "buttons": alert.buttons.map { button in
      let rect = button.convert(button.bounds, to: content)
      return ["title": button.title, "x": rect.minX, "y": rect.minY,
              "width": rect.width, "height": rect.height, "destructive": button.hasDestructiveAction,
              "fontSize": button.font?.pointSize ?? 0,
              "fontTraits": button.font?.fontDescriptor.object(forKey: .traits) ?? [:]] as [String: Any]
    },
    "images": images.map { image in
      let rect = image.convert(image.bounds, to: content)
      return ["class": NSStringFromClass(type(of: image)), "x": rect.minX,
              "y": rect.minY, "width": rect.width, "height": rect.height] as [String: Any]
    },
    "texts": textFields(in: content).map { text in
      let rect = text.convert(text.bounds, to: content)
      return ["text": text.stringValue, "x": rect.minX, "y": rect.minY,
              "width": rect.width, "height": rect.height, "fontSize": text.font?.pointSize ?? 0] as [String: Any]
    },
  ]
  if let parent = parent {
    metadata["sheetX"] = frame.minX - parent.frame.minX
    metadata["sheetTop"] = parent.frame.maxY - frame.maxY - 32
    metadata["parentWidth"] = parent.contentView?.bounds.width
    metadata["parentHeight"] = parent.contentView?.bounds.height
  }
  try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
  let dark = alert.window.effectiveAppearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
  for (index, image) in images.enumerated() {
    let size = image.bounds.size
    guard let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size.width * 4),
      pixelsHigh: Int(size.height * 4), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
      isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { continue }
    bitmap.size = size
    image.cacheDisplay(in: image.bounds, to: bitmap)
    try bitmap.representation(using: .png, properties: [:])?.write(to: directory.appendingPathComponent(
      "\(preset.rawValue)-icon-\(index)-\(dark ? "dark" : "light").png"))
  }
  try JSONSerialization.data(withJSONObject: metadata, options: [.prettyPrinted, .sortedKeys])
    .write(to: directory.appendingPathComponent("\(preset.rawValue)-\(dark ? "dark" : "light").json"), options: .atomic)
}

final class HostPane: NSView {
  override var isFlipped: Bool { true }
  override func draw(_ dirtyRect: NSRect) {
    NSColor.windowBackgroundColor.setFill()
    bounds.fill()
  }
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  var dark = false
  var alert: NSAlert?
  let metrics = URL(fileURLWithPath: "/private/tmp/anyway-alert-metrics")

  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Alert Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
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
    window = NSWindow(contentRect: NSRect(x: 140, y: 160, width: 640, height: 420),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Report.pdf"
    window.appearance = NSAppearance(named: .aqua)
    let pane = HostPane(frame: NSRect(x: 0, y: 0, width: 640, height: 420))
    let title = NSTextField(labelWithString: "Report.pdf")
    title.font = .systemFont(ofSize: 26, weight: .semibold)
    title.frame = NSRect(x: 36, y: 40, width: 568, height: 36)
    pane.addSubview(title)
    let detail = NSTextField(wrappingLabelWithString: "Quarterly report\n\nReview the latest changes before closing this document.")
    detail.font = .systemFont(ofSize: 13)
    detail.textColor = .secondaryLabelColor
    detail.frame = NSRect(x: 36, y: 100, width: 568, height: 92)
    pane.addSubview(detail)
    for (index, preset) in AlertPreset.allCases.enumerated() {
      let button = NSButton(title: preset.rawValue.capitalized, target: self, action: #selector(show(_:)))
      button.identifier = NSUserInterfaceItemIdentifier(preset.rawValue)
      button.bezelStyle = .rounded
      button.borderShape = .capsule
      button.font = .systemFont(ofSize: 13)
      button.frame = NSRect(x: 36 + CGFloat(index % 3) * 184, y: 280 + CGFloat(index / 3) * 44, width: 168, height: 32)
      pane.addSubview(button)
    }
    window.contentView = pane
    window.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
  }
  @objc func light() { dark = false; window.appearance = NSAppearance(named: .aqua) }
  @objc func darkMode() { dark = true; window.appearance = NSAppearance(named: .darkAqua) }
  @objc func show(_ sender: NSButton) {
    guard let preset = AlertPreset(rawValue: sender.identifier?.rawValue ?? "") else { return }
    let next = makeAlert(preset, dark: dark)
    alert = next
    if preset == .sheet {
      next.beginSheetModal(for: window) { [weak self] _ in self?.alert = nil }
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }
        do { try record(next, preset: preset, parent: self.window, directory: self.metrics) }
        catch { NSLog("Unable to record native alert metrics: %@", error.localizedDescription) }
      }
    } else {
      do { try record(next, preset: preset, parent: nil, directory: metrics) }
      catch { NSLog("Unable to record native alert metrics: %@", error.localizedDescription) }
      next.runModal()
      alert = nil
    }
  }
  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
if CommandLine.arguments.contains("--validate") {
  app.setActivationPolicy(.prohibited)
  for preset in AlertPreset.allCases {
    for dark in [false, true] {
      let alert = makeAlert(preset, dark: dark)
      try record(alert, preset: preset, parent: nil, directory: URL(fileURLWithPath: "/private/tmp/anyway-alert-validation"))
    }
  }
  print("Validated five NSAlert presets in light/dark on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate()
  app.delegate = delegate
  app.run()
}

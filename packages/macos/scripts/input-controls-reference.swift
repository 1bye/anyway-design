import AppKit

let canvasSize = NSSize(width: 632, height: 408)
let columns: [CGFloat] = [168, 316, 464]
let rowTops: [CGFloat] = [76, 112, 158, 208, 258, 316]

final class ControlPane: NSView {
  override var isFlipped: Bool { true }
  override func draw(_ dirtyRect: NSRect) {
    NSColor.windowBackgroundColor.setFill()
    bounds.fill()
  }
}

func label(_ text: String, x: CGFloat, y: CGFloat, width: CGFloat, in pane: NSView, bold: Bool = false) {
  let field = NSTextField(labelWithString: text)
  field.font = .systemFont(ofSize: 11, weight: bold ? .semibold : .regular)
  field.textColor = .secondaryLabelColor
  field.frame = NSRect(x: x, y: y, width: width, height: 16)
  pane.addSubview(field)
}

func makePane() -> NSView {
  let pane = ControlPane(frame: NSRect(origin: .zero, size: canvasSize))
  label("TAHOE / NATIVE APPKIT", x: 24, y: 20, width: 240, in: pane, bold: true)
  for (index, title) in ["Default", "Selected / middle", "Disabled"].enumerated() {
    label(title, x: columns[index], y: 46, width: 144, in: pane)
  }
  for (row, title) in ["Checkbox", "Mixed checkbox", "Radio button", "Slider", "Ticked slider", "Stepper"].enumerated() {
    label(title, x: 24, y: rowTops[row] + 3, width: 134, in: pane)
    for column in 0..<3 {
      let x = columns[column]
      let y = rowTops[row]
      if row < 3 {
        let button = row == 2
          ? NSButton(radioButtonWithTitle: "Option", target: nil, action: nil)
          : NSButton(checkboxWithTitle: "Option", target: nil, action: nil)
        button.controlSize = .regular
        button.font = .systemFont(ofSize: 13)
        button.allowsMixedState = row == 1
        button.state = row == 1 ? .mixed : (column == 0 ? .off : .on)
        button.isEnabled = column != 2
        button.frame = NSRect(x: x, y: y, width: 132, height: 20)
        pane.addSubview(button)
      } else if row < 5 {
        let slider = NSSlider(value: column == 0 ? 0 : 50, minValue: 0, maxValue: 100, target: nil, action: nil)
        slider.controlSize = .regular
        slider.isContinuous = true
        slider.isEnabled = column != 2
        if row == 4 {
          slider.numberOfTickMarks = 5
          slider.allowsTickMarkValuesOnly = true
          slider.doubleValue = column == 0 ? 25 : 75
        }
        slider.frame = NSRect(x: x, y: y, width: 132, height: row == 4 ? 30 : 24)
        pane.addSubview(slider)
      } else {
        let field = NSTextField(string: column == 1 ? "9" : "4")
        field.font = .systemFont(ofSize: 13)
        field.bezelStyle = .roundedBezel
        field.alignment = .right
        field.isEnabled = column != 2
        field.frame = NSRect(x: x, y: y + 2, width: 56, height: 24)
        pane.addSubview(field)
        let stepper = NSStepper()
        stepper.minValue = 0
        stepper.maxValue = 9
        stepper.increment = 1
        stepper.doubleValue = column == 1 ? 9 : 4
        stepper.valueWraps = false
        stepper.autorepeat = true
        stepper.isEnabled = column != 2
        stepper.controlSize = .regular
        stepper.frame = NSRect(x: x + 64, y: y, width: 19, height: 28)
        pane.addSubview(stepper)
      }
    }
  }
  label("NSButton · NSSlider · NSStepper", x: 24, y: 376, width: 350, in: pane)
  return pane
}

final class ReferenceDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  func applicationDidFinishLaunching(_ notification: Notification) {
    let menu = NSMenu()
    let application = NSMenuItem()
    let appMenu = NSMenu()
    appMenu.addItem(withTitle: "Quit Control Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
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
    window = NSWindow(contentRect: NSRect(origin: NSPoint(x: 160, y: 180), size: canvasSize),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.title = "Anyway Native Input Controls"
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
if CommandLine.arguments.count == 3 && CommandLine.arguments[1] == "--export" {
  app.setActivationPolicy(.prohibited)
  let output = URL(fileURLWithPath: CommandLine.arguments[2])
  try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
  for (name, appearanceName) in [("light", NSAppearance.Name.aqua), ("dark", .darkAqua)] {
    let window = NSWindow(contentRect: NSRect(origin: .zero, size: canvasSize), styleMask: [.titled], backing: .buffered, defer: false)
    window.isReleasedWhenClosed = false
    window.appearance = NSAppearance(named: appearanceName)
    let pane = makePane()
    window.contentView = pane
    guard let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 1264, pixelsHigh: 816,
      bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
      bytesPerRow: 0, bitsPerPixel: 0) else { throw CocoaError(.fileWriteUnknown) }
    bitmap.size = canvasSize
    window.appearance?.performAsCurrentDrawingAppearance { pane.cacheDisplay(in: pane.bounds, to: bitmap) }
    guard let png = bitmap.representation(using: .png, properties: [:]), png.count > 10000,
      let decoded = NSBitmapImageRep(data: png), decoded.pixelsWide == 1264, decoded.pixelsHigh == 816
    else { throw CocoaError(.fileReadCorruptFile) }
    try png.write(to: output.appendingPathComponent("tahoe-inputs-inactive-\(name).png"), options: .atomic)
    window.close()
  }
  print("Exported inactive light/dark AppKit renders on \(ProcessInfo.processInfo.operatingSystemVersionString).")
} else {
  app.setActivationPolicy(.regular)
  let delegate = ReferenceDelegate()
  app.delegate = delegate
  app.run()
}

// Local AppKit reference fixture. Build: xcrun swiftc desktop-reference.swift -o /tmp/desktop-reference
// Run via the computer-use app launcher. Reference menu restores recorded states.
// No capture or pointer automation is performed by this fixture.
import AppKit

let canvasSize = NSSize(width: 760, height: 520)
final class WallpaperView: NSView {
 override var isFlipped: Bool { true }
 override func draw(_ dirtyRect: NSRect) {
  NSColor(calibratedRed: 0.16, green: 0.32, blue: 0.48, alpha: 1).setFill(); bounds.fill()
 }
}
final class ReferenceDelegate: NSObject, NSApplicationDelegate {
 var workspace: NSWindow!
 var notes: NSWindow!
 var planning: NSWindow!
 func document(_ title: String, text: String, frame: NSRect) -> NSWindow {
  let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: frame.width, height: frame.height - 28), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
  window.isReleasedWhenClosed = false
  window.title = title
  window.appearance = NSAppearance(named: .aqua)
  window.minSize = NSSize(width: 260, height: 160)
  let scroll = NSScrollView(frame: window.contentLayoutRect)
  let field = NSTextView(frame: scroll.bounds)
  field.string = text
  field.font = .systemFont(ofSize: 14)
  field.textContainerInset = NSSize(width: 24, height: 22)
  field.isRichText = false
  field.autoresizingMask = [.width, .height]
  scroll.documentView = field
  scroll.hasVerticalScroller = true
  window.contentView = scroll
  precondition(window.styleMask.contains(.resizable))
  precondition(field.font?.pointSize == 14 && field.string == text)
  return window
 }
 func applicationDidFinishLaunching(_ notification: Notification) {
  let menu = NSMenu(); let appItem = NSMenuItem(); let appMenu = NSMenu()
  appMenu.addItem(withTitle: "Quit Desktop Reference", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"); appItem.submenu = appMenu; menu.addItem(appItem)
  let reference = NSMenuItem(title: "Reference", action: nil, keyEquivalent: ""); let choices = NSMenu(title: "Reference")
  for (title, action) in [("Show both title bars", #selector(showChrome)), ("Deactivate", #selector(deactivate)), ("Reset", #selector(reset)), ("Project notes in front", #selector(frontNotes)), ("Planning in front", #selector(frontPlanning)), ("Move notes", #selector(moveNotes)), ("Resize notes", #selector(resizeNotes))] {
   let item = NSMenuItem(title: title, action: action, keyEquivalent: ""); item.target = self; choices.addItem(item)
  }
  reference.submenu = choices; menu.addItem(reference); NSApp.mainMenu = menu
  workspace = NSWindow(contentRect: NSRect(x: 100, y: 100, width: canvasSize.width, height: canvasSize.height), styleMask: [.titled, .closable], backing: .buffered, defer: false)
  workspace.title = "Anyway Native Desktop"; workspace.isReleasedWhenClosed = false; workspace.contentView = WallpaperView(frame: NSRect(origin: .zero, size: canvasSize)); workspace.makeKeyAndOrderFront(nil)
  notes = document("Project notes", text: "Project notes\n\nA place for the next good idea.\n\nDrag this window by its title bar.\nResize from any edge or corner.\n\nClick Planning to bring it forward.", frame: NSRect(x: 0, y: 0, width: 420, height: 310))
  planning = document("Planning", text: "Planning\n\nDesign review\nThursday, October 22 · 10:00 AM\n\nPrototype the details.\nKeep the interaction simple.\nMake room for what matters.", frame: NSRect(x: 0, y: 0, width: 420, height: 310))

  reset(); NSApp.activate(ignoringOtherApps: true)
 }
 @objc func reset() {
  let screen = workspace.convertPoint(toScreen: NSPoint(x: 0, y: 0))
  notes.setFrame(NSRect(x: screen.x + 52, y: screen.y + 520 - 58 - 310, width: 420, height: 310), display: true)
  planning.setFrame(NSRect(x: screen.x + 294, y: screen.y + 520 - 172 - 280, width: 390, height: 280), display: true)
  precondition(notes.frame.size == NSSize(width: 420, height: 310))
  precondition(planning.frame.size == NSSize(width: 390, height: 280))
  notes.orderFront(nil); planning.makeKeyAndOrderFront(nil)
 }
 @objc func showChrome() {
  reset()
  let origin = workspace.convertPoint(toScreen: .zero)
  notes.setFrame(NSRect(x: origin.x + 52, y: origin.y + 520 - 190 - 310, width: 420, height: 310), display: true)
  planning.setFrame(NSRect(x: origin.x + 294, y: origin.y + 520 - 58 - 280, width: 390, height: 280), display: true)
  frontNotes()
 }
 @objc func frontNotes() { NSApp.activate(ignoringOtherApps: true); notes.makeKeyAndOrderFront(nil) }
 @objc func frontPlanning() { NSApp.activate(ignoringOtherApps: true); planning.makeKeyAndOrderFront(nil) }
 @objc func deactivate() { NSApp.deactivate() }
 @objc func moveNotes() { frontNotes(); notes.setFrameOrigin(NSPoint(x: notes.frame.origin.x + 120, y: notes.frame.origin.y - 65)) }
 @objc func resizeNotes() { frontNotes(); var frame = notes.frame; frame.size.width += 100; frame.origin.y -= 50; frame.size.height += 50; notes.setFrame(frame, display: true) }
 func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}
let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = ReferenceDelegate(); app.delegate = delegate; app.run()

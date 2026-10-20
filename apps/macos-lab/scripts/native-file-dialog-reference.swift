import AppKit
import UniformTypeIdentifiers

final class PanelReference: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var panel: NSSavePanel?
    func applicationDidFinishLaunching(_ notification: Notification) {
        window = NSWindow(contentRect: NSRect(x: 100, y: 100, width: 840, height: 560), styleMask: [.titled, .closable, .resizable], backing: .buffered, defer: false)
        window.title = "Anyway Panel Reference"
        let root = NSView(frame: window.contentView!.bounds)
        let open = NSButton(title: "Open demo panel", target: self, action: #selector(openPanel))
        open.frame = NSRect(x: 220, y: 260, width: 180, height: 36)
        let save = NSButton(title: "Save demo panel", target: self, action: #selector(savePanel))
        save.frame = NSRect(x: 440, y: 260, width: 180, height: 36)
        root.addSubview(open); root.addSubview(save)
        window.contentView = root
        window.center(); window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
    func configure(_ value: NSSavePanel) {
        panel = value
        value.directoryURL = URL(fileURLWithPath: "/private/tmp/Anyway-Panel-Files")
        value.canCreateDirectories = false
        value.allowedContentTypes = [.plainText]
        value.allowsOtherFileTypes = false
        value.isExtensionHidden = false
    }
    @objc func openPanel() {
        let value = NSOpenPanel()
        configure(value)
        value.canChooseDirectories = false
        value.canChooseFiles = true
        value.allowsMultipleSelection = false
        value.begin { _ in self.panel = nil }
    }
    @objc func savePanel() {
        let value = NSSavePanel()
        configure(value)
        value.nameFieldStringValue = "Untitled.txt"
        value.begin { _ in self.panel = nil }
    }
}
let app = NSApplication.shared
let delegate = PanelReference()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()

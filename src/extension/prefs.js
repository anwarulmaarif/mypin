const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {}

function buildPrefsWidget() {
    const settings = ExtensionUtils.getSettings();
    let widget = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 10,
        margin_top: 10,
        margin_bottom: 10,
        margin_start: 10,
        margin_end: 10,
    });

    let label = new Gtk.Label({
        label: "Batas maksimum file yang bisa dipin:",
        halign: Gtk.Align.START,
    });

    let spin = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 1,
            upper: 100,
            step_increment: 1,
        }),
        value: settings.get_int('max-pinned'),
    });

    spin.connect('value-changed', () => {
        settings.set_int('max-pinned', spin.get_value_as_int());
    });

    widget.append(label);
    widget.append(spin);

    return widget;
}

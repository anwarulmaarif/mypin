// Tambahan untuk extension.js agar mendukung validasi file, pembatasan pin, dan pengaturan
const { St, Gio, GLib, Shell } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

let settings;
let myPinButton;

function _loadPinnedFiles() {
    const pinned = settings.get_strv('pinned-files');
    const validPinned = pinned.filter(path => GLib.file_test(path, GLib.FileTest.EXISTS));
    if (validPinned.length !== pinned.length) {
        settings.set_strv('pinned-files', validPinned);
    }
    return validPinned;
}

function _addFileToPin(path) {
    let pinned = _loadPinnedFiles();
    const max = settings.get_int('max-pinned');
    if (pinned.includes(path)) return;
    if (pinned.length >= max) return; // Prevent adding over the limit

    pinned.push(path);
    settings.set_strv('pinned-files', pinned);
    _refreshUI();
}

function _refreshUI() {
    myPinButton.menu.removeAll();
    const pinned = _loadPinnedFiles();
    for (let path of pinned) {
        let file = Gio.File.new_for_path(path);
        let info = file.query_info('standard::*', Gio.FileQueryInfoFlags.NONE, null);
        let icon = new St.Icon({ gicon: info.get_icon(), style_class: 'popup-menu-icon' });
        let item = new PopupMenu.PopupBaseMenuItem();
        item.add_child(icon);
        item.add_child(new St.Label({ text: file.get_basename(), x_expand: true }));

        let unpinButton = new St.Button({ label: 'Unpin', style_class: 'button' });
        unpinButton.connect('clicked', () => {
            let updated = pinned.filter(p => p !== path);
            settings.set_strv('pinned-files', updated);
            _refreshUI();
        });
        item.add_child(unpinButton);

        item.connect('button-press-event', (actor, event) => {
            if (event.get_button() === 1) Shell.AppSystem.get_default().launch_default_for_uri(`file://${path}`, null);
            if (event.get_button() === 3) Shell.AppSystem.get_default().launch_default_for_uri(`file://${GLib.path_get_dirname(path)}`, null);
        });

        myPinButton.menu.addMenuItem(item);
    }
}

class MyPinButton extends PanelMenu.Button {
    constructor() {
        super(0.0, 'MyPin');
        this.icon = new St.Icon({ icon_name: 'emblem-favorite-symbolic', style_class: 'system-status-icon' });
        this.add_child(this.icon);
    }
}

function init() {
    settings = ExtensionUtils.getSettings();
}

function enable() {
    myPinButton = new MyPinButton();
    Main.panel.addToStatusArea('mypin', myPinButton);
    _refreshUI();
}

function disable() {
    if (myPinButton) {
        myPinButton.destroy();
        myPinButton = null;
    }
}

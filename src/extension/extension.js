// === FILE 1 === extension.js
// Entry point utama

const { Gio, GLib, St, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { loadPinnedItems, savePinnedItems, addPinnedItem, removePinnedItem } = Me.imports.utils;

let myPinIndicator;

class MyPinIndicator extends PanelMenu.Button {
    constructor() {
        super(0.0, 'MyPin');

        this._icon = new St.Icon({
            icon_name: 'emblem-important-symbolic', // ikon pin
            style_class: 'system-status-icon'
        });

        this.add_child(this._icon);
        this._buildMenu();
    }

    _buildMenu() {
        this.menu.removeAll();
        this._items = loadPinnedItems();

        this._items.forEach(item => {
            let fileIcon = new St.Icon({
                gicon: Gio.content_type_get_icon(Gio.content_type_guess(item.path, null)[0]),
                icon_size: 16
            });

            let label = new St.Label({ text: GLib.path_get_basename(item.path), x_expand: true });

            let openBtn = new PopupMenu.PopupBaseMenuItem({ reactive: true });
            openBtn.actor.add_child(fileIcon);
            openBtn.actor.add_child(label);

            let unpinBtn = new St.Button({
                style_class: 'button',
                label: '×',
                can_focus: true
            });
            openBtn.actor.add_child(unpinBtn);

            openBtn.connect('activate', () => {
                Util.spawn(['xdg-open', item.path]);
            });

            openBtn.actor.connect('button-press-event', (actor, event) => {
                if (event.get_button() === 3) {
                    Util.spawn(['xdg-open', GLib.path_get_dirname(item.path)]);
                    return Clutter.EVENT_STOP;
                }
                return Clutter.EVENT_PROPAGATE;
            });

            unpinBtn.connect('clicked', () => {
                removePinnedItem(item.path);
                this._buildMenu();
            });

            this.menu.addMenuItem(openBtn);
        });
    }

    refresh() {
        this._buildMenu();
    }

}

function enable() {
    myPinIndicator = new MyPinIndicator();
    Main.panel.addToStatusArea('mypin', myPinIndicator, 1, 'right');
}

function disable() {
    myPinIndicator.destroy();
    myPinIndicator = null;
}
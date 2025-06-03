// === FILE 4 === utils.js

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const ExtensionUtils = imports.misc.extensionUtils;

const SETTINGS_SCHEMA = 'org.gnome.shell.extensions.mypin';
const SETTINGS_KEY = 'items';

let _settings;

function getSettings() {
    if (!_settings) {
        const GioSSS = Gio.SettingsSchemaSource;
        let schemaSource = GioSSS.new_from_directory(
            ExtensionUtils.getCurrentExtension().path + '/schemas',
            GioSSS.get_default(),
            false
        );
        let schemaObj = schemaSource.lookup(SETTINGS_SCHEMA, true);
        _settings = new Gio.Settings({ settings_schema: schemaObj });
    }
    return _settings;
}

function loadPinnedItems() {
    let settings = getSettings();
    let items = settings.get_strv(SETTINGS_KEY);
    return items.map(path => ({ path }));
}

function savePinnedItems(items) {
    let settings = getSettings();
    settings.set_strv(SETTINGS_KEY, items.map(i => i.path));
}

function addPinnedItem(path) {
    let items = loadPinnedItems();
    if (!items.find(i => i.path === path)) {
        items.push({ path });
        savePinnedItems(items);
    }
}

function removePinnedItem(path) {
    let items = loadPinnedItems().filter(i => i.path !== path);
    savePinnedItems(items);
}

var loadPinnedItems = loadPinnedItems;
var savePinnedItems = savePinnedItems;
var addPinnedItem = addPinnedItem;
var removePinnedItem = removePinnedItem;
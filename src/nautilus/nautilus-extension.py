// === FILE 5 === nautilus-extension.py

from gi.repository import Nautilus, GObject, Gio
import os
import subprocess

EXTENSION_ID = 'mypin@anwa.net'
SCHEMA = 'org.gnome.shell.extensions.mypin'
KEY = 'items'

class MyPinExtension(GObject.GObject, Nautilus.MenuProvider):
    def __init__(self):
        self.settings = Gio.Settings.new_with_path(SCHEMA, f'/org/gnome/shell/extensions/mypin/')

    def _add_to_pin(self, files):
        current = self.settings.get_strv(KEY)
        paths = [file.get_location().get_path() for file in files]
        for path in paths:
            if path not in current:
                current.append(path)
        self.settings.set_strv(KEY, current)

    def get_file_items(self, window, files):
        if not files:
            return

        valid_files = [f for f in files if f.is_directory() or f.get_uri_scheme() == 'file']
        if not valid_files:
            return

        item = Nautilus.MenuItem(
            name='MyPinExtension::AddToPin',
            label='Add to MyPin',
            tip='Pin this item to GNOME Shell panel'
        )
        item.connect('activate', lambda _: self._add_to_pin(valid_files))
        return [item]
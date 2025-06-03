#!/bin/bash
set -e

APP_NAME="mypin"
EXT_ID="mypin@anwa.net"
VERSION="1.0-1"
DEB_DIR="${APP_NAME}_${VERSION}"
INSTALL_PATH_GNOME="/usr/share/gnome-shell/extensions/$EXT_ID"
INSTALL_PATH_NAUTILUS="/usr/share/nautilus-python/extensions"

echo "=== [ MyPin Builder ] ==="

REQUIRED_PKGS=(python3-nautilus gir1.2-nautilus-3.0 dconf-cli gnome-shell)

for pkg in "${REQUIRED_PKGS[@]}"; do
    if ! dpkg -s "$pkg" >/dev/null 2>&1; then
        echo "[!] $pkg not installed. Installing..."
        sudo apt install -y "$pkg"
    else
        echo "[✓] $pkg already installed."
    fi
done

rm -rf "$DEB_DIR"
mkdir -p "$DEB_DIR/DEBIAN"
mkdir -p "$DEB_DIR$INSTALL_PATH_GNOME"
mkdir -p "$DEB_DIR$INSTALL_PATH_GNOME/schemas"
mkdir -p "$DEB_DIR$INSTALL_PATH_NAUTILUS"

cp -r ./src/extension/* "$DEB_DIR$INSTALL_PATH_GNOME/"
cp -r ./src/schemas/* "$DEB_DIR$INSTALL_PATH_GNOME/schemas/"
cp ./src/nautilus/nautilus-extension.py "$DEB_DIR$INSTALL_PATH_NAUTILUS/"

cat > "$DEB_DIR/DEBIAN/control" <<EOF
Package: $APP_NAME
Version: $VERSION
Section: gnome
Priority: optional
Architecture: all
Depends: gnome-shell (>= 46), python3-nautilus, dconf-cli
Maintainer: Kamu <kamu@anwa.net>
Description: GNOME Shell extension and Nautilus integration to pin files to top panel.
 This extension allows you to pin files to the GNOME panel and manage them via right-click menu in Nautilus.
EOF

cat > "$DEB_DIR/DEBIAN/postinst" <<'EOF'
#!/bin/bash
set -e
glib-compile-schemas /usr/share/gnome-shell/extensions/mypin@anwa.net/schemas
nautilus -q
echo "[✓] MyPin installed. Restart GNOME Shell (Alt+F2, then 'r') or log out/in."
EOF

chmod +x "$DEB_DIR/DEBIAN/postinst"
dpkg-deb --build "$DEB_DIR"
echo "[✓] Done! Output: ${DEB_DIR}.deb"

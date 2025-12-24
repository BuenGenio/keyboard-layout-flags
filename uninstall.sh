#!/bin/bash

# Uninstallation script for Keyboard Layout Flags extension

EXTENSION_UUID="keyboard-layout-flags@buengenio"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

echo "Uninstalling Keyboard Layout Flags extension..."

# Disable the extension first
gnome-extensions disable "$EXTENSION_UUID" 2>/dev/null

# Remove the extension directory
if [ -d "$EXTENSION_DIR" ]; then
    rm -rf "$EXTENSION_DIR"
    echo "Extension removed from $EXTENSION_DIR"
else
    echo "Extension directory not found"
fi

echo "Uninstallation complete!"
echo ""
echo "To complete the removal, restart GNOME Shell:"
echo "- On X11: Press Alt+F2, type 'r', and press Enter"
echo "- On Wayland: Log out and log back in"



























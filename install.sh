#!/bin/bash

# Installation script for Keyboard Layout Flags extension

EXTENSION_UUID="keyboard-layout-flags@gnome-keyboard-flags"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing Keyboard Layout Flags extension..."

# Create the extensions directory if it doesn't exist
mkdir -p "$EXTENSION_DIR"

# Copy files to the extension directory
echo "Copying files to $EXTENSION_DIR..."
cp "$PROJECT_DIR/metadata.json" "$EXTENSION_DIR/"
cp "$PROJECT_DIR/extension.js" "$EXTENSION_DIR/"
cp "$PROJECT_DIR/stylesheet.css" "$EXTENSION_DIR/"

echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart GNOME Shell:"
echo "   - On X11: Press Alt+F2, type 'r', and press Enter"
echo "   - On Wayland: Log out and log back in"
echo ""
echo "2. Enable the extension:"
echo "   gnome-extensions enable $EXTENSION_UUID"
echo ""
echo "3. Test by pressing Super+Space to switch keyboard layouts"



























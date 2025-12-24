[![Buy Me a Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)]([www.buymeacoffee.com](https://buymeacoffee.com/buengenio))

# Keyboard Layout Flags

A GNOME Shell extension that adds Unicode ISO country flags to the keyboard layout switcher (OSD) when you press Super+Space.

## Features

- Displays country flags next to layout names in the keyboard switcher popup
- Supports 40+ country/region codes

## Installation

1. Copy the extension to your local extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/keyboard-layout-flags@buengenio
   cp * ~/.local/share/gnome-shell/extensions/keyboard-layout-flags@buengenio/
   ```

2. Restart GNOME Shell:
   - On X11: Press `Alt+F2`, type `r`, and press Enter
   - On Wayland: Log out and log back in

3. Enable the extension:
   ```bash
   gnome-extensions enable keyboard-layout-flags@buengenio
   ```

## Usage

Press `Super+Space` to open the keyboard layout switcher, and you'll see country flags displayed next to each layout name (e.g., 🇺🇸 English, 🇺🇦 Ukrainian, 🇪🇸 Spanish).

The flags automatically reorder to match GNOME's most recently used layout order.

# Watch logs for debugging
journalctl -f -o cat /usr/bin/gnome-shell
```

## Supported Languages/Regions

The extension currently supports 40+ country/region codes including:
- Americas: US, CA, MX, BR, AR
- Europe: GB, DE, FR, ES, IT, UA, PL, NL, SE, NO, FI, DK, CZ, AT, CH, BE, GR, HU, RO
- Asia: CN, JP, KR, IN, IL, TR
- And more!

## License

GPL-3.0 or later



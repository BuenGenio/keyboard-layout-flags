# Contributing to Keyboard Layout Flags

Thank you for considering contributing to this GNOME extension!

## How to Contribute

### Reporting Bugs

If you encounter any issues, please open an issue on GitHub with:
- Your GNOME Shell version
- Steps to reproduce the bug
- Expected vs actual behavior
- Any error messages from the logs

### Adding New Country/Region Codes

To add support for a new country or region:

1. Edit `extension.js`
2. Add the country code and its flag emoji to the `FLAG_MAP` object
3. Test the extension with that keyboard layout
4. Submit a pull request

Example:
```javascript
const FLAG_MAP = {
    // ... existing mappings ...
    'xx': '🇽🇽',  // Your country code
};
```

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/buengenio/keyboard-layout-flags.git
   cd keyboard-layout-flags
   ```

2. Create a symlink for development:
   ```bash
   ln -s $(pwd) ~/.local/share/gnome-shell/extensions/keyboard-layout-flags@buengenio
   ```

3. Enable the extension:
   ```bash
   gnome-extensions enable keyboard-layout-flags@buengenio
   ```

4. Monitor logs for debugging:
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell
   ```

### Code Style

- Use 4 spaces for indentation
- Follow existing code patterns
- Add comments for complex logic
- Test thoroughly before submitting

### Testing

Before submitting a pull request:
1. Test with multiple keyboard layouts
2. Verify the extension loads without errors
3. Check that it can be disabled and re-enabled cleanly
4. Test on GNOME 49

## Questions?

Feel free to open an issue for any questions or discussions.



























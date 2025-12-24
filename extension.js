import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as SwitcherPopup from 'resource:///org/gnome/shell/ui/switcherPopup.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Mapping of language codes to flag emoji or country codes
const FLAG_MAP = {
    'us': 'US', 'en': 'US', 'gb': 'GB', 'de': 'DE', 'fr': 'FR', 'es': 'ES',
    'it': 'IT', 'ru': 'RU', 'cn': 'CN', 'jp': 'JP', 'kr': 'KR',
    'br': 'BR', 'pt': 'PT', 'pl': 'PL', 'tr': 'TR', 'nl': 'NL',
    'se': 'SE', 'no': 'NO', 'fi': 'FI', 'dk': 'DK', 'cz': 'CZ',
    'at': 'AT', 'ch': 'CH', 'be': 'BE', 'gr': 'GR', 'hu': 'HU',
    'ro': 'RO', 'ua': 'UA', 'uk': 'UA', 'in': 'IN', 'il': 'IL', 'ar': 'AR',
    'mx': 'MX', 'ca': 'CA', 'au': 'AU', 'nz': 'NZ', 'za': 'ZA',
    'eg': 'EG', 'sa': 'SA', 'ae': 'AE', 'th': 'TH', 'vn': 'VN',
    'id': 'ID', 'ph': 'PH', 'my': 'MY', 'sg': 'SG', 'pk': 'PK',
    'bd': 'BD', 'ir': 'IR', 'iq': 'IQ', 'bg': 'BG', 'hr': 'HR',
    'rs': 'RS', 'si': 'SI', 'sk': 'SK', 'lt': 'LT', 'lv': 'LV',
    'ee': 'EE', 'is': 'IS', 'ie': 'IE', 'al': 'AL', 'mk': 'MK',
};

// Map country codes to Unicode flag emojis
const UNICODE_FLAGS = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸',
    'IT': '🇮🇹', 'RU': '🇷🇺', 'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷',
    'BR': '🇧🇷', 'PT': '🇵🇹', 'PL': '🇵🇱', 'TR': '🇹🇷', 'NL': '🇳🇱',
    'SE': '🇸🇪', 'NO': '🇳🇴', 'FI': '🇫🇮', 'DK': '🇩🇰', 'CZ': '🇨🇿',
    'AT': '🇦🇹', 'CH': '🇨🇭', 'BE': '🇧🇪', 'GR': '🇬🇷', 'HU': '🇭🇺',
    'RO': '🇷🇴', 'UA': '🇺🇦', 'IN': '🇮🇳', 'IL': '🇮🇱', 'AR': '🇦🇷',
    'MX': '🇲🇽', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'ZA': '🇿🇦',
    'EG': '🇪🇬', 'SA': '🇸🇦', 'AE': '🇦🇪', 'TH': '🇹🇭', 'VN': '🇻🇳',
    'ID': '🇮🇩', 'PH': '🇵🇭', 'MY': '🇲🇾', 'SG': '🇸🇬', 'PK': '🇵🇰',
    'BD': '🇧🇩', 'IR': '🇮🇷', 'IQ': '🇮🇶', 'BG': '🇧🇬', 'HR': '🇭🇷',
    'RS': '🇷🇸', 'SI': '🇸🇮', 'SK': '🇸🇰', 'LT': '🇱🇹', 'LV': '🇱🇻',
    'EE': '🇪🇪', 'IS': '🇮🇸', 'IE': '🇮🇪', 'AL': '🇦🇱', 'MK': '🇲🇰',
};

function getCountryCode(layoutId) {
    const code = layoutId.toLowerCase().substring(0, 2);
    return FLAG_MAP[code] || null;
}

function getFlagEmoji(countryCode) {
    return UNICODE_FLAGS[countryCode] || countryCode;
}

export default class KeyboardLayoutFlagsExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._settings = null;
        this._pollTimeout = null;
        this._lastLayoutKey = null;
        this._originalSwitcherShow = null;
    }

    enable() {
        try {
            // Get settings for layout info
            this._settings = new Gio.Settings({
                schema_id: 'org.gnome.desktop.input-sources'
            });
            
            // Hook into the SwitcherPopup to modify labels when shown
            this._hookSwitcherPopup();
            
            // Initialize last layout
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                const mruSources = this._settings.get_value('mru-sources').deep_unpack();
                if (mruSources && mruSources.length > 0) {
                    const [type, id] = mruSources[0];
                    this._lastLayoutKey = `${type}:${id}`;
                }
                return GLib.SOURCE_REMOVE;
            });
        } catch (e) {
            console.error('KeyboardLayoutFlags: Error enabling extension:', e);
        }
    }

    _hookSwitcherPopup() {
        try {
            // Hook into SwitcherPopup's show method
            this._originalSwitcherShow = SwitcherPopup.SwitcherPopup.prototype.show;
            
            const extension = this;
            SwitcherPopup.SwitcherPopup.prototype.show = function(backward, binding, mask) {
                // Call original show
                const result = extension._originalSwitcherShow.call(this, backward, binding, mask);
                
                // Add flags to the items
                extension._addFlagsToSwitcher(this);
                
                return result;
            };
        } catch (e) {
            console.error('KeyboardLayoutFlags: Error hooking switcher:', e);
        }
    }

    _addFlagsToSwitcher(switcher) {
        try {
            // Get sources arrays
            const sources = this._settings.get_value('sources').deep_unpack();
            // Use mru-sources for the correct display order (most recently used first)
            const mruSources = this._settings.get_value('mru-sources').deep_unpack();
            
            if (!switcher._items || switcher._items.length === 0) {
                return;
            }
            
            // Skip if item count doesn't match sources (it's probably window/app switcher)
            if (switcher._items.length !== sources.length) {
                return;
            }
            
            // Access the switcher list to find layout buttons
            if (switcher._switcherList) {
                const listChildren = switcher._switcherList.get_children();
                
                // Look for the ScrollView which contains the layout buttons
                listChildren.forEach((child) => {
                    if (child.constructor.name === 'St_ScrollView') {
                        // Get the child of the ScrollView (usually a BoxLayout)
                        const scrollChild = child.get_child();
                        if (scrollChild) {
                            const buttons = scrollChild.get_children();
                            
                            buttons.forEach((button, index) => {
                                // Use mru-sources to match the display order
                                if (index >= mruSources.length) return;
                                
                                const [type, id] = mruSources[index];
                                const countryCode = getCountryCode(id);
                                const flag = countryCode ? getFlagEmoji(countryCode) : null;
                                
                                if (flag) {
                                    const label = this._findLabelRecursive(button);
                                    if (label) {
                                        const currentText = label.get_text();
                                        // Remove any existing flags first
                                        const cleanText = currentText.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim();
                                        const newText = `${flag} ${cleanText}`;
                                        label.set_text(newText);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        } catch (e) {
            console.error('KeyboardLayoutFlags: Error adding flags to switcher:', e);
        }
    }

    _findLabelRecursive(actor) {
        if (!actor) return null;
        
        // Check if this actor is a label
        if (actor instanceof St.Label) {
            return actor;
        }
        
        // Check if it has children
        if (typeof actor.get_children === 'function') {
            const children = actor.get_children();
            for (const child of children) {
                const found = this._findLabelRecursive(child);
                if (found) return found;
            }
        }
        
        return null;
    }

    disable() {
        try {
            // Restore original SwitcherPopup show method
            if (this._originalSwitcherShow) {
                SwitcherPopup.SwitcherPopup.prototype.show = this._originalSwitcherShow;
                this._originalSwitcherShow = null;
            }
            
            this._settings = null;
        } catch (e) {
            console.error('KeyboardLayoutFlags: Error disabling extension:', e);
        }
    }
}

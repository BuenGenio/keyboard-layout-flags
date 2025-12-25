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
        this._originalSwitcherShow = null;
    }

    enable() {
        this._settings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.input-sources'
        });
        
        this._hookSwitcherPopup();
    }

    _hookSwitcherPopup() {
        this._originalSwitcherShow = SwitcherPopup.SwitcherPopup.prototype.show;
        
        const extension = this;
        SwitcherPopup.SwitcherPopup.prototype.show = function(backward, binding, mask) {
            const result = extension._originalSwitcherShow.call(this, backward, binding, mask);
            extension._addFlagsToSwitcher(this);
            return result;
        };
    }

    _addFlagsToSwitcher(switcher) {
        const sources = this._settings.get_value('sources').deep_unpack();
        const mruSources = this._settings.get_value('mru-sources').deep_unpack();
        
        if (!switcher._items || switcher._items.length === 0) {
            return;
        }
        
        // Skip if item count doesn't match (probably window/app switcher, not layout switcher)
        if (switcher._items.length !== sources.length) {
            return;
        }
        
        if (switcher._switcherList) {
            const listChildren = switcher._switcherList.get_children();
            
            listChildren.forEach((child) => {
                if (child.constructor.name === 'St_ScrollView') {
                    const scrollChild = child.get_child();
                    if (scrollChild) {
                        const buttons = scrollChild.get_children();
                        
                        // Use mru-sources to match the display order (most recently used first)
                        buttons.forEach((button, index) => {
                            if (index >= mruSources.length) return;
                            
                            const [type, id] = mruSources[index];
                            const countryCode = getCountryCode(id);
                            const flag = countryCode ? getFlagEmoji(countryCode) : null;
                            
                            if (flag) {
                                const label = this._findLabelRecursive(button);
                                if (label) {
                                    const currentText = label.get_text();
                                    // Strip any existing flag emojis before adding new one
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
    }

    _findLabelRecursive(actor) {
        if (!actor) return null;
        
        if (actor instanceof St.Label) {
            return actor;
        }
        
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
        if (this._originalSwitcherShow) {
            SwitcherPopup.SwitcherPopup.prototype.show = this._originalSwitcherShow;
            this._originalSwitcherShow = null;
        }
        
        this._settings = null;
    }
}

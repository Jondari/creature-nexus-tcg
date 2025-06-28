import i18nData from '../data/i18n_en.json';

type I18nKey = string;
type I18nValue = string | Record<string, any>;

class I18nManager {
  private data: Record<string, any> = i18nData;

  get(key: I18nKey, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value: any = this.data;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  private interpolate(text: string, params: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  getElementName(element: string): string {
    return this.get(`cards.elements.${element}`);
  }

  getRarityName(rarity: string): string {
    return this.get(`cards.rarity.${rarity}`);
  }
}

export const i18n = new I18nManager();

export function t(key: I18nKey, params?: Record<string, string>): string {
  return i18n.get(key, params);
}
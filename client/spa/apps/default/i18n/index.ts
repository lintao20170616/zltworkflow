import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';
import defaultJson from './locales/default.json';

let defaultMessages: Record<string, string> = {};

try {
  defaultMessages = defaultJson || {};
} catch (e) {
  defaultMessages = {};
}

const messages = {
  'zh-CN': zhCN || defaultMessages,
  'en-US': enUS || defaultMessages,
};

const LOCALE_KEY = 'zlt-locale';
const supportedLocales = ['zh-CN', 'en-US'] as const;
type LocaleType = (typeof supportedLocales)[number];

const savedLocale = (): LocaleType => {
  const v = localStorage.getItem(LOCALE_KEY);
  return v && supportedLocales.includes(v as LocaleType) ? (v as LocaleType) : 'zh-CN';
};

const i18n = createI18n({
  legacy: false,
  locale: savedLocale(),
  fallbackLocale: 'zh-CN',
  messages,
});

export function setLocale(locale: LocaleType) {
  if (!supportedLocales.includes(locale)) return;
  (i18n.global.locale as { value: LocaleType }).value = locale;
  localStorage.setItem(LOCALE_KEY, locale);
}

export { supportedLocales, type LocaleType };

const originalT = i18n.global.t;

const reverseMap: Record<string, string> = {};
Object.entries(defaultMessages).forEach(([uuid, text]) => {
  reverseMap[text] = uuid;
});

(i18n.global as any).t = function (key: string, ...args: any[]) {
  const uuid = reverseMap[key];
  if (uuid) {
    const translated = (originalT as any).call(this, uuid, ...args);
    if (translated && translated !== uuid) {
      return translated;
    }
  }
  return key;
};

export default i18n;

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
  'zh-CN': zhCN,
  'en-US': enUS,
};

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages,
});

const originalT = i18n.global.t;

const reverseMap: Record<string, string> = {};
Object.entries(defaultMessages).forEach(([uuid, text]) => {
  reverseMap[text] = uuid;
});

i18n.global.t = function (key: string, ...args: any[]) {
  const uuid = reverseMap[key];
  if (uuid) {
    const translated = originalT.call(this, uuid, ...args);
    if (translated && translated !== uuid) {
      return translated;
    }
  }
  return key;
};

export default i18n;

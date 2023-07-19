import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { mockSettings } from '../shared/mockSettings';
// eslint-disable-next-line import/no-cycle
import { settings } from '../components/shared/setDefaultSettings';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const de = require('./locales/de.json');
const en = require('./locales/en.json');
const zhcn = require('./locales/zhcn.json');
const es = require('./locales/es.json');
const si = require('./locales/si.json');
const it = require('./locales/it.json');
const tr = require('./locales/tr.json');
const ja = require('./locales/ja.json');

const resources = {
  en: { translation: en },
  de: { translation: de },
  zhcn: { translation: zhcn },
  es: { translation: es },
  si: { translation: si },
  it: { translation: it },
  tr: { translation: tr },
  ja: { translation: ja },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: process.env.NODE_ENV === 'test' ? mockSettings.language : settings.get('language'),
    fallbackLng: 'en', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;

export const Languages = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: 'Deutsch',
    value: 'de',
  },
  {
    label: '简体中文',
    value: 'zhcn',
  },
  {
    label: 'Español',
    value: 'es',
  },
  {
    label: 'Sinhala',
    value: 'si',
  },
  {
    label: 'Italiano',
    value: 'it',
  },
  {
    label: 'Türkçe',
    value: 'tr',
  },
  {
    label: '日本語',
    value: 'ja',
  },
];

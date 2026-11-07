import i18n, { type BackendModule, type ResourceKey } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

type LocaleResources = Record<string, unknown>;

const loadEnglish = async (): Promise<LocaleResources> =>
  (await import("./locales/en")).default;

const localeLoaders: Record<string, () => Promise<LocaleResources>> = {
  en: loadEnglish,
  "zh-CN": async () => (await import("./locales/zh-CN")).default,
  "zh-TW": async () => (await import("./locales/zh-TW")).default,
  ja: async () => (await import("./locales/ja")).default,
  ko: async () => (await import("./locales/ko")).default,
  es: async () => (await import("./locales/es")).default,
  fr: async () => (await import("./locales/fr")).default,
  de: async () => (await import("./locales/de")).default,
  pt: async () => (await import("./locales/pt")).default,
  hi: async () => (await import("./locales/hi")).default,
  ar: async () => (await import("./locales/ar")).default,
  vi: async () => (await import("./locales/vi")).default,
  th: async () => (await import("./locales/th")).default,
  id: async () => (await import("./locales/id")).default,
  tl: async () => (await import("./locales/tl")).default,
  ru: async () => (await import("./locales/ru")).default,
  it: async () => (await import("./locales/it")).default,
};

const localeBackend: BackendModule = {
  type: "backend",
  init() {},
  read(language, namespace, callback) {
    if (namespace !== "translation") {
      callback(null, false);
      return;
    }

    const normalized = language.replace(/_/g, "-").toLowerCase();
    const exact = Object.keys(localeLoaders).find(
      (locale) => locale.toLowerCase() === normalized,
    );
    const base = normalized.split("-")[0] ?? "en";
    const chineseLocale = /(?:tw|hk|hant)/.test(normalized) ? "zh-TW" : "zh-CN";
    const preferred =
      exact ?? (normalized.startsWith("zh") ? chineseLocale : base);
    const loadLocale = localeLoaders[preferred] ?? loadEnglish;

    void loadLocale()
      .then((resources) => callback(null, resources as ResourceKey))
      .catch((error: unknown) => {
        callback(
          error instanceof Error
            ? error
            : new Error("Could not load translations"),
          false,
        );
      });
  },
};

i18n
  .use(localeBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;

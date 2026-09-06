export const DEFAULT_LANGUAGE_PREFERENCE = "en"

export const LANGUAGE_PREFERENCE_OPTIONS = [
  "en",
  "es",
  "fr",
  "de",
  "zh",
  "ja",
  "ko",
  "ru",
  "ar",
  "pt",
  "it",
  "nl",
  "sv",
  "no",
  "da",
  "fi",
  "pl",
  "cs",
  "hu",
  "tr",
] as const

export type LanguagePreferenceOption =
  (typeof LANGUAGE_PREFERENCE_OPTIONS)[number]

export interface LanguageOption {
  label: string
  flag: string
  rtl?: boolean
}

export type LanguageDisplayOption =
  (typeof languageDisplayOptions)[LanguagePreferenceOption]

export type LanguageDisplayMap = Record<
  LanguagePreferenceOption,
  LanguageOption
>

export const languageDisplayOptions: LanguageDisplayMap = {
  en: { label: "English", flag: "🇬🇧" },
  es: { label: "Español", flag: "🇪🇸" },
  fr: { label: "Français", flag: "🇫🇷" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  zh: { label: "中文", flag: "🇨🇳" },
  ja: { label: "日本語", flag: "🇯🇵" },
  ko: { label: "한국어", flag: "🇰🇷" },
  ru: { label: "Русский", flag: "🇷🇺" },
  ar: { label: "العربية", flag: "🇸🇦", rtl: true },
  pt: { label: "Português", flag: "🇧🇷" },
  it: { label: "Italiano", flag: "🇮🇹" },
  nl: { label: "Nederlands", flag: "🇳🇱" },
  sv: { label: "Svenska", flag: "🇸🇪" },
  no: { label: "Norsk", flag: "🇳🇴" },
  da: { label: "Dansk", flag: "🇩🇰" },
  fi: { label: "Suomi", flag: "🇫🇮" },
  pl: { label: "Polski", flag: "🇵🇱" },
  cs: { label: "Čeština", flag: "🇨🇿" },
  hu: { label: "Magyar", flag: "🇭🇺" },
  tr: { label: "Türkçe", flag: "🇹🇷" },
}

/**
 * Determine if a language preference uses right-to-left text direction.
 *
 * @param language The language preference to check
 * @returns true if the language is RTL (e.g., Arabic), false otherwise
 *
 * @example
 * getIsRTL("ar") // → true
 * getIsRTL("en") // → false
 */
export function getIsRTL(language: LanguagePreferenceOption): boolean {
  return languageDisplayOptions[language]?.rtl ?? false
}

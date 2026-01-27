'use client';

import { useLanguage } from './LanguageProvider';

const languageLabels: Record<string, string> = {
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
};

export default function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage();

  if (availableLanguages.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <span className="font-medium text-slate-700">Language:</span>
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`rounded-full border px-3 py-1 transition ${
            language === lang
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
          }`}
        >
          {languageLabels[lang] ?? lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

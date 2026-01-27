'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type LanguageContextValue = {
  language: string;
  setLanguage: (language: string) => void;
  availableLanguages: string[];
  defaultLanguage: string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'menu_language';
const COOKIE_KEY = 'menu_language';

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
}

function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return null;
  const [primary] = navigator.languages?.length ? navigator.languages : [navigator.language];
  if (!primary) return null;
  return primary.split('-')[0];
}

type LanguageProviderProps = {
  defaultLanguage: string;
  availableLanguages: string[];
  children: React.ReactNode;
};

export default function LanguageProvider({
  defaultLanguage,
  availableLanguages,
  children,
}: LanguageProviderProps) {
  const normalizedLanguages = useMemo(() => {
    const set = new Set(availableLanguages.map((lang) => lang.toLowerCase()));
    set.add(defaultLanguage.toLowerCase());
    return Array.from(set);
  }, [availableLanguages, defaultLanguage]);

  const [language, setLanguageState] = useState(defaultLanguage.toLowerCase());

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const cookieLang = readCookie(COOKIE_KEY);
    const detected = detectBrowserLanguage();
    const preferred = stored || cookieLang || detected || defaultLanguage;
    const normalized = preferred.toLowerCase();

    if (normalizedLanguages.includes(normalized)) {
      setLanguageState(normalized);
    } else {
      setLanguageState(defaultLanguage.toLowerCase());
    }
  }, [defaultLanguage, normalizedLanguages]);

  const setLanguage = (nextLanguage: string) => {
    const normalized = nextLanguage.toLowerCase();
    setLanguageState(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, normalized);
    }
    writeCookie(COOKIE_KEY, normalized);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      availableLanguages: normalizedLanguages,
      defaultLanguage: defaultLanguage.toLowerCase(),
    }),
    [language, normalizedLanguages, defaultLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

"use client";

import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";
import { Globe } from "lucide-react";

const COOKIE_NAME = "googtrans";

interface LanguageDescriptor {
  name: string;
  title: string;
}

declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__?: {
      languages: LanguageDescriptor[];
      defaultLanguage: string;
    };
  }
}

export default function LanguageSwitchButton() {
  const [currentLanguage, setCurrentLanguage] = useState<string>();
  const [languageConfig, setLanguageConfig] = useState<{
    languages: LanguageDescriptor[];
    defaultLanguage: string;
  }>();

  useEffect(() => {
    const cookies = parseCookies();
    const existingCookie = cookies[COOKIE_NAME];
    let langValue;

    if (existingCookie) {
      const parts = existingCookie.split("/");
      if (parts.length > 2) {
        langValue = parts[2];
      }
    }

    const config = window.__GOOGLE_TRANSLATION_CONFIG__;
    if (config && !langValue) {
      langValue = config.defaultLanguage;
    }

    if (langValue) setCurrentLanguage(langValue);
    if (config) {
      setLanguageConfig(config);
    }
  }, []);

  if (!currentLanguage || !languageConfig) return null;

  const switchLanguage = () => {
    const langs = languageConfig.languages;
    const currentIndex = langs.findIndex((l) => l.name === currentLanguage);
    const nextIndex = (currentIndex + 1) % langs.length;
    const nextLang = langs[nextIndex].name;

    setCookie(null, COOKIE_NAME, "/auto/" + nextLang);
    window.location.reload();
  };

  return (
    <button
      onClick={switchLanguage}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label={`Switch language, current language is ${currentLanguage}`}
    >
      <Globe size={20} />
    </button>
  );
}

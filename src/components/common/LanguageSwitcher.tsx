"use client";

import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";
import { Globe } from "lucide-react";  // <-- import the global icon here

const COOKIE_NAME = "googtrans";

interface LanguageDescriptor {
  name: string;
  title: string;
}

declare global {
  namespace globalThis {
    var __GOOGLE_TRANSLATION_CONFIG__: {
      languages: LanguageDescriptor[];
      defaultLanguage: string;
    };
  }
}

export default function LanguageSwitcher() {
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

    if (global.__GOOGLE_TRANSLATION_CONFIG__ && !langValue) {
      langValue = global.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage;
    }

    if (langValue) setCurrentLanguage(langValue);
    if (global.__GOOGLE_TRANSLATION_CONFIG__) {
      setLanguageConfig(global.__GOOGLE_TRANSLATION_CONFIG__);
    }
  }, []);

  if (!currentLanguage || !languageConfig) return null;

  // Cycle to next language
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
      className="inline-flex size-14 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
      aria-label={`Switch language, current language is ${currentLanguage}`}
    >
      <Globe size={20} />
    </button>
  );
}

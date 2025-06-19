"use client";

import { useEffect, useState } from "react";
import { parseCookies} from "nookies";
import { Globe } from "lucide-react";

const COOKIE_NAME = "googtrans";

interface LanguageDescriptor {
  name: string;
  title: string;
}

// Extend Window for Google Translate support
declare global {
  interface Window {
    __GOOGLE_TRANSLATION_CONFIG__?: {
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
  const [isHovered, setIsHovered] = useState<boolean>(false);

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
    if (config) setLanguageConfig(config);
  }, []);

  if (!currentLanguage || !languageConfig) return null;

  const switchLanguage = (lang: string) => {
    const normalizedLang = lang.toLowerCase();

    if (normalizedLang === "en") {
      // Reset translation (clear cookie, iframe, and TranslateElement)
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; domain=${window.location.hostname}; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      sessionStorage.removeItem("googtrans");

      const iframe = document.querySelector("iframe.goog-te-banner-frame, iframe[id^=':']");
      if (iframe) iframe.remove();

      const el = document.getElementById("google_translate_element");
      if (el) el.innerHTML = "";
    } else {
      // Set translation cookie
      document.cookie = `googtrans=/auto/${normalizedLang}; path=/`;
    }

    window.location.reload();
  };

  return (
    <div
      className="inline-flex items-center relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="flex flex-row-reverse gap-2 mr-2">
          {languageConfig.languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => switchLanguage(lang.name)}
              className="inline-flex size-14 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
            >
              <span className="notranslate" translate="no">
                {lang.name.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        className="inline-flex size-14 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
        aria-label={`Switch language, current language is ${currentLanguage}`}
      >
        <Globe size={20} />
      </button>
    </div>
  );
}

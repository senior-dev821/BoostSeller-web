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
    if (config) {
      setLanguageConfig(config);
    }
  }, []);

  if (!currentLanguage || !languageConfig) return null;

	const switchLanguage = (lang: string) => {
		if (lang === languageConfig?.defaultLanguage) {
			// Clear cookie
			setCookie(null, COOKIE_NAME, '', { maxAge: -1, path: '/' });
	
			// Clear Translate's internal iframe state by reloading to un-translated URL
			const url = new URL(window.location.href);
			url.searchParams.delete('googtrans'); // Remove any manual lang hints
			window.location.href = url.toString(); // Force reload
		} else {
			setCookie(null, COOKIE_NAME, `/auto/${lang}`, { path: '/' });
			window.location.reload();
		}
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

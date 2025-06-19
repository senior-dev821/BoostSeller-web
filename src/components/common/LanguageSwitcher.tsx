"use client";

import { useEffect, useState } from "react";
import { parseCookies } from "nookies";
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

	const clearAllCookies = () => {
		const cookies = document.cookie.split(";");
	
		for (const cookie of cookies) {
			const eqPos = cookie.indexOf("=");
			const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
	
			// Try removing from current domain
			document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
	
			// Try removing from parent domain (if on subdomain)
			document.cookie = `${name}=; path=/; domain=.boostseller.ai; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
		}
	
		try {
			sessionStorage.clear();
			localStorage.clear();
		} catch (e) {
			console.warn("Storage cleanup failed:", e);
		}
	};
	
	const switchLanguage = (lang: string) => {
		clearAllCookies(); // First, clear everything
	
		// Then set the correct googtrans value
		if (lang !== languageConfig?.defaultLanguage) {
			document.cookie = `googtrans=/auto/${lang}; path=/; domain=.boostseller.ai;`;
		}
	
		// Clean reload
		setTimeout(() => {
			const cleanUrl = window.location.origin + window.location.pathname;
			window.location.href = cleanUrl;
		}, 150);
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

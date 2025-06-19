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

	const switchLanguage = (lang: string) => {
		const domain = ".boostseller.ai";
		const isDefault = lang === languageConfig?.defaultLanguage;
	
		if (isDefault) {
			// Remove cookie on full domain
			document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
		} else {
			// Set cookie on full domain
			document.cookie = `googtrans=/auto/${lang}; path=/; domain=${domain};`;
		}
	
		try {
			sessionStorage.removeItem("googtrans");
			localStorage.removeItem("googtrans");
		} catch {}
	
		// Remove frames
		const frame = document.querySelector("iframe.goog-te-menu-frame") as HTMLIFrameElement;
		if (frame) frame.remove();
		const skip = document.querySelector("iframe.skiptranslate") as HTMLIFrameElement;
		if (skip?.parentElement) skip.parentElement.remove();
	
		// Force reload without query string
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

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
		if (lang === languageConfig?.defaultLanguage) {
			// Remove the translation cookie
			document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
	
			// Remove possible sessionStorage/localStorage flags
			try {
				sessionStorage.removeItem('googtrans');
				localStorage.removeItem('googtrans');
			} catch (e) {
				console.log("Error On ", e);
				// storage might be restricted
			}
	
			// Reload without translate element flash
			const iframe = document.querySelector('iframe.goog-te-menu-frame') as HTMLIFrameElement;
			if (iframe) iframe.remove();
	
			const skip = document.querySelector('iframe.skiptranslate') as HTMLIFrameElement;
			if (skip?.parentElement) skip.parentElement.remove();
	
			// Delay slightly to give time to remove everything
			setTimeout(() => {
				window.location.href = window.location.origin + window.location.pathname;
			}, 100);
		} else {
			// Set translation cookie for target language
			document.cookie = `googtrans=/auto/${lang}; path=/;`;
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

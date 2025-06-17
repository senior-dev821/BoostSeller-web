// components/GoogleTranslate.tsx
'use client';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

import { useEffect } from 'react';

export default function GoogleTranslate() {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (document.getElementById('google-translate-script')) return;

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,ru',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      };
    };

    addGoogleTranslateScript();
  }, []);

  return <div id="google_translate_element" className="fixed top-2 right-2 z-50" />;
}

function TranslateInit() {
  if (!window.__GOOGLE_TRANSLATION_CONFIG__) return;

  new google.translate.TranslateElement({
    pageLanguage: window.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage,
    includedLanguages: window.__GOOGLE_TRANSLATION_CONFIG__.languages
      .map((l) => l.name)
      .join(','),
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE, // important!
    autoDisplay: false, // prevent auto-switching
    multilanguagePage: true, // support switching multiple times
  }, 'google_translate_element');
}

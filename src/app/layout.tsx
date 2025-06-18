import { Outfit } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

import { SidebarProvider } from '@/context/SidebarContext';  
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="/assets/lang-config.js" strategy="beforeInteractive" />
        <Script src="/assets/translation.js" strategy="beforeInteractive" />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=TranslateInit"
          strategy="afterInteractive"
        />

        <Script id="hide-google-toolbar" strategy="afterInteractive">
          {`
            const hideToolbar = () => {
              const interval = setInterval(() => {
                const iframe = document.querySelector('iframe.skiptranslate');
                if (iframe?.parentElement) {
                  iframe.parentElement.style.display = 'none';
                  clearInterval(interval);
                }
              }, 300);
              setTimeout(() => clearInterval(interval), 5000);
            };
            hideToolbar();
          `}
        </Script>
        <Script id="google-hide-style" strategy="afterInteractive">
          {`
            const style = document.createElement('style');
            style.innerHTML = \`
              .skiptranslate,
              #google_translate_element,
              .goog-te-banner-frame,
              .goog-te-gadget,
              .goog-logo-link,
              .goog-te-gadget-simple,
              .goog-te-menu-value,
              .goog-te-menu-frame,
              .VIpgJd-ZVi9od-xl07Ob-lTBxed {
                display: none !important;
                visibility: hidden !important;
              }
              body {
                top: 0 !important;
              }
            \`;
            document.head.appendChild(style);
          `}
        </Script>
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

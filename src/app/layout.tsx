import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// import './globals.css';
// import { Outfit } from 'next/font/google';
// import ClientLayout from '@/components/ClientLayout';

// const outfit = Outfit({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Your App',
//   description: 'Multi-language dashboard',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={`${outfit.className} dark:bg-gray-900`}>
//         <ClientLayout>{children}</ClientLayout>
//       </body>
//     </html>
//   );
// }



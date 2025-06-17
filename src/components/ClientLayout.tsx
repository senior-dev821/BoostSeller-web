'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const GoogleTranslate = dynamic(() => import('@/components/GoogleTranslate'), {
  ssr: false,
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <GoogleTranslate />
        {children}
      </SidebarProvider>
    </ThemeProvider>
  );
}

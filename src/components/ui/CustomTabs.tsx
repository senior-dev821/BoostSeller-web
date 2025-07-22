// components/ui/CustomTabs.tsx
'use client';
import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

interface CustomTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function CustomTabs({ tabs, defaultTab }: CustomTabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0].key);

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium',
                active === tab.key
                  ? 'bg-primary text-white shadow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {tabs.find((tab) => tab.key === active)?.content}
      </CardContent>
    </Card>
  );
}

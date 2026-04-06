'use client';

import { useEffect } from 'react';
import { useUIStore, type ThemeName } from '@/store/uiStore';

const THEME_VARS: Record<ThemeName, {
  accent: string;
  accent2: string;
  accentLt: string;
  accentBorder: string;
}> = {
  orange: {
    accent: '#C8622A',
    accent2: '#A34D1E',
    accentLt: '#FDF1EB',
    accentBorder: 'rgba(200,98,42,0.25)',
  },
  teal: {
    accent: '#39bca9',
    accent2: '#2a9d8e',
    accentLt: '#e6f8f6',
    accentBorder: 'rgba(57,188,169,0.25)',
  },
  purple: {
    accent: '#7c3aed',
    accent2: '#6d28d9',
    accentLt: '#f3effe',
    accentBorder: 'rgba(124,58,237,0.25)',
  },
};

export default function ThemeApplier() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const vars = THEME_VARS[theme];
    const root = document.documentElement;
    root.style.setProperty('--accent', vars.accent);
    root.style.setProperty('--accent2', vars.accent2);
    root.style.setProperty('--accent-lt', vars.accentLt);
    root.style.setProperty('--accent-border', vars.accentBorder);
  }, [theme]);

  return null;
}

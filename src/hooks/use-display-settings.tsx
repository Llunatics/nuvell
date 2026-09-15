'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
export type DensityMode = 'comfortable' | 'compact';
export type ViewMode = 'grid' | 'list';
export type MotionMode = 'full' | 'reduced';

interface DisplaySettingsContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  motion: MotionMode;
  setMotion: (motion: MotionMode) => void;
  resolvedDark: boolean;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

export function DisplaySettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [density, setDensityState] = useState<DensityMode>('comfortable');
  const [viewMode, setViewModeState] = useState<ViewMode>('grid');
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(false);
  const [motion, setMotionState] = useState<MotionMode>('full');
  const [isClient, setIsClient] = useState(false);
  const [resolvedDark, setResolvedDark] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const getSetting = (key: string) =>
        localStorage.getItem(`nuvell_${key}`) || localStorage.getItem(`nuvelll_${key}`);

      const savedTheme = getSetting('theme') as ThemeMode | null;
      if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }

      const savedDensity = getSetting('density') as DensityMode | null;
      if (savedDensity && ['comfortable', 'compact'].includes(savedDensity)) {
        setDensityState(savedDensity);
      }

      const savedView = getSetting('view_mode') as ViewMode | null;
      if (savedView && ['grid', 'list'].includes(savedView)) {
        setViewModeState(savedView);
      }

      const savedSidebar = getSetting('sidebar_collapsed');
      if (savedSidebar !== null) {
        setSidebarCollapsedState(savedSidebar === 'true');
      }

      const savedMotion = getSetting('motion') as MotionMode | null;
      if (savedMotion && ['full', 'reduced'].includes(savedMotion)) {
        setMotionState(savedMotion);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Update HTML classes & attributes based on settings
  useEffect(() => {
    if (!isClient) return;

    const root = document.documentElement;

    // Apply theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const isDark = theme === 'system' ? mediaQuery.matches : theme === 'dark';
      setResolvedDark(isDark);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    // Apply density
    root.setAttribute('data-density', density);

    // Apply motion
    root.setAttribute('data-motion', motion);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [theme, density, motion, isClient]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('nuvell_theme', newTheme);
    } catch {}
  }, []);

  const setDensity = useCallback((newDensity: DensityMode) => {
    setDensityState(newDensity);
    try {
      localStorage.setItem('nuvell_density', newDensity);
    } catch {}
  }, []);

  const setViewMode = useCallback((newView: ViewMode) => {
    setViewModeState(newView);
    try {
      localStorage.setItem('nuvell_view_mode', newView);
    } catch {}
  }, []);

  const setSidebarCollapsed = useCallback((action: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsedState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('nuvell_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, [setSidebarCollapsed]);

  const setMotion = useCallback((newMotion: MotionMode) => {
    setMotionState(newMotion);
    try {
      localStorage.setItem('nuvell_motion', newMotion);
    } catch {}
  }, []);

  return (
    <DisplaySettingsContext.Provider
      value={{
        theme,
        setTheme,
        density,
        setDensity,
        viewMode,
        setViewMode,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        motion,
        setMotion,
        resolvedDark,
      }}
    >
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      theme: 'dark' as ThemeMode,
      setTheme: () => {},
      density: 'comfortable' as DensityMode,
      setDensity: () => {},
      viewMode: 'grid' as ViewMode,
      setViewMode: () => {},
      sidebarCollapsed: false,
      setSidebarCollapsed: () => {},
      toggleSidebar: () => {},
      motion: 'full' as MotionMode,
      setMotion: () => {},
      resolvedDark: true,
    };
  }
  return context;
}
